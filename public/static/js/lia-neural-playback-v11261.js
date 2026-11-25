/* V112.61: reprodução única da Dora neural (mesmo TTS do vídeo da LIA).
   Nenhuma mensagem é enviada a serviços TTS externos ou guardada em cache. */
(()=>{
 'use strict';
 let active=null,context=null,serial=0;
 const engine=()=>window.EducaLiaFreeNeural;
 const warm=()=>window.EducaLiaWarm;
 function unlock(){
  const Ctx=window.AudioContext||window.webkitAudioContext;
  if(!Ctx)return;
  try{
   if(!context)context=new Ctx();
   if(context.state==='suspended')void context.resume().catch(()=>{});
  }catch(_){}
 }
 function split(text){
  const words=String(text||'').trim().slice(0,1200).match(/\S+\s*/g)||[];
  const parts=[];let chunk='';
  for(const word of words){
   if(chunk&&chunk.length+word.length>230){parts.push(chunk.trim());chunk='';}
   if(word.length>230){if(chunk){parts.push(chunk.trim());chunk='';}for(let i=0;i<word.length;i+=230)parts.push(word.slice(i,i+230));}
   else chunk+=word;
  }
  if(chunk.trim())parts.push(chunk.trim());
  return parts;
 }
 function releaseMedia(job){
  if(job.audio){
   const audio=job.audio;job.audio=null;
   audio.onplaying=null;audio.onended=null;audio.onerror=null;
   try{audio.pause();audio.removeAttribute('src');audio.load?.();}catch(_){}
  }
  if(job.source){try{job.source.stop();}catch(_){}job.source.onended=null;job.source=null;}
  if(job.url){try{URL.revokeObjectURL(job.url);}catch(_){}job.url=null;}
 }
 function stop(owner){
  const job=active;if(!job||owner&&job.owner!==owner)return;
  active=null;job.cancelled=true;
  releaseMedia(job);
  const resolve=job.resolveSegment;job.resolveSegment=null;resolve?.(false);
  warm()?.endSpeech?.();
 }
 function isCurrent(job){return active===job&&!job.cancelled;}
 function playSegment(job,blob){
  return new Promise(resolve=>{
   if(!isCurrent(job)){resolve(false);return;}
   let completed=false;
   const finish=ok=>{
    if(completed)return;completed=true;
    if(job.resolveSegment===finish)job.resolveSegment=null;
    releaseMedia(job);resolve(ok);
   };
   job.resolveSegment=finish;
   const started=()=>{if(!isCurrent(job))return;if(!job.started){job.started=true;job.onStart?.();}};
   const attemptContext=async()=>{
    if(!isCurrent(job))return finish(false);
    if(!context||context.state!=='running'||typeof context.decodeAudioData!=='function')return finish(false);
    try{
     const pcm=await context.decodeAudioData(await blob.arrayBuffer());
     if(!isCurrent(job))return finish(false);
     const source=context.createBufferSource();job.source=source;source.buffer=pcm;source.connect(context.destination);
     source.onended=()=>finish(true);source.start(0);started();
    }catch(_){finish(false);}
   };
   try{
    const audio=new Audio();job.audio=audio;
    job.url=URL.createObjectURL(blob);audio.src=job.url;
    audio.onplaying=started;
    audio.onended=()=>finish(true);
    audio.onerror=()=>{void attemptContext();};
    Promise.resolve(audio.play()).catch(()=>{void attemptContext();});
   }catch(_){void attemptContext();}
  });
 }
 async function speak(text,{owner='guide',speed=1.05,onStart=()=>{},onEnd=()=>{},onError=()=>{},onBlocked=()=>{}}={}){
  stop();
  const parts=split(text),neural=engine();
  if(!parts.length)return false;
  if(!neural?.speak){onError(Error('Motor Dora neural indisponível'));return false;}
  const job={id:++serial,owner,cancelled:false,started:false,audio:null,source:null,url:null,resolveSegment:null,onStart};
  active=job;
  warm()?.beginSpeech?.();
  try{
   for(const phrase of parts){
    if(!isCurrent(job))return false;
    const result=await neural.speak(phrase,{speed});
    if(!isCurrent(job))return false;
    if(!result?.blob||result.blob.size<1024)throw Error('WAV neural inválido');
    const played=await playSegment(job,result.blob);
    if(!isCurrent(job))return false;
    if(!played){stop(owner);onBlocked();return false;}
   }
   if(isCurrent(job)){stop(owner);onEnd();return true;}
   return false;
  }catch(error){
   if(isCurrent(job)){stop(owner);onError(error);}
   return false;
  }
 }
 window.EducaLiaNeuralPlayback=Object.freeze({speak,stop,unlock,voice:'Dora · Paradee-8M',version:'11261'});
})();
