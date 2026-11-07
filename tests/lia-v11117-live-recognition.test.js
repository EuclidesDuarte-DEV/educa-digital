import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

function element(id){
 const cls=new Set(), attrs=new Map();
 return {id,hidden:true,value:'',textContent:'',disabled:false,paused:true,src:'',currentTime:0,duration:4,
  classList:{add:c=>cls.add(c),remove:c=>cls.delete(c),contains:c=>cls.has(c),toggle(c,on){if(on===undefined)on=!cls.has(c);on?cls.add(c):cls.delete(c);return on;}},
  getAttribute(k){return k==='src'?this.src:attrs.get(k)},setAttribute:(k,v)=>attrs.set(k,v),removeAttribute(k){if(k==='src')this.src='';},
  addEventListener(evt,cb){this['on_'+evt]=cb;},querySelector(){return {textContent:''};},
  play(){this.paused=false;return Promise.resolve()},pause(){this.paused=true},load(){},focus(){this.focused=true;}
 };
}
function setup(){
 const ids=['freeVideoView','freeVideoPortrait','liaPhotoPoster','liaPhotoSpeech','liaPhotoIdle','liaPhotoSpeechNext','liaPhotoIdleNext','liaPhotoIndicator','liaPhotoPlay','liaPhotoConfigure','freeVideoSubtitle','freeVideoState','freeVideoName','freeVideoDuration','freeVideoAnswer','freeVideoHangup','freeVideoMic','freeVideoText','freeVideoRepeat','freeVideoCameraToggle','freeVideoCamera','freeVideoSelfPlaceholder','freeVideoForm','freeVideoInput','freeVideoSend','freeVideoActions','freeVideoVerify','freeVideoPix','freeVideoCaptionToggle','freeVideoVoiceStyle','freeVideoLatencyMode'];
 const elements=Object.fromEntries(ids.map(id=>[id,element(id)]));
 elements.freeVideoLatencyMode.value='rapida';
 let recognizer, sent=[];
 class Recognition{
  constructor(){recognizer=this;}
  start(){this.active=true;}
  stop(){this.active=false;}
  abort(){this.active=false;}
 }
 function Utterance(text){this.text=text;}
 const speech={cancel(){},resume(){},getVoices(){return[{name:'Maria',lang:'pt-BR'}]},speak(u){this.last=u;}};
 const window={SpeechRecognition:Recognition,speechSynthesis:speech,SpeechSynthesisUtterance:Utterance,EducaLiaVoice:{choose:()=>({name:'Maria',lang:'pt-BR'})},EducaFreeMode:{enterVideo(){},videoAccepted(){},sendVideo(text){sent.push(text)}},EducaFreeView:{setView(){}}};
 const document={hidden:false,getElementById:id=>elements[id]||null,addEventListener(){}};
 vm.runInNewContext(readFileSync('public/static/js/free-video.js','utf8'),{window,document,SpeechSynthesisUtterance:Utterance,fetch:async()=>({ok:true,json:async()=>({enabled:false})}),setTimeout,clearTimeout,setInterval,clearInterval,Promise,URL,console,Math});
 return {elements,window,sent,getRecognizer:()=>recognizer,speech};
}

test('final voice recognition sends one message; interim does not send',async()=>{
 const {elements,window,sent,getRecognizer}=setup();
 window.EducaVideoCall.incoming();elements.freeVideoAnswer.on_click();
 elements.freeVideoMic.on_click();
 const rec=getRecognizer();assert.ok(rec.active);
 rec.onresult({results:[{isFinal:false,0:{transcript:'Posso confirmar'}}]});
 assert.equal(sent.length,0);
 assert.match(elements.freeVideoState.textContent,/Ouvindo/);
 rec.onresult({results:[{isFinal:true,0:{transcript:'Posso confirmar sua identidade?'}}]});
 // V111.19 aguarda um breve silêncio antes de enviar, pois o navegador pode
 // finalizar a primeira oração antes de capturar o restante.
 assert.equal(sent.length,0);
 rec.onspeechend();rec.onend();
 assert.deepEqual(sent,['Posso confirmar sua identidade?']);
 assert.equal(rec.active,false);
 window.EducaVideoCall.close();
});
