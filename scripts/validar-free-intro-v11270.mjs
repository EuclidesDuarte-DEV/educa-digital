import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--no-sandbox']}:{})});
 try{
  for(const viewport of [{width:320,height:640},{width:390,height:844},{width:1366,height:768}]){
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
    assert.equal(await page.locator('#freeIntroView .free-intro-steps').count(),0);
    assert.equal(await page.locator('#freeIntroView .free-intro-symbol').count(),0);
    assert.equal(await page.locator('#freeIntroTitle').innerText(),'Uma mensagem do seu filho');
    const design=await page.evaluate(()=>{
     const title=getComputedStyle(document.querySelector('#freeIntroTitle'));
     const narrative=getComputedStyle(document.querySelector('.free-intro-story em'));
     const paper=getComputedStyle(document.querySelector('.free-intro-story'));
     const header=getComputedStyle(document.querySelector('.free-intro-hero'));
     const action=document.getElementById('freeIntroStart').getBoundingClientRect();
     return {titleSize:parseFloat(title.fontSize),titleWeight:parseInt(title.fontWeight),storySize:parseFloat(narrative.fontSize),storyStyle:narrative.fontStyle,storyColor:narrative.color,titleColor:title.color,storyBackground:paper.backgroundColor,headerBackground:header.backgroundColor,buttonHeight:action.height};
    });
    assert.ok(design.titleSize>design.storySize&&design.titleWeight>=700,'Hierarquia de título insuficiente '+JSON.stringify(design));
    assert.equal(design.storyStyle,'italic');
    assert.ok(design.storySize>=19,'Narrativa pequena '+JSON.stringify(design));
    assert.notEqual(design.storyColor,design.titleColor);
    assert.notEqual(design.storyBackground,design.headerBackground);
    assert.ok(design.buttonHeight>=50,'Botão principal pequeno');
    assert.ok(design.titleSize>=23,'Título pequeno');
    const layout=await page.evaluate(()=>{
      const q=s=>document.querySelector(s), rect=s=>{const b=q(s).getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height,cy:b.top+b.height/2};};
      const style=getComputedStyle(q('#freeIntroBack')),tag=getComputedStyle(q('#freeIntroView .free-intro-kicker'));
      return {header:rect('#freeIntroView header'),back:rect('#freeIntroBack'),arrow:rect('#freeIntroBack svg'),label:rect('#freeIntroBack span'),tag:rect('#freeIntroView .free-intro-kicker'),border:parseFloat(style.borderTopWidth),cursor:style.cursor,tagBg:tag.backgroundColor,tagWeight:parseInt(tag.fontWeight),lowerArrow:rect('#freeIntroCancel svg'),lowerLabel:rect('#freeIntroCancel span')};
    });
    assert.ok(layout.back.height>=44&&layout.border>=1&&layout.cursor==='pointer','Voltar sem aparência de botão');
    assert.ok(layout.arrow.width>=24&&layout.lowerArrow.width>=24,'Seta pequena');
    assert.ok(Math.abs(layout.arrow.cy-layout.label.cy)<=2&&Math.abs(layout.lowerArrow.cy-layout.lowerLabel.cy)<=2,'Seta e texto desalinhados');
    assert.ok(layout.tag.left>=layout.back.right&&layout.tag.right<=layout.header.right+1&&layout.tagBg==='rgba(0, 0, 0, 0)'&&layout.tagWeight<=500,'Identificação sobreposta ou destacada');
    const notice=page.locator('#freeIntroNotice');
    assert.equal(await notice.innerText(),'Tudo é simulado. Não informe dados reais.');
    assert.ok(await notice.isVisible(),'Aviso não apareceu');
    const returnStyle=await page.locator('#freeIntroCancel').evaluate(e=>({height:e.getBoundingClientRect().height,border:parseFloat(getComputedStyle(e).borderTopWidth),cursor:getComputedStyle(e).cursor}));
    assert.ok(returnStyle.height>=44&&returnStyle.border>=1&&returnStyle.cursor==='pointer','Retorno sem destaque');
    assert.equal(await page.locator('#freeEventNotice').isVisible(),false);
    assert.ok(await page.locator('#freeIntroStart').isDisabled());
    await page.locator('#freeIntroStart').evaluate(b=>b.click());
    await notice.waitFor({state:'hidden',timeout:3000});
    assert.ok(await page.locator('#freeIntroStart').isDisabled(),'Aviso liberou o início cedo demais');
    await view('free-intro');
    assert.equal(await page.evaluate(()=>window.EducaFreeMode.isActive()),false);
    // Fonte ampliada: o botão principal permanece no vidro sem exigir rolagem.
    await page.evaluate(()=>window.EducaAccessibility.update({text:'extra'}));
    const inside=await page.evaluate(()=>{
     const p=document.getElementById('phoneScreen').getBoundingClientRect();
     const b=document.getElementById('freeIntroStart').getBoundingClientRect();
     const c=document.querySelector('#freeIntroView .free-intro-content');
     return b.top>=p.top&&b.bottom<=p.bottom+1&&b.height>=44&&c.clientHeight>0&&getComputedStyle(c).overflowY==='auto';
    });
    assert.ok(inside,'Botão inicial cortado na fonte extra');
    await page.evaluate(()=>window.EducaAccessibility.update({text:'normal'}));
    await page.locator('#freeIntroCancel').click();
    await view('learning');
    await page.locator('#freeModeEntry').click();
    await view('free-intro');
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
    await exit.click();
    await view('learning');
    assert.equal(await page.evaluate(()=>window.EducaFreeMode.isActive()),false);
    assert.equal(await page.locator('#freeExitBtn').isVisible(),false);
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('educaRememberedUser')).phone),'65900000001');
    console.log('FREE_INTRO_V11270_OK',engine.name(),viewport.width,viewport.height);
   }finally{await page.close();}
  }
 }finally{await browser.close();}
}
