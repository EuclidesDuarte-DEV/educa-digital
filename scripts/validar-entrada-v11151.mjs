/* V111.51 — cadastro e login com telefone único no modal; teste visual sem acessar D1 real. */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const cases=[
  {width:320,height:700},
  {width:360,height:780},
  {width:390,height:844},
  {width:430,height:932},
  {width:768,height:1024},
  {width:1280,height:850}
];
await mkdir('artifacts/entrada-v11151',{recursive:true});
try {
  for (const cfg of cases) {
    const page=await browser.newPage({viewport:cfg,deviceScaleFactor:1});
    const phone='65999990000';
    let mode='existing';
    const calls=[];
    await page.route('**/api/conta',async route=>{
      const data=route.request().postDataJSON();
      calls.push({endpoint:'conta', phone:data.phone});
      if (mode==='existing') return route.fulfill({status:409,contentType:'application/json',body:JSON.stringify({ok:false,existing:true,needs_login:true})});
      return route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({ok:true,name:'Participante',phone:phone,existing:false})});
    });
    await page.route('**/api/login/codigo',async route=>{
      const data=route.request().postDataJSON();
      calls.push({endpoint:'codigo',phone:data.phone});
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,demo_code:'654321'})});
    });
    await page.route('**/api/login/confirmar',async route=>{
      const data=route.request().postDataJSON();
      calls.push({endpoint:'confirmar',phone:data.phone,code:data.code});
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,name:'Participante',phone})});
    });
    await page.route('**/api/progresso*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,atividades:[]})}));
    try {
      await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForFunction(()=>Boolean(window.EducaFreeView),{timeout:20000});
      await page.locator('#startNowBtn').click();
      const modal=page.locator('#startModal');
      await modal.waitFor({state:'visible'});
      const dims=await page.evaluate(()=>{
        const dialog=document.querySelector('.start-dialog-simple');
        const r=dialog.getBoundingClientRect();
        const visibleButtons=[...dialog.querySelectorAll('button')].filter(el=>!el.hidden && getComputedStyle(el).display!=='none');
        return {
          left:r.left,right:r.right,top:r.top,bottom:r.bottom,height:r.height,
          windowHeight:innerHeight,
          inputs:dialog.querySelectorAll('input').length,
          submit:dialog.querySelectorAll('button[type="submit"]').length,
          buttons:visibleButtons.map(el=>el.id),
          heading:document.querySelector('#startModalTitle').textContent,
          alt:dialog.textContent.includes('Aprender sem cadastro')||dialog.textContent.includes('Já tenho conta')
        };
      });
      assert.equal(dims.inputs,1,cfg.width+': número de campos');
      assert.equal(dims.submit,1,cfg.width+': número de botões principais');
      assert.deepEqual(dims.buttons.sort(),['closeStartModal','quickSaveBtn'],cfg.width+': botões extras');
      assert.equal(dims.heading,'Digite seu celular',cfg.width+': texto do título');
      assert.equal(dims.alt,false,cfg.width+': escolhas antigas no modal');
      assert.ok(dims.left>=0 && dims.right<=cfg.width+1,cfg.width+': modal fora da viewport');
      assert.ok(dims.top>=-1 && dims.bottom<=cfg.height+1,cfg.width+': modal excede altura visível');
      if ([320,390,430,768].includes(cfg.width)){
        await page.screenshot({path:'artifacts/entrada-v11151/modal-'+cfg.width+'.png'});
      }

      // CPF, nome e senha não são necessários; número inválido não envia a API.
      await page.locator('#quickPhone').fill('65123');
      await page.locator('#quickSaveBtn').click();
      assert.equal(calls.length,0,cfg.width+': telefone inválido não deveria enviar API');
      await page.locator('#quickPhone').fill(phone);
      await page.locator('#quickSaveBtn').click();
      await page.locator('#returnCodeStep').waitFor({state:'visible',timeout:15000});
      assert.equal(await page.locator('#returnPhoneStep').isVisible(),false,cfg.width+': pediu telefone de novo');
      assert.equal(await page.locator('#demoCodeValue').innerText(),'654321',cfg.width+': código demo não apareceu');
      assert.equal(calls.filter(c=>c.endpoint==='conta').length,1,cfg.width+': deve verificar telefone uma vez');
      assert.equal(calls.filter(c=>c.endpoint==='codigo').length,1,cfg.width+': deve solicitar código automaticamente');
      assert.equal(calls.find(c=>c.endpoint==='codigo')?.phone,phone,cfg.width+': código enviado para número diferente');

      // Corrigir número retorna à entrada enxuta, sem segunda tela de telefone.
      await page.locator('#changePhoneBtn').click();
      await modal.waitFor({state:'visible'});
      assert.equal((await page.locator('#quickPhone').inputValue()).replace(/\D/g,''),phone);

      // Novo número: entra diretamente na central após criar o treino.
      mode='new';
      await page.locator('#quickSaveBtn').click();
      await modal.waitFor({state:'hidden',timeout:15000});
      assert.ok(calls.some(c=>c.endpoint==='conta'),cfg.width+': cadastro não foi enviado');
      console.log('V111.51 OK '+cfg.width+'px: um número, entrada simples, conta antiga sem telefone repetido, conta nova');
    } finally {
      await page.close();
    }
  }
} finally { await browser.close(); }
