/* Educa+ V111.75 — navegação e recursos Modo Livre com zoom de texto.
 * Chromium: 9 resoluções x 3 fontes; mockup e fullscreen onde faz sentido.
 * Abre TODOS os aplicativos web do Modo Livre, sem interagir com APIs reais.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';

const sizes=['normal','large','extra'];
const viewports=[
 {width:320,height:640},{width:360,height:780},{width:390,height:844},
 {width:430,height:932},{width:768,height:1024},{width:1024,height:768},
 {width:1366,height:768},{width:1920,height:1080},{width:896,height:414}
];
const fullWidths=new Set([390,896,1366]);
const apps=['chrome','calendar','camera','photos','gmail','maps','youtube','phone','messages','playstore'];
await mkdir('artifacts/free-reflow-v11175',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const problems=[];
let checked=0;
try {
 for(const viewport of viewports) for(const size of sizes) {
   for(const full of [false,...(fullWidths.has(viewport.width)?[true]:[])]) {
     const name=viewport.width+'x'+viewport.height+'/'+size+'/'+(full?'fullscreen':'mockup');
     const page=await browser.newPage({viewport});
     try {
       await page.goto('http://127.0.0.1:8789/html/',{waitUntil:'domcontentloaded',timeout:30000});
       await page.waitForFunction(()=>!!(window.EducaFreeMode&&window.EducaWebReal&&window.EducaAccessibility),{timeout:15000});
       await page.addStyleTag({content:'*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important;}'});
       await page.evaluate(({size,full})=>{
         // A ponte de treinamento inicia desligada na tela de abertura;
         // o fluxo real a habilita antes de começar o Modo Livre.
         // Aqui habilitamos apenas a condicao para auditar os recursos,
         // sem simular uma chamada, Pix, permissao nem API de producao.
         window.EducaFreeView.isTraining=()=>true;
         window.EducaFreeMode.start();
         if(!document.getElementById('phoneScreen').classList.contains('free-active'))
           throw new Error('Modo Livre nao foi ativado para o teste');
         if(size!=='normal') window.EducaAccessibility.update({text:size});
         if(full) {
           document.body.classList.add('prototype-focus');
           document.documentElement.classList.add('educa-fullscreen-active');
         }
         window.EducaFreeView.setView('home');
       },{size,full});
       await page.waitForTimeout(65);
       const home=await page.evaluate(()=>{
         const rect=e=>e.getBoundingClientRect().toJSON();
         const $=s=>document.querySelector(s);
         const root=$('#homeView'), grid=$('#homeView .launcher-grid'), dock=$('#homeView .launcher-bottom');
         const search=$('#homeView .google-search'), name=search.querySelector('span');
         const tiles=[...grid.querySelectorAll('.app-tile')].map(e=>{
           const label=e.querySelector('span:last-child'),text=label.textContent.trim();
           const fs=parseFloat(getComputedStyle(label).fontSize);
           const line=parseFloat(getComputedStyle(label).lineHeight);
           return {label:text,rect:rect(label),font:fs,lines:label.clientHeight/line,
              scrollX:label.scrollWidth-label.clientWidth};
         });
         return {grid:rect(grid),dock:rect(dock),search:rect(search),searchText:rect(name),
           searchNoWrap:getComputedStyle(name).whiteSpace==='nowrap',
           searchX:name.scrollWidth-name.clientWidth,
           tileCount:tiles.length,tiles,
           floatHidden:$('#freeFloatingHome').hidden,
           root:rect(root)};
       });
       assert.ok(home.floatHidden,name+': barra inicio/situacoes ainda aparece');
       assert.ok(home.tileCount>=10,name+': atalhos desapareceram');
       assert.ok(home.grid.bottom<=home.dock.top+3,name+': atalhos cobrem pesquisa/dock');
       assert.ok(home.searchNoWrap,name+': Pesquisa quebra em duas linhas');
       assert.ok(home.searchText.bottom<=home.search.bottom+2,name+': campo de pesquisa cortado');
       assert.ok(home.searchX<=4,name+': texto da pesquisa cortado');
       for(const tile of home.tiles) {
         assert.ok(tile.lines<=2.15,name+': nome do app ocupa mais de 2 linhas '+tile.label);
         assert.ok(tile.font>=11&&tile.font<=16,name+': escala incorreta no app '+tile.label);
         assert.ok(tile.scrollX<=5,name+': nome do app cortado na horizontal '+tile.label);
       }
       if([320,390,768,1366,896].includes(viewport.width)){
         await page.screenshot({path:'artifacts/free-reflow-v11175/home-'+viewport.width+'-'+size+'-'+(full?'full':'mock')+'.png'});
       }

       // Verificar todas as telas de recursos reais de maneira isolada,
       // com rolamento ate a ultima opcao e sem sobreposicao do titulo.
       for(const app of apps) {
         await page.evaluate(app=>window.EducaWebReal.openApp(app),app);
         const result=await page.evaluate(()=>{
           const $=s=>document.querySelector(s),rect=e=>e.getBoundingClientRect().toJSON();
           const root=$('#webRealView'),header=$('#webRealView .webreal-header');
           const scroll=$('#webRealBody'),title=$('#webRealTitle');
           const floating=$('#freeFloatingHome');
           const before={root:rect(root),header:rect(header),scroll:rect(scroll),title:rect(title),
             titleLines:title.clientHeight/parseFloat(getComputedStyle(title).lineHeight),
             scrollX:scroll.scrollWidth-scroll.clientWidth,
             overflow:scroll.scrollHeight-scroll.clientHeight,
             hidden:floating.hidden,show:root.classList.contains('is-active'),
             cards:[...scroll.querySelectorAll('.wr-card')].length};
           scroll.scrollTop=scroll.scrollHeight;
           const children=[...scroll.children].filter(el=>getComputedStyle(el).display!=='none');
           const last=children.at(-1);
           const lastRect=last?rect(last):null;
           return {...before,lastRect,afterScroll:rect(scroll)};
         });
         assert.ok(result.show,name+' '+app+': tela nao abriu');
         assert.ok(result.hidden,name+' '+app+': Inicio/situacoes bloqueia formulario');
         assert.ok(result.header.bottom<=result.scroll.top+3,name+' '+app+': cabecalho cobre conteudo');
         assert.ok(result.titleLines<=1.25,name+' '+app+': titulo extrapola cabecalho');
         assert.ok(result.scrollX<=4,name+' '+app+': rolagem horizontal');
         assert.ok(result.scroll.height>=40,name+' '+app+': formulario inacessivel');
         assert.ok(result.cards>=1,name+' '+app+': conteudo ausente');
         if(result.lastRect)assert.ok(result.lastRect.bottom<=result.scroll.bottom+5,
           name+' '+app+': ultimo recurso inalcançavel ao rolar');
         checked++;
         if(['chrome','calendar'].includes(app)&&[320,390,1366].includes(viewport.width)){
           await page.screenshot({path:'artifacts/free-reflow-v11175/'+app+'-'+viewport.width+'-'+size+'-'+(full?'full':'mock')+'.png'});
         }
       }
       console.log('V111.75 '+name+' OK: inicio, pesquisa e '+apps.length+' aplicativos web');
     }catch(e){
       problems.push({case:name,reason:e.message});
       console.error('V111.75 FALHA '+name+': '+e.message);
     }finally{await page.close();}
   }
 }
}finally{await browser.close();}
await writeFile('artifacts/free-reflow-v11175/resultado.json',JSON.stringify({checked,problems},null,2));
console.log('AUDITORIA V111.75: '+checked+' telas de recursos testadas, '+problems.length+' falhas');
if(problems.length)throw new Error('V111.75 apresenta '+problems.length+' casos de reflow; consulte resultado.json');
