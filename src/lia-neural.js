/* LIA Neural V111.87 — memória de conhecimento revisada, D1 sem migração automática.
 * Secret: LIA_NEURAL_ADMIN_TOKEN (mínimo 24 caracteres). Nunca em HTML.
 */
import {LIA_NEURAL_SEEDS,LIA_NEURAL_SEED_LINKS} from './lia-neural-seeds.js';
const HEAD={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const CAT=new Set(['conhecimento','cenario','memoria','aprendizado','decisao']);
const STAT=new Set(['draft','published','archived']);
const VIS=new Set(['private','public']);
const ok=(fields={},status=200)=>Response.json({ok:true,...fields},{status,headers:HEAD});
const fail=(status,message,code='ERROR')=>Response.json({ok:false,message,code},{status,headers:HEAD});
const trim=(x,max=180)=>String(x??'').trim().slice(0,max);
const sql=(db,q,...args)=>db.prepare(q).bind(...args);
const sensitive=x=>/\b(?:\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}|[\w.+-]+@[\w.-]+\.[a-z]{2,})\b/i.test(x);
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
/* Busca só documentos deliberadamente publicados pelo administrador.
 * Memórias pessoais e rascunhos não entram em prompts públicos. */
export async function retrieveLiaKnowledge(env,scenario,message){
  if(!env?.DB)return '';
  const raw=String(scenario||'')+' '+String(message||'');
  const words=[...new Set(raw.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').split(/[^a-z0-9]+/)
    .filter(w=>(w.length>=4||['pix','sms'].includes(w))&&!['para','como','voce','quero','isso','estou','pode','sobre','porque'].includes(w)))].slice(0,5);
  if(!words.length)return '';
  try{
    if(!await schema(env.DB))return '';
    const query="SELECT title,substr(content,1,540) AS content FROM lia_kb_nodes WHERE status='published' AND visibility='public' AND category<>'memoria' AND ("+
      words.map(()=>"(lower(keywords||' '||title||' '||summary) LIKE ?)").join(' OR ')+') LIMIT 3';
    const items=(await sql(env.DB,query,...words.map(w=>'%'+w+'%')).all()).results||[];
    return items.filter(n=>n.content).map(n=>'- '+trim(n.title,90)+': '+trim(n.content,540)).join('\n').slice(0,1500);
  }catch(_){return '';} // D1 indisponível ou sem migração não quebra o Modo Livre.
}
