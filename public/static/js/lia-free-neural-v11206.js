/* Educa+ V112.06 — ciclo de vida da voz neural gratuita pt-BR.
   A voz real é gerada por ONNX no Web Worker: o texto nunca vai a API TTS.
   License: Paradee-8M Pt-BR (Apache-2.0), Eraldo R./astrowar. */
(()=>{
 'use strict';
 let worker=null,ready=false,loading=null,resolveReady=null,rejectReady=null,seq=0;
 let lastError='',lastMs=null;const pending=new Map();
 const progress=stage=>{
  try{window.dispatchEvent(new CustomEvent('educa-lia-free-neural-progress',{detail:{stage}}));}catch(_){}
 };
 function reset(message){
  lastError=message;ready=false;loading=null;
  if(rejectReady)rejectReady(Error(message));
  rejectReady=null;resolveReady=null;
  for(const item of pending.values()){clearTimeout(item.timer);item.reject(Error(message));}
  pending.clear();
  try{worker?.terminate();}catch(_){}
  worker=null;
 }
 function ensureWorker(){
  if(worker)return worker;
  worker=new Worker('/static/js/lia-paradee-worker-v11206.js?v=11206',{type:'module'});
  worker.onmessage=({data})=>{
   if(data.type==='progress'){progress(data.stage||'Preparando voz…');return;}
   if(data.type==='ready'){
    ready=true;lastError='';
    const resolve=resolveReady;resolveReady=null;rejectReady=null;
    resolve?.({provider:data.provider,voice:data.voice});
    progress('Voz neural brasileira pronta.');return;
   }
   if(data.type==='audio'){
    const req=pending.get(data.id);if(!req)return;
    pending.delete(data.id);clearTimeout(req.timer);
    lastMs=Number(data.elapsed_ms)||null;
    const blob=new Blob([data.buffer],{type:'audio/wav'});
    req.resolve({blob,elapsed_ms:lastMs,seconds:data.seconds,voice:'Dora · Paradee-8M'});
    return;
   }
   if(data.type==='error'){
    if(data.id==null){reset(data.message||'Falha ao carregar a voz gratuita.');return;}
    const req=pending.get(data.id);
    if(req){pending.delete(data.id);clearTimeout(req.timer);req.reject(Error(data.message||'Falha na voz neural.'));}
   }
  };
  worker.onerror=e=>{e.preventDefault();reset('O motor neural gratuito não pôde iniciar neste navegador.');};
  return worker;
 }
 function prepare(){
  if(ready)return Promise.resolve({voice:'Dora · Paradee-8M'});
  if(loading)return loading;
  let timeout=null;
  loading=new Promise((resolve,reject)=>{
   resolveReady=resolve;rejectReady=reject;
   timeout=setTimeout(()=>reset('O carregamento inicial da voz neural demorou demais.'),60000);
   try{ensureWorker().postMessage({type:'prepare'});}catch(e){reset(String(e?.message||e));}
  }).then(v=>{clearTimeout(timeout);loading=null;return v;},e=>{
   clearTimeout(timeout);loading=null;throw e;
  });
  return loading;
 }
 async function speak(text,{speed=1.03}={}){
  await prepare();
  if(!ready)throw Error('Modelo neural não está pronto.');
  const id=++seq;
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{
    pending.delete(id);
    reject(Error('O áudio gratuito demorou a ser gerado. Tente novamente.'));
   },16000);
   pending.set(id,{resolve,reject,timer});
   try{worker.postMessage({type:'speak',id,text:String(text).slice(0,300),speed});}
   catch(e){clearTimeout(timer);pending.delete(id);reject(e);}
  });
 }
 window.EducaLiaFreeNeural=Object.freeze({
  prepare,speak,isReady:()=>ready,getDiagnostics:()=>({ready,lastError,lastSynthesisMs:lastMs})
 });
})();
