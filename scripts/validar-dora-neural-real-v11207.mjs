/* V112.07 — Comprovação de que a Dora sintetiza WAV real no navegador
   e de que o seletor Web não contém a Roberta.
   Usar somente endereço Preview; não consome API paga.
*/
import {chromium,webkit} from 'playwright';
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
 assert.equal(out.diag.provider,'wasm-only-v11227','Web deve usar o runtime CPU sem JSEP');
 await page.close();
 const app=await browser.newPage({viewport:{width:390,height:844}});
 let webPaidCalls=0,nav=0,heavyCalls=0;
 app.on('framenavigated',frame=>{if(frame===app.mainFrame())nav++;});
 app.on('request',r=>{if(r.url().includes('/api/lia-model/'))heavyCalls++;});
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
 // Teste de ponta a ponta: tocar áudio neural de verdade no fluxo da chamada.
 await app.evaluate(()=>{window.EducaFreeView.isTraining=()=>true;window.EducaFreeMode.start();window.EducaVideoCall.incoming();});
 await app.locator('#freeVideoAnswer').click({timeout:10000});
 await app.waitForFunction(()=>{
  const state=document.querySelector('#freeVideoState')?.textContent||'';
  return /Voz neural brasileira reproduzindo|Lia falando com áudio gerado/.test(state);
 },null,{timeout:45000});
 const call=await app.evaluate(()=>({active:window.EducaVideoCall.isActive(),connected:window.EducaVideoCall.isConnected(),
  diag:window.EducaLiaFreeNeural.getDiagnostics(),label:document.querySelector('#liaPhotoIndicator')?.textContent}));
 assert.equal(call.active,true);assert.equal(call.connected,true);
 assert.ok(call.diag.lastSynthesisMs>0,'A chamada deve gerar áudio dinâmico');
 assert.equal(nav,1,'A chamada neural não pode recarregar a página');
 assert.equal(heavyCalls,0,'A chamada Dora não deve baixar o Kokoro pesado');
 assert.equal(webPaidCalls,0);
 console.log('DORA REAL CALL OK',JSON.stringify(call));
 await app.close();
 // Teste real de várias falas no WebKit com perfil iPhone e sem mock da Dora.
 const safari=await webkit.launch({headless:true});
 try{
  const context=await safari.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'});
  const phone=await context.newPage();let navigations=0,crashes=0,heavy=0,paid=0;
  phone.on('framenavigated',frame=>{if(frame===phone.mainFrame())navigations++;});
  phone.on('crash',()=>{crashes++;});
  context.on('request',r=>{if(/\.jsep\.|ort\.webgpu|\/api\/lia-model\//.test(r.url()))heavy++;if(r.url().includes('/api/lia/voz-web/speak'))paid++;});
  await phone.goto(root+'/html/?platform=web',{waitUntil:'domcontentloaded',timeout:40000});
  await phone.waitForFunction(()=>window.EducaVideoCall&&window.EducaLiaWarm?.isMemorySensitive?.(),null,{timeout:15000});
  await phone.evaluate(()=>{window.EducaFreeView.isTraining=()=>true;window.EducaFreeMode.start();window.EducaVideoCall.incoming();});
  await phone.locator('#freeVideoAnswer').tap({timeout:10000});
  const speakState=()=>/Lia falando com áudio gerado|Voz neural brasileira reproduzindo/.test(document.querySelector('#freeVideoState')?.textContent||'');
  await phone.waitForFunction(speakState,null,{timeout:45000});
  await phone.waitForFunction(()=>document.querySelector('#liaPhotoSpeech')?.currentTime>0.05,null,{timeout:12000});
  assert.equal(await phone.locator('#liaPhotoPlay').isVisible(),false);
  assert.equal(await phone.locator('#freeVideoPortrait video[src]').count(),1);
  for(const phrase of ['Olá, podemos conversar?', 'Você está me ouvindo?', 'Muito obrigada pela atenção.']){
   await phone.waitForFunction(()=>/Sua vez/.test(document.querySelector('#freeVideoState')?.textContent||''),null,{timeout:60000});
   await phone.evaluate(text=>window.EducaVideoCall.reply(text),phrase);
   await phone.waitForFunction(speakState,null,{timeout:45000});
   assert.equal(await phone.locator('#liaPhotoPlay').isVisible(),false);
   assert.equal(navigations,1);assert.equal(crashes,0);
  }
  const diagnostics=await phone.evaluate(()=>window.EducaLiaFreeNeural.getDiagnostics());
  assert.equal(diagnostics.provider,'wasm-only-v11227');assert.equal(heavy,0);assert.equal(paid,0);
  assert.equal(navigations,1);assert.equal(crashes,0);
  console.log('DORA WEBKIT MULTITURN OK',JSON.stringify({navigations,crashes,heavy,paid,diagnostics}));
  await context.close();
 }finally{await safari.close();}
} finally {
 await browser.close();
}
