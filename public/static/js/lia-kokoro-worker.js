/* Educa+ V111.32 - TTS neural exploratório em Web Worker, sem servidor pago.
 * Fonte dos modelos: Hugging Face Kokoro-82M-v1.0-ONNX (Apache-2.0).
 * Fonetização pt-BR: eSpeak NG via Spellophone (GPL-3.0-or-later).
 * OBS: compatibilidade externa depende das distribuições CDN/ONNX no dispositivo.
 * Nenhuma mensagem é transmitida a um serviço de voz: somente modelos estáticos são baixados.
 */
const MODEL='onnx-community/Kokoro-82M-v1.0-ONNX';
const VOICE='pf_dora';
// Modelos baixados via Worker Cloudflare, sem acesso direto a HF pelo navegador.
// O encaminhamento só permite arquivos oficiais numa lista fechada no backend.
const HUB='https://huggingface.co/'+MODEL+'/resolve/main/';
const nativeFetch=self.fetch.bind(self);
self.fetch=(resource,init)=>{
 const url=typeof resource==='string'?resource:resource?.url||String(resource);
 if(url.startsWith(HUB)){
  const rel=url.slice(HUB.length).split('?')[0];
  const dest=new URL('/api/lia-model/'+rel,self.location.origin);
  return nativeFetch(dest.href,init);
 }
 return nativeFetch(resource,init);
};
const VOICE_URL='/api/lia-model/voices/'+VOICE+'.bin';
let ready=null;
let engine=null;
let queue=Promise.resolve();
const say=(type,data={})=>self.postMessage({type,...data});
// Numerais monetários são escritos por extenso ANTES da fonetização.
// Preserva a mesma informação; evita que o espeak leia "R cifrão 350".
function valorPorExtenso(n){
 const units=['zero','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
 const tens=['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
 const hundreds=['','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];
 if(n<20)return units[n];
 if(n<100)return tens[Math.floor(n/10)]+(n%10?' e '+units[n%10]:'');
 if(n===100)return 'cem';
 if(n<1000)return hundreds[Math.floor(n/100)]+(n%100?' e '+valorPorExtenso(n%100):'');
 if(n===1000)return 'mil';
 return String(n);
}
function normalizeSpeechPtBR(text){
 return String(text||'').replace(/<[^>]*>/g,' ').replace(/[\*#_`]/g,'')
  .replace(/R\$\s*(\d{1,4})(?!\d)/g,(_,digits)=>{
    const n=Number(digits);
    if(n>1000)return 'R$ '+digits;
    return valorPorExtenso(n)+(n===1?' real':' reais');
  })
  .replace(/…/g,'...').replace(/[–—]/g,', ')
  .replace(/\s+/g,' ').trim();
}
function wav(samples,sampleRate=24000){
 const n=samples.length;
 const ab=new ArrayBuffer(44+n*2),d=new DataView(ab);
 function str(offset,s){for(let i=0;i<s.length;i++)d.setUint8(offset+i,s.charCodeAt(i));}
 str(0,'RIFF');d.setUint32(4,36+n*2,true);str(8,'WAVE');str(12,'fmt ');
 d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,1,true);
 d.setUint32(24,sampleRate,true);d.setUint32(28,sampleRate*2,true);
 d.setUint16(32,2,true);d.setUint16(34,16,true);str(36,'data');d.setUint32(40,n*2,true);
 for(let i=0;i<n;i++){
  // Rampa de 3 ms apenas nas bordas: evita estalos sem alterar o timbre.
  const fade=Math.min(1,i/72,(n-1-i)/72);
  const s=Math.max(-1,Math.min(1,(Number(samples[i])||0)*fade));
  d.setInt16(44+i*2,s<0?Math.round(s*32768):Math.round(s*32767),true);
 }
 return ab;
}
function viseme(c){
 if(/[mɓbp]/u.test(c))return 'm';
 if(/[fvʋ]/u.test(c))return 'fv';
 if(/[iɪeɛ]/u.test(c))return 'ee';
 if(/[oɔ]/u.test(c))return 'oh';
 if(/[uʊw]/u.test(c))return 'oo';
 if(/[aɐəɜãõ]/u.test(c))return 'ah';
 return 'wide';
}
function approximateCues(ipa,duration){
 const phones=Array.from(ipa).filter(c=>/[a-zɐ-ʒãõɪʊəɛɔɓʋ]/iu.test(c)).slice(0,150);
 if(!phones.length)return [];
 const total=Math.min(duration,60000), weight=phones.map(p=>/[aeiouɐɛɔəãõ]/iu.test(p)?1.7:0.8);
 const sum=weight.reduce((a,b)=>a+b,0);
 let acc=0;const cues=[{at_ms:0,shape:'rest'}];
 for(let i=0;i<phones.length;i++){
  cues.push({at_ms:Math.min(total,Math.round(total*(acc/sum))),shape:viseme(phones[i])});acc+=weight[i];
 }
 cues.push({at_ms:Math.round(total),shape:'rest'});
 return cues;
}
async function load(deviceMode='wasm'){
 if(engine)return engine;
 if(ready)return ready;
 ready=(async()=>{
  say('progress',{stage:'Carregando motor Kokoro e fonetizador pt-BR (CDN)…'});
  const [kokoroModule,spellModule]=await Promise.all([
   import('https://esm.sh/kokoro-js@1.2.1?bundle'),
   import('https://esm.sh/@spelling-creator/spellophone@0.2.1/browser?bundle')
  ]);
  if(typeof kokoroModule.KokoroTTS?.from_pretrained!=='function'||typeof spellModule.createEspeak!=='function')throw new Error('Biblioteca neural não carregou.');
  say('progress',{stage:'Iniciando eSpeak WebAssembly…'});
  const g2p=await spellModule.createEspeak({cdn:'jsdelivr'});
  await g2p.loadVoice('pt-br');
  say('progress',{stage:'Fonetizador pt-BR carregado.'});
  say('progress',{stage:'Baixando modelo neural Kokoro (primeira vez pode demorar)…'});
  // CPU q8 como padrão: evita a compilação grande de shaders WebGPU fp32 na primeira fala.
  const device=deviceMode==='webgpu'?'webgpu':'wasm';
  const dtype=device==='webgpu'?'fp32':'q8';
  say('progress',{stage:'Carregando modelo Kokoro em '+device+'; downloads podem ser grandes…'});
  const tts=await kokoroModule.KokoroTTS.from_pretrained(MODEL,{device,dtype});
  say('progress',{stage:'Carregando arquivo da voz original pf_dora…'});
  const response=await fetch(VOICE_URL,{mode:'cors'});
  if(!response.ok)throw new Error('Arquivo de voz pf_dora indisponível ('+response.status+').');
  const voiceData=new Float32Array(await response.arrayBuffer());
  if(voiceData.length<256)throw new Error('Amostra de voz pf_dora inválida.');
  engine={tts,g2p,voiceData,device};
  say('ready',{voice:VOICE,device});return engine;
 })().catch(e=>{ready=null;throw e;});
 return ready;
}
async function synthesize(text,id,style){
 const {tts,g2p,voiceData,device}=await load();
 const phrase=normalizeSpeechPtBR(text).slice(0,360);
 if(!phrase)throw Error('Texto vazio');
 const ipa=g2p.phonemes(phrase);
 if(!ipa||typeof ipa!=='string')throw Error('Fonetização pt-BR falhou');
 say('progress',{stage:'Fonetizado em português; preparando entrada do Kokoro…',device});
 const ids=tts.tokenizer(ipa,{truncation:true}).input_ids;
 // Mesmo construtor Tensor usado internamente pelo modelo ONNX.
 const Tensor=ids.constructor;
 const tokens=Math.min(Math.max(ids.dims.at(-1)-2,0),509),offset=tokens*256;
 if(offset+256>voiceData.length)throw Error('Comprimento não suportado pela voz pf_dora');
 const speed=style==='calma'?.94:style==='clara'?.98:1.00; // ritmo original da pf_dora: sem artificialmente acelerar o timbre
 const input={input_ids:ids,style:new Tensor('float32',voiceData.slice(offset,offset+256),[1,256]),speed:new Tensor('float32',[speed],[1])};
 const started=Date.now();
 say('progress',{stage:'Executando inferência Kokoro ('+device+', '+tokens+' tokens)…',device,tokens});
 const {waveform}=await tts.model(input);
 say('progress',{stage:'Inferência concluída em '+((Date.now()-started)/1000).toFixed(1)+' segundos; codificando WAV…',device,tokens,elapsed_ms:Date.now()-started});
 const samples=waveform?.data;
 if(!samples||samples.length<1000)throw Error('Kokoro não produziu áudio utilizável');
 const buffer=wav(samples,24000);
 return {buffer,viseme_cues:approximateCues(ipa,samples.length/24)};
}
self.onmessage=({data})=>{
 if(!data||!['prepare','speak'].includes(data.type))return;
 queue=queue.catch(()=>{}).then(async()=>{
  try{
   if(data.type==='prepare'){await load(data.mode);return;}
   const result=await synthesize(data.text,data.id,data.style);
   self.postMessage({type:'audio',id:data.id,voice:VOICE,viseme_cues:result.viseme_cues,buffer:result.buffer},[result.buffer]);
  }catch(e){say('error',{id:data.id??null,detail:String(e?.message||e).slice(0,300)});}
 });
};
