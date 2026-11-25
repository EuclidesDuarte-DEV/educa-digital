import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=path=>readFileSync(path,'utf8');
const speech=read('public/static/js/lia-neural-playback-v11261.js');
const access=read('public/static/js/accessibility.js');
const free=read('public/static/js/free-mode.js');
const html=read('public/html/index.html');
test('Dora neural é compartilhada e a voz antiga não é usada automaticamente',()=>{
 assert.doesNotThrow(()=>new vm.Script(speech));
 assert.match(speech,/EducaLiaFreeNeural/);
 assert.match(speech,/\.speak\(phrase,\{speed\}\)/);
 assert.match(access,/owner:'guide'/);
 assert.match(free,/owner:'call'/);
 assert.doesNotMatch(access,/new SpeechSynthesisUtterance/);
 assert.doesNotMatch(free,/new window\.SpeechSynthesisUtterance/);
 assert.ok(html.indexOf('lia-free-neural-v11206.js')<html.indexOf('lia-neural-playback-v11261.js'));
 assert.ok(html.indexOf('lia-neural-playback-v11261.js')<html.indexOf('free-video.js'));
});
test('Áudio neural reproduz e libera o recurso ao terminar',async()=>{
 const clips=[],released=[],events=[];
 class FakeAudio{
  set src(v){this._src=v;}get src(){return this._src;}
  play(){queueMicrotask(()=>{this.onplaying?.();queueMicrotask(()=>this.onended?.());});return Promise.resolve();}
  pause(){}removeAttribute(){}load(){}
 }
 const window={EducaLiaFreeNeural:{speak:async(text,opts)=>{clips.push({text,speed:opts.speed});return {blob:{size:2048}};}},EducaLiaWarm:{beginSpeech:()=>events.push('begin'),endSpeech:()=>events.push('end')}};
 const sandbox={window,Audio:FakeAudio,URL:{createObjectURL:()=>('blob:'+clips.length),revokeObjectURL:url=>released.push(url)},Promise,queueMicrotask,console};
 vm.runInNewContext(speech,sandbox);
 const started=[];
 const ok=await window.EducaLiaNeuralPlayback.speak('Mensagem natural da Lia para o usuário.',{owner:'call',onStart:()=>started.push(1),onEnd:()=>events.push('finished')});
 assert.equal(ok,true);assert.equal(clips.length,1);assert.equal(started.length,1);
 assert.deepEqual(released,['blob:1']);assert.deepEqual(events,['begin','end','finished']);
});
test('Interrupção impede tocar fala antiga depois de sair da tela',async()=>{
 let finish;
 const pending=new Promise(resolve=>finish=resolve);
 let media=0;
 const window={EducaLiaFreeNeural:{speak:()=>pending},EducaLiaWarm:{beginSpeech(){},endSpeech(){}}};
 const sandbox={window,Audio:class{constructor(){media++;}},URL:{},Promise,console};
 vm.runInNewContext(speech,sandbox);
 const result=window.EducaLiaNeuralPlayback.speak('Guia',{owner:'guide'});
 await Promise.resolve();window.EducaLiaNeuralPlayback.stop('guide');finish({blob:{size:2048}});
 assert.equal(await result,false);assert.equal(media,0);
});

test('V112.62: iPhone usa WebAudio desbloqueado e pequenos trechos, sem Audio.play',async()=>{
 const clips=[],sources=[],events=[];
 class Context{
  state='suspended';sampleRate=24000;destination={};
  resume(){this.state='running';return Promise.resolve();}
  createBuffer(){return {};}
  createBufferSource(){const source={connect(){},disconnect(){},stop(){},start(){queueMicrotask(()=>source.onended?.());}};sources.push(source);return source;}
  decodeAudioData(){return Promise.resolve({duration:1});}
 }
 const window={navigator:{userAgent:'iPhone'},AudioContext:Context,EducaLiaFreeNeural:{speak:async(text)=>{clips.push(text);return {blob:{size:2048,arrayBuffer:async()=>new ArrayBuffer(2048)}};}},EducaLiaWarm:{state:()=>({iOS:true}),isMemorySensitive:()=>true}};
 const sandbox={window,Audio:class{constructor(){throw Error('não deve usar elemento Audio no iPhone');}},URL:{},Promise,queueMicrotask,ArrayBuffer,console};
 vm.runInNewContext(speech,sandbox);
 window.EducaLiaNeuralPlayback.unlock();
 const phrase='Abra o aplicativo indicado na tela. Escolha a atividade que deseja praticar e siga a orientação passo a passo com calma.';
 assert.equal(await window.EducaLiaNeuralPlayback.speak(phrase,{owner:'guide',onStart:()=>events.push('start'),onEnd:()=>events.push('end')}),true);
 assert.ok(clips.length>=2&&clips.every(t=>t.length<=76));
 assert.equal(clips.join(' '),phrase);assert.ok(sources.length>=3);assert.deepEqual(events,['start','end']);
});
test('V112.62: guia anuncia navegação real e não se sobrepõe a chamadas',()=>{
 const training=read('public/static/js/training.js');
 assert.match(training,/educa:training-view/);assert.match(training,/educa:training-guide/);
 assert.match(access,/addEventListener\('educa:training-view'/);
 assert.match(access,/addEventListener\('educa:training-guide'/);
 assert.match(access,/inFreeMode\(\)\|\|callOrMedia\(\)/);
 assert.match(access,/\['pointerup','touchend','click','keydown'\]/);
 assert.doesNotMatch(training,/new SpeechSynthesisUtterance/);
});
