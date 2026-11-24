import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const voice=read('public/static/js/lia-voice-warm-v11223.js');
const neural=read('public/static/js/lia-free-neural-v11206.js');
const model=read('public/static/js/lia-paradee-worker-v11206.js');
const video=read('public/static/js/free-video.js');
const sw=read('public/static/sw.js');
const html=read('public/html/index.html');
const wrangler=read('wrangler.toml');
test('V112.23: scripts TTS e Worker continuam compilando',()=>{
 for(const s of [voice,neural,video,sw])
  assert.doesNotThrow(()=>new vm.Script(s));
 // O worker ONNX usa imports ES module: verificar pelo parser nativo em testes browser.
 assert.match(model,/async function load\(/);
 assert.match(model,/async function speak\(/);
});
test('V112.23: a voz neural aquece apenas uma vez, sem cron ou chamadas pagas',()=>{
 assert.match(voice,/setTimeout\(\(\)=>\{bootTimer=null;void warm\(\);\},4200\)/);
 assert.match(voice,/if\(!manual&&attempts>=1\)/);
 assert.match(voice,/engine\.prepare\(\)/);
 assert.match(voice,/if\(sensitive&&!manual\)return/);
 assert.match(voice,/navigator\.connection\?\.saveData/);
 assert.doesNotMatch(voice,/setInterval\(/);
 assert.doesNotMatch(voice,/fetch\(|\/api\/lia\/voz-web\/speak/);
 assert.equal((wrangler.match(/LIA_WEB_HQ_TTS_ENABLED = "false"/g)||[]).length,2);
});
test('V112.23: iPhone conserva modo de memória, Dora padrão e recuperação explícita',()=>{
 assert.match(voice,/iPad\|iPhone\|iPod/);
 assert.match(voice,/sessionStorage\.getItem\(KEY\)/);
 assert.match(voice,/sessionStorage\.getItem\(WARM_KEY\)/);
 assert.match(voice,/const sensitive=iOS\|\|lowRam\|\|interrupted/);
 assert.doesNotMatch(video,/voiceEngine\.value='padrao'/);
 assert.match(video,/window\.EducaLiaWarm\?\.isMemorySensitive\?\.\(\)/);
 assert.match(video,/voiceEngine\.value='gratuita'/);
 assert.match(video,/voiceEngine\.querySelector\('option\[value="feminina"\]'\)\?\.remove\(\)/);
 assert.doesNotMatch(video,/audioOnly\(session\.lastSpoken\|\|phrase,serial\)/);
 assert.match(video,/await local\.prepare\(\)/);
 assert.match(video,/recovered&&!allowRecoveredNeural/);
});
test('V112.23: limita o áudio que não responde e libera a memória realmente',()=>{
 assert.match(video,/Promise\.race\(\[/);
 assert.match(video,/7500/);
 assert.match(video,/local\.stop\?\.\(/);
 assert.match(video,/beginSpeech\?\.\(\)/);
 assert.match(video,/endSpeech\?\.\(\)/);
 assert.match(neural,/function stop\(reason=/);
 assert.match(neural,/30000/);
 assert.match(model,/inputIds\.dispose\?\.\(\)/);
 assert.match(model,/speedTensor\.dispose\?\.\(\)/);
 assert.match(model,/tensor\?\.dispose\?\.\(\)/);
 assert.match(model,/const audio=wav\(pcm,24000\)/);
});
test('V112.23: evita vários decoders MP4 e não consulta health de voz desligada',()=>{
 assert.match(video,/allPlayers\.slice\(0,1\)/);
 assert.match(video,/target\.preload=window\.EducaLiaWarm/);
 assert.match(video,/session\.renderReady=false;session\.teamCode='';session\.motorPending=null/);
 assert.match(video,/if\(window\.EducaLiaWarm\?\.isMemorySensitive\?\.\(\)\)return/);
});
test('V112.23: navegação nunca cai silenciosamente na home e vídeos não lotam o cache',()=>{
 assert.match(sw,/educa-cf11223-lia-stable-navigation/);
 assert.match(sw,/url\.pathname\.startsWith\('\/static\/videos\/'\)/);
 assert.match(sw,/url\.pathname\.startsWith\('\/static\/audio\/'\)/);
 assert.match(sw,/event\.request\.headers\.has\('Range'\)/);
 assert.match(sw,/return cached \|\| Response\.error\(\)/);
 assert.doesNotMatch(sw,/caches\.match\('\/'\)/);
});
test('V112.23: ordem de script mantém o motor pronto antes do controlador do vídeo',()=>{
 const a=html.indexOf('/static/js/lia-free-neural-v11206.js?v=11223');
 const b=html.indexOf('/static/js/lia-voice-warm-v11223.js?v=11223');
 const c=html.indexOf('/static/js/free-video.js?');
 assert.ok(a>0&&b>a&&c>b,'worker neural -> warm -> vídeo');
 assert.match(html,/&neuralfree=11223/);
 assert.match(html,/\/static\/sw\.js\?v=11223&lia=stable/);
});
test('V112.23: modo iOS detectado inclusive iPad com user agent de desktop',()=>{
 function simulate({ua,platform,ram,stamp,now=1800000000000}){
  const saved=new Map(stamp ? [['educa-lia-neural-inflight-v11223',String(now-2500)]] : []);
  const storage={getItem:key=>saved.get(key),setItem:(key,val)=>saved.set(key,val),removeItem:key=>saved.delete(key)};
  const listeners={};
  const engine={prepare:()=>Promise.resolve({voice:'Dora'}),isReady:()=>false};
  const root={document:{hidden:false,readyState:'loading',addEventListener:(event,fn)=>listeners[event]=fn},
   navigator:{userAgent:ua,platform,maxTouchPoints:platform==='MacIntel'?5:0,deviceMemory:ram,connection:{saveData:false}},
   window:{EducaLiaFreeNeural:engine,addEventListener:(event,fn)=>listeners[event]=fn},
   sessionStorage:storage,Date:{now:()=>now},setTimeout:()=>1,clearTimeout:()=>{},Promise,Number,Object,RegExp,Math,console};
  vm.runInNewContext(voice,root,{timeout:1000});
  return root.window.EducaLiaWarm.state();
 }
 assert.equal(simulate({ua:'Mozilla/5.0 (iPhone)',platform:'iPhone',ram:0}).mode,'leve');
 assert.equal(simulate({ua:'Mozilla/5.0 (Macintosh)',platform:'MacIntel',ram:0}).mode,'leve');
 assert.equal(simulate({ua:'Mozilla/5.0 (X11; Linux)',platform:'Linux',ram:2}).mode,'leve');
 assert.equal(simulate({ua:'Mozilla/5.0 (Windows NT)',platform:'Win32',ram:8,stamp:true}).mode,'leve');
 assert.equal(simulate({ua:'Mozilla/5.0 (Windows NT)',platform:'Win32',ram:8}).mode,'neural');
});

 test('V112.24: fallback WebAudio da Dora não baixa Kokoro pesado',()=>{
 const prefetch=video.split('function prefetchNextChunk(serial){')[1].split('async function playDynamicKokoroWebAudio')[0];
 assert.ok(prefetch.indexOf("if(selectedEngine()==='gratuita')return;")>=0);
 assert.ok(prefetch.indexOf("if(selectedEngine()==='gratuita')return;")<prefetch.indexOf('browser.synthesize('));
});
