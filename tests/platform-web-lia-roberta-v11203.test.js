import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {hqWebVoiceStatus,webHQVoice} from '../src/lia-web-hq-tts.js';

const wrangler=readFileSync('wrangler.toml','utf8');
const video=readFileSync('public/static/js/free-video.js','utf8');
const html=readFileSync('public/html/index.html','utf8');
const voiceId='RGymW84CSmfVugnA5tvA';

test('V112.03 — Roberta selecionada no Worker oficial e Preview, nunca no Android ou iOS nativos',()=>{
 assert.equal(wrangler.match(/LIA_ELEVENLABS_VOICE_ID = "RGymW84CSmfVugnA5tvA"/g)?.length,2);
 assert.equal(wrangler.match(/LIA_WEB_HQ_TTS_PROVIDER = "elevenlabs"/g)?.length,2);
 assert.equal(wrangler.match(/LIA_WEB_HQ_TTS_ENABLED = "true"/g)?.length,1);
 assert.equal(wrangler.match(/LIA_WEB_HQ_TTS_ENABLED = "false"/g)?.length,1);
 // O Preview continua desligado e não compartilha o segredo de produção.
 assert.match(wrangler,/\[previews\.vars\][\s\S]*LIA_WEB_HQ_TTS_ENABLED = "false"/);
 assert.doesNotMatch(wrangler,/LIA_ELEVENLABS_API_KEY\s*=/);
 // O status da Roberta atualiza sua própria option; não sobrescreve
 // a voz neural gratuita colocada no início da lista Web.
 assert.match(video,/voiceEngine\.querySelector\('option\[value="feminina"\]'\)\.textContent='Roberta · voz natural/);
 assert.match(video,/const robertaOption=voiceEngine\?\.querySelector\('option\[value="feminina"\]'\)/);
 assert.match(video,/config\.provider==='elevenlabs-flash-v2\.5'/);
 assert.match(html,/free-video\.js\?v=11191[^"]*&roberta=11203/);
});

test('V112.03 — status desativado antes de instalar segredo e ligar explicitamente',()=>{
 const base={LIA_WEB_HQ_TTS_PROVIDER:'elevenlabs',LIA_ELEVENLABS_VOICE_ID:voiceId};
 assert.equal(hqWebVoiceStatus(base).enabled,false);
 assert.equal(hqWebVoiceStatus({...base,LIA_WEB_HQ_TTS_ENABLED:'true'}).enabled,false);
 assert.equal(hqWebVoiceStatus({...base,LIA_ELEVENLABS_API_KEY:'test-secret-value'}).enabled,false);
 assert.equal(hqWebVoiceStatus({...base,LIA_ELEVENLABS_API_KEY:'test-secret-value',
  LIA_WEB_HQ_TTS_ENABLED:'true'}).enabled,true);
});

test('V112.03 — API realmente endereça a voz Roberta e usa Flash v2.5',async()=>{
 const before=globalThis.fetch;
 let calls=0;
 globalThis.fetch=async(url,options)=>{
  calls++;
  assert.equal(url,'https://api.elevenlabs.io/v1/text-to-speech/'+voiceId+'/stream?output_format=mp3_44100_128');
  const data=JSON.parse(options.body);
  assert.equal(data.model_id,'eleven_flash_v2_5');
  assert.equal(data.language_code,'pt');
  assert.ok(data.voice_settings.speed>=1&&data.voice_settings.speed<=1.1);
  return new Response(new Uint8Array(2600),{status:200,headers:{
   'Content-Type':'audio/mpeg','Content-Length':'2600'}});
 };
 try{
  const env={LIA_WEB_HQ_TTS_PROVIDER:'elevenlabs',LIA_WEB_HQ_TTS_ENABLED:'true',
   LIA_ELEVENLABS_VOICE_ID:voiceId,LIA_ELEVENLABS_API_KEY:'test-secret-value'};
  const request=new Request('https://educa.example/api/lia/voz-web/speak',{
   method:'POST',headers:{Origin:'https://educa.example','CF-Connecting-IP':'192.0.2.93'},
   body:JSON.stringify({text:'Oi, eu sou a Lia. Tudo bem?'})});
  const response=await webHQVoice(request,env);
  assert.equal(response.status,200);
  assert.equal(response.headers.get('Content-Type'),'audio/mpeg');
  assert.equal(calls,1);
 }finally{globalThis.fetch=before;}
});

test('V112.03 — Safari aguarda brevemente o status para não começar robótico',()=>{
 assert.match(video,/session\.hqVoiceCheck=inspectWebHQVoice\(\)/);
 assert.match(video,/await Promise\.race\(\[/);
 assert.match(video,/session\.hqVoiceCheck,new Promise\(resolve=>setTimeout\(resolve,2000\)\)/);
 assert.match(video,/turn!==session\.serial\|\|!session\.active/);
 assert.match(video,/timeout=setTimeout\(\(\)=>controller\.abort\(\),8500\)/);
 assert.match(video,/session\.hqVoiceFailedSerial=serial/);
});
