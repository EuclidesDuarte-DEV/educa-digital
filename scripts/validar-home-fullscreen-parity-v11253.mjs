import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
await mkdir('artifacts/home-fullscreen-v11253',{recursive:true});
for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--no-sandbox']}:{})});
 try{
 for(const [name,width,height] of [['desktop',1640,900],['notebook',1366,768],['compact',1024,650],['tablet',768,1024]]){
  const page=await browser.newPage({viewport:{width,height}});
  try{
   await page.goto('http://127.0.0.1:8789/html/?platform=web',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.EducaFreeView&&document.querySelector('#fullscreenBtn'));
   const sample=()=>page.evaluate(()=>{
    const e=s=>document.querySelector(s),style=s=>getComputedStyle(e(s));
    const rect=s=>{const b=e(s).getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height}};
    return {title:e('.hero-copy h1').textContent.trim(),button:e('#startNowLabel').textContent.trim(),
     old:['.hero-eyebrow','.hero-trust-row','#heroActionNote'].map(s=>style(s).display),
     font:parseFloat(style('.hero-copy h1').fontSize),subtitle:parseFloat(style('.hero-subtitle').fontSize),
     ctaFont:parseFloat(style('#startNowLabel').fontSize),titleBox:rect('.hero-copy'),
     cta:rect('#startNowBtn'),phone:rect('#phoneHardware'),pageWidth:document.documentElement.scrollWidth,
     expanded:document.documentElement.classList.contains('educa-fullscreen-active'),
     tileCount:e('#homeView .launcher-grid').querySelectorAll('.app-tile').length};
   });
   const before=await sample();
   assert.deepEqual(before.old,['none','none','none']);
   assert.equal(before.tileCount,12);
   await page.screenshot({path:'artifacts/home-fullscreen-v11253/'+engine.name()+'-'+name+'-normal.png',animations:'disabled'});
   await page.locator('#fullscreenBtn').click();
   await page.waitForFunction(()=>document.documentElement.classList.contains('educa-fullscreen-active'));
   const after=await sample();
   assert.deepEqual(after.old,['none','none','none'],'fullscreen trouxe a home antiga');
   assert.equal(after.title,before.title);assert.equal(after.button,before.button);assert.equal(after.tileCount,12);
   assert.ok(Math.abs(after.font-before.font)<=3,'tamanho do título foi alterado');
   assert.ok(Math.abs(after.subtitle-before.subtitle)<=2,'tamanho do subtítulo foi alterado');
   assert.ok(Math.abs(after.ctaFont-before.ctaFont)<=2,'tamanho do botão foi alterado');
   assert.ok(after.cta.height>=60&&after.cta.width>=160,'CTA perdeu destaque');
   assert.ok(after.pageWidth<=width+2,'rolagem horizontal inesperada');
   assert.ok(after.phone.left>=-2&&after.phone.right<=width+2,'celular fora da tela');
   assert.ok(after.titleBox.left>=-2&&after.titleBox.right<=width+2,'texto fora da tela');
   if(width>=901)assert.ok(after.titleBox.right<=after.phone.left+2,'texto e celular sobrepostos');
   await page.screenshot({path:'artifacts/home-fullscreen-v11253/'+engine.name()+'-'+name+'-fullscreen.png',animations:'disabled'});
   await page.locator('#exitFullscreen').click();
   await page.waitForFunction(()=>!document.documentElement.classList.contains('educa-fullscreen-active'));
   const restored=await sample();assert.deepEqual(restored.old,['none','none','none']);
   console.log('FULLSCREEN_PARITY_V11253_OK',JSON.stringify({engine:engine.name(),name,before:before.font,after:after.font}));
  }finally{await page.close();}
 }
 }finally{await browser.close();}
}
