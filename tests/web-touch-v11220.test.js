import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync('public/html/index.html','utf8');
const js=readFileSync('public/static/js/web-touch-recovery-v11220.js','utf8');
const css=readFileSync('public/static/css/web-call-touch-light-v11220.css','utf8');
const audit=readFileSync('scripts/diagnosticar-toques-web-v11220.mjs','utf8');
const workflow=readFileSync('.github/workflows/web-apps-v11216.yml','utf8');
test('V112.20: recuperação touch válida e somente Web, sem tráfego ou dados pessoais',()=>{
 assert.doesNotThrow(()=>new vm.Script(js));
 assert.match(js,/dataset\.educaPlatform!=='web'/);
 assert.match(js,/pointerdown/);assert.match(js,/pointerup/);assert.match(js,/pointercancel/);
 assert.match(js,/e\.pointerType!=='touch'/);
 assert.match(js,/e\.isTrusted/);
 assert.match(js,/g\.clicked/);
 assert.match(js,/g\.el\.click\(\)/);
 assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|localStorage|sessionStorage|PaymentRequest|navigator\.contacts/);
});
test('V112.20: chamada clara e controles ao alcance de dedos independente do tema do sistema',()=>{
 assert.match(css,/html\[data-educa-platform="web"\]/);
 assert.match(css,/#freeCallView \.v106-call-screen\{/);
 assert.match(css,/#freeCallView \.v106-call-buttons button\{/);
 assert.match(css,/touch-action:manipulation!important/);
 assert.match(css,/min-height:48px!important/);
 assert.match(css,/color-scheme:light!important/);
 assert.doesNotMatch(css,/html\[data-educa-platform="(android|ios)"\]/);
});
test('V112.20: cache atualizado, assets no fim e controles acessíveis',()=>{
 const previous=html.indexOf('web-light-youtube-maps-agenda-v11219.css?v=11219');
 const next=html.indexOf('web-call-touch-light-v11220.css?v=11220');
 assert.ok(previous>=0&&next>previous&&next<html.indexOf('</head>'));
 const src=html.indexOf('web-touch-recovery-v11220.js?v=11220');
 assert.ok(src>html.indexOf('web-more-apps-v11219.js?v=11221'));
 assert.ok(src<html.indexOf('</body>'));
});
test('V112.20: testes reais com Safari WebKit, scroll e recuperação',()=>{
 assert.match(workflow,/EDUCA_BROWSER=webkit node scripts\/diagnosticar-toques-web-v11220\.mjs/);
 assert.match(workflow,/image: mcr\.microsoft\.com\/playwright:v1\.56\.1-noble/);
 assert.match(workflow,/test -d \/ms-playwright/);
 assert.match(workflow,/playwright@1\.56\.1/);
 assert.match(workflow,/web-touch-v11220\.test\.js/);
 assert.match(audit,/DIAG_JOURNEY_CALL/);
 assert.match(audit,/DIAG_FALLBACK_ANSWER/);
 assert.match(audit,/scrollIntoViewIfNeeded/);
 assert.match(audit,/pointerup/);
});
