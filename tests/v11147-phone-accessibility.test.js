import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker from '../src/worker.js';
const content = path => readFileSync(path,'utf8');
const html=content('public/html/index.html');
const a11y=content('public/static/js/accessibility.js');
const responsive=content('public/static/css/responsive-v11147.css');
const training=content('public/static/js/training.js');
const guide=content('public/static/js/onboarding.js');

test('V111.47: telefone é o único campo obrigatório no cadastro principal',()=>{
 const start=html.split('<form id="quickStartForm"')[1].split('</form>')[0];
 assert.match(start,/id="quickPhone"/);
 assert.doesNotMatch(start,/id="quickName"|name="quickName"/);
 assert.match(training,/body: JSON\.stringify\(\{ phone \}\)/);
 assert.match(training,/data\.needs_login/);
});
test('V111.47: leitura automática no guia, com desligamento e sem afetar motor LIA',()=>{
 assert.match(a11y,/reading: true, configured: false/);
 assert.match(a11y,/data\.reading !== false/);
 assert.match(a11y,/educa:guide-step/);
 assert.match(guide,/dispatchEvent\(new CustomEvent\('educa:guide-step'/);
 assert.match(a11y,/pointerdown/);
 assert.match(a11y,/if \(!prefs\.reading\) return;/);
 assert.match(a11y,/stopReading\(\)/);
});
test('V111.47: zoom antigo removido, layout e contraste preservam cartões',()=>{
 assert.doesNotMatch(content('public/static/css/accessibility.css'),/body>main\{zoom:/);
 assert.match(responsive,/flex-shrink:0!important/);
 assert.match(responsive,/learning-grid\{grid-template-columns:minmax\(0,1fr\)!important/);
 assert.match(responsive,/a11y-distinct-colors/);
 assert.match(responsive,/learning-a11y-quick/);
 assert.match(html,/id="learningAccessibilityQuickBtn"/);
 assert.match(html,/responsive-v11147\.css/);
 assert.match(content('public/static/sw.js'),/educa-cf11147-phone-only-responsive-a11y/);
});
test('V111.47: API aceita novo registro só com telefone e impede retorno direto com número existente', async()=>{
 const db=new DatabaseSync(':memory:');db.exec(content('banco/schema.sql'));
 const env={DB:{prepare(sql){return {bind(...args){return {first:async()=>db.prepare(sql).get(...args)||null,run:async()=>db.prepare(sql).run(...args),all:async()=>({results:db.prepare(sql).all(...args)})}}}}},ASSETS:{fetch:async()=>new Response('ok')}};
 const call=async()=>{const r=await worker.fetch(new Request('https://example.org/api/conta',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({phone:'65999990000'})}),env);return {status:r.status,data:await r.json()}};
 const first=await call();assert.equal(first.status,201);assert.equal(first.data.existing,false);assert.equal(first.data.name,'Participante');
 const second=await call();assert.equal(second.status,409);assert.equal(second.data.needs_login,true);
 db.close();
});
