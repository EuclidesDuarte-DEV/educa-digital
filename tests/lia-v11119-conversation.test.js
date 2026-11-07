import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

function element(id){
 const classes=new Set();
 return {id,hidden:true,value:'',textContent:'',disabled:false,paused:true,src:'',currentTime:0,duration:4,
  classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle(x,on){if(on===undefined)on=!classes.has(x);on?classes.add(x):classes.delete(x);return on;}},
  getAttribute(k){return k==='src'?this.src:''},setAttribute(){},removeAttribute(k){if(k==='src')this.src='';},
  addEventListener(event,callback){this['on_'+event]=callback;},querySelector(){return {textContent:''}},
  play(){this.paused=false;return Promise.resolve()},pause(){this.paused=true},load(){},focus(){}
 };
}
const flush=()=>new Promise(resolve=>setTimeout(resolve,0));
function harness({female=true,frameCallback=false}={}){
 const ids=['freeVideoView','freeVideoPortrait','liaPhotoPoster','liaPhotoSpeech','liaPhotoIdle','liaPhotoSpeechNext','liaPhotoIdleNext','liaPhotoIndicator','liaPhotoPlay','liaPhotoConfigure','freeVideoSubtitle','freeVideoState','freeVideoName','freeVideoDuration','freeVideoAnswer','freeVideoHangup','freeVideoMic','freeVideoText','freeVideoRepeat','freeVideoCameraToggle','freeVideoCamera','freeVideoSelfPlaceholder','freeVideoForm','freeVideoInput','freeVideoSend','freeVideoActions','freeVideoVoiceEngine'];
 const elements=Object.fromEntries(ids.map(id=>[id,element(id)]));
 elements.freeVideoVoiceEngine.value='padrao'; // testa fallback explícito

 const frames=[];
 if(frameCallback){for(const id of ['liaPhotoSpeech','liaPhotoSpeechNext','liaPhotoIdle','liaPhotoIdleNext']){
   elements[id].requestVideoFrameCallback=fn=>{frames.push({id,fn})};
 }}
 let rec,spoken;
 class Recognition {constructor(){rec=this;}start(){}stop(){}abort(){}}
 class Utterance{constructor(text){this.text=text;}}
 const sent=[];
 const window={SpeechRecognition:Recognition,SpeechSynthesisUtterance:Utterance,
  speechSynthesis:{cancel(){},resume(){},speak(u){spoken=u;}},
  EducaLiaVoice:{choose:()=>female?{name:'Maria',lang:'pt-BR'}:null,waitForFemale:()=>Promise.resolve(null)},
  EducaFreeMode:{enterVideo(){},videoAccepted(){},sendVideo(text){sent.push(text);}},EducaFreeView:{setView(){}}};
 const document={hidden:false,getElementById:id=>elements[id]||null,addEventListener(){}};
 vm.runInNewContext(readFileSync('public/static/js/free-video.js','utf8'),{window,document,fetch:async()=>({ok:true,json:async()=>({enabled:false})}),SpeechSynthesisUtterance:Utterance,setInterval,clearInterval,setTimeout,clearTimeout,Promise,URL,Math,console});
 return {window,elements,frames,sent,rec:()=>rec,spoken:()=>spoken};
}

test('V111.19 aguarda pausa e envia frase completa, sem duplicar segmentos finais',async()=>{
 const h=harness();h.window.EducaVideoCall.incoming();h.elements.freeVideoAnswer.on_click();
 h.elements.freeVideoMic.on_click();const rec=h.rec();
 rec.onresult({results:[{isFinal:false,0:{transcript:'Eu preciso saber'}}]});
 assert.equal(h.sent.length,0);
 rec.onresult({results:[{isFinal:true,0:{transcript:'Eu preciso saber'}},{isFinal:false,0:{transcript:'se é golpe'}}]});
 assert.equal(h.sent.length,0);
 rec.onresult({results:[{isFinal:true,0:{transcript:'Eu preciso saber'}},{isFinal:true,0:{transcript:'se é golpe'}}]});
 assert.equal(h.sent.length,0,'não interrompe a pessoa ao receber o primeiro final');
 rec.onspeechend();rec.onend();
 assert.deepEqual(h.sent,['Eu preciso saber se é golpe']);
 rec.onend?.();assert.equal(h.sent.length,1);
 h.window.EducaVideoCall.close();
});

test('V111.19 só mostra novo vídeo após o primeiro quadro decodificado',async()=>{
 const h=harness({frameCallback:true});h.window.EducaVideoCall.incoming();h.elements.freeVideoAnswer.on_click();
 h.spoken().onstart();await flush();
 const speechFrames=h.frames.filter(({id})=>id.startsWith('liaPhotoSpeech'));
 assert.ok(speechFrames.length>=1);
 assert.equal(h.elements.liaPhotoSpeech.classList.contains('lia-clip-visible'),false);
 assert.equal(h.elements.liaPhotoSpeechNext.classList.contains('lia-clip-visible'),false);
 speechFrames[0].fn();await flush();
 assert.ok(h.elements[speechFrames[0].id].classList.contains('lia-clip-visible'));
 h.window.EducaVideoCall.close();
});

test('V111.19 motor feminino padrão e scripts de configuração recuperáveis',()=>{
 const launch=readFileSync('scripts/windows/INICIAR_LIA_VOZ_HUMANA_WINDOWS.ps1','utf8');
 const setup=readFileSync('scripts/windows/CONFIGURAR_LIA_LOCAL_WINDOWS.ps1','utf8');
 const worker=readFileSync('src/worker.js','utf8');
 assert.match(launch,/\$env:LIA_TTS_ENGINE = if \(\$Expressiva\) \{ 'chatterbox' \} else \{ 'kokoro' \}/);
 assert.match(setup,/Credenciais existentes preservadas/);
 assert.match(setup,/Os tokens locais nao coincidem/);
 assert.match(worker,/data\.female_voice_ready\|\|data\.voice_installed/);
});
