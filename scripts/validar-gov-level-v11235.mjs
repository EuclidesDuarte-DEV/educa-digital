import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--no-sandbox']}:{})});
 try{
 for(const [platform,width,height] of [['web',320,568],['web',390,844],['web',1366,650],['web',1920,1080],['web',896,414],['android',320,568],['android',430,932],['ios',390,844],['ios',768,1024]]){
 const page=await browser.newPage({viewport:{width,height},hasTouch:width<800});
 try{
 // Sessão fictícia local: estes testes verificam funcionalidades após cadastro.
   await page.addInitScript(()=>localStorage.setItem('educaRememberedUser',JSON.stringify({name:'Participante',phone:'65900000001',levelToken:'a'.repeat(64)})));
   await page.goto('http://127.0.0.1:8789/html/?'+(platform==='web'?'platform=web':'app=1&platform='+platform+'&experience=web'),{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.EducaFreeView&&window.EducaReleaseChannel);
 await page.evaluate(()=>{document.body.classList.add('prototype-focus');window.EducaFreeView.isTraining=()=>true;window.EducaFreeView.setView('govbr-home');});
 for(const full of [false,true]){
 await page.evaluate(full=>document.documentElement.classList.toggle('educa-fullscreen-active',full),full);
 for(const large of [false,true]){
 await page.evaluate(large=>{document.documentElement.classList.toggle('a11y-text-extra',large);if(large)document.querySelector('#govbrHomeView h2').style.setProperty('font-size','32px','important');else document.querySelector('#govbrHomeView h2').style.removeProperty('font-size');},large);
 await page.waitForTimeout(100);
 const cta=page.locator('#govbrHomeView .gov-banner-cta');
 await cta.scrollIntoViewIfNeeded();
 const b=await page.evaluate(()=>{const r=s=>{const b=document.querySelector('#govbrHomeView '+s).getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right}};return {banner:r('.gov-real-banner'),cta:r('.gov-banner-cta'),heading:r('h2'),search:r('.gov-search-card'),progress:r('.gov-banner-progress'),nav:r('.gov-bottom-nav'),scroll:r('.gov-real-home-scroll')};});
 assert.ok(b.cta.top>=b.progress.bottom-1&&b.cta.top>=b.heading.bottom-1&&b.cta.bottom<=b.banner.bottom+1,'CTA fora do banner '+JSON.stringify(b));
 assert.ok(b.cta.left>=b.banner.left-1&&b.cta.right<=b.banner.right+1&&b.search.top>=b.banner.bottom-1,'CTA sobreposto '+JSON.stringify(b));
 assert.ok(b.scroll.bottom<=b.nav.top+1,'rolagem invade menu '+JSON.stringify(b));
 await cta.click({timeout:5000});
 assert.match(await page.locator('#govExtraHeading').textContent(),/Aumentar nível/i);
 await page.locator('#govExtraBack').click({timeout:5000});
 await page.locator('#govbrHomeView.is-active').waitFor();
 const last=page.locator('#govbrHomeView .gov-home-row').last();
 await last.scrollIntoViewIfNeeded();
 assert.ok(await last.isVisible());
 console.log('GOV_LEVEL_V11235_OK',JSON.stringify({engine:engine.name(),platform,width,height,full,large}));
 }
 }
 }finally{await page.close();}
 }
 }finally{await browser.close();}
}
