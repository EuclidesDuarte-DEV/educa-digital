import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LIA_NEURAL_SEEDS,LIA_NEURAL_SEED_LINKS} from '../src/lia-neural-seeds.js';
import {LIA_NEURAL_RESEARCH_2026,LIA_NEURAL_RESEARCH_LINKS} from '../src/lia-neural-research-2026.js';

const html=readFileSync('public/static/channels/web/lia-neural-v11187.html','utf8');
const js=readFileSync('public/static/channels/web/lia-neural-v11187.js','utf8');
const css=readFileSync('public/static/channels/web/lia-neural-v11187.css','utf8');
const server=readFileSync('src/lia-neural.js','utf8');

test('V111.99 — apenas equipe autenticada pode importar base completa no D1',()=>{
  assert.match(html,/id="neuralQuickstart" hidden/);
  assert.match(html,/id="importFullKnowledge"[^>]*disabled/);
  assert.match(js,/byId\('neuralQuickstart'\)\.hidden=!live/);
  assert.match(js,/if\(!real\)return;\s*if\(!confirm\('Preparar o D1/);
  assert.match(js,/byId\('importFullKnowledge'\)\.addEventListener/);
  assert.match(js,/const button=byId\('importFullKnowledge'\)/);
  assert.match(js,/button\.disabled=true/);
  assert.match(js,/finally\{button\.disabled=false;\}/);
  // API já passa pela comparação criptográfica do secret no Worker.
  assert.match(server,/const denied=await guard\(request,env\)/);
  assert.match(server,/if\(denied\)return denied/);
  assert.match(js,/await api\('\/seed','POST',\{\}\)/);
  assert.match(js,/await api\('\/seed\/research-2026','POST',\{\}\)/);
});
test('V111.99 — base inicial e pesquisas são rascunhos e não se publicam sozinhas',()=>{
  assert.equal(LIA_NEURAL_SEEDS.length,15);
  assert.equal(LIA_NEURAL_SEED_LINKS.length,19);
  assert.equal(LIA_NEURAL_RESEARCH_2026.length,16);
  assert.equal(LIA_NEURAL_RESEARCH_LINKS.length,24);
  const all=[...LIA_NEURAL_SEEDS,...LIA_NEURAL_RESEARCH_2026];
  assert.equal(new Set(all.map(n=>n.id)).size,31);
  assert.ok(all.every(n=>n.status==='draft'&&n.visibility==='private'));
  assert.match(server,/INSERT OR IGNORE INTO lia_kb_nodes/);
  assert.match(server,/INSERT OR IGNORE INTO lia_kb_links/);
  assert.match(js,/await showReviewQueue\(\)/);
  const quickFlow=js.split("byId('importFullKnowledge').addEventListener('click',async()=>{")[1]
    .split("byId('seedBtn').addEventListener('click'")[0];
  assert.doesNotMatch(quickFlow,/\/review\/publish/);
});
test('V111.99 — contador diferencia notas D1 das realmente liberadas para a IA',()=>{
  assert.match(html,/id="publishedNodesCount"/);
  assert.match(html,/id="quickstartState"/);
  assert.match(js,/notes\.filter|nodes\.filter\(n=>n\.status==='published'/);
  assert.match(js,/aguardando revisão ou mantidas privadas/);
  assert.match(js,/out\.textContent='Biblioteca preparada:/);
});
test('V111.99 — painel não aperta botões e tem layout responsivo',()=>{
  assert.match(css,/\.editor-actions\{grid-template-columns:minmax\(0,1fr\)/);
  assert.match(css,/\.editor-actions>\*/);
  assert.match(css,/\.editor-actions #reviewQueue label input/);
  assert.match(css,/\.neural-quickstart/);
  assert.match(css,/@media\(max-width:650px\)/);
  assert.match(html,/&library=11199/);
});
