import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync('public/html/index.html','utf8');
const css=readFileSync('public/static/css/accessibility.css','utf8');
const js=readFileSync('public/static/js/accessibility.js','utf8');
const sw=readFileSync('public/static/sw.js','utf8');
test('V111.40 usa painel lateral e não central',()=>{
  assert.match(css,/\.a11y-dialog\{position:fixed;inset:0 0 0 auto/);
  assert.match(css,/grid-template-rows:auto minmax\(0,1fr\) auto/);
  assert.match(css,/\.a11y-options\{[^}]*overflow-y:auto/);
  assert.match(css,/\.a11y-dialog\[open\]\{display:grid/);
  assert.match(css,/@media\(max-width:600px\)/);
});
test('V111.40 tem fechar no topo, 2 ações claras no rodapé e mantém 3 configurações',()=>{
  for (const id of ['a11ySkip','a11yReset','a11yFinish','a11yFontSize','a11yColors','a11yReading']) assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/a11y-dialog-close/);
  assert.match(html,/a11y-footer-actions/);
  assert.match(html,/Ajustes aplicados automaticamente/);
  assert.match(html,/id="a11yFinish"[^>]*>Concluir/);
});
test('V111.40 preserva persistência, fechamento e cache atualizado',()=>{
  assert.match(js,/localStorage\.setItem/);
  assert.match(js,/dialog\.showModal\(\)/);
  assert.match(js,/event\.target !== dialog/);
  assert.match(js,/dialog\?\.addEventListener\('cancel'/);
  assert.match(sw,/educa-cf11140-access-drawer|educa-cf11143-guide-start-train/);
});
