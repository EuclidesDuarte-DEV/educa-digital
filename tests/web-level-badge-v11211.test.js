import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync('public/html/index.html','utf8');
const css=readFileSync('public/static/css/web-level-badge-v11211.css','utf8');
const core=readFileSync('public/static/channels/web/gamification-v11182.js','utf8');
const channel=readFileSync('public/static/channels/web/overrides.css','utf8');

test('V112.11: indicador pequeno apenas no cabeçalho Web, cache próprio',()=>{
 assert.match(html,/web-level-badge-v11211\.css\?v=11211/);
 assert.match(css,/html\[data-educa-platform="web"\] #learningView \.learning-header \.ed-modo-level-badge/g);
 assert.match(css,/height: 29px !important/);
 assert.match(css,/width: 15px !important/);
 assert.match(css,/font-size: 11px !important/);
 assert.doesNotMatch(css,/\b(?:#freeSummaryView|#freeVideoView|#modulePathView)\b/);
});
test('V112.11: acessibilidade de toque, texto grande e navegação preservadas',()=>{
 assert.match(css,/\.ed-modo-level-badge::before/);
 assert.match(css,/inset: -7px -5px/);
 assert.match(css,/a11y-text-extra/);
 assert.match(css,/height: 32px !important/);
 assert.match(core,/badge\.setAttribute\('aria-label','Meu nível no Modo Livre:/);
 assert.match(core,/badge\.addEventListener\('click',progressView\)/);
 assert.match(core,/function credit\(delta\)/);
 assert.match(channel,/\.ed-modo-level-badge:focus-visible/);
});
