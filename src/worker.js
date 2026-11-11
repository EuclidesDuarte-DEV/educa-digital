/**
 * API do Educa+ Digital em Cloudflare Workers.
 *
 * Esta é uma demonstração educativa. O código de acesso aparece na tela;
 * portanto, não deve ser usado como autenticação de uma aplicação real.
 *
 * A interface estática é a mesma servida pelo app.py (pasta public).
 */
import { MODULOS } from './catalogo.js';
import { responderModoLivre } from './free-chat.js';

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
  const nome = limparNome(dados.name) || 'Participante';
  const telefone = somenteNumeros(dados.phone);

  if (nome.length < 2) {
    return erro(400, 'Digite seu nome.');
  }
  if (!telefoneValido(telefone)) {
    return erro(400, 'Digite um número de celular válido com DDD.');
  }

  const existente = await buscarUsuario(env, telefone);
  if (existente) {
    // Não autorizar a entrada só porque alguém conhece o número.
    // Protótipo: login com código demonstrativo exibido na tela (não é SMS real).
    return responder({ ok: false, existing: true, needs_login: true,
      message: 'Este celular já tem um treino salvo. Continue pela confirmação demonstrativa.' }, 409);
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
    message: 'Tudo pronto! Seu treino foi criado e o progresso poderá ser salvo.' 
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

// V110.7 — Acesso PRIVADO ao motor próprio Kokoro/MuseTalk.
// O navegador só fala com o Worker. O secret do servidor NÃO é enviado ao cliente.
const liaRequestHits=new Map();
const liaStatusHits=new Map();
// A hospedagem nunca inicia um processo no computador do visitante. Por padrão
// o Modo Livre responde com Workers AI e a voz Web Speech local do navegador.
// Se a equipe hospedar o Kokoro separadamente, a voz pode ser liberada online
// sem expor o token do motor. O modo público é opt-in, não o padrão.
function liaPublicVoice(env){
 if(env.LIA_PUBLIC_VOICE_ENABLED!=='true')return false;
 if(env.LIA_CONTAINER_ENABLED==='true'&&env.LIA_KOKORO)return true;
 try{return new URL(env.LIA_BACKEND_URL).protocol==='https:';}catch(_){return false;}
}
// Public neural video is a separate, explicit GPU-intensive opt-in. Keep OFF
// until the operator adds persistent Cloudflare WAF limits and spend controls.
function liaPublicVideo(env){
 return liaPublicVoice(env)&&env.LIA_PUBLIC_VIDEO_ENABLED==='true';
}
function liaConfigured(env){
 if(env.LIA_ENABLED!=='true'||!env.LIA_BACKEND_TOKEN||(!env.LIA_STAFF_CODE&&!liaPublicVoice(env)))return false;
 // Container binding never exposes an HTTP endpoint to the public internet.
 if(env.LIA_CONTAINER_ENABLED==='true')return !!env.LIA_KOKORO;
 if(!env.LIA_BACKEND_URL)return false;
 try{
  const u=new URL(env.LIA_BACKEND_URL);
  return (u.protocol==='https:' || (u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname)))&&!u.username&&!u.password&&!u.search&&!u.hash;
 }catch(_){return false;}
}
function liaAuthorized(request,env){
 const origin=request.headers.get('Origin');
 if(origin&&origin!==new URL(request.url).origin)return false;
 const code=request.headers.get('X-Educa-Lia-Code')||'';
 return !!env.LIA_STAFF_CODE&&code.length>=8&&code.length<=150&&code===env.LIA_STAFF_CODE;
}
function liaRateLimit(request,readOnly=false){
 const now=Date.now(),ip=(request.headers.get('CF-Connecting-IP')||'local').slice(0,90);
 const bucket=readOnly?liaStatusHits:liaRequestHits;
 const hits=(bucket.get(ip)||[]).filter(ts=>ts>now-600000);
 if(bucket.size>1500)bucket.clear();
 if(hits.length>=(readOnly?600:50))return false;hits.push(now);bucket.set(ip,hits);return true;
}
async function liaUpstream(env,path,method='GET',data=undefined,timeout=30000){
 const options={
  method,headers:{Authorization:'Bearer '+env.LIA_BACKEND_TOKEN,...(data?{'Content-Type':'application/json'}:{})},
  body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(timeout)
 };
 // A rota é construída internamente e autenticada pelo Worker.
 if(env.LIA_CONTAINER_ENABLED==='true'&&env.LIA_KOKORO){
  return env.LIA_KOKORO.getByName('lia-kokoro-main').fetch(new Request('http://localhost:7860'+path,options));
 }
 const base=String(env.LIA_BACKEND_URL||'').replace(/\/+$/,'');
 return fetch(base+path,options);
}
async function liaGateway(request,env,route){
 if(!liaConfigured(env))return route==='health'?responder({ok:true,enabled:false,public_voice:false,provider:'voz-do-navegador',video_reason:'Voz neural online não configurada; IA do Educa+ funciona normalmente'}):erro(503,'Motor neural online não configurado.');
 const staff=liaAuthorized(request,env);
 const publico=liaPublicVoice(env);
 const videoPublico=liaPublicVideo(env);
 const origin=request.headers.get('Origin');
 if(origin&&origin!==new URL(request.url).origin)return erro(403,'Origem não autorizada.');
 const rotaVozPublica=(route==='preload'||route==='speak'||/^media:[a-f0-9]{32}\.wav$/.test(route));
 const rotaVideoPublico=videoPublico&&(route==='render'||route.startsWith('render-status:')||/^media:[a-f0-9]{32}\.mp4$/.test(route));
 const isPublicRequest=!staff&&publico&&(rotaVozPublica||rotaVideoPublico);
 if(route==='check'){
  if(!liaAuthorized(request,env))return erro(403,'Código da equipe incorreto.');
  if(!liaRateLimit(request,true))return erro(429,'Limite de consultas atingido.');
  return responder({ok:true,authorized:true});
 }
 if(route==='health'){
  try{
   const response=await liaUpstream(env,'/health','GET',undefined,4500);
   if(!response.ok)return responder({ok:true,enabled:false,provider:null});
   const data=await response.json();
   return responder({ok:true,enabled:!!data.ok,provider:'kokoro-remoto',public_voice:publico,staff_preview:!!env.LIA_STAFF_CODE&&!publico,
    voice_engine:String(data.voice_engine||'kokoro').slice(0,25),
    voice_ready:!!(data.female_voice_ready||data.voice_installed),
    video_enabled:!!data.video_enabled&&(videoPublico||!publico),public_video:videoPublico,
    video_reason:String(data.video_reason||'nao configurado').slice(0,170),voice_installed:!!(data.female_voice_ready||data.voice_installed)});
  }catch(_){return responder({ok:true,enabled:false,provider:null});}
 }
 if(!staff&&!isPublicRequest)return erro(403,'Acesso reservado a testes da equipe.');
 // Limite por instância: complementar com WAF/rate limiting da Cloudflare na
 // publicação pública; nunca confie só neste mapa em memória.
 if(!liaRateLimit(request,staff&&route.startsWith('render-status:')))return erro(429,'Limite temporário de chamadas atingido.');
 if(isPublicRequest&&route==='preload')return responder({ok:true,voice_loaded:true});
 let path='',method='GET',payload;
 if(route==='preload'){
  const data=await lerDados(request);
  const engine=String(data.engine||'feminina');
  if(!['feminina','padrao'].includes(engine))return erro(400,'Voz inválida.');
  path='/v1/lia/preload?engine='+engine;method='POST';
 }else if(route==='speak'){
  const data=await lerDados(request);const t=String(data.text||'').trim();
  if(!t||t.length>(isPublicRequest?300:450)||/[<>]/.test(t))return erro(400,'Texto de voz inválido.');
  const style=String(data.style||'natural');
  if(!['natural','calma','clara'].includes(style))return erro(400,'Estilo de voz inválido.');
  const engine=isPublicRequest?'feminina':String(data.engine||'feminina');
  if(!['feminina','padrao'].includes(engine))return erro(400,'Voz inválida.');
  path='/v1/lia/speak';method='POST';payload={text:t,style,engine};
 }else if(route==='render'){
  const data=await lerDados(request);
  if(!/^[a-f0-9]{32}$/.test(String(data.job_id||'')))return erro(400,'Identificador inválido.');
  path='/v1/lia/render/'+data.job_id;method='POST';
 }else if(route.startsWith('render-status:')){
  const id=route.slice('render-status:'.length);
  if(!/^[a-f0-9]{32}$/.test(id))return erro(400,'Identificador inválido.');
  path='/v1/lia/render-status/'+id;
 }else if(route.startsWith('media:')){
  const filename=route.slice(6);
  if(!/^[a-f0-9]{32}\.(wav|mp4)$/.test(filename))return erro(400,'Mídia inválida.');
  path='/v1/media/'+filename;
 }else{return erro(404,'Recurso inexistente.');}
 try{
  const upstream=await liaUpstream(env,path,method,payload,route==='render'?15000:route==='speak'?45000:30000);
  if(!upstream.ok){
   return erro(upstream.status===404?404:upstream.status===401?502:upstream.status===503?503:502,'Motor de voz/vídeo temporariamente indisponível.');
  }
  if(route.startsWith('media:')){
   if(isPublicRequest&&path.endsWith('.wav')){
    const bytes=await upstream.arrayBuffer();
    if(bytes.byteLength>8000000)return erro(413,'Áudio excede limite permitido.');
    return new Response(bytes,{status:200,headers:{'Content-Type':'audio/wav','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
   }
   return new Response(upstream.body,{status:200,headers:{
    'Content-Type':path.endsWith('.mp4')?'video/mp4':'audio/wav',
    'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'
   }});
  }
  const result=await upstream.json();
  // Não repassar URLs remotas: somente caminhos relativos de mídia validados no cliente.
  const id=String(result.job_id||'');
  if(route==='preload'){return responder({ok:!!result.ok,voice_loaded:!!result.voice_loaded});}
  if(route==='speak'){
   if(!/^[a-f0-9]{32}$/.test(id))return erro(502,'Resposta de áudio inválida.');
   const cues=Array.isArray(result.viseme_cues)?result.viseme_cues.filter(c=>Number.isInteger(c?.at_ms)&&c.at_ms>=0&&c.at_ms<=60000&&['rest','m','fv','ah','ee','oh','oo','wide'].includes(c.shape)).slice(0,160).map(c=>({at_ms:c.at_ms,shape:c.shape})):[];
   return responder({ok:true,job_id:id,audio_url:'/api/avatar/media/'+id+'.wav',video_enabled:(staff||videoPublico)&&!!result.video_enabled,viseme_cues:cues,viseme_precision:cues.length?'approximate':'unavailable'});
  }
  const status=String(result.status||'');
  if(!['queued','rendering','ready','failed'].includes(status))return erro(502,'Resposta de renderização inválida.');
  if(status!=='ready')return responder({ok:true,status});
  const match=/^\/v1\/media\/([a-f0-9]{32})\.mp4$/.exec(String(result.video_url||''));
  if(!match)return erro(502,'Resposta de vídeo inválida.');
  return responder({ok:true,status:'ready',video_url:'/api/avatar/media/'+match[1]+'.mp4'});
 }catch(e){console.warn('Lia adapter:',String(e?.name||'connection'));return erro(503,'Servidor de vídeo/voz offline ou demorou a responder.');}
}

async function rotearApi(request, env, url) {
  const rota = url.pathname;
  const metodo = request.method.toUpperCase();

  if (metodo === 'GET' && rota === '/api/avatar/health') return liaGateway(request,env,'health');
  if (metodo === 'GET' && rota === '/api/avatar/check') return liaGateway(request,env,'check');
  if (metodo === 'POST' && rota === '/api/avatar/preload') return liaGateway(request,env,'preload');
  if (metodo === 'POST' && rota === '/api/avatar/speak') return liaGateway(request,env,'speak');
  if (metodo === 'POST' && rota === '/api/avatar/render') return liaGateway(request,env,'render');
  if (metodo === 'GET' && /^\/api\/avatar\/render-status\/[a-f0-9]{32}$/.test(rota)) return liaGateway(request,env,'render-status:'+rota.split('/').at(-1));
  if (metodo === 'GET' && rota.startsWith('/api/avatar/media/')) return liaGateway(request,env,'media:'+rota.split('/').at(-1));
  if (metodo === 'POST' && rota === '/api/modo-livre/conversar') {
    return responderModoLivre(request, env);
  }
  if (metodo === 'GET' && rota === '/api/modo-livre/capacidades') {
    return responder({ok:true,projeto:'Educa+ Digital',conversa:env?.AI?.run?'workers-ai':'aguardando-binding-ai',voz_neural_online:liaConfigured(env)&&liaPublicVoice(env),voz_alternativa:'voz-feminina-pt-br-do-navegador',precisa_cmd:false});
  }
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

// Inicializacao exclusiva dos Workers Previews. O D1 oficial nao recebe esse sinalizador.
// D1.exec interpreta quebras de linha como comandos separados. Executamos uma
// instrucao preparada de cada vez, inclusive o corpo inteiro do CREATE TRIGGER.
const bancoPreviewInicializacoes = new WeakMap();

function separarComandosPreview(sql) {
  const comandos = [];
  let linhas = [];
  let gatilho = false;
  for (const original of sql.split(/\r?\n/)) {
    const linha = original.trim();
    if (!linha || linha.startsWith('--')) continue;
    if (/^PRAGMA foreign_keys\s*=/i.test(linha)) continue;
    if (/^CREATE TRIGGER\b/i.test(linha)) gatilho = true;
    linhas.push(linha);
    const fim = gatilho ? /^END;$/i.test(linha) : /;\s*$/.test(linha);
    if (fim) {
      comandos.push(linhas.join(' '));
      linhas = [];
      gatilho = false;
    }
  }
  if (linhas.length) throw new Error('Esquema incompleto no Preview.');
  return comandos;
}

async function garantirBancoDeTeste(env) {
  if (env.PREVIEW_DB_BOOTSTRAP !== 'true' || !env.DB) return;
  let tarefa = bancoPreviewInicializacoes.get(env.DB);
  if (!tarefa) {
    tarefa = (async () => {
      const controle = await env.DB.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='preview_bootstrap'"
      ).first();
      if (controle) {
        const pronto = await env.DB.prepare('SELECT concluido FROM preview_bootstrap WHERE id = 1').first();
        if (pronto?.concluido === 1) return;
      }
      const { PREVIEW_SCHEMA_SQL } = await import('./preview-schema.js');
      for (const comando of separarComandosPreview(PREVIEW_SCHEMA_SQL)) {
        await env.DB.prepare(comando).run();
      }
      await env.DB.prepare('CREATE TABLE IF NOT EXISTS preview_bootstrap (id INTEGER PRIMARY KEY, concluido INTEGER NOT NULL)').run();
      await env.DB.prepare('INSERT OR REPLACE INTO preview_bootstrap (id, concluido) VALUES (1, 1)').run();
    })().catch(erro => {
      bancoPreviewInicializacoes.delete(env.DB);
      throw erro;
    });
    bancoPreviewInicializacoes.set(env.DB, tarefa);
  }
  await tarefa;
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

    const rotaPublica = ['/api/saude', '/api/estrutura','/api/modo-livre/capacidades'].includes(url.pathname) || (url.pathname === '/api/modo-livre/conversar' && request.method === 'POST') || (url.pathname.startsWith('/api/avatar/') && ['GET','POST'].includes(request.method));
    if (!env.DB && !rotaPublica) {
      return erro(503, 'Banco D1 não configurado. Consulte as instruções de publicação.');
    }

    try {
      if (!rotaPublica) await garantirBancoDeTeste(env);
      return await rotearApi(request, env, url);
    } catch (falha) {
      console.error('Educa API:', falha?.message || 'erro desconhecido');
      if (falha instanceof SyntaxError) {
        return erro(400, 'JSON inválido.');
      }
      if (falha?.message?.includes('dados grandes')) {
        return erro(413, 'Dados enviados excedem o limite.');
      }
      if (env.PREVIEW_DB_BOOTSTRAP === 'true' && !rotaPublica) {
        return responder({ ok: false, message: 'Falha no banco de testes.', diagnostico_preview: String(falha?.message || 'erro desconhecido').slice(0, 180) }, 500);
      }
      return erro(500, 'Falha temporária ao acessar o banco de dados.');
    }
  }
};
