import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {responderModoLivre} from '../src/free-chat.js';

const read=p=>readFileSync(p,'utf8');
const kokoro=read('public/static/js/lia-kokoro-browser.js');
const motor=read('public/static/js/lia-kokoro-worker.js');
const video=read('public/static/js/free-video.js');
const free=read('public/static/js/free-mode.js');
const html=read('public/html/index.html');
const sw=read('public/static/sw.js');

test('V111.52: aquecimento nao gera duas falas e atrasa a primeira resposta',()=>{
  const fn=kokoro.split('function prewarmIntro(){')[1].split('function setDevice')[0];
  assert.match(fn,/introPending=prepare\(\)\.then/);
  assert.doesNotMatch(fn,/synthesize\(/);
  assert.match(kokoro,/SPEAK_LIMIT_MS=45000/);
  assert.match(kokoro,/isReady:\(\)=>Boolean/);
  assert.match(kokoro,/voice:'pf_dora'/);
  assert.match(motor,/VOICE='pf_dora'/);
  assert.match(motor,/loadVoice\('pt-br'\)/);
  assert.match(motor,/style==='calma'\?\.96:style==='clara'\?1\.04:1\.06/);
});

test('V111.52: limite de tempo e alternativa exclusivamente feminina em pt-BR',()=>{
  assert.match(video,/BROWSER_KOKORO_READY_BUDGET_MS=7000/);
  assert.match(video,/BROWSER_KOKORO_WARM_BUDGET_MS=9000/);
  assert.match(video,/Promise\.race\(/);
  assert.match(video,/KOKORO_WARMING/);
  assert.match(video,/audioOnly\(text,serial\)/);
  assert.match(video,/window\.EducaLiaVoice\?\.choose\?\.\(\)/);
  assert.match(video,/waitForFemale\?\.\(1200\)/);
  assert.match(video,/if\(!voice\|\|!\/\^pt\[-_\]BR\$\/i\.test\(voice\.lang\)\)/);
  assert.match(video,/stopVoiceProgress\(\)/);
  assert.match(video,/Tentar voz oficial/);
  assert.match(video,/vídeo original não é neural/);
});

test('V111.52: a boca so tenta falar quando existe energia vocal no WAV',()=>{
  assert.match(video,/audio\.onplaying=.*startSpeechMotion\(audio,result\.cues\)/);
  assert.match(video,/speechMotion\.silentSince/);
  assert.match(video,/now-speechMotion\.silentSince>230/);
  assert.match(video,/rms<\.008\?'rest'/);
  assert.match(video,/if\(rms>\.015&&!motion\.talking/);
  assert.match(video,/toListening\(\)/);
  assert.match(video,/stopSpeechMotion\(\)/);
});

test('V111.52: resposta inicial dividida em poucos trechos, sem dezenas de inferencias',()=>{
  const segment=video.split('function speechSegments(text){')[1].split('const captionToggle')[0];
  const fn=vm.runInNewContext('(function speechSegments(text){'+segment.split('\n}')[0]+'\n})');
  const phrase='Oi, tudo bem? Estou ligando do celular novo. Você consegue verificar uma situação no banco de treinamento? É um Pix totalmente fictício, sem dinheiro real.';
  const chunks=Array.from(fn(phrase));
  assert.ok(chunks.length>=2&&chunks.length<=4,JSON.stringify(chunks));
  assert.equal(chunks.join(' ').replace(/\s+/g,' '),phrase);
  for(const chunk of chunks)assert.ok(chunk.length<=105,chunk);
});

test('V111.52: IA tem timeout de conversa e contexto educativo seguro',async()=>{
  assert.match(free,/responseTimer=setTimeout\(\(\)=>\{timedOut=true;abort\.abort\(\);\},17000\)/);
  assert.match(free,/clearTimeout\(responseTimer\)/);
  assert.match(free,/A IA demorou para responder/);
  const query=new Request('https://educa.example/api/modo-livre/conversar',{
    method:'POST',headers:{'Content-Type':'application/json','Origin':'https://educa.example'},
    body:JSON.stringify({scenario:'video',message:'Quem está falando?',history:[{role:'assistant',content:'Oi, estou ligando do telefone novo.'}]})
  });
  let instructions='';
  const res=await responderModoLivre(query,{AI:{run:async(model,opts)=>{
    instructions=opts.messages[0].content;
    assert.match(model,/llama-3\.1-8b/);
    assert.equal(opts.messages.at(-1).content,'Quem está falando?');
    return {response:'Sou a Lia, personagem do treino. Quer conferir minha identidade antes de continuar?'};}}});
  assert.equal(res.status,200);
  const response=await res.json();
  assert.equal(response.mode,'ia');
  assert.match(instructions,/português brasileiro/);
  assert.match(instructions,/Pix de treinamento|Pix FICTÍCIO|Pix fictício/);
  assert.match(instructions,/Não solicite CPF/);
  assert.match(instructions,/Se a pessoa desconfiar/);
});

test('V111.52: publica apenas scripts e mantém os bancos D1',()=>{
  for(const asset of ['lia-kokoro-browser.js','free-video.js'])
    assert.match(html,new RegExp(asset.replace('.','\\.')+'\\?v=111(?:52|54)'));
  assert.match(html,/free-mode\.js\?v=11153/);
  assert.match(kokoro,/lia-kokoro-worker\.js\?v=11152/);
  assert.match(sw,/educa-cf11152-lia-kokoro-fluida|educa-cf11153-modo-livre-sms-contextual|educa-cf11154-home-video-cue|educa-cf11155-bank-spotlight|educa-cf11156-lia-voice-viewport/);
  assert.doesNotMatch(sw,/\/api\/.*cache\.put/);
  const config=read('wrangler.toml');
  assert.match(config,/database_name = "educa-digital"\s*\ndatabase_id = "25613d89-8073-40f2-af9b-91e751fb28d7"/);
  assert.match(config,/database_name = "educa-digital-preview"\s*\ndatabase_id = "5a3484de-9457-4343-89ff-1b7f455815c4"/);
  assert.match(config,/LIA_CONTAINER_ENABLED = "false"/);
});
