/* V112.17 — reproduzir os toques no Gmail em tela pequena e teclado virtual.
   Nenhum login ou Gmail real: tudo local, com mensagens fictícias. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
await mkdir('artifacts/web-gmail-v11217',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const viewport of [{width:320,height:640},{width:390,height:700},{width:390,height:844},{width:1366,height:768}]){
  const name=viewport.width+'x'+viewport.height;
  const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:true,deviceScaleFactor:2});
  const page=await context.newPage();
  try{
   // Sessão fictícia local: estes testes verificam funcionalidades após cadastro.
   await page.addInitScript(()=>localStorage.setItem('educaRememberedUser',JSON.stringify({name:'Participante',phone:'65900000001',levelToken:'a'.repeat(64)})));
   await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>!!(window.EducaFreeMode&&window.EducaWebReal&&window.EducaWebAppsV11216&&document.documentElement.dataset.educaPlatform==='web'),null,{timeout:15000});
   await page.evaluate(()=>{
    window.EducaFreeView.isTraining=()=>true;
    window.EducaFreeMode.start();
    window.EducaWebReal.openApp('gmail');
   });
   const gmail=page.locator('#webRealView.webx-gmail .webx-app.webx-gmail');
   await gmail.waitFor({state:'visible',timeout:6000});
   const colors=await page.evaluate(()=>{
    const app=document.querySelector('#webRealView .webx-app');
    const search=document.querySelector('#webxMailSearch');
    const sc=document.querySelector('.webx-mail-scroll');
    const rect=app.getBoundingClientRect();
    return {bg:getComputedStyle(app).backgroundColor,ink:getComputedStyle(app).color,
      searchBg:getComputedStyle(search).backgroundColor,
      rootWidth:rect.width,contentWidth:app.scrollWidth,
      scrollWidth:sc.scrollWidth,clientWidth:sc.clientWidth};
   });
   assert.equal(colors.bg,'rgb(255, 255, 255)',name+': Gmail ainda escuro');
   assert.equal(colors.ink,'rgb(32, 33, 36)',name+': texto não está escuro');
   assert.ok(colors.scrollWidth-colors.clientWidth<=3,name+': rolagem horizontal '+JSON.stringify(colors));
   const rows=page.locator('.webx-mail-row:not([hidden])');
   assert.equal(await rows.count(),3,name+': caixa de entrada indisponível');
   await page.screenshot({path:'artifacts/web-gmail-v11217/'+name+'-claro.png'});
   // Verificar que o toque chega à própria mensagem, sem camada invisível interceptando.
   await page.locator('.webx-mail-message').first().tap({timeout:7000});
   await page.locator('.webx-mail-detail').waitFor({state:'visible',timeout:2000});
   assert.match(await page.locator('.webx-mail-detail h2').innerText(),/Gmail simulado/);
   await page.locator('.webx-mail-detailhead [data-webx="mail-back"]').tap();
   await page.locator('.webx-mail-toolbar [data-webx="mail-menu"]').tap();
   const drawer=page.locator('.webx-mail-drawer');
   assert.equal(await drawer.isVisible(),true,name+': menu sem toque');
   await drawer.locator('[data-webx="mail-folder"][data-value="promotions"]').tap({timeout:7000});
   assert.match(await page.locator('.webx-mail-label strong').innerText(),/Promoções/);
   await page.locator('.webx-mail-toolbar [data-webx="mail-menu"]').tap();
   await drawer.locator('[data-webx="mail-folder"][data-value="inbox"]').tap();

   // Não recriar o input em cada tecla: o Safari mantém o teclado e o cursor.
   const input=page.locator('#webxMailSearch');
   await input.tap({timeout:7000});
   const original=await input.evaluate(el=>{el.dataset.focusStable='yes';return el;});
   await page.keyboard.type('Banco', {delay:12});
   const focus=await page.evaluate(()=>{
     const el=document.querySelector('#webxMailSearch');
     return {value:el.value,active:document.activeElement===el,same:el.dataset.focusStable==='yes',
      visible:[...document.querySelectorAll('.webx-mail-row')].filter(x=>!x.hidden).length};
   });
   assert.equal(focus.value,'Banco',name+': pesquisa não recebe as letras');
   assert.equal(focus.active,true,name+': teclado perde foco após digitar');
   assert.equal(focus.same,true,name+': campo foi recriado durante digitação');
   assert.equal(focus.visible,1,name+': filtro não funcionou');
   await input.fill('');
   assert.equal(await page.locator('.webx-mail-row:not([hidden])').count(),3);
   await page.locator('[data-webx="mail-compose"]').tap({timeout:8000});
   await page.locator('#webxMailForm [name="to"]').tap();
   await page.locator('#webxMailForm [name="to"]').fill('treino@exemplo.test');
   await page.locator('#webxMailForm [name="subject"]').fill('Assunto de treinamento');
   await page.locator('#webxMailForm [name="message"]').fill('Mensagem de teste.');
   await page.locator('[data-webx="mail-save-draft"]').tap({timeout:7000});
   assert.match(await page.locator('.webx-mail-label strong').innerText(),/Rascunhos/);
   const draft=page.locator('.webx-mail-row:not([hidden])');
   assert.equal(await draft.count(),1);
   await draft.locator('[data-webx="mail-open"]').tap({timeout:7000});
   assert.equal(await page.locator('#webxMailForm [name="subject"]').inputValue(),'Assunto de treinamento');
   await page.screenshot({path:'artifacts/web-gmail-v11217/'+name+'-escrever.png'});
   console.log('GMAIL_V11217_OK '+name+' '+JSON.stringify({colors,focus}));
  }finally{await context.close();}
 }
}finally{await browser.close();}
