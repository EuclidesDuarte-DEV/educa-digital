/* V112.63: XP de treinamento vinculado à conta no D1. Migração aditiva,
   independente de conteúdo de conversas. O login anterior continua demonstrativo;
   este token apenas vincula a sessão ao usuário retornado pelo login do protótipo. */
const init=new WeakMap();
const sql=(env,s,...args)=>env.DB.prepare(s).bind(...args);
const hash=async token=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),x=>x.toString(16).padStart(2,'0')).join('');
const now=()=>Math.floor(Date.now()/1000);
const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
async function setup(env){
 if(!init.has(env.DB)){
  const task=(async()=>{
   for(const statement of [
    'CREATE TABLE IF NOT EXISTS modo_livre_sessions (token_hash TEXT PRIMARY KEY, usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE, expires INTEGER NOT NULL)',
    'CREATE INDEX IF NOT EXISTS idx_modo_livre_session_user ON modo_livre_sessions(usuario_id, expires)',
    'CREATE TABLE IF NOT EXISTS modo_livre_xp (usuario_id INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE, xp INTEGER NOT NULL DEFAULT 0 CHECK(xp BETWEEN 0 AND 9999))',
    'CREATE TABLE IF NOT EXISTS modo_livre_xp_events (usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE, event_id TEXT NOT NULL, delta INTEGER NOT NULL CHECK(delta IN (20,-15)), applied INTEGER NOT NULL DEFAULT 0 CHECK(applied IN (0,1)), PRIMARY KEY(usuario_id,event_id))'
   ])await env.DB.prepare(statement).run();
  })().catch(error=>{init.delete(env.DB);throw error;});
  init.set(env.DB,task);
 }
 await init.get(env.DB);
}
export async function issueLevelSession(env,userId){
 // A sincronização de XP não deve impedir o login existente se D1 estiver indisponível.
 if(!env.DB?.batch||!userId)return undefined;
 try{
  await setup(env);
  const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
  await sql(env,'DELETE FROM modo_livre_sessions WHERE usuario_id=? AND expires<=?',userId,now()).run();
  await sql(env,'INSERT INTO modo_livre_sessions(token_hash,usuario_id,expires) VALUES(?,?,?)',await hash(token),userId,now()+90*86400).run();
  return token;
 }catch(_){return undefined;}
}
export async function levelProgressApi(request,env){
 const token=request.headers.get('authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
 if(!token)return response({ok:false,message:'Entre novamente para sincronizar seu nível.'},401);
 await setup(env);
 const user=await sql(env,'SELECT usuario_id FROM modo_livre_sessions WHERE token_hash=? AND expires>?',await hash(token),now()).first();
 if(!user)return response({ok:false,message:'Sessão expirada. Entre novamente.'},401);
 const id=user.usuario_id;
 if(request.method==='POST'){
  const length=Number(request.headers.get('content-length')||0);
  if(length>1024)return response({ok:false,message:'Evento grande demais.'},413);
  const raw=await request.text();if(raw.length>1024)return response({ok:false,message:'Evento grande demais.'},413);
  let data;try{data=JSON.parse(raw);}catch(_){return response({ok:false,message:'Evento inválido.'},400);}
  if(!/^[a-zA-Z0-9_-]{12,80}$/.test(String(data?.eventId||''))||!['safe','risk'].includes(data?.outcome))return response({ok:false,message:'Evento inválido.'},400);
  const eid=data.eventId,delta=data.outcome==='safe'?20:-15;
  // D1.batch é transacional. A mesma conclusão reenviada após falha de
  // conexão jamais incrementa ou desconta XP duas vezes.
  await env.DB.batch([
   sql(env,'INSERT OR IGNORE INTO modo_livre_xp(usuario_id,xp) VALUES(?,0)',id),
   sql(env,'INSERT OR IGNORE INTO modo_livre_xp_events(usuario_id,event_id,delta) VALUES(?,?,?)',id,eid,delta),
   sql(env,'UPDATE modo_livre_xp SET xp=MAX(0,MIN(9999,xp+(SELECT delta FROM modo_livre_xp_events WHERE usuario_id=? AND event_id=?))) WHERE usuario_id=? AND EXISTS(SELECT 1 FROM modo_livre_xp_events WHERE usuario_id=? AND event_id=? AND applied=0)',id,eid,id,id,eid),
   sql(env,'UPDATE modo_livre_xp_events SET applied=1 WHERE usuario_id=? AND event_id=?',id,eid)
  ]);
 }
 const row=await sql(env,'SELECT xp FROM modo_livre_xp WHERE usuario_id=?',id).first();
 return response({ok:true,xp:Number(row?.xp||0)});
}
