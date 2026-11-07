import test from 'node:test';
import assert from 'node:assert/strict';
import {statSync,readFileSync} from 'node:fs';
import vm from 'node:vm';

function el(id){
 const classes=new Set(),attributes={};
 return {id,paused:true,hidden:true,src:'',muted:false,loop:false,currentTime:0,duration:6,disabled:false,textContent:'',value:'',volume:1,
  classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c)},
  getAttribute:k=>k==='src'?null:attributes[k],
  removeAttribute(k){if(k==='src')this.src='';else delete attributes[k];},
  setAttribute(k,v){attributes[k]=v;},
  addEventListener(k,cb){this['on_'+k]=cb;},
  querySelector(){return {textContent:''}},
  play(){this.paused=false;return Promise.resolve()},pause(){this.paused=true},load(){},
 };
}
const flush=()=>new Promise(resolve=>setTimeout(resolve,0));
function testCall(){
 const ids=['freeVideoView','freeVideoPortrait','liaPhotoPoster','liaPhotoSpeech','liaPhotoSpeechNext','liaPhotoIdle','liaPhotoIdleNext','liaPhotoIndicator','liaPhotoPlay','liaPhotoConfigure','freeVideoSubtitle','freeVideoState','freeVideoName','freeVideoDuration','freeVideoAnswer','freeVideoHangup','freeVideoMic','freeVideoRepeat','freeVideoCameraToggle','freeVideoCamera','freeVideoSelfPlaceholder','freeVideoForm','freeVideoInput','freeVideoSend','freeVideoActions','freeVideoVerify','freeVideoPix','freeVideoVoiceEngine'];
 const elements=Object.fromEntries(ids.map(id=>[id,el(id)]));
 elements.freeVideoVoiceEngine.value='padrao'; // teste histórico da alternativa Chrome
 let utterance;
 const speech={cancel(){},resume(){},getVoices(){return [{lang:'pt-BR',name:'Microsoft Maria - Portuguese (Brazil)',voiceURI:'maria-test'}]},speak(u){utterance=u}};
 const window={speechSynthesis:speech,SpeechSynthesisUtterance:function(text){this.text=text;},EducaFreeMode:{enterVideo(){},videoAccepted(){}},EducaFreeView:{setView(){}}};
 const document={hidden:false,getElementById:id=>elements[id]||null,addEventListener(){}};
 vm.runInNewContext(readFileSync('public/static/js/lia-female-voice.js','utf8'),{window,document,SpeechSynthesisUtterance:window.SpeechSynthesisUtterance,fetch:async()=>({ok:true,json:async()=>({enabled:false})}),setInterval,clearInterval,setTimeout,clearTimeout,Promise,URL,console,Math});
 vm.runInNewContext(readFileSync('public/static/js/free-video.js','utf8'),{window,document,SpeechSynthesisUtterance:window.SpeechSynthesisUtterance,fetch:async()=>({ok:true,json:async()=>({enabled:false})}),setInterval,clearInterval,setTimeout,clearTimeout,Promise,URL,console,Math});
 return {window,elements,utterance:()=>utterance};
}
function current(elements,a,b){return [elements[a],elements[b]].find(v=>v.classList.contains('lia-clip-visible'))}
function advance(v){v.currentTime=v.duration-.1;v.ontimeupdate?.();}

test('cada clip de fala alterna antes de terminar sem repetir e sem interromper a voz',async()=>{
 const {window,elements,utterance}=testCall();window.EducaVideoCall.incoming();elements.freeVideoAnswer.on_click();
 const u=utterance();u.onstart();await flush();
 const speechPlayers=['liaPhotoSpeech','liaPhotoSpeechNext'];
 let first=current(elements,...speechPlayers);assert.ok(first,'primeiro MP4 ativo');
 const used=[first.src];
 for(let i=0;i<5;i++){
  advance(first);await flush();
  const next=current(elements,...speechPlayers);
  assert.ok(next&&next!==first, 'outro elemento faz a transição sem preto');
  assert.notEqual(next.src,used.at(-1), 'nunca repete o clipe consecutivo');
  assert.equal(next.muted,true,'o áudio dos clipes permanece mudo');
  used.push(next.src);first=next;
 }
 assert.equal(window.EducaVideoCall.isConnected(),true,'chamada continua conectada');
 assert.equal(elements.freeVideoPortrait.classList.contains('lia-photo-speaking'),true);
 u.onend();await flush();
 await new Promise(resolve=>setTimeout(resolve,470));
 assert.equal(current(elements,...speechPlayers),undefined,'encerra clipes de fala apos dissolucao');
 assert.equal(elements.freeVideoPortrait.classList.contains('lia-photo-speaking'),false);
 window.EducaVideoCall.close();
});

test('modo ouvindo utiliza 3 clipes de boca fechada sem repetição seguida',async()=>{
 for(const name of ['lia-ouvindo.mp4','lia-ouvindo-b.mp4','lia-ouvindo-c.mp4'])assert.ok(statSync('public/static/videos/'+name).size>40_000);
 const {window,elements,utterance}=testCall();window.EducaVideoCall.incoming();elements.freeVideoAnswer.on_click();
 // V111.31: a primeira fala é fracionada para iniciar mais rápido;
 // o estado de escuta só começa depois do último trecho.
 let u=utterance();u.onstart();await flush();
 for(let i=0;i<12;i++){
  u.onend();await flush();
  const next=utterance();
  if(next===u)break;
  u=next;u.onstart();await flush();
 }

 const players=['liaPhotoIdle','liaPhotoIdleNext'];
 let old=current(elements,...players);assert.ok(old,'escuta animada');
 const used=[old.src];
 for(let i=0;i<5;i++){advance(old);await flush();const next=current(elements,...players);assert.ok(next&&next!==old);assert.notEqual(next.src,used.at(-1));used.push(next.src);old=next;}
 window.EducaVideoCall.close();
});
