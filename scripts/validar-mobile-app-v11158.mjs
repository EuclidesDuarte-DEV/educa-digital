/* V111.58: app instalado ocupa viewport completo, sem moldura.
 * Rodar: python3 -m http.server 8789 --directory public & node scripts/validar-mobile-app-v11158.mjs
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const size of [{width:320,height:700},{width:390,height:844},{width:430,height:932},{width:768,height:1024},{width:896,height:414}]){
  const page=await browser.newPage({viewport:size,deviceScaleFactor:1});
  await page.goto('http://127.0.0.1:8789/html/?app=1',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>Boolean(window.EducaFreeView),{timeout:20000});
  const result=await page.evaluate(()=>{
   const box=id=>{const e=document.querySelector(id);const r=e.getBoundingClientRect();return {w:r.width,h:r.height,l:r.left,t:r.top,right:r.right,bottom:r.bottom,visible:getComputedStyle(e).display!=='none'};};
   return {mobile:document.documentElement.classList.contains('educa-mobile-app'),
    hardware:box('#phoneHardware'),screen:box('#phoneScreen'),stage:box('#phoneStage'),
    header:box('.site-header'),hero:box('.hero-copy'),frameButton:box('#fullscreenBtn'),
    active:document.querySelector('#phoneScreen')?.dataset.currentView};
  });
  assert.ok(result.mobile,'app class ausente');
  assert.equal(result.header.visible,false,'site-header não deve aparecer no app');
  assert.equal(result.hero.visible,false,'hero-copy não deve aparecer no app');
  assert.equal(result.frameButton.visible,false,'botão de ampliar não deve aparecer');
  assert.ok(result.hardware.w>=size.width-1 && result.hardware.w<=size.width+1,'moldura ocupa largura incorreta '+JSON.stringify(result));
  assert.ok(result.hardware.h>=size.height-2 && result.hardware.h<=size.height+2,'moldura ocupa altura incorreta '+JSON.stringify(result));
  assert.ok(Math.abs(result.screen.l)<1.5 && Math.abs(result.screen.t)<1.5,'app deslocado');
  assert.equal(result.active,'home','app abre na tela do protótipo, não na vitrine');
  console.log('V11158 app instalado: '+size.width+'x'+size.height+' OK');
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded'});
 const separate=await page.evaluate(()=>({
  mobile:document.documentElement.classList.contains('educa-mobile-app'),
  hero:getComputedStyle(document.querySelector('.hero-copy')).display,
  header:getComputedStyle(document.querySelector('.site-header')).display
 }));
 assert.equal(separate.mobile,false,'a página web deve continuar como antes');
 assert.notEqual(separate.hero,'none','vitrine web não pode desaparecer');
 assert.notEqual(separate.header,'none','cabeçalho web não pode desaparecer');
 console.log('V11158 site web sem ?app=1 preservado');
 await page.close();
}finally{await browser.close();}
