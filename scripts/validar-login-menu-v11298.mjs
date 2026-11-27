/* V112.98 — test the menu after both remembered and fresh sign-in.
 * Uses fictitious local-only identity. No real login, real SMS or database write. */
import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
const origin=process.env.EDUCA_URL||'http://127.0.0.1:8789';
const cases=[
 {label:'web',browser:chromium,viewport:{width:1366,height:768},url:'/html/'},
 {label:'android',browser:chromium,viewport:{width:360,height:800},url:'/html/?app=1&platform=android&experience=web'},
 {label:'ios',browser:webkit,viewport:{width:390,height:844},url:'/html/?app=1&platform=ios&experience=web'}
];
const username={name:'Participante',phone:'65900000001',levelToken:'a'.repeat(64)};
for(const c of cases){
 const browser=await c.browser.launch(c.browser===chromium?{headless:true,args:['--no-sandbox']}:{headless:true});
 try{
  for(const loginStyle of ['remembered','new']){
   const context=await browser.newContext({viewport:c.viewport,hasTouch:c.label!=='web',isMobile:c.label!=='web'});
   const page=await context.newPage();
   try{
    if(loginStyle==='remembered'){
     await page.addInitScript(user=>localStorage.setItem('educaRememberedUser',JSON.stringify(user)),username);
    }
    await page.route('**/api/progresso?*',async route=>{
     // 2 seconds artificially slow, to ensure the UI does not wait for progress.
     await new Promise(resolve=>setTimeout(resolve,2000));
     await route.fulfill({status:200,json:{ok:true,atividades:[]}}).catch(()=>{});
    });
    await page.route('**/api/conta',route=>route.fulfill({status:200,json:{ok:true,...username,level_token:username.levelToken}}));
    await page.goto(origin+c.url,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>Boolean(window.EducaFreeView));
    if(loginStyle==='new'){
     await page.locator('#startNowBtn').evaluate(x=>x.click());
     await page.locator('#quickPhone').fill(username.phone);
     await page.locator('#quickStartForm').evaluate(x=>x.requestSubmit());
    } else if(await page.locator('#phoneScreen').getAttribute('data-current-view')!=='learning'){
     await page.locator('#startNowBtn').evaluate(x=>x.click());
    }
    await page.waitForFunction(()=>document.querySelector('#phoneScreen')?.dataset.currentView==='learning',{},{timeout:2700});
    assert.ok(await page.locator('#learningView.is-active').isVisible(),c.label+' '+loginStyle+' no training menu');
    assert.ok(await page.locator('#freeModeEntry').isVisible(),c.label+' '+loginStyle+' lost Modo Livre menu');
    assert.equal(await page.locator('#homeView').isVisible(),false,'Unexpected Android launcher after login');
    assert.deepEqual(
     await page.locator('#learningView [data-learning-topic]').evaluateAll(els=>els.map(e=>e.dataset.learningTopic)),
     ['pix','security','whatsapp','govbr']);
    // Unsolicited Android home events must never silently replace the menu.
    await page.evaluate(()=>window.dispatchEvent(new CustomEvent('educa:system-home')));
    assert.equal(await page.locator('#phoneScreen').getAttribute('data-current-view'),'learning');
    // Explicit app exploration remains possible and the gesture returns to the menu.
    await page.locator('#openAndroidHome').evaluate(x=>x.click());
    assert.equal(await page.locator('#phoneScreen').getAttribute('data-current-view'),'home');
    await page.locator('#gestureHome').evaluate(x=>x.click());
    assert.equal(await page.locator('#phoneScreen').getAttribute('data-current-view'),'learning');
    console.log('LOGIN_MENU_V11298_OK '+c.label+' '+loginStyle);
   }finally{await context.close()}
  }
 }finally{await browser.close()}
}
