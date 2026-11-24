/* V112.23 — Safari iPhone: LIA nao recarrega Home nem troca silenciosamente para voz do aparelho.
   Motor de audio é simulado para testar NAVEGACAO; não valida timbre real. */
import {webkit,chromium} from 'playwright';
import assert from 'node:assert/strict';
const browsers=[
 {engine:webkit,name:'safari-iphone',userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',platform:'iPhone',width:390,height:844},
 {engine:chromium,name:'android-baixa-ram',userAgent:'Mozilla/5.0 (Linux; Android 14; Mobile) Chrome/131.0.0.0',platform:'Linux',width:360,height:760,deviceMemory:2}
];
for(const config of browsers){
 const browser=await config.engine.launch({headless:true,...(config.engine===chromium?{args:['--no-sandbox']}: {})});
 try{
  const context=await browser.newContext({viewport:{width:config.width,height:config.height},
   isMobile:true,hasTouch:true,userAgent:config.userAgent,colorScheme:'dark'});
  const page=await context.newPage();
  let nav=0,modelCalls=0,errors=[];
  page.on('framenavigated',f=>{if(f===page.mainFrame())nav++;});
  page.on('pageerror',e=>errors.push(String(e.message).slice(0,160)));
  await page.route('**/api/lia-free-model/**',async route=>{modelCalls++;await route.abort();});
  // Voz do sistema monitorada; motor neural mockado para testar roteamento sem inferência.
  await page.route('**/static/js/lia-free-neural-v11206.js*',route=>route.fulfill({contentType:'application/javascript',body:`window.__neuralCalls=0;window.__failNeural=false;window.EducaLiaFreeNeural={prepare:async()=>({voice:'Dora'}),isReady:()=>true,stop:()=>{},speak:async()=>{window.__neuralCalls++;if(window.__failNeural)throw Error('falha neural simulada');const n=24000,b=new ArrayBuffer(44+n*2),v=new DataView(b);for(const [offset,tag] of [[0,'RIFF'],[8,'WAVE'],[12,'fmt '],[36,'data']])for(let j=0;j<tag.length;j++)v.setUint8(offset+j,tag.charCodeAt(j));v.setUint32(4,b.byteLength-8,true);v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,24000,true);v.setUint32(28,48000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);v.setUint32(40,n*2,true);for(let j=0;j<n;j++)v.setInt16(44+j*2,Math.sin(j/20)*1000,true);return {blob:new Blob([b],{type:'audio/wav'}),seconds:1,elapsed_ms:10}}};`}));
  await page.addInitScript((ram)=>{
   // Chromium headless não expõe a RAM física do Pixel simulado; declarar
   // explicitamente a RAM baixa para exercitar a regra do navegador real.
   if(ram)Object.defineProperty(navigator,'deviceMemory',{configurable:true,get:()=>ram});
   const Voice=function(text){this.text=text;this.lang='pt-BR';this.rate=1;this.pitch=1;this.volume=1};
   window.SpeechSynthesisUtterance=Voice;
   window.__deviceCalls=0;
   // Forçar a política de bloqueio do HTMLAudioElement; WebAudio precisa tocar sozinho.
   const originalPlay=HTMLMediaElement.prototype.play;
   HTMLMediaElement.prototype.play=function(){if(this instanceof HTMLAudioElement)return Promise.reject(new DOMException('autoplay bloqueado','NotAllowedError'));return originalPlay.call(this);};
   window.speechSynthesis={
    getVoices:()=>[{lang:'pt-BR',name:'Voz de teste feminina',voiceURI:'local-pt-br'}],
    cancel:()=>{},resume:()=>{},pause:()=>{},
    speak:u=>{window.__deviceCalls++;setTimeout(()=>u.onstart?.(),15);setTimeout(()=>u.onend?.(),200);}
   };
  },config.deviceMemory||null);
  await page.goto('http://127.0.0.1:8789/html/?platform=web',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.EducaVideoCall?.incoming&&window.EducaFreeMode&&window.EducaLiaWarm,{timeout:15000});
  const init=await page.evaluate(()=>({
   mode:window.EducaLiaWarm.state().mode,
   channel:document.documentElement.dataset.educaPlatform,
   selected:document.querySelector('#freeVideoVoiceEngine')?.value
  }));
  assert.equal(init.mode,'leve',config.name+' mode');
  assert.equal(init.selected,'gratuita',config.name+' voice engine');
  await page.evaluate(()=>{
   window.EducaFreeView.isTraining=()=>true;
   window.EducaFreeMode.start();
   window.EducaVideoCall.incoming();
  });
  await page.locator('#freeVideoAnswer').tap({timeout:6000});
  await page.waitForFunction(()=>/Lia falando com áudio gerado/.test(document.querySelector('#freeVideoState')?.textContent||''),null,{timeout:12000});
  assert.equal(await page.locator('#liaPhotoPlay').isVisible(),false,config.name+' pediu outro toque');
  assert.equal(await page.locator('#freeVideoPortrait video[src]').count(),0,config.name+' carregou decodificadores em modo leve');
  await page.evaluate(()=>{window.__failNeural=true;});
  await page.evaluate(()=>window.EducaVideoCall.reply('Oi, agora eu estou respondendo com seguranca.'));
  await page.waitForTimeout(400);
  assert.equal(nav,1,config.name+' recarregou ou redirecionou durante a voz');
  assert.equal(modelCalls,0,config.name+' chamou rede ONNX durante mock');
  assert.ok(await page.evaluate(()=>window.__neuralCalls)>0,config.name+' nao tentou voz neural');
  assert.equal(await page.evaluate(()=>window.__deviceCalls),0,config.name+' trocou para voz do sistema');
  assert.equal(await page.locator('#freeVideoView.is-active').count(),1,config.name+' saiu da videochamada');
  assert.ok(errors.length===0,config.name+' pageerrors '+JSON.stringify(errors));
  console.log('LIA_STABLE_V11223_OK '+config.name+' '+JSON.stringify({nav,modelCalls,voice:init.selected}));
  await context.close();
 }finally{await browser.close();}
}
