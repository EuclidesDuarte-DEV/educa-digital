import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
const root='https://educa-digital.educamaisdigital.workers.dev';
const html=await readFile('public/html/index.html','utf8');
const rev=html.match(/cards=(\d+)&home=(\d+)/);
assert.ok(rev,'revisão não encontrada');
await mkdir('artifacts/interface-producao',{recursive:true});
const cases=[['iphone',390,680],['small',320,568],['android',360,640],['desktop',1366,768]];
for(const engine of [chromium,webkit]){
 const browser=await engine.launch(engine===chromium?{args:['--no-sandbox']}:{}); 
 try{
  for(const [name,width,height] of cases){
   const mobile=name!=='desktop';
   const context=await browser.newContext({...((name==='iphone'||name==='small')?devices['iPhone 13']:name==='android'?devices['Pixel 5']:{}),viewport:{width,height},isMobile:mobile,hasTouch:mobile,serviceWorkers:'block'});
   const page=await context.newPage();
   try{
    await page.goto(root+'/?audit='+rev[2]+'-'+name,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.EducaFreeView&&document.body.classList.contains('landing-pretest-active')&&parseFloat(document.querySelector('#guideSpotlight').style.width)>20,{},{timeout:15000});
    assert.ok(await page.locator('link[href*="home-responsive-v11238.css?v='+rev[2]+'"]').count(),'HTML antigo');
    await page.locator('#phoneHardware').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
    await page.waitForTimeout(400);
    const b=await page.evaluate(()=>{
     const r=s=>{const b=document.querySelector(s).getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height}};
     return {phone:r('#phoneHardware'),screen:r('#phoneScreen'),dock:r('#homeView .launcher-bottom'),pointer:r('#guidePointer'),spot:r('#guideSpotlight'),height:visualViewport?.height||innerHeight,docWidth:document.documentElement.scrollWidth,viewport:innerWidth};
    });
    assert.ok(b.docWidth<=b.viewport+2,'rolagem horizontal '+JSON.stringify(b));
    if(mobile){
     assert.ok(b.phone.top>=-2&&b.phone.bottom<=b.height+2,'moldura fora da janela '+JSON.stringify(b));
     assert.ok(b.screen.top>=b.phone.top+4&&b.screen.bottom<=b.phone.bottom-4&&b.screen.left>=b.phone.left+4&&b.screen.right<=b.phone.right-4,'vidro fora da moldura '+JSON.stringify(b));
     assert.ok(b.dock.bottom<=b.screen.bottom-5,'dock cortado');
    }
    assert.ok(b.pointer.bottom<=b.spot.top-8,'balão sobre Banco');
    await page.screenshot({path:`artifacts/interface-producao/${engine.name()}-${name}-home.png`,animations:'disabled'});
    // Verificação visual da central sem criar conta nem alterar dados do servidor.
    await page.evaluate(()=>{document.body.classList.add('prototype-focus');window.EducaFreeView.openLearningHub();});
    await page.waitForFunction(()=>document.querySelector('#learningView').classList.contains('is-active'));
    await page.waitForTimeout(300);
    const order=await page.evaluate(()=>{
     const hero=document.querySelector('#freeModeEntry'),pix=document.querySelector('[data-learning-topic="pix"]');
     const rect=e=>e.getBoundingClientRect();
     const h=rect(hero),p=rect(pix),surface=document.querySelector('#learningView .learning-surface');
     return {heroTop:h.top,heroBottom:h.bottom,pixTop:p.top,heroHeight:h.height,pixHeight:p.height,order:getComputedStyle(hero).order,scrollWidth:surface.scrollWidth,clientWidth:surface.clientWidth};
    });
    assert.ok(order.heroBottom<=order.pixTop+1&&order.heroHeight>order.pixHeight&&order.order==='1','Modo Livre não aparece acima do Pix '+JSON.stringify(order));
    assert.ok(order.scrollWidth<=order.clientWidth+2,'overflow nos cards');
    await page.locator('#freeModeEntry').scrollIntoViewIfNeeded();
    await page.screenshot({path:`artifacts/interface-producao/${engine.name()}-${name}-cards.png`,animations:'disabled'});
    console.log('PRODUCAO_INTERFACE_OK',JSON.stringify({engine:engine.name(),name,rev:rev[2],b,order}));
   }finally{await context.close();}
  }
 }finally{await browser.close();}
}
