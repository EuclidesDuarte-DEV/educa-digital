import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = path => readFileSync(path,'utf8');
const css = read('public/static/channels/web/overrides.css');
const html = read('public/html/index.html');
const base = read('public/static/css/app.css');
const mobile = read('public/static/channels/android/overrides.css');
const ios = read('public/static/channels/ios/overrides.css');

function firstMatchingRule(selector) {
  const idx = css.indexOf(selector);
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
  const rule = firstMatchingRule('html[data-educa-platform="web"] #videoLessonView .video-lesson-header');
  assert.match(rule,/height:\s*auto\s*!important/);
  assert.match(rule,/max-height:\s*none\s*!important/);
  assert.match(rule,/min-height:\s*0\s*!important/);
  assert.match(rule,/position:\s*relative\s*!important/);
  assert.match(rule,/flex:\s*0 0 auto\s*!important/);
  assert.match(rule,/grid-template-columns:\s*44px minmax\(0,1fr\)/);
  const title = firstMatchingRule('html[data-educa-platform="web"] #videoLessonView #videoLessonTitle');
  assert.match(title,/white-space:\s*normal\s*!important/);
  assert.match(title,/overflow-wrap:\s*break-word\s*!important/);
  assert.match(title,/line-height:\s*1\.22\s*!important/);
});

test('[web] aula usa só rolagem no conteúdo; vídeo continua 16 por 9', () => {
  const active = firstMatchingRule('html[data-educa-platform="web"] #phoneScreen\n  #videoLessonView.android-view.is-active');
  assert.match(active,/overflow:\s*hidden\s*!important/);
  const surface = firstMatchingRule('html[data-educa-platform="web"] #videoLessonView .video-lesson-surface');
  assert.match(surface,/flex-direction:\s*column\s*!important/);
  assert.match(surface,/overflow:\s*hidden\s*!important/);
  const content = firstMatchingRule('html[data-educa-platform="web"] #videoLessonView .video-lesson-content');
  assert.match(content,/flex:\s*1 1 auto\s*!important/);
  assert.match(content,/min-height:\s*0\s*!important/);
  assert.match(content,/overflow-y:\s*auto\s*!important/);
  const video = firstMatchingRule('html[data-educa-platform="web"] #videoLessonView .video-frame-shell');
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


test('[web] V111.81 — topo compacto dos videos mantém títulos e botões acessíveis',()=>{
  const ix=css.indexOf('V111.81 — SOMENTE WEB');
  assert.ok(ix>0,'bloco Web V111.81 presente');
  const block=css.slice(ix);
  const prefix='html[data-educa-platform="web"]'+String.fromCharCode(10);
  function getRule(selector){
    const start=block.indexOf(prefix+selector+' {');
    assert.ok(start>=0,'seletor exclusivo da Web: '+selector);
    return block.slice(start,block.indexOf('}',start)+1);
  }
  const header=getRule('#videoLessonView.ed-web-video-polished .video-lesson-header');
  assert.match(header,/min-height:76px !important/);
  assert.match(header,/height:auto !important/);
  assert.match(header,/padding:12px 14px 10px !important/);
  assert.match(header,/grid-template-columns:44px 40px minmax\(0,1fr\)/);
  const back=getRule('#videoLessonView.ed-web-video-polished #videoLessonBack');
  assert.match(back,/width:44px !important/);
  assert.match(back,/height:44px !important/);
  assert.match(back,/margin-top:0 !important/);
  assert.match(getRule('#videoLessonView.ed-web-video-polished .video-lesson-content'),/padding-top:12px !important/);
  assert.ok(!block.includes('font-size:'),'nenhum texto reduzido');
  assert.ok(!block.includes('transform:'),'sem zoom ou escala');
});
test('[web] V111.81 — pratica guiada libera area util sem cobrir status ou cortar rolagem',()=>{
  const ix=css.indexOf('V111.81 — SOMENTE WEB');
  const block=css.slice(ix);
  assert.ok(block.includes('#phoneScreen #guidedPracticeView .guided-surface'));
  assert.ok(block.includes('padding-top:36px !important'));
  assert.ok(block.includes('padding-bottom:max(30px, env(safe-area-inset-bottom,0px)) !important'));
  assert.ok(block.includes('grid-template-columns:44px minmax(0,1fr) !important'));
  assert.ok(block.includes('margin-bottom:10px !important'));
  assert.ok(block.includes('min-height:44px !important'));
  assert.match(css,/html\[data-educa-platform="web"\]\.a11y-text-large/);
  assert.match(css,/html\[data-educa-platform="web"\]\.a11y-text-extra/);
});
