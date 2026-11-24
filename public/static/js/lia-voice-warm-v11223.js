/* Educa+ V112.23 — LIA: aquecimento inteligente sem esgotar memória.
   A voz Dora é inferida localmente; Cloudflare entrega pesos cacheáveis.
   Não enviar conversas nem textos ao servidor durante este aquecimento. */
(()=>{
 'use strict';
 const KEY='educa-lia-neural-inflight-v11223';
 const WARM_KEY='educa-lia-warm-inflight-v11223';
 const iOS=/iPad|iPhone|iPod/i.test(navigator.userAgent||'')||
   (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const lowRam=Number(navigator.deviceMemory)>0&&Number(navigator.deviceMemory)<4;
 let interrupted=false;
 try{
  const stamp=Math.max(Number(sessionStorage.getItem(KEY)||0),Number(sessionStorage.getItem(WARM_KEY)||0));
  interrupted=Number.isFinite(stamp)&&stamp>Date.now()-180000&&stamp<Date.now()+5000;
  sessionStorage.removeItem(KEY);
  sessionStorage.removeItem(WARM_KEY);
 }catch(_){}
 const sensitive=iOS||lowRam||interrupted;
 let warmed=false,warming=null,attempts=0,started=0;
 const listener=()=>window.EducaLiaFreeNeural;
 function state(){return Object.freeze({
  mode:sensitive?'leve':'neural',iOS,lowRam,recovered:interrupted,warmed:!!listener()?.isReady?.(),
  warming:!!warming,attempts,elapsedMs:started?Date.now()-started:0
 });}
 function beginSpeech(){
  try{sessionStorage.setItem(KEY,String(Date.now()));}catch(_){}
 }
 function endSpeech(){
  try{sessionStorage.removeItem(KEY);}catch(_){}
 }
 function warm({manual=false}={}){
  const engine=listener();
  if(!engine?.prepare)return Promise.resolve({skipped:true,reason:'motor ainda nao carregado'});
  if(engine.isReady?.()){warmed=true;return Promise.resolve({ready:true,fromCache:true});}
  // Safari e aparelhos com pouca memoria: jamais inicializar ONNX ao abrir a
  // pagina. Se o participante selecionar explicitamente Dora, pode tentar.
  if(sensitive&&!manual)return Promise.resolve({skipped:true,reason:'modo leve evita recarregamento'});
  if(document.hidden&&!manual)return Promise.resolve({skipped:true,reason:'aba em segundo plano'});
  if(navigator.connection?.saveData&&!manual)return Promise.resolve({skipped:true,reason:'economia de dados'});
  if(warming)return warming;
  if(!manual&&attempts>=1)return Promise.resolve({skipped:true,reason:'aquecimento ja tentado'});
  attempts++;started=Date.now();
  try{sessionStorage.setItem(WARM_KEY,String(started));}catch(_){}
  warming=Promise.resolve().then(()=>engine.prepare()).then(result=>{
   warmed=true;return {ready:true,elapsedMs:Date.now()-started,...result};
  }).catch(error=>{
   warmed=false;return {ready:false,error:String(error?.message||error).slice(0,120)};
  }).finally(()=>{warming=null;try{sessionStorage.removeItem(WARM_KEY);}catch(_){}});
  return warming;
 }
 let bootTimer=null;
 function schedule(){
  if(sensitive)return;
  if(bootTimer!==null)return;
  bootTimer=setTimeout(()=>{bootTimer=null;void warm();},4200);
 }
 if(document.readyState==='complete')schedule();
 else window.addEventListener('load',schedule,{once:true});
 window.addEventListener('pageshow',()=>{if(!sensitive&&!warmed&&!warming&&attempts===0)schedule();});
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&bootTimer!==null){clearTimeout(bootTimer);bootTimer=null;}
  else if(!sensitive&&!warmed&&!warming&&attempts===0)schedule();
 });
 window.EducaLiaWarm=Object.freeze({state,warm,beginSpeech,endSpeech,isMemorySensitive:()=>sensitive});
})();
