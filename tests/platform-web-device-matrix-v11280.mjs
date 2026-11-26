import {chromium,webkit,firefox} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='artifacts/responsividade-v11280';
await mkdir(out,{recursive:true});
const sizes=[[280,653],[320,568],[360,800],[390,844],[412,915],[430,932],[844,390],[600,960],[768,1024],[1024,768],[1280,720],[1366,768],[1920,1080],[2560,1440]];
const report=[];
const base='http://127.0.0.1:8789/static/channels/web/senior-preview-v11279/index.html';
for(const engine of [chromium,webkit,firefox]){
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--no-sandbox']}:{})});
 try{
  for(const [width,height] of sizes){
   const key=engine.name()+'-'+width+'x'+height;
   const context=await browser.newContext({viewport:{width,height},hasTouch:width<1100});
   const page=await context.newPage();
   try{
    await page.route('**/api/**',async route=>{
     const path=new URL(route.request().url()).pathname;
     const data=path==='/api/conta'?{needs_login:true,message:'Conta existente'}:path==='/api/login/codigo'?{demo_code:'012345'}:path==='/api/login/confirmar'?{name:'Participante',phone:'65900000001',level_token:'a'.repeat(64)}:{ok:true,progress:[],activities:[],level:1};
     await route.fulfill({status:path==='/api/conta'?409:200,contentType:'application/json',body:JSON.stringify(data)});
    });
    await page.goto(base,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.EducaFreeView&&window.EducaAccessibility);
    await page.locator('#startNowBtn').click();
    await page.locator('#quickPhone').fill('65900000001');
    await page.locator('#quickSaveBtn').click();
    await page.locator('#returnCode').fill('012345');
    await page.locator('#returnCodeForm button[type=submit]').click();
    await page.waitForFunction(()=>document.querySelector('#phoneScreen').dataset.currentView==='learning');
    await page.waitForTimeout(1600);
    const views=await page.locator('#phoneScreen .android-view').evaluateAll(els=>els.map(e=>e.dataset.view));
    for(const mode of ['normal','extra']){
     await page.evaluate(mode=>window.EducaAccessibility.update({text:mode}),mode);
     for(const view of views){
      // Renderização estática isolada de todas as telas registradas. Não equivale a concluir todos os fluxos.
      await page.evaluate(view=>window.EducaFreeView.setView(view),view);
      const data=await page.evaluate(view=>{
       const phone=document.querySelector('#phoneScreen'), active=phone.querySelector('.android-view.is-active');
       if(!active||active.dataset.view!==view)return {notReached:true,issues:['Tela não alcançada']};
       const issues=[],small=[],clipped=[];
       const rect=phone.getBoundingClientRect();
       const visible=e=>e.getClientRects().length>0&&!e.closest('[hidden],[aria-hidden=true]')&&getComputedStyle(e).visibility==='visible';
       for(const el of active.querySelectorAll('button,a[href],input,select,textarea,[role=button]')){
        if(!visible(el)||el.disabled)continue;
        const r=el.getBoundingClientRect();
        if(r.width===0||r.height===0)continue;
        const label=el.id||el.getAttribute('aria-label')||el.textContent.trim().slice(0,60)||el.tagName;
        if(r.width<24||r.height<24)small.push({label,w:Math.round(r.width),h:Math.round(r.height)});
        if(r.left<rect.left-3||r.right>rect.right+3){
         let parent=el.parentElement,allowed=false;
         while(parent&&parent!==phone){
          if(['auto','scroll'].includes(getComputedStyle(parent).overflowX)){allowed=true;break;}
          parent=parent.parentElement;
         }
         if(!allowed)clipped.push({label,left:Math.round(r.left-rect.left),right:Math.round(r.right-rect.right)});
        }
       }
       if(rect.width<1||rect.height<1)issues.push('Área do simulador sem dimensão');
       if(document.documentElement.scrollWidth>innerWidth+2)issues.push('Rolagem horizontal na página');
       if(clipped.length)issues.push('Controles extrapolam a largura do simulador');
       if(small.length)issues.push('Alvos abaixo de 24px (verificar exceções e espaçamento WCAG)');
       return {issues,small,clipped,phone:{width:rect.width,height:rect.height},viewWidth:active.clientWidth,viewScrollWidth:active.scrollWidth};
      },view);
      report.push({key,mode,view,...data});
      if(data.issues.length)console.log('DEVICE_FINDING',key,mode,view,JSON.stringify(data).slice(0,1800));
     }
    }
    await page.evaluate(()=>{window.EducaAccessibility.update({text:'normal'});window.EducaFreeView.setView('learning');});
    await page.screenshot({path:out+'/'+key+'-learning.png'});
    await page.locator('#openAccessibilitySettings').click();
    await page.locator('#seniorPreviewToggle').click();
    assert.equal(await page.locator('#seniorPreviewStyles').evaluate(e=>e.disabled),true);
    await page.locator('#seniorPreviewToggle').click();
    assert.equal(await page.locator('#seniorPreviewStyles').evaluate(e=>e.disabled),false);
    await page.screenshot({path:out+'/'+key+'-accessibility.png'});
    console.log('DEVICE_MATRIX_DONE',key,views.length);
   }catch(e){report.push({key,mode:'flow',view:'flow',issues:[String(e)]});console.error('DEVICE_FLOW_FAIL',key,String(e));}
   finally{await context.close();}
  }
 }finally{await browser.close();}
}
await writeFile(out+'/report.json',JSON.stringify(report,null,2));
const findings=report.filter(x=>x.issues.length);
console.log('DEVICE_MATRIX_SUMMARY',JSON.stringify({observations:report.length,findings:findings.length,viewports:sizes.length,engines:3}));
assert.equal(findings.length,0,'Revisar ocorrências e exceções no relatório antes de publicar');
