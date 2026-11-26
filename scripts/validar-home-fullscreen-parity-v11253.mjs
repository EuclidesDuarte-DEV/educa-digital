import {chromium,devices,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
await mkdir('artifacts/home-fullscreen-v11253',{recursive:true});
for(const engine of [chromium,webkit].filter(engine=>!process.env.EDUCA_BROWSER||engine.name()===process.env.EDUCA_BROWSER)){
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
   await page.locator('#exitFullscreen').waitFor({state:'hidden'});
   assert.deepEqual(before.old,['none','none','none']);
   assert.equal(before.tileCount,12);
   await page.screenshot({path:'artifacts/home-fullscreen-v11253/'+engine.name()+'-'+name+'-normal.png',animations:'disabled'});
   await page.locator('#fullscreenBtn').click();
   await page.waitForFunction(()=>document.documentElement.classList.contains('educa-fullscreen-active'));
   assert.equal(await page.locator('#exitFullscreen').innerText(),await page.evaluate(()=>document.fullscreenElement===document.documentElement?'Sair da tela cheia':'Reduzir simulador'));
   const exitStyle=await page.locator('#exitFullscreen').evaluate(button=>{
    const style=getComputedStyle(button);
    return {background:style.backgroundColor,color:style.color,height:button.getBoundingClientRect().height};
   });
   assert.equal(exitStyle.background,'rgb(184, 46, 72)');
   assert.equal(exitStyle.color,'rgb(255, 255, 255)');
   assert.ok(exitStyle.height>=44);
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
   await page.locator('#exitFullscreen').waitFor({state:'hidden'});
   const restored=await sample();assert.deepEqual(restored.old,['none','none','none']);
   console.log('FULLSCREEN_PARITY_V11253_OK',JSON.stringify({engine:engine.name(),name,before:before.font,after:after.font}));
  }finally{await page.close();}
 }
 const {viewport,userAgent}=devices['iPhone 13'];
 const page=await browser.newPage({viewport,userAgent,hasTouch:true,isMobile:true});
 try{
  await page.addInitScript(()=>{
   localStorage.setItem('educaRememberedUser',JSON.stringify({name:'Participante',phone:'65900000001',levelToken:'a'.repeat(64)}));
   // Controle determinístico das transições da API, inclusive no WebKit de CI.
   let current=null;
   const change=element=>{current=element;document.dispatchEvent(new Event('fullscreenchange'));};
   Object.defineProperty(document,'fullscreenEnabled',{get:()=>true});
   Object.defineProperty(document,'fullscreenElement',{get:()=>current});
   Element.prototype.requestFullscreen=async function(){change(this);};
   document.exitFullscreen=async()=>change(null);
   window.enterVideoFullscreen=()=>change(document.querySelector('#freeVideoView'));
  });
  await page.route('**/api/**',route=>route.fulfill({json:{ok:true,progress:[],activities:[]}}));
  await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded'});
  const exit=page.locator('#exitFullscreen');
  await exit.waitFor({state:'visible'});
  assert.equal(await exit.innerText(),'Reduzir simulador');
  await page.locator('#freeModeEntry').tap();
  await page.waitForFunction(()=>document.fullscreenElement===document.documentElement);
  assert.equal(await exit.innerText(),'Sair da tela cheia');
  assert.equal(await page.locator('html').evaluate(root=>root.classList.contains('educa-immersive-active')),false);
  // A saída iniciada pelo navegador precisa desligar também a ampliação anterior.
  await page.evaluate(()=>document.exitFullscreen());
  await exit.waitFor({state:'hidden'});
  assert.equal(await page.locator('#phoneScreen').getAttribute('data-current-view'),'free-intro');
  await page.locator('#focusExpandBtn').waitFor({state:'visible'});
  // O fullscreen do player não é o fullscreen do simulador.
  await page.evaluate(()=>window.enterVideoFullscreen());
  await exit.waitFor({state:'hidden'});
  assert.equal(await page.locator('html').evaluate(root=>root.classList.contains('educa-fullscreen-active')),false);
  await page.evaluate(()=>document.exitFullscreen());
  console.log('FULLSCREEN_BROWSER_EXIT_V11283_OK',engine.name());
 }finally{await page.close();}
 }finally{await browser.close();}
}
