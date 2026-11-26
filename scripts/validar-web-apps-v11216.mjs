/* V112.16 — UX testada: Fototeca (4 colunas, upload/zoom),
 * Gmail (caixa, pastas, pesquisa, rascunho) e Mensagens (SMS fictício).
 */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mkdir} from 'node:fs/promises';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('artifacts/web-apps-v11216',{recursive:true});
const png=readFileSync('public/static/img/logo.png');
try{
 for(const viewport of [{width:320,height:640},{width:390,height:844},{width:1366,height:768}]){
  const tag=viewport.width+'x'+viewport.height;
  const page=await browser.newPage({viewport});
  page.on('dialog',dialog=>dialog.accept());
  try{
   // Conta exclusivamente fictícia para testes locais de interface. Nenhum cadastro real.
    await page.addInitScript(() => localStorage.setItem('educaRememberedUser', JSON.stringify({name:'Participante',phone:'65900000001',levelToken:'a'.repeat(64)})));
    await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>window.EducaFreeMode&&window.EducaWebReal&&
      window.EducaWebAppsV11216&&document.documentElement.dataset.educaPlatform==='web',
      null,{timeout:12000});
   await page.evaluate(()=>{
    window.EducaFreeView.isTraining=()=>true;
    window.EducaFreeMode.start();
    window.EducaFreeView.setView('home');
   });
   const open=async app=>{
    await page.evaluate(app=>window.EducaWebReal.openApp(app),app);
    await page.waitForFunction(app=>window.EducaWebAppsV11216.active()===app,app,{timeout:4000});
    assert.equal(await page.locator('#phoneScreen').getAttribute('data-current-view'),'webreal');
    const dimensions=await page.evaluate(()=>{
     const body=document.querySelector('#webRealBody');
     const header=document.querySelector('.webreal-header');
     const r=body.getBoundingClientRect(),h=header.getBoundingClientRect();
     return {width:body.clientWidth,scrollWidth:body.scrollWidth,height:r.height,headerBottom:h.bottom,bodyTop:r.top};
    });
    assert.ok(dimensions.width>150&&dimensions.height>100,tag+' '+app+' dimensões incorretas '+JSON.stringify(dimensions));
    assert.ok(dimensions.scrollWidth-dimensions.width<=5,tag+' '+app+' scroll horizontal');
    assert.ok(dimensions.bodyTop>=dimensions.headerBottom-3,tag+' '+app+' cabeçalho sobrepõe');
   };
   await open('photos');
   assert.equal(await page.locator('.webx-photos-heading strong').innerText(),'Fototeca');
   assert.match(await page.locator('.webx-photo-empty').innerText(),/Nenhuma foto adicionada/);
   assert.equal(await page.locator('.webx-example-tiles i').count(),4);
   await page.screenshot({path:'artifacts/web-apps-v11216/'+tag+'-fotos-vazia.png'});
   await page.locator('#webRealUpload').setInputFiles({name:'foto-exemplo.png',mimeType:'image/png',buffer:png});
   await page.waitForFunction(()=>document.querySelectorAll('.webx-photo-grid img').length===1,null,{timeout:8000});
   assert.equal(await page.locator('.webx-photo-grid button').count(),1);
   assert.equal(await page.locator('#webRealStatus').evaluate(el=>getComputedStyle(el).pointerEvents),'none',tag+': aviso de foto salva bloqueia grade');
   const images=await page.locator('.webx-photo-grid img').evaluateAll(nodes=>nodes.map(img=>({width:img.naturalWidth,height:img.naturalHeight})));
   assert.ok(images[0].width>0&&images[0].height>0);
   await page.screenshot({path:'artifacts/web-apps-v11216/'+tag+'-fotos-grade.png'});
   await page.locator('[data-webx="period"][data-value="months"]').click();
   assert.equal(await page.locator('.webx-photo-group').count(),1);
   await page.locator('[data-webx="photo-tab"][data-value="collections"]').click();
   assert.match(await page.locator('.webx-collection-card').innerText(),/1 imagem/);
   await page.locator('[data-webx="photo-tab"][data-value="library"]').click();
   await page.locator('[data-webx="photo-open"]').click();
   assert.equal(await page.locator('.webx-photo-stage img').count(),1);
   await page.waitForFunction(()=>document.querySelector('.webx-photo-stage img')?.naturalWidth>0,null,{timeout:4000});
   const photo=await page.locator('.webx-photo-stage img').evaluate(img=>({naturalWidth:img.naturalWidth,width:img.getBoundingClientRect().width}));
   assert.ok(photo.naturalWidth>0&&photo.width>0);
   await page.locator('[data-webx="photo-back"]').click();
   await page.locator('[data-webx="photo-select"]').click();
   await page.locator('[data-webx="photo-open"]').click();
   assert.match(await page.locator('.webx-selection-bar').innerText(),/1 selecionada/);
   await page.locator('[data-webx="photo-delete-selected"]').click();
   await page.waitForFunction(()=>document.querySelector('.webx-photo-empty')!==null,null,{timeout:5000});
   assert.equal(await page.locator('.webx-photo-grid img').count(),0);

   await open('gmail');
   assert.match(await page.locator('.webx-mail-label strong').innerText(),/Caixa de entrada/);
   assert.ok(await page.locator('.webx-mail-row:not([hidden])').count()>=3);
   await page.screenshot({path:'artifacts/web-apps-v11216/'+tag+'-gmail-entrada.png'});
   await page.locator('.webx-mail-toolbar [data-webx="mail-menu"]').click();
   assert.equal(await page.locator('.webx-mail-drawer').isVisible(),true);
   await page.screenshot({path:'artifacts/web-apps-v11216/'+tag+'-gmail-menu.png'});
   await page.locator('[data-webx="mail-folder"][data-value="promotions"]').first().click();
   assert.match(await page.locator('.webx-mail-label').innerText(),/Promoções/);
   assert.equal(await page.locator('.webx-mail-row:not([hidden])').count(),1);
   await page.locator('[data-webx="mail-folder"][data-value="inbox"]').first().click();
   await page.locator('#webxMailSearch').fill('Banco');
   assert.equal(await page.locator('.webx-mail-row:not([hidden])').count(),1);
   await page.locator('#webxMailSearch').fill('');
   await page.locator('[data-webx="mail-open"]').first().click();
   assert.equal(await page.locator('.webx-mail-detail').count(),1);
   assert.match(await page.locator('.webx-mail-notice').innerText(),/fictícia/);
   await page.locator('[data-webx="mail-back"]').click();
   await page.locator('[data-webx="mail-compose"]').click();
   await page.locator('#webxMailForm [name="to"]').fill('teste@exemplo.test');
   await page.locator('#webxMailForm [name="subject"]').fill('Treinamento');
   await page.locator('#webxMailForm [name="message"]').fill('Mensagem de teste, sem envio real.');
   await page.locator('[data-webx="mail-save-draft"]').click();
   assert.match(await page.locator('.webx-mail-label strong').innerText(),/Rascunhos/);
   assert.equal(await page.locator('.webx-mail-row:not([hidden])').count(),1);
   await page.locator('[data-webx="mail-open"]').first().click();
   assert.equal(await page.locator('#webxMailForm [name="subject"]').inputValue(),'Treinamento');
   await page.screenshot({path:'artifacts/web-apps-v11216/'+tag+'-gmail-rascunho.png'});

   await open('messages');
   assert.equal(await page.locator('.webx-sms-list button').count(),3);
   await page.locator('#webxSmsSearch').fill('Banco');
   assert.equal(await page.locator('.webx-sms-list button').count(),1);
   // Aviso surpresa não captura toques nas mensagens.
   await page.evaluate(()=>{const note=document.querySelector('#freeEventNotice');if(note)note.hidden=false;});
   assert.equal(await page.locator('#freeEventNotice').evaluate(el=>getComputedStyle(el).pointerEvents),'none');
   await page.locator('[data-webx="sms-open"]').click();
   assert.match(await page.locator('.webx-sms-demo').innerText(),/fictício/);
   await page.screenshot({path:'artifacts/web-apps-v11216/'+tag+'-sms-treino.png'});
   await page.locator('[data-webx="sms-back"]').click();

   // Fonte super grande: legível sem aumentar ícones e sem barra horizontal.
   await page.evaluate(()=>document.documentElement.classList.add('a11y-text-extra'));
   await page.evaluate(()=>window.EducaWebReal.openApp('gmail'));
   const large=await page.locator('.webx-mail-copy strong').first().evaluate(el=>({
     size:parseFloat(getComputedStyle(el).fontSize),
     overflow:document.querySelector('#webRealBody').scrollWidth-document.querySelector('#webRealBody').clientWidth
   }));
   assert.ok(large.size>=16,tag+': Gmail não respeitou fonte extra grande');
   assert.ok(large.overflow<=5,tag+': Gmail criou rolagem horizontal');
   await page.screenshot({path:'artifacts/web-apps-v11216/'+tag+'-gmail-extra.png'});
   await page.evaluate(()=>document.documentElement.classList.remove('a11y-text-extra'));
   await page.evaluate(()=>window.EducaWebReal.openApp('camera'));
   assert.equal(await page.locator('#webRealCameraVideo').count(),1);
   assert.equal(await page.locator('[data-wr="camera-start"]').count(),1);
   assert.equal(await page.locator('[data-wr="camera-capture"]').count(),1);
   const shutter=await page.locator('[data-wr="camera-capture"]').evaluate(b=>({width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height}));
   assert.ok(shutter.width>=55&&shutter.height>=55,tag+': botão capturar reduzido');
   await page.screenshot({path:'artifacts/web-apps-v11216/'+tag+'-camera.png'});
   console.log('OK '+tag+' — Fotos, Gmail e SMS navegáveis, com foto local, pesquisa e rascunho');
  }finally{await page.close();}
 }
}finally{await browser.close();}
