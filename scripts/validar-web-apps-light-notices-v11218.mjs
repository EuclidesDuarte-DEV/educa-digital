/* V112.18 — toque real nos avisos e tema claro nos aplicativos Web.
   Testa sobreposição no mesmo estado da captura relatada. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const dir='artifacts/web-apps-light-v11218';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const light=async(page,what)=>{
 const colors=await page.evaluate(()=>{
  const app=document.querySelector('#webRealView .webx-app')||document.querySelector('#webRealView .wr-card');
  const top=document.querySelector('#webRealView .webreal-header');
  const base=document.querySelector('#webRealView');
  return {bg:getComputedStyle(app).backgroundColor,color:getComputedStyle(app).color,
    header:getComputedStyle(top).backgroundColor,base:getComputedStyle(base).backgroundColor};
 });
 assert.equal(colors.bg,'rgb(255, 255, 255)',what+': app ainda escuro '+JSON.stringify(colors));
 assert.equal(colors.header,'rgb(255, 255, 255)',what+': cabeçalho ainda escuro '+JSON.stringify(colors));
 return colors;
};
try{
 for(const viewport of [{width:320,height:640},{width:390,height:700},{width:390,height:844},{width:1366,height:768}]){
  const name=viewport.width+'x'+viewport.height;
  const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:true,deviceScaleFactor:2});
  const page=await context.newPage();
  try{
   await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>window.EducaFreeMode&&window.EducaWebReal&&window.EducaWebAppsV11216&&
     document.documentElement.dataset.educaPlatform==='web',null,{timeout:18000});
   await page.evaluate(()=>{
     window.EducaFreeView.isTraining=()=>true;
     window.EducaFreeMode.start();
     window.EducaWebReal.openApp('photos');
   });
   await page.locator('#webRealView.webx-photos .webx-app').waitFor({state:'visible'});
   const photos=await light(page,name+' Fotos');
   await page.locator('[data-webx="photo-tab"][data-value="collections"]').tap({timeout:7000});
   assert.equal(await page.locator('.webx-collection-card').isVisible(),true,name+': colecoes sem toque');
   await page.locator('[data-webx="photo-tab"][data-value="library"]').tap({timeout:7000});
   // A notificação aparece SOBRE a Fototeca. Os botoes do aviso DEVEM receber toque.
   await page.evaluate(()=>window.EducaFreeMode.triggerEvent());
   await page.locator('#freeEventNotice').waitFor({state:'visible',timeout:4000});
   const hit=await page.evaluate(()=>{
    const n=document.querySelector('#freeEventNotice');
    const open=document.querySelector('#freeEventOpen');
    const dismiss=document.querySelector('#freeEventDismiss');
    return {notice:getComputedStyle(n).pointerEvents,
      open:getComputedStyle(open).pointerEvents,dismiss:getComputedStyle(dismiss).pointerEvents};
   });
   assert.equal(hit.notice,'none',name+': aviso intercepta toda a tela');
   assert.equal(hit.open,'auto',name+': Abrir bloqueado');
   assert.equal(hit.dismiss,'auto',name+': X bloqueado');
   await page.locator('#freeEventDismiss').tap({timeout:8000});
   assert.equal(await page.locator('#freeEventNotice').isHidden(),true,name+': X nao dispensou aviso');
   await page.evaluate(()=>window.EducaFreeMode.triggerEvent());
   await page.locator('#freeEventOpen').tap({timeout:8000});
   assert.equal(await page.locator('#freeEventNotice').isHidden(),true,name+': Abrir nao fechou aviso');
   assert.notEqual(await page.locator('#phoneScreen').getAttribute('data-current-view'),'webreal',
     name+': Abrir nao levou para a simulacao');

   // Gmail: pode abrir a mensagem e voltar com o aviso ainda aparente.
   await page.evaluate(()=>window.EducaWebReal.openApp('gmail'));
   await light(page,name+' Gmail');
   await page.evaluate(()=>window.EducaFreeMode.triggerEvent());
   await page.locator('.webx-mail-message').first().tap({timeout:8000});
   assert.equal(await page.locator('.webx-mail-detail').isVisible(),true,name+': Gmail sem toque');
   await page.locator('[data-webx="mail-back"]').tap({timeout:8000});
   // Mesmo com a notificação sobre a caixa, a pesquisa nao perde o foco.
   const input=page.locator('#webxMailSearch');
   await input.tap({timeout:8000});
   await page.keyboard.type('Banco');
   assert.equal(await input.inputValue(),'Banco');
   assert.equal(await input.evaluate(el=>document.activeElement===el),true);
   await page.screenshot({path:dir+'/'+name+'-gmail-claro-aviso.png'});
   await page.locator('#freeEventDismiss').tap({timeout:8000});

   // SMS: lista clara, busca, abertura e retorno usando tap.
   await page.evaluate(()=>window.EducaWebReal.openApp('messages'));
   await light(page,name+' SMS');
   await page.evaluate(()=>window.EducaFreeMode.triggerEvent());
   await page.locator('[data-webx="sms-open"]').first().tap({timeout:8000});
   assert.equal(await page.locator('.webx-sms-detail').isVisible(),true,name+': SMS nao abre');
   const bubble=await page.locator('.webx-sms-bubble').first().evaluate(el=>getComputedStyle(el).backgroundColor);
   assert.notEqual(bubble,'rgb(39, 45, 55)',name+': bolha SMS ainda escura');
   await page.locator('[data-webx="sms-back"]').tap({timeout:8000});
   await page.locator('#freeEventDismiss').tap({timeout:8000});
   await page.screenshot({path:dir+'/'+name+'-sms-claro.png'});

   // Camera: a moldura e os botoes sao claros, mas o visor pode permanecer escuro.
   await page.evaluate(()=>window.EducaWebReal.openApp('camera'));
   const cam=await page.evaluate(()=>{
    const card=document.querySelector('#webRealView .wr-card');
    const top=document.querySelector('#webRealView .webreal-header');
    return {card:getComputedStyle(card).backgroundColor,header:getComputedStyle(top).backgroundColor};
   });
   assert.equal(cam.card,'rgb(255, 255, 255)',name+': camera com menus escuros');
   assert.equal(cam.header,'rgb(248, 250, 255)',name+': camera com cabecalho escuro');
   await page.locator('[data-wr="open-photos"]').tap({timeout:8000});
   assert.equal(await page.locator('#webRealView').getAttribute('class')
     .then(c=>c.includes('webx-photos')),true,name+': Ver Fotos nao responde');
   console.log('WEB_APPS_LIGHT_V11218_OK '+name+' '+JSON.stringify({photos,hit,bubble,cam}));
  }finally{await context.close();}
 }
}finally{await browser.close();}
