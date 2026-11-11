import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const html = read('public/html/index.html');
const guide = read('public/static/js/onboarding.js');
const training = read('public/static/js/training.js');
const style = read('public/static/css/onboarding.css');
const cache = read('public/static/sw.js');

test('V111.44: orienta a primeira sessão de uma conta, sem mexer no guia anterior da landing', () => {
  assert.match(guide, /const KEY = 'educa-tour-v11143-finished'/);
  assert.match(guide, /const accountSteps = \[/);
  assert.match(guide, /function accountGuideKey\(phone\)/);
  assert.match(guide, /localStorage\.setItem\(keyToSave, '1'\)/);
  assert.match(guide, /const candidateKey = authenticated \? accountGuideKey\(user\?\.phone\) : KEY/);
  assert.match(guide, /document\.body\.classList\.contains\('prototype-focus'\)/);
  assert.match(guide, /startAuthenticated: \(user, force = false\)/);
  assert.match(training, /window\.EducaGuidedTour\?\.startAuthenticated\?\.\(user\)/);
  assert.match(training, /if \(!firstActivity && accessMode === 'registered'\)/);
});

test('V111.44: 6 etapas de boas-vindas, escolha, acessibilidade, segurança, modo livre e conclusão', () => {
  const steps = guide.split('const accountSteps = [')[1].split('];')[0];
  assert.equal((steps.match(/targetLabel:/g) || []).length, 6);
  for (const label of ['Bem-vindo ao Educa+ Digital', 'Escolha o que quer aprender', 'Deixe a tela mais confortável', 'Comece por Segurança', 'Conheça o Modo Livre', 'Pronto para começar']) {
    assert.ok(steps.includes(label), label);
  }
  for (const id of ['educaTourBack', 'educaTourNext', 'educaTourSkip', 'educaTourProgress', 'learningAccessibilityBtn', 'learningReplayGuideBtn']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(guide, /back\?\.addEventListener\('click'/);
  assert.match(guide, /if \(back\) back\.disabled = index === 0/);
});

test('V111.44: mostra acessibilidade e repetição do guia na tela do aluno e preserva os módulos', () => {
  assert.match(guide, /\$\('#learningAccessibilityBtn'\)\?\.addEventListener\('click'/);
  assert.match(style, /body:not\(\.prototype-focus\) \.learning-help-actions\{display:none\}/);
  for (const topic of ['pix','security','whatsapp','settings','govbr']) assert.match(html, new RegExp(`data-learning-topic="${topic}"`));
  assert.match(html, /id="freeModeEntry"/);
  assert.match(html, /id="phoneStage"/);
  assert.match(html, /lia-kokoro-browser\.js/);
  assert.match(cache, /educa-cf11144-first-login-guide|educa-cf11145-mobile-a11y-shortcuts|educa-cf11147-phone-only-responsive-a11y/);
});
