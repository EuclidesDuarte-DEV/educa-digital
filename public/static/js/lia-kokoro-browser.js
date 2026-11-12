/* Educa+ Digital V111.32 — pf_dora: pré-aquecimento, áudio de abertura em cache e modo GPU testável. */
(()=>{
 'use strict';
 let worker=null,ready=null,readyResolve=null,readyReject=null,bootTimer=null;
 const PREF_KEY='educa-lia-kokoro-device-v11132';
 const INTRO_CACHE='lia-pf-dora-intro-v11132'; // Somente falas fixas; nunca cachear o que o aluno diz.
 const FIXED_INTRO=new Map([['Oi! Sou a Lia.','hello'],['Estou em outro celular.','phone']]);
 const memoryAudio=new Map();
 const inFlight=new Map();
 let seq=0,device='wasm',progress='Modelo não carregado',lastError='',detail={},introPending=null;
 try{if(localStorage.getItem(PREF_KEY)==='webgpu')device='webgpu';}catch(_){}
 function introKey(text,style){const id=style==='natural'&&FIXED_INTRO.get(String(text||'').trim());return id?'/static/lia-pf-dora-cache-'+id+'-11132.wav':null;}
 async function readIntro(text,style){
  const key=introKey(text,style);if(!key)return null;
  if(memoryAudio.has(key))return memoryAudio.get(key);
  try{
   if(typeof caches==='undefined')return null;
   const response=await (await caches.open(INTRO_CACHE)).match(key);
   if(!response)return null;
   const result={blob:await response.blob(),cues:JSON.parse(response.headers.get('X-Lia-Cues')||'[]'),voice:'pf_dora',cached:true};
   if(result.blob.size>1024){memoryAudio.set(key,result);return result;}
  }catch(_){/* Em navegação privada, Cache API pode estar bloqueada. */}
  return null;
 }
 function saveIntro(text,style,result){
  const key=introKey(text,style);if(!key)return;
  memoryAudio.set(key,result);
  try{
   if(typeof caches==='undefined')return;
   void caches.open(INTRO_CACHE).then(cache=>cache.put(key,new Response(result.blob,{headers:{'Content-Type':'audio/wav','X-Lia-Cues':JSON.stringify(result.cues)}}))).catch(()=>{});
  }catch(_){}
 }
 function confirmDevice(){try{localStorage.setItem(PREF_KEY,device);}catch(_){}return device;}

 const requests=new Map();
 const PREPARE_LIMIT_MS=120000; // download inicial pode demorar
 const SPEAK_LIMIT_MS=45000;  // evita spinner infinito se WebGPU/WASM travar
 function fail(message){
  const error=Error(message);lastError=message;progress='Falha: '+message;
  if(bootTimer){clearTimeout(bootTimer);bootTimer=null;}
  const reject=readyReject;ready=null;readyReject=null;readyResolve=null;
  if(worker){worker.terminate();worker=null;}
  if(reject)reject(error);
  for(const req of requests.values()){clearTimeout(req.timer);req.reject(error);}
  requests.clear();
 }
 function ensure(){
  if(worker)return worker;
  worker=new Worker('/static/js/lia-kokoro-worker.js?v=11157&mirror=2',{type:'module'});
  worker.onmessage=({data})=>{
   if(data.type==='progress'){
    progress=data.stage||progress;
    detail={stage:progress,device:data.device||device,tokens:data.tokens??null,elapsed_ms:data.elapsed_ms??null};
    return;
   }
   if(data.type==='ready'){
    if(bootTimer){clearTimeout(bootTimer);bootTimer=null;}
    progress='Modelo preparado em '+(data.device||device);
    lastError='';detail={stage:'ready',device:data.device||device};
    const resolve=readyResolve;readyResolve=null;readyReject=null;resolve?.(data);
    return;
   }
   if(data.type==='error'){
    const message=String(data.detail||'Falha no Kokoro');
    lastError=message;progress='Falha: '+message;
    if(data.id!=null&&requests.has(data.id)){
     const req=requests.get(data.id);requests.delete(data.id);clearTimeout(req.timer);req.reject(Error(message));
    }else fail(message);
    return;
   }
   if(data.type==='audio'){
    const req=requests.get(data.id);if(!req)return;
    requests.delete(data.id);clearTimeout(req.timer);
    progress='WAV pf_dora pronto';lastError='';
    const result={blob:new Blob([data.buffer],{type:'audio/wav'}),cues:data.viseme_cues||[],voice:data.voice};
    saveIntro(req.phrase,req.style,result);
    req.resolve(result);
   }
  };
  worker.onerror=err=>{fail('Falha no Web Worker: '+(err.message||'erro ao carregar bibliotecas'));};
  worker.onmessageerror=()=>fail('Falha ao transferir dados de áudio do Worker');
  return worker;
 }
 function prepare(){
  if(ready)return ready;
  lastError='';progress='Inicializando motor Kokoro…';
  ready=new Promise((resolve,reject)=>{readyResolve=resolve;readyReject=reject;});
  bootTimer=setTimeout(()=>fail('Preparação excedeu 120 segundos. Confira conexão, memória e CDN.'),PREPARE_LIMIT_MS);
  try{ensure().postMessage({type:'prepare',mode:device});}catch(err){fail('Não foi possível iniciar Worker: '+err.message);}
  return ready;
 }
 async function synthesize(text,style='natural'){
  const phrase=String(text||'').trim();
  if(!phrase)throw Error('Texto vazio');
  const key=style+'\n'+phrase;
  if(inFlight.has(key))return inFlight.get(key);
  // A proteção contra duplicação vale mesmo se o pré-aquecimento ainda estiver em curso.
  const task=(async()=>{
   const cached=await readIntro(phrase,style);
   if(cached)return cached;
   await prepare();
   const id=++seq;
   return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>fail('Síntese excedeu 45 segundos em '+device+'. Tente uma frase menor ou outro modo. Isso indica que a inferência travou ou está lenta, não que a voz foi reproduzida.'),SPEAK_LIMIT_MS);
    requests.set(id,{resolve,reject,timer,phrase,style});
    try{ensure().postMessage({type:'speak',id,text:phrase,style,mode:device});}
    catch(err){fail('Não foi possível solicitar síntese: '+err.message);}
   });
  })();
  inFlight.set(key,task);
  try{return await task;}finally{if(inFlight.get(key)===task)inFlight.delete(key);}
 }
 function prewarmIntro(){
  if(introPending)return introPending;
  // Pré-aquece somente o motor: as duas falas antigas ocupavam a fila
  // do Worker e impediam a primeira resposta ao atender a chamada.
  introPending=prepare().then(()=>true).catch(error=>{introPending=null;throw error;});
  return introPending;
 }
 function setDevice(value){
  if(!['wasm','webgpu'].includes(value))throw Error('Modo inválido');
  if(value===device)return;
  fail('Alteração de mecanismo para '+value+'.');
  introPending=null;memoryAudio.clear();inFlight.clear();
  device=value;lastError='';progress='Modelo não carregado ('+device+')';detail={};
 }
 window.EducaLiaBrowserKokoro=Object.freeze({
  prepare,synthesize,prewarmIntro,setDevice,confirmDevice,getStatus:()=>progress,getLastError:()=>lastError,
  isReady:()=>Boolean(ready&&readyResolve===null&&worker&&lastError===''),
  getDiagnostics:()=>({version:'11157',device,...detail,status:progress,error:lastError,pending:requests.size,cachedIntro:memoryAudio.size}),
  voice:'pf_dora',version:'11157'
 });
})();
