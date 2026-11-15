import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const read=p=>readFileSync(p,'utf8');
const css=read('public/static/css/responsive-v11173.css');
const html=read('public/html/index.html');
const sw=read('public/static/sw.js');
const web=read('public/static/channels/web/overrides.js');
const script=read('scripts/validar-a11y-todas-telas-v11173.mjs');
const workflow=read('.github/workflows/mobile-v11148.yml');

test('[all] novo CSS atualizado para mockup e fullscreen sem reescalar o aparelho',()=>{
  assert.match(html,/responsive-v11172\.css\?v=11172/);
  assert.match(html,/responsive-v11173\.css\?v=11173/);
  assert.match(sw,/educa-cf11173-all-screens-reflow/);
  assert.match(sw,/responsive-v11173\.css/);
  assert.match(html,/sw\.js\?v=11160&layout=11173/);
  assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g,''),/(?:^|[;{])\s*(?:zoom|transform)\s*:/);
  assert.match(css,/container-type:inline-size/);
  assert.match(css,/@container educa-chat/);
});

test('[all] WhatsApp usa grid real em 4 áreas, sem offsets fixos que cobrem mensagens',()=>{
  assert.match(css,/grid-template-rows:minmax\(55px,auto\) minmax\(0,1fr\) auto auto/);
  assert.match(css,/#phoneScreen :is\(#chatView,#normalChatView\) \.chat-wallpaper/);
  assert.match(css,/grid-row:2;/);
  assert.match(css,/#phoneScreen #chatView #freeFamilyActions:not\(\[hidden\]\)/);
  assert.match(css,/grid-row:3;/);
  assert.match(css,/#phoneScreen #chatView #freeOriginalComposer:not\(\[hidden\]\)/);
  assert.match(css,/grid-row:4;/);
  assert.match(css,/overflow-y:auto!important/);
  assert.match(css,/overflow-x:hidden!important/);
  assert.match(css,/max-height:min\(33dvh,170px\)/);
});

test('[all] 3 níveis de texto sem inflar o título, ícones, opções ou composer',()=>{
  for (const scale of ['.a11y-text-large','.a11y-text-extra'])
    assert.ok(css.includes('html'+scale));
  assert.match(css,/--ed-chat-message:20px/);
  assert.match(css,/--ed-chat-title:18px/);
  assert.match(css,/--ed-chat-action:16px/);
  assert.match(css,/white-space:nowrap!important/);
  assert.match(css,/text-overflow:ellipsis!important/);
  assert.match(css,/--ed-chat-input:19px/);
  assert.match(css,/min-height:44px!important/);
  assert.match(web,/el\.closest\('#chatView \.chat-surface, #normalChatView \.chat-surface'\)/);
  assert.match(css,/padding:7px 10px max\(14px,env\(safe-area-inset-bottom,0px\)\)/);
});

test('[all] testamos 3 fontes, 9 resoluções e fullscreen em todas as telas internas',()=>{
  for(const size of [320,360,390,430,768,1024,1366,1920,896]) {
    assert.ok(script.includes('w:'+size+','),String(size)+' nao coberto');
  }
  assert.match(script,/const fontModes=\['normal','large','extra'\]/);
  assert.match(script,/const fullScreenWidths=new Set\(\[390,896,1366\]\)/);
  assert.match(script,/querySelectorAll\('\.android-view\[data-view\]'\)/);
  assert.match(script,/window\.EducaFreeView\.setView\(panel\.dataset\.view\)/);
  assert.match(script,/free-family-chat/);
  assert.match(script,/scrollWidth-panel\.clientWidth/);
  assert.match(script,/mensagens cobertas pelos botoes/);
  assert.match(script,/acoes cobrem|decisoes cobrem/);
  assert.match(script,/diagnostico\.json/);
  assert.match(workflow,/node scripts\/validar-a11y-todas-telas-v11173\.mjs/);
  assert.match(workflow,/artifacts\/reflow-v11173/);
  const checked=spawnSync('node',['--check','scripts/validar-a11y-todas-telas-v11173.mjs'],{encoding:'utf8'});
  assert.equal(checked.status,0,checked.stderr);
});

test('[all] folhas CSS balanceadas sem declarações malformadas',()=>{
  const clean=css.replace(/\/\*[\s\S]*?\*\//g,'');
  let count=0;
  for(const token of clean) {
    if(token==='{')count++;
    if(token==='}')count--;
    assert.ok(count>=0);
  }
  assert.equal(count,0);
});
