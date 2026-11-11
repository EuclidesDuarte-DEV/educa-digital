import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = p => readFileSync(p,'utf8');
const html = read('public/html/index.html');
const js = read('public/static/js/onboarding.js');
const css = read('public/static/css/responsive-v11149.css');
const sw = read('public/static/sw.js');

test('V111.49: mobile não repete ajuda e acessibilidade embaixo dos cartões', () => {
  assert.doesNotMatch(html, /id="learningAccessibilityBtn"|id="learningAccessibilityQuickBtn"|id="learningReplayGuideBtn"/);
  assert.doesNotMatch(html, /id="learningHelpActions"/);
  assert.match(css, /#learningView \.learning-help-actions \{ display:none!important/);
  assert.match(css, /#learningView \.learning-a11y-quick/);
  assert.match(html, /id="openAccessibilitySettings"/);
});

test('V111.49: preserva a função de guia manual e atualiza assets', () => {
  assert.match(html, /id="openGuidedTour"/);
  assert.match(js, /replay\?\.addEventListener\('click'/);
  assert.doesNotMatch(js, /if \(!rememberedAccount\(\)\?\.phone\) start\(\)/);
  assert.match(html, /responsive-v11149\.css\?v=11149/);
  assert.match(html, /onboarding\.js\?v=11149/);
  assert.match(sw, /(?:educa-cf11149-clean-multidevice-ui|educa-cf11150-fullscreen-toolbar)/);
});
