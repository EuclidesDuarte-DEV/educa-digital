/**
 * Educa+ Digital V111.25: VÍDEO FOTO-REAL COM ESTADOS DE ESCUTA E FALA (sem mesh 3D/cartoon).
 * Workers AI responde ao aluno via free-mode.js. O texto é sintetizado por
 * Kokoro e o WAV serve como entrada do MuseTalk: cada MP4 corresponde à fala
 * efetivamente gerada quando MuseTalk está ativo. Sem GPU, há fallback de voz e vídeos gravados acionados pela fala (sem sincronia labial exata).
 * Kokoro remoto opcional requer gateway autorizado; MuseTalk continua opcional.
 */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const ui={view:$('freeVideoView'),portrait:$('freeVideoPortrait'),portraitStill:$('liaPhotoPoster'),portraitVideo:$('liaPhotoSpeech'),portraitIdle:$('liaPhotoIdle'),portraitIdleNext:$('liaPhotoIdleNext'),portraitVideoNext:$('liaPhotoSpeechNext'),indicator:$('liaPhotoIndicator'),play:$('liaPhotoPlay'),setup:$('liaPhotoConfigure'),subtitle:$('freeVideoSubtitle'),state:$('freeVideoState'),name:$('freeVideoName'),duration:$('freeVideoDuration'),answer:$('freeVideoAnswer'),hang:$('freeVideoHangup'),mic:$('freeVideoMic'),text:$('freeVideoText'),repeat:$('freeVideoRepeat'),camera:$('freeVideoCameraToggle'),video:$('freeVideoCamera'),selfPlaceholder:$('freeVideoSelfPlaceholder'),form:$('freeVideoForm'),input:$('freeVideoInput'),send:$('freeVideoSend'),actions:$('freeVideoActions')};
// O tamanho relevante é o retângulo do Android simulado, não window.innerWidth.
// Isso corrige notebook de 1920px com telefone de 300px e rotação no iPhone.
function syncLiaCallLayout(){
 if(!ui.view||typeof ui.view.getBoundingClientRect!=='function')return;
 const rect=ui.view.getBoundingClientRect();
 if(rect.width<120||rect.height<180)return;
 ui.view.dataset.liaLayout=rect.width<=330?'compact':rect.width<=430?'regular':'wide';
 ui.view.dataset.liaShort=String(rect.height<620);
 document.body?.classList.toggle('lia-call-visible',ui.view.classList.contains('is-active'));
}
if(ui.view){
 if(typeof ResizeObserver==='function'){
  const liaCallResizeObserver=new ResizeObserver(syncLiaCallLayout);
  liaCallResizeObserver.observe(ui.view);
 }
 if(typeof window.addEventListener==='function'){
  window.addEventListener('resize',syncLiaCallLayout,{passive:true});
  window.addEventListener('orientationchange',syncLiaCallLayout,{passive:true});
 }
 if(typeof window.requestAnimationFrame==='function')window.requestAnimationFrame(syncLiaCallLayout);
}
const session={speechQueue:[],prefetched:null,voiceProgressTimer:null,health:null,active:false,connected:false,waiting:false,micEnabled:false,rec:null,stream:null,utterance:null,interval:null,listenTimer:null,voiceStartTimer:null,clock:0,serial:0,renderAbort:null,mediaUrl:null,teamCode:'',renderReady:false,lastSpoken:'',motionSerial:-1,talkTurn:0,motorPending:null,fastVoiceSerial:-1,voiceChoiceDoneSerial:-1,hqVoiceEnabled:false,hqVoiceChoiceSerial:-1,hqVoiceFailedSerial:-1,hqVoiceCheck:null,hqAbort:null,hqVoiceLastError:'',webAudioGain:null};
const free=()=>window.EducaFreeMode;
const status=t=>{if(ui.state)ui.state.textContent=t;};
const voiceProgress=$('freeVideoVoiceProgress');
function showVoiceProgress(message){
 if(!voiceProgress)return;
 const value=String(message||'').trim();
 voiceProgress.hidden=!value;
 voiceProgress.textContent=value.slice(0,92);
}
function stopVoiceProgress(){
 clearInterval(session.voiceProgressTimer);session.voiceProgressTimer=null;
 showVoiceProgress('');
}
// Pequenos trechos iniciam o áudio antes de uma resposta inteira ser sintetizada.
// O Kokoro no CPU local é deliberadamente sequencial: não saturar memória do aluno.
function speechSegments(text){
 const parts=(String(text||'').match(/[^.!?]+[.!?]?/g)||[]).map(t=>t.trim()).filter(Boolean);
 const out=[];let buffer='';
 // V111.91: dizer a saudação curta primeiro; quando o Kokoro já estiver
 // quente, apenas ~15 caracteres precisam ser sintetizados para começar.
 // Não repetir trechos nem trocar o texto original do personagem.
 if(parts.length>1&&parts[0].length<=42)out.push(parts.shift());
 const flush=()=>{if(buffer){out.push(buffer);buffer='';}};
 // O início deve ser curto; depois usamos frases inteiras para reduzir inferências.
 for(const part of parts){
  // Web com Kokoro aquecido: primeira frase curta = menos amostras até o 1º som.
  // Nas plataformas nativas preservamos exatamente a segmentação anterior.
  const web=typeof document!=='undefined'&&document.documentElement?.dataset?.educaPlatform==='web';
  const limit=out.length===0?(web?66:95):105;
  if(buffer&&buffer.length+part.length+1<=limit){buffer+=' '+part;continue;}
  flush();
  let rest=part;
  while(rest.length>limit){
   let split=rest.lastIndexOf(' ',limit);
   if(split<25)split=limit;
   out.push(rest.slice(0,split).trim());rest=rest.slice(split).trim();
  }
  buffer=rest;
 }
 flush();return out;
}
const captionToggle=$('freeVideoCaptionToggle');
const speaker=$('freeVideoSpeaker'),captionSwitch=$('freeVideoCaptionsSwitch'),expand=$('freeVideoExpand');
const voiceStyle=$('freeVideoVoiceStyle'),voiceEngine=$('freeVideoVoiceEngine'),latencyMode=$('freeVideoLatencyMode');
let allowRecoveredNeural=false;
const selectedEngine=()=>{
 if(voiceEngine?.value==='gratuita')return 'gratuita';
 // A plataforma já está definida pelo script síncrono no <head>.
 // Mesmo se houver atraso no DOM, nunca rotear WEB para Roberta por padrão.
 if(document.documentElement?.dataset?.educaPlatform==='web')
  return voiceEngine?.value==='padrao'?'padrao':'gratuita';
 return voiceEngine?.value==='padrao'?'padrao':'feminina';
};
// Web V112.01: no anúncio da voz, descrever o fallback real sem prometer
// Kokoro em dispositivos onde o modelo ainda não foi preparado.
if(voiceEngine?.options?.length&&window.EducaLiaFreeNeural){
 // O motor neural leve é compartilhado pela interface hospedada.
 voiceEngine.querySelector('option[value="feminina"]')?.remove();
 const device=voiceEngine.querySelector('option[value="padrao"]');
 if(device)device.textContent='Voz alternativa do aparelho (opcional)';
 if(!voiceEngine.querySelector('option[value="gratuita"]')){
  const freeOption=document.createElement('option');freeOption.value='gratuita';
  freeOption.textContent='Dora · voz neural gratuita brasileira';
  voiceEngine.insertBefore(freeOption,voiceEngine.options[0]||null);
 }
 voiceEngine.value='gratuita';
 // V112.24: modo de memória limita decoders, não o timbre.
}
const lipSyncWaitMs=()=>latencyMode?.value==='sinc' ? 40000 : 1100;
const selectedStyle=()=>['natural','calma','clara'].includes(voiceStyle?.value)?voiceStyle.value:'natural';
let outputMuted=false;
 const webNeuralPlayback=()=>document.documentElement?.dataset?.educaPlatform==='web'&&
  !document.documentElement?.dataset?.educaNativePlatform&&selectedEngine()==='gratuita';
 const lightNeuralVisual=()=>webNeuralPlayback()&&!!window.EducaLiaWarm?.isMemorySensitive?.();
 let introNeural=null,introFlight=null;
 const INTRO_FIRST='Oi, sou a Lia.';
 function prepareIntroNeural(){
  if(!webNeuralPlayback()||introNeural||!window.EducaLiaFreeNeural)return;
  if(lightNeuralVisual()){
   cancelTransitions();stopGroup(talkPlayers,true);stopGroup(idlePlayers,true);
   motion.talkActive=null;motion.idleActive=null;
   if(ui.portraitStill)ui.portraitStill.hidden=false;
  }
  const local=window.EducaLiaFreeNeural;
  const speed=selectedStyle()==='calma'?.96:selectedStyle()==='clara'?1.0:1.05;
  const entry={speed,promise:null,used:false};introNeural=entry;
  window.EducaLiaWarm?.beginSpeech?.();
  // Uma síntese por vez: não acumular alocações ONNX se a chamada for interrompida.
  entry.promise=Promise.resolve(introFlight).then(()=>local.prepare())
   .then(()=>introNeural===entry||entry.used?local.speak(INTRO_FIRST,{speed}):null)
   .catch(()=>null).finally(()=>{if(introNeural===entry&&!session.connected)window.EducaLiaWarm?.endSpeech?.();});
  introFlight=entry.promise;
  entry.promise.finally(()=>{if(introFlight===entry.promise)introFlight=null;});
 }
const subtitle=t=>{
 if(!ui.subtitle)return;
 ui.subtitle.textContent=t;
 ui.subtitle.classList.remove('v112-caption-expanded');
 if(captionToggle){captionToggle.hidden=String(t).length<=82;captionToggle.textContent='Ler tudo';captionToggle.setAttribute('aria-expanded','false');}
};
captionToggle?.addEventListener('click',()=>{
 const expanded=ui.subtitle.classList.toggle('v112-caption-expanded');
 captionToggle.textContent=expanded?'Recolher':'Ler tudo';
 captionToggle.setAttribute('aria-expanded',String(expanded));
});
const indicator=t=>{if(ui.indicator)ui.indicator.textContent=t;};
function stopRecognition(){let r=session.rec;session.rec=null;if(r)try{r.onend=null;r.onresult=null;r.onerror=null;r.abort();}catch(_){} }
function stopCamera(){session.stream?.getTracks().forEach(t=>t.stop());session.stream=null;if(ui.video){ui.video.srcObject=null;ui.video.hidden=true;}if(ui.selfPlaceholder)ui.selfPlaceholder.hidden=false;ui.camera?.setAttribute('aria-pressed','false');if(ui.camera){ui.camera.setAttribute('aria-label','Ligar câmera');ui.camera.title='Ligar câmera';}}
// Os vídeos do modo econômico são silenciosos e ilustrativos. O áudio da IA é
// independente; MuseTalk (quando ativo) continua usando o MP4 neural próprio.
const talkClips=Object.freeze([
 '/static/videos/lia-conversando-a.mp4',
 '/static/videos/lia-conversando-b.mp4',
 '/static/videos/lia-conversando-c.mp4'
]);
const idleClips=Object.freeze([
 '/static/videos/lia-ouvindo.mp4',
 '/static/videos/lia-ouvindo-b.mp4',
 '/static/videos/lia-ouvindo-c.mp4'
]);
const talkPlayers=[ui.portraitVideo,ui.portraitVideoNext].filter(Boolean);
const idlePlayers=[ui.portraitIdle,ui.portraitIdleNext].filter(Boolean);
const motion={talkActive:null,idleActive:null,lastTalk:-1,lastIdle:-1,talking:false,epoch:0,hideTimers:new Set()};
const CROSSFADE_MS=420; // A/B dissolve: the old frame stays until the next video is playing.
const PRELOAD_BEFORE_END_SECONDS=0.72;
const VOICE_COMMIT_MS=450; // plataformas nativas preservadas; a Web usa 320 ms
const BROWSER_KOKORO_READY_BUDGET_MS=7000;
const BROWSER_KOKORO_WARM_BUDGET_MS=9000;
const TTS_FIRST_RESPONSE_TIMEOUT_MS=25000; // tolera Kokoro remoto em CPU, sem espera infinita
const MOTOR_CHECK_TIMEOUT_MS=900; // não trocar prematuramente a voz neural pelo Chrome
// Escolha não repetitiva entre N clipes: N>1 garante que o consecutivo difere.
function nextClip(clips,previous){
 if(clips.length===1)return 0;
 const offset=Math.floor(Math.random()*(clips.length-1))+1;
 return previous<0?Math.floor(Math.random()*clips.length):(previous+offset)%clips.length;
}
function cancelTransitions(){
 for(const timer of motion.hideTimers)clearTimeout(timer);
 motion.hideTimers.clear();motion.epoch++;
}
function stopPlayer(v,clearSource=false){
 if(!v)return;
 v.onended=null;v.ontimeupdate=null;v.onerror=null;v.onplaying=null;
 v.pause();v.classList.remove('lia-clip-visible');v.hidden=true;v.loop=false;
 if(clearSource&&(typeof v.hasAttribute!=='function'||v.hasAttribute('src'))){v.removeAttribute('src');v.load();}
}
function stopGroup(players,clearSource=false){for(const v of players)stopPlayer(v,clearSource);}
function moveTo(kind){
 const talking=kind==='talk';
 // WebKit: um único clipe original durante a fala; nenhum vídeo durante
 // inferência ou escuta. Sem crossfade, pré-decodificação ou troca de src.
 if(lightNeuralVisual()){
  if(!session.active||!session.connected)return;
  if(!talking){
   stopGroup(talkPlayers,true);stopGroup(idlePlayers,true);
   motion.talkActive=null;motion.idleActive=null;
   ui.portrait?.classList.remove('lia-photo-speaking');
   if(ui.portraitStill)ui.portraitStill.hidden=false;
   return;
  }
  const target=talkPlayers[0];if(!target)return;
  if(motion.talkActive===target)return;
  stopGroup(idlePlayers,true);stopGroup(talkPlayers.slice(1),true);
  const token=motion.epoch,serial=session.serial;
  motion.talkActive=target;target.muted=true;target.playsInline=true;
  target.preload='none';target.loop=true;target.hidden=false;
  target.src=talkClips[0];
  const valid=()=>motion.epoch===token&&session.serial===serial&&motion.talking&&session.connected;
  const show=()=>{if(!valid())return;target.classList.add('lia-clip-visible');ui.portrait?.classList.add('lia-photo-speaking');if(ui.portraitStill)ui.portraitStill.hidden=true;};
  target.onerror=()=>{if(valid()){stopPlayer(target,true);motion.talkActive=null;if(ui.portraitStill)ui.portraitStill.hidden=false;}};
  Promise.resolve(target.play()).then(show).catch(()=>{if(valid()){stopPlayer(target,true);motion.talkActive=null;if(ui.portraitStill)ui.portraitStill.hidden=false;}});
  return;
 }
 if(!session.active||!session.connected|| (talking&&!motion.talking))return;
 const allPlayers=talking?talkPlayers:idlePlayers;
 const players=window.EducaLiaWarm?.isMemorySensitive?.()?allPlayers.slice(0,1):allPlayers;
 const clips=talking?talkClips:idleClips;
 if(!players.length)return;
 const key=talking?'talkActive':'idleActive',lastKey=talking?'lastTalk':'lastIdle';
 const previous=motion[key];
 // Os elementos alternam; não substituímos src de um vídeo ainda visível.
 const target=players.find(p=>p!==previous)||players[0];
 const clipIndex=nextClip(clips,motion[lastKey]);
 motion[lastKey]=clipIndex;
 const source=clips[clipIndex],token=motion.epoch,serial=session.serial;
 target.onended=null;target.ontimeupdate=null;
 target.muted=true;target.volume=0;target.playsInline=true;target.loop=false;target.preload=window.EducaLiaWarm?.isMemorySensitive?.()?'metadata':'auto';
 target.classList.remove('lia-clip-visible');target.hidden=false;
 if(target.getAttribute('src')!==source){target.src=source;target.load();}
 try{target.currentTime=0;}catch(_){}
 const isCurrent=()=>motion.epoch===token&&session.serial===serial&&session.active&&session.connected&&
  (talking?motion.talking:!motion.talking);
 const transition=()=>{
  if(!isCurrent()){target.pause();return;}
  motion[key]=target;
  target.classList.add('lia-clip-visible');
  if(talking)ui.portrait?.classList.add('lia-photo-speaking');
  if(ui.portraitStill)ui.portraitStill.hidden=true;
  if(talking){
   // Never stop the listening footage until talking video has an actual frame.
   for(const idle of idlePlayers)idle.classList.remove('lia-clip-visible');
   const timer=setTimeout(()=>{
     motion.hideTimers.delete(timer);
     if(motion.talking){for(const idle of idlePlayers){idle.pause();idle.hidden=true;}}
   },CROSSFADE_MS);
   motion.hideTimers.add(timer);
  }else{
   // Keep the last talking frame visible while the listening clip starts.
   for(const talk of talkPlayers)talk.classList.remove('lia-clip-visible');
   ui.portrait?.classList.remove('lia-photo-speaking');
   const timer=setTimeout(()=>{
     motion.hideTimers.delete(timer);
     if(!motion.talking){
       stopGroup(talkPlayers,true);motion.talkActive=null;
       if(session.mediaUrl){URL.revokeObjectURL(session.mediaUrl);session.mediaUrl=null;}
     }
   },CROSSFADE_MS);
   motion.hideTimers.add(timer);
  }
  if(previous&&previous!==target){
   previous.classList.remove('lia-clip-visible');
   const timer=setTimeout(()=>{
    motion.hideTimers.delete(timer);
    if(motion[key]!==previous){previous.pause();previous.hidden=true;}
   },CROSSFADE_MS);
   motion.hideTimers.add(timer);
  }
 };
 let advanced=false;
 function advance(){
  if(advanced||!isCurrent()||motion[key]!==target)return;
  advanced=true;moveTo(kind);
 }
 target.onended=advance;
 target.ontimeupdate=()=>{
  // Inicia o próximo vídeo antes do último quadro, com fade curto.
  if(Number.isFinite(target.duration)&&target.duration>0&&target.currentTime>=target.duration-PRELOAD_BEFORE_END_SECONDS)advance();
 };
 target.onerror=()=>{
  if(!isCurrent())return;
  target.pause();target.hidden=true;
  // Falha de mídia não cancela a voz e não provoca uma recursão infinita.
  if(talking)status('A voz continua; um gesto de vídeo não pôde ser carregado.');
  if(ui.portraitStill)ui.portraitStill.hidden=false;
 };
 const started=target.play();
 Promise.resolve(started).then(()=>{
  if(!isCurrent())return;
  // requestVideoFrameCallback waits for a REAL decoded video frame. It avoids
  // fading to a black first frame on slower notebooks. Older browsers use
  // the play() promise just as in V111.18.
  if(typeof target.requestVideoFrameCallback==='function'){
   let finished=false;
   const fallback=setTimeout(()=>{if(!finished){finished=true;transition();}},800);
   try{target.requestVideoFrameCallback(()=>{
    if(finished)return;finished=true;clearTimeout(fallback);transition();
   });}catch(_){clearTimeout(fallback);finished=true;transition();}
  }else transition();
 }).catch(()=>{
  if(!isCurrent())return;
  target.pause();target.hidden=true;
  if(!previous&&ui.portraitStill)ui.portraitStill.hidden=false;
  if(talking)status('O navegador bloqueou o vídeo. A voz permanece disponível.');
 });
}
function idleMotion(){
 if(!session.active||!session.connected){stopGroup(idlePlayers);motion.idleActive=null;if(ui.portraitStill)ui.portraitStill.hidden=false;return;}
 if(motion.talking)return;
 if(motion.idleActive&&!motion.idleActive.paused&&motion.idleActive.classList.contains('lia-clip-visible'))return;
 moveTo('idle');
}
function toListening(){
 cancelTransitions();motion.talking=false;session.motionSerial=-1;
 // Don't clear the speaking clip yet: it fades OUT only when listening is ready.
 idleMotion();
}
function referenceMotion(){
 if(!session.active||!session.connected||!talkPlayers.length)return;
 if(motion.talking&&session.motionSerial===session.serial)return;
 cancelTransitions();motion.talking=true;session.motionSerial=session.serial;
 stopGroup(talkPlayers);motion.talkActive=null;
 // Listening stays visible under speaking until the next player is playing.
 moveTo('talk');
}
// No modo sem GPU, a energia do próprio WAV controla o ritmo dos clipes de
// fala. Isso aproxima o movimento da voz REAL; não inventa sincronização de fonemas.
const speechMotion={context:null,source:null,analyser:null,data:null,frame:null,playing:false,level:0,cues:[],cueIndex:0,silentSince:null};
function stopSpeechMotion(){
 speechMotion.playing=false;
 if(speechMotion.frame!=null){if(typeof cancelAnimationFrame==='function')cancelAnimationFrame(speechMotion.frame);else clearTimeout(speechMotion.frame);}
 speechMotion.frame=null;speechMotion.level=0;speechMotion.cues=[];speechMotion.cueIndex=0;speechMotion.silentSince=null;
 if(ui.portrait?.dataset)delete ui.portrait.dataset.viseme;
 for(const player of talkPlayers)player.playbackRate=1;
 try{speechMotion.source?.disconnect();speechMotion.analyser?.disconnect();}catch(_){}
 speechMotion.source=null;speechMotion.analyser=null;speechMotion.data=null;
}
function primeSpeechMotion(){
 if(!webNeuralPlayback()&&window.EducaLiaWarm?.isMemorySensitive?.())return;
 // Executar somente no clique que inicia a chamada: alguns navegadores bloqueiam
 // AudioContext criado após fetch(), e isso poderia silenciar o áudio da Lia.
 const Context=window.AudioContext||window.webkitAudioContext;
 if(!Context)return;
 try{
  const context=speechMotion.context||new Context();speechMotion.context=context;
  if(context.state!=='running')void context.resume().catch(()=>{});
   if(webNeuralPlayback()&&!speechMotion.unlocked){
    const silent=context.createBufferSource();
    silent.buffer=context.createBuffer(1,1,context.sampleRate);
    silent.connect(context.destination);silent.onended=()=>{try{silent.disconnect();}catch(_){}};
    silent.start(0);speechMotion.unlocked=true;
   }
 }catch(_){}
}
function startSpeechMotion(audio,cues=[]){
 stopSpeechMotion();
 if(lightNeuralVisual()){
  referenceMotion();
  return true;
 }
 if(window.EducaLiaWarm?.isMemorySensitive?.())return false;
 speechMotion.cues=Array.isArray(cues)?cues.filter(c=>Number.isInteger(c?.at_ms)&&c.at_ms>=0&&c.at_ms<=60000&&/^(rest|m|fv|ah|ee|oh|oo|wide)$/.test(c.shape)).slice(0,160):[];
 const context=speechMotion.context;
 // Nunca redirecionar um elemento HTMLMediaElement para um contexto suspenso:
 // nesse caso mantemos a reprodução nativa e apenas os vídeos ilustrativos.
 if(!context||context.state!=='running'||!audio||typeof requestAnimationFrame!=='function')return false;
 try{
  const source=context.createMediaElementSource(audio),analyser=context.createAnalyser();
  analyser.fftSize=512;analyser.smoothingTimeConstant=.68;
  source.connect(analyser);analyser.connect(context.destination);
  speechMotion.source=source;speechMotion.analyser=analyser;
  speechMotion.data=new Uint8Array(analyser.fftSize);speechMotion.playing=true;
  let last=0;
  function step(now){
   if(!speechMotion.playing)return;
   if(now-last>=55){
    last=now;analyser.getByteTimeDomainData(speechMotion.data);
    let sum=0;for(const value of speechMotion.data){const v=(value-128)/128;sum+=v*v;}
    const rms=Math.sqrt(sum/speechMotion.data.length);
    // Follow actual Kokoro IPA order when supplied. Boundaries are estimated,
    // so never claim this animates exact phonemes on the existing MP4 avatar.
    const elapsed=Math.round((audio.currentTime||0)*1000);
    while(speechMotion.cueIndex+1<speechMotion.cues.length&&speechMotion.cues[speechMotion.cueIndex+1].at_ms<=elapsed)speechMotion.cueIndex++;
    if(ui.portrait?.dataset&&speechMotion.cues.length)ui.portrait.dataset.viseme=rms<.008?'rest':speechMotion.cues[speechMotion.cueIndex].shape;
    const energy=Math.max(0,Math.min(1,(rms-.012)*10));
    speechMotion.level+=((energy>speechMotion.level)?.36:.18)*(energy-speechMotion.level);
    // Voice activity from actual Kokoro audio: during a sustained silence,
    // show listening/closed-mouth footage. Resume talking only on audible sound.
    // This is NOT phoneme-accurate animation of the pre-recorded clip.
    if(rms<.008){
     if(speechMotion.silentSince===null)speechMotion.silentSince=now;
     if(now-speechMotion.silentSince>230&&motion.talking)toListening();
    }else{
     speechMotion.silentSince=null;
     if(rms>.015&&!motion.talking&&session.utterance===audio)referenceMotion();
    }
    // Modulação discreta: nunca alterar o áudio nem acelerar o MP4 neural.
    for(const player of talkPlayers){if(player!==session.utterance)player.playbackRate=.88+speechMotion.level*.28;}
   }
   speechMotion.frame=requestAnimationFrame(step);
  }
  speechMotion.frame=requestAnimationFrame(step);return true;
 }catch(_){stopSpeechMotion();return false;}
}
function clearMedia(){
 stopSpeechMotion();cancelTransitions();motion.talking=false;motion.talkActive=null;
 stopGroup(talkPlayers,true);
 ui.portrait?.classList.remove('lia-photo-speaking');
 session.motionSerial=-1;
 if(ui.play)ui.play.hidden=true;
 if(session.mediaUrl){URL.revokeObjectURL(session.mediaUrl);session.mediaUrl=null;}
 idleMotion();
}
function abortSpeech(){
 window.EducaLiaWarm?.endSpeech?.();
 session.serial++;session.speechQueue=[];session.prefetched=null;session.fastVoiceSerial=-1;session.voiceChoiceDoneSerial=-1;stopVoiceProgress();clearTimeout(session.voiceStartTimer);session.voiceStartTimer=null;
 session.renderAbort?.abort();session.renderAbort=null;
 session.hqAbort?.abort();session.hqAbort=null;session.hqVoiceChoiceSerial=-1;session.hqVoiceFailedSerial=-1;
 try{session.utterance?.stop?.();}catch(_){} // AudioBufferSourceNode WebAudio (Safari)
 session.utterance?.pause?.();session.utterance=null;session.webAudioGain=null;window.speechSynthesis?.cancel();clearMedia();
}
function setHandsFree(v){session.micEnabled=!!v;ui.mic?.setAttribute('aria-pressed',String(!!v));if(ui.mic){ui.mic.setAttribute('aria-label',v?'Desativar microfone':'Ativar microfone para conversar');ui.mic.title=v?'Desativar microfone':'Ativar microfone para conversar';}const tag=ui.mic?.querySelector('.v110-mic-label');if(tag)tag.textContent=v?'Desativar':'Conversar';if(!v){clearTimeout(session.listenTimer);session.listenTimer=null;stopRecognition();}}
function scheduleListen(ms=260){clearTimeout(session.listenTimer);if(session.micEnabled&&session.active&&session.connected&&!session.waiting&&!session.utterance&&!document.hidden)session.listenTimer=setTimeout(listen,ms);}
function completed(){
 clearTimeout(session.voiceStartTimer);session.voiceStartTimer=null;
 session.utterance=null;session.webAudioGain=null;stopSpeechMotion();
 // A próxima frase começa automaticamente, sem pedir outra interação do aluno.
 if(session.active&&session.connected&&session.speechQueue.length){
  const next=session.speechQueue.shift(),serial=session.serial;
  showVoiceProgress('LIA: iniciando a próxima frase…');
  toListening();
  void Promise.resolve().then(()=>{
   if(serial===session.serial&&session.active&&session.connected)startSpeechChunk(next,serial);
  });
  return;
 }
 stopVoiceProgress();
 // Smooth fade speech -> listening, without revoking the video URL mid-transition.
 toListening();
 indicator('Lia realista • aguardando você');status('Sua vez: fale ou digite para a Lia.');scheduleListen();
}
function recoverVoice(serial,text,message){
 if(serial!==session.serial||!session.active||!session.connected)return;
 window.EducaLiaWarm?.endSpeech?.();
 clearTimeout(session.voiceStartTimer);session.voiceStartTimer=null;
 session.utterance=null;session.speechQueue=[];session.prefetched=null;
 try{window.speechSynthesis?.cancel();}catch(_){}
 stopVoiceProgress();toListening();subtitle(session.lastSpoken||text);
 // Se não há áudio, a mensagem fictícia deve permanecer legível para o aluno.
 if(ui.view?.dataset)ui.view.dataset.captions='on';
 if(captionSwitch){captionSwitch.setAttribute('aria-pressed','true');captionSwitch.textContent='Ocultar legendas';}
 const web=document.documentElement?.dataset?.educaPlatform==='web';
 status(web?message+' Toque em “Ouvir a Lia” para liberar a voz no aparelho. Você também pode responder por texto.':
   message+' Você ainda pode responder por texto ou tentar a voz novamente.');
 if(ui.play){ui.play.hidden=false;ui.play.dataset.retryVoice='true';ui.play.textContent=web?'▶ Ouvir a Lia':'↻ Tentar voz oficial';}
 scheduleListen(400);
}
function audioOnly(text,serial){
 if(serial!==session.serial||!session.active)return;
 clearMedia();indicator('Lia falando · vídeo realista controlado pela voz');
 if(!window.SpeechSynthesisUtterance||!window.speechSynthesis){recoverVoice(serial,text,'A voz não está disponível neste navegador.');return;}
 const startFemale=voice=>{
  if(serial!==session.serial||!session.active||!session.connected)return;
  const web=document.documentElement?.dataset?.educaPlatform==='web';
  // Safari/Web Speech pode expor zero vozes ao iniciar, mesmo suportando
  // SpeechSynthesisUtterance com lang=pt-BR. Não bloquear a chamada.
  if((!voice||!/^pt[-_]BR$/i.test(voice.lang))&&!web){
   indicator('Lia · voz feminina indisponível neste aparelho');
   recoverVoice(serial,text,'Não foi encontrada uma voz feminina pt-BR. O Kokoro pode continuar carregando.');
   return;
  }
  const u=new SpeechSynthesisUtterance(text);u.lang='pt-BR';
  // Velocidade quase natural: acelerar demais torna a voz sintética/robótica.
  u.rate=selectedStyle()==='calma'?.95:selectedStyle()==='clara'?1.02:1.00;
  u.pitch=1;u.volume=outputMuted?0:1;if(voice&&/^pt[-_]BR$/i.test(voice.lang))u.voice=voice;
  session.utterance=u;let started=false;
  u.onstart=()=>{if(serial!==session.serial||session.utterance!==u)return;
   started=true;stopVoiceProgress();clearTimeout(session.voiceStartTimer);session.voiceStartTimer=null;
   ui.play.hidden=true;referenceMotion();subtitle(text);
   status('Lia falando. Os fonemas são aproximados nos clipes ilustrativos deste navegador.');
  };
  u.onpause=()=>{if(serial===session.serial&&session.utterance===u)toListening();};
  u.onresume=()=>{if(serial===session.serial&&session.utterance===u)referenceMotion();};
  u.onend=()=>{if(serial===session.serial&&session.utterance===u)completed();};
  u.onerror=e=>{if(serial===session.serial&&session.utterance===u)recoverVoice(serial,text,'O áudio do navegador falhou ('+(e.error||'erro')+').');};
  try{
   status('Iniciando voz da Lia…');
   session.voiceStartTimer=setTimeout(()=>{
    if(serial===session.serial&&!started&&session.utterance===u)
     recoverVoice(serial,text,'A voz do navegador não começou após 4 segundos.');
   },4200);
   window.speechSynthesis.cancel();window.speechSynthesis.resume();window.speechSynthesis.speak(u);
  }catch(_){recoverVoice(serial,text,'Não foi possível iniciar a voz feminina.');}
 };
 const selected=window.EducaLiaVoice?.choose?.();
 // Web: tentar IMEDIATAMENTE a síntese do dispositivo. A lista feminina
 // pode estar vazia no iPhone; a seleção pt-BR padrão ainda pode funcionar.
 if(document.documentElement?.dataset?.educaPlatform==='web'){
  const alternative=window.EducaLiaVoice?.voices?.().find(v=>!window.EducaLiaVoice?.male?.(v));
  startFemale(selected||alternative||null);return;
 }
 if(selected){startFemale(selected);return;}
 session.utterance={kind:'voice-loading'};
 status('Procurando uma voz feminina pt-BR neste aparelho…');
 const pendingVoice=window.EducaLiaVoice?.waitForFemale?.(1200);
 if(pendingVoice)void pendingVoice.then(startFemale).catch(()=>{if(serial===session.serial)startFemale(null);});
 else startFemale(null);
}
async function fetchOk(url,opts){const r=await fetch(url,{cache:'no-store',credentials:'same-origin',...opts});if(!r.ok)throw Error('Serviço indisponível (HTTP '+r.status+')');return r;}
const headers=()=>({'X-Educa-Lia-Code':session.teamCode});
const safeMedia=url=>/^\/api\/avatar\/media\/[a-f0-9]{32}\.(wav|mp4)$/.test(url);
async function mediaBlob(url,signal){if(!safeMedia(url))throw Error('Mídia inválida');return (await fetchOk(url,{headers:headers(),signal})).blob();}
function wait(ms,signal){return new Promise((resolve,reject)=>{const t=setTimeout(()=>{signal.removeEventListener('abort',cancel);resolve();},ms);function cancel(){clearTimeout(t);reject(Error('cancelado'));}signal.addEventListener('abort',cancel,{once:true});});}
async function playAudio(url,signal,serial,text,cues=[]){
 const audio=new Audio();const blob=await mediaBlob(url,signal);if(serial!==session.serial)return;
 if(blob.size<1024||!(/audio\/(?:wav|x-wav|wave|mpeg|mp3|ogg)|application\/octet-stream/.test(blob.type)))throw Error('Áudio Kokoro inválido');
 clearMedia();session.mediaUrl=URL.createObjectURL(blob);audio.src=session.mediaUrl;audio.muted=outputMuted;session.utterance=audio;
 indicator('Lia · voz neural Kokoro pf_dora');status('A voz oficial da Lia está tocando. Sem MuseTalk com GPU, os clipes de boca são aproximados, não fonema a fonema.');
 audio.onplaying=()=>{if(serial===session.serial){subtitle(text);if(!startSpeechMotion(audio,cues))referenceMotion();}};
 audio.onpause=()=>{if(serial===session.serial&&!audio.ended)toListening();};
 audio.onended=()=>{if(serial===session.serial)completed();};audio.onerror=()=>{if(serial===session.serial)completed();};
 try{await audio.play();}catch(_){ui.play.hidden=false;ui.play.textContent='▶ Reproduzir áudio da Lia';status('O iPhone bloqueou o áudio. Toque em Reproduzir áudio da Lia.');}
}
// V111.28 - áudio neural gerado localmente no navegador, sem backend pago.
// Enquanto o WAV atual toca, preparar o próximo trecho (máximo um adiantado).
// Em CPU, a inferência continua custosa, mas a espera deixa de ser inteiramente serial.
function prefetchNextChunk(serial){
 // Dora usa seu próprio motor; nunca carregar o Kokoro pesado por engano.
 if(selectedEngine()==='gratuita')return;
 if(serial!==session.serial||!session.speechQueue.length||session.renderReady||selectedEngine()==='padrao')return;
 const browser=window.EducaLiaBrowserKokoro;
 if(!browser)return;
 const next=session.speechQueue[0];
 if(session.prefetched?.serial===serial&&session.prefetched.text===next)return;
 const promise=browser.synthesize(next,selectedStyle());
 promise.catch(()=>{}); // cancelamentos de turno não devem gerar exceção sem tratamento.
 session.prefetched={serial,text:next,promise};
}
// V111.95: no iPhone, desbloquear o AudioContext no toque em Atender
// permite tocar WAV gerado DINAMICAMENTE pelo Kokoro após o fetch/inferência.
// Nenhum arquivo MP3 ou fala pré-gravada é servido ao participante.
async function playDynamicKokoroWebAudio(result,text,serial,voiceLabel='Kokoro pf_dora'){
 if(document.documentElement?.dataset?.educaPlatform!=='web')return false;
 const ctx=speechMotion.context;
 if(!ctx||typeof ctx.decodeAudioData!=='function')return false;
 try{
  if(ctx.state!=='running'&&webNeuralPlayback()){
   await Promise.race([ctx.resume(),new Promise(resolve=>setTimeout(resolve,700))]);
  }
  if(ctx.state!=='running')return false;
  const buffer=await ctx.decodeAudioData(await result.blob.arrayBuffer());
  if(serial!==session.serial||!session.active||!session.connected||session.waiting)return false;
  const source=ctx.createBufferSource(),gain=ctx.createGain();
  source.buffer=buffer;gain.gain.value=outputMuted?0:1;
  // Leve: controlar o clipe pelo nível real do WAV, sem novo decodificador.
  let analyser=null;
  if(typeof ctx.createAnalyser==='function'&&lightNeuralVisual()){
   analyser=ctx.createAnalyser();analyser.fftSize=256;
   source.connect(analyser);analyser.connect(gain);
  }else source.connect(gain);
  gain.connect(ctx.destination);
  session.utterance=source;session.webAudioGain=gain;
  source.onended=()=>{
   if(serial===session.serial&&session.utterance===source)completed();
   try{source.disconnect();analyser?.disconnect();gain.disconnect();}catch(_){}
  };
  source.start(0);
  stopVoiceProgress();ui.play.hidden=true;subtitle(text);
  indicator('Lia · '+voiceLabel);
  status('Lia falando com áudio gerado para esta resposta.');
  referenceMotion();
  if(analyser){
   const data=new Uint8Array(analyser.fftSize);let last=0,silentSince=0;
   speechMotion.playing=true;speechMotion.analyser=analyser;
   function animate(now){
    if(!speechMotion.playing||session.utterance!==source||session.serial!==serial)return;
    if(now-last>=65){
     last=now;analyser.getByteTimeDomainData(data);
     let power=0;for(const value of data){const x=(value-128)/128;power+=x*x;}
     const rms=Math.sqrt(power/data.length),clip=motion.talkActive;
     if(clip){
      if(rms<.008){if(!silentSince)silentSince=now;if(now-silentSince>180&&!clip.paused)clip.pause();}
      else{silentSince=0;clip.playbackRate=.86+Math.min(.34,rms*3);if(clip.paused)void clip.play().catch(()=>{});}
     }
    }
    speechMotion.frame=requestAnimationFrame(animate);
   }
   speechMotion.frame=requestAnimationFrame(animate);
  }
  prefetchNextChunk(serial);
  return true;
 }catch(_){return false;}
}
async function playBrowserResult(result,text,serial){
 if(serial!==session.serial||!session.active||!session.connected||session.waiting)return false;
 stopRecognition();
  if(result.voice!=='pf_dora'||result.blob.size<1024)throw Error('Arquivo da voz oficial inválido');
  clearMedia();
  const audio=new Audio(),url=URL.createObjectURL(result.blob);
  session.mediaUrl=url;session.utterance=audio;audio.src=url;audio.muted=outputMuted;
  indicator('Lia · Kokoro pf_dora no navegador');
  status('Voz pf_dora gerada neste dispositivo. Os movimentos de boca são estimados; o vídeo original não é neural.');
  showVoiceProgress('LIA falando · voz pf_dora');
  audio.onplaying=()=>{if(serial===session.serial){stopVoiceProgress();ui.play.hidden=true;subtitle(text);if(!startSpeechMotion(audio,result.cues))referenceMotion();prefetchNextChunk(serial);}};
  audio.onpause=()=>{if(serial===session.serial&&!audio.ended)toListening();};
  audio.onended=()=>{if(serial===session.serial)completed();};
  audio.onerror=()=>{if(serial===session.serial){recoverVoice(serial,text,'Falha ao reproduzir Kokoro no navegador.');}};
  try{await audio.play();}catch(_){
   // Safari pode bloquear audio.play() após a inferência assíncrona.
   // O contexto foi liberado diretamente pelo gesto de Atender e reproduz
   // o mesmo WAV dinâmico, sem pedir outro toque se estiver ativo.
   if(await playDynamicKokoroWebAudio(result,text,serial))return true;
   ui.play.hidden=false;delete ui.play.dataset.retryVoice;ui.play.textContent='▶ Ouvir voz da Lia';
   showVoiceProgress('Toque em Ouvir voz da Lia para liberar o som.');
   status('O iPhone pediu autorização para ouvir a voz neural da Lia.');
  }
 return true;
}
async function playBrowserKokoro(text,serial){
 const browser=window.EducaLiaBrowserKokoro;
 if(!browser)return false;
 let pending=null;
 try{
  session.utterance={kind:'kokoro-browser-loading'};
  showVoiceProgress('LIA: preparando voz oficial pf_dora…');
  status('Preparando Kokoro pf_dora neste dispositivo. No primeiro uso, o modelo pode levar algum tempo para baixar.');
  const started=Date.now();
  clearInterval(session.voiceProgressTimer);
  session.voiceProgressTimer=setInterval(()=>{
   if(serial!==session.serial){clearInterval(session.voiceProgressTimer);session.voiceProgressTimer=null;return;}
   const stage=String(browser.getStatus?.()||'Gerando áudio').replace(/\([^)]*\)/g,'').slice(0,48);
   const elapsed=Math.round((Date.now()-started)/1000);
   showVoiceProgress('LIA: '+stage+' · '+elapsed+'s');
  },650);
  const ahead=session.prefetched?.serial===serial&&session.prefetched.text===text?session.prefetched.promise:null;
  if(ahead)session.prefetched=null;
  // O primeiro download Kokoro é pesado no iPhone. Não segurar a conversa:
  // após o orçamento de tempo, usar uma voz FEMININA instalada se existir.
  // A inferência continua em segundo plano para o turno seguinte.
  pending=ahead||browser.synthesize(text,selectedStyle());
  pending.catch(()=>{});
  let budgetTimer;
  let result;
  try {
   result=await Promise.race([
    pending,
    new Promise((_,reject)=>{const web=document.documentElement?.dataset?.educaPlatform==='web';
     const fastFemale=web&&Boolean(window.EducaLiaVoice?.choose?.());
     // Se o Safari não oferece voz feminina, não interromper a única voz
     // possível após 9 segundos: deixar o Kokoro terminar a frase curta.
     // O próprio motor possui watchdog para falhas reais.
     const waitMs=fastFemale?(browser.isReady?.()?2600:1200):
       (web?48000:(browser.isReady?.()?BROWSER_KOKORO_WARM_BUDGET_MS:BROWSER_KOKORO_READY_BUDGET_MS));
     budgetTimer=setTimeout(()=>reject(Object.assign(new Error('Aquecimento Kokoro ainda em andamento'),{code:'KOKORO_WARMING'})),waitMs);})
   ]);
  }finally{clearTimeout(budgetTimer);}
  clearInterval(session.voiceProgressTimer);session.voiceProgressTimer=null;
  if(serial!==session.serial||!session.active||!session.connected)return true;
  return await playBrowserResult(result,text,serial);
 }catch(e){
  if(serial!==session.serial)return true;
  clearInterval(session.voiceProgressTimer);session.voiceProgressTimer=null;
  const message=String(e?.message||e).slice(0,115);
  if(e?.code==='KOKORO_WARMING'&&pending&&!window.EducaLiaVoice?.choose?.()){
   // O iOS pode não ter nenhuma voz feminina pt-BR. Não perca o WAV que
   // terminar de sintetizar após o orçamento inicial de 7/9 segundos.
   // Jamais toque uma fala antiga se o aluno já respondeu ou saiu da chamada.
   session.utterance=null;stopVoiceProgress();toListening();subtitle(text);
   if(ui.view?.dataset)ui.view.dataset.captions='on';
   if(captionSwitch){captionSwitch.setAttribute('aria-pressed','true');captionSwitch.textContent='Ocultar legendas';}
   status('A voz neural da Lia continua sendo preparada. Você pode responder por texto enquanto isso.');
   let expired=false;
   const lateTimer=setTimeout(()=>{expired=true;},18000);
   void pending.then(result=>{
    clearTimeout(lateTimer);
    if(expired||serial!==session.serial||!session.active||!session.connected||session.waiting||session.utterance)return;
    void playBrowserResult(result,text,serial).catch(()=>{recoverVoice(serial,text,'O áudio neural não pôde iniciar.');});
   }).catch(()=>{clearTimeout(lateTimer);});
   scheduleListen(400);
   return true;
  }
  if(e?.code==='KOKORO_WARMING'){
   status('Kokoro pf_dora ainda carrega neste aparelho. Tentando voz feminina pt-BR enquanto o modelo fica pronto.');
  }else status('Kokoro pf_dora indisponível: '+message+'. Tentando voz feminina pt-BR do dispositivo.');
  showVoiceProgress('Selecionando voz feminina disponível…');
  if(document.documentElement?.dataset?.educaPlatform==='web'&&window.EducaLiaVoice?.choose?.())
   session.fastVoiceSerial=serial; // evita troca de timbre no restante da resposta
  audioOnly(text,serial);
  return true;
 }
}
async function playVideo(url,signal,serial,text){
 const blob=await mediaBlob(url,signal);if(serial!==session.serial)return;
 if(blob.size<1024||!(/video\/mp4|application\/octet-stream/.test(blob.type)))throw Error('Vídeo neural inválido');
 clearMedia();session.mediaUrl=URL.createObjectURL(blob);const v=ui.portraitVideo;
 stopGroup(talkPlayers.filter(player=>player!==v));
 v.src=session.mediaUrl;v.muted=outputMuted;v.loop=false;v.playsInline=true;v.hidden=false;v.classList.remove('lia-clip-visible');session.utterance=v;
 v.onplaying=()=>{if(serial===session.serial){
  subtitle(text);motion.talking=true;motion.talkActive=v;session.motionSerial=serial;
  ui.portrait?.classList.add('lia-photo-speaking');v.classList.add('lia-clip-visible');
  for(const idle of idlePlayers)idle.classList.remove('lia-clip-visible');
  const timer=setTimeout(()=>{motion.hideTimers.delete(timer);if(motion.talking)for(const idle of idlePlayers){idle.pause();idle.hidden=true;}},CROSSFADE_MS);
  motion.hideTimers.add(timer);
 }};
 indicator('MuseTalk · áudio e boca da resposta sincronizados');status('Reproduzindo vídeo sintetizado a partir do áudio real da Lia.');
 v.onended=()=>{if(serial===session.serial)completed();};
 v.onerror=()=>{if(serial===session.serial){clearMedia();completed();status('Falha ao reproduzir o vídeo gerado.');}};
 try{await v.play();}catch(_){ui.play.hidden=false;status('Toque em ▶ Reproduzir resposta gerada para liberar o áudio no iPhone.');}
}
async function tryNeural(text,serial){
 if(!session.renderReady||!session.teamCode)return false;
 const controller=new AbortController();session.renderAbort=controller;const signal=controller.signal;
 let synthesisTimer=setTimeout(()=>controller.abort(),TTS_FIRST_RESPONSE_TIMEOUT_MS);
 let result=null;
 try{
  indicator('Gerando voz brasileira…');status('Gerando a voz feminina da Lia no serviço disponível, sem abrir outros programas.');
  result=await (await fetchOk('/api/avatar/speak',{method:'POST',headers:{...headers(),'Content-Type':'application/json'},body:JSON.stringify({text:text.slice(0,450),style:selectedStyle(),engine:selectedEngine()}),signal})).json();
  clearTimeout(synthesisTimer);synthesisTimer=null;
  if(serial!==session.serial)return true;
  if(result.video_enabled){
   indicator('Sincronizando os lábios…');status('MuseTalk gerando um vídeo novo para a resposta da Lia (pode demorar). A boca será sincronizada com a voz.');
   let job=await (await fetchOk('/api/avatar/render',{method:'POST',headers:{...headers(),'Content-Type':'application/json'},body:JSON.stringify({job_id:result.job_id}),signal})).json();
   // Prioriza voz rápida; com GPU sincronizada, a equipe pode escolher o modo de boca exata.
   // Mantemos o mesmo WAV do Kokoro/Chatterbox se MuseTalk demorar.
   const limit=Date.now()+lipSyncWaitMs();
   while(job.status!=='ready'&&job.status!=='failed'&&Date.now()<limit){
     await wait(400,signal);if(serial!==session.serial)return true;
     job=await (await fetchOk('/api/avatar/render-status/'+result.job_id,{headers:headers(),signal})).json();
   }
   if(job.status!=='ready'||!job.video_url){
     status('A Lia vai falar agora. Sem vídeo neural pronto, o movimento da boca será aproximado pela energia da voz.');
     await playAudio(result.audio_url,signal,serial,text,result.viseme_cues);return true;
   }
   await playVideo(job.video_url,signal,serial,text);return true;
  }
  // O TTS ainda é utilizado quando a GPU está indisponível, mas não finge que o rosto fala.
  await playAudio(result.audio_url,signal,serial,text,result.viseme_cues);return true;
 }catch(e){if(serial!==session.serial||(!session.active))return true;
  // Render falhou, mas a voz já existe: não a trocamos por TTS do navegador.
  if(result?.audio_url){
    try{await playAudio(result.audio_url,signal,serial,text,result.viseme_cues);return true;}catch(_){}
  }
  status('Voz Kokoro demorou ou ficou indisponível. Tentando voz feminina do navegador.');return false;
 }finally{clearTimeout(synthesisTimer);if(session.renderAbort===controller)session.renderAbort=null;}
}
// A opção expressiva da Web só é usada quando habilitada na Cloudflare.
// Sem consentimento de custo, /status informa disabled e nenhuma síntese é solicitada.
async function inspectWebHQVoice(){
 if(document.documentElement?.dataset?.educaPlatform!=='web')return;
 // Captura o turno para ignorar resposta de uma chamada já encerrada.
 const turn=session.serial;
 let enabled=false;
 try{
  const r=await fetch('/api/lia/voz-web/status',{cache:'no-store',credentials:'same-origin'});
  const config=await r.json();
  enabled=r.ok&&config.enabled===true&&config.provider==='elevenlabs-flash-v2.5';
 }catch(_){}
 if(turn!==session.serial||!session.active)return;
 session.hqVoiceEnabled=enabled;
 if(enabled){indicator('Lia · Roberta ElevenLabs configurada');status('Roberta selecionada. A voz natural será testada quando você atender.');}
 const robertaOption=voiceEngine?.querySelector('option[value="feminina"]');
 if(robertaOption)robertaOption.textContent=enabled
  ?'Roberta · voz natural brasileira'
  :'Roberta indisponível · voz do aparelho disponível separadamente';
}
async function playWebHQVoice(text,serial){
 const controller=new AbortController();
 session.hqAbort=controller;
 let timeout=null;
 try{
  // O limite anterior de 2,8 s cancelava o MP3 antes do download terminar.
  // Aguarde a resposta neural sem trocar silenciosamente para TTS robótico.
  timeout=setTimeout(()=>controller.abort(),8500);
  const r=await fetch('/api/lia/voz-web/speak',{
   method:'POST',credentials:'same-origin',cache:'no-store',signal:controller.signal,
   headers:{'Content-Type':'application/json'},body:JSON.stringify({text})
  });
  if(!r.ok){
   const detail=await r.json().catch(()=>null);
   throw Error((detail?.message||'ElevenLabs indisponível')+' [Worker HTTP '+r.status+']');
  }
  if(!String(r.headers.get('Content-Type')||'').includes('audio/'))
   throw Error('ElevenLabs não retornou áudio MP3.');
  const blob=await r.blob();
  if(blob.size<1024||blob.size>2000000)
   throw Error('MP3 da Roberta vazio ou acima do limite.');
  if(serial!==session.serial||!session.active||!session.connected||session.waiting)return true;
  clearTimeout(timeout);timeout=null;
  clearMedia();
  const audio=new Audio(),url=URL.createObjectURL(blob);
  session.mediaUrl=url;session.utterance=audio;audio.src=url;audio.muted=outputMuted;
  indicator('Lia · voz feminina expressiva em português');
  audio.onplaying=()=>{if(serial===session.serial){
   stopVoiceProgress();ui.play.hidden=true;subtitle(text);
   if(!startSpeechMotion(audio,[]))referenceMotion();
   status('Voz expressiva da Lia. O movimento labial é ilustrativo, guiado pelo áudio.');
  }};
  audio.onended=()=>{if(serial===session.serial)completed();};
  audio.onerror=()=>{if(serial===session.serial)recoverVoice(serial,text,'Áudio expressivo indisponível.');};
  try{await audio.play();}catch(_){
   // Safari pode bloquear Audio.play() depois da chamada de rede. O contexto
   // WebAudio já foi liberado no toque em Atender; o MP3 é gerado de verdade.
   if(await playDynamicKokoroWebAudio({blob},text,serial,'voz natural online'))return true;
   ui.play.hidden=false;ui.play.textContent='▶ Ouvir voz da Lia';
   status('Toque em reproduzir para liberar o áudio neste navegador.');
  }
  return true;
 }catch(e){
  if(serial===session.serial){
   session.hqVoiceLastError=controller.signal.aborted
    ?'A resposta de áudio demorou mais de 8,5 segundos.'
    :String(e?.message||'Erro inesperado na geração de áudio.').slice(0,170);
  }
  return false;
 }
 finally{
  clearTimeout(timeout);
  if(session.hqAbort===controller)session.hqAbort=null;
 }
}
// V112.06 — Web: ONNX de 8.46 MB gera a fala neural dentro do navegador.
// Sem token pago nem enviar texto a ElevenLabs. O primeiro carregamento pode demorar.
async function playFreeNeuralVoice(text,serial){
 const local=window.EducaLiaFreeNeural;
 if(!local)throw Error('O motor neural gratuito não foi carregado.');
 status('Preparando Dora neural; não vamos bloquear o treinamento.');
 window.EducaLiaWarm?.beginSpeech?.();
 let timeout=null,result;
 try{
  await local.prepare();
  if(serial!==session.serial||!session.active||!session.connected||session.waiting)return true;
  if(lightNeuralVisual()){stopGroup(talkPlayers,true);stopGroup(idlePlayers,true);motion.talkActive=null;}
  const speed=selectedStyle()==='calma'?.96:selectedStyle()==='clara'?1.0:1.05;
  const cached=webNeuralPlayback()&&text===INTRO_FIRST&&introNeural?.speed===speed?introNeural:null;
  if(cached){cached.used=true;introNeural=null;}
  const generate=()=>serial===session.serial&&session.active&&session.connected?local.speak(text,{speed}):null;
  const synthesis=cached?cached.promise.then(wav=>wav||generate()):
   webNeuralPlayback()&&introFlight?introFlight.then(generate):generate();
  result=await Promise.race([
   synthesis,
   new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('O modelo neural demorou demais para este aparelho.')),7500);})
  ]);
 }catch(error){
  if(serial===session.serial)local.stop?.('Motor neural pausado após espera longa para evitar travamento.');
  throw error;
 }finally{
  clearTimeout(timeout);
  window.EducaLiaWarm?.endSpeech?.();
 }
 if(serial!==session.serial||!session.active||!session.connected||session.waiting)return true;
 if(!result?.blob||result.blob.size<1024)throw Error('O modelo gratuito não gerou áudio.');
 clearMedia();
 if(webNeuralPlayback()&&await playDynamicKokoroWebAudio(result,text,serial,'Dora neural gratuita, português do Brasil'))return true;
 if(serial!==session.serial||!session.active||!session.connected||session.waiting)return true;
 const audio=new Audio(),url=URL.createObjectURL(result.blob);
 session.mediaUrl=url;session.utterance=audio;audio.src=url;audio.muted=outputMuted;
 indicator('Lia · Dora neural gratuita, português do Brasil');
 status('Voz neural gratuita gerada no seu aparelho, sem consumo de créditos.');
 audio.onplaying=()=>{if(serial===session.serial){
  stopVoiceProgress();ui.play.hidden=true;subtitle(text);
  if(!startSpeechMotion(audio,[]))referenceMotion();
  status('Voz neural brasileira reproduzindo (modelo local; boca ilustrativa).');
 }};
 audio.onended=()=>{if(serial===session.serial)completed();};
 audio.onerror=()=>{if(serial===session.serial)recoverVoice(serial,text,'Falha ao tocar a voz neural gratuita.');};
 try{await audio.play();}catch(_){
  // A chamada inicial desbloqueia o AudioContext. Em Safari, WAV também
  // pode ser reproduzido pelo contexto sem enviar áudio a um servidor.
  if(await playDynamicKokoroWebAudio(result,text,serial,'voz neural brasileira gratuita'))return true;
  if(ui.play){ui.play.hidden=false;ui.play.textContent=webNeuralPlayback()?'Ativar som':'▶ Ouvir voz neural';delete ui.play.dataset.retryVoice;}
  status(webNeuralPlayback()?'O navegador bloqueou a reprodução automática. Ative o som para continuar.':'Toque em Ouvir voz neural para liberar o áudio neste navegador.');
 }
 return true;
}
function startSpeechChunk(phrase,serial){
 if(serial!==session.serial||!session.active||!session.connected)return;
 // V112.07 — Na WEB, fala neural local é o único motor automático.
 // Nem ElevenLabs nem voz robótica do navegador podem ser acionadas sem
 // uma escolha MANUAL do participante no menu de acessibilidade.
 if(document.documentElement?.dataset?.educaPlatform==='web'||selectedEngine()==='gratuita'){
  if(selectedEngine()==='padrao'){
   stopVoiceProgress();audioOnly(phrase,serial);return;
  }
  if(window.EducaLiaWarm?.state?.().recovered&&!allowRecoveredNeural){
   recoverVoice(serial,phrase,'A preparação anterior foi interrompida. Toque para tentar a voz neural novamente.');return;
  }
  session.utterance={kind:'neural-gratis-loading'};
  showVoiceProgress('LIA · preparando Dora neural gratuita…');
  void playFreeNeuralVoice(phrase,serial).catch(e=>{
   if(serial!==session.serial||!session.active||!session.connected||session.waiting)return;
   indicator('Lia · voz neural temporariamente indisponível');
   recoverVoice(serial,phrase,'A voz neural não iniciou. A conversa continua por texto; tente novamente ou selecione manualmente a voz alternativa.');
   if(ui.play)ui.play.textContent='↻ Tentar voz neural gratuita';
  });
  return;
 }
 // V112.01 — Somente Web: o modelo local de 82M pode demorar dezenas
 // de segundos no Safari. Sem WAV preparado e comprovadamente rápido,
 // pronunciar diretamente pelo sintetizador do aparelho, sem spinner.
 // Nativos Android/iOS mantêm seu comportamento anterior.
 const isWeb=document.documentElement?.dataset?.educaPlatform==='web';
 const canTalkNow=isWeb&&typeof window.SpeechSynthesisUtterance==='function'&&
  typeof window.speechSynthesis?.speak==='function';
 if(canTalkNow&&!session.renderReady){
  const local=window.EducaLiaBrowserKokoro;
  const ms=Number(local?.getDiagnostics?.()?.lastSynthesisMs||0);
  const neuralFast=selectedEngine()!=='padrao'&&local?.isReady?.()&&ms>0&&ms<=2800;
  if(!neuralFast){
   session.fastVoiceSerial=serial;showVoiceProgress('');
   audioOnly(phrase,serial);return;
  }
 }
 showVoiceProgress('LIA: preparando voz oficial…');
 const start=()=>{
  if(serial!==session.serial||!session.active||!session.connected)return;
  if(!session.renderReady||!session.teamCode){
   if(selectedEngine()==='padrao'){showVoiceProgress('');audioOnly(phrase,serial);return;}
   if(session.fastVoiceSerial===serial){
    // Mantém o mesmo timbre feminino até o fim do turno. O Kokoro pode
    // continuar aquecendo no Worker e assumir uma conversa posterior.
    showVoiceProgress('');
    audioOnly(phrase,serial);return;
   }
   const localKokoro=window.EducaLiaBrowserKokoro;
   if(!localKokoro){audioOnly(phrase,serial);return;}
   // Depois de uma síntese comprovadamente lenta, a Web não fica
   // aguardando vários segundos outra vez; mantém a voz feminina local.
   if(document.documentElement?.dataset?.educaPlatform==='web'&&
      localKokoro.isReady?.()&&localKokoro.isFast?.()===false&&
      window.EducaLiaVoice?.choose?.()){
    session.fastVoiceSerial=serial;showVoiceProgress('');
    audioOnly(phrase,serial);return;
   }
   // V111.91 — estratégia SOMENTE WEB: não segurar uma voz feminina
   // instalada enquanto a rede baixa centenas de MB do Kokoro.
   // As plataformas nativas conservam a escolha original do motor.
   const webFast=document.documentElement?.dataset?.educaPlatform==='web';
   if(webFast&&!localKokoro.isReady?.()&&session.voiceChoiceDoneSerial!==serial){
    session.voiceChoiceDoneSerial=serial;
    session.utterance={kind:'voice-selecting'};
    showVoiceProgress('Lia · preparando a voz neural feminina…');
    // CacheStorage pode conter a fala fixa pf_dora de uma sessão anterior,
    // mesmo que o modelo de 82M ainda não esteja carregado neste acesso.
    // Áudio fixo em cache tem prioridade sobre a voz do sistema.
    const candidate=Promise.resolve().then(async()=>{
     if(await localKokoro.hasCachedIntro?.(phrase,selectedStyle()))return {cached:true};
     const already=window.EducaLiaVoice?.choose?.();
     return {voice:already||(await window.EducaLiaVoice?.waitForFemale?.(160))||null};
    });
    void candidate.then(choice=>{
     if(serial!==session.serial||!session.active||!session.connected||session.waiting)return;
     session.utterance=null;
     if(choice.cached){
      void playBrowserKokoro(phrase,serial).catch(()=>{if(serial===session.serial)recoverVoice(serial,phrase,'Áudio em cache não pôde ser reproduzido.');});
     }else if(choice.voice){
      session.fastVoiceSerial=serial;
      indicator('Lia · voz feminina rápida; Kokoro aquecendo');
      audioOnly(phrase,serial);
     }else{
      // Sem voz feminina pt-BR, usar Kokoro; nunca substituir por voz masculina.
      startSpeechChunk(phrase,serial);
     }
    }).catch(()=>{if(serial===session.serial&&session.active){session.utterance=null;startSpeechChunk(phrase,serial);}});
    return;
   }
   void playBrowserKokoro(phrase,serial).then(ok=>{
    if(!ok&&serial===session.serial&&session.active){
     if(selectedEngine()==='padrao')audioOnly(phrase,serial);
     else {session.utterance=null;toListening();scheduleListen(900);}
    }
   });
   return;
  }
  session.utterance={kind:'loading'};
  void tryNeural(phrase,serial).then(ok=>{
   if(serial===session.serial&&session.active&&!ok){
    if(selectedEngine()==='padrao')audioOnly(phrase,serial);
    else{session.utterance=null;toListening();showVoiceProgress('Kokoro remoto indisponível.');status('Kokoro remoto indisponível; tente a voz local pela página de diagnóstico.');scheduleListen(900);}
   }
  }).catch(()=>{if(serial===session.serial&&session.active){if(selectedEngine()==='padrao')audioOnly(phrase,serial);else{session.utterance=null;toListening();showVoiceProgress('Erro na voz.');status('Falha no motor de voz. Consulte /testar-voz-lia.html.');}}});
 };
 if(document.documentElement?.dataset?.educaPlatform==='web'){
  // Não atrasar a fala dinâmica 900 ms verificando serviço de avatar remoto,
  // que está desligado no site oficial: o Kokoro local já está aquecendo.
  start();return;
 }
 if(session.motorPending&&window.location?.protocol==='https:'){
  status('Conectando a voz oficial da Lia…');
  void Promise.race([session.motorPending,new Promise(resolve=>setTimeout(resolve,MOTOR_CHECK_TIMEOUT_MS))]).then(start,start);
 }else start();
}
function speak(text){
 if(!session.active||!session.connected)return;abortSpeech();stopRecognition();
 const serial=session.serial,whole=String(text||'').trim().slice(0,450);
 if(!whole)return;
 session.lastSpoken=whole;session.hqVoiceLastError='';
 const web=document.documentElement?.dataset?.educaPlatform==='web';
 const browser=window.EducaLiaBrowserKokoro;
 // Se a fala neural ainda não aqueceu, a voz feminina do navegador pode
 // pronunciar a resposta inteira com prosódia contínua (sem cortes robóticos).
 // A abertura fixa continua dividida para aproveitar o WAV pf_dora cacheado.
 const continuousFemale=web&&!session.renderReady&&!browser?.isReady?.()&&
  Boolean(window.EducaLiaVoice?.choose?.())&&!whole.startsWith('Oi, sou a Lia.');
 const lastMs=Number(browser?.getDiagnostics?.()?.lastSynthesisMs||0);
 const neuralFast=selectedEngine()!=='padrao'&&browser?.isReady?.()&&lastMs>0&&lastMs<=2800;
 const immediateDevice=web&&!session.renderReady&&
  typeof window.SpeechSynthesisUtterance==='function'&&
  typeof window.speechSynthesis?.speak==='function'&&!neuralFast;
 // Um único enunciado contínuo soa mais natural e evita bloqueios do
 // Safari entre várias partes; os nativos preservam o fluxo por trechos.
 // Serviço natural online: primeira frase curta chega antes sem aguardar
 // sintetizar todo o parágrafo. As outras mantêm a mesma voz no turno.
 const chunks=selectedEngine()==='gratuita'?speechSegments(whole):
  immediateDevice?[whole]:continuousFemale?[whole]:speechSegments(whole);
 const first=chunks.shift();session.speechQueue=chunks;
 // A mensagem educativa chega ao leitor no mesmo instante. A síntese
 // de voz é independente e pode demorar caso não exista voz feminina local.
 subtitle(whole);
 startSpeechChunk(first,serial);
}

async function configure(){
 status('Verificando disponibilidade do motor neural…');
 try{
  const r=await (await fetchOk('/api/avatar/health')).json();session.health=r;
  if(!r.enabled||!r.voice_installed){
   session.renderReady=false;
   status('O Educa+ está funcionando. A voz feminina disponível no navegador será usada até haver Kokoro online.');
   indicator('Lia realista · voz do navegador');return;
  }
  if(r.public_voice){
    session.teamCode='educa-online';session.renderReady=true;
  }else if(r.local&&/^(localhost|127\.0\.0\.1)$/.test(location.hostname)){
    session.teamCode='educa-local';session.renderReady=true;
  }else{
    const code=window.prompt('Código de acesso da equipe para motor neural:',session.teamCode||'');
    if(code===null)return;
    const candidate=code.trim().slice(0,150);
    if(candidate.length<8){status('Código de acesso inválido.');return;}
    const verify=await fetchOk('/api/avatar/check',{headers:{'X-Educa-Lia-Code':candidate}});
    const ok=await verify.json();
    if(!ok.authorized)throw Error('Acesso negado');
    session.teamCode=candidate;session.renderReady=true;
  }
  indicator(r.video_enabled?'Lia neural pronta':(r.voice_engine==='chatterbox'?'Chatterbox V3 pronto':'Kokoro pronto + gestos guiados pelo áudio'));
  void fetchOk('/api/avatar/preload',{method:'POST',headers:{...headers(),'Content-Type':'application/json'},body:JSON.stringify({engine:selectedEngine()})}).catch(()=>{});
  status(r.video_enabled?'Motor neural autorizado.':(r.voice_engine==='chatterbox'?'Chatterbox V3 autorizado. A voz expressiva acompanha os gestos ilustrativos.':'Kokoro autorizado. A voz controla os vídeos da Lia, sem GPU.'));
 }catch(e){session.renderReady=false;status('Não foi possível ativar o motor: '+String(e.message).slice(0,110));}
}
function close(){const wasActive=session.active;introNeural=null;document.body?.classList.remove('lia-call-visible');stopVoiceProgress();if(ui.play)ui.play.hidden=true;if(ui.view?.dataset)ui.view.dataset.captions='off';if(captionSwitch){captionSwitch.setAttribute('aria-pressed','false');captionSwitch.textContent='Ativar legendas';}if(speaker){speaker.hidden=true;}if($('freeVideoMore'))$('freeVideoMore').open=false;session.active=false;session.connected=false;session.waiting=false;session.motorPending=null;setHandsFree(false);abortSpeech();stopRecognition();stopCamera();clearInterval(session.interval);session.interval=null;session.clock=0;stopGroup(idlePlayers,wasActive&&webNeuralPlayback());motion.idleActive=null;if(wasActive&&webNeuralPlayback())window.EducaLiaFreeNeural?.stop?.('');if(ui.portraitStill)ui.portraitStill.hidden=false;indicator('Lia realista • chamada encerrada');}
function incoming(){close();if($('freeVideoMore'))$('freeVideoMore').open=false;if(ui.text){ui.text.hidden=true;ui.text.setAttribute('aria-expanded','false');}free()?.enterVideo?.();session.active=true;ui.name.textContent='Lia';ui.duration.textContent='Videochamada recebida';subtitle('Uma pessoa desconhecida está chamando por vídeo.');status('Chamada educativa com IA. A Lia responde por voz e tenta usar o melhor sincronismo disponível.');indicator('Lia realista • aguardando chamada');if(document.documentElement?.dataset?.educaPlatform==='web'||selectedEngine()==='gratuita'){
  session.renderReady=false;session.teamCode='';session.motorPending=null;
 }else session.motorPending=inspectMotor().finally(()=>{session.motorPending=null;});
 // A voz online só é consultada quando o operador a habilitou no Worker.
 // A Web não baixa o Kokoro pesado no iPhone durante o treino.
 session.hqVoiceEnabled=false;session.hqVoiceCheck=null;
 // Nunca consultar o serviço pago ElevenLabs no modo Web da LIA.
 // Baixar/preparar a voz local antes de o usuário apertar Atender.
 if(selectedEngine()==='gratuita'&&!window.EducaLiaWarm?.state?.().recovered){
   if(webNeuralPlayback())prepareIntroNeural();
   else void window.EducaLiaWarm?.warm?.({manual:true}).catch(()=>{});
  }
 const browser=window.EducaLiaBrowserKokoro;
 if(browser&&selectedEngine()==='feminina'&&
    document.documentElement?.dataset?.educaPlatform!=='web')
  void browser.prepare().catch(()=>{});
 // O aquecimento local acontece após o gesto do aluno; o Worker continua disponível para fallback.

 if(/^(localhost|127\.0\.0\.1)$/.test(window.location?.hostname||''))void fetch('/api/modo-livre/preload',{method:'POST',credentials:'same-origin'}).catch(()=>{});
 ui.answer.hidden=false;ui.mic.hidden=true;if(speaker)speaker.hidden=true;ui.repeat.hidden=true;ui.camera.hidden=true;ui.form.hidden=true;ui.actions.hidden=true;window.EducaFreeView?.setView('free-video');if(typeof window.requestAnimationFrame==='function')window.requestAnimationFrame(syncLiaCallLayout);}
async function answer(){if(!session.active||session.connected)return;
 // Desbloqueia WebAudio durante o clique do usuário, antes da síntese ONNX.
 // No Safari, criar o AudioContext só depois do áudio ficar pronto é tarde.
 primeSpeechMotion();syncLiaCallLayout();session.connected=true;
 if(webNeuralPlayback()){
  allowRecoveredNeural=true;
  prepareIntroNeural();
 }
 session.clock=0;ui.answer.hidden=true;ui.mic.hidden=false;if(speaker)speaker.hidden=false;if(ui.text)ui.text.hidden=false;ui.repeat.hidden=false;ui.camera.hidden=false;ui.form.hidden=true;ui.actions.hidden=false;
 session.interval=setInterval(()=>{if(!session.active)return;session.clock++;ui.duration.textContent=String(Math.floor(session.clock/60)).padStart(2,'0')+':'+String(session.clock%60).padStart(2,'0')+' · chamada educativa';},1000);
 ui.duration.textContent='00:00 · chamada educativa';idleMotion();
 const intro='Oi, sou a Lia. Troquei de celular e estou precisando de um favor. Você pode me emprestar R$ 350 pelo Pix de treino? Eu devolvo depois.';
 // Safari: aguardar no máximo uma fração de segundo pela consulta gratuita de
 // status para não começar com voz robótica por uma corrida de inicialização.
 const web=document.documentElement?.dataset?.educaPlatform==='web';
 // Resposta Web não aguarda status ElevenLabs: usa a Dora neural local.
 if(!session.active||!session.connected)return;
 free()?.videoAccepted?.();speak(intro);}
function listen(){
 if(!session.active||!session.connected||session.waiting||session.rec||session.utterance||document.hidden)return;
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){setHandsFree(false);status('Reconhecimento de voz indisponível. Você ainda pode digitar.');return;}
 try{
  const r=new SR();session.rec=r;
  r.lang='pt-BR';r.continuous=true;r.interimResults=true;r.maxAlternatives=1;
  let submitted=false,heard='',finalized='',pendingTimer=null;
  const cancelCommit=()=>{clearTimeout(pendingTimer);pendingTimer=null;};
  const submit=()=>{
   cancelCommit();
   if(submitted||session.rec!==r)return;
   const phrase=finalized.trim().slice(0,350);
   if(!phrase)return;
   submitted=true;session.rec=null;
   r.onend=r.onerror=r.onresult=r.onspeechend=null;
   try{r.stop();}catch(_){}
   if(session.active&&session.connected&&!session.waiting){
    subtitle('Você: '+phrase);status('Entendi. A Lia está respondendo…');
    free()?.sendVideo?.(phrase);
   }
  };
  status('Ouvindo em português brasileiro. Fale normalmente.');
  r.onresult=e=>{
   if(submitted||session.rec!==r)return;
   let final='',partial='';
   // continuous=true pode entregar vários segmentos completos em uma fala.
   // Reconstrói todos os resultados para evitar repetir ou truncar frases.
   for(let i=0;i<e.results.length;i++){
    const item=e.results[i],words=item?.[0]?.transcript?.trim();
    if(!words)continue;
    if(item.isFinal)final+=(final?' ':'')+words;
    else partial+=(partial?' ':'')+words;
   }
   if(partial){heard=partial;status('Ouvindo: '+partial.slice(0,120));}
   if(final){
    finalized=final;
    // Um resultado final pode ser apenas a primeira parte de uma frase.
    // Espere uma pausa curta; se outra parte chegar, reinicie a janela.
    cancelCommit();
    if(!partial)pendingTimer=setTimeout(submit,
     document.documentElement?.dataset?.educaPlatform==='web'?320:VOICE_COMMIT_MS);
   }else cancelCommit();
  };
  r.onspeechend=()=>{if(!submitted){cancelCommit();try{r.stop();}catch(_){}}};
  r.onnomatch=()=>{if(session.rec===r)status('Não entendi. Pode repetir?');};
  r.onerror=e=>{
   if(session.rec!==r)return;
   cancelCommit();session.rec=null;
   const denied=['not-allowed','service-not-allowed','audio-capture'].includes(e.error);
   if(denied){setHandsFree(false);status('Microfone indisponível ou sem permissão. Use o teclado.');}
   else{status(e.error==='network'?'Serviço de reconhecimento de voz indisponível.':'Não entendi bem. Vou continuar ouvindo.');scheduleListen(e.error==='network'?2500:750);}
  };
  r.onend=()=>{
   if(session.rec===r){
    if(finalized){submit();return;}
    // Alguns navegadores encerram após uma fala parcial, sem fornecer isFinal.
    if(heard.trim().length>=5){finalized=heard;submit();return;}
    cancelCommit();session.rec=null;scheduleListen(heard?350:600);
   }
  };
  r.start();
 }catch(_){session.rec=null;setHandsFree(false);status('Falha ao abrir o microfone. Continue pelo teclado.');}
}
async function toggleCamera(){if(!session.active||!session.connected)return;if(session.stream){stopCamera();status('Sua câmera foi desligada.');return;}
 try{if(!navigator.mediaDevices?.getUserMedia)throw Error('unsupported');const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});if(!session.active||!session.connected){stream.getTracks().forEach(t=>t.stop());return;}session.stream=stream;ui.video.srcObject=stream;ui.video.hidden=false;ui.selfPlaceholder.hidden=true;ui.camera.setAttribute('aria-pressed','true');ui.camera.setAttribute('aria-label','Desligar câmera');ui.camera.title='Desligar câmera';status('Câmera ligada SOMENTE no seu dispositivo. Nenhum vídeo seu é enviado.');}catch(_){status('Câmera indisponível ou sem permissão. Continue sem ela.');}}
function addLine(role,text){if(!session.active)return;if(role==='user'){if(webNeuralPlayback()&&window.EducaLiaFreeNeural?.getDiagnostics?.().pending>0)window.EducaLiaFreeNeural?.stop?.('');abortSpeech();stopRecognition();session.waiting=true;ui.send.disabled=true;subtitle('Você: '+text);status('A IA está preparando uma resposta…');}else{session.waiting=false;ui.send.disabled=false;/* A legenda é liberada somente quando o áudio começar de fato. */}}
function reply(text){session.waiting=false;ui.send.disabled=false;speak(text);}
function error(t){session.waiting=false;ui.send.disabled=false;status(t||'A inteligência artificial está indisponível.');scheduleListen(900);}
// O botão de diagnóstico é visível para orientar a equipe e verificar o motor.
// A renderização permanece protegida pelo código privado no Worker.
if(ui.setup){ui.setup.hidden=false;ui.setup.textContent='Verificar voz feminina da Lia';}
async function inspectMotor(){
 session.renderReady=false;session.teamCode='';
 try{
  const r=await (await fetchOk('/api/avatar/health')).json();session.health=r;
  if(r.enabled&&r.voice_installed&&r.local&&/^(localhost|127\.0\.0\.1)$/.test(location.hostname)){
   session.renderReady=true;session.teamCode='educa-local';
   indicator('Lia feminina · Kokoro pronto');
   status('Voz feminina Dora detectada no Educa+.');
   void fetch('/api/avatar/preload',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).catch(()=>{});
  } else if(r.enabled&&r.public_voice&&r.voice_installed){
   session.renderReady=true;session.teamCode='educa-online';
   indicator(r.video_enabled?'Lia online · Kokoro + MuseTalk':'Lia online · Kokoro pf_dora');
   status(r.video_enabled?'Kokoro e MuseTalk online para esta chamada.':'Kokoro disponível na hospedagem; a videochamada usa a voz oficial automaticamente.');
  } else if(r.enabled&&r.video_enabled){
   indicator('Motor neural detectado · autenticação necessária');
   status('Motor de voz e MuseTalk disponíveis. Use Verificar avatar com IA para liberar a geração neural.');
  } else if(document.documentElement?.dataset?.educaPlatform==='web'){
   indicator('Lia · Dora neural brasileira gratuita');
   status('Preparando a voz neural feminina local. A primeira carga baixa o modelo; próximas falas usam o cache.');
  } else {
   indicator('Educa+ online · voz do navegador');
   status('A voz feminina depende das vozes instaladas no aparelho ou do motor neural configurado.');
  }
 }catch(_){session.health={enabled:false};}
}

// A escolha fica explícita. A voz do aparelho só é utilizada se a pessoa selecioná-la.
voiceEngine?.addEventListener('change',()=>{
 if(!window.EducaLiaFreeNeural)return;
 abortSpeech();
 if(selectedEngine()==='gratuita'){
  allowRecoveredNeural=true;
   indicator('Lia · voz neural gratuita pt-BR');
  status('Dora neural gratuita selecionada. O modelo prepara no aparelho sem cobrança.');
  void window.EducaLiaWarm?.warm?.({manual:true}).catch(()=>{});
 }else{
  indicator('Lia · voz do navegador');
  status('Voz alternativa do próprio dispositivo selecionada.');
 }
});
if(typeof window.addEventListener==='function')window.addEventListener('educa-lia-free-neural-progress',event=>{
 if(session.active&&selectedEngine()==='gratuita'){
  const stage=String(event.detail?.stage||'').slice(0,95);
  if(!session.connected||session.utterance?.kind==='neural-gratis-loading')
   showVoiceProgress('LIA · '+stage);
 }
});
ui.answer?.addEventListener('pointerup',()=>{if(webNeuralPlayback())primeSpeechMotion();},{passive:true});
 ui.answer?.addEventListener('click',()=>{void answer();});ui.hang?.addEventListener('click',()=>free()?.hangupVideo?.());ui.setup?.addEventListener('click',()=>{void configure();});
 $('freeVideoVoiceSettings')?.addEventListener('click',()=>{abortSpeech();window.EducaLiaVoice?.openSettings?.();});
ui.mic?.addEventListener('click',()=>{if(session.micEnabled){setHandsFree(false);status('Microfone desativado.');}else{primeSpeechMotion();setHandsFree(true);abortSpeech();listen();}});
ui.text?.addEventListener('click',()=>{if(!session.active||!session.connected)return;const opening=ui.form.hidden;ui.form.hidden=!opening;ui.text.setAttribute('aria-expanded',String(opening));if(opening)ui.input.focus?.();});
ui.repeat?.addEventListener('click',()=>{if(session.active&&session.connected&&!session.waiting&&session.lastSpoken)speak(session.lastSpoken);});
ui.camera?.addEventListener('click',()=>{void toggleCamera();});
speaker?.addEventListener('click',()=>{
 outputMuted=!outputMuted;
 speaker.setAttribute('aria-pressed',String(outputMuted));
 speaker.setAttribute('aria-label',outputMuted?'Ativar som da Lia':'Silenciar som da Lia');
 speaker.title=outputMuted?'Ativar som da Lia':'Silenciar som da Lia';
 const s=session.utterance;
 if(s instanceof HTMLMediaElement)s.muted=outputMuted;
 else if(typeof SpeechSynthesisUtterance!=='undefined'&&s instanceof SpeechSynthesisUtterance){s.volume=outputMuted?0:1;try{if(outputMuted)window.speechSynthesis?.pause();else window.speechSynthesis?.resume();}catch(_){}}
 if(session.webAudioGain)session.webAudioGain.gain.value=outputMuted?0:1;
 status(outputMuted?'Som da Lia desligado. Toque novamente para ouvir.':'Som da Lia ligado.');
});
captionSwitch?.addEventListener('click',()=>{
 const on=ui.view?.dataset?.captions!=='on';if(ui.view?.dataset)ui.view.dataset.captions=on?'on':'off';
 captionSwitch.setAttribute('aria-pressed',String(on));captionSwitch.textContent=on?'Ocultar legendas':'Ativar legendas';
 if(on&&$('freeVideoMore'))$('freeVideoMore').open=false;
});
expand?.addEventListener('click',async()=>{
 try{
  if(document.fullscreenElement){await document.exitFullscreen();expand.setAttribute('aria-label','Expandir videochamada');expand.title='Expandir videochamada';}
  else if(ui.view?.requestFullscreen){await ui.view.requestFullscreen();expand.setAttribute('aria-label','Recolher videochamada');expand.title='Recolher videochamada';}
  else status('Tela cheia não disponível neste navegador.');
 }catch(_){status('Tela cheia indisponível neste dispositivo.');}
});
document.addEventListener('fullscreenchange',()=>{
 const on=!!document.fullscreenElement;
 if(ui.view)ui.view.classList.toggle('v115-fullscreen',on);
 if(expand){
   if(on){expand.setAttribute('aria-label','Recolher videochamada');expand.title='Recolher videochamada';}
   else{expand.setAttribute('aria-label','Expandir videochamada');expand.title='Expandir videochamada';}
 }
});

ui.play?.addEventListener('click',()=>{
 if(webNeuralPlayback())primeSpeechMotion();
 if(ui.play.dataset.retryVoice==='true'){
  delete ui.play.dataset.retryVoice;ui.play.hidden=true;
   if(selectedEngine()==='gratuita')allowRecoveredNeural=true;
  if(session.lastSpoken)speak(session.lastSpoken);
  return;
 }
 const media=session.utterance instanceof HTMLMediaElement?session.utterance:ui.portraitVideo;
 media?.play().then(()=>{ui.play.hidden=true;showVoiceProgress(
  document.documentElement?.dataset?.educaPlatform==='web'&&selectedEngine()==='gratuita'?
  'LIA falando · Dora neural gratuita':'LIA falando · voz do aparelho'
 );}).catch(()=>{showVoiceProgress('Áudio bloqueado: confira o som.');status('Não foi possível liberar a reprodução.');});});
ui.form?.addEventListener('submit',e=>{e.preventDefault();const t=ui.input.value.trim();if(!t||!session.active||!session.connected||session.waiting)return;ui.input.value='';ui.form.hidden=true;ui.text?.setAttribute('aria-expanded','false');abortSpeech();free()?.sendVideo?.(t);});
document.addEventListener('pointerdown',e=>{
 const menu=$('freeVideoMore');if(menu?.open&&!menu.contains(e.target))menu.open=false;
});
$('freeVideoVerify')?.addEventListener('click',()=>free()?.verifyVideo?.());$('freeVideoPix')?.addEventListener('click',()=>free()?.openPixVideo?.());
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopRecognition();abortSpeech();if(webNeuralPlayback())window.EducaLiaFreeNeural?.stop?.('');}else scheduleListen();});
 window.addEventListener?.('pagehide',()=>{if(webNeuralPlayback())window.EducaLiaFreeNeural?.stop?.('');});
window.EducaVideoCall=Object.freeze({incoming,close,addLine,reply,error,isActive:()=>session.active,isConnected:()=>session.connected});
})();
