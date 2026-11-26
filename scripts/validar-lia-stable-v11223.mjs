/* V112.23 — Safari iPhone: LIA nao recarrega Home nem troca silenciosamente para voz do aparelho.
   Motor de audio é simulado para testar NAVEGACAO; não valida timbre real. */
import {webkit,chromium} from 'playwright';
import assert from 'node:assert/strict';
const browsers=[
 {engine:webkit,name:'safari-iphone',userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',platform:'iPhone',width:390,height:844},
 {engine:chromium,name:'android-baixa-ram',userAgent:'Mozilla/5.0 (Linux; Android 14; Mobile) Chrome/131.0.0.0',platform:'Linux',width:360,height:760,deviceMemory:2}
];
for(const config of browsers){
 const browser=await config.engine.launch({headless:true,...(config.engine===chromium?{channel:'chromium',args:['--no-sandbox']}: {})});
 try{
  const context=await browser.newContext({viewport:{width:config.width,height:config.height},
   isMobile:true,hasTouch:true,userAgent:config.userAgent,colorScheme:'dark'});
  const page=await context.newPage();
  let nav=0,modelCalls=0,errors=[];
  page.on('framenavigated',f=>{if(f===page.mainFrame())nav++;});
  page.on('pageerror',e=>errors.push(String(e.message).slice(0,160)));
  await page.route('**/api/lia-free-model/**',async route=>{modelCalls++;await route.abort();});
  // Voz do sistema monitorada; motor neural mockado para testar roteamento sem inferência.
  await page.route('**/static/js/lia-free-neural-v11206.js*',route=>route.fulfill({contentType:'application/javascript',body:`window.__neuralCalls=0;window.__failNeural=false;window.EducaLiaFreeNeural={prepare:async()=>({voice:'Dora'}),isReady:()=>true,stop:()=>{},speak:async()=>{window.__neuralCalls++;if(window.__failNeural)throw Error('falha neural simulada');const n=72000,b=new ArrayBuffer(44+n*2),v=new DataView(b);for(const [offset,tag] of [[0,'RIFF'],[8,'WAVE'],[12,'fmt '],[36,'data']])for(let j=0;j<tag.length;j++)v.setUint8(offset+j,tag.charCodeAt(j));v.setUint32(4,b.byteLength-8,true);v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,24000,true);v.setUint32(28,48000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);v.setUint32(40,n*2,true);for(let j=0;j<n;j++)v.setInt16(44+j*2,(j>=24000&&j<43200?0:Math.sin(j/20)*3000),true);return {blob:new Blob([b],{type:'audio/wav'}),seconds:3,elapsed_ms:10}}};`}));
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
  // Conta exclusivamente fictícia para testes locais de interface. Nenhum cadastro real.
    await page.addInitScript(() => localStorage.setItem('educaRememberedUser', JSON.stringify({name:'Participante',phone:'65900000001',levelToken:'a'.repeat(64)})));
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
  const codec=await page.evaluate(()=>document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"'));
  console.log('LIA_MP4_CODEC',config.name,codec||'unsupported');
  // Linux Chromium pode não incluir H.264. WebKit exige decodificação real;
  // Chromium sem o codec testa áudio e navegação, não finge ter exibido vídeo.
  if(config.engine===webkit||codec){
   await page.waitForFunction(()=>document.querySelector('#liaPhotoSpeech').currentTime>0.05,null,{timeout:8000});
   assert.equal(await page.locator('#freeVideoPortrait video[src]').count(),1,config.name+' deve usar exatamente um clipe original na fala');
  assert.match(await page.locator('#liaPhotoSpeech').getAttribute('src'),/lia-conversando-a\.mp4/);
  assert.equal(await page.locator('#liaPhotoSpeech').evaluate(v=>v.loop),true);
  // Uma pausa de 800 ms no WAV deve trocar para boca fechada e retornar à fala.
  await page.waitForFunction(()=>{const v=document.querySelector('#liaPhotoIdle');return v?.classList.contains('lia-clip-visible')&&v.currentTime>0.03;},null,{timeout:10000});
  assert.equal(await page.locator('#freeVideoPortrait video[src]').count(),1);
  await page.waitForFunction(()=>{const v=document.querySelector('#liaPhotoSpeech');return v?.classList.contains('lia-clip-visible')&&v.currentTime>0.03;},null,{timeout:10000});
  assert.equal(await page.locator('#freeVideoPortrait video[src]').count(),1);
  console.log('LIA_LIVE_IDLE_AND_TALK_OK',config.name);
  }else console.log('LIA_MP4_TEST_SKIPPED_CODEC',config.name);
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

 // V112.30: desktop com zoom de navegador — variar viewport CSS efetivo
 // (1280x800 físico / fator de zoom); validar também modo normal.
 const desktop=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const p=await desktop.newPage({viewport:{width:1280,height:800}});
  await p.route('**/static/js/lia-free-neural-v11206.js*',r=>r.fulfill({contentType:'application/javascript',body:"window.EducaLiaFreeNeural={prepare:async()=>({}),isReady:()=>true,stop:()=>{},speak:()=>new Promise(()=>{})}"}));
  await p.addInitScript(() => localStorage.setItem('educaRememberedUser', JSON.stringify({name:'Participante',phone:'65900000001',levelToken:'a'.repeat(64)})));
  await p.goto('http://127.0.0.1:8789/html/?platform=web',{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>window.EducaVideoCall&&window.EducaFreeMode);
  await p.evaluate(()=>{window.EducaFreeView.isTraining=()=>true;window.EducaFreeMode.start();window.EducaVideoCall.incoming();document.body.classList.add('prototype-focus');});
  await p.locator('#freeVideoAnswer').click({timeout:10000});
  for(const full of [false,true]){
   await p.evaluate(full=>document.documentElement.classList.toggle('educa-fullscreen-active',full),full);
   const sizes=[... [.8,1,1.25,1.5,2,2.5,3].map(zoom=>({zoom,width:Math.round(1280/zoom),height:Math.round(800/zoom)})),...(!full?[{zoom:.8,width:2064,height:890},{zoom:.8,width:1651,height:712},{zoom:1,width:1853,height:800},{zoom:1,width:1366,height:650},{zoom:1,width:1920,height:1080},{zoom:1,width:2560,height:1440}]:[])];
   for(const {zoom,width,height} of sizes){
    await p.setViewportSize({width,height});
    await p.waitForTimeout(180);
    const bounds=await p.evaluate(()=>{
     const box=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
     const view=document.querySelector('#freeVideoView'),toolbar=view.querySelector('.v110-video-toolbar'),phone=document.querySelector('#phoneHardware');
     const controls=[...toolbar.querySelectorAll(':scope > button:not([hidden]), :scope > details > summary')].filter(e=>e.getClientRects().length).map(e=>({id:e.id||'more',...box(e)}));
     return {view:box(view),toolbar:box(toolbar),phone:box(phone),controls,viewport:{w:innerWidth,h:innerHeight}};
    });
    if(!full&&width>=1000&&height>=600){
     assert.ok(bounds.phone.height>=Math.min(height-40,440/0.45685)-2,'V112.32 moldura pequena demais '+JSON.stringify({width,height,bounds}));
     assert.ok(bounds.phone.top>=-1&&bounds.phone.bottom<=height+1,'moldura fora da janela '+JSON.stringify(bounds));
     assert.ok(Math.abs((bounds.phone.top+bounds.phone.bottom)/2-height/2)<=12,'moldura não centralizada '+JSON.stringify(bounds));
     console.log('LIA_NORMAL_SIZE_V11232_OK',JSON.stringify({width,height,phone:bounds.phone}));
    }
    if(!full&&width>=701){
     const normal=await p.evaluate(()=>{const video=document.querySelector('#freeVideoView'),call=document.querySelector('#freeCallView'),phone=document.querySelector('#phoneHardware');video.classList.remove('is-active');call.classList.add('is-active');const r=phone.getBoundingClientRect();const b={width:r.width,height:r.height,top:r.top,left:r.left};call.classList.remove('is-active');video.classList.add('is-active');return b;});
     for(const k of ['width','height','top','left'])assert.ok(Math.abs(normal[k]-bounds.phone[k])<=1,'moldura diferente entre chamadas '+JSON.stringify({width,height,k,normal,video:bounds.phone}));
     console.log('LIA_SHARED_CALL_FRAME_OK',JSON.stringify({width,height,zoom,normal}));
    }
    assert.ok(Math.max(...bounds.controls.map(c=>c.top+c.height/2))-Math.min(...bounds.controls.map(c=>c.top+c.height/2))<=2,'controles em duas linhas '+JSON.stringify({full,zoom,bounds}));
    assert.ok(bounds.controls.length>=5,'controles ausentes '+JSON.stringify(bounds));
    for(const c of bounds.controls){
     assert.ok(c.left>=bounds.view.left-1&&c.right<=bounds.view.right+1&&c.top>=bounds.view.top-1&&c.bottom<=bounds.view.bottom+1,'controle cortado '+JSON.stringify({full,zoom,c,bounds}));
     assert.ok(c.left>=bounds.toolbar.left-1&&c.right<=bounds.toolbar.right+1&&c.bottom<=bounds.toolbar.bottom+1,'dock cortado '+JSON.stringify({full,zoom,c,bounds}));
     assert.ok(c.bottom<=bounds.viewport.h+1,'controle fora da janela '+JSON.stringify({full,zoom,c,bounds}));
    }
    console.log('LIA_ZOOM_FIT_OK',JSON.stringify({full,zoom,phone:bounds.phone,controls:bounds.controls.length}));
   }
  }
 }finally{await desktop.close();}
