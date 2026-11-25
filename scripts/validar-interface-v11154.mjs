/* V111.54: browser smoke em viewport e telefone simulado, sem chamadas reais. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const cases=[
 {w:320,h:568},{w:360,h:640},{w:375,h:667},{w:390,h:844},{w:412,h:915},{w:430,h:932},
 {w:768,h:1024},{w:820,h:1180},{w:1024,h:768},{w:1280,h:720},
 {w:1366,h:768},{w:1440,h:900},{w:1920,h:1080},{w:2560,h:1440},
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
   // V111.55 substituiu o balão duplicado pelo holofote do próprio Banco.
   assert.equal(boot.cueCount,0,c.w+': não deve haver balão duplicado no Banco');
   const home=await page.evaluate(()=>{
    const r=el=>{if(!el)return null;const b=el.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height};};
    const spotlight=document.querySelector('#phoneScreen .guide-spotlight'),bank=document.querySelector('[data-open-app="bank"]');
    return {header:r(document.querySelector('.site-header')),hero:r(document.querySelector('.hero-experience')),
      copy:r(document.querySelector('.hero-copy')),spotlight:r(spotlight),bank:r(bank),
      phone:r(document.querySelector('#phoneScreen')),
      guideVisible:!document.querySelector('#guideOverlay').hidden,
      tourHidden:document.querySelector('#educaTour').hidden,
      activated:document.body.classList.contains('landing-pretest-active'),
      bankName:bank.getAttribute('aria-label')};
   });
   assert.ok(home.activated&&home.guideVisible&&home.tourHidden,c.w+': guia V111.55 deve destacar o Banco');
   assert.ok(/primeira atividade/i.test(home.bankName),c.w+': aria-label do Banco');
   assert.ok(home.spotlight&&home.spotlight.top>=home.phone.top-2&&home.spotlight.bottom<=home.phone.bottom+3,c.w+': holofote fora do celular');
   assert.ok(home.spotlight.left>=home.phone.left-2&&home.spotlight.right<=home.phone.right+3,c.w+': holofote cortado');
   assert.ok(overlaps(home.spotlight,home.bank),c.w+': holofote não aponta para Banco');
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
      controls:[...bar.querySelectorAll('.v110-tool:not([hidden]),.v112-video-more summary')].filter(el=>getComputedStyle(el).display!=='none').map(el=>({id:el.id||'more',cssHeight:getComputedStyle(el).height,offsetHeight:el.offsetHeight,...r(el)})),
      layout:view.dataset.liaLayout,liaVisible:document.body.classList.contains('lia-call-visible')};
   });
   console.log('V11255 medidas '+c.w+' '+JSON.stringify({layout:call.layout,controls:call.controls}));
   assert.ok(call.view?.width>200,c.w+': celular simulado sem área útil');
   assert.ok(call.bar.left>=call.view.left-1&&call.bar.right<=call.view.right+1,c.w+': barra ultrapassa borda do Android');
   assert.ok(call.bar.top>=call.view.top&&call.bar.bottom<=call.view.bottom+1,c.w+': dock cortado verticalmente');
   // V111.89: a barra do Android simulado fica na parte inferior da moldura.
   // O dock precisa reservar espaço acima dela em desktop e tablet altos.
   if(c.w>=701&&c.h>=650){
     assert.ok(call.liaVisible,c.w+': modo de chamada sem classe responsiva ativa');
     assert.ok(call.view.bottom-call.bar.bottom>=27,
       c.w+': controles invadem a barra de gestos ('+(call.view.bottom-call.bar.bottom).toFixed(1)+'px)');
     assert.ok(call.self.bottom<=call.bar.top-4,
       c.w+': miniatura cobre a barra de videochamada');
   }
   assert.ok(call.self.right<=call.view.right+2&&call.self.left>=call.view.left-2,c.w+': prévia local sai da tela');
   assert.ok(!overlaps(call.self,call.bar),c.w+': prévia "Você" cobre controles');
   assert.ok(call.top.left>=call.view.left-1&&call.top.right<=call.view.right+1,c.w+': cabeçalho Lia fora da tela');
   assert.ok(call.controls.length>=5,c.w+': esperados cinco controles disponíveis');
   for(const control of call.controls){
    assert.ok(control.left>=call.bar.left-1&&control.right<=call.bar.right+1,c.w+': botão cortado '+control.id);
    assert.ok(control.height>=44,c.w+': toque pequeno demais '+control.id+' ('+control.height.toFixed(1)+'px)');
   }
   for(let i=0;i<call.controls.length;i++)for(let j=i+1;j<call.controls.length;j++)
    assert.ok(!overlaps(call.controls[i],call.controls[j]),c.w+': controles sobrepostos');
   // V111.90 — verificação da chamada real: Mais, Atender e Encerrar.
   // Não basta o botão estar dentro do mockup: o dock precisa estar centrado
   // e afastado do gesto mesmo quando a tela do computador é grande.
   const trio=await page.evaluate(()=>{
    for(const id of ['freeVideoCameraToggle','freeVideoSpeaker','freeVideoMic']){
      const node=document.getElementById(id);if(node)node.hidden=true;
    }
    const answer=document.getElementById('freeVideoAnswer');if(answer)answer.hidden=false;
    const r=el=>{const b=el.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height};};
    const view=document.getElementById('freeVideoView');
    const bar=view.querySelector('.v110-video-toolbar');
    const controls=[
      view.querySelector('.v112-video-more summary'),
      document.getElementById('freeVideoAnswer'),
      document.getElementById('freeVideoHangup')];
    return {view:r(view),dock:r(bar),controls:controls.map(r),justify:getComputedStyle(bar).justifyContent};
   });
   assert.ok(trio.controls.every(x=>x.left>=trio.dock.left-1&&x.right<=trio.dock.right+1),
     c.w+': botão da chamada real fora da barra');
   assert.ok(trio.controls.every(x=>x.height>=44),c.w+': controle pequeno na chamada real');
   assert.ok(trio.view.bottom-trio.dock.bottom>=24,c.w+': barra muito perto do gesto');
   for(let i=0;i<trio.controls.length-1;i++)
     assert.ok(trio.controls[i].right<=trio.controls[i+1].left+1,c.w+': sobreposição na chamada real');
   const midpoint=(trio.controls[0].left+trio.controls[2].right)/2;
   const dockMid=(trio.dock.left+trio.dock.right)/2;
   assert.ok(Math.abs(midpoint-dockMid)<10,c.w+': controles não centralizados');
   assert.equal(trio.justify,'space-evenly',c.w+': controles precisam de distribuição proporcional');
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
