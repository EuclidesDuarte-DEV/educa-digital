// Educa+ Digital V111.93 — voz expressiva pt-BR Web, opt-in e com limite de custo.
// Nunca usa esta rota em Android ou iOS; a UI Web é o único cliente previsto.
// O operador precisa ativar LIA_WEB_HQ_TTS_ENABLED=true no ambiente correto.
const HEAD = {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const hits=new Map();
const reject=(status,message)=>Response.json({ok:false,message},{status,headers:HEAD});
const model='xai/grok-tts';
export function hqWebVoiceStatus(env){
 const enabled=env?.LIA_WEB_HQ_TTS_ENABLED==='true'&&typeof env?.AI?.run==='function';
 return {ok:true,enabled,language:'pt-BR',voice:'ara',provider:enabled?'grok-tts':'desativado',
  note:enabled?'Serviço de voz com cobrança por caracteres.':'Ativação manual exigida; sem cobrança automática.'};
}
function allowedMediaURL(url){
 try{
  const u=new URL(url);
  return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&
   (u.hostname.endsWith('.r2.dev')||u.hostname==='examples.aig.cloudflare.com')&&
   /\.mp3$/i.test(u.pathname);
 }catch(_){return false;}
}
function limit(request){
 const ip=String(request.headers.get('CF-Connecting-IP')||'local').slice(0,90);
 const now=Date.now();
 if(hits.size>2000)hits.clear();
 const recent=(hits.get(ip)||[]).filter(t=>t>now-60000);
 if(recent.length>=8||(recent.length&&now-recent.at(-1)<1200))return false;
 recent.push(now);hits.set(ip,recent);return true;
}
export async function webHQVoice(request,env){
 if(!hqWebVoiceStatus(env).enabled)return reject(503,'Voz de estúdio não ativada neste ambiente.');
 if(request.method!=='POST')return reject(405,'Método não permitido.');
 const origin=request.headers.get('Origin');
 if(origin&&origin!==new URL(request.url).origin)return reject(403,'Origem não permitida.');
 if(Number(request.headers.get('Content-Length')||0)>900)return reject(413,'Texto muito longo.');
 let input;
 try{
  const raw=await request.text();
  if(raw.length>900)throw Error('too long');
  input=JSON.parse(raw);
 }catch(_){return reject(400,'JSON inválido.');}
 const text=String(input?.text||'').trim();
 // Somente fala fictícia do exercício. Não repassar dados de participantes.
 if(!text||text.length>450||/[<>]/.test(text)||
    /(?:\d[\s.-]?){7,}|https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text))
   return reject(422,'Use somente falas fictícias, sem dados pessoais ou links.');
 if(!limit(request))return reject(429,'Limite temporário de voz atingido.');
 try{
  const data=await env.AI.run(model,{
   text,language:'pt-BR',voice_id:'ara',
   output_format:{codec:'mp3',sample_rate:24000,bit_rate:128000}
  });
  const audioUrl=data?.audio||data?.result?.audio;
  if(!allowedMediaURL(audioUrl))return reject(502,'Serviço de áudio não retornou mídia verificável.');
  const audio=await fetch(audioUrl,{signal:AbortSignal.timeout(5000),redirect:'error'});
  if(!audio.ok||!String(audio.headers.get('content-type')||'').startsWith('audio/'))
   return reject(502,'Arquivo de voz indisponível.');
  const length=Number(audio.headers.get('content-length')||0);
  if(length>2000000)return reject(502,'Áudio acima do limite seguro.');
  // Não expor a URL temporária do fornecedor ao cliente, nem armazenar conteúdo.
  return new Response(audio.body,{status:200,headers:{...HEAD,'Content-Type':'audio/mpeg','Vary':'Origin'}});
 }catch(_){
  // Não imprimir o texto do participante e nunca afirmar voz pronta antes do WAV/MP3.
  return reject(503,'Voz expressiva temporariamente indisponível. Use a alternativa local.');
 }
}
