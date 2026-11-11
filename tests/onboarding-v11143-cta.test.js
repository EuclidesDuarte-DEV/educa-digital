import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html = readFileSync('public/html/index.html', 'utf8');
const js = readFileSync('public/static/js/onboarding.js', 'utf8');
const sw = readFileSync('public/static/sw.js', 'utf8');
test('V111.43: guia começa em Começar meu treino, segue para Banco e acessibilidade', () => {
  const first = js.indexOf("selector: '#startNowBtn'");
  const second = js.indexOf("selector: '[data-open-app=\"bank\"]'");
  const third = js.indexOf("selector: '#openAccessibilitySettings'");
  assert.ok(first > 0 && second > first && third > second);
  assert.match(html, /id="startNowBtn"/);
  assert.match(html, /PASSO 1 DE 3/);
  assert.match(js, /PASSO \$\{index \+ 1\} DE \$\{steps\.length\}/);
});
test('V111.43: tocar alvo ativa a ação original, sem abrir acessibilidade automaticamente', () => {
  assert.match(js, /hotspot\?\.addEventListener\('click', actOnTarget\)/);
  assert.match(js, /target\.click\(\)/);
  assert.match(js, /if \(!force && finishedBefore\(\)\) return/);
  assert.match(js, /const KEY = 'educa-tour-v11143-finished'/);
  assert.match(html, /onboarding\.js\?v=1114(?:3|4|7|9)/);
  assert.match(sw, /educa-cf11143-guide-start-train|educa-cf11144-first-login-guide|educa-cf11145-mobile-a11y-shortcuts|educa-cf11147-phone-only-responsive-a11y/);
});
