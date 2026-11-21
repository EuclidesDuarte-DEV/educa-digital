import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 TRAINING_EXAMPLES_SQL,screenDialogueExcerpt,storeTrainingExample,
 listTrainingExamples,deleteTrainingExample,examplePolicy
} from '../src/lia-training-examples-v11197.js';
import {NEURAL_SQL,trainingReadiness} from '../src/lia-neural-learning-v11196.js';
import {neuralApi} from '../src/lia-neural.js';

function fakeDb(){
 const rows=[],calls=[],schema=new Set(['lia_kb_nodes','lia_training_signals','lia_training_examples']);
 return {rows,calls,prepare(query){
  const statement=(args=[])=>({
   bind(...values){return statement(values)},
   async run(){
    calls.push({query,args});
    if(query.startsWith('INSERT INTO lia_training_examples')){
     const [id,scenario,channel,signal,participant_excerpt,character_excerpt]=args;
     rows.push({id,scenario,channel,signal,participant_excerpt,character_excerpt,
      review_state:'pending',created_at:'2026-11-20',expires_at:'2026-11-27'});
    }
    if(query.startsWith('DELETE FROM lia_training_examples WHERE id=')){
     const index=rows.findIndex(x=>x.id===args[0]);if(index>=0)rows.splice(index,1);
    }
    return {success:true};
   },
   async all(){calls.push({query,args,read:true});
    if(query.includes('FROM lia_training_examples'))return {results:rows};return {results:[]};},
   async first(){calls.push({query,args,read:true});
    if(query.includes('sqlite_master')){
     const name=query.match(/name='([^']+)'/)?.[1]||args[0];
     return schema.has(name)?{name}:null;
    }
    if(query.includes('COUNT(*)'))return {total:0};
    return null;
   }
  });return statement();
 }};
}
const req=ip=>new Request('https://educa.example/api/modo-livre/conversar-web',{
 method:'POST',headers:{Origin:'https://educa.example','CF-Connecting-IP':ip||'203.0.113.35'}
});
const sample={consent:true,scenario:'video',signal:'question',
 participant:'Quem está falando nessa chamada?',
 character:'Sou uma pessoa desconhecida na simulação. Você pode verificar comigo pelo canal antigo?'};

test('V111.97 — consentimento de estatísticas não autoriza exemplos',async()=>{
 const db=fakeDb(),env={DB:db,LIA_EXAMPLES_ENABLED:'true'};
 assert.equal(await storeTrainingExample(env,req('203.0.113.1'),{...sample,consent:false}),false);
 assert.equal(await storeTrainingExample({DB:db},req('203.0.113.2'),sample),false);
 assert.equal(db.rows.length,0);
});
test('V111.97 — registra só trecho consentido de cenário suspeito',async()=>{
 const db=fakeDb(),env={DB:db,LIA_EXAMPLES_ENABLED:'true'};
 assert.equal(await storeTrainingExample(env,req('203.0.113.3'),sample),true);
 assert.equal(db.rows.length,1);
 assert.equal(db.rows[0].scenario,'video');
 assert.equal(db.rows[0].signal,'question');
 assert.equal(db.rows[0].participant_excerpt,sample.participant);
 const args=db.calls.find(x=>x.query.includes('INSERT INTO lia_training_examples')).args;
 assert.equal(args.length,6);
 assert.ok(!JSON.stringify(args).includes('203.0.113.3'));
 assert.equal(await storeTrainingExample(env,req('203.0.113.4'),{...sample,scenario:'friend'}),false);
});
test('V111.97 — descarta links, contatos, endereços e senhas',()=>{
 for(const value of [
 'Meu nome é Ana Maria, sou de Cuiabá.',
 'Meu telefone é 65999999999.',
 'Acesse https://exemplo.com/garantia',
 'Meu CPF é 123.456.789-00',
 'Moro na rua das Flores',
 'Meu e-mail é x@exemplo.com',
 'Minha senha é 1234',
 'Meus dados bancários estão aqui'
 ])assert.equal(screenDialogueExcerpt(value),null,value);
 assert.equal(screenDialogueExcerpt('Oi, posso confirmar por outro canal?'),'Oi, posso confirmar por outro canal?');
 assert.equal(screenDialogueExcerpt('Oi '+'a'.repeat(200)),null);
});
test('V111.97 — admin pode ler e excluir; exemplos vencem após sete dias',async()=>{
 const db=fakeDb(),env={DB:db,LIA_EXAMPLES_ENABLED:'true'};
 assert.equal(await storeTrainingExample(env,req('203.0.113.5'),sample),true);
 const examples=await listTrainingExamples(env);
 assert.equal(examples.length,1);
 assert.equal(examples[0].review_state,'pending');
 assert.equal(examplePolicy().retention_days,7);
 assert.equal(examplePolicy().full_transcripts,false);
 assert.equal(examplePolicy().direct_model_training,false);
 assert.equal(await deleteTrainingExample(env,'not-an-id'),false);
 assert.equal(await deleteTrainingExample(env,examples[0].id),true);
 assert.equal((await listTrainingExamples(env)).length,0);
 assert.ok(TRAINING_EXAMPLES_SQL.some(q=>q.includes('expires_at')));
 assert.ok(TRAINING_EXAMPLES_SQL.some(q=>q.includes("+7 days")));
 assert.ok(db.calls.some(x=>x.query.includes('DELETE FROM lia_training_examples WHERE expires_at')));
});
test('V111.97 — acesso administrativo é obrigatório, mesmo para listar',async()=>{
 const url='https://educa.example/api/lia/neural/examples',db=fakeDb();
 assert.equal((await neuralApi(new Request(url),{DB:db})).status,503);
 assert.equal((await neuralApi(new Request(url),
  {DB:db,LIA_NEURAL_ADMIN_TOKEN:'admin-token-very-long-secret-value'})).status,401);
 assert.equal(db.calls.length,0);
});
test('V111.97 — Web tem consentimento separado e D1 não guarda conversa inteira',async()=>{
 const html=readFileSync('public/html/index.html','utf8'),
 free=readFileSync('public/static/js/free-mode.js','utf8'),
 chat=readFileSync('src/free-chat.js','utf8'),
 neural=readFileSync('src/lia-neural.js','utf8'),
 wrangler=readFileSync('wrangler.toml','utf8');
 assert.match(html,/id="freeLearningConsent"/);
 assert.match(html,/id="freeExampleConsent"/);
 assert.match(free,/exampleConsent:state\.exampleConsent===true/);
 assert.match(chat,/payload\?\.exampleConsent===true/);
 assert.match(chat,/storeTrainingExample/);
 assert.match(neural,/path==='\/examples'/);
 assert.match(neural,/deleteTrainingExample/);
 assert.match(wrangler,/LIA_EXAMPLES_ENABLED = "true"/);
 assert.equal(NEURAL_SQL.filter(q=>q.includes('CREATE TABLE IF NOT EXISTS lia_training_examples')).length,1);
 const status=await trainingReadiness({DB:fakeDb(),LIA_EXAMPLES_ENABLED:'true'});
 assert.equal(status.examples_ready,true);
 assert.equal(status.raw_chat_stored,false);
});
