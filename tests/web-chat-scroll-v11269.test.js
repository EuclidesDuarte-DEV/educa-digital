import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const js=readFileSync('public/static/js/free-mode.js','utf8');
const css=readFileSync('public/static/css/web-chat-photo-scroll-v11215.css','utf8');
const touch=readFileSync('public/static/js/web-touch-recovery-v11220.js','utf8');
const from=js.indexOf('function chatNearBottom('),to=js.indexOf('function renderBubble(',from);
const c=vm.createContext({});
vm.runInContext(js.slice(from,to),c);
test('V112.69: só respostas repetidas do contato são suprimidas',()=>{
 const history=[{role:'assistant',content:'Bom dia! Tudo bem?'},{role:'user',content:'Outra resposta.'}];
 assert.equal(c.repeatedWhatsAppReply(' BOM DIA, tudo bem! ',history),true);
 assert.equal(c.repeatedWhatsAppReply('Outra resposta.',history),false);
 assert.equal(c.repeatedWhatsAppReply('Até amanhã.',history),false);
 assert.equal(c.repeatedWhatsAppReply('',history),false);
});
test('V112.69: leitura anterior não pula para a última mensagem',()=>{
 const panel={scrollHeight:1000,clientHeight:300,scrollTop:200};
 assert.equal(c.chatNearBottom(panel),false);
 c.followChat(panel,false);assert.equal(panel.scrollTop,200);
 panel.scrollTop=680;assert.equal(c.chatNearBottom(panel),true);
 c.followChat(panel,true);assert.equal(panel.scrollTop,1000);
 assert.match(js,/if\(!ownsRequest\|\|!state.active/);
});
test('V112.69: região de rolagem tem altura limitada e gesto não vira clique',()=>{
 assert.match(css,/learningView\.is-active \.learning-surface \{[\s\S]*?height:100%!important;[\s\S]*?min-height:0!important;overflow-y:auto!important/);
 assert.match(css,/touch-action:pan-y!important/);
 assert.match(touch,/addEventListener\('pointermove'/);
 assert.match(touch,/addEventListener\('scroll',clear/);
});
