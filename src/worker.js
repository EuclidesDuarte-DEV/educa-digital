/**
 * API do Educa+ Digital em Cloudflare Workers.
 *
 * Esta é uma demonstração educativa. O código de acesso aparece na tela;
 * portanto, não deve ser usado como autenticação de uma aplicação real.
 *
 * A interface estática é a mesma servida pelo app.py (pasta public).
 */
import { MODULOS } from './catalogo.js';

const CODIGOS_ATIVIDADES = new Set(
  MODULOS.flatMap(modulo =>
    modulo.capitulos.flatMap(capitulo =>
      capitulo.atividades.map(atividade => atividade.codigo)
    )
  )
);

const HEADERS_JSON = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff'
};

function responder(dados, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: HEADERS_JSON
  });
}

function erro(status, mensagem) {
  return responder({ ok: false, message: mensagem }, status);
}

function somenteNumeros(valor) {
  return String(valor ?? '').replace(/\D/g, '');
}

function telefoneValido(numero) {
  return numero.length === 10 || numero.length === 11;
}

function limparNome(valor) {
  return String(valor ?? '').trim().replace(/\s+/g, ' ').slice(0, 80);
}

function consulta(env, sql, ...parametros) {
  return env.DB.prepare(sql).bind(...parametros);
}

async function lerDados(request) {
  const limite = 8192;
  const tamanho = Number(request.headers.get('content-length') || 0);
  if (tamanho > limite) {
    throw new Error('dados grandes');
  }

  const texto = await request.text();
  if (texto.length > limite) {
    throw new Error('dados grandes');
  }

  return JSON.parse(texto || '{}');
}

async function buscarUsuario(env, telefone) {
  return consulta(
    env,
    'SELECT id, nome, numero FROM usuarios WHERE numero = ?',
    telefone
  ).first();
}

async function cadastrarConta(request, env) {
  const dados = await lerDados(request);
  const nome = limparNome(dados.name);
  const telefone = somenteNumeros(dados.phone);

  if (nome.length < 2) {
    return erro(400, 'Digite seu nome.');
  }
  if (!telefoneValido(telefone)) {
    return erro(400, 'Digite um número de celular válido com DDD.');
  }

  const existente = await buscarUsuario(env, telefone);
  if (existente) {
    await consulta(
      env,
      'UPDATE usuarios SET ultimo_login=CURRENT_TIMESTAMP, atualizado_em=CURRENT_TIMESTAMP WHERE id=?',
      existente.id
    ).run();

    return responder({
      ok: true,
      existing: true,
      name: existente.nome,
      phone: telefone,
      message: `Bem-vindo de volta, ${existente.nome.split(' ')[0]}! Seu progresso continua salvo.`
    });
  }

  await consulta(
    env,
    'INSERT INTO usuarios (nome, numero, ultimo_login) VALUES (?, ?, CURRENT_TIMESTAMP)',
    nome,
    telefone
  ).run();

  const usuario = await buscarUsuario(env, telefone);
  await consulta(
    env,
    'INSERT OR IGNORE INTO perfil_acessibilidade (usuario_id) VALUES (?)',
    usuario.id
  ).run();

  return responder({
    ok: true,
    existing: false,
    name: nome,
    phone: telefone,
    message: `Pronto, ${nome.split(' ')[0]}! Seus treinos foram liberados e seu progresso poderá ser salvo.`
  }, 201);
}

async function criarCodigo(request, env) {
  const dados = await lerDados(request);
  const telefone = somenteNumeros(dados.phone);

  if (!telefoneValido(telefone)) {
    return erro(400, 'Digite seu celular com DDD.');
  }

  const usuario = await buscarUsuario(env, telefone);
  if (!usuario) {
    return erro(404, 'Não encontramos progresso salvo com esse celular.');
  }

  const codigo = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');
  const vencimento = Math.floor(Date.now() / 1000) + 600;

  await consulta(
    env,
    `INSERT INTO codigos_acesso (usuario_id, pin, expira_em)
     VALUES (?, ?, ?)
     ON CONFLICT(usuario_id) DO UPDATE SET
       pin = excluded.pin,
       expira_em = excluded.expira_em,
       criado_em = CURRENT_TIMESTAMP`,
    usuario.id,
    codigo,
    vencimento
  ).run();

  return responder({
    ok: true,
    demo_code: codigo,
    message: 'Código gerado para esta demonstração. Não é enviado por SMS.'
  });
}

async function confirmarCodigo(request, env) {
  const dados = await lerDados(request);
  const telefone = somenteNumeros(dados.phone);
  const codigo = somenteNumeros(dados.code);

  if (codigo.length !== 6) {
    return erro(400, 'Digite os 6 números do código.');
  }

  const usuario = await buscarUsuario(env, telefone);
  if (!usuario) {
    return erro(400, 'Esse código não confere. Tente novamente.');
  }

  const registro = await consulta(
    env,
    'SELECT pin, expira_em FROM codigos_acesso WHERE usuario_id = ?',
    usuario.id
  ).first();

  if (!registro || registro.pin !== codigo) {
    return erro(400, 'Esse código não confere. Tente novamente.');
  }

  if (Number(registro.expira_em) < Math.floor(Date.now() / 1000)) {
    await consulta(
      env,
      'DELETE FROM codigos_acesso WHERE usuario_id = ?',
      usuario.id
    ).run();
    return erro(400, 'Esse código expirou. Gere um novo.');
  }

  await consulta(env, 'DELETE FROM codigos_acesso WHERE usuario_id = ?', usuario.id).run();
  await consulta(
    env,
    'UPDATE usuarios SET ultimo_login=CURRENT_TIMESTAMP, atualizado_em=CURRENT_TIMESTAMP WHERE id=?',
    usuario.id
  ).run();

  return responder({
    ok: true,
    name: usuario.nome,
    phone: telefone,
    message: 'Tudo certo. Seu progresso foi encontrado.'
  });
}

async function consultarProgresso(url, env) {
  const telefone = somenteNumeros(url.searchParams.get('phone'));
  if (!telefoneValido(telefone)) {
    return erro(400, 'Celular inválido.');
  }

  const usuario = await buscarUsuario(env, telefone);
  if (!usuario) {
    return erro(404, 'Usuário não encontrado.');
  }

  const registros = await consulta(
    env,
    `SELECT atividade_codigo, tentativas, concluido, data_conclusao, atualizado_em
       FROM progresso
      WHERE usuario_id = ?
      ORDER BY atualizado_em DESC`,
    usuario.id
  ).all();

  return responder({ ok: true, atividades: registros.results || [] });
}

async function salvarProgresso(request, env) {
  const dados = await lerDados(request);
  const telefone = somenteNumeros(dados.phone);
  const codigoAtividade = String(dados.activity_code || '').trim();
  const evento = String(dados.event || 'complete').toLowerCase();

  if (!telefoneValido(telefone) || !codigoAtividade) {
    return erro(400, 'Dados de progresso incompletos.');
  }
  if (!['attempt', 'complete'].includes(evento)) {
    return erro(400, 'Evento de progresso inválido.');
  }
  if (!CODIGOS_ATIVIDADES.has(codigoAtividade)) {
    return erro(404, 'Atividade não encontrada.');
  }

  const usuario = await buscarUsuario(env, telefone);
  if (!usuario) {
    return erro(404, 'Usuário não encontrado.');
  }

  // O gatilho SQL preenche atividade_id sem alterar o contrato da API V102.
  await consulta(
    env,
    `INSERT INTO progresso (usuario_id, atividade_codigo)
     VALUES (?, ?)
     ON CONFLICT(usuario_id, atividade_codigo) DO NOTHING`,
    usuario.id,
    codigoAtividade
  ).run();

  if (evento === 'attempt') {
    await consulta(
      env,
      `UPDATE progresso
          SET tentativas = tentativas + 1, atualizado_em = CURRENT_TIMESTAMP
        WHERE usuario_id = ? AND atividade_codigo = ?`,
      usuario.id,
      codigoAtividade
    ).run();
  } else {
    await consulta(
      env,
      `UPDATE progresso
          SET concluido = 1,
              data_conclusao = COALESCE(data_conclusao, CURRENT_TIMESTAMP),
              atualizado_em = CURRENT_TIMESTAMP
        WHERE usuario_id = ? AND atividade_codigo = ?`,
      usuario.id,
      codigoAtividade
    ).run();
  }

  const registro = await consulta(
    env,
    `SELECT tentativas, concluido, data_conclusao, atualizado_em
       FROM progresso
      WHERE usuario_id = ? AND atividade_codigo = ?`,
    usuario.id,
    codigoAtividade
  ).first();

  return responder({ ok: true, activity_code: codigoAtividade, ...registro });
}

async function lerAcessibilidade(url, env) {
  const telefone = somenteNumeros(url.searchParams.get('phone'));
  const usuario = await buscarUsuario(env, telefone);
  if (!usuario) {
    return erro(404, 'Usuário não encontrado.');
  }

  let perfil = await consulta(
    env,
    `SELECT tamanho_fonte, alto_contraste, narracao_automatica
       FROM perfil_acessibilidade WHERE usuario_id = ?`,
    usuario.id
  ).first();

  if (!perfil) {
    await consulta(
      env,
      'INSERT OR IGNORE INTO perfil_acessibilidade (usuario_id) VALUES (?)',
      usuario.id
    ).run();
    perfil = await consulta(
      env,
      `SELECT tamanho_fonte, alto_contraste, narracao_automatica
         FROM perfil_acessibilidade WHERE usuario_id = ?`,
      usuario.id
    ).first();
  }

  return responder({ ok: true, perfil });
}

async function salvarAcessibilidade(request, env) {
  const dados = await lerDados(request);
  const telefone = somenteNumeros(dados.phone);
  const usuario = await buscarUsuario(env, telefone);

  if (!usuario) {
    return erro(404, 'Usuário não encontrado.');
  }

  const fontes = ['normal', 'grande', 'extra_grande'];
  const tamanhoFonte = fontes.includes(String(dados.tamanho_fonte))
    ? dados.tamanho_fonte
    : 'grande';
  const altoContraste = dados.alto_contraste ? 1 : 0;
  const narracaoAutomatica = dados.narracao_automatica ? 1 : 0;

  await consulta(
    env,
    `INSERT INTO perfil_acessibilidade
       (usuario_id, tamanho_fonte, alto_contraste, narracao_automatica)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(usuario_id) DO UPDATE SET
       tamanho_fonte = excluded.tamanho_fonte,
       alto_contraste = excluded.alto_contraste,
       narracao_automatica = excluded.narracao_automatica,
       atualizado_em = CURRENT_TIMESTAMP`,
    usuario.id,
    tamanhoFonte,
    altoContraste,
    narracaoAutomatica
  ).run();

  return responder({ ok: true });
}

async function rotearApi(request, env, url) {
  const rota = url.pathname;
  const metodo = request.method.toUpperCase();

  if (metodo === 'GET' && rota === '/api/saude') {
    return responder({ ok: true, servico: 'Educa+ Digital Cloudflare' });
  }
  if (metodo === 'GET' && rota === '/api/estrutura') {
    return responder({ ok: true, modulos: MODULOS });
  }
  if (metodo === 'POST' && rota === '/api/conta') {
    return cadastrarConta(request, env);
  }
  if (metodo === 'POST' && rota === '/api/login/codigo') {
    return criarCodigo(request, env);
  }
  if (metodo === 'POST' && rota === '/api/login/confirmar') {
    return confirmarCodigo(request, env);
  }
  if (metodo === 'GET' && rota === '/api/progresso') {
    return consultarProgresso(url, env);
  }
  if (metodo === 'POST' && rota === '/api/progresso') {
    return salvarProgresso(request, env);
  }
  if (metodo === 'GET' && rota === '/api/perfil-acessibilidade') {
    return lerAcessibilidade(url, env);
  }
  if (metodo === 'PATCH' && rota === '/api/perfil-acessibilidade') {
    return salvarAcessibilidade(request, env);
  }

  return erro(404, 'Recurso não encontrado.');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/treino') {
      return Response.redirect(new URL('/', url), 302);
    }
    // A página fica em public/html; a URL para o visitante continua sendo /.
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const paginaInicial = new URL('/html/', url);
      return env.ASSETS.fetch(new Request(paginaInicial, request));
    }
    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    const rotaPublica = ['/api/saude', '/api/estrutura'].includes(url.pathname);
    if (!env.DB && !rotaPublica) {
      return erro(503, 'Banco D1 não configurado. Consulte as instruções de publicação.');
    }

    try {
      return await rotearApi(request, env, url);
    } catch (falha) {
      console.error('Educa API:', falha?.message || 'erro desconhecido');
      if (falha instanceof SyntaxError) {
        return erro(400, 'JSON inválido.');
      }
      if (falha?.message?.includes('dados grandes')) {
        return erro(413, 'Dados enviados excedem o limite.');
      }
      return erro(500, 'Falha temporária ao acessar o banco de dados.');
    }
  }
};
