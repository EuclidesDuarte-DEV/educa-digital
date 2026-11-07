import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('public/html/index.html','utf8');
const css=readFileSync('public/static/css/accessibility.css','utf8');
const script=readFileSync('public/static/js/accessibility-external.js','utf8');
const tour=readFileSync('public/static/js/onboarding.js','utf8');
const sw=readFileSync('public/static/sw.js','utf8');
test('V111.39: um único botão, junto às ações do cabeçalho e fora do celular',()=>{
 assert.equal((html.match(/id="openAccessibilitySettings"/g)||[]).length,1);
 assert.match(html,/<div class="header-actions">[\s\S]*?<aside class="educa-external-access"[\s\S]*?id="openAccessibilitySettings"[\s\S]*?<button id="openGuidedTour"/);
 assert.doesNotMatch(html,/id="a11yLearningSettings"|id="a11yPhoneQuickSettings"|id="a11yFloatingSettings"/);
 assert.match(css,/\.educa-external-access\{[\s\S]*?position:relative/);
});
test('V111.39: em fullscreen move para o body, em home devolve ao cabeçalho',()=>{
 assert.match(script,/actions\.insertBefore\(wrapper, guideButton\)/);
 assert.match(script,/document\.body\.appendChild\(wrapper\)/);
 assert.match(script,/exitButton\.getBoundingClientRect\(\)/);
 assert.match(script,/requestAnimationFrame\(place\)/);
 assert.match(script,/fullscreenchange/);
});
test('V111.39: painel e tutorial sob demanda seguem preservados',()=>{
 assert.match(html,/id="accessibilityDialog"/);
 assert.match(html,/id="openGuidedTour"/);
 assert.match(tour,/#openAccessibilitySettings/);
 assert.match(html,/static\/js\/accessibility-external\.js\?v=11139/);
 assert.match(sw,/accessibility-external\.js/);
});
