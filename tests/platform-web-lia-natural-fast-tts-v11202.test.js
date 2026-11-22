import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {hqWebVoiceStatus,webHQVoice} from '../src/lia-web-hq-tts.js';

const voiceId='JBFqnCBsd6RMkjVDRZzb';
const secret='secret-value-for-tests-only';
const provider={LIA_WEB_HQ_TTS_PROVIDER:'elevenlabs',
 LIA_ELEVENLABS_API_KEY:secret,LIA_ELEVENLABS_VOICE_ID:voiceId};
function request(text,ip='203.0.113.251'){
 return new Request('https://educa.teste/api/lia/voz-web/speak',{
  method:'POST',headers:{Origin:'https://educa.teste','Content-Type':'application/json',
   'CF-Connecting-IP':ip},body:JSON.stringify({text})
 });
}
test('V112.02 — ElevenLabs Flash não inicia nem cobra por possuir uma chave',async()=>{
 assert.equal(hqWebVoiceStatus(provider).enabled,false);
 assert.equal(hqWebVoiceStatus({...provider,LIA_WEB_HQ_TTS_ENABLED:'false'}).enabled,false);
 assert.equal(hqWebVoiceStatus({LIA_WEB_HQ_TTS_ENABLED:'true',
   LIA_WEB_HQ_TTS_PROVIDER:'elevenlabs'}).enabled,false);
 assert.equal(hqWebVoiceStatus({...provider,LIA_WEB_HQ_TTS_ENABLED:'true'}).enabled,true);
 const disabled=await webHQVoice(request('Oi, sou a Lia.'),provider);
 assert.equal(disabled.status,503);
 assert.doesNotMatch(JSON.stringify(hqWebVoiceStatus({...provider,LIA_WEB_HQ_TTS_ENABLED:'true'})),
  /secret-value-for-tests-only|JBFqnCBsd6RMkjVDRZzb/);
});
test('V112.02 — Worker encaminha somente fala fictícia e recebe MP3 natural pt-BR',async()=>{
 const original=globalThis.fetch;
 let calls=0;
 globalThis.fetch=async(url,opts)=>{
  calls++;
  assert.match(url,/^https:\/\/api\.elevenlabs\.io\/v1\/text-to-speech\/JBFqnCBsd6RMkjVDRZzb\/stream\?output_format=mp3_44100_128$/);
  assert.equal(opts.method,'POST');
  assert.equal(opts.headers['xi-api-key'],secret);
  assert.equal(opts.redirect,'error');
  const data=JSON.parse(opts.body);
  assert.equal(data.text,'Oi, sou a Lia. Vamos praticar segurança.');
  assert.equal(data.model_id,'eleven_flash_v2_5');
  assert.equal(data.language_code,'pt');
  assert.ok(data.voice_settings.speed>1&&data.voice_settings.speed<1.1);
  return new Response(new Uint8Array(2800),{status:200,headers:{'Content-Type':'audio/mpeg','Content-Length':'2800'}});
 };
 try{
  const env={...provider,LIA_WEB_HQ_TTS_ENABLED:'true'};
  const response=await webHQVoice(request('Oi, sou a Lia. Vamos praticar segurança.'),env);
  assert.equal(response.status,200);
  assert.equal(response.headers.get('Content-Type'),'audio/mpeg');
  assert.equal(response.headers.get('Cache-Control'),'no-store');
  assert.equal((await response.arrayBuffer()).byteLength,2800);
  assert.equal(calls,1);
 }finally{globalThis.fetch=original;}
});
test('V112.02 — rejeita PII, links e origens externas antes de chamar provedor',async()=>{
 const env={...provider,LIA_WEB_HQ_TTS_ENABLED:'true'};
 for(const [text,ip] of [
  ['Meu telefone é 65999999999.','203.0.113.253'],
  ['Veja https://site.teste/golpe','203.0.113.254'],
  ['Minha senha é 12345678','203.0.113.255']]){
  assert.equal((await webHQVoice(request(text,ip),env)).status,422);
 }
 const foreign=new Request('https://educa.teste/api/lia/voz-web/speak',{
  method:'POST',headers:{Origin:'https://site-externo.teste'},
  body:JSON.stringify({text:'Oi, sou a Lia.'})});
 assert.equal((await webHQVoice(foreign,env)).status,403);
});
test('V112.02 — cliente Web usa serviço só após status habilitado e não aquece Kokoro pesado',()=>{
 const video=readFileSync('public/static/js/free-video.js','utf8');
 const free=readFileSync('public/static/js/free-mode.js','utf8');
 const html=readFileSync('public/html/index.html','utf8');
 assert.doesNotMatch(video,/session\.hqVoiceCheck=inspectWebHQVoice\(\)/);
 assert.match(video,/session\.hqVoiceEnabled=enabled/);
 assert.match(video,/voiceEngine\.querySelector\('option\[value="feminina"\]'\)\?\.remove\(\)/);
 assert.match(video,/session\.fastVoiceSerial=serial/);
 assert.match(video,/playFreeNeuralVoice\(phrase,serial\)/);
 assert.match(video,/return voiceEngine\?\.value==='padrao'\?'padrao':'gratuita'/);
 assert.match(video,/const chunks=web&&selectedEngine\(\)==='gratuita'\?speechSegments\(whole\)/);
 assert.match(video,/speechSegments\(whole\)/);
 assert.match(free,/educaPlatform!=='web'/);
 assert.match(video,/document\.documentElement\?\.dataset\?\.educaPlatform!=='web'/);
 assert.match(html,/free-video\.js\?v=11191[^"]*&naturalvoice=11202/);
 assert.match(html,/free-mode\.js\?v=11189[^"]*&naturalvoice=11202/);
});
