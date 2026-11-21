import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
import {neuralApi,retrieveLiaKnowledge} from '../src/lia-neural.js';
import {responderModoLivre} from '../src/free-chat.js';
import {LIA_NEURAL_SEEDS,LIA_NEURAL_SEED_LINKS} from '../src/lia-neural-seeds.js';
import {LIA_NEURAL_RESEARCH_2026,LIA_NEURAL_RESEARCH_LINKS} from '../src/lia-neural-research-2026.js';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const TOKEN='c'.repeat(40);
const url='https://educa.example/api/lia/neural';
const request=(path='',method='GET',body=null,token=TOKEN)=>{
  const headers=token?{Authorization:'Bearer '+token}:{};
  if(body)headers['Content-Type']='application/json';
  return new Request(url+path,{method,headers,...(body?{body:JSON.stringify(body)}:{})});
};
function memoryDb(schemaReady=true){
  const notes=new Map(),links=new Map(),queries=[];
  const raw={
    prepare(query){
      const bound={
        bind(...args){
          const run=async()=>{
            queries.push({query,args});
            if(query.includes('INSERT OR IGNORE INTO lia_kb_nodes')||query.includes('INSERT INTO lia_kb_nodes')){
              const [id,title,category,project,summary,content,keywords,source,status,visibility]=args;
              if(!notes.has(id))notes.set(id,{id,title,category,project,summary,content,keywords,source,status,visibility});
              return {success:true};
            }
            if(query.includes('INSERT OR IGNORE INTO lia_kb_links')){
              const [id,source_id,target_id,relation]=args;
              if(!links.has(id))links.set(id,{id,source_id,target_id,relation});
              return {success:true};
            }
            if(query.startsWith('UPDATE lia_kb_nodes')){
              const [title,category,project,summary,content,keywords,source,status,visibility,id]=args;
              notes.set(id,{...notes.get(id),title,category,project,summary,content,keywords,source,status,visibility});
            }
            if(query.startsWith('DELETE FROM lia_kb_links'))links.delete(args[0]);
            return {success:true};
          };
          const first=async()=>{
            queries.push({query,args});
            if(query.includes('sqlite_master'))return schemaReady?{name:'lia_kb_nodes'}:null;
            if(query.includes('COUNT(*)'))return {total:query.includes("status='published'")?
              [...notes.values()].filter(n=>n.status==='published'&&n.visibility==='public').length:notes.size};
            if(query.includes('SELECT * FROM lia_kb_nodes'))return notes.get(args[0])||null;
            return null;
          };
          const all=async()=>{
            queries.push({query,args});
            if(query.includes('FROM lia_kb_links'))return {results:[...links.values()]};
            if(query.includes('SELECT id FROM lia_kb_nodes WHERE id IN'))return {results:args.filter(x=>notes.has(x)).map(id=>({id}))};
            if(query.includes('SELECT title,substr(content'))return {results:[...notes.values()].filter(n=>n.status==='published'&&n.visibility==='public'&&n.category!=='memoria'&&
              args.some(key=>String(n.keywords+' '+n.title+' '+n.summary).toLowerCase().includes(key.replaceAll('%','')))).slice(0,3).map(n=>({title:n.title,content:n.content.slice(0,540)}))};
            if(query.includes('FROM lia_kb_nodes'))return {results:[...notes.values()].filter(n=>n.status!=='archived')};
            return {results:[]};
          };
          return {run,first,all};
        }
      };
      return bound;
    }
  };
  return {db:raw,notes,links,queries};
}
test('V111.87 — exige secret forte e autenticação sem token em frontend',async()=>{
  const db=memoryDb();
  const missing=await neuralApi(request(),{DB:db.db});
  assert.equal(missing.status,503);
  assert.equal((await missing.json()).code,'TOKEN_NOT_CONFIGURED');
  const unauth=await neuralApi(request('','GET',null,''),{DB:db.db,LIA_NEURAL_ADMIN_TOKEN:TOKEN});
  assert.equal(unauth.status,401);
  const invalid=await neuralApi(request('','GET',null,'d'.repeat(40)),{DB:db.db,LIA_NEURAL_ADMIN_TOKEN:TOKEN});
  assert.equal(invalid.status,401);
  const originRequest=new Request(url,{headers:{Authorization:'Bearer '+TOKEN,Origin:'https://other.example'}});
  const rejected=await neuralApi(originRequest,{DB:db.db,LIA_NEURAL_ADMIN_TOKEN:TOKEN});
  assert.equal(rejected.status,403);
  assert.equal(db.queries.length,0,'negados não podem consultar o banco');
});
test('V111.87 — não faz migração remota por conta própria',async()=>{
  const store=memoryDb(false);
  const r=await neuralApi(request(),{DB:store.db,LIA_NEURAL_ADMIN_TOKEN:TOKEN});
  assert.equal(r.status,503);
  assert.equal((await r.json()).code,'SCHEMA_REQUIRED');
  assert.ok(!store.queries.some(x=>/CREATE TABLE|ALTER TABLE/i.test(x.query)));
});
test('V111.87 — 15 notas e 19 ligações iniciais, com cinco áreas',async()=>{
  const st=memoryDb(),env={DB:st.db,LIA_NEURAL_ADMIN_TOKEN:TOKEN};
  let r=await neuralApi(request('/seed','POST',{}),env);assert.equal(r.status,200);
  r=await neuralApi(request('/seed','POST',{}),env);assert.equal(r.status,200);
  assert.equal(st.notes.size,15);assert.equal(st.links.size,19);
  assert.equal(LIA_NEURAL_SEEDS.length,15);
  assert.equal(LIA_NEURAL_SEED_LINKS.length,19);
  assert.deepEqual([...new Set(LIA_NEURAL_SEEDS.map(x=>x.category))].sort(),
    ['aprendizado','cenario','conhecimento','decisao','memoria']);
  r=await neuralApi(request(),env);assert.equal((await r.json()).nodes.length,15);
});
test('V111.87 — importa, revisa, publica e recupera notas autorizadas',async()=>{
  const st=memoryDb(),env={DB:st.db,LIA_NEURAL_ADMIN_TOKEN:TOKEN};
  const data={
    title:'Orientação PIX segura',category:'conhecimento',project:'Curso Conecta Jovem',
    summary:'pix pagamento confirmação',keywords:'pix,seguranca',content:'Cheque o destinatário antes de confirmar.',
    source:'aula.md',status:'draft',visibility:'private'
  };
  let r=await neuralApi(request('/nodes','POST',data),env);
  assert.equal(r.status,201);
  const id=(await r.json()).id;
  assert.ok(st.notes.has(id));
  assert.equal(await retrieveLiaKnowledge(env,'family','vou pagar pix agora'),'');
  r=await neuralApi(request('/nodes/'+id,'PATCH',{status:'published',visibility:'public'}),env);
  assert.equal(r.status,200);
  assert.match(await retrieveLiaKnowledge(env,'family','vou pagar pix agora'),/Cheque o destinatário/);
  r=await neuralApi(request('/nodes/'+id),env);assert.equal((await r.json()).node.project,'Curso Conecta Jovem');
});
test('V111.87 — memórias pessoais são privadas, e documentos não entram em prompts automaticamente',async()=>{
  const st=memoryDb(),env={DB:st.db,LIA_NEURAL_ADMIN_TOKEN:TOKEN};
  const n={title:'Memória do participante',category:'memoria',project:'LIA AI',content:'Notas do acompanhamento',summary:'',status:'published',visibility:'public'};
  const deny=await neuralApi(request('/nodes','POST',n),env);
  assert.equal(deny.status,422);
  const privateDraft={...n,status:'draft',visibility:'private'};
  const allowed=await neuralApi(request('/nodes','POST',privateDraft),env);
  assert.equal(allowed.status,201);
  assert.equal(await retrieveLiaKnowledge(env,'family','participante memória'),'');
  assert.equal(st.notes.size,1);
});
test('V111.87 — IA Web consulta somente conhecimento publicado; rota nativa fica igual',async()=>{
  const st=memoryDb(),env={DB:st.db,LIA_NEURAL_ADMIN_TOKEN:TOKEN};
  await neuralApi(request('/seed','POST',{}),env);
  // Nenhum conhecimento sugerido entra na LIA antes de revisão.
  assert.equal(await retrieveLiaKnowledge(env,'family','Pix inseguro'),'');
  const approved=await neuralApi(request('/nodes/seed-pix','PATCH',{status:'published',visibility:'public'}),env);
  assert.equal(approved.status,200);
  let system='';
  env.AI={run:async(_model,options)=>{system=options.messages[0].content;return {response:'Confira por um contato conhecido.'};}};
  const makeReq=()=>new Request('https://educa.example/api/modo-livre/conversar-web',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({scenario:'family',message:'Como confirmar um Pix?',history:[]})});
  let r=await responderModoLivre(makeReq(),env,true);
  assert.equal(r.status,200);
  assert.match(system,/Referências educativas revisadas/);
  assert.match(system,/Confira destinatário/);
  assert.doesNotMatch(system,/Armazene apenas resumos aprovados/);
  system='';
  r=await responderModoLivre(makeReq(),env,false);
  assert.equal(r.status,200);
  assert.doesNotMatch(system,/Referências educativas revisadas/);
});
test('V111.87 — UI segura, Web isolada, arquivos importados apenas como rascunho',()=>{
  const html=readFileSync('public/static/channels/web/lia-neural-v11187.html','utf8');
  const ui=readFileSync('public/static/channels/web/lia-neural-v11187.js','utf8');
  const css=readFileSync('public/static/channels/web/lia-neural-v11187.css','utf8');
  const worker=readFileSync('src/worker.js','utf8');
  const migration=readFileSync('banco/lia_neural_v11187.sql','utf8');
  assert.match(html,/Content-Security-Policy/);
  assert.match(html,/Mapa Neural/);
  assert.match(html,/Importar arquivos/);
  assert.match(html,/aria-label/);
  assert.doesNotMatch(html,/cdn\.|https?:\/\/|LIA_NEURAL_ADMIN_TOKEN/i);
  assert.match(ui,/status:'draft',visibility:'private'/);
  assert.match(ui,/file\.text\(\)/);
  assert.match(ui,/localStorage/);
  // A única ocorrência admitida é um comentário dizendo que NÃO usa localStorage.
  assert.doesNotMatch(ui,/localStorage\.setItem|localStorage\.getItem/);
  assert.match(css,/@media\(max-width:650px\)/);
  assert.match(worker,/neuralApi\(request,env,url\)/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS lia_kb_nodes/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS lia_kb_links/);
});


test('V111.88 — 16 golpes pesquisados e 24 ligações entram no Neural apenas após importação autorizada',async()=>{
  const st=memoryDb(),env={DB:st.db,LIA_NEURAL_ADMIN_TOKEN:TOKEN};
  assert.equal(LIA_NEURAL_RESEARCH_2026.length,16);
  assert.equal(LIA_NEURAL_RESEARCH_LINKS.length,24);
  assert.ok(LIA_NEURAL_RESEARCH_2026.every(n=>n.status==='draft'&&n.visibility==='private'));
  assert.ok(LIA_NEURAL_RESEARCH_2026.every(n=>n.source.startsWith('https://')));
  await neuralApi(request('/seed','POST',{}),env);
  let result=await neuralApi(request('/seed/research-2026','POST',{}),env);
  assert.equal(result.status,200);
  const added=await result.json();
  assert.equal(added.seeded,16);
  assert.equal(added.links,24);
  assert.equal(added.reviewRequired,true);
  assert.equal(st.notes.size,31);
  assert.equal(st.links.size,43);
  result=await neuralApi(request('/seed/research-2026','POST',{}),env);
  assert.equal(result.status,200);
  assert.equal(st.notes.size,31);
  assert.equal(st.links.size,43);
  assert.equal(await retrieveLiaKnowledge(env,'video','Oi'),'', 'nenhum texto privado alimenta a IA');
});

test('V111.88 — aprovação explícita permite LIA em vídeo recuperar fontes de deepfake',async()=>{
  const st=memoryDb(),env={DB:st.db,LIA_NEURAL_ADMIN_TOKEN:TOKEN};
  await neuralApi(request('/seed','POST',{}),env);
  await neuralApi(request('/seed/research-2026','POST',{}),env);
  const deepfake=await neuralApi(request('/nodes/research-deepfake-video-2026','PATCH',{
    status:'published',visibility:'public'
  }),env);
  assert.equal(deepfake.status,200);
  const context=await retrieveLiaKnowledge(env,'video','Oi');
  assert.match(context,/Deepfake em videochamada de familiar/);
  assert.match(context,/confirme a identidade/);
  assert.doesNotMatch(context,/Memória do participante/);
  let prompt='';
  env.AI={run:async(_name,opts)=>{prompt=opts.messages[0].content;return {response:'Confirme comigo usando outro contato.'};}};
  const req=()=>new Request('https://educa.example/api/modo-livre/conversar-web',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({scenario:'video',message:'Oi',history:[],webChallenge:{level:3,tries:1}})
  });
  const response=await responderModoLivre(req(),env,true);
  assert.equal(response.status,200);
  assert.match(prompt,/Deepfake em videochamada de familiar/);
  assert.match(prompt,/Nível Experiente/);
  prompt='';
  await responderModoLivre(req(),env,false);
  assert.doesNotMatch(prompt,/Referências educativas revisadas/,'rota nativa preservada');
});

test('V111.88 — informações oficiais pesquisadas podem alimentar SMS e ligações sem revelar rascunhos',async()=>{
  const st=memoryDb(),env={DB:st.db,LIA_NEURAL_ADMIN_TOKEN:TOKEN};
  await neuralApi(request('/seed','POST',{}),env);
  await neuralApi(request('/seed/research-2026','POST',{}),env);
  await neuralApi(request('/nodes/research-central-2026','PATCH',{status:'published',visibility:'public'}),env);
  await neuralApi(request('/nodes/research-encomenda-sms-2026','PATCH',{status:'published',visibility:'public'}),env);
  const call=await retrieveLiaKnowledge(env,'bank','Alô');
  const sms=await retrieveLiaKnowledge(env,'sms-delivery','Oi');
  assert.match(call,/Falsa central bancária/);
  assert.match(sms,/Falsa liberação de encomenda/);
  assert.doesNotMatch(call,/Falsa prova de vida do INSS/,'nota não aprovada deve permanecer privada');
});

test('V111.88 — grafo de pesquisa no Preview continua somente leitura',()=>{
  const demo=JSON.parse(readFileSync('public/static/channels/web/lia-neural-v11187-demo.json','utf8'));
  const ui=readFileSync('public/static/channels/web/lia-neural-v11187.js','utf8');
  const html=readFileSync('public/static/channels/web/lia-neural-v11187.html','utf8');
  const dialogue=readFileSync('public/static/channels/web/dialogue-v11183.js','utf8');
  assert.equal(demo.nodes.length,31);
  assert.equal(demo.links.length,43);
  assert.ok(demo.nodes.every(n=>n.visibility==='private'&&n.status==='draft'));
  assert.match(ui,/seed\/research-2026/);
  assert.match(html,/researchBtn/);
  assert.match(dialogue,/const useWebRoute=typeof input==='string'/);
  assert.match(dialogue,/webChallenge=\{level:challenge.level/);
});
