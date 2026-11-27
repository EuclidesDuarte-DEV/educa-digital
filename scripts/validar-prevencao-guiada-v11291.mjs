import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {chromium,webkit} from 'playwright';

// Exercises follow the real guided navigation: topic -> intro -> "Agora quero
// praticar" -> simulated app -> highlighted controls -> success -> topic.
const baseUrl=process.env.EDUCA_URL||'http://127.0.0.1:8789';
const engine=process.env.EDUCA_BROWSER==='webkit'?webkit:chromium;
const browser=await engine.launch(engine===chromium?{args:['--no-sandbox']}:{});
const catalog={};
runInNewContext(await readFile('public/static/js/guided-prevention-catalog-v11292.js','utf8'),{window:catalog});
runInNewContext(await readFile('public/static/js/guided-app-routes-v11297.js','utf8'),{window:catalog});
const old=[
 ['security','Link falso para roubar dados','guided-link-dados'],
 ['security','Ligação de falso sequestro','guided-falso-sequestro'],
 ['pix','Golpe do Pix errado','guided-pix-devolucao'],
 ['whatsapp','Áudio com voz conhecida','guided-whatsapp-voz'],
 ['whatsapp','Loja falsa no WhatsApp','guided-whatsapp-loja'],
 ['govbr','Falsa prova de vida','guided-gov-prova-vida']
];
const courses=[...old,...catalog.EducaGuidedPrevention.map(x=>[x.topic,x.title,x.code])];
assert.equal(courses.length,38);
assert.equal(Object.keys(catalog.EducaGuidedAppRoutes).length,38);
for(const [,,code] of courses)assert.ok(catalog.EducaGuidedAppRoutes[code],code);
const profiles=[
 {platform:'web',viewport:{width:1366,height:768},font:'normal'},
 {platform:'android',viewport:{width:320,height:700},font:'extra'},
 {platform:'ios',viewport:{width:390,height:844},font:'large'}
];
try{
 for(const [index,{platform,viewport,font}] of profiles.entries()){
  const page=await browser.newPage({viewport,hasTouch:platform!=='web',isMobile:platform!=='web'});
  const recorded=[];
  await page.addInitScript(()=>localStorage.setItem('educaRememberedUser',JSON.stringify({
   name:'Participante',phone:'65900000001',levelToken:'a'.repeat(64)
  })));
  await page.route('**/api/**',route=>{
   const req=route.request();
   if(req.method()==='POST'&&new URL(req.url()).pathname==='/api/progresso'){
    try{recorded.push(req.postDataJSON());}catch{}
   }
   return route.fulfill({json:{ok:true,atividades:[]}});
  });
  const suffix=platform==='web'?'':'?app=1&platform='+platform+'&experience=web';
  await page.goto(baseUrl+'/html/'+suffix,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.EducaAccessibility&&window.EducaGuidedAppFlow?.routeCount?.()===38);
  await page.evaluate(f=>window.EducaAccessibility.update({text:f}),font);
  const hit=loc=>platform==='web'?loc.click():loc.tap();
  await hit(page.locator('#startNowBtn'));
  const home=page.locator('#learningView.is-active');
  await home.waitFor({state:'visible'});
  assert.deepEqual(await home.locator('[data-learning-topic]').evaluateAll(x=>x.map(a=>a.dataset.learningTopic)),['pix','security','whatsapp','govbr']);
  assert.ok(await home.locator('#freeModeEntry').isVisible());
  assert.equal(await page.locator('#phoneScreen').evaluate(x=>x.classList.contains('free-active')),false);
  const subset=courses.filter((_,n)=>n%profiles.length===index);
  for(const [topic,title,code] of subset){
   await hit(home.locator('[data-learning-topic="'+topic+'"]'));
   const path=page.locator('#modulePathView.is-active');
   await path.waitFor({state:'visible'});
   const card=path.locator('[data-module-lesson]').filter({has:page.getByText(title,{exact:true})});
   await hit(card);
   const intro=page.locator('#videoLessonView.is-active');
   await intro.waitFor({state:'visible'});
   assert.ok(await intro.locator('#videoPracticeBtn').isVisible(),'practice button '+code);
   assert.ok(await intro.locator('#videoIntroPlaceholder').isVisible(),'video placeholder '+code);
   assert.equal(await page.locator('#phoneScreen').getAttribute('data-guided-app-lesson'),null);
   assert.equal(await page.locator('#phoneScreen').evaluate(x=>x.classList.contains('free-active')),false);
   await hit(intro.locator('#videoPracticeBtn'));
   await page.waitForFunction(code=>document.querySelector('#phoneScreen')?.dataset.guidedAppLesson===code,code);
   const view=await page.locator('#phoneScreen').getAttribute('data-current-view');
   assert.notEqual(view,'guided-practice','Detached quiz still used: '+code);
   assert.notEqual(view,'home','Opened launcher instead of app: '+code);
   const result=page.locator('#successView.is-active');
   let steps=0;
   for(;steps<9;steps++){
    if(await result.isVisible())break;
    const highlighted=page.locator('#phoneScreen .guide-target').first();
    await highlighted.waitFor({state:'visible',timeout:12000});
    await page.waitForFunction(()=>!document.querySelector('#guideOverlay')?.hidden);
    assert.equal(await page.locator('#phoneScreen').evaluate(x=>x.classList.contains('free-active')),false,'Entered Modo Livre: '+code);
    const targetId=await highlighted.getAttribute('id');
    assert.ok(targetId||await highlighted.getAttribute('aria-label')||await highlighted.textContent(),'empty target '+code);
    await hit(highlighted);
   }
   assert.ok(steps<=8,'Too many steps or never concluded '+code+' view='+await page.locator('#phoneScreen').getAttribute('data-current-view'));
   await result.waitFor({state:'visible'});
   assert.equal(await page.locator('#phoneScreen').getAttribute('data-guided-app-lesson'),null);
   assert.equal(await page.locator('#phoneScreen').evaluate(x=>x.classList.contains('free-active')),false);
   assert.equal(await page.locator('#guidedPracticeView').isVisible(),false);
   await hit(result.locator('#nextLessonBtn'));
   await path.waitFor({state:'visible'});
   assert.match(await card.getAttribute('aria-label'),/Concluída/);
   await hit(path.locator('#modulePathBack'));
   await home.waitFor({state:'visible'});
   assert.ok(await home.locator('#freeModeEntry').isVisible(),'lost main menu after '+code);
   console.log('GUIDED_APP_OK '+platform+' '+code+' steps='+steps);
  }
  assert.deepEqual(recorded.filter(x=>x.event==='complete').map(x=>x.activity_code).sort(),subset.map(x=>x[2]).sort());
  await page.close();
 }
}finally{await browser.close();}
