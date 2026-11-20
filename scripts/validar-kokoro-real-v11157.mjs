/* V111.57 — prova real de síntese Kokoro no navegador, sem microfone ou pagamento. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const origin=process.env.PREVIEW_URL;
assert.ok(origin?.startsWith('https://'),'PREVIEW_URL https ausente');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:false});
 page.setDefaultTimeout(180000);
 const errors=[],network=[];
 page.on('pageerror',err=>errors.push(String(err.message||err).slice(0,180)));
 page.on('requestfailed',req=>network.push({kind:'fetch-failed',url:req.url().slice(0,230),detail:req.failure()?.errorText||''}));
 page.on('response',res=>{if(res.status()>=400)network.push({kind:'http-'+res.status(),url:res.url().slice(0,230)});});
 await page.goto(origin+'/html/',{waitUntil:'domcontentloaded',timeout:40000});
 await page.waitForFunction(()=>Boolean(window.EducaLiaBrowserKokoro),{timeout:15000});
 const started=Date.now();
 const out=await page.evaluate(async()=>{
  const engine=window.EducaLiaBrowserKokoro;
  try{
   await engine.prepare();
   // V111.91: cenário Web real, voz pf_dora da saudação fixa.
   // A segunda chamada deve sair do cache local, sem nova inferência ONNX.
   const phrase='Oi, sou a Lia.';
   const voice=await engine.synthesize(phrase,'natural');
   const secondStarted=Date.now();
   const reused=await engine.synthesize(phrase,'natural');
   const reuseMs=Date.now()-secondStarted;
   const buf=await voice.blob.slice(0,12).arrayBuffer();
   const head=String.fromCharCode(...new Uint8Array(buf));
   return {ok:true,voice:voice.voice,size:voice.blob.size,header:head,
    cues:voice.cues?.length??0,reuseMs,reuseSize:reused.blob.size,
    cachedIntro:engine.getDiagnostics?.().cachedIntro??0,diag:engine.getDiagnostics?.()};
  }catch(e){return {ok:false,error:String(e?.stack||e),diag:engine.getDiagnostics?.()};}
 });
 console.log('Kokoro browser diagnostic',JSON.stringify({...out,errors,network:network.slice(-22)}).slice(0,7000));
 assert.equal(out.ok,true,'Kokoro não sintetizou áudio no navegador da prévia');
 assert.equal(out.voice,'pf_dora');
 assert.ok(out.size>1024);
 assert.equal(out.header.slice(0,4),'RIFF');
 assert.equal(out.header.slice(8,12),'WAVE');
 assert.equal(out.reuseSize,out.size,'O cache deve devolver o mesmo WAV pf_dora');
 assert.ok(out.cachedIntro>=1,'A saudação fixa deveria ser reutilizável no cache');
 assert.ok(out.reuseMs<1500,'A segunda saudação não pode reinferir o modelo neural: '+out.reuseMs+' ms');
 console.log('Kokoro TTS real OK em Chromium: '+out.size+' bytes, '+((Date.now()-started)/1000).toFixed(1)+'s');

 // V111.95: a abertura é texto FIXO da simulação. Uma única geração no CI
 // permite a reprodução imediata no Safari sem baixar 82M parâmetros.
 // Apenas na branch de preparação: arquivos de participantes jamais são gerados.
 if(process.env.PREVIEW_BRANCH==='feature/web-lia-ios-kokoro-fast-v11195'){
  const {writeFileSync,readFileSync}=await import('node:fs');
  const {execFileSync}=await import('node:child_process');
  const {createHash}=await import('node:crypto');
  const intro='Oi, sou a Lia. Troquei de celular e estou precisando de um favor. Você pode me emprestar R$ 350 pelo Pix de treino? Eu devolvo depois.';
  const wavBytes=await page.evaluate(async text=>{
   const res=await window.EducaLiaBrowserKokoro.synthesize(text,'natural');
   if(res.voice!=='pf_dora'||res.blob.size<10000)throw Error('Fala inicial Kokoro inválida');
   return Array.from(new Uint8Array(await res.blob.arrayBuffer()));
  },intro);
  writeFileSync('/tmp/lia-intro-v11195.wav',Buffer.from(wavBytes));
  execFileSync('ffmpeg',['-y','-hide_banner','-loglevel','error',
   '-i','/tmp/lia-intro-v11195.wav','-codec:a','libmp3lame','-ar','24000','-ac','1','-b:a','64k',
   '/tmp/lia-intro-v11195.mp3'],{timeout:60000});
  const mp3=readFileSync('/tmp/lia-intro-v11195.mp3');
  assert.ok(mp3.length>5000&&mp3.length<400000,'MP3 fixo fora do limite');
  const encoded=mp3.toString('base64');
  console.log('LIA_V11195_META='+JSON.stringify({bytes:mp3.length,hash:createHash('sha256').update(mp3).digest('hex'),chunks:Math.ceil(encoded.length/3500),phrase:intro}));
  for(let i=0;i<encoded.length;i+=3500)console.log('LIA_V11195_MP3_CHUNK_'+String(i/3500).padStart(3,'0')+'='+encoded.slice(i,i+3500));
 }

}finally{await browser.close();}
