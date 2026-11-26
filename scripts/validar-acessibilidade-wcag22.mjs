import { chromium, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const out='artifacts/accessibility';
await mkdir(out,{recursive:true});
const report=[];
const base='http://127.0.0.1:8789/html/';
const viewports=[
 {width:320,height:640},{width:390,height:844},{width:844,height:390},
 {width:768,height:1024},{width:1024,height:768},{width:1366,height:768},
 {width:1920,height:1080}
];
const stages={
 landing:{buttons:['#startNowBtn','#openAccessibilitySettings'],text:['#inicio h1','.hero-subtitle','#startNowLabel']},
 login:{buttons:['#quickSaveBtn','#quickPhone'],text:['#startModalTitle','#startModalIntro','#quickStartForm label span']},
 learning:{buttons:['#freeModeEntry','#exitFullscreen','#openAccessibilitySettings','#learningView .learning-card'],text:['#learningGreeting','#freeModeEntry .free-entry-copy strong','#freeModeEntry .free-entry-copy em']},
 intro:{buttons:['#freeIntroBack','#freeIntroStart','#freeIntroCancel'],text:['#freeIntroTitle','.free-intro-story p']},
 accessibility:{buttons:['#accessibilityDialog button'],text:['#a11yTitle','#a11yIntro']}
};
async function audit(page,stage,key,mode='normal'){
 const metrics=await page.evaluate(({stage,mode,selectors})=>{
  const issues=[], measurements=[];
  const shown=e=>e.getClientRects().length>0&&getComputedStyle(e).visibility==='visible'&&!e.closest('[hidden]');
  for(const selector of selectors.buttons){
   const nodes=[...document.querySelectorAll(selector)].filter(shown);
   if(!nodes.length){issues.push('Controle ausente: '+selector);continue;}
   for(const e of nodes){
    const r=e.getBoundingClientRect(),style=getComputedStyle(e);
    const name=e.getAttribute('aria-label')||e.textContent.trim().slice(0,80)||e.id;
    measurements.push({kind:'control',selector,name,width:r.width,height:r.height,font:style.fontSize});
    if(r.width<43.5||r.height<43.5)issues.push('Alvo abaixo de 44 CSS px: '+name+' '+Math.round(r.width)+'x'+Math.round(r.height));
    if(e.scrollWidth>e.clientWidth+2&&style.overflowX!=='visible')issues.push('Controle cortado: '+name);
    if(e.disabled)continue;
    if(r.width>0&&r.height>0&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight){const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);if(hit&&!e.contains(hit)&&!hit.contains(e))issues.push('Controle encoberto: '+name);}
    if(!name&&e.tagName==='BUTTON')issues.push('Controle sem nome: '+selector);
   }
  }
  for(const selector of selectors.text){
   const nodes=[...document.querySelectorAll(selector)].filter(shown);
   if(!nodes.length){issues.push('Texto ausente: '+selector);continue;}
   for(const e of nodes){
    const style=getComputedStyle(e),size=parseFloat(style.fontSize);
    const r=e.getBoundingClientRect();
    measurements.push({kind:'text',selector,font:size,width:r.width,height:r.height});
    // Preferência Educa+: 18 px no conteúdo principal, 16 px em rótulos.
    const minimum=/label|startNowLabel/.test(selector)?16:18;
    if(size<minimum)issues.push('Fonte abaixo do padrão Educa+: '+selector+' '+size+'px');
    if(e.scrollWidth>e.clientWidth+2&&style.overflowX!=='visible')issues.push('Texto cortado: '+selector);
    if(e.scrollHeight>e.clientHeight+2&&['hidden','clip'].includes(style.overflowY))issues.push('Texto cortado verticalmente: '+selector);
   }
  }
  if(document.documentElement.scrollWidth>innerWidth+2)issues.push('Rolagem horizontal da página');
  return {issues,measurements,mode,stage,viewport:{width:innerWidth,height:innerHeight}};
 },{stage,mode,selectors:stages[stage]});
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
 const violations=axe.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));
 const incomplete=axe.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));
 report.push({key,stage,mode,...metrics,violations,incomplete});
 await page.screenshot({path:out+'/'+key+'-'+stage+'-'+mode+'.png',fullPage:true});
 console.log(key,stage,mode,'UX issues',metrics.issues.length,'WCAG violations',violations.length);
}
for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--no-sandbox']}:{})});
 try{
  for(const viewport of viewports){
   const key=engine.name()+'-'+viewport.width+'x'+viewport.height;
   const page=await browser.newPage({viewport,hasTouch:viewport.width<1100});
   try{
    await page.route('**/api/**',route=>{
      const path=new URL(route.request().url()).pathname;
      const data=path==='/api/conta'?{ok:true,name:'Participante',phone:'65000000000',level_token:'a'.repeat(64)}:{ok:true,atividades:[]};
      return route.fulfill({status:path==='/api/conta'?201:200,contentType:'application/json',body:JSON.stringify(data)});
    });
    await page.goto(base,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.EducaFreeView&&window.EducaAccessibility&&window.EducaFreeMode);
    await page.evaluate(()=>document.fonts.ready);
    await audit(page,'landing',key);
    await page.locator('#startNowBtn').click();
    await audit(page,'login',key);
    await page.locator('#quickPhone').fill('65000000000');
    await page.locator('#quickSaveBtn').click();
    await page.waitForFunction(()=>document.querySelector('#phoneScreen').dataset.currentView==='learning');
    await page.waitForTimeout(1600);
    await audit(page,'learning',key);
    await page.locator('#freeModeEntry').click();
    await page.waitForFunction(()=>document.querySelector('#phoneScreen').dataset.currentView==='free-intro');
    await page.locator('#freeIntroStart').waitFor({state:'visible'});
    await audit(page,'intro',key);
    await page.evaluate(()=>window.EducaAccessibility.update({text:'extra'}));
    await audit(page,'intro',key,'extra');
    // Teste complementar de ampliação de texto: duplica o tamanho calculado
    // dos textos principais; não substitui o zoom nativo manual do navegador.
    await page.evaluate(()=>{window.EducaAccessibility.update({text:'normal'});const nodes=[...document.querySelectorAll('#freeIntroTitle,.free-intro-story p,#freeIntroBack span,#freeIntroCancel span,#freeIntroStartLabel')];const sizes=nodes.map(e=>parseFloat(getComputedStyle(e).fontSize));nodes.forEach((e,i)=>e.style.setProperty('font-size',sizes[i]*2+'px','important'));});
    await audit(page,'intro',key,'text200');
    await page.evaluate(()=>document.querySelectorAll('#freeIntroTitle,.free-intro-story p,#freeIntroBack span,#freeIntroCancel span,#freeIntroStartLabel').forEach(e=>e.style.removeProperty('font-size')));
    await page.evaluate(()=>window.EducaAccessibility.update({text:'normal'}));
    await page.locator('#freeIntroBack').click();
    await page.waitForFunction(()=>document.querySelector('#phoneScreen').dataset.currentView==='learning');
    await page.evaluate(()=>window.EducaAccessibility.update({text:'extra'}));
    await audit(page,'learning',key,'extra');
    await page.evaluate(()=>window.EducaAccessibility.update({text:'normal'}));
    await page.locator('#openAccessibilitySettings').click();
    await audit(page,'accessibility',key);
    // Teclado: o diálogo precisa manter o foco em elementos acessíveis.
    await page.keyboard.press('Tab');
    const focused=await page.evaluate(()=>{const e=document.activeElement;return Boolean(e&&e.closest('#accessibilityDialog')&&e.getClientRects().length&&getComputedStyle(e).visibility==='visible');});
    if(!focused)report.push({key,stage:'keyboard',issues:['Foco não permaneceu visível no diálogo'],violations:[]});
   }catch(error){report.push({key,stage:'flow',issues:[String(error)],violations:[]});}
   finally{await page.close();}
  }
 }finally{await browser.close();}
}
await writeFile(out+'/report.json',JSON.stringify(report,null,2));
const issues=report.reduce((n,r)=>n+r.issues.length,0);
const violations=report.reduce((n,r)=>n+r.violations.length,0);
console.log('ACCESSIBILITY SUMMARY',JSON.stringify({audits:report.length,issues,violations}));
assert.equal(issues+violations,0,'Acessibilidade: consulte report.json e capturas antes de publicar');
