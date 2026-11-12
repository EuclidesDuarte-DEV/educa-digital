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
   const voice=await engine.synthesize('Oi, sou a Lia. Vamos praticar com segurança.','natural');
   const buf=await voice.blob.slice(0,12).arrayBuffer();
   const head=String.fromCharCode(...new Uint8Array(buf));
   return {ok:true,voice:voice.voice,size:voice.blob.size,header:head,cues:voice.cues?.length??0,diag:engine.getDiagnostics?.()};
  }catch(e){return {ok:false,error:String(e?.stack||e),diag:engine.getDiagnostics?.()};}
 });
 console.log('Kokoro browser diagnostic',JSON.stringify({...out,errors,network:network.slice(-22)}).slice(0,7000));
 assert.equal(out.ok,true,'Kokoro não sintetizou áudio no navegador da prévia');
 assert.equal(out.voice,'pf_dora');
 assert.ok(out.size>1024);
 assert.equal(out.header.slice(0,4),'RIFF');
 assert.equal(out.header.slice(8,12),'WAVE');
 console.log('Kokoro TTS real OK em Chromium: '+out.size+' bytes, '+((Date.now()-started)/1000).toFixed(1)+'s');
}finally{await browser.close();}
