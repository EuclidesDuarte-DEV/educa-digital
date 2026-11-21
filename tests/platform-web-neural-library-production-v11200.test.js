import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 populateReviewedNeuralLibrary,VERIFIED_LIBRARY_IDS
} from '../src/lia-neural-library-v11200.js';
import {LIA_NEURAL_SEEDS,LIA_NEURAL_SEED_LINKS} from '../src/lia-neural-seeds.js';
import {LIA_NEURAL_RESEARCH_2026,LIA_NEURAL_RESEARCH_LINKS} from '../src/lia-neural-research-2026.js';

function stubD1(){
 const notes=new Map(),links=new Map(),markers=new Set(),statements=[];
 const db={
  notes,links,markers,statements,
  prepare(query){
   const stmt=(args=[])=>({
    bind(...params){return stmt(params)},
    async first(){
     statements.push({query,args,read:true});
     if(query.includes('lia_kb_bootstrap_jobs')&&query.startsWith('SELECT'))return markers.has(args[0])?{key:args[0]}:null;
     return null;
    },
    async run(){
     statements.push({query,args});
     if(query.startsWith('INSERT OR IGNORE INTO lia_kb_nodes')){
      const [id,title,category,project,summary,content,keywords,source,status,visibility]=args;
      if(!notes.has(id))notes.set(id,{id,title,category,project,summary,content,keywords,source,status,visibility});
      return {success:true,meta:{changes:1}};
     }
     if(query.startsWith('INSERT OR IGNORE INTO lia_kb_links')){
      const [id,source_id,target_id,relation]=args;
      if(!links.has(id))links.set(id,{id,source_id,target_id,relation});
      return {success:true,meta:{changes:1}};
     }
     if(query.startsWith("UPDATE lia_kb_nodes SET status='published'")){
      const [id,source,content]=args,n=notes.get(id);
      if(n&&n.status==='draft'&&n.visibility==='private'&&n.source===source&&n.content===content){
       n.status='published';n.visibility='public';
       return {success:true,meta:{changes:1}};
      }
      return {success:true,meta:{changes:0}};
     }
     if(query.startsWith('INSERT OR IGNORE INTO lia_kb_bootstrap_jobs'))markers.add(args[0]);
     return {success:true,meta:{changes:1}};
    }
   });
   return stmt();
  },
  async batch(items){for(const item of items)await item.run();}
 };
 return db;
}
const envFor=(db,enabled=true)=>({DB:db,LIA_NEURAL_LIBRARY_BOOTSTRAP:enabled?'true':'false'});

test('V112.00 — sem flag não modifica produção nem preview',async()=>{
 const db=stubD1();
 assert.deepEqual(await populateReviewedNeuralLibrary(envFor(db,false)),{enabled:false});
 assert.equal(db.statements.length,0);
});
test('V112.00 — importa 31 rascunhos e links em D1 e aprova só cinco notas verificadas',async()=>{
 const db=stubD1();
 // Os quatro itens oficiais existentes já eram publicados na produção.
 for(const id of ['verified-bc-pix','verified-bc-bank','verified-bc-family','verified-cert-sms']){
  db.notes.set(id,{id,status:'published',visibility:'public',category:'conhecimento',title:id});
 }
 const done=await populateReviewedNeuralLibrary(envFor(db));
 assert.equal(done.enabled,true);
 assert.equal(done.imported_candidates,31);
 assert.equal(done.relations,48);
 assert.equal(done.reviewed,5);
 assert.equal(done.released,5);
 assert.equal(db.notes.size,35);
 assert.equal(db.links.size,48);
 assert.equal([...db.notes.values()].filter(x=>x.status==='published'&&x.visibility==='public').length,9);
 assert.equal([...db.notes.values()].filter(x=>x.category==='memoria'&&x.visibility==='public').length,0);
 assert.equal([...db.notes.values()].filter(x=>x.category==='aprendizado'&&x.visibility==='public').length,0);
 assert.equal(db.notes.get('research-qr-falso-2026').status,'draft');
 assert.equal(db.notes.get('research-qr-falso-2026').visibility,'private');
 assert.equal(db.markers.size,1);
 assert.equal(VERIFIED_LIBRARY_IDS.length,5);
});
test('V112.00 — opera idempotentemente sem apagar nada nem duplicar links',async()=>{
 const db=stubD1(),env=envFor(db);
 await populateReviewedNeuralLibrary(env);
 const first=db.statements.length;
 const again=await populateReviewedNeuralLibrary(env);
 assert.ok(again.enabled);
 assert.equal(db.statements.length,first);
 assert.equal(db.notes.size,31);
 assert.equal(db.links.size,48);
 assert.ok(!db.statements.some(x=>/DELETE FROM|DROP TABLE/i.test(x.query)));
});
test('V112.00 — preserva alterações feitas pelo administrador, sem autopublicar texto modificado',async()=>{
 const db=stubD1(),item=LIA_NEURAL_RESEARCH_2026.find(x=>x.id==='research-central-2026');
 db.notes.set(item.id,{...item,content:'Texto privado revisado manualmente.',status:'draft',visibility:'private'});
 await populateReviewedNeuralLibrary(envFor(db));
 assert.equal(db.notes.get(item.id).status,'draft');
 assert.equal(db.notes.get(item.id).content,'Texto privado revisado manualmente.');
});
test('V112.00 — não reexecuta uma migração já marcada no D1',async()=>{
 const db=stubD1();db.markers.add('neural-full-library-v11200');
 const status=await populateReviewedNeuralLibrary(envFor(db));
 assert.equal(status.already_prepared,true);
 assert.equal(db.notes.size,0);
});
test('V112.00 — importação executa no diagnóstico e nunca bloqueia vídeo/chats',()=>{
 const worker=readFileSync('src/worker.js','utf8');
 const toml=readFileSync('wrangler.toml','utf8');
 const neural=readFileSync('src/lia-neural.js','utf8');
 assert.match(worker,/url\.pathname==='\/api\/lia\/neural\/health'\)\s*await populateReviewedNeuralLibrary\(env\)/);
 assert.equal((toml.match(/LIA_NEURAL_LIBRARY_BOOTSTRAP = "true"/g)||[]).length,2);
 assert.match(neural,/library_bootstrapped/);
 assert.match(neural,/node_count/);
 assert.match(neural,/link_count/);
 assert.equal(LIA_NEURAL_SEEDS.length,15);
 assert.equal(LIA_NEURAL_RESEARCH_2026.length,16);
 assert.equal(LIA_NEURAL_SEED_LINKS.length,19);
 assert.equal(LIA_NEURAL_RESEARCH_LINKS.length,24);
});
