import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const out='artifacts/senior-preview';
await mkdir(out,{recursive:true});
const results=[];
for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--no-sandbox']}:{})});
 try{
 for(const viewport of [{width:320,height:640},{width:390,height:844},{width:844,height:390},{width:768,height:1024},{width:1366,height:768},{width:1920,height:1080}]){
  const page=await browser.newPage({viewport,hasTouch:viewport.width<1000});
  const key=engine.name()+'-'+viewport.width+'x'+viewport.height;
  try{
   await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.EducaAccessibility);
   await page.locator('#openAccessibilitySettings').click();
   await page.locator('#seniorPreviewToggle').waitFor({state:'visible'});
   const metrics=()=>page.evaluate(()=>{
    const el=document.querySelector('#a11yIntro'),btn=document.querySelector('#a11ySkip'),d=document.querySelector('#accessibilityDialog');
    const rect=btn.getBoundingClientRect();
    return {font:parseFloat(getComputedStyle(el).fontSize),color:getComputedStyle(el).color,closeWidth:rect.width,closeHeight:rect.height,overflow:d.scrollWidth>d.clientWidth+2,prefs:window.EducaAccessibility.get()};
   });
   const improved=await metrics();
   await page.screenshot({path:out+'/'+key+'-novo.png'});
   await page.locator('#seniorPreviewToggle').click();
   const original=await metrics();
   await page.screenshot({path:out+'/'+key+'-original.png'});
   assert.ok(improved.font>=18,'Fonte experimental pequena');
   assert.ok(improved.closeWidth>=44&&improved.closeHeight>=44,'Fechar muito pequeno');
   assert.equal(improved.overflow,false,'Rolagem horizontal no painel');
   assert.ok(improved.font>original.font,'Alternância não alterou tipografia');
   assert.deepEqual(improved.prefs,original.prefs,'Preferências alteradas pela alternância');
   await page.locator('#seniorPreviewToggle').click();
   await page.evaluate(()=>window.EducaAccessibility.update({text:'extra'}));
   await page.locator('#a11yFinish').scrollIntoViewIfNeeded();
   const extra=await metrics();
   assert.equal(extra.overflow,false,'Rolagem horizontal com texto grande');
   await page.screenshot({path:out+'/'+key+'-extra.png'});
   await page.locator('#a11yFinish').click();
   await page.waitForFunction(()=>!document.querySelector('#accessibilityDialog').open);
   results.push({key,ok:true,improved,original,extra});
   console.log('SENIOR_PREVIEW_OK',key,JSON.stringify({improved,original,extra}));
  }catch(e){results.push({key,ok:false,error:String(e)});console.log('SENIOR_PREVIEW_FAIL',key,String(e));}
  finally{await page.close();}
 }
 }finally{await browser.close();}
}
await writeFile(out+'/report.json',JSON.stringify(results,null,2));
assert.equal(results.filter(r=>!r.ok).length,0,'Falhas no experimento de acessibilidade');
