import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--no-sandbox']}:{})});
 try{
  for(const viewport of [{width:320,height:640},{width:390,height:844},{width:1366,height:768}]){
   const page=await browser.newPage({viewport,hasTouch:viewport.width<500});
   try{
    await page.addInitScript(()=>localStorage.setItem('educaRememberedUser',JSON.stringify({name:'Participante',phone:'65900000001',levelToken:'a'.repeat(64)})));
    await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.EducaFreeView?.canFreeMode?.()&&window.EducaFreeMode);
    await page.evaluate(()=>{document.body.classList.add('prototype-focus');window.EducaFreeView.isTraining=()=>true;window.EducaFreeView.openLearningHub();});
    const view=async name=>{await page.waitForFunction(name=>document.querySelector('#phoneScreen').dataset.currentView===name,name);};
    await page.locator('#freeModeEntry').click();
    await view('free-intro');
    assert.equal(await page.evaluate(()=>window.EducaFreeMode.isActive()),false);
    assert.equal(await page.locator('#freeEventNotice').isVisible(),false);
    await page.locator('#freeIntroCancel').click();
    await view('learning');
    await page.locator('#freeModeEntry').click();
    await view('free-intro');
    await page.locator('#freeIntroStart').click();
    await view('home');
    assert.equal(await page.evaluate(()=>window.EducaFreeMode.isActive()),true);
    const exit=page.locator('#freeExitBtn');
    assert.ok(await exit.isVisible());
    assert.match(await exit.innerText(),/Sair do Modo Livre/);
    const box=await exit.boundingBox();assert.ok(box.height>=44);
    const glance=await page.locator('#homeView .at-a-glance').boundingBox();
    assert.ok(glance.x+glance.width<=box.x+1,'data e saída sobrepostas');
    await page.locator('#homeView [data-open-app="whatsapp"]').click();
    await view('whatsapp');
    await page.locator('#freeWhatsappBack').click();
    await view('home');
    for(const [name,id] of [['bank-home','freeBankBack'],['govbr-home','freeGovBack']]){
     await page.evaluate(name=>window.EducaFreeView.setView(name),name);
     await page.locator('#'+id).click();
     await view('home');
    }
    await exit.click();
    await view('learning');
    assert.equal(await page.evaluate(()=>window.EducaFreeMode.isActive()),false);
    assert.equal(await page.locator('#freeExitBtn').isVisible(),false);
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('educaRememberedUser')).phone),'65900000001');
    console.log('FREE_INTRO_V11270_OK',engine.name(),viewport.width,viewport.height);
   }finally{await page.close();}
  }
 }finally{await browser.close();}
}
