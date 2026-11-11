import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('public/html/index.html','utf8');
const script=readFileSync('public/static/js/accessibility-external.js','utf8');
const css=readFileSync('public/static/css/accessibility.css','utf8');
const sw=readFileSync('public/static/sw.js','utf8');
test('V111.39: único atalho de acessibilidade e controle de sair da tela cheia',()=>{
 assert.equal((html.match(/id="openAccessibilitySettings"/g)||[]).length,1);
 assert.match(html,/class="educa-external-access"/);
 assert.match(html,/id="exitFullscreen"/);
});
test('V111.39: fullscreen alinha o botão à saída por medição real',()=>{
 assert.match(script,/classList\.contains\('educa-fullscreen-active'\)/);
 assert.match(script,/exitButton && !exitButton\.hidden/);
 assert.match(script,/r\.bottom \+ 10/);
 assert.match(script,/wrapper\.classList\.add\('a11y-below-exit'\)/);
 assert.match(script,/wrapper\.classList\.remove\('a11y-below-exit'\)/);
});
test('V111.39: modal não recebe controle flutuante sobre o formulário',()=>{
 assert.match(css,/body:has\(#startModal:not\(\[hidden\]\)/);
 assert.match(css,/visibility:hidden!important/);
 assert.match(html,/accessibility-external\.js\?v=11139/);
 assert.match(sw,/(?:educa-cf11139-access-position|educa-cf11140-access-drawer|educa-cf11143-guide-start-train|educa-cf11144-first-login-guide|educa-cf11145-mobile-a11y-shortcuts|educa-cf11147-phone-only-responsive-a11y)/);
});
