/* V112.23 — Safari iPhone: LIA nao recarrega Home nem liga ONNX ao falar.
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
  // Voz do sistema mockada para testar que o app nao navega nem reinicia.
  await page.addInitScript((ram)=>{
   // Chromium headless não expõe a RAM física do Pixel simulado; declarar
   // explicitamente a RAM baixa para exercitar a regra do navegador real.
   if(ram)Object.defineProperty(navigator,'deviceMemory',{configurable:true,get:()=>ram});
   const Voice=function(text){this.text=text;this.lang='pt-BR';this.rate=1;this.pitch=1;this.volume=1};
   window.SpeechSynthesisUtterance=Voice;
   window.speechSynthesis={
    getVoices:()=>[{lang:'pt-BR',name:'Voz de teste feminina',voiceURI:'local-pt-br'}],
    cancel:()=>{},resume:()=>{},pause:()=>{},
    speak:u=>{setTimeout(()=>u.onstart?.(),15);setTimeout(()=>u.onend?.(),200);}
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
  assert.equal(init.selected,'padrao',config.name+' voice engine');
  await page.evaluate(()=>{
   window.EducaFreeView.isTraining=()=>true;
   window.EducaFreeMode.start();
   window.EducaVideoCall.incoming();
  });
  await page.locator('#freeVideoAnswer').tap({timeout:6000});
  await page.waitForTimeout(300);
  await page.evaluate(()=>window.EducaVideoCall.reply('Oi, agora eu estou respondendo com seguranca.'));
  await page.waitForTimeout(400);
  assert.equal(nav,1,config.name+' recarregou ou redirecionou durante a voz');
  assert.equal(modelCalls,0,config.name+' carregou ONNX num aparelho sensivel');
  assert.equal(await page.locator('#freeVideoView.is-active').count(),1,config.name+' saiu da videochamada');
  assert.ok(errors.length===0,config.name+' pageerrors '+JSON.stringify(errors));
  console.log('LIA_STABLE_V11223_OK '+config.name+' '+JSON.stringify({nav,modelCalls,voice:init.selected}));
  await context.close();
 }finally{await browser.close();}
}
