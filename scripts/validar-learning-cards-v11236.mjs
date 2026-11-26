import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
await mkdir('artifacts/modo-livre-v11242',{recursive:true});
const cases=[['web',320,568],['web',390,844],['web',768,1024],['web',1024,600],['web',1366,650],['web',1920,1080],['web',2560,1440],['android',360,800],['ios',390,844],['ios',768,1024]];
for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--no-sandbox']}:{})});
 try{
 for(const [platform,width,height] of cases){
  const page=await browser.newPage({viewport:{width,height}});
  try{
   // Conta exclusivamente fictícia para testes locais de interface. Nenhum cadastro real.
    await page.addInitScript(() => localStorage.setItem('educaRememberedUser', JSON.stringify({name:'Participante',phone:'65900000001',levelToken:'a'.repeat(64)})));
    await page.goto('http://127.0.0.1:8789/html/?'+(platform==='web'?'platform=web':'app=1&platform='+platform+'&experience=web'),{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.EducaFreeView&&window.EducaFreeMode);
   await page.evaluate(()=>{document.body.classList.add('prototype-focus');window.EducaFreeView.setView('learning');});
   for(const size of ['normal','large','extra']){
    await page.evaluate(size=>{window.EducaAccessibility.update({text:size});},size);
    const layout=await page.evaluate(()=>{
     const surface=document.querySelector('#learningView .learning-surface'),hero=document.querySelector('#freeModeEntry');
     const r=x=>{const b=x.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,height:b.height,width:b.width}};
     const cards=[...surface.querySelectorAll('button:is(.learning-featured,.learning-card,.free-mode-entry)')];
     return {order:cards.map(e=>e.id==='freeModeEntry'?'free':e.dataset.learningTopic),hero:r(hero),copy:r(hero.querySelector('.free-entry-copy')),badge:r(hero.querySelector('.free-entry-badge')),title:r(hero.querySelector('strong')),desc:r(hero.querySelector('em')),art:r(hero.querySelector('.free-entry-art')),arrow:r(hero.querySelector('.free-entry-chevron')),surface:r(surface),scroll:surface.scrollWidth,client:surface.clientWidth,secondary:cards.slice(1).map(e=>({card:r(e),icon:r(e.querySelector('.learning-featured-icon,.learning-card-icon')),title:r(e.querySelector('strong')),desc:r(e.querySelector('.learning-featured-copy>span,.learning-card>small')),arrow:r(e.querySelector('.learning-arrow,.learning-card-arrow')),pix:e.querySelector('img')?.getAttribute('src')}))};
    });
    const b=layout;const inside=(a,c)=>a.left>=c.left-1&&a.right<=c.right+1&&a.top>=c.top-1&&a.bottom<=c.bottom+1;
    assert.deepEqual(b.order,['free','pix','security','whatsapp','settings','govbr']);
    assert.ok(b.hero.height>b.secondary[0].card.height,'destaque menor que card secundário');
    assert.ok(inside(b.copy,b.hero)&&inside(b.arrow,b.hero)&&inside(b.badge,b.hero),'conteúdo do destaque cortado '+JSON.stringify(b));
    assert.ok(b.copy.right<=b.arrow.left+1&&b.title.bottom<=b.desc.top+1,'destaque sobreposto '+JSON.stringify(b));
    assert.ok(b.hero.bottom<=b.secondary[0].card.top+1,'ordem visual incorreta '+JSON.stringify({engine:engine.name(),platform,width,height,size,hero:b.hero,pix:b.secondary[0].card}));
    assert.ok(b.scroll<=b.client+2,'overflow horizontal '+JSON.stringify({engine:engine.name(),platform,width,height,size,scroll:b.scroll,client:b.client,hero:b.hero,surface:b.surface}));
    assert.ok(b.hero.left>=b.surface.left-1&&b.hero.right<=b.surface.right+1&&b.secondary.every(c=>c.card.left>=b.surface.left-1&&c.card.right<=b.surface.right+1),'card fora da área útil');
    if(size==='normal')assert.ok(b.art.width>0&&inside(b.art,b.hero)&&b.art.bottom<=b.arrow.top+1,'ilustração invade seta '+JSON.stringify(b));
    else assert.equal(b.art.width,0,'arte decorativa deve liberar espaço para fonte ampliada');
    for(const c of b.secondary){
     assert.ok(inside(c.icon,c.card)&&inside(c.title,c.card)&&inside(c.desc,c.card)&&inside(c.arrow,c.card),'card cortado '+JSON.stringify(c));
     assert.ok(c.title.bottom<=c.desc.top+1&&c.desc.right<=c.arrow.left+1&&c.icon.right<=c.title.left+1,'texto ou ícone sobreposto '+JSON.stringify(c));
     assert.ok(Math.abs((c.card.top+c.card.bottom-c.arrow.top-c.arrow.bottom)/2)<=2,'seta desalinhada');
    }
    assert.equal(b.secondary[0].pix,'/static/icons/pix.svg');
    const last=page.locator('[data-learning-topic=govbr]');await last.scrollIntoViewIfNeeded();
    assert.ok(await last.isVisible(),'GOV.BR inacessível');
    await page.locator('#freeModeEntry').scrollIntoViewIfNeeded();
    if(size==='normal')await page.screenshot({path:`artifacts/modo-livre-v11242/${engine.name()}-${platform}-${width}x${height}.png`,animations:'disabled'});
    console.log('LEARNING_CARDS_V11242_OK',JSON.stringify({engine:engine.name(),platform,width,height,size,hero:b.hero,order:b.order}));
   }
   await page.evaluate(()=>{window.EducaAccessibility.update({text:'normal'});window.EducaFreeView.isTraining=()=>true;});
   await page.locator('#freeModeEntry').click();
   await page.waitForFunction(()=>document.querySelector('#homeView')?.classList.contains('is-active'));
  }finally{await page.close();}
 }
 }finally{await browser.close();}
}
