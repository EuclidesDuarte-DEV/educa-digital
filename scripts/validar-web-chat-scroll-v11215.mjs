/* V112.15 — regressão do problema real no iPhone:
   foto HD deve ser miniatura, scroll alcançável e composer disponível.
 */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('artifacts/web-chat-scroll-v11215',{recursive:true});
try {
 for(const viewport of [
  {width:320,height:640},
  {width:390,height:700},
  {width:390,height:844},
  {width:1366,height:768}
 ]){
  const name=viewport.width+'x'+viewport.height;
  const page=await browser.newPage({viewport});
  try{
   await page.route('**/api/modo-livre/conversar-web',r=>r.abort());
   await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>window.EducaFreeView&&window.EducaFreeMode&&
      document.documentElement.dataset.educaPlatform==='web',null,{timeout:15000});
   await page.evaluate(()=>{
    window.EducaFreeView.isTraining=()=>true;
    window.EducaFreeMode.start();
    window.EducaFreeView.setView('whatsapp');
   });
   await page.locator('#whatsappView [data-free-scenario="family-photo"]').click({timeout:8000});
   const image=page.locator('#chatWallpaper .free-training-photo img');
   await image.waitFor({state:'visible',timeout:5000});
   await page.waitForFunction(()=>document.querySelector('#chatWallpaper .free-training-photo img')?.naturalWidth>=500,null,{timeout:4500});
   const m=await page.evaluate(()=>{
    const img=document.querySelector('#chatWallpaper .free-training-photo img');
    const bubble=document.querySelector('#chatWallpaper .free-training-photo');
    const composer=document.querySelector('#freeOriginalComposer');
    const wall=document.querySelector('#chatWallpaper');
    const phone=document.querySelector('#phoneScreen');
    const br=img.getBoundingClientRect(), cb=composer.getBoundingClientRect(),pr=phone.getBoundingClientRect();
    const w=wall.getBoundingClientRect();
    const vv=window.visualViewport;
    return {naturalW:img.naturalWidth,naturalH:img.naturalHeight,
      photoH:br.height,photoW:br.width,bubbleW:bubble.getBoundingClientRect().width,
      composeH:cb.height,composeBottom:cb.bottom,phoneBottom:pr.bottom,
      wallpaperBottom:w.bottom,wallHeight:wall.clientHeight,
      wallScrollHeight:wall.scrollHeight,scrollY:window.scrollY,
      viewportBottom:vv?vv.offsetTop+vv.height:window.innerHeight,
      hidden:composer.hidden};
   });
   assert.ok(m.naturalW>=500&&m.naturalH>=600,name+': HD asset not loaded');
   assert.ok(m.photoH<=137,name+': image too tall '+JSON.stringify(m));
   assert.ok(m.bubbleW<=175,name+': image bubble too wide '+JSON.stringify(m));
   assert.equal(m.hidden,false,name+': keyboard input hidden');
   assert.ok(m.composeH>=48,name+': keyboard composer too small');
   assert.ok(m.composeBottom<=m.phoneBottom+2,name+': compose clipped outside phone '+JSON.stringify(m));
   assert.ok(m.wallpaperBottom<=m.composeBottom-12,name+': chat covers composer '+JSON.stringify(m));
   await page.locator('#freeOriginalInput').focus();
   await page.waitForTimeout(200);
   const focus=await page.evaluate(()=>{
    const input=document.querySelector('#freeOriginalInput').getBoundingClientRect();
    const vv=window.visualViewport;
    return {bottom:input.bottom,viewportBottom:vv?vv.offsetTop+vv.height:window.innerHeight,
      scrollY:window.scrollY,canScroll:document.scrollingElement.scrollHeight>innerHeight};
   });
   if(viewport.width<=640)assert.ok(focus.bottom<=focus.viewportBottom+18||!focus.canScroll,
      name+': campo inacessível no viewport '+JSON.stringify(focus));
   await page.screenshot({path:'artifacts/web-chat-scroll-v11215/'+name+'-chat.png'});
   await image.click();
   const layer=page.locator('#freeContactProfileLayer');
   await layer.waitFor({state:'visible'});
   assert.equal(await layer.locator('[data-pane="photo"]').isVisible(),true);
   const hd=await layer.locator('.fc-full-image').evaluate(el=>({w:el.naturalWidth,h:el.naturalHeight}));
   assert.ok(hd.w>=500&&hd.h>=600,name+': enlarging the photo lost quality');
   await layer.locator('.fc-nav [data-fc="back"]').click();
   await layer.locator('.fc-nav [data-fc="back"]').click();
   await page.locator('#freeOriginalInput').fill('Vou te mandar o Pix');
   await page.locator('#freeOriginalSend').click({timeout:5000});
   await page.waitForFunction(()=>document.querySelector('#freeSummaryTitle')?.textContent.includes('Você perdeu 15 pontos'),null,{timeout:2000});
   await page.locator('#freeSummaryNext').click();
   await page.waitForFunction(()=>document.querySelector('#phoneScreen')?.dataset.currentView==='free-video',null,{timeout:3500});
   console.log('OK '+name+' '+JSON.stringify({img:m.photoH,bubble:m.bubbleW,focus,zoom:hd}));
  }finally{await page.close();}
 }
}finally{await browser.close();}
