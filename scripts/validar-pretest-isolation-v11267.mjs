import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--no-sandbox']}:{})});
 try{
  for(const viewport of [{width:390,height:844},{width:1366,height:768}]){
   const page=await browser.newPage({viewport});
   const completions=[];
   const phone='65900000001';
   await page.route('**/api/**',async route=>{
    const req=route.request(),path=new URL(req.url()).pathname;
    let data={ok:true};
    if(path==='/api/conta')data={ok:true,name:'Participante',phone,level_token:'a'.repeat(64)};
    if(path==='/api/progresso'&&req.method()==='POST')completions.push(req.postDataJSON());
    if(path==='/api/progresso'&&req.method()==='GET')data.atividades=[];
    if(path==='/api/modo-livre/nivel')data.xp=80;
    await route.fulfill({json:data});
   });
   try{
    await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.EducaFreeView&&window.EducaFreeMode&&window.EducaAndroidSystem);
    const view=()=>page.locator('#phoneScreen').getAttribute('data-current-view');
    const hit=selector=>page.locator(selector).first().evaluate(el=>el.click());
    const check=async name=>assert.equal(await view(),name);
    await check('home');
    for(const app of ['whatsapp','gmail','photos','govbr','settings','messages']){
     await hit('[data-open-app="'+app+'"]');await check('home');
    }
    await page.evaluate(()=>{window.EducaFreeView.openLearningHub();window.EducaFreeMode.start();window.EducaAndroidSystem.showRecents();window.EducaAndroidSystem.showShade();});
    await check('home');
    assert.equal(await page.locator('#androidRecents').isVisible(),false);
    assert.equal(await page.locator('#androidShade').isVisible(),false);
    await hit('[data-open-app="bank"]');await check('bank-home');
    await hit('#gestureHome');await check('bank-home');
    await hit('#bankExtractBtn');await check('bank-home');
    await page.evaluate(()=>{window.dispatchEvent(new CustomEvent('educa:system-home'));window.EducaFreeView.setView('whatsapp');});
    await check('bank-home');
    await page.waitForTimeout(300);await hit('#bankPixBtn');await check('bank-pix');
    await hit('#bankKeysBtn');await check('bank-pix');
    await page.waitForTimeout(300);await hit('#bankSendPixBtn');await check('bank-send');
    await page.waitForTimeout(300);await hit('[data-pix-type="email"]');
    await page.waitForTimeout(300);await hit('#pixDemoKey');
    await page.waitForTimeout(300);await hit('[data-pix-amount="50"]');
    await page.waitForTimeout(300);await hit('#bankContinuePix');await check('bank-review');
    await page.waitForTimeout(300);await hit('[data-bank-answer="correct"]');
    await page.waitForFunction(()=>document.querySelector('#successView').classList.contains('is-active'));
    await page.waitForFunction(()=>!document.querySelector('#startModal').hidden);
    assert.equal(completions.length,0);
    await page.locator('#quickPhone').fill(phone);
    await page.locator('#quickSaveBtn').click();
    await page.waitForFunction(()=>document.querySelector('#learningView').classList.contains('is-active'));
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('educaRememberedUser')).phone==='65900000001');
    assert.ok(completions.some(e=>e.phone===phone&&e.activity_code==='pix-recipient'&&e.event==='complete'));
    assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('educaCompletedLessonsV44:account:65900000001')).includes('pix:0')));
    await page.waitForFunction(()=>window.EducaWebGamification?.getSnapshot().xp===80);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.EducaWebGamification?.getSnapshot().xp===80);
    console.log('PRETEST_ISOLATION_V11267_OK',engine.name(),viewport.width);
   }finally{await page.close();}
  }
 }finally{await browser.close();}
}
