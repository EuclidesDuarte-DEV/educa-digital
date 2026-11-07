import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import app from '../src/worker.js';

const root='https://educa.example';
const req=(path,method='GET',body=null,headers={})=>new Request(root+path,{method,headers:{Origin:root,...headers},body:body===null?undefined:JSON.stringify(body)});
const post=(path,payload,headers={})=>req(path,'POST',payload,{'Content-Type':'application/json',...headers});
const neuralEnv={LIA_ENABLED:'true',LIA_BACKEND_URL:'https://voz.educa.example',LIA_BACKEND_TOKEN:'private-backend-token',LIA_PUBLIC_VOICE_ENABLED:'true',AI:{run:async()=>({response:'Oi! Sou a Lia, exercício educativo.'})}};

// A abertura do protótipo não depende de D1 para a IA do Modo Livre.
test('site hospedado não exige CMD/Ollama e oferece modo livre do Worker',async()=>{
 const env={AI:{run:async()=>({response:'Olá, esta é uma simulação.'})},ASSETS:{fetch:async()=>new Response('html')}};
 const cap=await app.fetch(req('/api/modo-livre/capacidades'),env);
 assert.equal(cap.status,200);
 assert.deepEqual({...await cap.json()},{ok:true,projeto:'Educa+ Digital',conversa:'workers-ai',voz_neural_online:false,voz_alternativa:'voz-feminina-pt-br-do-navegador',precisa_cmd:false});
 const reply=await app.fetch(post('/api/modo-livre/conversar',{scenario:'video',message:'Oi Lia, é verdade?'}),env);
 assert.equal(reply.status,200);assert.equal((await reply.json()).ok,true);
 const health=await app.fetch(req('/api/avatar/health'),env);
 assert.equal((await health.json()).public_voice,false);
});

test('motor remoto opcional: detecção automática, síntese protegida e WAV para aluno',async()=>{
 const original=globalThis.fetch,job='a'.repeat(32),calls=[];
 globalThis.fetch=async(url,options)=>{
  calls.push({url,options});
  assert.equal(options.headers.Authorization,'Bearer private-backend-token');
  if(url.endsWith('/health'))return Response.json({ok:true,female_voice_ready:true,video_enabled:true,voice_engine:'kokoro'});
  if(url.endsWith('/v1/lia/speak'))return Response.json({ok:true,job_id:job,video_enabled:true,viseme_cues:[{at_ms:10,shape:'ah'},{at_ms:20,shape:'INVALID'}]});
  if(url.endsWith('.wav'))return new Response(new Uint8Array(2048),{headers:{'Content-Type':'audio/wav'}});
  throw Error('Unexpected URL: '+url);
 };
 try{
  const cap=await app.fetch(req('/api/modo-livre/capacidades'),neuralEnv);
  assert.equal((await cap.json()).voz_neural_online,true);
  const health=await app.fetch(req('/api/avatar/health'),neuralEnv);
  const data=await health.json();assert.equal(data.enabled,true);assert.equal(data.public_voice,true);assert.equal(data.video_enabled,false);
  const speech=await app.fetch(post('/api/avatar/speak',{text:'Oi, esta é uma ligação fictícia.',engine:'padrao'}),neuralEnv);
  assert.equal(speech.status,200);
  const j=await speech.json();
  assert.deepEqual(j.viseme_cues,[{at_ms:10,shape:'ah'}]);assert.equal(j.video_enabled,false);assert.equal(j.audio_url,'/api/avatar/media/'+job+'.wav');
  assert.equal(JSON.parse(calls.at(-1).options.body).engine,'feminina');
  const media=await app.fetch(req('/api/avatar/media/'+job+'.wav'),neuralEnv);
  assert.equal(media.status,200);assert.equal(media.headers.get('content-type'),'audio/wav');
  const blocked=await app.fetch(req('/api/avatar/media/'+job+'.mp4'),neuralEnv);
  assert.equal(blocked.status,403);
  const badOrigin=await app.fetch(post('/api/avatar/speak',{text:'oi'},{Origin:'https://invasor.example'}),neuralEnv);
  assert.equal(badOrigin.status,403);
  const badLen=await app.fetch(post('/api/avatar/speak',{text:'a'.repeat(301)}),neuralEnv);
  assert.equal(badLen.status,400);
  const check=await app.fetch(req('/api/avatar/check'),neuralEnv);
  assert.equal(check.status,403);
  assert.equal(calls.length,3);
 }finally{globalThis.fetch=original;}
});

test('sem flag pública, motor privado mantém exigência do código da equipe',async()=>{
 const env={...neuralEnv,LIA_PUBLIC_VOICE_ENABLED:'false',LIA_STAFF_CODE:'codigo-da-equipe'};
 const speech=await app.fetch(post('/api/avatar/speak',{text:'Teste'}),env);
 assert.equal(speech.status,403);
 const cap=await app.fetch(req('/api/modo-livre/capacidades'),env);
 assert.equal((await cap.json()).voz_neural_online,false);
});

test('interface abre protótipo e detecta Kokoro online sem CMD ou código',()=>{
 const js=readFileSync(new URL('../public/static/js/free-video.js',import.meta.url),'utf8');
 const worker=readFileSync(new URL('../src/worker.js',import.meta.url),'utf8');
 assert.match(js,/r\.enabled&&r\.public_voice&&r\.voice_installed/);
 assert.match(js,/session\.teamCode='educa-online'/);
 assert.match(js,/audioOnly\(phrase,serial\)/);
 assert.match(worker,/LIA_PUBLIC_VOICE_ENABLED/);
 assert.match(worker,/isPublicRequest/);
});
