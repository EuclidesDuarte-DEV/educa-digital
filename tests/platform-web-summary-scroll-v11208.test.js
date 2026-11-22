import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>readFileSync(p,'utf8');
const webCss=load('public/static/channels/web/overrides.css');
const modeCss=load('public/static/css/free-mode.css');
const html=load('public/html/index.html');
const channel=load('public/static/js/platform-channel-v11160.js');
const free=load('public/static/js/free-mode.js');
const check=load('scripts/validar-summary-scroll-v11208.mjs');
const ci=load('.github/workflows/mobile-v11148.yml');

test('V112.08 — corrigir conflito de overflow APENAS no resumo Web',()=>{
 assert.match(modeCss,/\.android-view \.v106-app-screen,\.android-view \.v106-call-screen\{[^}]*overflow:hidden/);
 assert.match(webCss,/html\[data-educa-platform="web"\] #phoneScreen\s*#freeSummaryView\.android-view\.is-active > \.v106-app-screen\.v106-summary/);
 assert.match(webCss,/overflow-y:auto!important/);
 assert.match(webCss,/touch-action:pan-y!important/);
 assert.match(webCss,/overscroll-behavior-y:contain!important/);
 assert.match(webCss,/-webkit-overflow-scrolling:touch/);
 assert.match(webCss,/#freeSummaryExit/);
 assert.match(webCss,/scroll-padding-bottom:56px/);
});

test('V112.08 — invalidar cache CSS exclusivamente Web',()=>{
 assert.match(channel,/sheet\.href = base \+ 'overrides\.css\?v=' \+ version \+ \(platform === 'web' \? '&fix=11208' : ''\)/);
 assert.match(channel,/script\.src = base \+ 'overrides\.js\?v=' \+ version \+ \(platform === 'web' \? '&fix=11212' : ''\)/);
 assert.match(html,/platform-channel-v11160\.js\?v=11190&webfix=11212/);
 assert.match(html,/free-mode\.js\?v=11189[^"]*&summaryscroll=11208/);
 assert.match(free,/function pauseSummaryTransition\(\)/);
 assert.match(free,/visible\(\)!=='free-summary'/);
 assert.match(free,/const summaryScroller=\$\('#freeSummaryView \.v106-summary'\)/);
 assert.match(free,/\['wheel','touchstart','pointerdown','keydown'\]/);
 assert.match(free,/Avanço automático pausado para você ler/);
 assert.match(html,/id="freeSummaryExit">Sair do Modo Livre/);
});

test('V112.08 — browser teste rolagem real, zoom, último botão em viewport normal',()=>{
 assert.match(check,/page\.mouse\.wheel\(0,950\)/);
 assert.match(check,/afterWheel>8/);
 assert.match(check,/bottom\.buttonBottom<=bottom\.panelBottom-8/);
 assert.match(check,/width:320,height:640,font:'extra'/);
 assert.match(check,/width:390,height:844,font:'normal'/);
 assert.match(check,/width:1366,height:768,font:'normal'/);
 assert.match(ci,/validar-summary-scroll-v11208\.mjs/);
});
