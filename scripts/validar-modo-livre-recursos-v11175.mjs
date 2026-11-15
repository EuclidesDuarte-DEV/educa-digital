/* Educa+ V111.75: auditoria visual do Modo Livre e recursos,
 * 9 larguras x 3 fontes + fullscreen selecionado. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const devices=[[320,640],[360,780],[390,844],[430,932],[768,1024],[1024,768],[1366,768],[1920,1080],[896,414]];
const modes=['normal','large','extra'];
const fullWidth=new Set([390,896,1366]);
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const issues=[];
let passed=0;
await mkdir('artifacts/free-resources-v11175',{recursive:true});
try{
for(const [w,h] of devices) for(const mode of modes) for(const full of [false,...(fullWidth.has(w)?[true]:[])]){
  const label=`${w}x${h} ${mode} ${full?'fullscreen':'mockup'}`;
  const page=await browser.newPage({viewport:{width:w,height:h}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try {
    await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>Boolean(window.EducaFreeView && window.EducaAccessibility),{timeout:15000});
    await page.addStyleTag({content:'*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important;}'});
    await page.evaluate(({mode,full})=>{
      if(mode!=='normal')window.EducaAccessibility.update({text:mode});
      if(full){
        document.body.classList.add('prototype-focus');
        document.documentElement.classList.add('educa-fullscreen-active');
      }
      document.querySelector('#phoneScreen').classList.add('free-active');
      window.EducaFreeView.setView('home');
    },{mode,full});
    const home=await page.evaluate(()=>{
      const phone=document.querySelector('#phoneScreen');
      const grid=document.querySelector('#homeView .launcher-grid');
      const tiles=[...grid.querySelectorAll('.app-tile')];
      const search=document.querySelector('#homeView .google-search');
      const dock=document.querySelector('#homeView .launcher-bottom');
      const rect=el=>el.getBoundingClientRect();
      const labels=tiles.map(el=>{
        const label=el.querySelector('span:last-child'), b=rect(label);
        const style=getComputedStyle(label);
        return {title:label.textContent, h:b.height,
          fontSize:parseFloat(style.fontSize),
          overflowX:Math.max(0,b.right-rect(el).right),
          lineHeight:parseFloat(style.lineHeight),
          hyphens:style.hyphens};
      });
      const searchLabel=search.querySelector('span');
      return {count:tiles.length,labels,
        gridBottom:rect(grid).bottom,dockTop:rect(dock).top,
        searchHeight:rect(search).height,searchLabelHeight:rect(searchLabel).height,
        searchOverflow:searchLabel.scrollWidth-searchLabel.clientWidth,
        dockBottom:rect(dock).bottom, phoneBottom:rect(phone).bottom,
        floating:getComputedStyle(document.querySelector('#freeFloatingHome')).display};
    });
    assert.ok(home.count>=12,label+': faltam apps da Home');
    assert.ok(home.gridBottom<=home.dockTop+5,label+': icones cobertos pela busca');
    assert.ok(home.dockBottom<=home.phoneBottom+3,label+': barra de busca fora da tela');
    assert.ok(home.searchHeight<=52,label+': busca ocupou duas linhas');
    assert.ok(home.searchOverflow<=3,label+': busca tem texto horizontalmente cortado');
    assert.equal(home.floating,'none',label+': Inicio/0 situacoes ainda sobre a Home');
    for(const tile of home.labels){
      assert.ok(tile.h<=tile.lineHeight*2+4,label+': texto do app quebrou em tres linhas '+tile.title);
      assert.ok(tile.fontSize<=17,label+': app exagerado '+tile.title);
      assert.ok(tile.overflowX<=3,label+': titulo saiu da coluna '+tile.title);
      assert.equal(tile.hyphens,'none',label+': hifenizacao indevida '+tile.title);
    }
    for(const app of ['chrome','calendar']){
      await page.evaluate(app=>{
        window.EducaFreeView.setView('webreal');
        const title=document.getElementById('webRealTitle');
        const icon=document.getElementById('webRealIcon');
        const subtitle=document.getElementById('webRealSubtitle');
        const body=document.getElementById('webRealBody');
        title.textContent=app==='chrome'?'Navegador':'Agenda';
        icon.src='/static/icons/'+app+'.svg';
        subtitle.textContent='Modo Livre · recursos web';
        const intro=app==='chrome'
         ? '<section class="wr-card"><strong>Navegador real</strong><p>Digite um site ou uma pesquisa. O endereço será aberto em uma nova aba segura do navegador do aparelho.</p><form><label>Endereço ou pesquisa<input placeholder="Ex.: www.gov.br ou receita de bolo"></label><button>Pesquisar / abrir site</button></form></section><section class="wr-card"><strong>Sites conhecidos</strong><div class="wr-row"><button>GOV.BR</button><button>Gmail</button><button>YouTube</button></div></section>'
         : '<p class="wr-disclosure">Este é um ambiente educativo. Recursos do seu aparelho só são usados após uma ação sua.</p><section class="wr-card"><strong>Minha agenda</strong><p>Crie lembretes fictícios e salve neste navegador. É possível exportar um evento para seu calendário real.</p><form><label>O que você quer lembrar?<input placeholder="Ex.: Consulta, treinamento"></label><label>Data<input type="date"></label><label>Horário<input type="time"></label><button>Salvar lembrete</button></form></section>';
        body.innerHTML=intro;
      },app);
      const v=await page.evaluate(()=>{
        const header=document.querySelector('#webRealView .webreal-header');
        const title=header.querySelector('strong'),subtitle=header.querySelector('small');
        const content=document.getElementById('webRealBody');
        const section=content.querySelector('.wr-card');
        const rect=el=>el.getBoundingClientRect();
        const buttons=[...content.querySelectorAll('button')];
        content.scrollTop=content.scrollHeight;
        const last=buttons.at(-1);
        return {headerBottom:rect(header).bottom,contentTop:rect(content).top,
          titleHeight:rect(title).height,subtitleHeight:rect(subtitle).height,
          titleFont:parseFloat(getComputedStyle(title).fontSize),
          contentScrollX:content.scrollWidth-content.clientWidth,
          contentScrollY:content.scrollHeight-content.clientHeight,
          cardScrollX:section.scrollWidth-section.clientWidth,
          lastBottom:rect(last).bottom,scrollBottom:rect(content).bottom,
          floating:getComputedStyle(document.getElementById('freeFloatingHome')).display,
          btnMin:Math.min(...buttons.map(x=>rect(x).height))};
      });
      assert.ok(v.headerBottom<=v.contentTop+3,label+' '+app+': cabeçalho cobre formulário');
      assert.ok(v.titleHeight<=v.titleFont*1.5,label+' '+app+': título ocupa duas linhas');
      assert.ok(v.subtitleHeight<=24,label+' '+app+': subtítulo ocupa duas linhas');
      assert.ok(v.contentScrollX<=3,label+' '+app+': scroll horizontal');
      assert.ok(v.cardScrollX<=3,label+' '+app+': cartão estoura largura');
      assert.ok(v.lastBottom<=v.scrollBottom+4,label+' '+app+': botão final escondido após scroll');
      assert.ok(v.btnMin>=43,label+' '+app+': botão menor que 44px');
      assert.equal(v.floating,'none',label+' '+app+': Início/Situações sobre formulário');
      if([320,390,1366].includes(w)){
        await page.screenshot({path:`artifacts/free-resources-v11175/${app}-${w}-${mode}-${full?'full':'mock'}.png`});
      }
    }
    assert.equal(errors.length,0,label+': erro de JS '+errors.join(';'));
    passed++;
    console.log('V111.75 PASS '+label);
  }catch(e){
    issues.push({case:label,error:e.message});
    console.error('V111.75 FAIL '+label+': '+e.message);
  }finally{await page.close();}
}
}finally{await browser.close();}
await writeFile('artifacts/free-resources-v11175/results.json',JSON.stringify({passed,issues},null,2));
console.log('V111.75 total',passed,'passed,',issues.length,'failures');
if(issues.length)throw new Error('Auditoria V111.75 encontrou '+issues.length+' falhas');
