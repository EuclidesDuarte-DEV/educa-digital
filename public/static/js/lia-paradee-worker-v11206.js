/* Educa+ V112.06 — Paradee-8M Dora (pt-BR), Apache-2.0.
 * Inferência de fala ocorre 100% no dispositivo, sem cobrança por enunciado.
 * Modelo int8 ~8.5 MB servido pelo Worker com cache; runtime ONNX + eSpeak WASM.
 * Disponibilidade e qualidade variam conforme o navegador e a rede inicial.
 * Créditos: https://huggingface.co/eraldohug/Paradee-8M-PtBr
 */
import * as ort from 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/ort.webgpu.min.mjs';
import {createEspeak} from 'https://esm.sh/@spelling-creator/spellophone@0.2.1/browser?bundle';

const MODEL='/api/lia-free-model/onnx/paradee_dora_int8.onnx';
const CONFIG='/api/lia-free-model/config.json';
const ORT='https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/';
let engine=null,loading=null;
const tell=(stage,percent=null)=>postMessage({type:'progress',stage,percent});
const units=['zero','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
const tens=['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
const hundreds=['','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];
function numberPt(n){
 if(n<20)return units[n];if(n<100)return tens[Math.floor(n/10)]+(n%10?' e '+units[n%10]:'');
 if(n===100)return 'cem';
 if(n<1000)return hundreds[Math.floor(n/100)]+(n%100?' e '+numberPt(n%100):'');
 if(n===1000)return 'mil';return String(n);
}
function normalize(text){
 return String(text||'').replace(/<[^>]*>/g,' ').replace(/[\`*_#]/g,'')
  .replace(/R\$\s*(\d{1,4})(?!\d)/g,(_,raw)=>{
   const n=Number(raw);return n<=1000?numberPt(n)+(n===1?' real':' reais'):'R$ '+raw;
  })
  .replace(/[—–]/g,', ').replace(/\s+/g,' ').trim();
}
function wav(samples,rate=24000){
 const n=samples.length,buffer=new ArrayBuffer(44+2*n),v=new DataView(buffer);
 const tag=(pos,word)=>{for(let i=0;i<word.length;i++)v.setUint8(pos+i,word.charCodeAt(i));};
 tag(0,'RIFF');v.setUint32(4,36+2*n,true);tag(8,'WAVE');tag(12,'fmt ');
 v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
 v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);
 tag(36,'data');v.setUint32(40,n*2,true);
 for(let i=0;i<n;i++){
  const a=Math.max(-1,Math.min(1,Number(samples[i])||0));
  const fade=Math.min(1,i/100,(n-1-i)/100);
  v.setInt16(44+2*i,Math.round(a*fade*32767),true);
 }
 return buffer;
}
async function load(){
 if(engine)return engine;
 if(loading)return loading;
 loading=(async()=>{
  tell('Preparando voz neural brasileira gratuita…');
  ort.env.wasm.wasmPaths=ORT;ort.env.wasm.numThreads=1;
  const [configResponse,modelResponse,g2p]=await Promise.all([
   fetch(CONFIG,{cache:'force-cache'}),
   fetch(MODEL,{cache:'force-cache'}),
   createEspeak({cdn:'jsdelivr'})
  ]);
  if(!configResponse.ok||!modelResponse.ok)
   throw Error('Modelo neural gratuito indisponível (config '+configResponse.status+', ONNX '+modelResponse.status+').');
  tell('Carregando fonemas do português brasileiro…');
  await g2p.loadVoice('pt-br');
  const config=await configResponse.json();
  if(!config||typeof config.vocab!=='object')throw Error('Vocabulário do modelo inválido.');
  const weights=await modelResponse.arrayBuffer();
  if(weights.byteLength<1000000||weights.byteLength>12000000)throw Error('Arquivo neural incompleto.');
  tell('Inicializando modelo neural gratuito ('+Math.round(weights.byteLength/1000000)+' MB)…');
  const session=await ort.InferenceSession.create(weights,{executionProviders:['wasm']});
  if(!session.inputNames.includes('input_ids')||!session.inputNames.includes('speed'))
   throw Error('Versão de modelo incompatível.');
  engine={g2p,session,vocab:config.vocab};
  postMessage({type:'ready',voice:'Dora · Paradee-8M pt-BR',provider:'wasm',sampleRate:24000});
  return engine;
 })().catch(err=>{loading=null;throw err;});
 return loading;
}
async function speak(text,speed){
 const {g2p,session,vocab}=await load();
 const normalized=normalize(text).slice(0,300);
 if(!normalized)throw Error('Texto vazio.');
 const ipa=g2p.phonemes(normalized);
 if(!ipa||typeof ipa!=='string')throw Error('Português brasileiro indisponível.');
 const symbols=Array.from(ipa).filter(symbol=>Object.prototype.hasOwnProperty.call(vocab,symbol)).slice(0,510);
 if(symbols.length<2)throw Error('Texto não reconhecido pelo modelo.');
 const ids=[0,...symbols.map(ch=>Number(vocab[ch])),0];
 const inputIds=new ort.Tensor('int64',BigInt64Array.from(ids.map(BigInt)),[1,ids.length]);
 const ratio=Math.max(.85,Math.min(1.2,Number(speed)||1.03));
 const started=performance.now();
 const speedTensor=new ort.Tensor('float32',Float32Array.of(ratio),[1]);
 let outputs;
 try{
  outputs=await session.run({input_ids:inputIds,speed:speedTensor});
  const tensor=outputs.waveform||Object.values(outputs)[0];
  const pcm=typeof tensor.getData==='function'?await tensor.getData():tensor.data;
  if(!pcm||pcm.length<500)throw Error('O modelo não gerou amostras de áudio.');
  // Gerar WAV ANTES de liberar os tensores WASM e evitar crescimento a cada fala.
  const audio=wav(pcm,24000);
  return {audio,elapsed:Math.round(performance.now()-started),seconds:pcm.length/24000};
 }finally{
  try{inputIds.dispose?.();}catch(_){}
  try{speedTensor.dispose?.();}catch(_){}
  if(outputs)for(const tensor of new Set(Object.values(outputs)))
   try{tensor?.dispose?.();}catch(_){}
 }
}
self.onmessage=async({data})=>{
 if(!data||!['prepare','speak'].includes(data.type))return;
 try{
  if(data.type==='prepare'){await load();return;}
  const result=await speak(data.text,data.speed);
  postMessage({type:'audio',id:data.id,buffer:result.audio,elapsed_ms:result.elapsed,seconds:result.seconds},[result.audio]);
 }catch(err){
  postMessage({type:'error',id:data.id??null,message:String(err?.message||err).slice(0,240)});
 }
};
