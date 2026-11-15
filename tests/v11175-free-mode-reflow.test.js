import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const read=p=>readFileSync(p,'utf8');
const css=read('public/static/css/responsive-v11175.css');
const ui=read('public/html/index.html');
const sw=read('public/static/sw.js');
const free=read('public/static/js/free-mode.js');
const scaling=read('public/static/channels/web/overrides.js');
const visual=read('scripts/validar-modo-livre-v11175.mjs');
const flow=read('.github/workflows/mobile-v11148.yml');

test('[all] remove barra Inicio/situacoes sem apagar progresso nem voltar nativo',()=>{
 assert.match(free,/if\(els\.floating\)els\.floating\.hidden=true;/);
 assert.match(css,/#phoneScreen\.free-active #freeFloatingHome \{display:none!important/);
 assert.match(free,/if\(els\.solved\)els\.solved\.textContent=/);
 const web=read('public/static/js/web-real.js');
 assert.match(web,/\$\('#webRealBack'\)\?\.addEventListener\('click',back\)/);
 assert.match(web,/window\.EducaFreeView\?\.setView\('home'\)/);
 assert.match(free,/freeFloatingBack/);
});

test('[all] 3 tamanhos de fonte proporcional para nomes, pesquisa e conteudo',()=>{
 for(const cls of ['html.a11y-text-large','html.a11y-text-extra'])assert.ok(css.includes(cls));
 assert.match(css,/--ed-free-icon-label:15px/);
 assert.match(css,/--ed-free-search-label:18px/);
 assert.match(css,/--ed-free-resource-text:19px/);
 assert.match(css,/#homeView \.app-tile > span:last-child/);
 assert.match(css,/word-break:keep-all!important/);
 assert.match(css,/hyphens:none!important/);
 assert.match(css,/#homeView \.google-search > span/);
 assert.match(css,/white-space:nowrap!important/);
 assert.match(scaling,/phone\.classList\?\.contains\?\.\('free-active'\)/);
 assert.match(scaling,/#homeView \.launcher-grid, #homeView \.launcher-bottom/);
 assert.match(scaling,/#webRealView/);
});

test('[all] formulario webreal nao sobrepoe cabecalho e e rolavel ate o fim',()=>{
 assert.match(css,/#webRealView\.android-view\.is-active/);
 assert.match(css,/grid-template-rows:66px minmax\(0,1fr\)/);
 assert.match(css,/#webRealView \.webreal-header/);
 assert.match(css,/#webRealView \.webreal-scroll/);
 assert.match(css,/overflow-y:auto!important/);
 assert.match(css,/grid-row:2/);
 assert.match(css,/min-height:0!important/);
 assert.match(css,/#webRealView \.webreal-scroll :is\(input,textarea,select\)/);
 assert.match(css,/min-height:46px!important/);
 assert.match(css,/#webRealView \.wr-row/);
});

test('[all] ativa CSS V111.75 e renova cache sem alterar versoes nativas',()=>{
 assert.match(ui,/responsive-v11174\.css\?v=11174/);
 assert.match(ui,/responsive-v11175\.css\?v=11175/);
 assert.ok(ui.indexOf('responsive-v11175.css')>ui.indexOf('responsive-v11174.css'));
 assert.match(sw,/educa-cf11175-free-mode-navigation/);
 assert.match(sw,/responsive-v11175\.css/);
 assert.match(ui,/sw\.js\?v=11160&layout=11175/);
});

test('[all] script navegador percorre todos recursos, tamanhos e fullscreen',()=>{
 for(const w of [320,360,390,430,768,1024,1366,1920,896]){
  assert.match(visual,new RegExp('width:'+w+'(?:,|\\})'));
 }
 for(const app of ['chrome','calendar','camera','photos','gmail','maps','youtube','phone','messages','playstore'])
  assert.ok(visual.includes("'"+app+"'"),'falta recurso '+app);
 assert.match(visual,/const sizes=\['normal','large','extra'\]/);
 assert.match(visual,/fullWidths=new Set\(\[390,896,1366\]\)/);
 assert.match(visual,/window\.EducaFreeMode\.start\(\)/);
 assert.match(visual,/window\.EducaWebReal\.openApp\(app\)/);
 assert.match(visual,/lastRect\.bottom/);
 assert.match(visual,/artifacts\/free-reflow-v11175/);
 assert.match(flow,/node scripts\/validar-modo-livre-v11175\.mjs/);
 const parsed=spawnSync('node',['--check','scripts/validar-modo-livre-v11175.mjs'],{encoding:'utf8'});
 assert.equal(parsed.status,0,parsed.stderr);
});

test('[all] CSS sem chaves desbalanceadas ou zoom como conserto',()=>{
 const clean=css.replace(/\/\*[\s\S]*?\*\//g,'');
 let n=0;
 for(const ch of clean) {
  if(ch==='{')n++;
  if(ch==='}')n--;
  assert.ok(n>=0);
 }
 assert.equal(n,0);
 assert.doesNotMatch(clean,/(?:^|[;{])\s*(?:zoom|transform)\s*:/);
});
