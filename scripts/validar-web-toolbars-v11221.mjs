/* Educa+ V112.21 — busca + filtros no topo e somente o feed rola.
   Inspeciona dimensoes reais e toque em mobile sem consultar apps externos. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const dir='artifacts/web-toolbars-v11221';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
async function geometry(page){
 return page.evaluate(()=>{
  const q=(s)=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left,y:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight}};
  return {body:q('#webRealBody'),app:q('#webRealBody .webx-app'),
   toolbar:q('#webRealBody .webv-toolbar'),search:q('#webRealBody .webv-search'),
   input:q('#webRealBody .webv-search input'),submit:q('#webRealBody .webv-search button[type="submit"]'),
   chips:q('#webRealBody .webv-chips'),main:q('#webRealBody .webv-scroll'),
   footer:q('#webRealBody .webv-tabs'),photoSearch:q('#webRealBody .webx-photo-search'),
   photoMain:q('#webRealBody .webx-photos-scroll'),smsHead:q('#webRealBody .webx-sms-head'),
   smsMain:q('#webRealBody .webx-sms-list'),mailHead:q('#webRealBody .webx-mail-toolbar'),
   mailMain:q('#webRealBody .webx-mail-scroll')};
 });
}
function near(a,b,px=4){return Math.abs(a-b)<=px;}
function inside(rect,root,label){
 assert.ok(rect&&root,label+': missing');
 assert.ok(rect.x>=root.x-2&&rect.right<=root.right+2,label+': protrudes horizontally '+JSON.stringify({rect,root}));
}
try{
 for(const viewport of [
  {width:320,height:640},{width:390,height:700},{width:390,height:844},{width:1366,height:768}
 ]){
  const name=viewport.width+'x'+viewport.height;
  const context=await browser.newContext({
   viewport,isMobile:viewport.width<500,hasTouch:true,deviceScaleFactor:2,colorScheme:'dark'
  });
  const page=await context.newPage();
  try{
   await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>window.EducaFreeMode&&window.EducaFreeView&&
      window.EducaWebReal&&window.EducaWebAppsV11216&&window.EducaWebMoreAppsV11219&&
      document.documentElement.dataset.educaPlatform==='web',null,{timeout:16000});
   await page.evaluate(()=>{window.EducaFreeView.isTraining=()=>true;window.EducaFreeMode.start();});
   const open=async(app)=>{await page.evaluate(x=>window.EducaWebReal.openApp(x),app);
     await page.locator('#webRealView.is-active .webx-app').waitFor({state:'visible',timeout:7000});
   };
   // YOUTUBE: busca numa linha, filtros logo abaixo e feed independentemente rolavel.
   await open('youtube');
   let g=await geometry(page);
   assert.ok(g.toolbar&&g.search&&g.input&&g.submit&&g.chips&&g.main,name+': toolbar YouTube incompleta');
   assert.ok(g.search.y>=g.body.y-1,name+': busca acima do app');
   assert.ok(near(g.input.y+g.input.height/2,g.submit.y+g.submit.height/2,6),name+': Buscar caiu para outra linha');
   assert.ok(g.input.right<g.submit.x+2,name+': Buscar sobreposto ao input');
   assert.ok(g.chips.y>=g.search.bottom-3&&g.chips.bottom<=g.main.y+4,name+': chips fora do topo');
   assert.ok(g.main.y>=g.toolbar.bottom-3,name+': feed invade filtros');
   inside(g.input,g.body,name+' YouTube campo');
   inside(g.submit,g.body,name+' YouTube botao');
   const top=g.toolbar.y;
   const before=await page.locator('.webv-youtube .webv-scroll').evaluate(el=>({scroll:el.scrollTop,max:el.scrollHeight-el.clientHeight}));
   assert.ok(before.max>20,name+': YouTube feed sem rolagem vertical');
   await page.locator('.webv-youtube .webv-scroll').evaluate(el=>el.scrollTop=el.scrollHeight);
   const after=await page.locator('.webv-youtube .webv-scroll').evaluate(el=>el.scrollTop);
   assert.ok(after>10,name+': feed nao rolou');
   const afterGeo=await geometry(page);
   assert.ok(near(afterGeo.toolbar.y,top,2),name+': filtros rolaram junto com videos');
   await page.locator('[data-wv="yt-category"][data-value="Segurança"]').tap({timeout:7000});
   assert.equal(await page.locator('[data-wv="yt-category"][data-value="Segurança"]').getAttribute('class'),'active');
   await page.locator('#wvYtSearch input').fill('Pix');
   await page.locator('#wvYtSearch button[type="submit"]').tap({timeout:7000});
   assert.equal(await page.locator('[data-wv="video"][data-value="pix"]').count(),1);
   await page.screenshot({path:dir+'/'+name+'-youtube-topo.png'});
   // MAPS: busca no topo, mapa abaixo, pinos e cards ainda acionaveis.
   await open('maps');g=await geometry(page);
   assert.ok(g.input&&g.submit&&g.main&&g.toolbar);
   assert.ok(near(g.input.y+g.input.height/2,g.submit.y+g.submit.height/2,6),name+': Busca Maps em duas linhas');
   assert.ok(g.toolbar.bottom<=await page.locator('.webv-map-surface').evaluate(el=>el.getBoundingClientRect().top)+3,name+': mapa sobre toolbar');
   await page.locator('.webv-map-marker[data-spot="clinic"]').tap({timeout:7000});
   assert.match(await page.locator('#webvMapDetail h3').innerText(),/Saúde/);
   await page.screenshot({path:dir+'/'+name+'-maps-topo.png'});
   // AGENDA: filtros mes e dia no topo, calendário no conteudo.
   await open('calendar');g=await geometry(page);
   assert.ok(g.toolbar&&g.chips&&g.main);
   assert.ok(g.chips.bottom<=g.main.y+3,name+': filtros agenda invadem eventos');
   const controls=await page.locator('.webv-cal-controls button').count();
   assert.equal(controls,4,name+': controles de período incompletos');
   await page.locator('[data-wv="cal-mode"][data-value="day"]').tap({timeout:7000});
   assert.equal(await page.locator('.webv-day-list').isVisible(),true);
   await page.locator('[data-wv="cal-mode"][data-value="month"]').tap({timeout:7000});
   await page.locator('[data-wv="cal-add"]').first().tap({timeout:7000});
   assert.equal(await page.locator('#wvAgendaForm').isVisible(),true);
   await page.screenshot({path:dir+'/'+name+'-agenda-topo.png'});
   // FOTOS: busca nao pode estar dentro da area rolavel das imagens.
   await open('photos');await page.locator('[data-webx="photo-tab"][data-value="search"]').tap({timeout:7000});
   g=await geometry(page);
   assert.ok(g.photoSearch&&g.photoMain,name+': pesquisa Fotos nao abre');
   assert.ok(g.photoSearch.bottom<=g.photoMain.y+3,name+': busca Fotos no feed rolavel');
   assert.equal(await page.locator('.webx-photos-scroll #webxPhotoSearch').count(),0);
   await page.locator('#webxPhotoSearch').fill('outubro');
   await page.locator('[data-webx="photo-tab"][data-value="collections"]').tap({timeout:7000});
   assert.equal(await page.locator('.webx-collection-card').isVisible(),true);
   await page.screenshot({path:dir+'/'+name+'-fotos-topo.png'});
   // GMAIL: o campo deve ficar visivel acima da lista, sem duplicar scroller.
   await open('gmail');g=await geometry(page);
   assert.ok(g.mailHead&&g.mailMain);
   assert.ok(g.mailHead.bottom<=g.mailMain.y+g.mailMain.height*0.25,name+': Gmail toolbar no feed');
   await page.locator('#webxMailSearch').tap({timeout:7000});
   await page.locator('#webxMailSearch').fill('Banco');
   assert.equal(await page.locator('.webx-mail-row:not([hidden])').count(),1);
   await page.screenshot({path:dir+'/'+name+'-gmail-topo.png'});
   // SMS: busca separada da lista e toque no item.
   await open('messages');g=await geometry(page);
   assert.ok(g.smsHead&&g.smsMain);
   assert.ok(g.smsHead.bottom<=g.smsMain.y+3,name+': SMS pesquisa dentro da lista');
   await page.locator('#webxSmsSearch').fill('Banco');
   assert.equal(await page.locator('.webx-sms-list button').count(),1);
   await page.locator('[data-webx="sms-open"]').tap({timeout:7000});
   assert.equal(await page.locator('.webx-sms-detail').isVisible(),true);
   await page.screenshot({path:dir+'/'+name+'-sms-topo.png'});
   console.log('WEB_TOOLBARS_V11221_OK '+name+' '+JSON.stringify({youtubeBeforeScroll:before.max,afterScroll:after}));
  }finally{await context.close();}
 }
}finally{await browser.close();}
