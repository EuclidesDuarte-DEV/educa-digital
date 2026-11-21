import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {retrieveLiaKnowledge,neuralApi} from '../src/lia-neural.js';
import {trainingInsights} from '../src/lia-neural-learning-v11196.js';

const origin='https://educa.example';
const secret='local-test-admin-token-keep-private-012345';
const official=(id,title,source='https://www.gov.br/seguranca/oficial')=>({
 id,title,category:'cenario',project:'Pesquisa antifraudes 2026',
 content:'Identifique sinais de fraude, faça verificação independente por canais conhecidos. Esta é uma simulação educativa.',
 summary:'Segurança e reconhecimento de tentativas de fraude.',keywords:'fraude,segurança,video',
 source,status:'draft',visibility:'private'
});
function database({candidates=[],notes={},search=[],related=[],outcomes=[]}={}){
 const calls=[],items=new Map([...candidates,...Object.values(notes)].map(x=>[x.id,{...x}]));
 return {
  calls,items,
  prepare(query){
   let bound=[];
   const stmt={
    bind(...xs){bound=xs;return stmt},
    async first(){
     calls.push({query,args:bound});
     if(query.includes("sqlite_master"))return {name:'lia_kb_nodes'};
     if(query==='SELECT * FROM lia_kb_nodes WHERE id=?')return items.get(bound[0])||null;
     return null;
    },
    async all(){
     calls.push({query,args:bound});
     if(query.includes('lia_kb_links l')){
      return {results:related.filter(x=>x.status==='published'&&x.visibility==='public')};
     }
     if(query.includes('substr(content,1,540)'))return {results:search};
     if(query.includes('FROM lia_training_signals'))return {results:outcomes};
     if(query.includes("status='draft' AND visibility='private'")&&query.includes('ORDER BY updated_at')){
      return {results:[...items.values()].filter(x=>x.status==='draft'&&x.visibility==='private')};
     }
     return {results:[]};
    },
    async run(){
     calls.push({query,args:bound});
     if(query.includes("UPDATE lia_kb_nodes SET status='published'")){
      const item=items.get(bound[0]);if(item){item.status='published';item.visibility='public';}
     }
     return {success:true};
    }
   };
   return stmt;
  }
 };
}
function adminRequest(path,method='GET',body,authorized=true){
 return new Request(origin+'/api/lia/neural'+path,{
  method,headers:{
   ...(authorized?{'Authorization':'Bearer '+secret}:{}),
   Origin:origin,...(body?{'Content-Type':'application/json'}:{})
  },...(body?{body:JSON.stringify(body)}:{})
 });
}
test('V111.98 — LIA consulta ligações do grafo SOMENTE em notas publicadas',async()=>{
 const source={id:'node-pix',title:'Pix seguro',category:'conhecimento',
  content:'Confira quem recebe o Pix fictício.',summary:'pix',keywords:'pix,video'};
 const neighbor={id:'node-video',title:'Identidade em videochamada',
  content:'Uma voz familiar não comprova identidade. Confirme por canal conhecido.',
  category:'cenario',keywords:'video',summary:'video',status:'published',visibility:'public'};
 const privateNeighbor={id:'private-note',title:'Memória privada',
  content:'Esta frase pessoal nunca entra em prompts',category:'memoria',
  status:'draft',visibility:'private'};
 const db=database({search:[source],related:[neighbor,privateNeighbor]});
 const result=await retrieveLiaKnowledge({DB:db},'video','Oi');
 assert.match(result,/Pix seguro/);
 assert.match(result,/Identidade em videochamada/);
 assert.match(result,/Conhecimento conectado e revisado/);
 assert.doesNotMatch(result,/Esta frase pessoal/);
 assert.ok(result.length<=1500);
 const query=db.calls.find(x=>x.query.includes('lia_kb_links l'))?.query||'';
 assert.match(query,/n\.status='published'/);
 assert.match(query,/n\.visibility='public'/);
 assert.match(query,/n\.category<>'memoria'/);
});
test('V111.98 — sem arestas válidas, não interrompe o conhecimento principal',async()=>{
 const db=database({search:[{title:'Falsa central',content:'Confirme o banco por canal oficial.',
  keywords:'banco',summary:'banco',category:'conhecimento'}]});
 const t=await retrieveLiaKnowledge({DB:db},'bank','Oi');
 assert.match(t,/Falsa central/);
 assert.ok(!db.calls.some(x=>x.query.includes('lia_kb_links l')));
});
test('V111.98 — somente administrador autorizado pode listar e publicar',async()=>{
 const note=official('research-safe-note','Alerta de fraude em videochamada');
 const db=database({candidates:[note]});
 const tokenEnv={DB:db,LIA_NEURAL_ADMIN_TOKEN:secret};
 assert.equal((await neuralApi(adminRequest('/review/queue','GET',null,false),tokenEnv)).status,401);
 const q=await neuralApi(adminRequest('/review/queue'),tokenEnv);
 assert.equal(q.status,200);
 const value=await q.json();
 assert.equal(value.candidates.length,1);
 assert.equal(value.candidates[0].eligible,true);
 assert.equal(value.candidates[0].requires_manual_review,true);
 assert.equal(value.candidates[0].content,undefined,'não enviar conteúdo bruto na fila');
 const res=await neuralApi(adminRequest('/review/publish','POST',{ids:[note.id]}),tokenEnv);
 assert.equal(res.status,200);
 assert.equal((await res.json()).published,1);
 assert.equal(db.items.get(note.id).status,'published');
 assert.equal(db.items.get(note.id).visibility,'public');
});
test('V111.98 — memórias e fontes duvidosas NÃO podem ser publicadas em lote',async()=>{
 const unknown=official('source-unverified','Relato privado','https://site-desconhecido.example/noticia');
 const privateMemory={...official('memory-sensitive','Memória privada'),category:'memoria'};
 const db=database({candidates:[unknown,privateMemory]});
 const env={DB:db,LIA_NEURAL_ADMIN_TOKEN:secret};
 const q=await neuralApi(adminRequest('/review/queue'),env);
 const list=(await q.json()).candidates;
 assert.equal(list.filter(x=>x.eligible).length,0);
 const res=await neuralApi(adminRequest('/review/publish','POST',{ids:[unknown.id]}),env);
 assert.equal(res.status,422);
 assert.equal(db.items.get(unknown.id).visibility,'private');
 assert.equal(db.items.get(privateMemory.id).visibility,'private');
});
test('V111.98 — painel coletivo suprime grupos menores que 12',async()=>{
 const outcomes=[
  {scenario:'video',signal:'safe',total:7},
  {scenario:'video',signal:'unsafe',total:6},
  {scenario:'bank',signal:'unsafe',total:3},
  {scenario:'bank',signal:'safe',total:8}
 ];
 const db=database({outcomes});
 const result=await trainingInsights({DB:db});
 assert.equal(result.minimum_group,12);
 assert.equal(result.scenarios.length,1);
 assert.equal(result.scenarios[0].scenario,'video');
 assert.equal(result.scenarios[0].completed,13);
 assert.equal(result.scenarios[0].needs_review,true);
 assert.doesNotMatch(JSON.stringify(result),/personal|cpf|203\.0\.113/);
 const env={DB:db,LIA_NEURAL_ADMIN_TOKEN:secret};
 const ok=await neuralApi(adminRequest('/learning/insights'),env);
 assert.equal(ok.status,200);
 assert.equal((await ok.json()).scenarios.length,1);
 const no=await neuralApi(adminRequest('/learning/insights','GET',null,false),env);
 assert.equal(no.status,401);
});
test('V111.98 — painel exibe diferença entre 31 notas e as efetivamente liberadas',()=>{
 const html=readFileSync('public/static/channels/web/lia-neural-v11187.html','utf8');
 const js=readFileSync('public/static/channels/web/lia-neural-v11187.js','utf8');
 assert.match(html,/id="publishedNodesCount"/);
 assert.match(html,/id="reviewKnowledge"/);
 assert.match(html,/id="loadLearningInsights"/);
 assert.match(js,/\/review\/queue/);
 assert.match(js,/\/review\/publish/);
 assert.match(js,/\/learning\/insights/);
 assert.match(js,/await select\(node\.id\)/);
 assert.match(js,/conf[eê]riu a fonte e revisou o conte[uú]do/);
 assert.match(js,/n\.status==='published'&&n\.visibility==='public'/);
});
