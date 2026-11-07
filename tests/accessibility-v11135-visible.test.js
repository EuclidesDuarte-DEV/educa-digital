import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync('public/html/index.html','utf8');
const css=readFileSync('public/static/css/accessibility.css','utf8');
const js=readFileSync('public/static/js/accessibility.js','utf8');
test('V111.37: controle permanece alcançável fora do Android simulado',()=>{
 assert.match(html,/id="openAccessibilitySettings"/);
 assert.match(html,/class="educa-external-access"/);
 assert.doesNotMatch(html,/id="a11yLearningSettings"/);
 assert.doesNotMatch(html,/id="a11yPhoneQuickSettings"/);
 assert.match(css,/\.educa-external-access\{/);
 assert.match(js,/\$\('#openAccessibilitySettings'\)\?\.addEventListener\('click', open\)/);
});
test('V111.37: acesso de Ajustes do Android continua existindo',()=>{
 assert.match(html,/id="settingsAccessibilityRow"/);
 assert.match(html,/data-open-educa-accessibility/);
 assert.match(js,/data-open-educa-accessibility/);
});
