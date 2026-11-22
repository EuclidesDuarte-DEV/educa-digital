import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {hqWebVoiceStatus,webHQVoice} from '../src/lia-web-hq-tts.js';

const voiceId='RGymW84CSmfVugnA5tvA';
const env={LIA_WEB_HQ_TTS_PROVIDER:'elevenlabs',LIA_WEB_HQ_TTS_ENABLED:'true',
 LIA_ELEVENLABS_VOICE_ID:voiceId,LIA_ELEVENLABS_API_KEY:'test-only-key-no-real-secret'};
const request=ip=>new Request('https://educa.example/api/lia/voz-web/speak',{
 method:'POST',headers:{Origin:'https://educa.example','CF-Connecting-IP':ip},
 body:JSON.stringify({text:'Oi! Eu sou a Lia. Vamos conversar?'})
});
test('V112.05 — configured does not mean voice playback already verified',()=>{
 assert.equal(hqWebVoiceStatus(env).enabled,true);
 assert.equal(hqWebVoiceStatus(env).verified,false);
 assert.doesNotMatch(JSON.stringify(hqWebVoiceStatus(env)),/test-only-key-no-real-secret/);
});

test('V112.05 — ElevenLabs 402 on free tier is reported without leaking upstream content',async()=>{
 const previous=globalThis.fetch;
 let seen=0;
 globalThis.fetch=async()=>{
  seen++;
  return new Response(JSON.stringify({detail:{message:'SHOULD NOT LEAK'}}),{
   status:402,headers:{'content-type':'application/json'}});
 };
 try{
  const response=await webHQVoice(request('192.0.2.225'),env);
  assert.equal(response.status,502);
  const json=await response.json();
  assert.match(json.message,/Plano ou créditos ElevenLabs insuficientes/);
  assert.match(json.message,/HTTP 402/);
  assert.doesNotMatch(JSON.stringify(json),/SHOULD NOT LEAK|test-only-key/);
  assert.equal(seen,1);
 }finally{globalThis.fetch=previous;}
});

test('V112.05 — missing voice returns actionable diagnostic without PII or keys',async()=>{
 const previous=globalThis.fetch;
 globalThis.fetch=async()=>new Response('secret details',{status:404});
 try{
  const response=await webHQVoice(request('192.0.2.226'),env);
  const json=await response.json();
  assert.equal(response.status,502);
  assert.match(json.message,/Voz Roberta não disponível/);
  assert.doesNotMatch(JSON.stringify(json),/secret details/);
 }finally{globalThis.fetch=previous;}
});

test('V112.05 — longer deadline and no robotic TTS on neural failure',()=>{
 const video=readFileSync('public/static/js/free-video.js','utf8');
 const server=readFileSync('src/lia-web-hq-tts.js','utf8');
 const page=readFileSync('public/testar-voz-roberta.html','utf8');
 assert.match(video,/timeout=setTimeout\(\(\)=>controller\.abort\(\),8500\)/);
 assert.match(server,/setTimeout\(\(\)=>ctrl\.abort\(\),10000\)/);
 const branch=video.split('function startSpeechChunk(phrase,serial)')[1]
   .split('// V112.01 — Somente Web:')[0];
 assert.match(branch,/session\.hqVoiceFailedSerial=serial/);
 assert.match(branch,/Tentar Roberta novamente/);
 assert.doesNotMatch(branch,/audioOnly\(phrase,serial\)/);
 assert.match(page,/testar-voz-roberta/i);
 assert.match(page,/api\/lia\/voz-web\/speak/);
 assert.doesNotMatch(page,/xi-api-key|LIA_ELEVENLABS_API_KEY/);
});
