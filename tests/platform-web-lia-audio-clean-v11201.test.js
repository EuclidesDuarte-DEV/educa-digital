import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const video=readFileSync('public/static/js/free-video.js','utf8');
const css=readFileSync('public/static/channels/web/overrides.css','utf8');
const web=readFileSync('public/static/channels/web/overrides.js','utf8');
const channel=readFileSync('public/static/js/platform-channel-v11160.js','utf8');
const html=readFileSync('public/html/index.html','utf8');
function slice(start,end){
 const a=video.indexOf(start),b=video.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Bloco de voz ausente: '+start);
 return video.slice(a,b);
}

test('V112.01 — Web esconde as duas opções sem desativar os controles nativos',()=>{
 assert.match(css,/html\[data-educa-platform="web"\] #learningView \.free-learning-consent/);
 assert.match(css,/html\[data-educa-platform="web"\] #learningView \.free-example-consent/);
 assert.match(css,/display: none !important/);
 assert.match(web,/disableHiddenWebConsents/);
 assert.match(web,/consent\.checked=false;consent\.disabled=true/);
 assert.match(web,/document\.addEventListener\('DOMContentLoaded',disableHiddenWebConsents/);
 assert.match(html,/id="freeLearningConsent"/);
 assert.match(html,/id="freeExampleConsent"/);
 assert.match(channel,/platform === 'web' \? '&fix=11212&account=11263&pretest=11267' : ''/);
 assert.match(html,/free-video\.js\?v=11191[^"]*&webfix=11201/);
});

function makeStart(platform='web',neuralLatency=null){
 const audio=[],kokoro=[],dora=[],progress=[];
 const session={serial:1,active:true,connected:true,waiting:false,renderReady:false,
  teamCode:'',fastVoiceSerial:-1,voiceChoiceDoneSerial:-1,utterance:null,motorPending:null,hqVoiceEnabled:false};
 const browser={isReady:()=>neuralLatency!==null,getDiagnostics:()=>({lastSynthesisMs:neuralLatency}),
  hasCachedIntro:async()=>false};
 const window={SpeechSynthesisUtterance:function(){},speechSynthesis:{speak(){}},
  EducaLiaBrowserKokoro:browser,EducaLiaVoice:{choose:()=>null,waitForFemale:async()=>null},
  location:{protocol:'https:'}};
 const context={window,document:{documentElement:{dataset:{educaPlatform:platform}}},
 session,selectedEngine:()=>platform==='web'?'gratuita':'feminina',selectedStyle:()=>'natural',
 showVoiceProgress:x=>progress.push(x),audioOnly:(text)=>audio.push(text),
 playBrowserKokoro:text=>{kokoro.push(text);return Promise.resolve(true);},
 playFreeNeuralVoice:text=>{dora.push(text);return Promise.resolve(true);},
 indicator(){},status(){},Promise,setTimeout,clearTimeout};
 const fn=vm.runInNewContext(slice('function startSpeechChunk(phrase,serial){','function speak(text){')+';startSpeechChunk;',context);
 return {fn,session,audio,kokoro,dora,progress};
}

test('V112.07 — Safari Web usa Dora neural e nunca voz robótica sem seleção manual',()=>{
 const t=makeStart('web');
 t.fn('Oi, sou a Lia.',1);
 assert.equal(t.audio.length,0);
 assert.deepEqual(t.dora,['Oi, sou a Lia.']);
 assert.equal(t.kokoro.length,0);
 assert.equal(t.session.fastVoiceSerial,-1);
 assert.ok(t.progress.some(x=>x.includes('Dora neural gratuita')));
});

test('V112.07 — Dora neural Web funciona sem depender de Kokoro pesado',async()=>{
 const ready=makeStart('web',2000);
 ready.fn('Olá.',1);
 await Promise.resolve();
 assert.equal(ready.audio.length,0);
 assert.equal(ready.dora.length,1);
 assert.equal(ready.kokoro.length,0);
 const slow=makeStart('web',9000);
 slow.fn('Olá.',1);
 assert.equal(slow.audio.length,0);
 assert.equal(slow.dora.length,1);
 assert.equal(slow.kokoro.length,0);
});

test('V112.01 — canais Android e iOS nativos mantêm o motor original',async()=>{
 for(const platform of ['android','ios']){
  const t=makeStart(platform);
  t.fn('Oi, sou a Lia.',1);
  await Promise.resolve();
  assert.equal(t.audio.length,0);
  assert.equal(t.kokoro.length,1);
 }
});

test('V112.01 — navegador sem vozes enumeradas pode tentar Web Speech pt-BR',()=>{
 const code=slice('function audioOnly(text,serial){','async function fetchOk(');
 let spoken=null;
 class Utterance {constructor(text){this.text=text;this.voice=null;}}
 const synth={cancel(){},resume(){},speak(u){spoken=u;u.onstart?.();}};
 const ctx={
  document:{documentElement:{dataset:{educaPlatform:'web'}}},
  window:{speechSynthesis:synth,SpeechSynthesisUtterance:Utterance,
   EducaLiaVoice:{choose:()=>null,voices:()=>[],male:()=>false}},
  SpeechSynthesisUtterance:Utterance,
  session:{serial:4,active:true,connected:true,utterance:null,voiceStartTimer:null},
  ui:{play:{hidden:true}},outputMuted:false,
  selectedStyle:()=>'natural',
  clearMedia(){},indicator(){},status(){},stopVoiceProgress(){},
  referenceMotion(){},subtitle(){},completed(){},recoverVoice(){throw Error('Recuperação indevida');},
  setTimeout,clearTimeout
 };
 const say=vm.runInNewContext(code+';audioOnly;',ctx);
 say('Olá, vamos conversar.',4);
 assert.equal(spoken?.lang,'pt-BR');
 assert.equal(spoken?.text,'Olá, vamos conversar.');
 assert.equal(spoken?.voice,null);
});

test('V112.01 — erro Web oferece ouvir a Lia, não insistir no motor remoto',()=>{
 const recover=slice('function recoverVoice(serial,text,message){','function audioOnly(text,serial){');
 assert.match(recover,/web\?'▶ Ouvir a Lia':'↻ Tentar voz oficial'/);
 assert.match(recover,/status\(web\?message/);
 assert.match(video,/immediateDevice\?\[whole\]/);
});
