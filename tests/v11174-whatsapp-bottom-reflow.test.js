import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const read=p=>readFileSync(p,'utf8');
const css=read('public/static/css/responsive-v11174.css');
const web=read('public/static/channels/web/overrides.js');
const html=read('public/html/index.html');
const cache=read('public/static/sw.js');
const visual=read('scripts/validar-whatsapp-nav-v11174.mjs');
const workflow=read('.github/workflows/mobile-v11148.yml');

test('[all] WhatsApp V111.74 carregado apos V111.73 com cache renovado',()=>{
 assert.match(html,/responsive-v11173\.css\?v=11173/);
 assert.match(html,/responsive-v11174\.css\?v=11174/);
 assert.ok(html.indexOf('responsive-v11174.css')>html.indexOf('responsive-v11173.css'));
 assert.match(cache,/educa-cf11174-whatsapp-navigation/);
 assert.match(cache,/responsive-v11174\.css/);
 assert.match(html,/sw\.js\?v=11160&layout=11174/);
});

test('[all] lista WhatsApp tem espaço real, não max-height legado de 290px',()=>{
 assert.match(css,/#phoneScreen #whatsappView \.whatsapp-surface/);
 assert.match(css,/grid-template-rows:minmax\(51px,auto\).*minmax\(0,1fr\) 58px/);
 assert.match(css,/#phoneScreen #whatsappView \.wa-chat-list/);
 assert.match(css,/max-height:none!important/);
 assert.match(css,/overflow-y:auto!important/);
 assert.match(css,/grid-row:6;/);
 assert.match(css,/#phoneScreen #whatsappView \.whatsapp-bottom/);
 assert.match(css,/grid-row:7;/);
 assert.match(css,/position:relative!important/);
 assert.match(css,/height:58px!important/);
});

test('[all] rodape do WhatsApp mantém quatro rótulos sem quebrar palavras',()=>{
 assert.match(css,/grid-template-columns:minmax\(0,\.9fr\) minmax\(0,1\.1fr\) minmax\(0,1\.25fr\) minmax\(0,\.75fr\)/);
 assert.match(css,/#phoneScreen #whatsappView \.whatsapp-bottom small/);
 assert.match(css,/--ed-wa-nav:11px/);
 assert.match(css,/white-space:nowrap!important/);
 assert.match(css,/word-break:normal!important/);
 assert.match(css,/hyphens:none!important/);
 assert.match(css,/@container educa-wa-list/);
 assert.match(css,/font-size:9\.5px!important/);
});

test('[all] lista, buscas e avisos legíveis, sem duplicar escala de fonte na Web',()=>{
 assert.match(css,/#phoneScreen #whatsappView \.wa-chat-list \.chat-copy strong/);
 assert.match(css,/text-overflow:ellipsis!important/);
 assert.match(css,/-webkit-line-clamp:2/);
 assert.match(css,/#phoneScreen #whatsappView \.whatsapp-filters/);
 assert.match(css,/overflow-x:auto!important/);
 assert.match(css,/#phoneScreen \.free-event-notice:not\(\[hidden\]\)/);
 assert.match(css,/max-height:108px!important/);
 assert.match(css,/font-size:var\(--ed-wa-name\)!important/);
 assert.match(web,/el\.closest\('#chatView \.chat-surface, #normalChatView \.chat-surface, #whatsappView \.whatsapp-surface'\)/);
});

test('[all] auditoria visual roda em nove resoluções e tres modos de texto',()=>{
 for(const resolution of ['320,640','360,780','390,844','430,932','768,1024','1024,768','1366,768','1920,1080','896,414']) {
   assert.ok(visual.includes('['+resolution+']'),resolution);
 }
 assert.match(visual,/sizes=\['normal','large','extra'\]/);
 assert.match(visual,/fullscreen=new Set\(\[390,896,1366\]\)/);
 assert.match(visual,/listOverflowX/);
 assert.match(visual,/footerHeight/);
 assert.match(visual,/lastRowReachable/);
 assert.match(visual,/freeEventNotice/);
 assert.match(visual,/resultado\.json/);
 assert.match(workflow,/node scripts\/validar-whatsapp-nav-v11174\.mjs/);
 assert.match(workflow,/artifacts\/whatsapp-v11174/);
 const parsed=spawnSync('node',['--check','scripts/validar-whatsapp-nav-v11174.mjs'],{encoding:'utf8'});
 assert.equal(parsed.status,0,parsed.stderr);
});

test('[all] nova folha possui chaves CSS balanceadas',()=>{
 const safe=css.replace(/\/\*[\s\S]*?\*\//g,'');
 let depth=0;
 for(const char of safe) {
   if(char==='{')depth++;
   if(char==='}')depth--;
   assert.ok(depth>=0);
 }
 assert.equal(depth,0);
 assert.doesNotMatch(safe,/(?:^|[;{])\s*(?:zoom|transform)\s*:/);
});
