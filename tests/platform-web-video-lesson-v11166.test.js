import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = path => readFileSync(path,'utf8');
const css = read('public/static/channels/web/overrides.css');
const html = read('public/html/index.html');
const base = read('public/static/css/app.css');
const mobile = read('public/static/channels/android/overrides.css');
const ios = read('public/static/channels/ios/overrides.css');

function lastRule(selector) {
  const idx = css.lastIndexOf(selector);
  assert.ok(idx !== -1, 'Não existe o seletor ' + selector);
  const open = css.indexOf('{',idx);
  const close = css.indexOf('}',open);
  return css.slice(open+1,close);
}

test('[web] causa confirmada: cabeçalho original de vídeo tinha altura fixa', () => {
  assert.match(base, /\.video-lesson-header\{height:83px;/);
  assert.match(base, /#videoLessonView \.video-lesson-header\{min-height:96px !important;/);
  assert.match(html, /id="videoLessonTitle"/);
  assert.match(html, /id="videoLessonKicker"/);
  assert.match(html, /id="lessonVideo"/);
});

test('[web] cabeçalho cresce em função do título em qualquer nível de fonte', () => {
  const rule = lastRule('html[data-educa-platform="web"] #videoLessonView .video-lesson-header');
  assert.match(rule,/height:\s*auto\s*!important/);
  assert.match(rule,/max-height:\s*none\s*!important/);
  assert.match(rule,/min-height:\s*0\s*!important/);
  assert.match(rule,/position:\s*relative\s*!important/);
  assert.match(rule,/flex:\s*0 0 auto\s*!important/);
  assert.match(rule,/grid-template-columns:\s*44px minmax\(0,1fr\)/);
  const title = lastRule('html[data-educa-platform="web"] #videoLessonView #videoLessonTitle');
  assert.match(title,/white-space:\s*normal\s*!important/);
  assert.match(title,/overflow-wrap:\s*break-word\s*!important/);
  assert.match(title,/line-height:\s*1\.22\s*!important/);
});

test('[web] aula usa só rolagem no conteúdo; vídeo continua 16 por 9', () => {
  const active = lastRule('html[data-educa-platform="web"] #phoneScreen\n  #videoLessonView.android-view.is-active');
  assert.match(active,/overflow:\s*hidden\s*!important/);
  const surface = lastRule('html[data-educa-platform="web"] #videoLessonView .video-lesson-surface');
  assert.match(surface,/flex-direction:\s*column\s*!important/);
  assert.match(surface,/overflow:\s*hidden\s*!important/);
  const content = lastRule('html[data-educa-platform="web"] #videoLessonView .video-lesson-content');
  assert.match(content,/flex:\s*1 1 auto\s*!important/);
  assert.match(content,/min-height:\s*0\s*!important/);
  assert.match(content,/overflow-y:\s*auto\s*!important/);
  const video = lastRule('html[data-educa-platform="web"] #videoLessonView .video-frame-shell');
  assert.match(video,/aspect-ratio:\s*16\s*\/\s*9/);
  assert.match(video,/height:\s*auto\s*!important/);
  assert.match(css,/#videoLessonView #lessonVideo \{[\s\S]*?object-fit:\s*contain/);
});

test('[web] ampliar texto não corta botão, legenda nem status seguro', () => {
  assert.match(css,/#videoLessonView \.video-enlarge-btn,\s*[\s\S]*?#videoLessonView \.video-practice-btn/);
  assert.match(css,/#videoLessonView \.video-safe-note > div \{[\s\S]*?min-width:0/);
  assert.match(css,/#videoLessonView #videoLessonBack \{[\s\S]*?width:44px/);
  assert.match(css,/@media \(max-width:360px\)/);
  assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
});

test('[web] Android e iOS não recebem CSS de vídeos do canal Web', () => {
  assert.doesNotMatch(mobile,/V111\.66|videoLessonView/);
  assert.doesNotMatch(ios,/V111\.66|videoLessonView/);
  assert.match(css,/V111\.66 — SOMENTE WEB/);
});
