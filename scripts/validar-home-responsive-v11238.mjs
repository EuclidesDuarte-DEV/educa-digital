import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
await mkdir('artifacts/home-v11241',{recursive:true});
const cases=[['web',375,667],['web',393,680],['web',430,740],['web',390,600],['web',901,600],['web',1096,570],['web',1366,768],['web',1440,900],['web',2560,1440],['web',896,414],['web',390,844],['web',360,640],['android',320,640],['ios',430,932],['web',1264,475],['web',1643,712],['web',1280,550],['web',1321,550],['web',1366,610],['web',1280,600],['web',1600,760],['web',1920,1080],['web',1024,600],['web',768,1024],['web',320,568],['android',360,800],['ios',390,844]];
for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--no-sandbox']}:{})});
 try{
 for(const [platform,width,height] of cases){
  const mobile=platform==='web'&&width<=600;
  const page=await browser.newPage({viewport:{width,height},...(mobile?{isMobile:true,hasTouch:true,deviceScaleFactor:2}:{})});
  try{
   await page.goto('http://127.0.0.1:8789/html/?'+(platform==='web'?'platform=web':'app=1&platform='+platform+'&experience=web'),{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.EducaFreeView&&document.querySelector('#startNowBtn'));
   await page.evaluate(()=>{document.body.classList.remove('prototype-focus');document.documentElement.classList.remove('educa-fullscreen-active');});
   let previous;
   for(const size of ['normal','large','extra','normal']){
    await page.evaluate(size=>{const e=document.querySelector('#a11yFontSize');e.value=size;e.dispatchEvent(new Event('change',{bubbles:true}));},size);
    await page.waitForFunction(()=> {
     const spot=document.querySelector('#guideSpotlight'), pointer=document.querySelector('#guidePointer');
     return document.body.classList.contains('landing-pretest-active') && !document.querySelector('#guideOverlay').hidden &&
       parseFloat(spot.style.width)>20 && parseFloat(spot.style.height)>20 && pointer.style.top!=='' &&
       pointer.textContent.includes('Faça o pré-teste');
    },{},{timeout:10000});
    await page.waitForTimeout(350);
    const b=await page.evaluate(()=>{
     const r=s=>{const e=document.querySelector(s),b=e.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height,font:parseFloat(getComputedStyle(e).fontSize)}};
     return {title:r('.hero-copy h1'),subtitle:r('.hero-subtitle'),cta:r('#startNowBtn'),label:r('#startNowLabel'),phone:r('#phoneHardware'),screen:r('#phoneScreen'),wrap:r('#inicio .phone-preview-wrap'),header:r('.home-simple-header'),viewport:innerWidth,scroll:document.documentElement.scrollWidth,extra:document.documentElement.classList.contains('a11y-text-extra'),large:document.documentElement.classList.contains('a11y-text-large')};
    });
    const expand=await page.evaluate(()=>{
     const button=document.querySelector('#fullscreenBtn'),label=button.querySelector('span'),tools=button.closest('.phone-tools');
     const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
     if(!button.getClientRects().length||!rect(button).width||getComputedStyle(button).visibility==='hidden')return null;
     const range=document.createRange();range.selectNodeContents(label);
     return {text:label.textContent.trim(),font:parseFloat(getComputedStyle(label).fontSize),button:rect(button),tools:rect(tools),ink:[...range.getClientRects()].map(rect=>({left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom}))};
    });
    if(platform==='web'&&width>=901)assert.ok(expand,'botão Tela cheia sumiu no desktop');
    if(expand){
     assert.equal(expand.text,'Tela cheia');
     assert.ok(expand.button.height>=43,'alvo de toque pequeno '+JSON.stringify(expand));
     assert.ok(expand.ink.length>0&&expand.ink.every(r=>r.left>=expand.button.left-1&&r.right<=expand.button.right+1&&r.top>=expand.button.top-1&&r.bottom<=expand.button.bottom+1),'texto Tela cheia cortado '+JSON.stringify(expand));
     assert.ok(expand.button.left>=expand.tools.left-1&&expand.button.right<=expand.tools.right+1&&expand.button.bottom<=expand.tools.bottom+1,'botão fora de sua faixa '+JSON.stringify(expand));
     if(platform==='web')assert.ok(expand.font>=13,'texto Tela cheia reduzido');
    }
    const launcher=await page.evaluate(()=>{
      const r=e=>{const b=e.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height};};
      const home=document.querySelector('#homeView');
      if(!home.classList.contains('is-active'))return null;
      const grid=home.querySelector('.launcher-grid'),dock=home.querySelector('.launcher-bottom');
      const pointer=document.querySelector('#guidePointer'),spot=document.querySelector('#guideSpotlight');
      return {pointer:r(pointer),spot:r(spot),guideVisible:!document.querySelector('#guideOverlay').hidden&&getComputedStyle(pointer).visibility!=='hidden',below:pointer.classList.contains('below-target'),home:r(home),grid:r(grid),dock:r(dock),date:r(home.querySelector('.at-a-glance')),search:r(home.querySelector('.google-search')),scroll:grid.scrollHeight,client:grid.clientHeight,tiles:[...grid.querySelectorAll('.app-tile')].map(e=>({tile:r(e),icon:r(e.querySelector('.adaptive-icon')),label:r(e.lastElementChild)})),favorites:[...dock.querySelectorAll('.favorite-row button')].map(r)};
    });
    assert.ok(launcher,'tela de aplicativos não está ativa');
    if(mobile){
     assert.ok(b.screen.top>=b.phone.top+4&&b.screen.bottom<=b.phone.bottom-4&&b.screen.left>=b.phone.left+4&&b.screen.right<=b.phone.right-4,'vidro ultrapassa moldura '+JSON.stringify(b));
     assert.ok(b.phone.height<=Math.max(505,height-20)+2,'moldura maior que altura útil '+JSON.stringify(b));
     assert.ok(launcher.home.bottom<=b.screen.bottom+1&&launcher.dock.bottom<=b.screen.bottom-5,'conteúdo escapa do vidro');
    }
    assert.ok(launcher.grid.top>=launcher.date.bottom-1&&launcher.grid.bottom<=launcher.dock.top+1,'grade sobreposta ao dock ou data '+JSON.stringify(launcher));
    assert.ok(launcher.grid.height>=40&&launcher.dock.bottom<=launcher.home.bottom-6,'grade/dock fora da moldura '+JSON.stringify(launcher));
    assert.equal(launcher.tiles.length,12);
    for(const {tile,icon,label} of launcher.tiles){
     assert.ok(icon.width>0&&icon.width<=tile.width+1&&icon.left>=tile.left-1&&icon.right<=tile.right+1,'ícone invade vizinho '+JSON.stringify({tile,icon}));
     assert.ok(label.left>=tile.left-1&&label.right<=tile.right+1&&label.top>=icon.bottom-1,'rótulo sobreposto '+JSON.stringify({tile,icon,label}));
    }
    for(let i=0;i<launcher.tiles.length;i++)for(let j=i+1;j<launcher.tiles.length;j++){
     const a=launcher.tiles[i].tile,c=launcher.tiles[j].tile;
     assert.ok(a.right<=c.left+1||c.right<=a.left+1||a.bottom<=c.top+1||c.bottom<=a.top+1,'aplicativos sobrepostos '+JSON.stringify({a,c}));
    }
    for(let i=1;i<launcher.favorites.length;i++)assert.ok(launcher.favorites[i-1].right<=launcher.favorites[i].left+1,'favoritos sobrepostos');
    if(size==='normal'){
     if(width>=1100)assert.ok(b.phone.width>=389,'moldura estreita');
     if(width>=901&&width<1100)assert.ok(b.phone.width>=300,'moldura estreita');
     assert.ok(Math.abs(b.phone.height/b.phone.width-19.7/9)<.04,'proporção original da moldura perdida '+JSON.stringify(b.phone));
     assert.ok(launcher.tiles.slice(0,4).every(t=>Math.abs(t.tile.top-launcher.tiles[0].tile.top)<2),'quatro aplicativos na primeira linha');
     assert.ok(launcher.tiles.slice(4,8).every(t=>Math.abs(t.tile.top-launcher.tiles[4].tile.top)<2),'quatro aplicativos na segunda linha');
     assert.ok(launcher.tiles.slice(8,12).every(t=>Math.abs(t.tile.top-launcher.tiles[8].tile.top)<2),'quatro aplicativos na terceira linha');
     assert.ok(launcher.scroll<=launcher.client+2,'grade normal cortada ou rolando internamente '+JSON.stringify(launcher));
     assert.ok(launcher.guideVisible&&!launcher.below,'guia deve ficar acima do Banco '+JSON.stringify(launcher));
     assert.ok(launcher.pointer.bottom<=launcher.spot.top-8,'balão cobre holofote '+JSON.stringify({engine:engine.name(),platform,width,height,size,pointer:launcher.pointer,spot:launcher.spot,date:launcher.date}));
     assert.ok(launcher.pointer.top>=launcher.date.bottom-2,'balão cobre data '+JSON.stringify(launcher));
     assert.ok(launcher.spot.width<=launcher.tiles[0].icon.width+26,'holofote largo demais');
     assert.ok(launcher.spot.right<=launcher.tiles[1].icon.left-1,'holofote invade WhatsApp');
     assert.ok(launcher.tiles.every(t=>t.label.bottom<=launcher.grid.bottom+1),'rótulo cortado');
     if(width>=1100)assert.ok(launcher.tiles[0].icon.width>=49,'ícones menores que referência');
     if(!previous){
      if(mobile){
       await page.locator('#phoneHardware').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
       await page.waitForTimeout(250);
       const visible=await page.evaluate(()=>{const p=document.querySelector('#phoneHardware').getBoundingClientRect();return {top:p.top,bottom:p.bottom,height:visualViewport?.height||innerHeight};});
       assert.ok(visible.top>=-2&&visible.bottom<=visible.height+2,'moldura não cabe na janela após rolar '+JSON.stringify(visible));
       await page.screenshot({path:`artifacts/home-v11241/${engine.name()}-${platform}-${width}x${height}-viewport.png`,animations:'disabled'});
       await page.evaluate(()=>scrollTo(0,0));
      }
      await page.screenshot({path:`artifacts/home-v11241/${engine.name()}-${platform}-${width}x${height}.png`,fullPage:true,animations:'disabled'});
     }
    }
    console.log('HOME_LAUNCHER_V11241_OK',JSON.stringify({engine:engine.name(),platform,width,height,size,phone:b.phone,grid:launcher.grid,dock:launcher.dock,scroll:launcher.scroll,client:launcher.client}));
    assert.ok(b.cta.height>=65&&b.cta.width>0,'CTA pequeno '+JSON.stringify(b));
    assert.ok(b.label.right<=b.cta.right+1&&b.label.bottom<=b.cta.bottom+1,'CTA cortado '+JSON.stringify(b));
    assert.ok(b.scroll<=width+2,'overflow horizontal '+JSON.stringify(b));
    assert.ok(b.phone.left>=-1&&b.phone.right<=width+1,'moldura cortada '+JSON.stringify(b));
    assert.ok(Math.abs((b.phone.left+b.phone.right-b.wrap.left-b.wrap.right)/2)<=2,'moldura fora do centro '+JSON.stringify(b));
    if(platform==='web'&&width>=901&&size==='normal'){
     assert.ok(b.phone.top>=b.header.bottom-1,'moldura sobre o cabeçalho '+JSON.stringify(b));
     assert.ok(b.cta.bottom<=height+1,'CTA abaixo da dobra '+JSON.stringify(b));
     if(b.phone.bottom>height+1)assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight>=document.querySelector('#phoneHardware').getBoundingClientRect().bottom+scrollY-1),'moldura não acessível por rolagem');
    }
    if(previous&&size!=='normal')for(const k of ['title','subtitle','label'])assert.ok(b[k].font>previous[k].font*1.1,'fonte não aumentou '+k+' '+JSON.stringify({previous,b}));
    if(size==='large')assert.ok(b.large);
    if(size==='extra')assert.ok(b.extra);
    previous=b;
    console.log('HOME_RESPONSIVE_V11241_OK',JSON.stringify({engine:engine.name(),platform,width,height,size,font:b.title.font,phone:b.phone}));
   }
  }finally{await page.close();}
 }
 }finally{await browser.close();}
}
