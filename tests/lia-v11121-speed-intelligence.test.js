import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {escolherModelo,responderModoLivre} from '../src/free-chat.js';
const video=readFileSync('public/static/js/free-video.js','utf8');
const worker=readFileSync('src/worker.js','utf8');
const server=readFileSync('lia_motor/server.py','utf8');
const ps=readFileSync('scripts/windows/INICIAR_LIA_VOZ_HUMANA_WINDOWS.ps1','utf8');
function mockElement(id){
 const classes=new Set();
 return {id,value:'',hidden:true,src:'',duration:3,paused:true,classList:{add:s=>classes.add(s),remove:s=>classes.delete(s),contains:s=>classes.has(s),toggle(s){if(classes.has(s)){classes.delete(s);return false;}classes.add(s);return true;}},
 addEventListener(name,fn){this['on_'+name]=fn;},setAttribute(){},getAttribute(){return null},removeAttribute(){},querySelector(){return null},play(){this.paused=false;return Promise.resolve()},pause(){this.paused=true},load(){},focus(){}};
}
function harness(){
 const ids=['freeVideoView','freeVideoPortrait','liaPhotoPoster','liaPhotoSpeech','liaPhotoIdle','liaPhotoSpeechNext','liaPhotoIdleNext','liaPhotoIndicator','liaPhotoPlay','liaPhotoConfigure','freeVideoSubtitle','freeVideoState','freeVideoName','freeVideoDuration','freeVideoAnswer','freeVideoHangup','freeVideoMic','freeVideoText','freeVideoRepeat','freeVideoCameraToggle','freeVideoCamera','freeVideoSelfPlaceholder','freeVideoForm','freeVideoInput','freeVideoSend','freeVideoActions'];
 const elements=Object.fromEntries(ids.map(id=>[id,mockElement(id)]));
 let recognizer;const sent=[];
 class Recognizer{constructor(){recognizer=this;}start(){this.active=true}stop(){this.active=false}abort(){this.active=false}}
 class Utterance{constructor(text){this.text=text}}
 const window={SpeechRecognition:Recognizer,SpeechSynthesisUtterance:Utterance,
 speechSynthesis:{cancel(){},resume(){},speak(u){this.last=u}},
 EducaLiaVoice:{choose:()=>({name:'Voz Feminina',lang:'pt-BR'})},EducaFreeMode:{enterVideo(){},videoAccepted(){},sendVideo(t){sent.push(t)}},EducaFreeView:{setView(){}}};
 const document={hidden:false,getElementById:id=>elements[id]||null,addEventListener(){}};
 vm.runInNewContext(video,{window,document,SpeechSynthesisUtterance:Utterance,fetch:async()=>({ok:true,json:async()=>({enabled:false})}),setTimeout,clearTimeout,setInterval,clearInterval,Promise,URL,console,Math});
 return {window,elements,sent,getRecognizer:()=>recognizer};
}
test('rápido por padrão e avançado apenas quando escolhido, sem injeção de nomes de modelo',()=>{
 assert.match(escolherModelo({}),/llama-3.1-8b/);
 assert.match(escolherModelo({LIA_AI_MODEL:'inteligente'}),/llama-3.3-70b/);
 assert.match(escolherModelo({LIA_AI_MODEL:'modelo-estranho'}),/llama-3.1-8b/);
});
test('IA avançada recebe histórico e não ignora última pergunta',async()=>{
 const req=new Request('https://educa.example/api/modo-livre/conversar',{method:'POST',headers:{origin:'https://educa.example'},body:JSON.stringify({scenario:'video',message:'Quem é você?',history:[{role:'user',content:'Oi, posso fazer perguntas?'},{role:'assistant',content:'Claro, pode perguntar.'}]})});
 const res=await responderModoLivre(req,{LIA_AI_MODEL:'inteligente',AI:{run:async(m,opts)=>{
 assert.match(m,/70b/);assert.match(opts.messages[0].content,/última pergunta/);assert.equal(opts.messages.at(-1).content,'Quem é você?');
 assert.equal(opts.messages[1].content,'Oi, posso fazer perguntas?');return {response:'Sou a Lia, personagem fictícia desta atividade.'};
 }}});
 assert.equal(res.status,200);
 assert.match((await res.json()).reply,/personagem fictícia/);
});
test('reconhecimento não perde frase parcial no fechamento da escuta',()=>{
 const h=harness();h.window.EducaVideoCall.incoming();h.elements.freeVideoAnswer.on_click();h.elements.freeVideoMic.on_click();
 const r=h.getRecognizer();
 r.onresult({results:[{isFinal:false,0:{transcript:'Você poderia me explicar como verificar identidade?'}}]});
 assert.equal(h.sent.length,0);
 r.onend();
 assert.deepEqual(h.sent,['Você poderia me explicar como verificar identidade?']);
 h.window.EducaVideoCall.close();
});
test('voz neural preaquecerá e vídeo não será representado como fonema exato sem GPU',()=>{
 assert.match(worker,/route==='preload'/);
 assert.match(worker,/POST' && rota === '\/api\/avatar\/preload'/);
 assert.match(server,/warm_female_voice_on_startup/);
 assert.match(ps,/LIA_PREWARM_VOICE/);
 assert.match(video,/VOICE_COMMIT_MS=450/);
 assert.match(video,/startSpeechMotion\(audio,cues\)/);
 assert.match(video,/analyser\.getByteTimeDomainData/);
 assert.match(video,/Sem MuseTalk com GPU.*não fonema a fonema/);
 assert.match(video,/CROSSFADE_MS=420/);
});
test('inicialização protegida pelo Worker não expõe token e só aceita voz válida',async()=>{
 const {default:app}=await import('../src/worker.js');
 const env={LIA_ENABLED:'true',LIA_BACKEND_URL:'https://lia.private.example',LIA_BACKEND_TOKEN:'backend-secret',LIA_STAFF_CODE:'staff-lia-test-strong'};
 const request=(engine)=>new Request('https://educa.example/api/avatar/preload',{method:'POST',headers:{'X-Educa-Lia-Code':'staff-lia-test-strong',Origin:'https://educa.example'},body:JSON.stringify({engine})});
 const old=globalThis.fetch;let count=0;
 globalThis.fetch=async(url,opts)=>{count++;assert.equal(url,'https://lia.private.example/v1/lia/preload?engine=feminina');assert.equal(opts.headers.Authorization,'Bearer backend-secret');return Response.json({ok:true,voice_loaded:true});};
 try{
  const bad=await app.fetch(request('falsa'),env);assert.equal(bad.status,400);assert.equal(count,0);
  const ok=await app.fetch(request('feminina'),env);assert.equal(ok.status,200);assert.equal((await ok.json()).voice_loaded,true);assert.equal(count,1);
  const unauthorized=await app.fetch(new Request('https://educa.example/api/avatar/preload',{method:'POST',body:'{}'}),env);
  assert.equal(unauthorized.status,403);assert.equal(count,1);
 }finally{globalThis.fetch=old;}
});
