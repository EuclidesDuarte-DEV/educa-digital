import {chromium,devices,webkit} from 'playwright';
import assert from 'node:assert/strict';

async function checkIllustration(page,channel){
 const image=page.locator('#freeIntroIllustration');
 assert.equal(await image.getAttribute('src'),'/static/img/free-story-v11282/'+channel+'.webp');
 await page.waitForFunction(()=>{const image=document.getElementById('freeIntroIllustration');return image.complete&&image.naturalWidth>0;});
 assert.equal(await image.getAttribute('alt'),'');
}

for(const engine of [chromium,webkit].filter(engine=>!process.env.EDUCA_BROWSER||engine.name()===process.env.EDUCA_BROWSER)){
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--no-sandbox']}:{})});
 try{
  // V112.75 — autenticação real da interface com respostas isoladas do servidor.
  for(const viewport of [{width:390,height:844},{width:820,height:1180},{width:1366,height:768},{width:1920,height:1080}]){
   const page=await browser.newPage({viewport,hasTouch:viewport.width<1000});
   try{
    const phone='65900000001',token='a'.repeat(64);
    let confirmations=0;
    await page.route('**/api/**',async route=>{
     const path=new URL(route.request().url()).pathname;
     if(path==='/api/login/confirmar'){confirmations++;assert.equal(route.request().postDataJSON().code,'012345');await new Promise(resolve=>setTimeout(resolve,300));}
     const data=path==='/api/conta'?{needs_login:true,message:'Conta existente'}:
       path==='/api/login/codigo'?{demo_code:'012345'}:
       path==='/api/login/confirmar'?{name:'Participante',phone,level_token:token}:
       {ok:true,progress:[],activities:[],level:1};
     await route.fulfill({status:path==='/api/conta'?409:200,contentType:'application/json',body:JSON.stringify(data)});
    });
    await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.EducaFreeView);
    assert.equal(await page.evaluate(()=>document.body.classList.contains('prototype-focus')),false,'Visitante deve ver entrada');
    await page.locator('#startNowBtn').click();
    await page.locator('#quickPhone').fill(phone);
    await page.locator('#quickSaveBtn').click();
    await page.locator('#returnCode').fill('012345');
    await page.locator('#returnCodeForm').evaluate(form=>{form.requestSubmit();form.requestSubmit();});
    await page.waitForFunction(()=>document.body.classList.contains('prototype-focus')&&document.documentElement.classList.contains('educa-fullscreen-active')&&document.querySelector('#phoneScreen').dataset.currentView==='learning');
    assert.equal(confirmations,1,'Confirmação duplicada do PIN');
    assert.ok(await page.locator('#exitFullscreen').isVisible(),'Saída da tela cheia precisa permanecer acessível');
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('educaRememberedUser')).phone),phone);
    console.log('LOGIN_AUTO_FULLSCREEN_V11277_OK',engine.name(),viewport.width,viewport.height);
   }finally{await page.close();}
  }
  for(const viewport of [{width:280,height:653},{width:320,height:640},{width:390,height:844},{width:844,height:390},{width:1366,height:768}]){
   const page=await browser.newPage({viewport,hasTouch:viewport.width<500});
   try{
    await page.addInitScript(()=>localStorage.setItem('educaRememberedUser',JSON.stringify({name:'Participante',phone:'65900000001',levelToken:'a'.repeat(64)})));
    await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.EducaFreeView?.canFreeMode?.()&&window.EducaFreeMode);
    const auto=await page.evaluate(()=>({touch:navigator.maxTouchPoints>0&&matchMedia('(pointer: coarse)').matches,expanded:document.documentElement.classList.contains('educa-fullscreen-active'),prototype:document.body.classList.contains('prototype-focus'),view:document.querySelector('#phoneScreen').dataset.currentView}));
    assert.equal(auto.expanded,auto.touch,'Tela cheia automática deve distinguir dispositivos de toque e desktop');
    assert.equal(auto.prototype,auto.touch,'O protótipo, não apenas a página, precisa abrir ampliado');
    if(auto.touch)assert.equal(auto.view,'learning','Conta válida deve continuar no protótipo');
    await page.evaluate(()=>{document.body.classList.add('prototype-focus');window.EducaFreeView.isTraining=()=>true;window.EducaFreeView.openLearningHub();});
    const view=async name=>{await page.waitForFunction(name=>document.querySelector('#phoneScreen').dataset.currentView===name,name);};
    await page.locator('#freeModeEntry').click();
    await view('free-intro');
    assert.equal(await page.evaluate(()=>window.EducaFreeMode.isActive()),false);
    assert.equal(await page.locator('#freeIntroView button').count(),2);
    assert.equal(await page.locator('#freeIntroTitle').innerText(),'Uma mensagem do seu filho');
    await checkIllustration(page,'whatsapp');
    const design=await page.evaluate(()=>{
     const title=getComputedStyle(document.querySelector('#freeIntroTitle'));
     const narrative=getComputedStyle(document.querySelector('.free-intro-story p'));
     const paper=getComputedStyle(document.querySelector('.free-intro-content'));
     const header=getComputedStyle(document.querySelector('.free-intro-hero'));
     const action=document.getElementById('freeIntroStart').getBoundingClientRect();
     return {titleSize:parseFloat(title.fontSize),titleWeight:parseInt(title.fontWeight),storySize:parseFloat(narrative.fontSize),storyStyle:narrative.fontStyle,storyColor:narrative.color,titleColor:title.color,storyBackground:paper.backgroundColor,headerBackground:header.backgroundColor,buttonHeight:action.height};
    });
    assert.ok(design.titleSize>design.storySize&&design.titleWeight>=700,'Hierarquia de título insuficiente '+JSON.stringify(design));
    assert.equal(design.storyStyle,'normal');
    assert.ok(design.storySize>=19,'Narrativa pequena '+JSON.stringify(design));
    assert.notEqual(design.storyColor,design.titleColor);
    assert.notEqual(design.storyBackground,design.headerBackground);
    assert.ok(design.buttonHeight>=50,'Botão principal pequeno');
    assert.ok(design.titleSize>=23,'Título pequeno');
    const layout=await page.evaluate(()=>{
      const q=s=>document.querySelector(s), rect=s=>{const b=q(s).getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height,cy:b.top+b.height/2};};
      const style=getComputedStyle(q('#freeIntroBack'));
      return {header:rect('#freeIntroView header'),back:rect('#freeIntroBack'),arrow:rect('#freeIntroBack svg'),label:rect('#freeIntroBack span'),tag:rect('#freeIntroView .free-intro-mode'),border:parseFloat(style.borderTopWidth),cursor:style.cursor};
    });
    assert.ok(layout.back.height>=44&&layout.border>=1&&layout.cursor==='pointer','Voltar sem aparência de botão');
    assert.ok(layout.arrow.width>=24,'Seta pequena '+JSON.stringify(layout));
    assert.ok(Math.abs(layout.arrow.cy-layout.label.cy)<=2,'Seta e texto desalinhados '+JSON.stringify(layout));
    assert.ok(layout.tag.left>=layout.back.right&&layout.tag.right<=layout.header.right+1,'Identificação sobreposta ou cortada');
    const notice=page.locator('#freeIntroNotice');
    assert.match(await notice.innerText(),/Simulação\. Use apenas dados fictícios/);
    assert.equal(await notice.evaluate(e=>getComputedStyle(e).position),'static','O aviso não pode sobrepor a tela');
    assert.ok(await notice.isVisible(),'Aviso não apareceu');
    assert.equal(await page.locator('#freeEventNotice').isVisible(),false);
    assert.ok(await page.locator('#freeIntroStart').isDisabled());
    await page.locator('#freeIntroStart').evaluate(b=>b.click());
    await page.waitForTimeout(2100);
    assert.ok(await notice.isVisible(),'Aviso integrado deve permanecer durante a leitura');
    assert.ok(await page.locator('#freeIntroStart').isDisabled(),'Aviso liberou o início cedo demais');
    await view('free-intro');
    assert.equal(await page.evaluate(()=>window.EducaFreeMode.isActive()),false);
    // Fonte ampliada: o botão continua alcançável pela rolagem do próprio vidro.
    await page.evaluate(()=>window.EducaAccessibility.update({text:'extra'}));
    await page.locator('#freeIntroStart').scrollIntoViewIfNeeded();
    const inside=await page.evaluate(()=>{
     const p=document.getElementById('phoneScreen').getBoundingClientRect();
     const b=document.getElementById('freeIntroStart').getBoundingClientRect();
     const c=document.querySelector('#freeIntroView .free-intro-surface');
     return b.top>=p.top&&b.bottom<=p.bottom+1&&b.height>=44&&c.clientHeight>0&&getComputedStyle(c).overflowY==='auto';
    });
    assert.ok(inside,'Botão inicial cortado na fonte extra');
    await page.evaluate(()=>window.EducaAccessibility.update({text:'normal'}));
    await page.locator('#freeIntroBack').click();
    await view('learning');
    await page.locator('#freeModeEntry').click();
    await view('free-intro');
    assert.equal(await page.locator('.free-intro-surface').evaluate(e=>e.scrollTop),0,'Ao reabrir, a história deve começar no topo');
    const since=Date.now();
    assert.ok(await page.locator('#freeIntroStart').isDisabled());
    await page.waitForFunction(()=>!document.getElementById('freeIntroStart').disabled);
    assert.ok(Date.now()-since>=4500,'Botão liberou cedo demais');
    assert.equal(await page.evaluate(()=>window.EducaFreeMode.isActive()),false);
    await page.locator('#freeIntroStart').click();
    await view('home');
    assert.equal(await page.evaluate(()=>window.EducaFreeMode.isActive()),true);
    const exit=page.locator('#freeExitBtn');
    assert.ok(await exit.isVisible());
    assert.match(await exit.innerText(),/Sair do Modo Livre/);
    const box=await exit.boundingBox();assert.ok(box.height>=44);
    const glance=await page.locator('#homeView .at-a-glance').boundingBox();
    assert.ok(glance.x+glance.width<=box.x+1,'data e saída sobrepostas');
    await page.locator('#homeView [data-open-app="whatsapp"]').click();
    await view('whatsapp');
    await page.locator('#freeWhatsappBack').click();
    await view('home');
    for(const [name,id] of [['bank-home','freeBankBack'],['govbr-home','freeGovBack']]){
     await page.evaluate(name=>window.EducaFreeView.setView(name),name);
     await page.locator('#'+id).click();
     await view('home');
    }
    await page.locator('#freeEventOpen').waitFor({state:'visible',timeout:15000});
    await page.locator('#freeEventOpen').click();
    await view('chat');
    await page.evaluate(()=>window.EducaFreeMode.reportContact());
    await view('free-summary');
    await view('free-intro');
    assert.equal(await page.locator('#freeIntroTitle').innerText(),'Uma videochamada inesperada');
    assert.equal(await page.locator('#freeIntroChannel').innerText(),'Videochamada');
    await checkIllustration(page,'video');
    assert.ok(await page.locator('#freeIntroStart').isDisabled());
    assert.ok(await page.locator('#freeIntroNotice').isVisible());
    await page.locator('#freeIntroStart').click({timeout:10000});
    await view('free-video');
    await page.locator('#freeVideoHangup').click();
    await view('free-summary');
    await page.locator('#freeSummaryNext').click();
    await view('free-intro');
    assert.equal(await page.locator('#freeIntroChannel').innerText(),'Ligação telefônica');
    await checkIllustration(page,'call');
    await page.locator('#freeIntroBack').click();
    await view('learning');
    assert.equal(await page.evaluate(()=>window.EducaFreeMode.isActive()),false);
    assert.equal(await page.locator('#freeExitBtn').isVisible(),false);
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('educaRememberedUser')).phone),'65900000001');
    console.log('FREE_INTRO_V11270_OK',engine.name(),viewport.width,viewport.height);
   }finally{await page.close();}
  }
  const platform=engine===webkit?'ios':'android';
  const device=devices[platform==='ios'?'iPhone 13':'Pixel 7'];
  const userAgent=device.userAgent+(platform==='ios'?' EducaNativeIOS/1.1':' EducaNativeAndroid/1.1');
  const nativePage=await browser.newPage({viewport:device.viewport,isMobile:true,hasTouch:true,userAgent});
  try{
   await nativePage.addInitScript(()=>localStorage.setItem('educaRememberedUser',JSON.stringify({name:'Participante',phone:'65900000001',levelToken:'a'.repeat(64)})));
   await nativePage.goto('http://127.0.0.1:8789/html/?app=1&platform='+platform+'&experience=web',{waitUntil:'domcontentloaded'});
   await nativePage.waitForFunction(()=>window.EducaFreeView?.canFreeMode?.()&&window.EducaFreeMode);
   assert.equal(await nativePage.evaluate(()=>window.EducaReleaseChannel.platform),platform);
   assert.equal(await nativePage.evaluate(()=>window.EducaReleaseChannel.renderPlatform),'web');
   await nativePage.evaluate(()=>{document.body.classList.add('prototype-focus');window.EducaFreeView.openLearningHub();});
   await nativePage.locator('#freeModeEntry').tap();
   assert.equal(await nativePage.locator('#freeIntroChannel').innerText(),'WhatsApp');
   await checkIllustration(nativePage,'whatsapp');
   assert.equal(await nativePage.locator('#freeIntroNotice').evaluate(e=>getComputedStyle(e).position),'static');
   assert.equal(await nativePage.locator('.free-intro-surface').evaluate(e=>getComputedStyle(e).overflowY),'auto');
   await nativePage.locator('#freeIntroStart').tap({timeout:10000});
   await nativePage.locator('#freeEventOpen').tap({timeout:10000});
   await nativePage.evaluate(()=>window.EducaFreeMode.reportContact());
   await nativePage.locator('#freeIntroView.is-active').waitFor({state:'visible'});
   assert.equal(await nativePage.locator('#freeIntroChannel').innerText(),'Videochamada');
   await checkIllustration(nativePage,'video');
   await nativePage.locator('#freeIntroBack').tap();
   assert.equal(await nativePage.evaluate(()=>window.EducaFreeMode.isActive()),false);
   console.log('FREE_INTRO_NATIVE_ROUTE_OK',platform);
  }finally{await nativePage.close();}
 }finally{await browser.close();}
}
