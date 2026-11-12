import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

function makeElement(id){
  const attrs=new Map(), cls=new Set();
  return {id,hidden:true,textContent:'',value:'',disabled:false,paused:true,src:'',classList:{add:x=>cls.add(x),remove:x=>cls.delete(x),toggle(x){if(cls.has(x)){cls.delete(x);return false;}cls.add(x);return true;},contains:x=>cls.has(x)},
   addEventListener(event,cb){this['on_'+event]=cb;},setAttribute:(a,b)=>attrs.set(a,b),getAttribute:a=>attrs.get(a),removeAttribute(){},querySelector(){return {textContent:''};},play(){this.paused=false;return Promise.resolve();},pause(){this.paused=true;},load(){},focus(){this.focused=true;}};
}
function makeApp(){
 const ids=['freeVideoView','freeVideoPortrait','liaPhotoPoster','liaPhotoSpeech','liaPhotoIdle','liaPhotoSpeechNext','liaPhotoIdleNext','liaPhotoIndicator','liaPhotoPlay','liaPhotoConfigure','freeVideoSubtitle','freeVideoState','freeVideoName','freeVideoDuration','freeVideoAnswer','freeVideoHangup','freeVideoMic','freeVideoText','freeVideoRepeat','freeVideoCameraToggle','freeVideoCamera','freeVideoSelfPlaceholder','freeVideoForm','freeVideoInput','freeVideoSend','freeVideoActions','freeVideoVerify','freeVideoPix','freeVideoMore','freeVideoCaptionToggle','freeVideoVoiceSettings','freeVideoVoiceEngine'];
 const els=Object.fromEntries(ids.map(i=>[i,makeElement(i)]));
 els.freeVideoVoiceEngine.value='padrao'; // testa fallback explícito

 let utterance;
 function SpeechSynthesisUtterance(t){this.text=t;}
 const window={speechSynthesis:{getVoices:()=>[],cancel(){},resume(){},speak(u){utterance=u;}},SpeechSynthesisUtterance,EducaLiaVoice:{choose:()=>({lang:'pt-BR',name:'Maria'}),waitForFemale:()=>Promise.resolve(null)},EducaFreeMode:{enterVideo(){},videoAccepted(){}},EducaFreeView:{setView(){}}};
 const document={hidden:false,getElementById:id=>els[id]||null,addEventListener(){}};
 vm.runInNewContext(readFileSync('public/static/js/free-video.js','utf8'),{window,document,SpeechSynthesisUtterance,fetch:async()=>({ok:true,json:async()=>({enabled:false})}),setInterval,clearInterval,setTimeout,clearTimeout,Promise,URL,console,Math});
 return {window,els,voice:()=>utterance};
}

test('Legenda da Lia não antecipa a resposta antes da reprodução de voz',async()=>{
 const {window,els,voice}=makeApp();
 window.EducaVideoCall.incoming();els.freeVideoAnswer.on_click();
 assert.match(els.freeVideoSubtitle.textContent,/preparando a fala/i);
 const intro=voice();assert.ok(intro);
 assert.doesNotMatch(els.freeVideoSubtitle.textContent,/trezentos e cinquenta reais/);
 intro.onstart();
 assert.equal(els.freeVideoSubtitle.textContent,intro.text);
 assert.match(intro.text,/Oi[,!] sou a Lia/i);
 intro.onend();
 window.EducaVideoCall.addLine('user','Posso verificar antes?');
 window.EducaVideoCall.addLine('assistant','Pode verificar por outro meio.');
 assert.equal(els.freeVideoSubtitle.textContent,'Você: Posso verificar antes?');
 window.EducaVideoCall.reply('Pode verificar por outro meio.');
 assert.match(els.freeVideoSubtitle.textContent,/preparando a fala/i);
 voice().onstart();
 assert.equal(els.freeVideoSubtitle.textContent,'Pode verificar por outro meio.');
 window.EducaVideoCall.close();
});

test('Teclado fica recolhido e aparece apenas após tocar Digitar',()=>{
 const {window,els}=makeApp();
 window.EducaVideoCall.incoming();els.freeVideoAnswer.on_click();
 assert.equal(els.freeVideoForm.hidden,true);
 els.freeVideoText.on_click();assert.equal(els.freeVideoForm.hidden,false);
 assert.equal(els.freeVideoInput.focused,true);
 els.freeVideoText.on_click();assert.equal(els.freeVideoForm.hidden,true);
 window.EducaVideoCall.close();
});
