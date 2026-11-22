/* V112.19 — Safari/iPhone dark-mode regression and app touch interaction.
   Tests use a simulated phone and only local demonstration data. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const root='artifacts/web-more-apps-v11219';
await mkdir(root,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const getColors=page=>page.evaluate(()=>{
 const app=document.querySelector('#webRealView .webv-app');
 const header=document.querySelector('#webRealView .webreal-header');
 return {background:app?getComputedStyle(app).backgroundColor:null,
         header:getComputedStyle(header).backgroundColor,
         scheme:getComputedStyle(document.querySelector('#phoneScreen')).colorScheme};
});
try{
 for(const viewport of [
  {width:320,height:640},{width:390,height:700},
  {width:390,height:844},{width:1366,height:768}
 ]){
  const name=viewport.width+'x'+viewport.height;
  const context=await browser.newContext({viewport,hasTouch:true,isMobile:viewport.width<500,
    deviceScaleFactor:2,colorScheme:'dark'});
  const page=await context.newPage();
  try{
   await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>window.EducaFreeMode&&window.EducaFreeView&&
     window.EducaWebMoreAppsV11219&&window.EducaWebReal&&document.documentElement.dataset.educaPlatform==='web',
    null,{timeout:15000});
   await page.evaluate(()=>{
    window.EducaFreeView.isTraining=()=>true;
    window.EducaFreeMode.start();
    window.EducaFreeMode.triggerEvent();
   });
   await page.locator('#freeEventOpen').tap({timeout:8000});
   await page.waitForFunction(()=>document.querySelector('#phoneScreen').dataset.currentView==='chat',null,{timeout:8000});
   await page.locator('#scenarioAvatar').tap({timeout:8000});
   const profile=page.locator('#freeContactProfileLayer');
   await profile.waitFor({state:'visible',timeout:5000});
   const profileColors=await page.evaluate(()=>{
    const p=document.querySelector('#freeContactProfileLayer');
    const header=p.querySelector('.fc-nav');
    const group=p.querySelector('.fc-group');
    return {bg:getComputedStyle(p).backgroundColor,nav:getComputedStyle(header).backgroundColor,
      card:getComputedStyle(group).backgroundColor};
   });
   assert.equal(profileColors.bg,'rgb(246, 248, 251)',name+': perfil escuro no aparelho em dark mode');
   assert.equal(profileColors.nav,'rgb(255, 255, 255)');
   assert.equal(profileColors.card,'rgb(255, 255, 255)');
   await profile.locator('[data-fc="theme"]').first().tap({timeout:8000});
   assert.equal(await profile.locator('[data-pane="theme"]').isVisible(),true);
   await profile.locator('[data-fc="theme-light"]').tap({timeout:8000});
   assert.equal(await profile.locator('#fcTheme').innerText(),'Claro');
   await profile.locator('[data-fc="media"]').first().tap({timeout:8000});
   assert.equal(await profile.locator('[data-pane="media"]').isVisible(),true);
   await profile.locator('.fc-nav [data-fc="back"]').tap({timeout:8000});
   await profile.locator('.fc-nav [data-fc="back"]').tap({timeout:8000});
   assert.equal(await profile.isHidden(),true,name+': voltar do perfil bloqueado');
   await page.screenshot({path:root+'/'+name+'-whatsapp-claro.png'});

   await page.evaluate(()=>window.EducaWebReal.openApp('youtube'));
   await page.locator('#webRealView .webv-app.webv-youtube').waitFor({state:'visible'});
   let colors=await getColors(page);
   assert.equal(colors.background,'rgb(247, 249, 253)',name+': YouTube escuro');
   assert.equal(colors.header,'rgb(255, 255, 255)',name+': YouTube cabecalho escuro');
   assert.equal(colors.scheme,'light',name+': sistema continua impondo dark mode');
   await page.locator('#wvYtSearch input[name="search"]').tap({timeout:8000});
   await page.locator('#wvYtSearch input[name="search"]').fill('Pix');
   await page.locator('#wvYtSearch button[type="submit"]').tap({timeout:8000});
   await page.locator('[data-wv="video"][data-value="pix"]').tap({timeout:8000});
   assert.equal(await page.locator('.webv-lesson').isVisible(),true,name+': aula nao abre');
   await page.locator('[data-wv="yt-read"]').tap({timeout:8000});
   assert.match(await page.locator('[data-wv="yt-read"]').innerText(),/revisada/i);
   await page.locator('[data-wv="yt-back"]').tap({timeout:8000});
   await page.locator('[data-wv="yt-tab"][data-value="shorts"]').tap({timeout:8000});
   assert.match(await page.locator('.webv-scroll h3').first().innerText(),/curtos/i);
   await page.screenshot({path:root+'/'+name+'-youtube-claro.png'});

   await page.evaluate(()=>window.EducaWebReal.openApp('maps'));
   await page.locator('#webRealView .webv-app.webv-maps').waitFor({state:'visible'});
   colors=await getColors(page);
   assert.equal(colors.background,'rgb(247, 249, 253)',name+': Maps escuro');
   assert.equal(await page.locator('.webv-map-marker').count(),3,name+': mapa demonstrativo sem pinos');
   await page.locator('.webv-map-marker[data-spot="library"]').tap({timeout:8000});
   assert.match(await page.locator('#webvMapDetail h3').innerText(),/Biblioteca Educa/);
   await page.locator('[data-wv="map-route"]').tap({timeout:8000});
   assert.match(await page.locator('#webvMapDetail').innerText(),/Sem distância ou navegação real/);
   await page.locator('[data-wv="map-save"]').tap({timeout:8000});
   await page.locator('[data-wv="map-tab"][data-value="saved"]').tap({timeout:8000});
   assert.equal(await page.locator('.webv-place-card').count(),1,name+': salvar local falhou');
   await page.screenshot({path:root+'/'+name+'-maps-claro.png'});

   await page.evaluate(()=>window.EducaWebReal.openApp('calendar'));
   await page.locator('#webRealView .webv-app.webv-calendar').waitFor({state:'visible'});
   colors=await getColors(page);
   assert.equal(colors.background,'rgb(247, 249, 253)',name+': Agenda escura');
   assert.equal(await page.locator('.webv-calendar-grid button').count()>27,true);
   await page.locator('[data-wv="cal-add"]').first().tap({timeout:8000});
   await page.locator('#wvAgendaForm [name="title"]').fill('Treinar segurança digital');
   await page.locator('#wvAgendaForm [name="time"]').fill('14:30');
   await page.locator('#wvAgendaForm button[type="submit"]').tap({timeout:8000});
   assert.match(await page.locator('.webv-event-card').first().innerText(),/Treinar segurança digital/);
   await page.locator('[data-wv="cal-mode"][data-value="day"]').tap({timeout:8000});
   assert.equal(await page.locator('.webv-day-list').isVisible(),true,name+': modo dia nao abriu');
   await page.screenshot({path:root+'/'+name+'-agenda-claro.png'});
   await page.locator('[data-wv="cal-mode"][data-value="month"]').tap({timeout:8000});
   await page.locator('[data-wv="cal-prev"]').tap({timeout:8000});
   await page.locator('[data-wv="cal-today"]').tap({timeout:8000});
   page.once('dialog',dialog=>dialog.accept());
   await page.locator('[data-wv="cal-delete"]').first().tap({timeout:8000});
   assert.equal(await page.locator('.webv-event-card').count(),0);
   console.log('WEB_MORE_APPS_V11219_OK '+name+' '+JSON.stringify({profileColors,colors}));
  }finally{await context.close();}
 }
}finally{await browser.close();}
