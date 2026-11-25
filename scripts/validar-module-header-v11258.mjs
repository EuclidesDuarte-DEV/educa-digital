import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const viewport of [{width:320,height:640},{width:390,height:844},{width:1366,height:768}]){
  const page=await browser.newPage({viewport});
  try{
   await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>window.EducaFreeView&&document.documentElement.dataset.educaPlatform==='web');
   for(const topic of ['security','settings','whatsapp','pix','govbr']){
    await page.evaluate(topic=>document.querySelector('[data-learning-topic="'+topic+'"]').click(),topic);
    await page.waitForFunction(()=>document.querySelector('#modulePathView.web-activity-simple.is-active .ed-activity-topic-icon'));
    const m=await page.evaluate(()=>{
     const h=document.querySelector('#modulePathView .module-path-header'),t=h.querySelector('#modulePathTitle'),i=h.querySelector('.ed-activity-topic-icon'),b=h.querySelector('#modulePathBack');
     const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height};};
     const range=document.createRange();range.selectNodeContents(t);
     return {title:t.textContent,header:box(h),titleBox:box(t),icon:box(i),back:box(b),lines:range.getClientRects().length,icons:h.querySelectorAll('.ed-activity-topic-icon').length,pseudo:getComputedStyle(t.parentElement,'::before').content,label:h.querySelector('small')?.textContent||''};
    });
    assert.equal(m.label,'');assert.equal(m.icons,1);assert.ok(['none','normal'].includes(m.pseudo));
    assert.ok(m.titleBox.x>=m.icon.right-1&&m.icon.x>=m.back.right-1,JSON.stringify(m));
    assert.ok(m.lines<=2&&m.titleBox.w>=80&&m.header.h<160,JSON.stringify(m));
    assert.ok(m.titleBox.right<=m.header.right+1,JSON.stringify(m));
    console.log('V112.58 OK '+viewport.width+' '+topic+' '+m.title);
   }
  }finally{await page.close();}
 }
}finally{await browser.close();}
