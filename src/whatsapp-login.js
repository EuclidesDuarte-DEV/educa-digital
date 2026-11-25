const EXPIRACAO = 300;
const INTERVALO_ENVIO = 60;
const MAX_TENTATIVAS = 5;
const encoder = new TextEncoder();
const inicializacoes = new WeakMap();

const consulta = (env, comando, ...valores) => env.DB.prepare(comando).bind(...valores);
const agora = () => Math.floor(Date.now() / 1000);

export function loginWhatsApp(env) {
  return env.EDUCA_AUTH_MODE === 'whatsapp';
}

export function telefoneWhatsApp(valor) {
  if (typeof valor !== 'string' || !/^\+?[\d(). -]+$/.test(valor)) return '';
  let numero = valor.replace(/\D/g, '');
  if (valor.startsWith('+') || numero.length > 11) {
    if (!/^55\d{10,11}$/.test(numero)) return '';
    numero = numero.slice(2);
  }
  return /^[1-9]\d(?:[2-5]\d{7}|9\d{8})$/.test(numero) ? numero : '';
}

function configuracao(env) {
  const token = env.WHATSAPP_ACCESS_TOKEN?.trim();
  const telefoneId = env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const modelo = (env.WHATSAPP_AUTH_TEMPLATE || 'educa_login_codigo').trim();
  const versao = (env.WHATSAPP_GRAPH_API_VERSION || 'v27.0').trim();
  const chave = env.WHATSAPP_OTP_SECRET?.trim();
  if (!token || !/^\d+$/.test(telefoneId || '') || !/^[a-z0-9_]+$/.test(modelo)
      || !/^v\d+\.\d+$/.test(versao) || !chave || chave.length < 32) return null;
  return { token, telefoneId, modelo, versao, chave };
}

function prepararBanco(env) {
  if (!inicializacoes.has(env.DB)) {
    const tarefa = env.DB.batch([
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS whatsapp_login_codigos (
        destinatario TEXT PRIMARY KEY, codigo_hash TEXT NOT NULL, nome TEXT NOT NULL,
        expira_em INTEGER NOT NULL, disponivel_em INTEGER NOT NULL,
        janela_envio_ate INTEGER NOT NULL, envios INTEGER NOT NULL DEFAULT 1,
        tentativas INTEGER NOT NULL DEFAULT 0, enviado INTEGER NOT NULL DEFAULT 0,
        usado INTEGER NOT NULL DEFAULT 0
      )`),
      env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_whatsapp_login_janela ON whatsapp_login_codigos(janela_envio_ate)'),
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS whatsapp_login_limites (
        chave TEXT PRIMARY KEY, expira_em INTEGER NOT NULL, total INTEGER NOT NULL
      )`),
      env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_whatsapp_login_limites_expira ON whatsapp_login_limites(expira_em)')
    ]).catch(falha => {
      inicializacoes.delete(env.DB);
      throw falha;
    });
    inicializacoes.set(env.DB, tarefa);
  }
  return inicializacoes.get(env.DB);
}

async function assinar(chave, texto) {
  const segredo = await crypto.subtle.importKey('raw', encoder.encode(chave),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const assinatura = await crypto.subtle.sign('HMAC', segredo, encoder.encode(texto));
  return Array.from(new Uint8Array(assinatura), byte => byte.toString(16).padStart(2, '0')).join('');
}

async function limitar(env, chave, tempo, limite, duracao) {
  return consulta(env, `INSERT INTO whatsapp_login_limites (chave, expira_em, total) VALUES (?, ?, 1)
    ON CONFLICT(chave) DO UPDATE SET
      expira_em = CASE WHEN expira_em <= ? THEN excluded.expira_em ELSE expira_em END,
      total = CASE WHEN expira_em <= ? THEN 1 ELSE total + 1 END
    WHERE expira_em <= ? OR total < ?
    RETURNING total`, chave, tempo + duracao, tempo, tempo, tempo, limite).first();
}

function gerarCodigo() {
  const valor = new Uint32Array(1);
  do { crypto.getRandomValues(valor); } while (valor[0] >= 4294000000);
  return String(valor[0] % 1000000).padStart(6, '0');
}

async function enviarCodigo(config, telefone, codigo) {
  const parametro = [{ type: 'text', text: codigo }];
  try {
    const resposta = await fetch(`https://graph.facebook.com/${config.versao}/${config.telefoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: `55${telefone}`,
        type: 'template',
        template: {
          name: config.modelo,
          language: { code: 'pt_BR' },
          components: [
            { type: 'body', parameters: parametro },
            { type: 'button', sub_type: 'url', index: '0', parameters: parametro }
          ]
        }
      }),
      redirect: 'error',
      signal: AbortSignal.timeout(8000)
    });
    const retorno = await resposta.json();
    if (resposta.ok && retorno?.messages?.[0]?.id && retorno.messages[0].message_status !== 'held_for_quality_assessment') {
      return true;
    }
    const codigoMeta = retorno?.error?.code;
    console.warn('WhatsApp Cloud API: envio indisponível', resposta.status, Number.isInteger(codigoMeta) ? codigoMeta : '');
  } catch (_) {
    console.warn('WhatsApp Cloud API: não foi possível confirmar o envio');
  }
  return false;
}

export async function solicitarCodigoWhatsApp(request, env, telefone, nome) {
  const config = configuracao(env);
  if (!config) return { status: 503, message: 'O envio de códigos pelo WhatsApp está indisponível. Tente mais tarde.' };
  await prepararBanco(env);
  const tempo = agora();
  const ip = request.headers.get('cf-connecting-ip') || 'indisponível';
  const [destinatario, chaveIp] = await Promise.all([
    assinar(config.chave, `telefone:${telefone}`),
    assinar(config.chave, `ip:${ip}`)
  ]);
  if (!await limitar(env, chaveIp, tempo, 20, 3600)) {
    return { status: 429, message: 'Muitos pedidos de código. Aguarde e tente mais tarde.' };
  }

  const codigo = gerarCodigo();
  const expira = tempo + EXPIRACAO;
  const codigoHash = await assinar(config.chave, `codigo:${destinatario}:${codigo}`);
  const pedido = await consulta(env, `INSERT INTO whatsapp_login_codigos
    (destinatario, codigo_hash, nome, expira_em, disponivel_em, janela_envio_ate) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(destinatario) DO UPDATE SET codigo_hash = excluded.codigo_hash, nome = excluded.nome,
      expira_em = excluded.expira_em, disponivel_em = excluded.disponivel_em,
      janela_envio_ate = CASE WHEN janela_envio_ate <= ? THEN excluded.janela_envio_ate ELSE janela_envio_ate END,
      envios = CASE WHEN janela_envio_ate <= ? THEN 1 ELSE envios + 1 END,
      tentativas = 0, enviado = 0, usado = 0
    WHERE disponivel_em <= ? AND (janela_envio_ate <= ? OR envios < 5)
    RETURNING destinatario`, destinatario, codigoHash, nome, expira, tempo + INTERVALO_ENVIO,
  tempo + 3600, tempo, tempo, tempo, tempo).first();
  if (!pedido) return { status: 429, message: 'Aguarde 1 minuto entre pedidos. Após 5 envios, aguarde 1 hora.' };

  // Remoção limitada para evitar acumular números não verificados e endereços de rede.
  await env.DB.batch([
    consulta(env, `DELETE FROM whatsapp_login_codigos WHERE destinatario IN
      (SELECT destinatario FROM whatsapp_login_codigos WHERE janela_envio_ate <= ? AND expira_em <= ? LIMIT 50)`, tempo, tempo),
    consulta(env, `DELETE FROM whatsapp_login_limites WHERE chave IN
      (SELECT chave FROM whatsapp_login_limites WHERE expira_em <= ? LIMIT 50)`, tempo)
  ]);
  if (!await enviarCodigo(config, telefone, codigo)) {
    return { status: 502, message: 'Não foi possível enviar o código pelo WhatsApp. Aguarde 1 minuto e tente de novo.' };
  }
  await consulta(env, `UPDATE whatsapp_login_codigos SET enviado = 1
    WHERE destinatario = ? AND codigo_hash = ? AND expira_em = ?`, destinatario, codigoHash, expira).run();
  return { status: 200, message: 'O código foi solicitado. Confira a mensagem do Educa+ Digital no seu WhatsApp.' };
}

export async function usarCodigoWhatsApp(env, telefone, codigo) {
  const config = configuracao(env);
  if (!config) return { status: 503, message: 'A verificação pelo WhatsApp está indisponível. Tente mais tarde.' };
  await prepararBanco(env);
  const destinatario = await assinar(config.chave, `telefone:${telefone}`);
  const codigoHash = await assinar(config.chave, `codigo:${destinatario}:${codigo}`);
  const registro = await consulta(env, `UPDATE whatsapp_login_codigos
    SET tentativas = tentativas + 1, usado = CASE WHEN codigo_hash = ? THEN 1 ELSE 0 END
    WHERE destinatario = ? AND expira_em > ? AND enviado = 1 AND usado = 0 AND tentativas < ?
    RETURNING usado, nome`, codigoHash, destinatario, agora(), MAX_TENTATIVAS).first();
  if (registro?.usado !== 1) {
    return { status: 400, message: 'Código inválido, expirado ou com tentativas esgotadas. Confira o código ou solicite outro.' };
  }
  return { status: 200, nome: registro.nome };
}
