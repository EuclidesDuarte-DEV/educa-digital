import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html = fs.readFileSync(new URL('../public/html/index.html', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../public/static/js/training.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../public/static/css/hierarchy-v11146.css', import.meta.url), 'utf8');

test('V111.46 has the simpler accessible home copy and stylesheet', () => {
  assert.match(html, /COMECE POR AQUI/);
  assert.match(html, /Confira os dados antes de pagar/);
  assert.match(html, /hierarchy-v11146.css/);
  assert.doesNotMatch(html, /ESCOLHA SE QUISER/);
});

test('V111.46 highlights only the next lesson, without repetitive video banners', () => {
  assert.match(js, /COMECE AQUI/);
  assert.match(js, /CONCLUÍDA/);
  assert.match(js, /const nextStep = current && !complete/);
  assert.doesNotMatch(js, /VÍDEO E PRÁTICA/);
  assert.match(css, /#modulePathView \.module-lesson-card\.is-current/);
});
