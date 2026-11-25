/* V112.66: staged official WhatsApp login. No real messages in Preview. */
const ready=new WeakMap();
const now=()=>Math.floor(Date.now()/1000);
const sql=(env,q,...args)=>env.DB.prepare(q).bind(...args);
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const fail=(status,message)=>json({ok:false,message},status);
const hex=b=>Array.from(new Uint8Array(b),v=>v.toString(16).padStart(2,'0')).join('');
const random=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
const enc=new TextEncoder();
const digest=async value=>hex(await crypto.subtle.digest('SHA-256',enc.encode(value)));
export const whatsappMode=env=>env?.WHATSAPP_AUTH_MODE==='whatsapp';
export const normalizeMobile=value=>{const s=String(value||'').replace(/\D/g,'');return /^[1-9][0-9]9[0-9]{8}$/.test(s)?s:null;};
function sameOrigin(request){const origin=request.headers.get('Origin');return (!origin||origin===new URL(request.url).origin)&&request.headers.get('Sec-Fetch-Site')!=='cross-site';}
function config(env){return whatsappMode(env)&&env.PREVIEW_DB_BOOTSTRAP!=='true'&&typeof env.WHATSAPP_ACCESS_TOKEN==='string'&&env.WHATSAPP_ACCESS_TOKEN.length>20&&/^\d{5,25}$/.test(env.WHATSAPP_PHONE_NUMBER_ID||'')&&/^[a-z0-9_]{1,100}$/.test(env.WHATSAPP_AUTH_TEMPLATE||'')&&/^v\d{1,2}\.\d$/.test(env.WHATSAPP_GRAPH_VERSION||'')&&typeof env.WHATSAPP_OTP_SECRET==='string'&&env.WHATSAPP_OTP_SECRET.length>=32;}
async function schema(env){
 if(!ready.has(env.DB)){
  const p=(async()=>{for(const q of [
   'CREATE TABLE IF NOT EXISTS wa_otp_v11266 (phone TEXT PRIMARY KEY, nonce TEXT NOT NULL, pin_hash TEXT NOT NULL, expires INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, delivered INTEGER NOT NULL DEFAULT 0)',
   'CREATE TABLE IF NOT EXISTS wa_auth_limits_v11266 (bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL)',
   'CREATE TABLE IF NOT EXISTS wa_verified_sessions_v11266 (token_hash TEXT PRIMARY KEY, usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE, expires INTEGER NOT NULL)',
   'CREATE INDEX IF NOT EXISTS wa_auth_limits_exp ON wa_auth_limits_v11266(expires)',
   'CREATE INDEX IF NOT EXISTS wa_verified_user ON wa_verified_sessions_v11266(usuario_id,expires)'
  ])await env.DB.prepare(q).run();})().catch(e=>{ready.delete(env.DB);throw e;});ready.set(env.DB,p);
 }
 await ready.get(env.DB);
}
async function mac(env,value){const key=await crypto.subtle.importKey('raw',enc.encode(env.WHATSAPP_OTP_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,enc.encode(value)));}
function pin(){let n;do{n=crypto.getRandomValues(new Uint32Array(1))[0];}while(n>=4294000000);return String(n%1000000).padStart(6,'0');}
async function reserve(env,bucket,limit,expires,t){
 return !!await sql(env,'INSERT INTO wa_auth_limits_v11266(bucket,count,expires) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN expires<=? THEN 1 ELSE count+1 END,expires=CASE WHEN expires<=? THEN excluded.expires ELSE expires END WHERE expires<=? OR count<? RETURNING count',bucket,expires,t,t,t,limit).first();
}
export function templatePayload(env,phone,code){return {messaging_product:'whatsapp',recipient_type:'individual',to:'55'+phone,type:'template',template:{name:env.WHATSAPP_AUTH_TEMPLATE,language:{code:'pt_BR'},components:[{type:'body',parameters:[{type:'text',text:code}]},{type:'button',sub_type:'url',index:'0',parameters:[{type:'text',text:code}]}]}};}
export async function whatsappRequestCode(request,env,data,send=fetch){
 if(!sameOrigin(request))return fail(403,'Origem não autorizada.');
 if(!config(env))return fail(503,'Envio por WhatsApp ainda não configurado. Tente mais tarde.');
 const phone=normalizeMobile(data?.phone);if(!phone)return fail(400,'Digite um celular brasileiro com DDD e 9 dígitos.');
 await schema(env);
 const t=now(),hour=Math.floor(t/3600),day=Math.floor(t/86400);
 const ip=await mac(env,'ip:'+String(request.headers.get('CF-Connecting-IP')||'unknown').slice(0,64));
 const pkey=await mac(env,'phone:'+phone);
 const budget=Math.max(1,Math.min(1000,Math.floor(Number(env.WHATSAPP_DAILY_LIMIT)||100)));
 await sql(env,'DELETE FROM wa_auth_limits_v11266 WHERE expires<=?',t).run();
 await sql(env,'DELETE FROM wa_otp_v11266 WHERE expires<=?',t).run();
 if(!await reserve(env,'cool:'+pkey,1,t+60,t)||
    !await reserve(env,'phone:'+pkey+':'+hour,3,(hour+1)*3600,t)||
    !await reserve(env,'ip:'+ip+':'+hour,15,(hour+1)*3600,t)||
    !await reserve(env,'global:'+day,budget,(day+1)*86400,t))return fail(429,'Muitas solicitações. Aguarde antes de pedir outro código.');
 const code=pin(),nonce=random(),hash=await mac(env,phone+':'+nonce+':'+code);
 await sql(env,'INSERT INTO wa_otp_v11266(phone,nonce,pin_hash,expires,attempts,delivered) VALUES(?,?,?,?,0,0) ON CONFLICT(phone) DO UPDATE SET nonce=excluded.nonce,pin_hash=excluded.pin_hash,expires=excluded.expires,attempts=0,delivered=0',phone,nonce,hash,t+300).run();
 try{
  const res=await send('https://graph.facebook.com/'+env.WHATSAPP_GRAPH_VERSION+'/'+env.WHATSAPP_PHONE_NUMBER_ID+'/messages',{method:'POST',headers:{Authorization:'Bearer '+env.WHATSAPP_ACCESS_TOKEN,'Content-Type':'application/json'},body:JSON.stringify(templatePayload(env,phone,code)),signal:AbortSignal.timeout(12000)});
  const result=await res.json().catch(()=>({}));
  if(!res.ok||!result.messages?.[0]?.id)throw Error('provider');
  await sql(env,'UPDATE wa_otp_v11266 SET delivered=1 WHERE phone=? AND nonce=?',phone,nonce).run();
  return json({ok:true,channel:'whatsapp',expires_in:300,retry_after:60,message:'Confira seu WhatsApp para receber o código.'});
 }catch(_){await sql(env,'DELETE FROM wa_otp_v11266 WHERE phone=? AND nonce=?',phone,nonce).run();return fail(503,'Não foi possível solicitar o código agora. Tente novamente mais tarde.');}
}
export async function whatsappConfirmCode(request,env,data){
 if(!sameOrigin(request))return fail(403,'Origem não autorizada.');
 if(!config(env))return fail(503,'Confirmação por WhatsApp indisponível.');
 const phone=normalizeMobile(data?.phone),code=String(data?.code||'');
 if(!phone||!/^\d{6}$/.test(code))return fail(400,'Digite o código de 6 números.');
 await schema(env);
 const t=now();
 const row=await sql(env,'UPDATE wa_otp_v11266 SET attempts=attempts+1 WHERE phone=? AND delivered=1 AND expires>? AND attempts<5 RETURNING nonce',phone,t).first();
 if(!row)return fail(400,'Código inválido ou expirado. Solicite outro.');
 const hash=await mac(env,phone+':'+row.nonce+':'+code);
 const claimed=await sql(env,'DELETE FROM wa_otp_v11266 WHERE phone=? AND nonce=? AND pin_hash=? AND expires>? AND delivered=1 RETURNING phone',phone,row.nonce,hash,now()).first();
 if(!claimed)return fail(400,'Código inválido ou expirado. Confira e tente novamente.');
 await sql(env,'INSERT OR IGNORE INTO usuarios(nome,numero,ultimo_login) VALUES(?,?,CURRENT_TIMESTAMP)','Participante',phone).run();
 const user=await sql(env,'SELECT id,nome FROM usuarios WHERE numero=?',phone).first();
 await sql(env,'INSERT OR IGNORE INTO perfil_acessibilidade(usuario_id) VALUES(?)',user.id).run();
 const token=random();
 await env.DB.batch([
  sql(env,'UPDATE usuarios SET ultimo_login=CURRENT_TIMESTAMP,atualizado_em=CURRENT_TIMESTAMP WHERE id=?',user.id),
  sql(env,'DELETE FROM wa_verified_sessions_v11266 WHERE usuario_id=? AND expires<=?',user.id,t),
  sql(env,'INSERT INTO wa_verified_sessions_v11266(token_hash,usuario_id,expires) VALUES(?,?,?)',await digest(token),user.id,t+30*86400)
 ]);
 return json({ok:true,name:user.nome,phone,level_token:token,message:'Número confirmado. Seu treino está pronto.'});
}
export async function verifiedAccount(request,env,phone){
 if(!sameOrigin(request))return null;
 const token=request.headers.get('Authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
 if(!token)return null;
 await schema(env);
 const user=await sql(env,'SELECT s.usuario_id,u.numero FROM wa_verified_sessions_v11266 s JOIN usuarios u ON u.id=s.usuario_id WHERE s.token_hash=? AND s.expires>?',await digest(token),now()).first();
 return user&&(phone===undefined||user.numero===phone)?user:null;
}
export async function revokeVerifiedSession(request,env){
 if(!sameOrigin(request))return;
 const token=request.headers.get('Authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];if(!token)return;
 await schema(env);await sql(env,'DELETE FROM wa_verified_sessions_v11266 WHERE token_hash=?',await digest(token)).run();
}
