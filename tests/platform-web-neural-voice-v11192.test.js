import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {neuralReadiness} from '../src/lia-neural.js';

const browser=readFileSync('public/static/js/lia-kokoro-browser.js','utf8');
const video=readFileSync('public/static/js/free-video.js','utf8');
const worker=readFileSync('src/worker.js','utf8');
const html=readFileSync('public/html/index.html','utf8');

function fakeD1({migrated=true,count=0}={}){
  return {
    prepare(sql){return {
      bind(){return {
        first:async()=>sql.includes('sqlite_master')
          ?migrated?{name:'lia_kb_nodes'}:null:{total:count}
      };}
    };}
  };
}

test('V111.92 — Neural expõe diagnóstico sem conteúdo privado e não confunde Preview com publicação',async()=>{
  const disconnected=await neuralReadiness({});
  assert.equal(disconnected.reason,'DB_MISSING');
  assert.equal(disconnected.rag_active,false);
  assert.equal((await neuralReadiness({DB:fakeD1({migrated:false})})).reason,'SCHEMA_REQUIRED');
  const privateOnly=await neuralReadiness({DB:fakeD1({count:0}),AI:{run(){}}});
  assert.equal(privateOnly.schema_ready,true);
  assert.equal(privateOnly.reason,'REVIEW_REQUIRED');
  assert.equal(privateOnly.rag_active,false);
  const withoutAI=await neuralReadiness({DB:fakeD1({count:2})});
  assert.equal(withoutAI.reason,'AI_UNAVAILABLE');
  assert.equal(withoutAI.published_count,2);
  const live=await neuralReadiness({DB:fakeD1({count:2}),AI:{run(){}}});
  assert.equal(live.reason,'READY');
  assert.equal(live.rag_active,true);
  assert.equal(live.platform,'web');
  assert.doesNotMatch(JSON.stringify(live),/token|authorization|content|private|password/i);
});

function runPrewarm(platform='web',cached=false,busy=false){
 const first=browser.indexOf('function prewarmIntro(){');
 const last=browser.indexOf('function setDevice(value){',first);
 assert.ok(first>=0&&last>first);
 const synthesized=[];
 const context={
  document:{documentElement:{dataset:{educaPlatform:platform}}},
  prepare:()=>Promise.resolve(true),hasCachedIntro:async()=>cached,
  requests:{size:busy?1:0},inFlight:{size:0},
  synthesize:(text,style)=>{synthesized.push({text,style});return Promise.resolve(true);},
  Promise
 };
 const prewarm=vm.runInNewContext('let introPending=null;'+browser.slice(first,last)+';prewarmIntro;',context);
 return {prewarm,synthesized};
}
test('V111.92 — Web prepara a primeira fala pf_dora fixa sem salvar resposta do aluno',async()=>{
 const web=runPrewarm();
 await web.prewarm();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(web.synthesized.length,1);
 assert.deepEqual({...web.synthesized[0]},{text:'Oi, sou a Lia.',style:'natural'});
 const cached=runPrewarm('web',true);
 await cached.prewarm();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(cached.synthesized.length,0);
 const busy=runPrewarm('web',false,true);
 await busy.prewarm();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(busy.synthesized.length,0);
});
test('V111.92 — Android e iOS não recebem pré-síntese Web',async()=>{
 for(const platform of ['android','ios']){
  const s=runPrewarm(platform);
  await s.prewarm();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(s.synthesized.length,0,platform);
 }
});
test('V111.92 — voz feminina contínua na Web quando o Kokoro ainda está frio',()=>{
 assert.match(video,/const continuousFemale=web&&!session\.renderReady/);
 assert.match(video,/continuousFemale\?\[whole\]:speechSegments\(whole\)/);
 assert.match(video,/!whole\.startsWith\('Oi, sou a Lia\.'\)/);
 assert.match(video,/web\?66:95/);
 assert.match(html,/lia-kokoro-browser\.js\?v=11157&mirror=2&warm=11191&intro=11192/);
 assert.match(html,/free-video\.js\?v=11191&patch=11191&natural=11192/);
});
test('V111.92 — diagnóstico é GET e notas privadas não entram no endpoint',()=>{
 assert.match(worker,/metodo === 'GET' && rota === '\/api\/lia\/neural\/health'/);
 assert.match(worker,/return responder\(\{ok:true,\.\.\.await neuralReadiness\(env\)\}\)/);
 const neural=readFileSync('src/lia-neural.js','utf8');
 assert.match(neural,/status='published' AND visibility='public' AND category<>'memoria'/);
 assert.match(neural,/const remembered=webOnly\?await retrieveLiaKnowledge|export async function retrieveLiaKnowledge/);
});
