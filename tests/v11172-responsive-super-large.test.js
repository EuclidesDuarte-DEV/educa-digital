import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(path,'utf8');
const css=read('public/static/css/responsive-v11172.css');
const html=read('public/html/index.html');
const sw=read('public/static/sw.js');
const training=read('public/static/js/training.js');
const web=read('public/static/channels/web/overrides.js');
const workflow=read('.github/workflows/mobile-v11148.yml');
const browser=read('scripts/validar-reflow-v11172.mjs');

test('[all] css real carregado por web, Android e iOS com cache PWA renovado',()=>{
  assert.match(html,/responsive-v11172\.css\?v=11172/);
  assert.match(html,/training\.js\?v=11155&layout=11172/);
  assert.match(sw,/educa-cf1117(?:2-responsive-text-reflow|3-all-screens-reflow)/);
  assert.match(sw,/responsive-v11172\.css/);
  assert.match(html,/sw\.js\?v=11160&layout=1117(?:2|3)/);
  const declarations=css.replace(/\/\*[\s\S]*?\*\//g,'');
  assert.doesNotMatch(declarations,/\bzoom\s*:|transform\s*:\s*scale/);
  assert.match(css,/#phoneScreen \.bank-app\.bank-sub-screen/);
  assert.match(css,/#phoneScreen #successView/);
});

test('[all] header do Pix cresce e conteudo usa um unico scroller, sem altura fixa',()=>{
  assert.match(css,/bank-sub-screen > \.bank-sub-header/);
  assert.match(css,/height:auto!important/);
  assert.match(css,/grid-template-columns:36px minmax\(0,1fr\) 28px/);
  assert.match(css,/bank-sub-screen > \.bank-content/);
  assert.match(css,/flex:1 1 0%!important/);
  assert.match(css,/overflow-y:auto!important/);
  assert.match(css,/overflow:hidden!important/);
  assert.match(css,/#bankReviewView \.bank-review-card > div/);
  assert.match(css,/grid-template-columns:minmax\(0,\.85fr\) minmax\(0,1\.15fr\)/);
  assert.match(css,/#bankReviewOptions,#bankScamOptions/);
  assert.match(css,/min-height:54px!important/);
});

test('[all] tela muito bem e rolavel, com conteudo e botoes no fluxo',()=>{
  assert.match(css,/#successView \.success-screen\.lesson-success-screen/);
  assert.match(css,/justify-content:flex-start!important/);
  assert.match(css,/overflow-y:auto!important/);
  assert.match(css,/#successView #successTitle/);
  assert.match(css,/font-size:clamp\(27px,calc\(26px \* var\(--ed-font-factor,1\)\),41px\)/);
  assert.match(css,/#successView #successText/);
  assert.match(css,/#successView #successLearned/);
  assert.match(css,/#successView \.lesson-success-actions/);
  assert.match(css,/position:static!important/);
  assert.match(css,/scroll-padding-block:16px 32px/);
});

test('[all] guia continua funcional e some ao inves de cobrir pergunta ou botoes',()=>{
  assert.match(training,/target\.matches\('#bankReviewOptions, #bankScamOptions'\)/);
  assert.match(training,/guidePointer\.style\.visibility = 'hidden';/);
  assert.match(training,/if \(fitsAbove\) pointerTop = above;/);
  assert.match(training,/if \(fitsAbove \|\| fitsBelow\) guidePointer\.classList\.remove\('no-guide-arrow'\)/);
  assert.match(training,/guidePointer\.style\.visibility = '';/);
  assert.match(web,/if \(el\.id === 'successTitle' \|\| el\.id === 'successText'\) return false;/);
  assert.match(training,/function positionGuideOnTarget\(/);
  assert.match(training,/\$\$\('\.guide-target'\)\.forEach/);
  assert.match(training,/function revealGuideTarget\(/);
});

test('[all] validacao em navegador cobre 9 larguras, 2 modos e demais telas',()=>{
  for(const n of [320,360,390,430,768,1024,1366,1920,896]) assert.match(browser,new RegExp('(?:width:|,)'+n+'(?:,|\\})'));
  assert.match(browser,/\['normal','extra'\]/);
  assert.match(browser,/setView\('bank-review'\)/);
  assert.match(browser,/setView\('bank-security'\)/);
  assert.match(browser,/setView\('success'\)/);
  assert.match(browser,/setView\('learning'\)/);
  assert.match(browser,/scrollWidth/);
  assert.match(browser,/artifacts\/reflow-v11172/);
  assert.match(workflow,/node scripts\/validar-reflow-v11172\.mjs/);
  assert.match(workflow,/artifacts\/reflow-v11172/);
});

test('[all] folhas CSS em equilibrio de chaves',()=>{
  const withoutComments=css.replace(/\/\*[\s\S]*?\*\//g,'');
  let depth=0;
  for(const ch of withoutComments){if(ch==='{')depth++;if(ch==='}')depth--;assert.ok(depth>=0,'chave fecha antes de abrir');}
  assert.equal(depth,0,'bloco CSS nao fechado');
});
