import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const free=readFileSync('public/static/js/free-mode.js','utf8');
const html=readFileSync('public/html/index.html','utf8');
const orderDeclarations=[
  'SCRIPTED_ORDER','WEB_SCRIPTED_ORDER','BONUS_ORDER','WEB_BONUS_ORDER'
].map(key=>{
  const prefix='const '+key+'=';
  const start=free.indexOf(prefix);
  assert.ok(start>=0,key+' not declared');
  const end=free.indexOf(';',start);
  assert.ok(end>start,key+' declaration malformed');
  return free.slice(start,end+1);
}).join('\n');
const first=free.indexOf('function nextScriptedScenario(){');
const last=free.indexOf('\nfunction chooseScenario()',first);
assert.ok(first>=0&&last>first);

function next(web,completed=[]){
 const byId=Object.fromEntries(['family','family-photo','video','bank','sms-delivery','relative','call-tech'].map(id=>[id,{id}]));
 const state={completedSteps:new Set(completed)};
 const sandbox={byId,state,isWebTraining:()=>web};
 return runInNewContext(orderDeclarations+'\n'+free.slice(first,last)+'\nnextScriptedScenario',sandbox)()?.id;
}

test('V112.13 — Web inicia com foto do falso familiar e depois a LIA em videochamada',()=>{
 assert.equal(next(true),'family-photo');
 assert.equal(next(true,['family-photo']),'video');
 assert.equal(next(true,['family-photo','video']),'bank');
 assert.equal(next(true,['family-photo','video','bank']),'sms-delivery');
 assert.equal(next(true,['family-photo','video','bank','sms-delivery']),'relative');
 assert.equal(next(true,['family-photo','video','bank','sms-delivery','relative']),'call-tech');
 assert.match(free,/Próximo: videochamada com a LIA/);
 assert.match(free,/\['family','family-photo'\]\.includes\(s\.id\)&&next\?\.id==='video'/);
 assert.match(free,/if\(next\?\.id==='video'\)\{[\s\S]*?video\(\)\.incoming\(next\)/);
 assert.match(html,/free-mode\.js\?[^"]*&familyphoto=11212&flow=11213/);
});
test('V112.13 — Android e iOS preservam família antiga como primeiro desafio',()=>{
 assert.equal(next(false),'family');
 assert.equal(next(false,['family']),'video');
 assert.equal(next(false,['family','video']),'bank');
 assert.equal(next(false,['family','video','bank']),'sms-delivery');
 assert.match(free,/const SCRIPTED_ORDER=Object\.freeze\(\['family','video','bank'\]\)/);
});
