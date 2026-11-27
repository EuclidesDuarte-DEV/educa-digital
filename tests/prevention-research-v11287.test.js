import test from 'node:test';
import assert from 'node:assert/strict';
import {PREVENTION_SOURCES,sourceFingerprint,refreshPreventionSources,preventionResearchStatus,preventionTip} from '../src/lia-prevention-research-v11287.js';
test('V112.87: fixed official HTTPS sources',()=>{
 const hosts=new Set(['cartilha.cert.br','www.bcb.gov.br','www.gov.br']);
 for(const item of PREVENTION_SOURCES){const url=new URL(item.url);assert.equal(url.protocol,'https:');assert.ok(hosts.has(url.hostname));}
});
test('V112.87: preview and disabled monitor never access the network or database',async()=>{
 const fetcher=()=>{throw Error('unexpected fetch');};
 for(const env of [{},{LIA_PREVENTION_RESEARCH:'true',PREVIEW_DB_BOOTSTRAP:'true',DB:{}}]){
  assert.deepEqual(await refreshPreventionSources(env,{fetcher}),{enabled:false,checked:0,changed:0,errors:0});
 }
});
test('V112.87: only fingerprint retained, same response hashes identically',async()=>{
 const make=body=>async()=>new Response(body,{headers:{'Content-Type':'text/html'}});
 const a=await sourceFingerprint(PREVENTION_SOURCES[0].url,make('<p>Prevenção</p>'));
 const b=await sourceFingerprint(PREVENTION_SOURCES[0].url,make('<p>Prevenção</p>'));
 const c=await sourceFingerprint(PREVENTION_SOURCES[0].url,make('<p>Atualização</p>'));
 assert.match(a,/^[a-f0-9]{64}$/);assert.equal(a,b);assert.notEqual(a,c);
});
test('V112.87: new source changes produce private drafts only, never raw HTML or model calls',async()=>{
 const writes=[],fingerprints=new Map();
 const db={prepare(q){return {run:async()=>{},bind(...args){return {first:async()=>fingerprints.has(args[0])?{fingerprint:fingerprints.get(args[0])}:null,run:async()=>{writes.push({q,args});if(q.includes('INSERT INTO lia_prevention_source_checks'))fingerprints.set(args[0],args[1]);}};}};}};
 const env={DB:db,LIA_PREVENTION_RESEARCH:'true',AI:{run(){throw Error('unexpected model call');}}};
 const fetcher=async()=>new Response('<p>UNTRUSTED_SOURCE_CONTENT</p>',{headers:{'Content-Type':'text/html'}});
 const first=await refreshPreventionSources(env,{fetcher});assert.equal(first.changed,PREVENTION_SOURCES.length);assert.equal(first.errors,0);
 const drafts=writes.filter(x=>x.q.includes('lia_kb_nodes'));
 assert.equal(drafts.length,PREVENTION_SOURCES.length);
 for(const draft of drafts){assert.match(draft.q,/'draft','private'/);assert.ok(!JSON.stringify(draft.args).includes('UNTRUSTED_SOURCE_CONTENT'));}
 const second=await refreshPreventionSources(env,{fetcher});assert.equal(second.changed,0);
});

test('V112.87: public prevention tips are curated and do not accept external text',()=>{
 for(const scenario of ['video','family-photo','bank','unknown','__proto__']){
  const tip=preventionTip(scenario);
  assert.ok(tip.text.length>10&&tip.text.length<=240);
  assert.ok(tip.source.startsWith('https://'));
 }
 assert.equal(preventionTip('unknown'),preventionTip('default'));
});
test('V112.87: research status indicates no successful checks before initial run',async()=>{
 const status=await preventionResearchStatus({LIA_PREVENTION_RESEARCH:'true'});
 assert.equal(status.interval_hours,6);
 assert.equal(status.last_check,null);
 assert.equal(status.checked_sources,0);
});
