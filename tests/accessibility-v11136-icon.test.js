import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync('public/html/index.html','utf8');
const css=readFileSync('public/static/css/accessibility.css','utf8');
const js=readFileSync('public/static/js/accessibility.js','utf8');
test('V111.37: ícone universal V111.36 foi preservado no botão externo',()=>{
 assert.match(html,/id="openAccessibilitySettings"[^>]*>[\s\S]*?a11y-icon-figure[\s\S]*?<span class="a11y-header-word">Acessibilidade<\/span>/);
 assert.doesNotMatch(html,/>♿ <span class="a11y-header-word">/);
 assert.match(css,/\.a11y-icon-figure/);
});
test('V111.37: o painel continua sob demanda',()=>{
 assert.match(js,/\$\('#openAccessibilitySettings'\)\?\.addEventListener\('click', open\)/);
 assert.match(html,/id="accessibilityDialog"/);
 assert.doesNotMatch(js,/if \(!prefs\.configured\)\s*\{\s*open\(\)/);
});
