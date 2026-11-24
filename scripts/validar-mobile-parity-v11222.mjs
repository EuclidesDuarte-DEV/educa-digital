/* Educa+ Digital V112.22 — mesma Home e UX Web em Android/iOS.
   Testes reais de DOM, toque, scroll e aparência em navegador móvel.
   Não acessa Gmail/WhatsApp/Maps ou chamada real. */
import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const dir='artifacts/mobile-parity-v11222';await mkdir(dir,{recursive:true});
const engine=process.env.EDUCA_BROWSER==='webkit'?webkit:chromium;
const browser=await engine.launch(process.env.EDUCA_BROWSER==='webkit'?{headless:true}:{headless:true,args:['--no-sandbox']});
const cases=[
 {platform:'android',width:320,height:700,ua:'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 Chrome/131 Mobile Safari/537.36 EducaNativeAndroid/1.0'},
 {platform:'ios',width:390,height:844,ua:'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'},
 {platform:'android',width:430,height:932,ua:'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/131 Mobile Safari/537.36 EducaNativeAndroid/1.0'},
 {platform:'ios',width:768,height:1024,ua:'Mozilla/5.0 (iPad; CPU OS 26_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'}
];
const inspect=page=>page.evaluate(()=>{
 const sel=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect(),cs=getComputedStyle(e);
   return {display:cs.display,visibility:cs.visibility,background:cs.backgroundColor,x:b.x,y:b.y,w:b.width,h:b.height,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight}};
 return {mobile:document.documentElement.classList.contains('educa-mobile-app'),
   parity:document.documentElement.classList.contains('educa-mobile-web-parity'),
   render:document.documentElement.dataset.educaPlatform,native:document.documentElement.dataset.educaNativePlatform,
   channel:window.EducaReleaseChannel?.platform,channelRender:window.EducaReleaseChannel?.renderPlatform,
   header:sel('.site-header'),hero:sel('.hero-copy'),button:sel('#startNowBtn'),
   stage:sel('#phoneStage'),title:document.querySelector('.hero-copy h1')?.textContent||'',
   launcher:document.querySelectorAll('.educa-ios-safety-launcher').length};
});
try{
 for(const c of cases){
  const key=c.platform+'-'+c.width+'x'+c.height+'-'+(process.env.EDUCA_BROWSER||'chromium');
  const ctx=await browser.newContext({viewport:{width:c.width,height:c.height},hasTouch:true,
   isMobile:c.width<600,userAgent:c.ua,colorScheme:'dark',deviceScaleFactor:2});
  const page=await ctx.newPage();
  try{
   await page.goto('http://127.0.0.1:8789/html/?app=1&platform='+c.platform+'&experience=web',
    {waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>window.EducaReleaseChannel&&window.EducaFreeMode&&
     window.EducaWebReal&&window.EducaWebMoreAppsV11219&&window.EducaWebAppsV11216,
     null,{timeout:20000});
   await page.waitForFunction(()=>Boolean(window.EducaWebChannel?.refreshActivityText),null,{timeout:12000});
   const home=await inspect(page);
   assert.equal(home.mobile,false,key+' ainda entra no modo tela de telefone sem Home');
   assert.equal(home.parity,true,key+' paridade não ativada');
   assert.equal(home.render,'web',key+' não usa UX Web atualizada');
   assert.equal(home.native,c.platform,key+' canal físico incorreto');
   assert.equal(home.channel,c.platform,key+' canal de release alterado');
   assert.equal(home.channelRender,'web');
   assert.ok(home.header&&home.header.display!=='none'&&home.header.h>35,key+' cabeçalho Educa+ oculto');
   assert.ok(home.hero&&home.hero.display!=='none'&&home.hero.h>100,key+' Hero do site oculto');
   assert.match(home.title,/Aprenda no seu ritmo/i);
   assert.ok(home.button&&home.button.display!=='none'&&home.button.w>150,key+' CTA indisponível');
   assert.equal(home.launcher,0,key+' botão intrusivo de chamadas retornou');
   await page.screenshot({path:dir+'/'+key+'-home.png',fullPage:true});
   // V112.31: conta logada e barra superior nos modos Home e treino.
   await page.evaluate(()=>{document.querySelector('#logoutBtn').hidden=false;});
   await page.waitForTimeout(100);
   const menu=await page.evaluate(()=>{
    const box=id=>{const r=document.getElementById(id).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
    const safe=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mobile-safe-top'))||0;
    return {a11y:box('openAccessibilitySettings'),logout:box('logoutBtn'),help:box('openGuidedTour'),safe,width:innerWidth};
   });
   assert.ok(menu.a11y.top>=10&&menu.logout.top>=10,key+' menu invade barra de status');
   assert.ok(menu.logout.left-menu.a11y.right>=14,key+' acessibilidade junto a Sair');
   assert.ok(menu.logout.right<=menu.width,key+' Sair cortado');
   await page.evaluate(()=>{
    document.body.classList.add('prototype-focus');
    document.querySelector('#focusExpandBtn').hidden=false;
    document.querySelector('#focusLogoutBtn').hidden=false;
   });
   await page.waitForFunction(()=>{const b=document.querySelector('#openAccessibilitySettings');return b?.closest('.a11y-focus-toolbar')?.parentElement===document.body&&b.getBoundingClientRect().width>=44;},null,{timeout:5000});
   const focused=await page.evaluate(()=>{
    const box=id=>{const r=document.getElementById(id).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
    return {a11y:box('openAccessibilitySettings'),logout:box('focusLogoutBtn'),expand:box('focusExpandBtn'),phone:box('phoneHardware'),stage:box('phoneStage'),width:innerWidth,height:innerHeight};
   });
   assert.ok(focused.a11y.top>=10&&focused.logout.top>=10,key+' menu treino invade status '+JSON.stringify(focused));
   assert.ok(focused.logout.left-focused.a11y.right>=13,key+' Sair sem margem '+JSON.stringify(focused));
   assert.ok(focused.expand.right<=focused.a11y.left+1,key+' Ampliar colide com acessibilidade '+JSON.stringify(focused));
   assert.ok(focused.phone.top>=Math.max(focused.logout.bottom,focused.expand.bottom,focused.a11y.bottom)-1,key+' mockup sobreposto '+JSON.stringify(focused));
   assert.ok(focused.phone.bottom<=focused.height+1,key+' moldura fora do viewport '+JSON.stringify(focused));
   await page.screenshot({path:dir+'/'+key+'-menu-safe.png'});
   await page.evaluate(()=>{
    document.body.classList.remove('prototype-focus');
    document.querySelector('#focusExpandBtn').hidden=true;
    document.querySelector('#focusLogoutBtn').hidden=true;
    document.querySelector('#logoutBtn').hidden=true;
   });
   console.log('MOBILE_SAFE_HEADER_V11231_OK '+key+' '+JSON.stringify(focused));

   await page.evaluate(()=>{
     window.EducaFreeView.isTraining=()=>true;
     window.EducaFreeMode.start();
     window.EducaWebReal.openApp('youtube');
   });
   const main=page.locator('#webRealView .webv-app.webv-youtube');
   await main.waitFor({state:'visible',timeout:9000});
   assert.equal(await page.locator('.webv-toolbar .webv-search').count(),1,key+' pesquisa fora topo');
   assert.equal(await page.locator('.webv-toolbar .webv-chips').count(),1,key+' filtros fora topo');
   assert.equal(await page.locator('.webv-scroll .webv-chips').count(),0,key+' filtros dentro do feed');
   const color=await page.locator('.webv-app').evaluate(el=>getComputedStyle(el).backgroundColor);
   assert.notEqual(color,'rgb(0, 0, 0)',key+' modo escuro inesperado');
   await page.locator('[data-wv="yt-category"][data-value="Segurança"]').tap({timeout:8000});
   await page.locator('#wvYtSearch input').fill('Pix');
   await page.locator('#wvYtSearch button[type="submit"]').tap({timeout:8000});
   assert.equal(await page.locator('[data-wv="video"][data-value="pix"]').count(),1);
   await page.screenshot({path:dir+'/'+key+'-youtube.png'});

   await page.evaluate(()=>window.EducaWebReal.openApp('photos'));
   await page.locator('[data-webx="photo-tab"][data-value="search"]').tap({timeout:8000});
   assert.equal(await page.locator('#webRealBody .webx-photos-scroll #webxPhotoSearch').count(),0);
   await page.locator('#webxPhotoSearch').fill('novembro');
   await page.locator('[data-webx="photo-tab"][data-value="collections"]').tap({timeout:8000});
   assert.ok(await page.locator('.webx-collection-card').isVisible());
   await page.evaluate(()=>window.EducaWebReal.openApp('gmail'));
   await page.locator('#webxMailSearch').fill('Banco');
   assert.equal(await page.locator('.webx-mail-row:not([hidden])').count(),1);
   await page.evaluate(()=>window.EducaWebReal.openApp('messages'));
   await page.locator('#webxSmsSearch').fill('Banco');
   assert.equal(await page.locator('.webx-sms-list button').count(),1);
   await page.evaluate(()=>window.EducaWebReal.openApp('maps'));
   await page.locator('.webv-map-marker[data-spot="library"]').tap({timeout:8000});
   assert.ok(await page.locator('#webvMapDetail').isVisible());
   await page.evaluate(()=>window.EducaWebReal.openApp('calendar'));
   await page.locator('[data-wv="cal-mode"][data-value="day"]').tap({timeout:8000});
   assert.ok(await page.locator('.webv-day-list').isVisible());
   await page.locator('[data-wv="cal-add"]').first().tap({timeout:8000});
   assert.ok(await page.locator('#wvAgendaForm').isVisible());
   console.log('MOBILE_PARITY_V11222_OK '+key+' '+JSON.stringify({render:home.render,native:home.native,color}));
  }finally{await ctx.close();}
 }
}finally{await browser.close();}
