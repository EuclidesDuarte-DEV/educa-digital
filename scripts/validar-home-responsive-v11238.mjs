import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
const cases=[['web',1366,610],['web',1280,600],['web',1600,760],['web',1920,1080],['web',1024,600],['web',768,1024],['web',320,568],['android',360,800],['ios',390,844]];
for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--no-sandbox']}:{})});
 try{
 for(const [platform,width,height] of cases){
  const page=await browser.newPage({viewport:{width,height}});
  try{
   await page.goto('http://127.0.0.1:8789/html/?'+(platform==='web'?'platform=web':'app=1&platform='+platform+'&experience=web'),{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.EducaFreeView&&document.querySelector('#startNowBtn'));
   await page.evaluate(()=>{document.body.classList.remove('prototype-focus');document.documentElement.classList.remove('educa-fullscreen-active');});
   let previous;
   for(const size of ['normal','large','extra','normal']){
    await page.evaluate(size=>{const e=document.querySelector('#a11yFontSize');e.value=size;e.dispatchEvent(new Event('change',{bubbles:true}));},size);
    await page.waitForTimeout(180);
    const b=await page.evaluate(()=>{
     const r=s=>{const e=document.querySelector(s),b=e.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height,font:parseFloat(getComputedStyle(e).fontSize)}};
     return {title:r('.hero-copy h1'),subtitle:r('.hero-subtitle'),cta:r('#startNowBtn'),label:r('#startNowLabel'),phone:r('#phoneHardware'),wrap:r('#inicio .phone-preview-wrap'),header:r('.home-simple-header'),viewport:innerWidth,scroll:document.documentElement.scrollWidth,extra:document.documentElement.classList.contains('a11y-text-extra'),large:document.documentElement.classList.contains('a11y-text-large')};
    });
    assert.ok(b.cta.height>=65&&b.cta.width>0,'CTA pequeno '+JSON.stringify(b));
    assert.ok(b.label.right<=b.cta.right+1&&b.label.bottom<=b.cta.bottom+1,'CTA cortado '+JSON.stringify(b));
    assert.ok(b.scroll<=width+2,'overflow horizontal '+JSON.stringify(b));
    assert.ok(b.phone.left>=-1&&b.phone.right<=width+1,'moldura cortada '+JSON.stringify(b));
    assert.ok(Math.abs((b.phone.left+b.phone.right-b.wrap.left-b.wrap.right)/2)<=2,'moldura fora do centro '+JSON.stringify(b));
    if(platform==='web'&&width>=901&&size==='normal'){
     assert.ok(b.phone.top>=b.header.bottom-1&&b.phone.bottom<=height+1,'moldura fora da área visível '+JSON.stringify(b));
     assert.ok(b.cta.bottom<=height+1,'CTA abaixo da dobra '+JSON.stringify(b));
    }
    if(previous&&size!=='normal')for(const k of ['title','subtitle','label'])assert.ok(b[k].font>previous[k].font*1.1,'fonte não aumentou '+k+' '+JSON.stringify({previous,b}));
    if(size==='large')assert.ok(b.large);
    if(size==='extra')assert.ok(b.extra);
    previous=b;
    console.log('HOME_RESPONSIVE_V11238_OK',JSON.stringify({engine:engine.name(),platform,width,height,size,font:b.title.font,phone:b.phone}));
   }
  }finally{await page.close();}
 }
 }finally{await browser.close();}
}
