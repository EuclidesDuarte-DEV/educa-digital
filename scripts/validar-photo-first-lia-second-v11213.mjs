/* V112.13: primeiro desafio foto de falso familiar; segundo: videochamada LIA.
 * Verificar tanto bloqueio seguro quanto erro por Pix fictício no navegador Web. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('artifacts/photo-first-lia-second-v11213',{recursive:true});
try{
 for(const viewport of [{width:390,height:844},{width:320,height:700},{width:1366,height:768}]){
  for(const choice of ['bloquear','pix']){
   const label=viewport.width+'x'+viewport.height+'-'+choice;
   const page=await browser.newPage({viewport});
   let aiCalls=0;
   try{
    await page.addInitScript(()=>localStorage.setItem('educaRememberedUser',JSON.stringify({name:'Participante',phone:'65900000001',levelToken:'a'.repeat(64)})));
    await page.route('**/api/modo-livre/nivel',route=>route.fulfill({json:{ok:true,xp:220}}));
    await page.route('**/api/modo-livre/conversar-web',route=>{aiCalls++;return route.abort();});
    await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>window.EducaFreeMode&&window.EducaFreeView&&window.EducaVideoCall&&document.documentElement.dataset.educaPlatform==='web',{timeout:12000});
    await page.evaluate(()=>{
     document.body.classList.add('prototype-focus');
     window.EducaFreeView.isTraining=()=>true;
     window.EducaFreeView.openLearningHub();
    });
    await page.locator('#freeModeEntry').click();
    await page.waitForFunction(()=>!document.getElementById('freeIntroStart').disabled,null,{timeout:12000});
    await page.locator('#freeIntroStart').click();
    await page.locator('#freeEventOpen').waitFor({state:'visible',timeout:12000});
    const first=await page.locator('#freeEventTitle').innerText();
    assert.match(first,/foto recebida/i,label+': a primeira notificação não é a foto');
    await page.locator('#freeEventOpen').click({timeout:5000});
    assert.equal(await page.locator('#phoneScreen').getAttribute('data-current-view'),'chat',label+': não abriu o WhatsApp');
    assert.match(await page.locator('#scenarioTitle').innerText(),/Filho.*foto/i);
    await page.waitForFunction(()=>document.querySelector('#chatWallpaper .free-training-photo img')?.naturalWidth>0,null,{timeout:5000});
    const img=await page.locator('#chatWallpaper .free-training-photo img').evaluate(img=>({width:img.naturalWidth,height:img.naturalHeight}));
    assert.ok(img.width>100&&img.height>100,label+': imagem da conversa não carregou');
    await page.screenshot({path:'artifacts/photo-first-lia-second-v11213/'+label+'-whats.png'});
    if(choice==='bloquear'){
      assert.equal(await page.locator('#freeFamilyBlock').isVisible(),false);
      await page.locator('#chatView .chat-header-actions button[aria-label="Menu"]').click({timeout:4000});
      await page.locator('#freeContactMoreMenu [data-fc="block"]').click({timeout:4000});
      assert.equal(await page.locator('#freeSummaryTitle').innerText(),'Situação concluída');
      assert.match(await page.locator('#freeSummaryText').innerText(),/videochamada com a LIA/i);
    }else{
      await page.locator('#freeOriginalInput').fill('vou te mandar o pix');
      await page.locator('#freeOriginalSend').click({timeout:4000});
      assert.equal(await page.locator('#freeSummaryTitle').innerText(),'Você perdeu 15 pontos');
      assert.match(await page.locator('#freeSummaryText').innerText(),/85 pontos/);
      assert.match(await page.locator('#freeSummaryText').innerText(),/videochamada com a LIA/i);
      assert.equal(aiCalls,0,label+': aceitar Pix fictício não deve esperar IA');
    }
    if(await page.locator('#freeSummaryNext').isVisible())await page.locator('#freeSummaryNext').click({timeout:4000});
    await page.waitForFunction(()=>document.querySelector('#phoneScreen')?.dataset.currentView==='free-intro',null,{timeout:12000});
    assert.equal(await page.locator('#freeIntroChannel').innerText(),'Videochamada');
    await page.waitForFunction(()=>!document.getElementById('freeIntroStart').disabled,null,{timeout:12000});
    await page.locator('#freeIntroStart').click();
    await page.waitForFunction(()=>document.querySelector('#phoneScreen')?.dataset.currentView==='free-video',null,{timeout:2500});
    assert.equal(await page.evaluate(()=>window.EducaFreeMode.videoState()),'video',label+': próximo desafio não foi a LIA');
    assert.match(await page.locator('#freeVideoName').innerText(),/Lia/i);
    await page.screenshot({path:'artifacts/photo-first-lia-second-v11213/'+label+'-lia.png'});
    console.log('OK '+label+' foto -> '+choice+' -> videochamada com LIA');
   }finally{await page.close();}
  }
 }
}finally{await browser.close();}
