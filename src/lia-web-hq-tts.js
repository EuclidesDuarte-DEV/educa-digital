// Educa+ Digital V111.93 — voz expressiva pt-BR Web, opt-in e com limite de custo.
// Nunca usa esta rota em Android ou iOS; a UI Web é o único cliente previsto.
// O operador precisa ativar LIA_WEB_HQ_TTS_ENABLED=true no ambiente correto.
const HEAD = {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const hits=new Map();
const reject=(status,message)=>Response.json({ok:false,message},{status,headers:HEAD});
const model='xai/grok-tts';
// V112.02: o provedor deve ser habilitado explicitamente; nem a presença de
// uma credencial nem o uso da Web criam gasto por conta própria.
export function hqWebVoiceStatus(env){
 const provider=env?.LIA_WEB_HQ_TTS_PROVIDER||'grok';
 const eleven=provider==='elevenlabs'&&
  typeof env?.LIA_ELEVENLABS_API_KEY==='string'&&env.LIA_ELEVENLABS_API_KEY.length>=10&&
  /^[a-zA-Z0-9_-]{10,64}$/.test(String(env?.LIA_ELEVENLABS_VOICE_ID||''));
 const grok=provider==='grok'&&typeof env?.AI?.run==='function';
 const enabled=env?.LIA_WEB_HQ_TTS_ENABLED==='true'&&(eleven||grok);
 return {ok:true,enabled,language:'pt-BR',voice:enabled?(eleven?'voz-pt-BR-configurada':'ara'):'desativado',
  provider:enabled?(eleven?'elevenlabs-flash-v2.5':'grok-tts'):'desativado',
  note:enabled?'Voz online de terceiros; a reprodução pode gerar cobrança por caracteres.':
   'Voz natural online desativada; alternativa gratuita imediata do aparelho.'};
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
// A chave é utilizada exclusivamente no Worker Cloudflare. Nunca entra no
// bundle do navegador, em logs, no corpo de retorno ou no git.
async function elevenLabsFlash(text,env){
 const id=String(env.LIA_ELEVENLABS_VOICE_ID);
 const url='https://api.elevenlabs.io/v1/text-to-speech/'+encodeURIComponent(id)+
  '/stream?output_format=mp3_22050_32';
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),4500);
 try{
  const res=await fetch(url,{method:'POST',redirect:'error',signal:ctrl.signal,
   headers:{'xi-api-key':env.LIA_ELEVENLABS_API_KEY,'Content-Type':'application/json',
    'Accept':'audio/mpeg'},
   body:JSON.stringify({text,model_id:'eleven_flash_v2_5',language_code:'pt',
    voice_settings:{stability:0.46,similarity_boost:0.82,style:0,
     use_speaker_boost:false,speed:1.04}})
  });
  if(!res.ok||!res.body||!String(res.headers.get('content-type')||'').includes('audio/'))
   return reject(502,'Serviço de voz natural indisponível.');
  const size=Number(res.headers.get('content-length')||0);
  if(size>2000000)return reject(502,'Áudio acima do limite seguro.');
  // Entrega o fluxo MP3 à Web sem criar nem guardar arquivos de conversas.
  // A chamada não lê o corpo todo no Worker.
  return new Response(res.body,{status:200,headers:{...HEAD,
   'Content-Type':'audio/mpeg','Vary':'Origin'}});
 }catch(_){return reject(503,'Voz natural não respondeu. Usando voz do aparelho.');}
 finally{clearTimeout(timer);}
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
 if(env.LIA_WEB_HQ_TTS_PROVIDER==='elevenlabs')return elevenLabsFlash(text,env);
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
