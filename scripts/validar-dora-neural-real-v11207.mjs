/* V112.07 — Comprovação de que a Dora sintetiza WAV real no navegador
   e de que o seletor Web não contém a Roberta.
   Usar somente endereço Preview; não consome API paga.
*/
import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const root=process.env.PREVIEW_URL;
assert.ok(root?.startsWith('https://'),'PREVIEW_URL não configurado');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:390,height:844}});
 page.setDefaultTimeout(110000);
 const errors=[],network=[];
 page.on('pageerror',e=>errors.push(String(e.message||e).slice(0,220)));
 page.on('requestfailed',r=>network.push({url:r.url().slice(0,200),error:r.failure()?.errorText}));
 page.on('response',r=>{if(r.status()>=400)network.push({status:r.status(),url:r.url().slice(0,180)});});
 let paidCalls=0;
 page.on('request',r=>{if(r.url().includes('/api/lia/voz-web/speak'))paidCalls++;});
 await page.goto(root+'/testar-voz-neural-gratis.html',{waitUntil:'domcontentloaded',timeout:40000});
 await page.waitForFunction(()=>!!window.EducaLiaFreeNeural,{timeout:14000});
 const t=Date.now();
 const out=await page.evaluate(async()=>{
  const e=window.EducaLiaFreeNeural;
  try {
   await e.prepare();
   const t=performance.now();
   const wav=await e.speak('Oi, eu sou a Lia. Você está bem? Vamos conversar!',{speed:1.05});
   const raw=new Uint8Array(await wav.blob.arrayBuffer());
   const h=String.fromCharCode(...raw.slice(0,12));
   const v=new DataView(raw.buffer);
   let peak=0;
   for(let i=44;i<raw.byteLength;i+=Math.max(2,Math.floor(raw.byteLength/3000)&~1)){
    peak=Math.max(peak,Math.abs(v.getInt16(i,true)));
   }
   return {ok:true,header:h,size:raw.byteLength,peak,speakMs:Math.round(performance.now()-t),
    elapsedMs:wav.elapsed_ms,seconds:wav.seconds,diag:e.getDiagnostics()};
  } catch(err){
   return {ok:false,error:String(err?.stack||err).slice(0,1000),diag:e.getDiagnostics()};
  }
 });
 console.log('DORA NEURAL REAL',JSON.stringify({waitMs:Date.now()-t,out,errors,network:network.slice(-18)}).slice(0,9000));
 assert.equal(out.ok,true,'A voz Dora deve sintetizar WAV real em Chromium. Consulte a mensagem de falha e a rede acima.');
 assert.equal(out.header.slice(0,4),'RIFF');
 assert.equal(out.header.slice(8,12),'WAVE');
 assert.ok(out.size>20000,'O áudio gerado deve conter mais do que cabeçalho');
 assert.ok(out.peak>100,'O áudio gerado não pode ser silêncio');
 assert.ok(out.seconds>0.5&&out.seconds<35,'Duração vocal inesperada');
 assert.equal(paidCalls,0,'O teste local NUNCA deve chamar API ElevenLabs.');
 const app=await browser.newPage({viewport:{width:390,height:844}});
 let webPaidCalls=0;
 app.on('request',r=>{if(r.url().includes('/api/lia/voz-web/speak'))webPaidCalls++;});
 await app.goto(root+'/html/',{waitUntil:'domcontentloaded',timeout:40000});
 await app.waitForFunction(()=>window.EducaVideoCall&&document.documentElement.dataset.educaPlatform==='web',{timeout:15000});
 const active=await app.evaluate(()=>{
  const v=document.querySelector('#freeVideoVoiceEngine');
  return {platform:document.documentElement.dataset.educaPlatform,value:v?.value,
   options:Array.from(v?.options||[]).map(o=>({value:o.value,label:o.label})),
   freeAvailable:!!window.EducaLiaFreeNeural};
 });
 console.log('WEB SELECTOR',JSON.stringify(active));
 assert.equal(active.platform,'web');
 assert.equal(active.value,'gratuita','A Web deve selecionar neural grátis antes de usar a videochamada');
 assert.ok(!active.options.some(o=>o.value==='feminina'||/Roberta|ElevenLabs/i.test(o.label)),'A Roberta não pode mais estar no menu Web');
 assert.ok(active.freeAvailable);
 assert.equal(webPaidCalls,0);
 await app.close();
} finally {
 await browser.close();
}
