import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ headless:true,args:['--no-sandbox'] });
const widths=[320,360,375,390,412,430,600,768,1024,1280,1920];
const overlaps=(a,b)=>a&&b&&Math.min(a.right,b.right)>Math.max(a.left,b.left)+2
  && Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top)+2;
await mkdir('artifacts/layout-v11149',{recursive:true});
try {
  for(const width of widths) {
    const height=width<500?844:width<=1024?900:860;
    const guest=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
    try {
      await guest.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
      await guest.waitForFunction(()=>Boolean(window.EducaFreeView&&window.EducaAccessibility),{timeout:20000});
      await guest.waitForTimeout(750);
      const state=await guest.evaluate(()=>{
        const rect=el=>{const r=el.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
        const header=document.querySelector('.home-simple-header');
        const elements=[document.querySelector('.home-simple-header .brand'),document.querySelector('#openAccessibilitySettings'),document.querySelector('#openGuidedTour')].filter(el=>el&&getComputedStyle(el).display!=='none');
        return {
          header:rect(header),
          elements:elements.map(rect),
          tourHidden:document.querySelector('#educaTour').hidden,
          spotlightHidden:document.querySelector('#guideOverlay').hidden,
          accessibilityCount:document.querySelectorAll('#openAccessibilitySettings').length,
          inlineAudio:Boolean(document.querySelector('#a11yReadNow')?.closest('#accessibilityDialog')),
          duplicate:Boolean(document.querySelector('#learningAccessibilityQuickBtn,#learningAccessibilityBtn,#learningHelpActions')),
          phone:rect(document.querySelector('#phoneHardware'))
        };
      });
      assert.equal(state.accessibilityCount,1,width+': duplicata do controle');
      assert.ok(state.inlineAudio&&!state.duplicate,width+': atalhos repetidos');
      assert.ok(state.tourHidden&&state.spotlightHidden,width+': tour abre sozinho');
      assert.ok(state.phone.left>=-1&&state.phone.right<=width+1,width+': telefone fora da tela');
      for(const e of state.elements) {
        assert.ok(e.left>=-1&&e.right<=width+1,width+': controle fora da tela');
        assert.ok(e.top>=state.header.top-1&&e.bottom<=state.header.bottom+1,width+': cabecalho quebra linhas');
      }
      for(let i=0;i<state.elements.length;i++)for(let j=i+1;j<state.elements.length;j++)
        assert.ok(!overlaps(state.elements[i],state.elements[j]),width+': elementos do cabecalho sobrepostos');
      if([320,390,430,768,1280,1920].includes(width))
        await guest.screenshot({path:'artifacts/layout-v11149/guest-'+width+'.png'});
    } finally {await guest.close();}
    const logged=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
    await logged.addInitScript(()=>localStorage.setItem('educaRememberedUser',JSON.stringify({name:'Participante',phone:'65999990000'})));
    try {
      await logged.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
      await logged.waitForFunction(()=>Boolean(window.EducaFreeView&&window.EducaAccessibility),{timeout:20000});
      await logged.evaluate(()=>document.querySelector('#startNowBtn').click());
      await logged.waitForFunction(()=>document.body.classList.contains('prototype-focus')&&document.querySelector('#learningView')?.classList.contains('is-active'),{timeout:12000});
      await logged.waitForFunction(()=>document.querySelector('.educa-external-access')?.classList.contains('a11y-focus-toolbar'),{timeout:6000});
      const state=await logged.evaluate(()=>{
        const rect=el=>{if(!el||el.hidden||getComputedStyle(el).display==='none')return null;const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};};
        return {
          greeting:document.querySelector('#headerTrust')?.textContent,
          tourHidden:document.querySelector('#educaTour')?.hidden,
          wrapperParent:document.querySelector('.educa-external-access')?.parentElement?.tagName,
          a11y:rect(document.querySelector('#openAccessibilitySettings')),
          logout:rect(document.querySelector('#focusLogoutBtn')),
          expand:rect(document.querySelector('#focusExpandBtn')),
          duplicates:document.querySelectorAll('#learningView [id*="Accessibility"]').length
        };
      });
      assert.ok(state.tourHidden&&state.greeting==='Meu treino',width+': tour ou saudacao');
      assert.equal(state.wrapperParent,'BODY',width+': a11y em header invisivel');
      assert.equal(state.duplicates,0,width+': a11y no telefone duplicada');
      for(const key of ['a11y','logout','expand']) {
        const x=state[key];assert.ok(x,width+': controle '+key+' ausente');
        assert.ok(x.left>=-1&&x.right<=width+1&&x.top>=-1,width+': controle '+key+' fora da tela');
      }
      assert.ok(!overlaps(state.a11y,state.logout)&&!overlaps(state.a11y,state.expand)&&!overlaps(state.logout,state.expand),width+': botoes da toolbar sobrepostos');
      await logged.evaluate(()=>document.querySelector('#openAccessibilitySettings').click());
      assert.equal(await logged.locator('#accessibilityDialog').evaluate(el=>el.open),true,width+': painel nao abriu');
      await logged.evaluate(()=>window.EducaAccessibility.update({text:'extra',colors:true}));
      assert.ok(await logged.locator('html').evaluate(el=>el.classList.contains('a11y-text-extra')),width+': texto nao ampliou');
      await logged.evaluate(()=>document.querySelector('#a11yFinish').click());
      if([320,390,430,768,1280,1920].includes(width))
        await logged.screenshot({path:'artifacts/layout-v11149/logged-'+width+'.png'});
      console.log('V111.49 OK: '+width+'px, header, a11y, ajuda opcional, conta e botoes sem colisao');
    } finally {await logged.close();}
  }
} finally {await browser.close();}
