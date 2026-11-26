/* V112.20 — diagnostico real de hit-test nos controles do Modo Livre Web
   COM tema escuro do dispositivo, toque e viewport mobile. */
import {chromium,webkit} from 'playwright';
const isWebkit=process.env.EDUCA_BROWSER==='webkit';
const browser=await (isWebkit?webkit:chromium).launch(isWebkit?{headless:true}:{headless:true,args:['--no-sandbox']});
const selectors=['#freeCallAnswer','#freeCallHangup','#freeCallVerify','#freeCallSpeak','#freeCallMic',
 '#freeVideoAnswer','#freeVideoReject','#freeSmsVerify','#freeSmsBlock',
 '#freeEventOpen','#freeEventDismiss','#freeSummaryNext','#freeSummaryHome',
 '#freeFamilyBlock','#freeFamilyVerify','#webRealBack','#gestureHome'];
async function check(page,sel){
 await page.locator(sel).scrollIntoViewIfNeeded({timeout:4000}).catch(()=>{});
 return page.evaluate(selector=>{
  const el=document.querySelector(selector);if(!el)return {selector,missing:true};
  const rect=el.getBoundingClientRect(),x=rect.left+rect.width/2,y=rect.top+rect.height/2;
  const hit=document.elementFromPoint(x,y),stack=document.elementsFromPoint(x,y).slice(0,7);
  const cs=getComputedStyle(el);
  const anc=[];for(let n=el;n;n=n.parentElement){let c=getComputedStyle(n);if(c.pointerEvents==='none'||c.visibility==='hidden'||c.display==='none'||n.hidden)anc.push({id:n.id,cls:String(n.className).slice(0,80),pe:c.pointerEvents,display:c.display,visibility:c.visibility,hidden:n.hidden})}
  const ok=hit===el||el.contains(hit);
  return {selector,visible:el.getClientRects().length>0 && rect.width>0,ok,rect:{x,y,w:rect.width,h:rect.height},hit:hit?.tagName+'#'+hit?.id+'.'+String(hit?.className).slice(0,75),stack:stack.map(n=>n.tagName+'#'+n.id+'.'+String(n.className).slice(0,70)),anc,styles:{pointer:cs.pointerEvents,z:cs.zIndex,opacity:cs.opacity}};
 },sel);
}
let fail=0;
try{
 for(const viewport of [{width:320,height:640},{width:390,height:700},{width:390,height:844},{width:1366,height:768}]){
  const ctx=await browser.newContext({viewport,isMobile:viewport.width<600,hasTouch:true,colorScheme:'dark'});
  const page=await ctx.newPage();const name=viewport.width+'x'+viewport.height;
  try{
   // Sessão fictícia local: estes testes verificam funcionalidades após cadastro.
   await page.addInitScript(()=>localStorage.setItem('educaRememberedUser',JSON.stringify({name:'Participante',phone:'65900000001',levelToken:'a'.repeat(64)})));
   await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>window.EducaFreeMode&&window.EducaFreeView&&
     window.EducaWebReal&&document.documentElement.dataset.educaPlatform==='web',{timeout:16000});
   await page.evaluate(()=>{
      window.EducaFreeView.isTraining=()=>true;
      window.EducaFreeMode.start();
      window.EducaFreeMode.enterVideo();
      window.EducaFreeView.setView('free-call');
   });
   const call=await page.evaluate(()=>({view:document.querySelector('#phoneScreen').dataset.currentView,
      active:document.querySelector('#freeCallView')?.className,
      scene:window.EducaFreeMode.videoState(),
      dimmer:getComputedStyle(document.querySelector('#androidDisplayDimmer')).pointerEvents,
      notices:document.querySelector('#freeEventNotice').hidden,
      overlay:document.querySelector('#guideOverlay')?.hidden}));
   console.log('DIAG_STATE '+name+' '+JSON.stringify(call));
   for(const sel of selectors.slice(0,5)){
    const out=await check(page,sel);console.log('DIAG_HIT '+name+' '+JSON.stringify(out));if(!out.ok&&out.visible)fail++;
   }
   try{
    await page.locator('#freeCallAnswer').tap({timeout:3000});
    console.log('DIAG_ANSWER '+name+' '+JSON.stringify({hidden:await page.locator('#freeCallAnswer').isHidden(),label:await page.locator('#freeCallLine').innerText()}));
   }catch(err){console.log('DIAG_ANSWER_FAIL '+name+' '+String(err).slice(0,900));fail++;}
   try{
    await page.locator('#freeCallHangup').tap({timeout:3000});
    console.log('DIAG_HANGUP '+name+' '+JSON.stringify({view:await page.locator('#phoneScreen').getAttribute('data-current-view')}));
   }catch(err){console.log('DIAG_HANGUP_FAIL '+name+' '+String(err).slice(0,900));fail++;}
   await page.evaluate(()=>{window.EducaFreeMode.enterVideo();window.EducaFreeView.setView('free-call');});
   try{
    await page.locator('#freeCallVerify').tap({timeout:3000});
    console.log('DIAG_VERIFY '+name+' '+JSON.stringify({view:await page.locator('#phoneScreen').getAttribute('data-current-view')}));
   }catch(err){console.log('DIAG_VERIFY_FAIL '+name+' '+String(err).slice(0,900));fail++;}
   // Perfeito percurso do participante: WhatsApp com foto -> LIA -> chamada do banco.
   // Sem criar contas, ligar de verdade ou efetuar Pix.
   try{
     await page.evaluate(()=>{window.EducaFreeMode.stop();window.EducaFreeMode.start();window.EducaFreeMode.triggerEvent();});
     await page.locator('#freeEventOpen').tap({timeout:8000});
     console.log('DIAG_JOURNEY_WHATSAPP '+name+' '+await page.locator('#phoneScreen').getAttribute('data-current-view'));
     // A Web usa o menu do contato; os atalhos antigos permanecem ocultos.
     if(await page.locator('#freeFamilyBlock').isVisible())throw Error('Atalho antigo de bloqueio reapareceu na Web');
     await page.locator('#chatView .chat-header-actions button[aria-label="Menu"]').tap({timeout:8000});
     await page.locator('#freeContactMoreMenu [data-fc="block"]').tap({timeout:8000});
     await page.locator('#freeSummaryView.is-active').waitFor({state:'visible',timeout:8000});
     console.log('DIAG_JOURNEY_BLOCK_MENU '+name);
     await page.locator('#freeSummaryNext').tap({timeout:8000});
     await page.locator('#freeIntroStart').tap({timeout:10000});
     await page.locator('#freeVideoView.is-active').waitFor({state:'visible',timeout:8000});
     await page.locator('#freeVideoHangup').tap({timeout:8000});
     await page.locator('#freeSummaryNext').tap({timeout:8000});
     await page.locator('#freeIntroStart').tap({timeout:10000});
     await page.locator('#freeCallView.is-active').waitFor({state:'visible',timeout:8000});
     const bank=await page.locator('#freeCallName').innerText();
     console.log('DIAG_JOURNEY_CALL '+name+' '+bank);
     for(const sel of ['#freeCallAnswer','#freeCallHangup','#freeCallVerify']){
       const result=await check(page,sel);
       console.log('DIAG_JOURNEY_HIT '+name+' '+JSON.stringify(result));
       if(!result.ok && result.visible)fail++;
     }
     // Simula o bug no Safari: pointerdown+pointerup sem click posterior.
     // O handler recupera UMA vez após o atraso de segurança.
     const fallback=await page.evaluate(()=>{
       const button=document.querySelector('#freeCallAnswer'),r=button.getBoundingClientRect();
       const x=r.left+r.width/2,y=r.top+r.height/2;
       const init={bubbles:true,cancelable:true,pointerType:'touch',pointerId:87,isPrimary:true,clientX:x,clientY:y};
       button.dispatchEvent(new PointerEvent('pointerdown',init));
       button.dispatchEvent(new PointerEvent('pointerup',init));
       return {eventSent:true,answerBefore:button.hidden};
     });
     await page.waitForTimeout(480);
     const accepted=await page.locator('#freeCallAnswer').isHidden();
     console.log('DIAG_FALLBACK_ANSWER '+name+' '+JSON.stringify({...fallback,accepted}));
     if(!accepted)fail++;
     await page.locator('#freeCallHangup').tap({timeout:7000});
     const view=await page.locator('#phoneScreen').getAttribute('data-current-view');
     console.log('DIAG_JOURNEY_RESULT '+name+' '+view);
     if(view!=='free-summary')fail++;
     if(viewport.width===320){
       await page.locator('#freeSummaryNext').tap({timeout:8000});
       const channel=page.locator('#freeIntroView.is-active #freeIntroChannel');
       await channel.waitFor({state:'visible',timeout:8000});
       if(await channel.innerText()!=='Mensagens (SMS)')throw Error('O próximo desafio deve apresentar uma história de SMS');
       const smsArt=await page.locator('#freeIntroIllustration').getAttribute('src');
       if(smsArt!=='/static/img/free-story-v11282/sms.webp')throw Error('A história de SMS deve usar a ilustração de mensagem de texto');
       await page.locator('#freeIntroStart').tap({timeout:10000});
       await page.locator('#freeEventOpen').tap({timeout:8000});
       await page.locator('#freeSmsView.is-active').waitFor({state:'visible',timeout:8000});
       console.log('DIAG_JOURNEY_SMS '+name);
     }
   }catch(err){console.log('DIAG_JOURNEY_FAIL '+name+' '+String(err).slice(0,1400));fail++;}
   // Auditoria das principais telas depois da chamada: botões por toque real.
   const otherApps=[
    {id:'photos',steps:async()=>{await page.locator('[data-webx="photo-tab"][data-value="collections"]').tap({timeout:7000});
      await page.locator('[data-webx="photo-tab"][data-value="library"]').tap({timeout:7000});}},
    {id:'gmail',steps:async()=>{await page.locator('.webx-mail-message').first().tap({timeout:7000});
      await page.locator('[data-webx="mail-back"]').tap({timeout:7000});
      await page.locator('#webxMailSearch').tap({timeout:7000});}},
    {id:'messages',steps:async()=>{await page.locator('[data-webx="sms-open"]').first().tap({timeout:7000});
      await page.locator('[data-webx="sms-back"]').tap({timeout:7000});}},
    {id:'camera',steps:async()=>{await page.locator('[data-wr="open-photos"]').tap({timeout:7000});}},
    {id:'youtube',steps:async()=>{await page.locator('[data-wv="video"]').first().tap({timeout:7000});
      await page.locator('[data-wv="yt-back"]').tap({timeout:7000});}},
    {id:'maps',steps:async()=>{await page.locator('.webv-map-marker[data-spot="library"]').tap({timeout:7000});
      await page.locator('[data-wv="map-route"]').tap({timeout:7000});}},
    {id:'calendar',steps:async()=>{await page.locator('[data-wv="cal-add"]').first().tap({timeout:7000});
      await page.locator('[data-wv="cal-cancel"]').tap({timeout:7000});}}
   ];
   for(const entry of otherApps){
    try{
     await page.evaluate(id=>window.EducaWebReal.openApp(id),entry.id);
     await entry.steps();
     await page.locator('#webRealBack').tap({timeout:7000});
     console.log('DIAG_APP_OK '+name+' '+entry.id);
    }catch(err){console.log('DIAG_APP_FAIL '+name+' '+entry.id+' '+String(err).slice(0,1000));fail++;}
   }

  }finally{await ctx.close()}
 }
}finally{await browser.close()}
console.log('DIAG_TOTAL_FAILURES '+fail);
if(fail)process.exitCode=1;
