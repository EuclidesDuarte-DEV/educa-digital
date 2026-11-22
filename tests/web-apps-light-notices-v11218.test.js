import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const index=readFileSync('public/html/index.html','utf8');
const legacy=readFileSync('public/static/css/web-apps-v11216.css','utf8');
const css=readFileSync('public/static/css/web-apps-light-notices-v11218.css','utf8');
const script=readFileSync('scripts/validar-web-apps-light-notices-v11218.mjs','utf8');
const flow=readFileSync('.github/workflows/web-apps-v11216.yml','utf8');

test('V112.18 carregada depois dos estilos preexistentes para todas as telas Web',()=>{
  const prev=index.indexOf('/static/css/web-chat-photo-scroll-v11215.css');
  const light=index.indexOf('/static/css/web-apps-light-notices-v11218.css?v=11218');
  assert.ok(prev>=0&&light>prev,'nova folha deve vir no final do HEAD');
  assert.ok(light<index.indexOf('</head>'));
  assert.match(css,/html\[data-educa-platform="web"\]/);
  assert.doesNotMatch(css,/\[data-educa-platform="(ios|android)"\]/);
  for(const name of ['webx-photos','webx-messages','webx-gmail','webRealCameraVideo'])
    assert.match(css,new RegExp(name));
});
test('V112.18 elimina bloqueio de touch nos botoes da notificacao',()=>{
  assert.doesNotMatch(legacy,/\.free-event-notice:not\(\[hidden\]\) \*\s*\{\s*pointer-events:none/i);
  assert.match(legacy,/\.free-event-notice:not\(\[hidden\]\) button\s*\{[\s\S]*?pointer-events:auto!important/);
  assert.match(css,/#freeEventNotice\.free-event-notice:not\(\[hidden\]\)\s+:is\(#freeEventOpen,#freeEventDismiss\)/);
  assert.match(css,/pointer-events:auto!important/);
  assert.match(script,/\.tap\(/);
  assert.match(script,/EducaFreeMode\.triggerEvent\(\)/);
});
test('V112.18 validacoes em CI: toque, apps claros, escopo nativo preservado',()=>{
  assert.match(flow,/validar-web-apps-light-notices-v11218\.mjs/);
  assert.match(flow,/web-apps-light-notices-v11218\.test\.js/);
  assert.match(flow,/web-apps-light-notices-v11218\.css/);
  assert.match(script,/320,height:640/);
  assert.match(script,/390,height:844/);
  assert.match(script,/1366,height:768/);
});
