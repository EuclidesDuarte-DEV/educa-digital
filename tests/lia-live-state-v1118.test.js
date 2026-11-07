import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function element(id){
 const attrs={};const classes=new Set();
 return {id,hidden:false,paused:true,src:'',muted:false,loop:false,playsInline:false,preload:'',textContent:'',value:'',disabled:false,
  classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c)},
  addEventListener(name,cb){this['on_'+name]=cb;},
  setAttribute(k,v){attrs[k]=v;},getAttribute(k){return k==='src'?this.src:attrs[k];},
  removeAttribute(k){if(k==='src')this.src='';else delete attrs[k];},
  querySelector(){return {textContent:''};},
  play(){this.paused=false;return Promise.resolve();},pause(){this.paused=true;},load(){},
 };
}

test('Chamadas reais: áudio controla vídeo falando e ouvindo (sem repetir vídeo durante silêncio)',async()=>{
 const ids=['freeVideoView','freeVideoPortrait','liaPhotoPoster','liaPhotoSpeech','liaPhotoIdle','liaPhotoSpeechNext','liaPhotoIdleNext','liaPhotoIndicator','liaPhotoPlay','liaPhotoConfigure','freeVideoSubtitle','freeVideoState','freeVideoName','freeVideoDuration','freeVideoAnswer','freeVideoHangup','freeVideoMic','freeVideoRepeat','freeVideoCameraToggle','freeVideoCamera','freeVideoSelfPlaceholder','freeVideoForm','freeVideoInput','freeVideoSend','freeVideoActions','freeVideoVerify','freeVideoPix','freeVideoVoiceEngine'];
 const elements=Object.fromEntries(ids.map(id=>[id,element(id)]));
 elements.freeVideoVoiceEngine.value='padrao'; // verifica fallback Chrome solicitado
 let utterance=null;const speech={cancel(){},resume(){},getVoices(){return [{lang:'pt-BR',name:'Microsoft Maria',voiceURI:'maria-test'}]},speak(u){utterance=u}};
 function Utterance(text){this.text=text;}
 const win={speechSynthesis:speech,SpeechSynthesisUtterance:Utterance, EducaFreeMode:{enterVideo(){},videoAccepted(){}},EducaFreeView:{setView(){}}};
 const doc={getElementById:id=>elements[id],addEventListener(){},hidden:false};
 const ctx={window:win,document:doc,SpeechSynthesisUtterance:Utterance,fetch:async()=>({ok:true,json:async()=>({enabled:false})}),setTimeout,clearTimeout,setInterval,clearInterval,Promise,URL,console};
 vm.runInNewContext(readFileSync('public/static/js/lia-female-voice.js','utf8'),ctx);
 vm.runInNewContext(readFileSync('public/static/js/free-video.js','utf8'),ctx);
 win.EducaVideoCall.incoming();
 await elements.freeVideoAnswer['on_click']();
 assert.ok(utterance,'voz foi solicitada');
 utterance.onstart();await Promise.resolve();await Promise.resolve();
 assert.equal(elements.liaPhotoSpeech.hidden,false,'clipe falado visível');
 assert.equal(elements.liaPhotoSpeech.muted,true,'clipe original não solta áudio');
 assert.match(elements.liaPhotoSpeech.src,/lia-conversando-[abc]\.mp4$/);
 assert.ok(elements.freeVideoPortrait.classList.contains('lia-photo-speaking'),'estado falante ativo');
 // V111.31 mantém o estado de fala ao trocar entre frases sintetizadas;
 // só termina depois da última frase da fila.
 for(let i=0;i<12;i++){
  const prev=utterance;prev.onend();
  await Promise.resolve();await Promise.resolve();await new Promise(resolve=>setTimeout(resolve,0));
  if(utterance===prev)break;
  utterance.onstart();await Promise.resolve();await Promise.resolve();
 }
 // Smooth transition: the last talking frame is held until the listening footage starts.
 assert.equal(elements.liaPhotoSpeech.hidden,false,'ultimo quadro de fala preservado durante a transicao');
 await new Promise(resolve=>setTimeout(resolve,470));
 assert.equal(elements.liaPhotoSpeech.hidden,true,'clipe falado oculto apos dissolucao');
 assert.ok(['liaPhotoIdle','liaPhotoIdleNext'].some(id=>!elements[id].hidden&&!elements[id].paused),'um clipe de escuta continua em movimento');
 assert.equal(elements.freeVideoPortrait.classList.contains('lia-photo-speaking'),false);
 win.EducaVideoCall.close();
});
