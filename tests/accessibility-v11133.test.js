import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const h = readFileSync('public/html/index.html', 'utf8');
const js = readFileSync('public/static/js/accessibility.js', 'utf8');
const css = readFileSync('public/static/css/accessibility.css', 'utf8');
const sw = readFileSync('public/static/sw.js', 'utf8');
test('V111.33 abre pop-up de acessibilidade sem cadastro e permite adiar', () => {
  for (const id of ['accessibilityDialog', 'a11yFontSize', 'a11yColors', 'a11yReading', 'a11ySkip', 'a11yFinish', 'openAccessibilitySettings', 'a11yReadNow']) {
    assert.match(h, new RegExp(`id="${id}"`));
  }
  assert.doesNotMatch(js, /if \(!prefs\.configured\)\s*\{\s*open\(\)/);
  assert.match(js, /dialog\.showModal\(\)/);
  assert.match(js, /localStorage\.setItem/);
});
test('as preferências se aplicam imediatamente e podem ser alteradas', () => {
  assert.match(js, /fontSelect\?\.addEventListener\('change'/);
  assert.match(js, /colorInput\?\.addEventListener\('change'/);
  assert.match(js, /readingInput\?\.addEventListener\('change'/);
  assert.match(js, /root\.classList\.toggle\('a11y-text-large'/);
  assert.match(js, /root\.classList\.toggle\('a11y-distinct-colors'/);
  assert.match(css, /\.a11y-text-large/);
  assert.match(css, /\.a11y-distinct-colors/);
});
test('leitura em voz alta é opcional e não altera Kokoro ou LIA', () => {
  assert.match(js, /SpeechSynthesisUtterance/);
  assert.match(js, /utterance\.lang = 'pt-BR'/);
  assert.match(js, /readButton\?\.addEventListener\('click'/);
  assert.doesNotMatch(js, /pf_dora|kokoro/);
  assert.match(sw, /(?:educa-cf1113(?:5-access-inside-phone|6-access-home-icon|7-access-external|8-access-fullscreen|9-access-position)|educa-cf11140-access-drawer|educa-cf11143-guide-start-train)/);
});
