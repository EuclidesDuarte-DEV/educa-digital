import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const configs=[{width:320,height:640},{width:390,height:844},{width:1366,height:768},{width:390,height:844,platform:'android'},{width:390,height:844,platform:'ios'}];
try{
 for(const config of configs){
  const {platform,...viewport}=config;
  const page=await browser.newPage({viewport});
  try{
   const suffix=platform?'?app=1&platform='+platform+'&experience=web':'';
   await page.goto('http://127.0.0.1:8789/html/'+suffix,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>window.EducaFreeView&&window.EducaAccessibility&&document.documentElement.dataset.educaPlatform==='web');
   if(platform)assert.equal(await page.locator('html').getAttribute('data-educa-native-platform'),platform);
   for(const font of ['normal','extra']){
    await page.evaluate(font=>window.EducaAccessibility.update({text:font}),font);
    for(const topic of ['security','settings','whatsapp','pix','govbr','playstore']){
     // Apps seguros integra o catálogo, mas não possui cartão no menu atual.
     // Apenas no teste, reutilizar o acionador existente e seu handler real.
     await page.evaluate(topic=>{
      const button=document.querySelector('[data-learning-topic="'+topic+'"]');
      if(button){button.click();return;}
      if(topic!=='playstore')throw Error('Módulo ausente: '+topic);
      const fixture=document.querySelector('[data-learning-topic="govbr"]');
      const before=fixture.dataset.learningTopic;fixture.dataset.learningTopic=topic;
      try{fixture.click();}finally{fixture.dataset.learningTopic=before;}
     },topic);
     await page.waitForFunction(topic=>document.querySelector('#modulePathView.web-activity-simple.is-active')?.dataset.topic===topic&&!!document.querySelector('#modulePathView .ed-activity-topic-icon'),topic);
     const m=await page.evaluate(()=>{
      const h=document.querySelector('#modulePathView .module-path-header'),t=h.querySelector('#modulePathTitle'),i=h.querySelector('.ed-activity-topic-icon'),b=h.querySelector('#modulePathBack');
      const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height};};
      const range=document.createRange();range.selectNodeContents(t);
      return {title:t.textContent,header:box(h),titleBox:box(t),icon:box(i),back:box(b),textBoxes:[...range.getClientRects()].map(r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom})),icons:h.querySelectorAll('.ed-activity-topic-icon').length,pseudo:getComputedStyle(t.parentElement,'::before').content,label:h.querySelector('small')?.textContent||'',cards:document.querySelectorAll('#moduleLessonList button[data-module-lesson]').length};
     });
     assert.equal(m.label,'');assert.equal(m.icons,1);assert.ok(['none','normal'].includes(m.pseudo));
     assert.ok(m.titleBox.x>=m.icon.right-1&&m.icon.x>=m.back.right-1,JSON.stringify(m));
     assert.ok(m.textBoxes.length<=2&&m.titleBox.w>=80&&m.header.h<180,JSON.stringify(m));
     assert.ok(m.textBoxes.every(t=>t.right<=m.header.right+1&&t.left>=m.icon.right-1),JSON.stringify(m));
     assert.equal(m.cards,['pix','settings'].includes(topic)?3:4);
     console.log('V112.59 OK '+(platform||'web')+' '+viewport.width+' '+font+' '+topic+' '+m.title);
    }
   }
  }finally{await page.close();}
 }
}finally{await browser.close();}
