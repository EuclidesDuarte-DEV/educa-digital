/* V111.50 — reproduz o bug do Safari: a acessibilidade ficava sobre
 * os ícones de bateria quando a pessoa ampliava o celular simulado. */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
const targets = [
  {width:320,height:760,fallback:true},
  {width:360,height:780,fallback:true},
  {width:375,height:812,fallback:true},
  {width:390,height:844,fallback:true},
  {width:414,height:896,fallback:true},
  {width:430,height:932,fallback:true},
  {width:768,height:1024,fallback:false},
  {width:1024,height:768,fallback:false},
  {width:1440,height:900,fallback:false}
];
await mkdir('artifacts/fullscreen-v11150',{recursive:true});
const intersects=(a,b)=>Boolean(a&&b&&a.left<b.right-2&&a.right>b.left+2&&a.top<b.bottom-2&&a.bottom>b.top+2);
try {
  for(const cfg of targets){
    const page=await browser.newPage({viewport:{width:cfg.width,height:cfg.height},deviceScaleFactor:1});
    try {
      await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForFunction(()=>Boolean(window.EducaFreeView && window.EducaAccessibility),{timeout:15000});
      // iPhone Safari sem Fullscreen API: forçar caminho visual alternativo.
      if(cfg.fallback)await page.evaluate(()=>{ document.documentElement.requestFullscreen=undefined; });
      await page.locator('#fullscreenBtn').click({timeout:12000});
      await page.waitForFunction(()=>document.documentElement.classList.contains('educa-fullscreen-active')
        && document.querySelector('.educa-external-access')?.classList.contains('a11y-below-exit'),
      {timeout:12000});
      const layout=await page.evaluate(()=>{
        const rect=(node)=>{if(!node)return null;const a=node.getBoundingClientRect();
          return {left:a.left,right:a.right,top:a.top,bottom:a.bottom,width:a.width,height:a.height};};
        const a11y=document.querySelector('.educa-external-access');
        return {
          a11y:rect(document.querySelector('#openAccessibilitySettings')),
          wrapper:rect(a11y), exit:rect(document.querySelector('#exitFullscreen')),
          phone:rect(document.querySelector('#phoneScreen')),
          wrapperParent:a11y.parentElement?.tagName,
          exitHidden:document.querySelector('#exitFullscreen').hidden,
          fullscreen:document.documentElement.classList.contains('educa-fullscreen-active')
        };
      });
      const id=cfg.width+'px';
      assert.ok(layout.fullscreen&&!layout.exitHidden,id+': nao entrou no modo ampliado');
      assert.equal(layout.wrapperParent,'BODY',id+': acessibilidade precisa sair do header oculto');
      assert.ok(layout.a11y && layout.exit,id+': faltam botoes');
      assert.ok(Math.abs((layout.a11y.top+layout.a11y.bottom)/2-(layout.exit.top+layout.exit.bottom)/2)<=4,
        id+': acessibilidade deve estar NA MESMA LINHA do Sair: '+JSON.stringify(layout));
      assert.ok(layout.a11y.right<=layout.exit.left-6,
        id+': acessibilidade nao ficou a esquerda do Sair: '+JSON.stringify(layout));
      assert.ok(layout.a11y.left>=0 && layout.a11y.right<=cfg.width+1,
        id+': acessibilidade fora da tela');
      assert.ok(!intersects(layout.a11y,layout.exit),id+': botoes se sobrepoem');
      if(cfg.width<=430)assert.ok(!intersects(layout.a11y,layout.phone),
        id+': botao ainda cobre o celular simulado ou bateria: '+JSON.stringify(layout));
      await page.locator('#openAccessibilitySettings').click();
      assert.equal(await page.locator('#accessibilityDialog').evaluate(el=>el.open),true,id+': acessibilidade nao abre');
      await page.locator('#a11yFinish').click();
      if([320,390,414,430,768,1440].includes(cfg.width))
        await page.screenshot({path:'artifacts/fullscreen-v11150/'+cfg.width+'.png'});
      await page.locator('#exitFullscreen').click();
      await page.waitForFunction(()=>!document.documentElement.classList.contains('educa-fullscreen-active'),{timeout:12000});
      await page.waitForFunction(()=>document.querySelector('.educa-external-access')?.parentElement?.classList.contains('header-actions'),{timeout:8000});
      console.log('V111.50 fullscreen '+id+' OK; botao na faixa superior, sem sobreposicao; Safari fallback='+cfg.fallback);
    } finally {await page.close();}
  }
} finally {await browser.close();}
