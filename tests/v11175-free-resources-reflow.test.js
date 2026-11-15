import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const get=f=>readFileSync(f,'utf8');
const css=get('public/static/css/responsive-v11175.css');
const html=get('public/html/index.html'),sw=get('public/static/sw.js');
const web=get('public/static/channels/web/overrides.js');
test('V111.75 folha e SW atualizados',()=>{
 assert.match(html,/responsive-v11175\.css\?v=11175/);
 assert.match(sw,/educa-cf11175-free-resources/);
 assert.match(sw,/responsive-v11175\.css/);
 assert.match(html,/layout=11175/);
});
test('V111.75 elimina somente barra redundante e preserva voltar real',()=>{
 assert.match(css,/#phoneScreen\.free-active #freeFloatingHome \{display:none!important;/);
 assert.match(html,/id="webRealBack"/);
 assert.match(html,/id="freeFloatingBack"/);
 assert.match(css,/#phoneScreen #webRealView \.webreal-header/);
 assert.match(css,/#phoneScreen #webRealView \.webreal-scroll/);
 assert.match(css,/top:105px!important/);
});
test('V111.75 recursos e launcher têm escalas por elemento, nao explosao dos icones',()=>{
 assert.match(css,/html\.a11y-text-extra/);
 assert.match(css,/--free-resource-copy:19px/);
 assert.match(css,/--free-app-label:16px/);
 assert.match(css,/\.app-tile > span:last-child/);
 assert.match(css,/word-break:normal!important/);
 assert.match(css,/hyphens:none!important/);
 assert.match(css,/\.google-search b/);
 assert.match(css,/white-space:nowrap!important/);
 assert.match(css,/\.wr-row/);
 assert.match(css,/overflow-y:auto!important/);
 assert.match(web,/#homeView \.launcher-grid, #homeView \.launcher-bottom, #webRealView/);
});
test('V111.75 script de navegacao sera verificado com playwright',()=>{
 const code=get('scripts/validar-modo-livre-recursos-v11175.mjs');
 assert.match(code,/normal','large','extra/);
 assert.match(code,/webRealView/);
 assert.match(code,/freeFloatingHome/);
 assert.match(code,/launcher-grid/);
 assert.match(code,/calendar/);
 assert.match(code,/chrome/);
 assert.equal(spawnSync('node',['--check','scripts/validar-modo-livre-recursos-v11175.mjs'],{encoding:'utf8'}).status,0);
});
test('CSS V111.75 sem chaves faltantes',()=>{
 let count=0;for(const c of css.replace(/\/\*[\s\S]*?\*\//g,'')){if(c==='{')count++;if(c==='}')count--;assert.ok(count>=0)}assert.equal(count,0);
});
