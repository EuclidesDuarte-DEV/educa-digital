import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import apiWorker from '../src/worker.js';
import {responderModoLivre} from '../src/free-chat.js';

const browser=readFileSync('public/static/js/lia-kokoro-browser.js','utf8');
const video=readFileSync('public/static/js/free-video.js','utf8');
const html=readFileSync('public/html/index.html','utf8');
const apiSrc=readFileSync('src/worker.js','utf8');

function bootKokoro({platform='web',gpu=false,cores=8,memory=8,coarse=false,stored=null,
  gpuFailure=false}={}){
 const messages=[];
 const attempts=[];
 class WorkerMock{
  constructor(){this.onmessage=null;}
  postMessage(data){
   messages.push(data);
   if(data.type==='prepare'){
    attempts.push(data.mode);
    queueMicrotask(()=>{
     if(data.mode==='webgpu'&&gpuFailure)
      this.onmessage?.({data:{type:'error',id:null,detail:'GPU failed'}});
     else this.onmessage?.({data:{type:'ready',device:data.mode}});
    });
   }else if(data.type==='speak'){
    queueMicrotask(()=>this.onmessage?.({data:{type:'audio',id:data.id,voice:'pf_dora',
     buffer:new Uint8Array(2200).buffer,viseme_cues:[]}}));
   }
  }
  terminate(){}
 }
 const context={
  window:{},Worker:WorkerMock,Blob,Map,Set,Object,Error,Promise,Array,String,
  Uint8Array,Number,JSON,Math,Date,setTimeout,clearTimeout,queueMicrotask,
  document:{documentElement:{dataset:{educaPlatform:platform}}},
  navigator:{gpu:gpu?{}:undefined,hardwareConcurrency:cores,
   deviceMemory:memory,connection:{saveData:false}},
  matchMedia:()=>({matches:coarse}),
  localStorage:{getItem:()=>stored,setItem:()=>{}}
 };
 vm.runInNewContext(browser,context);
 return {api:context.window.EducaLiaBrowserKokoro,messages,attempts};
}
test('V111.94 Web — GPU moderna escolhe FP32 para voz feminina sem API paga',async()=>{
 const {api,attempts,messages}=bootKokoro({gpu:true});
 await api.prewarmIntro();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(attempts[0],'webgpu');
 assert.equal(api.getDiagnostics().device,'webgpu');
 assert.equal(api.getDiagnostics().autoDevice,true);
 assert.equal(messages.filter(m=>m.type==='speak').length,1);
 assert.equal(messages.find(m=>m.type==='speak').text,'Oi, sou a Lia.');
});
test('V111.94 Web — GPU com falha retorna automaticamente ao CPU q8',async()=>{
 const {api,attempts}=bootKokoro({gpu:true,gpuFailure:true});
 assert.equal(await api.prewarmIntro(),true);
 assert.deepEqual(attempts,['webgpu','wasm']);
 assert.equal(api.getDiagnostics().device,'wasm');
});
test('V111.94 Web — aparelho mobile, pouca memória ou modo economizar dados usam q8',async()=>{
 for(const opts of [
  {gpu:true,platform:'android'}, {gpu:true,platform:'ios'},
  {gpu:true,coarse:true}, {gpu:true,memory:4},
  {gpu:true,cores:2}, {gpu:false}, {gpu:true,stored:'wasm'}
 ]){
  const {api,attempts}=bootKokoro(opts);
  await api.prewarmIntro();
  assert.equal(attempts[0],'wasm',JSON.stringify(opts));
 }
});
test('V111.94 — preferência manual webgpu é preservada',async()=>{
 const {api,attempts}=bootKokoro({gpu:false,stored:'webgpu'});
 await api.prewarmIntro();
 assert.equal(attempts[0],'webgpu');
});
test('V111.94 — proxy Cloudflare serve somente ONNX fp32 oficial, sem SSRF',async()=>{
 const original=globalThis.fetch;
 try{
  let upstream='';
  globalThis.fetch=async url=>{
   upstream=String(url);
   return new Response(new Uint8Array(2000),{headers:{'Content-Type':'application/octet-stream'}});
  };
  const r=await apiWorker.fetch(new Request('https://educa.example/api/lia-model/onnx/model.onnx'),{});
  assert.equal(r.status,200);
  assert.equal(upstream,'https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/onnx/model.onnx');
  const bad=await apiWorker.fetch(new Request('https://educa.example/api/lia-model/onnx/../private.env'),{});
  assert.equal(bad.status,404);
 }finally{globalThis.fetch=original;}
});
test('V111.94 — LIA Web reduz espera sem cair em TTS cobrado',()=>{
 assert.match(video,/document\.documentElement\?\.dataset\?\.educaPlatform==='web'\?320:VOICE_COMMIT_MS/);
 assert.match(video,/browser\.isReady\?\.\(\)\?2600:1200/);
 assert.match(video,/session\.fastVoiceSerial=serial; \/\/ evita troca de timbre/);
 assert.match(video,/session\.hqVoiceEnabled=false;/);
 const incoming=video.split('function incoming(){')[1].split('async function answer(){')[0];
 // V112.02: consulta de status não cobra; síntese só com flag/credenciais.
 assert.doesNotMatch(incoming,/inspectWebHQVoice\(/);
 assert.match(incoming,/EducaLiaWarm\?\.warm\?\.\(\{manual:true\}\)/);
 assert.match(video,/session\.hqVoiceEnabled=enabled/);
 assert.match(video,/localKokoro\.isFast\?\.\(\)===false/);
 assert.match(video,/selectedStyle\(\)==='clara'\?1\.02:1\.00/);
 assert.match(html,/lia-kokoro-browser\.js\?v=11157&mirror=2&warm=11191&intro=11192&free=11194/);
 assert.match(html,/free-video\.js\?v=11191&patch=11191&natural=11192&hq=11193&free=11194/);
 assert.match(apiSrc,/\'onnx\/model\.onnx\'/);
});
test('V111.94 — rota Web entrega respostas menores; rota nativa mantém limite',async()=>{
 const prompts=[];
 const env={AI:{run:async(model,options)=>{
  prompts.push(options);
  return {choices:[{message:{content:'Entendi. É melhor confirmar pelo contato antigo antes de tomar qualquer decisão.'}}]};
 }}};
 const makeRequest=route=>new Request('https://educa.example/api/modo-livre/'+route,{
  method:'POST',headers:{Origin:'https://educa.example'},
  body:JSON.stringify({scenario:'video',message:'Quem está falando?',history:[]})
 });
 const web=await responderModoLivre(makeRequest('conversar-web'),env,true);
 assert.equal(web.status,200);assert.equal(prompts[0].max_completion_tokens,85);
 const native=await responderModoLivre(makeRequest('conversar'),env,false);
 assert.equal(native.status,200);assert.equal(prompts[1].max_completion_tokens,150);
});
