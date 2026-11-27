import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const html = read('public/html/index.html');
const guide = read('public/static/js/onboarding.js');
const training = read('public/static/js/training.js');
const cache = read('public/static/sw.js');

test('V111.49: o tutorial de conta continua disponível, mas somente sob demanda', () => {
  assert.match(guide, /const KEY = 'educa-tour-v11143-finished'/);
  assert.match(guide, /const accountSteps = \[/);
  assert.match(guide, /function accountGuideKey\(phone\)/);
  assert.match(guide, /localStorage\.setItem\(keyToSave, '1'\)/);
  assert.match(guide, /const candidateKey = authenticated \? accountGuideKey\(user\?\.phone\) : KEY/);
  assert.match(guide, /startAuthenticated: \(user, force = false\)/);
  assert.doesNotMatch(training, /window\.EducaGuidedTour\?\.startAuthenticated\?\.\(user\)/);
  assert.doesNotMatch(guide, /if \(!rememberedAccount\(\)\?\.phone\) start\(\)/);
  assert.match(guide, /replay\?\.addEventListener\('click'/);
});

test('V111.49: ajuda opcional reduzida a dois passos objetivos', () => {
  const steps = guide.split('const accountSteps = [')[1].split('];')[0];
  assert.equal((steps.match(/targetLabel:/g) || []).length, 2);
  assert.match(steps, /#learningView \.learning-featured/);
  assert.match(steps, /#freeModeEntry/);
  for (const id of ['educaTourBack','educaTourNext','educaTourSkip','educaTourProgress']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(guide, /back\?\.addEventListener\('click'/);
  assert.match(guide, /if \(back\) back\.disabled = index === 0/);
});

test('V111.49: uma acessibilidade global, sem duplicações dentro do celular', () => {
  assert.equal((html.match(/id="openAccessibilitySettings"/g) || []).length, 1);
  assert.doesNotMatch(html, /id="learningAccessibilityQuickBtn"|id="learningAccessibilityBtn"|id="learningReplayGuideBtn"/);
  for (const topic of ['pix','security','whatsapp','settings','govbr'])
    assert.match(html, new RegExp(`data-learning-topic="${topic}"`));
  assert.match(html, /id="freeModeEntry"/);
  assert.match(html, /id="phoneStage"/);
  assert.match(html, /lia-kokoro-browser\.js/);
  assert.match(cache, /(?:educa-cf11149-clean-multidevice-ui|educa-cf11150-fullscreen-toolbar|educa-cf11151-phone-entry|educa-cf11152-lia-kokoro-fluida|educa-cf11153-modo-livre-sms-contextual|educa-cf11154-home-video-cue|educa-cf11155-bank-spotlight|educa-cf11156-lia-voice-viewport)/);
});
