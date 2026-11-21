import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import worker from '../src/worker.js';
import {responderModoLivre} from '../src/free-chat.js';
import {
 setupNeuralDB,NEURAL_SQL,classifyTrainingTurn,saveLearningTurn,
 trainingOutcome,trainingReadiness
} from '../src/lia-neural-learning-v11196.js';

function memoryD1(){
 const queries=[],nodes=new Map(),signals=new Map(),schema=new Set();
 const db={
  queries,nodes,signals,schema,
  prepare(query){
   const make=(args=[])=>({
    bind(...values){return make(values)},
    async run(){
     queries.push({query,args});
     if(query.startsWith('CREATE TABLE IF NOT EXISTS')){
      const name=query.match(/CREATE TABLE IF NOT EXISTS\s+(\w+)/i)?.[1];
      if(name)schema.add(name);
     }
     if(query.includes('INSERT OR IGNORE INTO lia_kb_nodes')){
      const [id,title,summary,content,keywords,source]=args;
      if(!nodes.has(id))nodes.set(id,{id,title,summary,content,keywords,source,
       category:'conhecimento',status:'published',visibility:'public'});
     }
     if(query.includes('INSERT INTO lia_training_signals')){
      const [scenario,channel,kind,signal]=args,key=[scenario,channel,kind,signal].join('|');
      signals.set(key,(signals.get(key)||0)+1);
     }
     if(query.includes('INSERT INTO lia_kb_nodes')&&query.includes('learning-')){
      // No-op: the real DB uses ON CONFLICT; nodes are checked separately.
     }
     if(query.includes('Indicadores anônimos opt-in')){
      const [id,title,summary,content,keywords]=args;
      nodes.set(id,{id,title,summary,content,keywords,category:'aprendizado',
       status:'draft',visibility:'private',source:'Indicadores anônimos opt-in'});
     }
     return {success:true};
    },
    async first(){
     queries.push({query,args,read:true});
     if(query.includes('sqlite_master')){
      const name=args[0]||query.match(/name='(\w+)'/)?.[1];
      return schema.has(name)?{name}:null;
     }
     if(query.includes('COUNT(*) AS total')){
      return {total:[...nodes.values()].filter(n=>n.status==='published'&&n.visibility==='public'&&n.category!=='memoria').length};
     }
     return null;
    },
    async all(){
     queries.push({query,args,read:true});
     if(query.includes('SUM(total)')){
      return {results:['safe','unsafe'].map(signal=>({
       signal,total:[...signals.entries()].filter(([k])=>k.endsWith('|outcome|'+signal)).reduce((n,[,c])=>n+c,0)
      }))};
     }
     if(query.includes('SELECT title,substr(content'))return {results:[...nodes.values()].filter(n=>n.status==='published'&&n.visibility==='public')};
     return {results:[]};
    }
   });
   return make();
  }
 };
 return db;
}
const origin='https://educa.example';
function post(path,body,ip='192.0.2.100'){
 return new Request(origin+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':ip},body:JSON.stringify(body)});
}
test('V111.96 — schema D1 só é criado quando explicitamente habilitado',async()=>{
 const db=memoryD1();
 assert.equal(await setupNeuralDB({DB:db}),false);
 assert.equal(db.queries.length,0);
 await setupNeuralDB({DB:db,LIA_NEURAL_AUTO_SETUP:'true'});
 assert.ok(db.schema.has('lia_kb_nodes'));
 assert.ok(db.schema.has('lia_kb_links'));
 assert.ok(db.schema.has('lia_training_signals'));
 assert.equal(db.nodes.size,4,'somente quatro fontes oficiais publicadas de forma idempotente');
 assert.equal(db.nodes.get('verified-bc-pix').visibility,'public');
 assert.equal(db.nodes.get('verified-bc-pix').status,'published');
 const total=db.queries.length;
 await setupNeuralDB({DB:db,LIA_NEURAL_AUTO_SETUP:'true'});
 assert.equal(db.queries.length,total,'não repetir migração em cada requisição');
 assert.equal(NEURAL_SQL.filter(q=>q.startsWith('CREATE TABLE')).length,3);
 assert.ok(!db.queries.some(q=>/\bDROP TABLE\b|\bALTER TABLE\b/i.test(q.query)));
});
test('V111.96 — mensagens privadas não são guardadas; só sinal categórico com opt-in',async()=>{
 const db=memoryD1(),env={DB:db,LIA_NEURAL_AUTO_SETUP:'true'};
 await setupNeuralDB(env);
 const req=post('/api/modo-livre/conversar-web',{},'198.51.100.70');
 const raw='Vou confirmar com a pessoa pelo número antigo antes de fazer qualquer coisa.';
 assert.equal(await saveLearningTurn(env,req,'family',raw,false),false);
 assert.equal(db.signals.size,0);
 assert.equal(await saveLearningTurn(env,req,'family',raw,true),true);
 assert.equal(db.signals.get('family|whatsapp|turn|verify'),1);
 const writes=db.queries.filter(q=>!q.read);
 assert.ok(!writes.some(q=>JSON.stringify(q.args).includes(raw)));
 assert.equal(classifyTrainingTurn('video','Vou bloquear e desligar'),'refuse');
 assert.equal(classifyTrainingTurn('video','Quem está falando?'),'question');
});
test('V111.96 — 10 decisões agregadas criam nota rascunho privada no Neural',async()=>{
 const db=memoryD1(),env={DB:db,LIA_NEURAL_AUTO_SETUP:'true'};
 await setupNeuralDB(env);
 for(let i=0;i<10;i++){
  const r=await trainingOutcome(post('/api/lia/training/outcome',{
   consent:true,scenario:'video',outcome:i%2?'unsafe':'safe'
  },'203.0.113.24'),env);
  assert.equal(r.status,200);
 }
 const n=db.nodes.get('learning-video');
 assert.equal(n.status,'draft');assert.equal(n.visibility,'private');
 assert.match(n.content,/10 exercícios/);
 assert.match(n.source,/anônimos/);
 assert.ok(!n.content.includes('203.0.113.24'));
 assert.equal((await trainingReadiness(env)).learning_ready,true);
});
test('V111.96 — recusa sem opt-in não cria dado e origin externo é rejeitado',async()=>{
 const db=memoryD1(),env={DB:db,LIA_NEURAL_AUTO_SETUP:'true'};
 await setupNeuralDB(env);
 assert.equal((await trainingOutcome(post('/api/lia/training/outcome',{
  consent:false,scenario:'video',outcome:'safe'},'203.0.113.25'),env)).status,200);
 assert.equal(db.signals.size,0);
 const external=new Request(origin+'/api/lia/training/outcome',{method:'POST',
  headers:{Origin:'https://site-estranho.example'},body:JSON.stringify({consent:true,scenario:'video',outcome:'safe'})});
 assert.equal((await trainingOutcome(external,env)).status,403);
});
test('V111.96 — Worker ativa Neural com fontes oficiais e diagnostica RAG',async()=>{
 const db=memoryD1(),env={DB:db,LIA_NEURAL_AUTO_SETUP:'true',AI:{run:async()=>({response:'Confirme por outro canal.'})}};
 const result=await worker.fetch(new Request(origin+'/api/lia/neural/health'),env);
 assert.equal(result.status,200);
 const payload=await result.json();
 assert.equal(payload.schema_ready,true);
 assert.equal(payload.published_count,4);
 assert.equal(payload.rag_active,true);
 assert.equal(payload.learning_ready,true);
 assert.equal(payload.raw_chat_stored,false);
});
test('V111.96 — resposta Web usa conhecimento oficial e não muda canais nativos',async()=>{
 const db=memoryD1(),prompts=[],env={DB:db,LIA_NEURAL_AUTO_SETUP:'true',
  AI:{run:async(_model,payload)=>{prompts.push(payload.messages[0].content);return {response:'Confirme a identidade pelo contato antigo.'};}}};
 await setupNeuralDB(env);
 const result=await responderModoLivre(post('/api/modo-livre/conversar-web',{
   scenario:'family',message:'Oi, você mudou de número?',history:[],learningConsent:true
 },'203.0.113.40'),env,true);
 assert.equal(result.status,200);
 assert.match(prompts[0],/Referências educativas revisadas/);
 assert.match(prompts[0],/Confirme pedidos/);
 const other=await responderModoLivre(post('/api/modo-livre/conversar',{
   scenario:'family',message:'Oi, tudo bem?',history:[],learningConsent:true
 },'203.0.113.41'),env,false);
 assert.equal(other.status,200);
 assert.doesNotMatch(prompts[1],/Referências educativas revisadas/);
 assert.equal(db.signals.get('family|whatsapp|turn|question'),1);
});
test('V111.96 — Interface exige consentimento opcional e separa Web/nativo',()=>{
 const html=readFileSync('public/html/index.html','utf8');
 const mode=readFileSync('public/static/js/free-mode.js','utf8');
 const wrangler=readFileSync('wrangler.toml','utf8');
 assert.match(html,/id="freeLearningConsent"/);
 assert.match(mode,/learningConsent:state\.learningConsent===true/);
 assert.match(mode,/document\.documentElement\?\.dataset\?\.educaPlatform==='web'/);
 assert.match(mode,/\/api\/lia\/training\/outcome/);
 assert.match(wrangler,/LIA_NEURAL_AUTO_SETUP = "true"/);
 assert.match(html,/neural=11196/);
});
