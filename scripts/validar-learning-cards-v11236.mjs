import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--no-sandbox']}:{})});
 try{
 for(const [platform,width,height] of [['web',320,568],['web',1366,650],['web',1920,1080],['android',360,800],['ios',390,844],['ios',768,1024]]){
  const page=await browser.newPage({viewport:{width,height}});
  try{
   await page.goto('http://127.0.0.1:8789/html/?'+(platform==='web'?'platform=web':'app=1&platform='+platform+'&experience=web'),{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.EducaFreeView);
   await page.evaluate(()=>{document.body.classList.add('prototype-focus');window.EducaFreeView.setView('learning');});
   for(const large of [false,true]){
    await page.evaluate(large=>document.documentElement.classList.toggle('a11y-text-extra',large),large);
    for(const selector of ['.learning-featured','.free-mode-entry']){
     const card=page.locator('#learningView '+selector);
     await card.scrollIntoViewIfNeeded();
     const b=await card.evaluate(e=>{const r=x=>{const b=x.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,height:b.height,width:b.width}};return {card:r(e),icon:r(e.querySelector('.learning-featured-icon,.free-entry-icon')),title:r(e.querySelector('strong')),desc:r(e.querySelector('.learning-featured-copy>span,.free-entry-copy>em')),arrow:r(e.querySelector('.learning-arrow,.free-entry-chevron')),pix:e.querySelector('img')?.getAttribute('src')};});
     assert.ok(b.card.width>0&&b.title.width>0);
     assert.ok(Math.abs((b.card.top+b.card.bottom-b.arrow.top-b.arrow.bottom)/2)<=2,'seta desalinhada '+JSON.stringify(b));
     assert.ok(b.desc.top>=Math.max(b.title.bottom,b.icon.bottom)-1&&b.desc.left<b.title.left,'descrição fora da linha '+JSON.stringify(b));
     assert.ok(b.desc.right<=b.arrow.left+1&&b.title.right<=b.arrow.left+1,'texto colide com seta '+JSON.stringify(b));
     if(selector==='.learning-featured')assert.equal(b.pix,'/static/icons/pix.svg');
    }
    console.log('LEARNING_CARDS_V11236_OK',JSON.stringify({engine:engine.name(),platform,width,height,large}));
   }
  }finally{await page.close();}
 }
 }finally{await browser.close();}
}
