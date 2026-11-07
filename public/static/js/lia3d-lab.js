/** Educa+ Digital — V111.0. Laboratório isolado de TalkingHead + Avaturn.
 * Sem acesso remoto à câmera, sem envio do arquivo GLB. Reprodução e renderização no navegador.
 * Simulação com IA sempre identificada. NÃO altera a videochamada V110.9.
 */
const $=id=>document.getElementById(id);
const AVATURN_DEMO='https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@main/avatars/avaturn.glb';
const HEADAUDIO='https://cdn.jsdelivr.net/gh/met4citizen/HeadAudio@main/dist/';
const MAX_GLB=90*1024*1024, MAX_AUDIO=30*1024*1024;
let head=null, detector=null, modelUrl=null, loaded=false, busy=false, lastAudio=null, history=[];
const setStatus=(msg)=>{$('status').textContent=msg;};
const setBusy=(value)=>{busy=value;$('sampleModel').disabled=value;$('modelFile').disabled=value;setControls();};
function setControls(){for(const id of ['demoVoice','stopVoice','headView','upperView','fullView','mood','sendChat','dictate'])$(id).disabled=!loaded||busy;}
function safeError(e){console.error(e);setStatus(`Falha: ${String(e?.message||e).slice(0,200)}. Veja o console e o guia de instalação.`);}
function isGLB(file){return file?.name?.toLowerCase().endsWith('.glb')&&file?.size>20&&file.size<=MAX_GLB;}
async function validateGLB(file){
 if(!isGLB(file))throw new Error('Selecione um .glb válido, com até 90 MB.');
 const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer());
 const magic=String.fromCharCode(...bytes.slice(0,4));
 const version=new DataView(bytes.buffer).getUint32(4,true);
 if(magic!=='glTF'||version!==2)throw new Error('Arquivo GLB inválido: deve ser glTF 2.0.');
}
async function ensureHead(){
 if(head)return head;
 setStatus('Importando motor 3D. É necessária conexão com a internet para as bibliotecas CDN.');
 if(!window.WebGL2RenderingContext)throw new Error('Este navegador não oferece WebGL 2.');
 const {TalkingHead}=await import('talkinghead');
 head=new TalkingHead($('avatarStage'),{
   ttsLang:'pt-BR',lipsyncLang:'en',lipsyncModules:['en'],modelFPS:30,
   cameraView:'upper',avatarIdleEyeContact:.55,avatarSpeakingEyeContact:.8,
   avatarIdleHeadMove:.28,avatarSpeakingHeadMove:.46,modelPixelRatio:1,
   lightAmbientIntensity:2,lightDirectIntensity:26
 });
 return head;
}
async function ensureAudioDetector(){
 if(detector)return detector;
 try{
   const {HeadAudio}=await import('headaudio');
   await head.audioCtx.audioWorklet.addModule(HEADAUDIO+'headworklet.min.mjs');
   detector=new HeadAudio(head.audioCtx,{
     parameterData:{vadGateActiveDb:-43,vadGateInactiveDb:-58,silMode:0,speakerMeanHz:215}
   });
   await detector.loadModel(HEADAUDIO+'model-en-mixed.bin');
   head.audioSpeechGainNode.connect(detector);
   detector.onvalue=(key,value)=>{
     if(head.mtAvatar && head.mtAvatar[key]){
       Object.assign(head.mtAvatar[key],{newvalue:value,needsUpdate:true});
     }
   };
   detector.onstarted=()=>{head.lookAtCamera(400);if(typeof head.playGesture==='function')head.playGesture('side',1.4);};
   head.opt.update=detector.update.bind(detector);
   $('renderStatus').textContent='Visemas por áudio · HeadAudio';
   return detector;
 }catch(e){
   detector=null;
   $('renderStatus').textContent='Áudio sem lip-sync (ver erro)';
   throw new Error('Não foi possível iniciar o HeadAudio: '+String(e?.message||e));
 }
}
async function loadAvatar(url,name,isOwn=false){
 setBusy(true);
 try{
   const current=await ensureHead();
   setStatus('Carregando avatar 3D. Os modelos podem ter dezenas de MB…');
   await current.showAvatar({
     url,body:'F',avatarMood:'neutral',lipsyncLang:'en',ttsLang:'pt-BR',
     avatarSpeakingEyeContact:.85,avatarListeningEyeContact:.7,avatarSpeakingHeadMove:.48,
     baseline:{headRotateX:-.04,eyeBlinkLeft:.12,eyeBlinkRight:.12}
   });
   loaded=true;
   $('modelName').textContent=name+(isOwn?' · arquivo local, não enviado ao servidor':' · modelo de exemplo Avaturn (uso não comercial)');
   $('avatarStage').setAttribute('aria-label','Avatar 3D carregado e pronto para fala');
   $('mood').value='neutral';
   setStatus('Avatar carregado. Iniciando detecção de movimentos da boca…');
   try{await ensureAudioDetector();setStatus('Lia 3D pronta. Clique em "Ouvir frase de teste".');}
   catch(err){setStatus(err.message+' O avatar ainda pode ser movimentado; para lip-sync, corrija esse erro.');}
 }catch(e){loaded=false;safeError(e);}
 finally{setBusy(false);}
}
async function decodeAudio(blob){
 if(!head)throw new Error('Carregue um avatar primeiro.');
 await head.audioCtx.resume();
 const raw=await blob.arrayBuffer();
 return await head.audioCtx.decodeAudioData(raw);
}
async function playAudio(blob,description){
 if(!loaded)throw new Error('Carregue primeiro um avatar 3D.');
 if(!detector)throw new Error('HeadAudio não inicializado. Recarregue a página após verificar a conexão.');
 if(blob.size>MAX_AUDIO)throw new Error('O arquivo de áudio deve ter menos de 30 MB.');
 setStatus('Decodificando o áudio para sincronizar a boca…');
 const buffer=await decodeAudio(blob);
 if(!buffer.length)throw new Error('O arquivo de áudio não tem amostras.');
 lastAudio=blob;
 head.lookAtCamera(700);
 head.speakAudio({audio:buffer},{lipsyncLang:'en',isRaw:true});
 setStatus(`${description} · ${Math.round(buffer.duration)} segundos · sincronizando com HeadAudio.`);
}
async function requestJson(url,opts={}){
 const r=await fetch(url,{cache:'no-store',credentials:'same-origin',...opts});
 let data={};try{data=await r.json();}catch(_){}
 if(!r.ok||!data.ok)throw new Error(data.message||`Servidor retornou HTTP ${r.status}`);
 return data;
}
async function talkWithAI(){
 const content=$('chatInput').value.trim();
 if(!content)return setStatus('Digite uma pergunta para a IA.');
 if(content.length>300)return setStatus('A mensagem deve ter até 300 caracteres.');
 if(/(?:\d[\s.-]?){6,}|https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(content))return setStatus('Não informe CPF, telefone, códigos, links ou dados reais.');
 $('sendChat').disabled=true;
 $('reply').textContent='Consultando a IA do Educa+ Digital…';
 try{
   const data=await requestJson('/api/modo-livre/conversar',{
     method:'POST',headers:{'Content-Type':'application/json'},
     body:JSON.stringify({scenario:'video',message:content,history:history.slice(-6)})
   });
   const answer=String(data.reply||'').slice(0,330);
   history.push({role:'user',content},{role:'assistant',content:answer});history=history.slice(-8);
   $('reply').textContent=answer;
   const code=$('staffCode').value.trim();
   if(!code){setStatus('Resposta da IA recebida em texto. Para fala sincronizada, configure Kokoro e digite o código interno ou use um WAV.');return;}
   setStatus('IA respondeu. Solicitando WAV ao Kokoro privado da equipe…');
   const tts=await requestJson('/api/avatar/speak',{
     method:'POST',headers:{'Content-Type':'application/json','X-Educa-Lia-Code':code},body:JSON.stringify({text:answer.slice(0,450)})
   });
   if(!/^\/api\/avatar\/media\/[a-f0-9]{32}\.wav$/.test(String(tts.audio_url)))throw new Error('URL WAV devolvida é inválida.');
   const wav=await fetch(tts.audio_url,{headers:{'X-Educa-Lia-Code':code},cache:'no-store',credentials:'same-origin'});
   if(!wav.ok)throw new Error('Não foi possível obter o WAV gerado pelo Kokoro.');
   await playAudio(await wav.blob(),'Resposta Kokoro em português brasileiro');
 }catch(e){setStatus('IA ou Kokoro não disponível: '+String(e?.message||e));if($('reply').textContent==='Consultando a IA do Educa+ Digital…')$('reply').textContent='IA indisponível neste ambiente. Use a fala de teste para verificar o avatar.';}
 finally{$('sendChat').disabled=!loaded||busy;}
}
$('sampleModel').addEventListener('click',()=>loadAvatar(AVATURN_DEMO,'Avaturn T2 demonstrativo'));
$('modelFile').addEventListener('change',async(e)=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
   await validateGLB(file);
   const next=URL.createObjectURL(file),prior=modelUrl;
   modelUrl=next;
   await loadAvatar(next,file.name,true);
   if(prior)URL.revokeObjectURL(prior);
 }catch(err){safeError(err);}
});
$('demoVoice').addEventListener('click',async()=>{
 try{
   const r=await fetch('/static/audio/lia3d-demo.wav');if(!r.ok)throw new Error('Áudio de demonstração não encontrado.');
   await playAudio(await r.blob(),'Áudio demonstrativo (voz sintética simples, não é Kokoro)');
 }catch(err){safeError(err);}
});
$('audioFile').addEventListener('change',async(e)=>{
 const file=e.target.files?.[0];if(!file)return;
 try{await playAudio(file,'Áudio importado: '+file.name);}catch(err){safeError(err);}
});
$('headView').addEventListener('click',()=>{head.setView('head');setStatus('Visualização do rosto.');});
$('upperView').addEventListener('click',()=>{head.setView('upper');setStatus('Visualização de busto.');});
$('fullView').addEventListener('click',()=>{head.setView('full');setStatus('Visualização de corpo inteiro.');});
$('mood').addEventListener('change',(e)=>{head.setMood(e.target.value);setStatus('Expressão alterada para: '+e.target.options[e.target.selectedIndex].text+'.');});
$('stopVoice').addEventListener('click',()=>{if(!head)return;try{head.streamStart({lipsyncType:'visemes'});head.streamStop();setStatus('Fila de áudio interrompida.');}catch(e){safeError(e);}});
$('sendChat').addEventListener('click',talkWithAI);
$('dictate').addEventListener('click',()=>{
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Recognition)return setStatus('Reconhecimento de voz não suportado neste navegador. Digite a pergunta.');
 try{
   const r=new Recognition();r.lang='pt-BR';r.interimResults=false;r.continuous=false;
   r.onresult=e=>{const text=e.results?.[0]?.[0]?.transcript||'';$('chatInput').value=text.slice(0,300);setStatus('Fala reconhecida. Clique em "Enviar à IA".');};
   r.onerror=()=>setStatus('Não foi possível reconhecer sua fala. Use o teclado.');r.start();
   setStatus('Reconhecimento ativado pelo navegador. Diga uma pergunta curta.');
 }catch(e){safeError(e);}
});
window.addEventListener('pagehide',()=>{if(modelUrl)URL.revokeObjectURL(modelUrl);});
setControls();
