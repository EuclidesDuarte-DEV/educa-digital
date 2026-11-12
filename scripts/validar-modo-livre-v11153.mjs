/* V111.53: e2e sem telefonia, SMS ou banco reais. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const viewports=[{width:320,height:700},{width:390,height:844},{width:768,height:1000}];
await mkdir('artifacts/modo-livre-v11153',{recursive:true});
try{
 for(const viewport of viewports){
  const page=await browser.newPage({viewport});
  const requests=[];
  await page.route('**/api/modo-livre/conversar',async route=>{
   const data=route.request().postDataJSON();
   requests.push(data);
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,mode:'ia',reply:'É apenas uma mensagem de treinamento. Verifique sempre pelo aplicativo oficial.'})});
  });
  try{
   await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>window.EducaFreeMode&&window.EducaVideoCall&&window.EducaFreeView,{timeout:20000});
   await page.evaluate(()=>{
     const previous=window.EducaFreeView;
     // Entrar em Modo Livre como quem já concluiu a abertura inicial.
     // Não deixar o holofote do pré-teste interceptar cliques da notificação.
     document.body.classList.remove('landing-pretest-active','guide-focus-active');
     const guide=document.querySelector('#guideOverlay');if(guide)guide.hidden=true;
     // Isolar o treino dos dados da conta: simular apenas a navegação existente.
     window.EducaFreeView={...previous,isTraining:()=>true,setView(name){
       document.querySelectorAll('.android-view').forEach(view=>view.classList.toggle('is-active',view.dataset.view===name));
       document.querySelector('#phoneScreen')?.setAttribute('data-current-view',name);
     }};
     window.EducaFreeMode.start();
     window.EducaFreeMode.triggerEvent();
   });
   const initial=await page.evaluate(()=>({active:window.EducaFreeMode?.isActive?.(),view:document.querySelector('#phoneScreen')?.dataset.currentView,
     noticeHidden:document.querySelector('#freeEventNotice')?.hidden,notification:document.querySelector('#freeEventTitle')?.textContent}));
   assert.equal(initial.active,true,'Modo Livre deve estar ativo: '+JSON.stringify(initial));
   assert.equal(initial.noticeHidden,false,'WhatsApp inicial deve aparecer: '+JSON.stringify(initial));
   await page.locator('#freeEventOpen').click();
   const after=await page.evaluate(()=>({active:window.EducaFreeMode?.isActive?.(),view:document.querySelector('#phoneScreen')?.dataset.currentView,
     noticeHidden:document.querySelector('#freeEventNotice')?.hidden,notification:document.querySelector('#freeEventTitle')?.textContent}));
   assert.equal(after.view,'chat','WhatsApp inicial: '+JSON.stringify({initial,after}));
   await page.locator('#freeFamilyBlock').click();
   await page.locator('#freeSummaryNext').click();
   assert.equal(await page.locator('#phoneScreen').getAttribute('data-current-view'),'free-video');
   await page.evaluate(()=>window.EducaFreeMode.hangupVideo());
   await page.locator('#freeSummaryNext').click();
   assert.equal(await page.locator('#phoneScreen').getAttribute('data-current-view'),'free-call');
   await page.locator('#freeCallHangup').click();
   await page.locator('#freeSummaryNext').click();
   // SMS surge sem um novo botão de atividade.
   await page.locator('#freeEventNotice').waitFor({state:'visible',timeout:5000});
   assert.match(await page.locator('#freeEventTitle').innerText(),/SMS/);
   await page.locator('#freeEventOpen').click();
   assert.equal(await page.locator('#phoneScreen').getAttribute('data-current-view'),'free-sms');
   assert.match(await page.locator('#freeSmsSender').innerText(),/Entrega pendente/);
   assert.match(await page.locator('#freeSmsMessages').innerText(),/SMS SIMULADO/);
   const dims=await page.evaluate(()=>{
     const phone=document.querySelector('#phoneScreen').getBoundingClientRect();
     const main=document.querySelector('#freeSmsView').getBoundingClientRect();
     const form=document.querySelector('#freeSmsForm').getBoundingClientRect();
     const verify=document.querySelector('#freeSmsVerify').getBoundingClientRect();
     return {phone:{left:phone.left,right:phone.right,top:phone.top,bottom:phone.bottom},main:{left:main.left,right:main.right,top:main.top,bottom:main.bottom},form:{left:form.left,right:form.right,top:form.top,bottom:form.bottom},verify:{top:verify.top,bottom:verify.bottom,height:verify.height}};
   });
   assert.ok(dims.main.left>=dims.phone.left-2&&dims.main.right<=dims.phone.right+2,viewport.width+': SMS extrapolou celular');
   assert.ok(dims.form.bottom<=dims.main.bottom+2&&dims.form.top>=dims.main.top,viewport.width+': resposta fora da tela');
   assert.ok(dims.verify.height>=44,viewport.width+': área de toque pequena');
   await page.locator('#freeSmsInput').fill('Como eu verifico?');
   await page.locator('#freeSmsSend').click();
   await page.waitForFunction(()=>document.querySelectorAll('#freeSmsMessages .v11153-sms-bubble').length===3,{timeout:7000});
   assert.equal(requests.length,1);
   assert.equal(requests[0].scenario,'sms-delivery');
   await page.screenshot({path:'artifacts/modo-livre-v11153/sms-'+viewport.width+'.png'});
   await page.locator('#freeSmsBlock').click();
   assert.equal(await page.locator('#phoneScreen').getAttribute('data-current-view'),'free-summary');
   await page.locator('#freeSummaryNext').click();
   await page.locator('#freeEventNotice').waitFor({state:'visible',timeout:5000});
   await page.locator('#freeEventOpen').click();
   assert.equal(await page.locator('#phoneScreen').getAttribute('data-current-view'),'chat');
   assert.match(await page.locator('#scenarioTitle').innerText(),/Prima/);
   console.log('V111.53 OK '+viewport.width+'px: WhatsApp -> vídeo -> voz -> SMS com IA -> novo WhatsApp');
  }finally{await page.close();}
 }
}finally{await browser.close();}
