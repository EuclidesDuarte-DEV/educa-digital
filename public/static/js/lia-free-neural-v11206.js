/* Educa+ V112.06 — ciclo de vida da voz neural gratuita pt-BR.
   A voz real é gerada por ONNX no Web Worker: o texto nunca vai a API TTS.
   License: Paradee-8M Pt-BR (Apache-2.0), Eraldo R./astrowar. */
(()=>{
 'use strict';
 let worker=null,ready=false,loading=null,resolveReady=null,rejectReady=null,seq=0;
 let lastError='',lastMs=null,provider='',idleTimer=null;const pending=new Map();
 const isWeb=()=>!document.documentElement?.dataset?.educaNativePlatform&&(!document.documentElement?.dataset?.educaPlatform||document.documentElement.dataset.educaPlatform==='web');
 const constrained=()=>isWeb()&&!!window.EducaLiaWarm?.isMemorySensitive?.();
 function cancelIdle(){clearTimeout(idleTimer);idleTimer=null;}
 function releaseIdle(){cancelIdle();if(!constrained())return;idleTimer=setTimeout(()=>{if(!pending.size&&!loading)reset('');},18000);}

 const progress=stage=>{
  try{window.dispatchEvent(new CustomEvent('educa-lia-free-neural-progress',{detail:{stage}}));}catch(_){}
 };
 function reset(message){
  cancelIdle();lastError=message;ready=false;loading=null;provider='';
  if(rejectReady)rejectReady(Error(message));
  rejectReady=null;resolveReady=null;
  for(const item of pending.values()){clearTimeout(item.timer);item.reject(Error(message));}
  pending.clear();
  try{worker?.terminate();}catch(_){}
  worker=null;
 }
 function ensureWorker(){
  if(worker)return worker;
  const web=isWeb();
  // Web usa entrada estática WASM-only, nativos preservam o motor anterior.
  worker=new Worker(web?'/static/js/lia-paradee-wasm-v11227.js?v=11227':'/static/js/lia-paradee-worker-v11206.js?v=11206',{type:'module'});
  const current=worker;
  worker.onmessage=({data})=>{
   if(worker!==current)return;
   if(data.type==='progress'){progress(data.stage||'Preparando voz…');return;}
   if(data.type==='ready'){
    ready=true;lastError='';provider=data.provider||'';
    const resolve=resolveReady;resolveReady=null;rejectReady=null;
    resolve?.({provider:data.provider,voice:data.voice});
    progress('Voz neural brasileira pronta.');releaseIdle();return;
   }
   if(data.type==='audio'){
    const req=pending.get(data.id);if(!req)return;
    pending.delete(data.id);clearTimeout(req.timer);
    lastMs=Number(data.elapsed_ms)||null;
    const blob=new Blob([data.buffer],{type:'audio/wav'});
    req.resolve({blob,elapsed_ms:lastMs,seconds:data.seconds,voice:'Dora · Paradee-8M'});releaseIdle();
    return;
   }
   if(data.type==='error'){
    if(data.id==null){reset(data.message||'Falha ao carregar a voz gratuita.');return;}
    const req=pending.get(data.id);
    if(req){pending.delete(data.id);clearTimeout(req.timer);req.reject(Error(data.message||'Falha na voz neural.'));}
   }
  };
  worker.onerror=e=>{e.preventDefault();if(worker===current)reset('O motor neural gratuito não pôde iniciar neste navegador: '+String(e.message||'erro').slice(0,160));};
  return worker;
 }
 function prepare(){
  cancelIdle();
  if(ready)return Promise.resolve({voice:'Dora · Paradee-8M'});
  if(loading)return loading;
  let timeout=null;
  const request=new Promise((resolve,reject)=>{
   resolveReady=resolve;rejectReady=reject;
   timeout=setTimeout(()=>reset('O carregamento inicial da voz neural demorou demais.'),30000);
   try{ensureWorker().postMessage({type:'prepare'});}catch(e){reset(String(e?.message||e));}
  }).then(v=>{clearTimeout(timeout);if(loading===request)loading=null;return v;},e=>{
   clearTimeout(timeout);if(loading===request)loading=null;throw e;
  });
  loading=request;return request;
 }
 async function speak(text,{speed=1.03}={}){
  await prepare();cancelIdle();
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
 // Interromper o motor e liberar a memoria caso um navegador móvel congele.
 // Não apaga conversas e não causa navegação ou reload da página.
 function stop(reason='Preparação pausada para preservar a estabilidade.') {
  reset(reason);
 }
 window.EducaLiaFreeNeural=Object.freeze({
  prepare,speak,stop,release:()=>{if(!pending.size&&!loading)reset('');},isReady:()=>ready,getDiagnostics:()=>({ready,lastError,lastSynthesisMs:lastMs,provider,pending:pending.size})
 });
})();
