import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {hqWebVoiceStatus,webHQVoice} from '../src/lia-web-hq-tts.js';

const local = new Request('https://educa.teste/api/lia/voz-web/speak',{
 method:'POST',headers:{'Content-Type':'application/json','Origin':'https://educa.teste','CF-Connecting-IP':'198.51.100.120'},
 body:JSON.stringify({text:'Oi, eu sou a Lia. Vamos conversar com calma.'})
});
test('[web] V111.93 — serviço premium é opt-in e não cobra sem autorização',async()=>{
 const ai={run(){throw Error('Não pode executar');}};
 assert.equal(hqWebVoiceStatus({AI:ai}).enabled,false);
 const r=await webHQVoice(local,{AI:ai});
 assert.equal(r.status,503);
 assert.equal(hqWebVoiceStatus({LIA_WEB_HQ_TTS_ENABLED:'true',AI:ai}).enabled,true);
});
test('[web] V111.93 — rejeita dados pessoais e origens externas antes de cobrar',async()=>{
 let calls=0;
 const env={AI:{run(){calls++;throw Error('não esperado');}},LIA_WEB_HQ_TTS_ENABLED:'true'};
 const bad=new Request(local.url,{method:'POST',headers:{Origin:'https://site-externo.teste'},
  body:JSON.stringify({text:'Oi, eu sou a Lia.'})});
 assert.equal((await webHQVoice(bad,env)).status,403);
 const privateReq=new Request(local.url,{method:'POST',headers:{Origin:'https://educa.teste'},
  body:JSON.stringify({text:'Me envie um código real 12345678.'})});
 assert.equal((await webHQVoice(privateReq,env)).status,422);
 assert.equal(calls,0);
});
test('[web] V111.93 — só MP3 de domínio esperado vira áudio da LIA',async()=>{
 let calls=0;
 const original=globalThis.fetch;
 globalThis.fetch=async url=>{
  assert.equal(url,'https://pub-123.r2.dev/audio/test.mp3');
  return new Response(new Uint8Array(1400),{headers:{'Content-Type':'audio/mpeg','Content-Length':'1400'}});
 };
 try{
  const env={AI:{async run(model,input){
   calls++;assert.equal(model,'xai/grok-tts');assert.equal(input.language,'pt-BR');
   assert.equal(input.voice_id,'ara');return {audio:'https://pub-123.r2.dev/audio/test.mp3'};
  }},LIA_WEB_HQ_TTS_ENABLED:'true'};
  const result=await webHQVoice(local,env);
  assert.equal(result.status,200);
  assert.equal(result.headers.get('Content-Type'),'audio/mpeg');
  assert.equal(result.headers.get('Cache-Control'),'no-store');
  assert.equal((await result.arrayBuffer()).byteLength,1400);
  assert.equal(calls,1);
 }finally{globalThis.fetch=original;}
});
test('[web] V111.93 — não permite URL arbitrária retornada pelo modelo',async()=>{
 const env={AI:{async run(){return {audio:'https://dominio-desconhecido.teste/test.mp3'};}},LIA_WEB_HQ_TTS_ENABLED:'true'};
 const req=new Request(local.url,{method:'POST',headers:{'CF-Connecting-IP':'198.51.100.121',Origin:'https://educa.teste'},
  body:JSON.stringify({text:'Teste fictício de segurança digital.'})});
 const result=await webHQVoice(req,env);
 assert.equal(result.status,502);
});
test('[web] V111.93 — o frontend isola HQ na Web e retorna para fala feminina rápida',()=>{
 const src=readFileSync('public/static/js/free-video.js','utf8');
 const voice=readFileSync('public/static/js/lia-female-voice.js','utf8');
 const worker=readFileSync('src/worker.js','utf8');
 const html=readFileSync('public/html/index.html','utf8');
 assert.match(src,/if\(document\.documentElement\?\.dataset\?\.educaPlatform==='web'\)\{/);
 // V112.03: permitir pequena margem adicional ao áudio natural da Roberta.
 assert.match(src,/setTimeout\(\(\)=>controller\.abort\(\),8500\)/);
 assert.match(src,/audioOnly\(phrase,serial\)/);
 assert.match(src,/session\.hqAbort\?\.abort\(\)/);
 assert.match(src,/const chunks=web&&selectedEngine\(\)==='gratuita'/);
 assert.match(voice,/natural\|neural\|online/);
 assert.match(worker,/rota === '\/api\/lia\/voz-web\/status'/);
 assert.match(worker,/rota === '\/api\/lia\/voz-web\/speak'/);
 assert.match(html,/free-video\.js\?v=11191&patch=11191&natural=11192&hq=11193/);
 assert.match(html,/lia-female-voice\.js\?v=11193/);
});
