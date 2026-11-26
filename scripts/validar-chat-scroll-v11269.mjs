import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const mobile of [true,false]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1366,height:768},hasTouch:mobile,isMobile:mobile});
  const page=await context.newPage();
  try{
   await page.addInitScript(()=>localStorage.setItem('educaRememberedUser',JSON.stringify({name:'Participante',phone:'65900000001',levelToken:'a'.repeat(64)})));
   await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.EducaFreeView?.canFreeMode?.()&&window.EducaFreeMode);
   await page.evaluate(()=>{document.body.classList.add('prototype-focus');window.EducaFreeView.setView('learning');});
   const cdp=mobile?await context.newCDPSession(page):null;
   async function scrollInside(selector){
    const loc=page.locator(selector);
    await loc.waitFor({state:'visible'});
    await loc.evaluate(el=>{el.scrollTop=0;});
    const dims=await loc.evaluate(el=>({h:el.clientHeight,sh:el.scrollHeight,overflow:getComputedStyle(el).overflowY}));
    assert.ok(dims.sh>dims.h,'Painel sem overflow interno: '+selector+' '+JSON.stringify(dims));
    assert.match(dims.overflow,/auto|scroll/);
    const rect=await loc.boundingBox();
    const x=Math.round(rect.x+rect.width/2),y=Math.round(Math.min(rect.y+rect.height-30,(mobile?844:768)-30));
    const end=Math.max(Math.round(rect.y+25),y-150);
    assert.ok(y-end>=60,'Área de gesto insuficiente');
    if(mobile){
     await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
     for(let i=1;i<=12;i++){
      await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:Math.round(y+(end-y)*i/12)}]});
      await page.waitForTimeout(20);
     }
     await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    }else{
     await page.mouse.move(x,y);await page.mouse.wheel(0,220);
    }
    await page.waitForFunction(sel=>document.querySelector(sel).scrollTop>25,selector,{timeout:5000});
   }
   await scrollInside('#learningView .learning-surface');
   assert.equal(await page.locator('#phoneScreen').getAttribute('data-current-view'),'learning','Arraste abriu cartão');
   await page.evaluate(()=>{
    window.EducaFreeView.setView('chat');
    const panel=document.getElementById('chatWallpaper');
    panel.replaceChildren();
    for(let i=0;i<25;i++){const div=document.createElement('div');div.className='message '+(i%2?'incoming':'outgoing');div.textContent='Mensagem fictícia de teste de rolagem '+i;panel.appendChild(div);}
   });
   await scrollInside('#chatWallpaper');
   assert.equal(await page.locator('#phoneScreen').getAttribute('data-current-view'),'chat');
   console.log('CHAT_SCROLL_V11269_OK',mobile?'touch':'mouse');
  }finally{await context.close();}
 }
}finally{await browser.close();}
