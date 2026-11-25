/* V112.11 — Badge Nível compacto no celular simulado Web.
 * Chromium real, sem endpoints de IA ou produção. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const cases=[
 {width:320,height:640,font:'normal'},
 {width:390,height:844,font:'normal'},
 {width:390,height:844,font:'extra'},
 {width:1366,height:768,font:'normal'}
];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('artifacts/level-badge-v11211',{recursive:true});
try{
 for(const c of cases){
  const name=c.width+'x'+c.height+'-'+c.font;
  const page=await browser.newPage({viewport:{width:c.width,height:c.height}});
  try{
   await page.addInitScript(()=>{
    // Conta fictícia, sem chamada ao servidor. O XP legado deve ser ignorado.
    localStorage.setItem('educaRememberedUser',JSON.stringify({name:'Participante',phone:'6500000000'}));
    localStorage.setItem('educaWebModoLivreNivelV11182',JSON.stringify({xp:0}));
    localStorage.setItem('educaWebModoLivreNivelV11182:account:6500000000',JSON.stringify({xp:220,confirmed:220,pending:[]}));
   });
   await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForSelector('#edModoLevelBadge',{state:'attached',timeout:12000});
   await page.waitForFunction(()=>Boolean(window.EducaFreeView),{timeout:12000});
   await page.evaluate(font=>{
    window.EducaFreeView.setView('learning');
    if(font!=='normal')window.EducaAccessibility?.update?.({text:font});
   },c.font);
   const badge=page.locator('#edModoLevelBadge');
   await badge.scrollIntoViewIfNeeded();
   const m=await badge.evaluate(el=>{
    const br=el.getBoundingClientRect();
    const icon=el.querySelector('svg')?.getBoundingClientRect();
    const h=document.querySelector('#learningView .learning-header').getBoundingClientRect();
    return {width:br.width,height:br.height,iconWidth:icon?.width,iconHeight:icon?.height,
      label:el.textContent.trim(),accessible:el.getAttribute('aria-label'),
      platform:document.documentElement.dataset.educaPlatform,
      headerRight:h.right,badgeRight:br.right};
   });
   assert.equal(m.platform,'web',name+': plataforma errada');
   assert.equal(m.label,'Nível 3',name+': o nível mudou incorretamente');
   assert.ok(m.width>60&&m.width<105,name+': badge não compactou '+JSON.stringify(m));
   assert.ok(m.height>=28&&m.height<=34,name+': altura fora da medida '+JSON.stringify(m));
   assert.ok(m.iconWidth<=16&&m.iconHeight<=16,name+': escudo continua grande');
   assert.ok(m.badgeRight<=m.headerRight+2,name+': badge saiu do cabeçalho');
   assert.match(m.accessible,/Abrir progresso/);
   await page.screenshot({path:'artifacts/level-badge-v11211/'+name+'.png'});
   await badge.click();
   await page.waitForSelector('.ed-modo-dialog[role="dialog"]',{timeout:3500});
   const dialogText=await page.locator('.ed-modo-dialog').innerText();
   assert.match(dialogText,/Nível 3/);
   await page.locator('.ed-modo-close').click();
   assert.equal(await page.locator('.ed-modo-dialog').count(),0,name+': não fechou o painel');
   await page.evaluate(()=>{
    localStorage.setItem('educaRememberedUser',JSON.stringify({name:'Participante',phone:'6500000001'}));
    window.dispatchEvent(new CustomEvent('educa:account-change'));
   });
   assert.equal(await badge.innerText(),'Nível 1',name+': XP de outra conta vazou');
   await page.evaluate(()=>{
    localStorage.setItem('educaRememberedUser',JSON.stringify({name:'Participante',phone:'6500000000'}));
    window.dispatchEvent(new CustomEvent('educa:account-change'));
   });
   assert.equal(await badge.innerText(),'Nível 3',name+': não recuperou nível da conta original');
   console.log('OK '+name+' '+JSON.stringify(m));
  }finally{await page.close();}
 }
}finally{await browser.close();}
