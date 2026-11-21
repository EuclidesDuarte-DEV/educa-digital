import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync('public/static/js/free-video.js','utf8');
const free=readFileSync('public/static/js/free-mode.js','utf8');
const html=readFileSync('public/html/index.html','utf8');
test('V111.95 — Kokoro começa a aquecer no WhatsApp, antes da videochamada',()=>{
 assert.match(free,/window\.EducaLiaBrowserKokoro\.prewarmIntro\(\)/);
 assert.match(free,/window\.EducaLiaVoice\?\.waitForFemale\?\.\(500\)/);
 // V112.02: modelo pesado não é baixado pela Web no iPhone.
 assert.match(source,/document\.documentElement\?\.dataset\?\.educaPlatform!=='web'/);
 assert.match(source,/void inspectWebHQVoice\(\)/);
});
test('V111.95 — voz é gerada dinamicamente, sem MP3 fixo ou TTS pago',()=>{
 assert.doesNotMatch(source,/lia-intro-pf-dora-v11195\.mp3/);
 assert.doesNotMatch(free,/lia-intro-pf-dora-v11195\.mp3/);
 assert.match(source,/session\.hqVoiceEnabled=false/);
 assert.match(source,/const promise=browser\.synthesize\(next,selectedStyle\(\)\)/);
 assert.match(source,/pending=ahead\|\|browser\.synthesize\(text,selectedStyle\(\)\)/);
});
test('V111.95 — inicia por uma frase curta, sem modificar conteúdo',()=>{
 const a=source.indexOf('function speechSegments(text){'),b=source.indexOf('const captionToggle=',a);
 assert.ok(a>=0&&b>a);
 const f=vm.runInNewContext(source.slice(a,b)+';speechSegments;');
 const intro='Oi, sou a Lia. Troquei de celular e estou precisando de um favor. Você pode me emprestar R$ 350 pelo Pix de treino? Eu devolvo depois.';
 const chunks=Array.from(f(intro));
 assert.equal(chunks[0],'Oi, sou a Lia.');
 assert.equal(chunks.join(' '),intro);
 assert.ok(chunks.length>=3);
});
test('V111.95 — WebAudio é desbloqueado no clique antes de sintetizar',()=>{
 const answer=source.slice(source.indexOf('async function answer(){'),source.indexOf('function listen(){'));
 assert.match(answer,/primeSpeechMotion\(\);syncLiaCallLayout\(\);session\.connected=true/);
 assert.match(source,/source\.start\(0\)/);
 assert.match(source,/ctx\.decodeAudioData\(await result\.blob\.arrayBuffer\(\)\)/);
 assert.match(source,/if\(await playDynamicKokoroWebAudio\(result,text,serial\)\)return true/);
});
test('V111.95 — Safari toca áudio neural dinâmico pelo AudioContext',async()=>{
 const a=source.indexOf('async function playDynamicKokoroWebAudio('),b=source.indexOf('async function playBrowserResult(',a);
 assert.ok(a>=0&&b>a);
 let started=0,ended=0,next=0,disconnected=0;
 const node={buffer:null,onended:null,connect(){},disconnect(){disconnected++;},start(){started++;}};
 const gain={gain:{value:1},connect(){},disconnect(){disconnected++;}};
 const ctx={state:'running',destination:{},decodeAudioData:async buf=>({decoded:buf.byteLength}),createBufferSource:()=>node,createGain:()=>gain};
 const session={serial:8,active:true,connected:true,waiting:false,utterance:null,webAudioGain:null};
 const context={document:{documentElement:{dataset:{educaPlatform:'web'}}},
 speechMotion:{context:ctx},session,ui:{play:{hidden:true}},outputMuted:false,
 stopVoiceProgress(){},subtitle(){},indicator(){},status(){},referenceMotion(){},
 prefetchNextChunk(){next++},completed(){ended++}};
 const fn=vm.runInNewContext(source.slice(a,b)+';playDynamicKokoroWebAudio;',context);
 const result={blob:{arrayBuffer:async()=>new Uint8Array([1,2,3]).buffer}};
 assert.equal(await fn(result,'Olá. Vou te explicar.',8),true);
 assert.equal(started,1);assert.equal(session.utterance,node);
 assert.equal(session.webAudioGain,gain);assert.equal(next,1);
 node.onended();assert.equal(ended,1);assert.ok(disconnected>=2);
});
test('V111.95 — iOS nativo não usa fallback WebAudio da Web',async()=>{
 const a=source.indexOf('async function playDynamicKokoroWebAudio('),b=source.indexOf('async function playBrowserResult(',a);
 const fn=vm.runInNewContext(source.slice(a,b)+';playDynamicKokoroWebAudio;',
 {document:{documentElement:{dataset:{educaPlatform:'ios'}}}});
 assert.equal(await fn({blob:{}},'Olá',1),false);
});
test('V111.95 — sem voz feminina, não interrompe Kokoro após nove segundos',()=>{
 assert.match(source,/web\?48000:/);
 assert.match(source,/Lia · preparando a voz neural feminina/);
 assert.match(source,/waitForFemale\?\.\(160\)/);
 assert.match(source,/try\{session\.utterance\?\.stop\?\.\(\);\}catch\(_\)\{\}/);
 assert.match(source,/if\(session\.webAudioGain\)session\.webAudioGain\.gain\.value=outputMuted\?0:1/);
 assert.match(html,/free-mode\.js\?v=11189&patch=11189&warm=11195/);
 assert.match(html,/free-video\.js\?v=11191&patch=11191&natural=11192&hq=11193&free=11194&live=11195/);
});
