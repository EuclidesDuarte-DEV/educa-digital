import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const html=readFileSync('public/html/index.html','utf8');
const gmail=readFileSync('public/static/js/web-apps-v11216.js','utf8');
const css=readFileSync('public/static/css/web-gmail-light-v11217.css','utf8');
test('V112.17: Gmail claro isolado à Web e cache atualizado',()=>{
 assert.match(html,/web-gmail-light-v11217\.css\?v=11217/);
 assert.match(html,/web-apps-v11216\.js\?v=(?:11217|11221)/);
 assert.match(css,/html\[data-educa-platform="web"\] #webRealView\.webx-gmail/);
 assert.match(css,/background:#fff!important/);
 assert.match(css,/color:#202124!important/);
 assert.doesNotMatch(css,/#[\w-]*photos|#[\w-]*messages|#whatsappView/);
});
test('V112.17: busca preserva o foco em iPhone sem remontar a caixa',()=>{
 assert.match(gmail,/function filterGmailInPlace\(\)/);
 assert.match(gmail,/row\.hidden=!visible/);
 assert.match(gmail,/gmailSearch=e\.target\.value;filterGmailInPlace\(\);return/);
 assert.match(css,/\.webx-mail-row\[hidden\]/);
 assert.doesNotThrow(()=>new vm.Script(gmail));
});
test('V112.17: controles grandes, toque e acessibilidade',()=>{
 for(const x of ['.webx-mail-toolbar','.webx-mail-message','.webx-mail-drawer','.webx-mail-fab','.webx-mail-compose']){
  assert.ok(css.includes(x),x+' não foi incluído na atualização');
 }
 assert.match(css,/touch-action:manipulation/);
 assert.match(css,/min-height:44px/);
 assert.match(css,/pointer-events:none!important/);
});
