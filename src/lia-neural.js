/* LIA Neural V111.87 — memória de conhecimento revisada, D1 sem migração automática.
 * Secret: LIA_NEURAL_ADMIN_TOKEN (mínimo 24 caracteres). Nunca em HTML.
 */
import {LIA_NEURAL_SEEDS,LIA_NEURAL_SEED_LINKS} from './lia-neural-seeds.js';
import {LIA_NEURAL_RESEARCH_2026,LIA_NEURAL_RESEARCH_LINKS} from './lia-neural-research-2026.js';
import { listTrainingExamples, deleteTrainingExample, examplePolicy } from './lia-training-examples-v11197.js';
import { trainingInsights } from './lia-neural-learning-v11196.js';
const HEAD={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const CAT=new Set(['conhecimento','cenario','memoria','aprendizado','decisao']);
const STAT=new Set(['draft','published','archived']);
const VIS=new Set(['private','public']);
const ok=(fields={},status=200)=>Response.json({ok:true,...fields},{status,headers:HEAD});
const fail=(status,message,code='ERROR')=>Response.json({ok:false,message,code},{status,headers:HEAD});
const trim=(x,max=180)=>String(x??'').trim().slice(0,max);
const sql=(db,q,...args)=>db.prepare(q).bind(...args);
const sensitive=x=>/\b(?:\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}|[\w.+-]+@[\w.-]+\.[a-z]{2,})\b/i.test(x);
// Publicação em lote exige confirmação humana e fonte institucional conhecida.
// Memória, aprendizado pessoal, arquivos não revisados e fontes desconhecidas
// não entram automaticamente no RAG, mesmo que apareçam no grafo.
const TRUSTED_REVIEW_HOSTS=['gov.br','bcb.gov.br','cert.br','nic.br','febraban.org.br'];
function reviewEligible(node){
 if(!node||node.status!=='draft'||node.visibility!=='private'||
    !['conhecimento','cenario','decisao'].includes(node.category))return false;
 let host='';
 try{const url=new URL(node.source);if(url.protocol!=='https:')return false;host=url.hostname.toLowerCase();}
 catch(_){return false;}
 if(!TRUSTED_REVIEW_HOSTS.some(d=>host===d||host.endsWith('.'+d)))return false;
 return !validate({...node,status:'published',visibility:'public'});
}
async function payload(request){
  if(Number(request.headers.get('content-length')||0)>26000)throw Error('TOO_LARGE');
  const text=await request.text();
  if(text.length>26000)throw Error('TOO_LARGE');
  return JSON.parse(text||'{}');
}
async function schema(db){
  return Boolean(await sql(db,"SELECT name FROM sqlite_master WHERE type='table' AND name='lia_kb_nodes'").first());
}
async function guard(request,env){
  const configured=typeof env?.LIA_NEURAL_ADMIN_TOKEN==='string'&&env.LIA_NEURAL_ADMIN_TOKEN.length>=24;
  if(!configured)return fail(503,'Configure o secret LIA_NEURAL_ADMIN_TOKEN no Worker.','TOKEN_NOT_CONFIGURED');
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)return fail(403,'Origem não permitida.','ORIGIN');
  const sent=request.headers.get('authorization')?.match(/^Bearer ([\w.~_-]{24,256})$/)?.[1];
  if(!sent)return fail(401,'Token administrativo necessário.','AUTH_REQUIRED');
  const digest=async value=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
  const [a,b]=await Promise.all([digest(sent),digest(env.LIA_NEURAL_ADMIN_TOKEN)]);
  let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];
  if(diff)return fail(401,'Credencial inválida.','AUTH_REQUIRED');
  return null;
}
function validate(node){
  if(!node||typeof node!=='object'||Array.isArray(node))return 'Nota inválida.';
  if(!CAT.has(node.category))return 'Categoria inválida.';
  if(trim(node.title,120).length<3)return 'Título curto demais.';
  if(!trim(node.project,120))return 'Informe o projeto.';
  if(typeof node.content!=='string'||node.content.length>18000)return 'Nota excedeu 18 mil caracteres.';
  if(!STAT.has(node.status||'draft')||!VIS.has(node.visibility||'private'))return 'Estado inválido.';
  if(node.status==='published'&&node.visibility==='public'&&
    (node.category==='memoria'||sensitive(node.content+' '+node.summary)))
    return 'Memória pessoal ou dados identificáveis não podem ser publicados para a IA.';
  return null;
}
export async function neuralApi(request,env,url=new URL(request.url)){
  const denied=await guard(request,env);
  if(denied)return denied;
  if(!env?.DB)return fail(503,'Cloudflare D1 não configurado.','DB_MISSING');
  try{
    if(!await schema(env.DB))return fail(503,'Migração D1 pendente: banco/lia_neural_v11187.sql.','SCHEMA_REQUIRED');
    return await handle(request,env.DB,url);
  }catch(e){
    if(e?.message==='TOO_LARGE')return fail(413,'Arquivo grande demais. Divida em notas menores.','TOO_LARGE');
    if(e instanceof SyntaxError)return fail(400,'JSON inválido.','BAD_JSON');
    if(/no such table|no such column|SQLITE_ERROR|D1_ERROR/i.test(String(e?.message||'')))
      return fail(503,'Esquema Neural incompleto. Verifique a migração.','SCHEMA_REQUIRED');
    console.error('LIA Neural:',String(e?.message||'falha').slice(0,100));
    return fail(500,'Falha ao acessar a memória da LIA.');
  }
}
async function handle(request,db,url){
  const method=request.method.toUpperCase();
  const path=url.pathname.slice('/api/lia/neural'.length);
  // Autorização passou por guard(): jamais expor diálogos em rota pública.
  if(method==='GET'&&path==='/examples'){
    const examples=await listTrainingExamples({DB:db});
    return ok({examples,policy:examplePolicy()});
  }
  if(method==='DELETE'&&/^\/examples\/[a-f0-9-]{36}$/i.test(path)){
    await deleteTrainingExample({DB:db},path.slice('/examples/'.length));
    return ok({deleted:true});
  }
  // Fila autenticada: a equipe seleciona apenas fontes institucionais que
  // já revisou; sem autorização, as notas privadas continuam isoladas.
  if(method==='GET'&&path==='/learning/insights')
    return ok(await trainingInsights({DB:db}));
  if(method==='GET'&&path==='/review/queue'){
    const rows=(await sql(db,`SELECT id,title,category,project,summary,content,source,status,visibility
       FROM lia_kb_nodes WHERE status='draft' AND visibility='private'
       AND category IN ('conhecimento','cenario','decisao')
       ORDER BY updated_at DESC LIMIT 150`).all()).results||[];
    const candidates=rows.map(x=>({
      id:x.id,title:x.title,category:x.category,summary:x.summary,source:x.source,
      eligible:reviewEligible(x),
      // Mesmo quando a fonte é elegível, revisão humana do conteúdo é exigida.
      requires_manual_review:true
    }));
    return ok({candidates,published_only:true});
  }
  if(method==='POST'&&path==='/review/publish'){
    const data=await payload(request),ids=data?.ids;
    if(!Array.isArray(ids)||!ids.length||ids.length>25||
      !ids.every(id=>typeof id==='string'&&/^[\w-]{4,90}$/.test(id))||
      new Set(ids).size!==ids.length)
      return fail(422,'Selecione de 1 a 25 notas diferentes para revisão.','VALIDATION');
    // Toda nota passa por validação integral de conteúdo no Worker,
    // além da escolha explícita feita na interface autenticada.
    const approved=[];
    for(const id of ids){
      const note=await sql(db,'SELECT * FROM lia_kb_nodes WHERE id=?',id).first();
      if(!reviewEligible(note))
        return fail(422,'Revisão obrigatória: fonte ou conteúdo não elegível para publicação.','REVIEW_REQUIRED');
      approved.push(note.id);
    }
    for(const id of approved)
      await sql(db,`UPDATE lia_kb_nodes SET status='published',
        visibility='public',updated_at=datetime('now')
        WHERE id=? AND status='draft' AND visibility='private'`,id).run();
    return ok({published:approved.length,manual_review:true});
  }
  if(method==='GET'&&path==='/status'){
    const n=await sql(db,'SELECT COUNT(*) AS total FROM lia_kb_nodes').first();
    const published=await sql(db,"SELECT COUNT(*) AS total FROM lia_kb_nodes WHERE status='published' AND visibility='public'").first();
    return ok({ready:true,total:n?.total||0,published:published?.total||0});
  }
  if(method==='GET'&&path===''){
    const cat=url.searchParams.get('category')||'';
    const project=trim(url.searchParams.get('project'),120);
    const q=trim(url.searchParams.get('q'),70).toLowerCase();
    const conditions=["status<>'archived'"],params=[];
    if(CAT.has(cat)){conditions.push('category=?');params.push(cat);}
    if(project){conditions.push('project=?');params.push(project);}
    if(q){conditions.push("lower(title||' '||summary||' '||keywords||' '||project) LIKE ?");params.push('%'+q.replace(/[%_]/g,'')+'%');}
    const query='SELECT id,title,category,project,summary,keywords,source,status,visibility,created_at,updated_at FROM lia_kb_nodes WHERE '+
      conditions.join(' AND ')+' ORDER BY updated_at DESC LIMIT 350';
    const nodes=(await sql(db,query,...params).all()).results||[];
    const ids=new Set(nodes.map(n=>n.id));
    const all=(await sql(db,'SELECT id,source_id,target_id,relation FROM lia_kb_links LIMIT 1200').all()).results||[];
    return ok({nodes,links:all.filter(l=>ids.has(l.source_id)&&ids.has(l.target_id)),limit:350});
  }
  if(method==='GET'&&/^\/nodes\/[\w-]{4,90}$/.test(path)){
    const node=await sql(db,'SELECT * FROM lia_kb_nodes WHERE id=?',path.slice(7)).first();
    return node?ok({node}):fail(404,'Nota não encontrada.');
  }
  if(method==='POST'&&path==='/seed'){
    for(const n of LIA_NEURAL_SEEDS)
      await sql(db,'INSERT OR IGNORE INTO lia_kb_nodes (id,title,category,project,summary,content,keywords,source,status,visibility) VALUES(?,?,?,?,?,?,?,?,?,?)',
        n.id,n.title,n.category,n.project,n.summary,n.content,n.keywords,n.source,n.status,n.visibility).run();
    for(const l of LIA_NEURAL_SEED_LINKS)
      await sql(db,'INSERT OR IGNORE INTO lia_kb_links(id,source_id,target_id,relation) VALUES(?,?,?,?)',
        l.id,l.source_id,l.target_id,l.relation).run();
    return ok({seeded:LIA_NEURAL_SEEDS.length,links:LIA_NEURAL_SEED_LINKS.length});
  }
  // V111.88: carregar pesquisa documentada como rascunhos privados.
  // Não há publicação automática, e o admin pode revisar cada fonte.
  if(method==='POST'&&path==='/seed/research-2026'){
    for(const n of LIA_NEURAL_RESEARCH_2026)
      await sql(db,'INSERT OR IGNORE INTO lia_kb_nodes (id,title,category,project,summary,content,keywords,source,status,visibility) VALUES(?,?,?,?,?,?,?,?,?,?)',
        n.id,n.title,n.category,n.project,n.summary,n.content,n.keywords,n.source,n.status,n.visibility).run();
    // As ligações podem apontar para a base inicial. Primeiro certifique-se
    // de que a origem e o destino já foram inseridos na biblioteca.
    let added=0;
    for(const l of LIA_NEURAL_RESEARCH_LINKS){
      const found=await sql(db,'SELECT id FROM lia_kb_nodes WHERE id IN (?,?)',l.source_id,l.target_id).all();
      if((found.results||[]).length!==2)continue;
      await sql(db,'INSERT OR IGNORE INTO lia_kb_links(id,source_id,target_id,relation) VALUES(?,?,?,?)',
        l.id,l.source_id,l.target_id,l.relation).run();
      added++;
    }
    return ok({seeded:LIA_NEURAL_RESEARCH_2026.length,links:added,reviewRequired:true});
  }
  if(method==='POST'&&path==='/nodes'){
    const data=await payload(request),problem=validate(data);
    if(problem)return fail(422,problem,'VALIDATION');
    const id=crypto.randomUUID();
    await sql(db,'INSERT INTO lia_kb_nodes (id,title,category,project,summary,content,keywords,source,status,visibility) VALUES(?,?,?,?,?,?,?,?,?,?)',
      id,trim(data.title,120),data.category,trim(data.project,120),trim(data.summary,700),
      data.content,trim(data.keywords,420),trim(data.source,240),data.status||'draft',data.visibility||'private').run();
    return ok({id},201);
  }
  if(method==='PATCH'&&/^\/nodes\/[\w-]{4,90}$/.test(path)){
    const id=path.slice(7),current=await sql(db,'SELECT * FROM lia_kb_nodes WHERE id=?',id).first();
    if(!current)return fail(404,'Nota não encontrada.');
    const data=await payload(request),n={...current,...data},problem=validate(n);
    if(problem)return fail(422,problem,'VALIDATION');
    await sql(db,"UPDATE lia_kb_nodes SET title=?,category=?,project=?,summary=?,content=?,keywords=?,source=?,status=?,visibility=?,updated_at=datetime('now') WHERE id=?",
      trim(n.title,120),n.category,trim(n.project,120),trim(n.summary,700),n.content,
      trim(n.keywords,420),trim(n.source,240),n.status,n.visibility,id).run();
    return ok({id});
  }
  if(method==='POST'&&path==='/links'){
    const data=await payload(request);
    if(!/^[\w-]{4,90}$/.test(String(data.source_id||''))||
       !/^[\w-]{4,90}$/.test(String(data.target_id||''))||
       data.source_id===data.target_id)return fail(422,'Selecione duas notas diferentes.');
    const found=await sql(db,'SELECT id FROM lia_kb_nodes WHERE id IN (?,?)',data.source_id,data.target_id).all();
    if((found.results||[]).length!==2)return fail(404,'Notas não encontradas.');
    const id=crypto.randomUUID(),relation=trim(data.relation,70)||'relacionado';
    await sql(db,'INSERT OR IGNORE INTO lia_kb_links(id,source_id,target_id,relation) VALUES(?,?,?,?)',
      id,data.source_id,data.target_id,relation).run();
    return ok({id},201);
  }
  if(method==='DELETE'&&/^\/links\/[\w-]{4,90}$/.test(path)){
    await sql(db,'DELETE FROM lia_kb_links WHERE id=?',path.slice(7)).run();
    return ok({deleted:true});
  }
  return fail(404,'Rota Neural não encontrada.');
}
// Diagnóstico público sem dados privados ou credenciais. A equipe pode confirmar
// se a recuperação de conhecimento revisado está pronta no ambiente publicado.
export async function neuralReadiness(env){
  const base={schema_ready:false,published_count:0,ai_enabled:typeof env?.AI?.run==='function',rag_active:false,platform:'web'};
  if(!env?.DB)return {...base,reason:'DB_MISSING'};
  try{
    if(!await schema(env.DB))return {...base,reason:'SCHEMA_REQUIRED'};
    const result=await sql(env.DB,"SELECT COUNT(*) AS total FROM lia_kb_nodes WHERE status='published' AND visibility='public' AND category<>'memoria'").first();
    const published_count=Math.max(0,Number(result?.total||0));
    // Os números são agregados e não expõem conteúdo de notas privadas.
    let node_count=0,link_count=0,library_bootstrapped=false;
    try{
      const [nodes,links,marker]=await Promise.all([
        sql(env.DB,'SELECT COUNT(*) AS total FROM lia_kb_nodes').first(),
        sql(env.DB,'SELECT COUNT(*) AS total FROM lia_kb_links').first(),
        sql(env.DB,"SELECT key FROM lia_kb_bootstrap_jobs WHERE key='neural-full-library-v11200'").first()
      ]);
      node_count=Math.max(0,Number(nodes?.total||0));
      link_count=Math.max(0,Number(links?.total||0));
      library_bootstrapped=Boolean(marker);
    }catch(_){/* D1 anterior à versão atual: manter o diagnóstico principal */}
    return {...base,schema_ready:true,published_count,node_count,link_count,library_bootstrapped,
      rag_active:published_count>0&&base.ai_enabled,
      reason:!published_count?'REVIEW_REQUIRED':!base.ai_enabled?'AI_UNAVAILABLE':'READY'};
  }catch(_){return {...base,reason:'DB_UNAVAILABLE'};}
}
/* Busca só documentos deliberadamente publicados pelo administrador.
 * Memórias pessoais e rascunhos não entram em prompts públicos. */
// V111.88 — vocabulário por situação, inclusive quando a primeira fala
// é apenas "oi" ou "alô": o Neural encontra o assunto da chamada.
const TOPICS=Object.freeze({
  family:['pix','filho','familiar','whatsapp'],
  'family-photo':['foto','imagem','familiar','pix','whatsapp','deepfake'],
  relative:['pix','familia','whatsapp'],
  video:['video','deepfake','voz','familiar'],
  bank:['banco','central','ligacao','pix'],
  code:['codigo','whatsapp','sms'],
  delivery:['entrega','encomenda','taxa','sms'],
  'sms-delivery':['sms','encomenda','entrega'],
  'sms-bank':['sms','banco','central'],
  'sms-prize':['sms','premio','promocao'],
  account:['conta','phishing','whatsapp'],
  prize:['premio','promocao','taxa'],
  'call-tech':['suporte','ligacao','acesso'],
  friend:['seguranca','whatsapp'],
  daughter:['familia','whatsapp'],
  'family-group':['whatsapp','familia']
});
const STOP_TERMS=new Set(['para','como','voce','quero','isso','estou','pode','sobre','porque','preciso','agora','aqui','tudo','entao','esse','essa','quem']);
function searchable(value){
  return String(value||'').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ');
}
export async function retrieveLiaKnowledge(env,scenario,message){
  if(!env?.DB)return '';
  const scenarioWords=TOPICS[String(scenario||'')]||[];
  const userWords=searchable(message).split(/\s+/)
    .filter(w=>(w.length>=4||['pix','sms'].includes(w))&&!STOP_TERMS.has(w)).slice(0,6);
  const terms=[...new Set([...scenarioWords,...userWords])].slice(0,11);
  if(!terms.length)return '';
  try{
    if(!await schema(env.DB))return '';
    // Importante: apenas conhecimento PUBLICADO e PÚBLICO, jamais
    // notas privadas, memórias pessoais ou arquivos sem revisão humana.
    const query="SELECT title,substr(content,1,540) AS content,keywords,summary,category,id FROM lia_kb_nodes WHERE status='published' AND visibility='public' AND category<>'memoria' AND ("+
      terms.map(()=>"(lower(keywords||' '||title||' '||summary) LIKE ?)").join(' OR ')+') LIMIT 35';
    const rows=(await sql(env.DB,query,...terms.map(w=>'%'+w+'%')).all()).results||[];
    const priority=(row)=>{
      const title=searchable(row.title),keys=searchable(row.keywords),summary=searchable(row.summary);
      return terms.reduce((total,word,index)=>{
        const scenarioBoost=index<scenarioWords.length?2:1;
        return total+scenarioBoost*((title.includes(word)?6:0)+(keys.includes(word)?3:0)+(summary.includes(word)?1:0));
      },0);
    };
    const best=rows.filter(r=>r?.content&&r.category!=='memoria')
      .sort((a,b)=>priority(b)-priority(a)).slice(0,3);
    // As arestas do grafo podem enriquecer uma explicação, mas apenas se
    // o conhecimento vizinho TAMBÉM for publicado e não for uma memória.
    let related=[];
    const ids=best.map(r=>r.id).filter(id=>typeof id==='string'&&id.length>0);
    if(ids.length){
      try{
        const marks=ids.map(()=>'?').join(',');
        const queryLinks=`SELECT DISTINCT n.id,n.title,substr(n.content,1,300) AS content,
           n.keywords,n.summary,n.category
           FROM lia_kb_links l JOIN lia_kb_nodes n ON
           ((l.source_id IN (${marks}) AND n.id=l.target_id)
            OR (l.target_id IN (${marks}) AND n.id=l.source_id))
           WHERE n.status='published' AND n.visibility='public'
             AND n.category<>'memoria' LIMIT 18`;
        const neighbors=(await sql(env.DB,queryLinks,...ids,...ids).all()).results||[];
        const chosen=new Set(ids);
        related=neighbors.filter(x=>x?.content&&!chosen.has(x.id))
          .sort((a,b)=>priority(b)-priority(a)).slice(0,1);
      }catch(_){/* conexão ausente não interrompe a conversa */}
    }
    const citations=[
      ...best.map(n=>'- '+trim(n.title,90)+': '+trim(n.content,420)),
      ...related.map(n=>'- [Conhecimento conectado e revisado] '+trim(n.title,90)+': '+trim(n.content,300))
    ];
    return citations.join('\n').slice(0,1500);
  }catch(_){return '';} // Falha do Neural não interrompe as simulações.
}
