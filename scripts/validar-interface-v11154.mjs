/* V111.54: browser smoke em viewport e telefone simulado, sem chamadas reais. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const cases=[
 {w:320,h:740},{w:360,h:780},{w:390,h:844},{w:430,h:932},
 {w:768,h:1024},{w:1024,h:768},{w:1366,h:768},{w:1920,h:1080},
 {w:896,h:414}
];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const rect=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
const overlaps=(a,b)=>Boolean(a&&b&&a.left<b.right-2&&a.right>b.left+2&&a.top<b.bottom-2&&a.bottom>b.top+2);
await mkdir('artifacts/layout-v11154',{recursive:true});
try{
 for(const c of cases){
  const page=await browser.newPage({viewport:{width:c.w,height:c.h},deviceScaleFactor:1});
  const pageErrors=[];page.on('pageerror',err=>pageErrors.push(String(err.stack||err.message).slice(0,700)));
  try{
   await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>Boolean(window.EducaFreeView && window.EducaAccessibility),{timeout:20000});
   await page.waitForTimeout(650);
   const boot=await page.evaluate(()=>{
     const bank=document.querySelector('[data-open-app="bank"]');
     return {classes:document.body.className,phoneView:document.querySelector('#phoneScreen')?.dataset.currentView,
       bank:bank?.outerHTML.slice(0,480),cueCount:document.querySelectorAll('.bank-start-cue').length,
       isTraining:window.EducaFreeView?.isTraining?.()};
   });
   console.log('V11154 DOM inicial '+c.w,JSON.stringify({...boot,pageErrors}));
   assert.ok(boot.cueCount>0,c.w+': banco sem balão inicial: '+JSON.stringify(boot));
   const home=await page.evaluate(()=>{
    const r=el=>{if(!el)return null;const b=el.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height};};
    const cue=document.querySelector('.bank-start-cue'),bank=document.querySelector('[data-open-app="bank"]');
    return {header:r(document.querySelector('.site-header')),hero:r(document.querySelector('.hero-experience')),
      copy:r(document.querySelector('.hero-copy')),cue:r(cue),bank:r(bank),
      phone:r(document.querySelector('#phoneScreen')),
      hintVisible:getComputedStyle(cue).display!=='none',
      guideHidden:document.querySelector('#guideOverlay').hidden,
      tourHidden:document.querySelector('#educaTour').hidden,
      activated:document.body.classList.contains('landing-pretest-active'),
      bankName:bank.getAttribute('aria-label')};
   });
   assert.ok(home.activated&&home.hintVisible&&home.guideHidden&&home.tourHidden,c.w+': guia deve apontar para Banco sem escurecer');
   assert.ok(/primeira atividade/i.test(home.bankName),c.w+': aria-label do Banco');
   assert.ok(home.cue.top>=home.phone.top-2&&home.cue.bottom<home.bank.top+3,c.w+': apontador fora do alvo');
   assert.ok(home.cue.left>=home.phone.left-2&&home.cue.right<=home.phone.right+3,c.w+': balão cortado no celular');
   if(c.w>=1100){
    assert.ok(home.header.height>=60&&home.header.height<=84,c.w+': cabeçalho desktop excessivamente alto: '+home.header.height);
    assert.ok(home.copy.top-home.hero.top<=55,c.w+': texto da home começa muito abaixo: '+(home.copy.top-home.hero.top));
   }
   if([320,390,430,768,1366,1920].includes(c.w))
    await page.screenshot({path:'artifacts/layout-v11154/home-'+c.w+'.png',fullPage:false});
   await page.evaluate(()=>{
    window.EducaFreeView.setView('free-video');
    for(const id of ['freeVideoCameraToggle','freeVideoSpeaker','freeVideoMic','freeVideoHangup']){
      const el=document.getElementById(id);if(el)el.hidden=false;
    }
    const answer=document.getElementById('freeVideoAnswer');if(answer)answer.hidden=true;
   });
   await page.waitForFunction(()=>['compact','regular','wide'].includes(document.querySelector('#freeVideoView')?.dataset.liaLayout),{timeout:8000});
   const call=await page.evaluate(()=>{
    const r=el=>{if(!el)return null;const b=el.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height};};
    const view=document.querySelector('#freeVideoView'),bar=document.querySelector('#freeVideoView .v110-video-toolbar');
    return {view:r(view),bar:r(bar),self:r(document.querySelector('#freeVideoSelfie')),
      top:r(document.querySelector('#freeVideoView .v110-video-top')),
      controls:[...bar.querySelectorAll('.v110-tool:not([hidden]),.v112-video-more summary')].filter(el=>getComputedStyle(el).display!=='none').map(el=>({id:el.id||'more',...r(el)})),
      layout:view.dataset.liaLayout};
   });
   assert.ok(call.view?.width>200,c.w+': celular simulado sem área útil');
   assert.ok(call.bar.left>=call.view.left-1&&call.bar.right<=call.view.right+1,c.w+': barra ultrapassa borda do Android');
   assert.ok(call.bar.top>=call.view.top&&call.bar.bottom<=call.view.bottom+1,c.w+': dock cortado verticalmente');
   assert.ok(call.self.right<=call.view.right+2&&call.self.left>=call.view.left-2,c.w+': prévia local sai da tela');
   assert.ok(!overlaps(call.self,call.bar),c.w+': prévia "Você" cobre controles');
   assert.ok(call.top.left>=call.view.left-1&&call.top.right<=call.view.right+1,c.w+': cabeçalho Lia fora da tela');
   assert.ok(call.controls.length>=5,c.w+': esperados cinco controles disponíveis');
   for(const control of call.controls){
    assert.ok(control.left>=call.bar.left-1&&control.right<=call.bar.right+1,c.w+': botão cortado '+control.id);
    assert.ok(control.height>=40,c.w+': toque pequeno demais '+control.id);
   }
   for(let i=0;i<call.controls.length;i++)for(let j=i+1;j<call.controls.length;j++)
    assert.ok(!overlaps(call.controls[i],call.controls[j]),c.w+': controles sobrepostos');
   if(c.w>1100)assert.notEqual(call.layout,'wide',c.w+': o layout deve seguir o mockup, não a tela desktop');
   if([320,390,430,768,1366,1920].includes(c.w))
    await page.screenshot({path:'artifacts/layout-v11154/lia-'+c.w+'.png',fullPage:false});
   await page.evaluate(()=>window.EducaFreeView.setView('home'));
   await page.locator('[data-open-app="bank"]').click();
   assert.equal(await page.locator('.bank-start-cue').count(),0,c.w+': dica não desapareceu ao iniciar');
   console.log('V111.54 '+c.w+'x'+c.h+' OK: topo, Banco, video '+Math.round(call.view.width)+'px, '+call.controls.length+' controles');
  }finally{await page.close();}
 }
}finally{await browser.close();}
