import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html = readFileSync('public/html/index.html', 'utf8');
const accessibility = readFileSync('public/static/js/accessibility.js', 'utf8');
const tutorial = readFileSync('public/static/js/onboarding.js', 'utf8');
const css = readFileSync('public/static/css/onboarding.css', 'utf8');
const sw = readFileSync('public/static/sw.js', 'utf8');
test('V111.34: primeiro acesso oferece guia visual, sem abrir modal de acessibilidade', () => {
  for (const id of ['educaTour','educaTourSpotlight','educaTourHotspot','educaTourCard','educaTourNext','educaTourSkip','openGuidedTour']) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(tutorial, /educa-tour-v11143-finished/);
  assert.match(tutorial, /window\.addEventListener\('load'/);
  assert.match(tutorial, /document\.body\.classList\.add\('educa-tour-active'\)/);
  assert.doesNotMatch(accessibility, /if \(!prefs\.configured\)\s*\{\s*open\(\)/);
});
test('V111.34: foco mostra Banco e botão de acessibilidade, acionados por toque', () => {
  assert.match(tutorial, /data-open-app=\"bank\"/);
  assert.match(tutorial, /#openAccessibilitySettings/);
  assert.match(tutorial, /hotspot\?\.addEventListener\('click', actOnTarget\)/);
  assert.match(tutorial, /target\.click\(\)/);
  assert.match(css, /box-shadow:0 0 0 250vmax/);
  assert.match(css, /body\.educa-tour-active \.guide-overlay/);
});
test('V111.34: tour reutilizável, acessível e preserva assets existentes', () => {
  assert.match(tutorial, /event\.key === 'Escape'/);
  assert.match(tutorial, /event\.key === 'Tab'/);
  assert.match(tutorial, /window\.EducaGuidedTour/);
  assert.match(html, /aria-modal="true"/);
  assert.match(sw, /(?:educa-cf1113(?:5|6|7|8|9)|educa-cf11140-access-drawer|educa-cf11143-guide-start-train)/);
  assert.match(sw, /onboarding\.js/);
  assert.match(html, /lia-kokoro-browser\.js/);
});
