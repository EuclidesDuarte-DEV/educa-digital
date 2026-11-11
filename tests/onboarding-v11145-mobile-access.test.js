import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(p, 'utf8');
const css = read('public/static/css/onboarding.css');
const html = read('public/html/index.html');
const js = read('public/static/js/onboarding.js');
const sw = read('public/static/sw.js');

test('V111.45: mobile places accessibility and replay before training cards', () => {
  assert.match(css,/max-width: 600px/);
  assert.match(css,/pointer: coarse/);
  assert.match(css,/#learningView \.learning-help-actions \{[\s\S]*?order:1/);
  assert.match(css,/#learningView \.learning-featured \{ order:2/);
  assert.match(css,/#learningView \.learning-grid \{ order:3/);
  assert.match(css,/#learningView \.learning-help-actions \{[\s\S]*?position:sticky/);
  assert.match(css,/min-height:46px/);
});
test('V111.45: existing guide and desktop remain, asset version changes', () => {
  assert.match(css,/No computador permanece o rodapé original/);
  assert.match(html,/onboarding.css\?v=11145/);
  assert.match(html,/id="learningAccessibilityBtn"/);
  assert.match(html,/id="learningReplayGuideBtn"/);
  assert.match(js,/selector: '#learningAccessibilityBtn'/);
  assert.match(js,/selector: '#freeModeEntry'/);
  assert.match(sw,/educa-cf11145-mobile-a11y-shortcuts|educa-cf11147-phone-only-responsive-a11y/);
});
