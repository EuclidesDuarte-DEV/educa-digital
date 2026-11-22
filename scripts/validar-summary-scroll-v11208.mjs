/* V112.08 — E2E: rolagem real da tela "Situação concluída" no celular
 * SIMULADO, fora de tela cheia. Não usa APIs, login ou banco de produção. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';

const cases=[
 {width:390,height:844,font:'normal'},
 {width:390,height:844,font:'large'},
 {width:390,height:844,font:'extra'},
 {width:320,height:640,font:'normal'},
 {width:320,height:640,font:'extra'},
 {width:1366,height:768,font:'normal'},
 {width:1024,height:650,font:'large'}
];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('artifacts/summary-scroll-v11208',{recursive:true});
try{
 for(const config of cases){
  const name=config.width+'x'+config.height+'-'+config.font;
  const page=await browser.newPage({viewport:{width:config.width,height:config.height}});
  try{
   await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>window.EducaFreeMode&&window.EducaFreeView&&window.EducaAccessibility&&document.documentElement.dataset.educaPlatform==='web',{timeout:15000});
   await page.evaluate(font=>{
    window.EducaFreeView.isTraining=()=>true;
    window.EducaFreeMode.start();
    if(font!=='normal')window.EducaAccessibility.update({text:font});
    window.EducaFreeView.setView('free-summary');
    const $=id=>document.getElementById(id);
    $('freeSummaryTitle').textContent='Situação concluída';
    $('freeSummaryText').textContent='Você concluiu esta situação do treino.';
    $('freeSummaryDetail').textContent='Você ignorou e bloqueou a mensagem suspeita. Não toque em links recebidos por SMS. Verifique a situação pelo aplicativo ou site oficial digitado por você.';
    $('freeSummaryAuto').hidden=false;
    $('freeSummaryAuto').textContent='Preparando a próxima atividade automaticamente…';
    $('freeSummaryNext').hidden=false;
    $('freeSummaryNext').textContent='Avançar agora';
    $('freeSummaryHome').textContent='Voltar ao celular';
    $('freeSummaryExit').textContent='Sair do Modo Livre';
   },config.font);
   const selector='#freeSummaryView.android-view.is-active > .v106-app-screen.v106-summary';
   await page.waitForFunction(selector=>{
    const panel=document.querySelector(selector);
    return panel&&getComputedStyle(panel).overflowY==='auto'&&panel.clientHeight>100;
   },selector,{timeout:10000});
   const before=await page.evaluate(selector=>{
    const panel=document.querySelector(selector);
    return {height:panel.clientHeight,scrollHeight:panel.scrollHeight,overflow:getComputedStyle(panel).overflowY,
      touch:getComputedStyle(panel).touchAction,active:!!panel.closest('.android-view.is-active')};
   },selector);
   assert.ok(before.active,name+': tela de conclusão não está ativa');
   assert.equal(before.overflow,'auto',name+': overflow-y bloqueado pela regra genérica');
   assert.ok(before.scrollHeight>before.height+15,name+': tela não tem overflow esperado: '+JSON.stringify(before));
   const panel=page.locator(selector);
   // Em telas móveis, o mockup pode começar ABAIXO do topo da página inicial.
   // Primeiro traga o celular para o viewport; senão a rolagem do mouse cai
   // no body e não no conteúdo do telefone.
   await panel.scrollIntoViewIfNeeded({timeout:12000});
   const rect=await panel.boundingBox();
   assert.ok(rect&&rect.height>120,name+': painel de conclusão não visível');
   const mx=Math.min(config.width-14,Math.max(14,rect.x+rect.width/2));
   const my=Math.min(config.height-14,Math.max(14,rect.y+Math.min(rect.height/2,config.height*.65)));
   const hit=await page.evaluate(([x,y])=>{
    const el=document.elementFromPoint(x,y);
    return {tag:el?.tagName,id:el?.id,inside:!!el?.closest('#freeSummaryView')};
   },[mx,my]);
   assert.ok(hit.inside,name+': ponteiro não está dentro do resumo: '+JSON.stringify({rect,mx,my,hit}));
   await page.mouse.move(mx,my);
   await page.mouse.wheel(0,950);
   await page.waitForTimeout(170);
   const afterWheel=await panel.evaluate(e=>e.scrollTop);
   assert.ok(afterWheel>8,name+': mouse/touchpad não rola dentro do celular, scrollTop='+afterWheel
    +' rect='+JSON.stringify(rect)+' hit='+JSON.stringify(hit));
   const bottom=await page.evaluate(selector=>{
    const panel=document.querySelector(selector),button=document.getElementById('freeSummaryExit');
    panel.scrollTop=panel.scrollHeight;
    const p=panel.getBoundingClientRect(),b=button.getBoundingClientRect();
    return {scrollTop:panel.scrollTop,visible:getComputedStyle(button).display!=='none',
      buttonText:button.textContent,buttonTop:b.top,buttonBottom:b.bottom,
      panelTop:p.top,panelBottom:p.bottom,buttonWidth:b.width};
   },selector);
   assert.ok(bottom.visible&&bottom.buttonWidth>90,name+': botão Sair oculto');
   assert.equal(bottom.buttonText,'Sair do Modo Livre');
   assert.ok(bottom.buttonTop>=bottom.panelTop-3&&bottom.buttonBottom<=bottom.panelBottom-8,
    name+': terceiro botão continua cortado mesmo rolando: '+JSON.stringify(bottom));
   await page.screenshot({path:'artifacts/summary-scroll-v11208/'+name+'.png'});
   console.log('OK '+name+': overflow='+before.scrollHeight+'-'+before.height
     +'; scroll após mouse='+afterWheel+'; último botão visível='+bottom.visible);
  }finally{await page.close();}
 }
}finally{await browser.close();}
