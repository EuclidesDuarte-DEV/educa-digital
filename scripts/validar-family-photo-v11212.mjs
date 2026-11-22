/* V112.12 — foto de falso familiar em WhatsApp fictício, apenas Web. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('artifacts/family-photo-v11212',{recursive:true});
try{
 for(const viewport of [{width:390,height:844},{width:320,height:640},{width:1366,height:768}]){
  const id=viewport.width+'x'+viewport.height;
  const page=await browser.newPage({viewport});
  let networkCalls=0;
  try{
   await page.addInitScript(()=>localStorage.setItem('educaWebModoLivreNivelV11182',JSON.stringify({xp:220})));
   await page.route('**/api/modo-livre/conversar-web',route=>{networkCalls++;return route.abort();});
   await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>window.EducaFreeView&&window.EducaFreeMode&&document.documentElement.dataset.educaPlatform==='web',{timeout:15000});
   await page.evaluate(()=>{
     window.EducaFreeView.isTraining=()=>true;
     window.EducaFreeMode.start();
     window.EducaFreeView.setView('whatsapp');
   });
   const row=page.locator('#whatsappView [data-free-scenario="family-photo"]');
   await row.click({timeout:8000});
   await page.waitForFunction(()=>document.querySelector('#chatWallpaper .free-training-photo img')?.complete===true,{timeout:4000});
   const photo=await page.locator('#chatWallpaper .free-training-photo img').evaluate(img=>({
      width:img.naturalWidth,height:img.naturalHeight,alt:img.alt,src:img.getAttribute('src')
   }));
   assert.ok(photo.width>=500&&photo.height>=600,id+': foto sintética não carregou: '+JSON.stringify(photo));
   const bubbles=await page.locator('#chatWallpaper .message').allTextContents();
   assert.ok(bubbles.length>=3,id+': diálogo inicial sem foto e pedido: '+JSON.stringify(bubbles));
   assert.match(bubbles[0],/é o Rafa\. Troquei de número/);
   assert.match(bubbles.at(-1),/emprestar R\$ 650/);
   const mediaIndex=await page.locator('#chatWallpaper .message').evaluateAll(nodes=>nodes.findIndex(n=>n.classList.contains('free-training-photo')));
   assert.equal(mediaIndex,1,id+': foto deve ficar entre apresentação e pedido');
   await page.screenshot({path:'artifacts/family-photo-v11212/'+id+'-conversa.png'});
   await page.locator('#freeOriginalInput').fill('vou te mandar o pix');
   await page.locator('#freeOriginalSend').click();
   await page.waitForFunction(()=>document.querySelector('#freeSummaryTitle')?.textContent.includes('Você perdeu 15 pontos'),null,{timeout:2000});
   const remaining=await page.locator('#freeSummaryText').innerText();
   assert.match(remaining,/85 pontos/,id+': faltou desconto');
   await page.waitForFunction(()=>window.EducaWebGamification?.getSnapshot?.().xp===205,null,{timeout:2500});
   assert.equal(networkCalls,0,id+': concordar com Pix fictício deveria terminar sem esperar IA');
   await page.screenshot({path:'artifacts/family-photo-v11212/'+id+'-resultado.png'});
   console.log('OK '+id+': foto '+photo.width+'x'+photo.height+', Pix fictício, 85 pontos e sem espera de IA');
  }finally{await page.close();}
 }
}finally{await browser.close();}
