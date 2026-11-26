import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
const cases=[
 ['web',320,568],['web',390,844],['web',768,1024],['web',1366,650],['web',1651,712],['web',1920,1080],['web',2560,1440],['web',896,414],
 ['android',320,568],['android',430,932],['ios',390,844],['ios',768,1024]
];
for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--no-sandbox']}:{})});
 try{
 for(const [platform,width,height] of cases){
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<800});
  try{
   // Conta exclusivamente fictícia para testes locais de interface. Nenhum cadastro real.
    await page.addInitScript(() => localStorage.setItem('educaRememberedUser', JSON.stringify({name:'Participante',phone:'65900000001',levelToken:'a'.repeat(64)})));
    await page.goto('http://127.0.0.1:8789/html/?'+(platform==='web'?'platform=web':'app=1&platform='+platform+'&experience=web'),{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.EducaFreeView&&window.EducaReleaseChannel);
   await page.evaluate(()=>{
    document.body.classList.add('prototype-focus');
    window.EducaFreeView.isTraining=()=>true;
    window.EducaFreeView.setView('free-sms');
    document.querySelector('#freeSmsSender').textContent='Entrega pendente (SMS de treino)';
    const p=document.createElement('p');p.className='v11153-sms-bubble';p.textContent='SMS SIMULADO: sua entrega de treinamento está pendente. Existe uma taxa fictícia de R$ 12. Confira no aplicativo oficial.';
    document.querySelector('#freeSmsMessages').append(p);
   });
   for(const full of [false,true]){
    await page.evaluate(full=>document.documentElement.classList.toggle('educa-fullscreen-active',full),full);
    await page.waitForTimeout(220);
    const b=await page.evaluate(()=>{
     const r=s=>{const e=document.querySelector(s),b=e.getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right,w:b.width,h:b.height}};
     return {status:r('#phoneScreen .status-bar'),title:r('#freeSmsSender'),back:r('#freeSmsBack'),surface:r('#freeSmsView .v11153-sms'),view:r('#freeSmsView'),phone:r('#phoneHardware'),gesture:r('#gestureHome'),viewport:innerHeight};
    });
    assert.ok(b.title.top>=b.status.bottom-1&&b.back.top>=b.status.bottom-1,'SMS overlap '+JSON.stringify({platform,width,height,full,b}));
    assert.ok(b.title.right<=b.view.right+1&&b.back.left>=b.view.left-1,'SMS header overflow '+JSON.stringify(b));
    assert.ok(b.surface.bottom<=b.gesture.top+1,'SMS gesture overlap '+JSON.stringify(b));
    if(platform==='web'&&width>=701&&height>=600&&!full)assert.ok(b.phone.bottom<=b.viewport+1,'SMS frame clipped '+JSON.stringify(b));
    for(const large of [false,true]){
     await page.evaluate(large=>document.documentElement.classList.toggle('a11y-text-extra',large),large);
     const send=page.locator('#freeSmsSend');await send.scrollIntoViewIfNeeded();
     assert.ok(await send.isVisible(),'SMS send missing');
     const reachable=await send.evaluate(e=>{const r=e.getBoundingClientRect(),s=e.closest('.v11153-sms').getBoundingClientRect();return r.top>=s.top-2&&r.bottom<=s.bottom+2&&r.left>=s.left-2&&r.right<=s.right+2;});
     assert.ok(reachable,'SMS send clipped '+JSON.stringify({platform,width,height,full,large}));
    }
    await page.evaluate(()=>{document.documentElement.classList.remove('a11y-text-extra');document.querySelector('.v11153-sms').scrollTop=0;});
    console.log('SMS_RESPONSIVE_V11234_OK',JSON.stringify({engine:engine.name(),platform,width,height,full}));
   }
  }finally{await page.close();}
 }
 }finally{await browser.close();}
}
