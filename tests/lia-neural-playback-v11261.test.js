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
 window.EducaLiaNeuralPlayback.stop('guide');finish({blob:{size:2048}});
 assert.equal(await result,false);assert.equal(media,0);
});
