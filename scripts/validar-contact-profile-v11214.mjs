/* V112.14 — teste da tela Dados do contato inspirado no vídeo fornecido pelo usuário.
 * Tudo local no navegador: nenhuma conversa real, contato ou Pix verdadeiro. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('artifacts/contact-profile-v11214',{recursive:true});
try {
 for(const viewport of [{width:320,height:640},{width:390,height:844},{width:1366,height:768}]){
  const name=viewport.width+'x'+viewport.height;
  const page=await browser.newPage({viewport});
  try{
   await page.route('**/api/modo-livre/conversar-web',route=>route.abort());
   await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>window.EducaFreeMode&&window.EducaWebContactProfile&&window.EducaFreeView&&document.documentElement.dataset.educaPlatform==='web',null,{timeout:12000});
   await page.evaluate(()=>{
     document.body.classList.remove('landing-pretest-active','guide-focus-active');
     const guide=document.querySelector('#guideOverlay');if(guide)guide.hidden=true;
     window.EducaFreeView.isTraining=()=>true;
     window.EducaFreeMode.start();
     window.EducaFreeView.setView('whatsapp');
   });
   await page.locator('#whatsappView [data-free-scenario="family-photo"]').click({timeout:6000});
   const img=page.locator('#chatWallpaper .free-training-photo img');
   await img.waitFor({state:'visible'});
   await page.waitForFunction(()=>document.querySelector('#chatWallpaper .free-training-photo img')?.naturalWidth>=500,null,{timeout:5000});
   const conversation=await page.locator('#chatWallpaper .message').allTextContents();
   assert.match(conversation[0],/é o Rafa\. Troquei de número/);
   assert.doesNotMatch(conversation[0],/olha a foto|para saber que sou eu/i);
   assert.match(conversation.at(-1),/R\$ 650/);
   const source=await img.getAttribute('src');
   assert.match(source,/free-family-photo-v11214\.webp/);
   await page.locator('#scenarioTitle').click({timeout:6000});
   const overlay=page.locator('#freeContactProfileLayer');
   await overlay.waitFor({state:'visible'});
   assert.equal(await page.locator('#fcTitle').innerText(),'Dados do contato');
   assert.equal(await page.locator('#freeContactProfileLayer .fc-big-avatar').count(),1);
   const avatar=await page.locator('#freeContactProfileLayer .fc-portrait').evaluate(img=>({w:img.naturalWidth,h:img.naturalHeight}));
   assert.ok(avatar.w>=500&&avatar.h>=600,name+': foto do perfil não está nítida');
   await page.screenshot({path:'artifacts/contact-profile-v11214/'+name+'-perfil.png'});
   const report=overlay.locator('[data-fc="report"]');
   await report.scrollIntoViewIfNeeded();
   assert.equal(await report.isVisible(),true,name+': denunciar não alcançável');
   // Opções adicionais vistas no vídeo: demonstrativas, mas clicáveis.
   for(const action of ['storage','save','transcribe','lock','restricted','encryption','group','share']){
    await overlay.locator('[data-fc="'+action+'"]').click();
    const message=await overlay.locator('#fcStatus').innerText();
    assert.ok(message.length>25,name+': opção '+action+' não explicou a simulação');
   }
   await overlay.locator('[data-fc="media"]').click();
   assert.equal(await overlay.locator('[data-pane="media"]').isVisible(),true);
   await overlay.locator('#fcMediaPhoto').click();
   assert.equal(await overlay.locator('[data-pane="photo"]').isVisible(),true);
   const full=await overlay.locator('.fc-full-image').evaluate(img=>({w:img.naturalWidth,h:img.naturalHeight}));
   assert.ok(full.w>=500&&full.h>=600);
   await page.screenshot({path:'artifacts/contact-profile-v11214/'+name+'-foto.png'});
   await overlay.locator('[data-fc="back"]').click();
   assert.equal(await overlay.locator('[data-pane="media"]').isVisible(),true);
   await overlay.locator('[data-fc="back"]').click();
   await overlay.locator('[data-fc="favorite"]').click();
   assert.match(await overlay.locator('#fcFavorite').innerText(),/Adicionado/);
   await overlay.locator('[data-fc="mute"]').click();
   assert.match(await overlay.locator('#fcMuted').innerText(),/Silenciadas/);
   await overlay.locator('[data-fc="theme"]').click();
   await overlay.locator('[data-fc="theme-dark"]').click();
   assert.equal(await page.locator('#chatView.fc-dark-chat').count(),1);
   await overlay.locator('[data-fc="search"]').click();
   await overlay.locator('#fcSearch').fill('650');
   assert.match(await overlay.locator('#fcSearchCount').innerText(),/1 mensagem encontrada/);
   await overlay.locator('[data-fc="result"]').click();
   assert.equal(await overlay.isVisible(),false);
   await img.click();
   assert.equal(await overlay.locator('[data-pane="photo"]').isVisible(),true);
   await overlay.locator('[data-fc="back"]').click();
   await overlay.locator('[data-fc="back"]').click();
   await page.locator('#chatView .chat-header-actions button[aria-label="Menu"]').click();
   const menu=page.locator('#freeContactMoreMenu');
   await menu.waitFor({state:'visible'});
   await menu.locator('[data-fc="profile"]').click();
   assert.equal(await overlay.isVisible(),true);
   await overlay.locator('[data-fc="report"]').scrollIntoViewIfNeeded();
   await overlay.locator('[data-fc="report"]').click();
   await page.waitForFunction(()=>document.querySelector('#freeSummaryTitle')?.textContent.includes('Situação concluída'),null,{timeout:1500});
   await page.locator('#freeSummaryNext').click();
   await page.waitForFunction(()=>document.querySelector('#phoneScreen')?.dataset.currentView==='free-video',null,{timeout:2500});
   assert.equal(await page.evaluate(()=>window.EducaFreeMode.videoState()),'video');
   console.log('OK '+name+': foto nítida, perfil, menu, busca, favoritos, silenciar, tema, denúncia e LIA');
  }finally{await page.close();}
 }
}finally{await browser.close();}
