import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../public/html/index.html', import.meta.url), 'utf8');
const system = readFileSync(new URL('../public/static/js/android-system.js', import.meta.url), 'utf8');
const training = readFileSync(new URL('../public/static/js/training.js', import.meta.url), 'utf8');
const stylesheet = readFileSync(new URL('../public/static/css/android-system.css', import.meta.url), 'utf8');

test('V103 retains the V102 educational entrance and training routes', () => {
  assert.match(html, /id="homeView"/);
  assert.match(html, /data-open-app="bank"/);
  assert.match(html, /id="learningView"/);
  assert.match(html, /id="fullscreenBtn"/);
  assert.match(html, /id="exitFullscreen"/);
  assert.match(training, /applyLandingPretest\(\)/);
  assert.match(training, /\/api\/progresso/);
});

test('Android system panel has accessible controls and no native system mutations', () => {
  for (const id of ['androidShadeTrigger', 'androidShade', 'closeAndroidShade', 'androidBrightness',
    'androidRecents', 'androidReturnTraining', 'androidReturnHome']) {
    assert.ok(html.includes(`id="${id}"`), `Missing ${id}`);
  }
  for (const mode of ['wifi', 'bluetooth', 'silent', 'airplane']) {
    assert.ok(html.includes(`data-system-toggle="${mode}"`));
  }
  assert.match(system, /Controles ilustrativos|Wi-Fi, Bluetooth/);
  assert.match(system, /'educa:system-back'/);
  assert.match(stylesheet, /prefers-reduced-motion/);
});
