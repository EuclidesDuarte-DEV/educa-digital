import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {whatsappRequestCode,whatsappConfirmCode,verifiedAccount,revokeVerifiedSession} from '../src/whatsapp-auth-v11266.js';
import app from '../src/worker.js';
import {issueLevelSession} from '../src/modo-livre-progress-v11263.js';
function fixture(){
 const db=new DatabaseSync(':memory:');db.exec("CREATE TABLE usuarios(id INTEGER PRIMARY KEY,nome TEXT,numero TEXT UNIQUE,ultimo_login TEXT,atualizado_em TEXT);CREATE TABLE perfil_acessibilidade(usuario_id INTEGER PRIMARY KEY);");
 const DB={prepare(q){const stmt=db.prepare(q);const bind=args=>({bind:(...v)=>bind(v),run:async()=>stmt.run(...args),first:async()=>stmt.get(...args)});return bind([]);},async batch(stmts){db.exec('BEGIN');try{const result=[];for(const s of stmts)result.push(await s.run());db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}}};
 return {db,env:{DB,WHATSAPP_AUTH_MODE:'whatsapp',WHATSAPP_ACCESS_TOKEN:'x'.repeat(40),WHATSAPP_OTP_SECRET:'y'.repeat(64),WHATSAPP_PHONE_NUMBER_ID:'123456',WHATSAPP_AUTH_TEMPLATE:'educa_codigo_acesso',WHATSAPP_GRAPH_VERSION:'v27.0'}};
}
const req=(token)=>new Request('https://educa.example/api/login/codigo',{method:'POST',headers:{'CF-Connecting-IP':'test',...(token?{Authorization:'Bearer '+token}:{})}});
const phone='65900000001';
async function fakeSend(env,number=phone){
 let code;
 const response=await whatsappRequestCode(req(),env,{phone:number},async(url,opts)=>{assert.equal(url,'https://graph.facebook.com/v27.0/123456/messages');const data=JSON.parse(opts.body);assert.equal(data.to,'55'+number);code=data.template.components[0].parameters[0].text;assert.equal(data.template.components[1].parameters[0].text,code);return Response.json({messages:[{id:'fake'}]});});
 return {response,code};
}
test('OTP não aparece na resposta e só cria conta após confirmação; uso único',async()=>{
 const {env,db}=fixture();const {response,code}=await fakeSend(env);
 assert.equal(response.status,200);const info=await response.json();assert.equal(info.channel,'whatsapp');assert.ok(!('demo_code' in info));assert.ok(!('code' in info));assert.match(code,/^[0-9]{6}$/);
 assert.equal(db.prepare('SELECT count(*) c FROM usuarios').get().c,0);assert.notEqual(db.prepare('SELECT pin_hash FROM wa_otp_v11266').get().pin_hash,code);
 assert.equal((await whatsappRequestCode(req(),env,{phone},()=>{throw Error('should not send');})).status,429);
 const wrong=code==='000000'?'111111':'000000';assert.equal((await whatsappConfirmCode(req(),env,{phone,code:wrong})).status,400);
 const confirmed=await whatsappConfirmCode(req(),env,{phone,code});assert.equal(confirmed.status,200);const {level_token}=await confirmed.json();assert.match(level_token,/^[a-f0-9]{64}$/);
 assert.ok(await verifiedAccount(req(level_token),env,phone));assert.equal(await verifiedAccount(req(level_token),env,'65900000002'),null);
 assert.equal(await verifiedAccount(req('0'.repeat(64)),env),null);assert.equal((await whatsappConfirmCode(req(),env,{phone,code})).status,400);
 await revokeVerifiedSession(req(level_token),env);assert.equal(await verifiedAccount(req(level_token),env),null);
});
test('Preview, credenciais ausentes e falha do provedor não liberam acesso',async()=>{
 const {env}=fixture();let calls=0;const sender=async()=>{calls++;return new Response('{}',{status:500});};
 assert.equal((await whatsappRequestCode(req(),{...env,PREVIEW_DB_BOOTSTRAP:'true'},{phone},sender)).status,503);
 assert.equal((await whatsappRequestCode(req(),{...env,WHATSAPP_ACCESS_TOKEN:''},{phone},sender)).status,503);
 assert.equal(calls,0);assert.equal((await whatsappRequestCode(req(),env,{phone},sender)).status,503);assert.equal(calls,1);
 assert.equal((await whatsappConfirmCode(req(),env,{phone,code:'123456'})).status,400);
});
test('cinco tentativas erradas e expiração bloqueiam o código',async()=>{
 const {env,db}=fixture();const {code}=await fakeSend(env);
 const wrong=code==='000000'?'111111':'000000';
 for(let i=0;i<5;i++)assert.equal((await whatsappConfirmCode(req(),env,{phone,code:wrong})).status,400);
 assert.equal((await whatsappConfirmCode(req(),env,{phone,code})).status,400);
 const number='65900000002',next=await fakeSend(env,number);
 db.prepare('UPDATE wa_otp_v11266 SET expires=0 WHERE phone=?').run(number);
 assert.equal((await whatsappConfirmCode(req(),env,{phone:number,code:next.code})).status,400);
});
test('limite global e origem cruzada não disparam novas mensagens',async()=>{
 const {env}=fixture();env.WHATSAPP_DAILY_LIMIT='1';await fakeSend(env);
 let calls=0;const sender=async()=>{calls++;throw Error('not permitted');};
 assert.equal((await whatsappRequestCode(req(),env,{phone:'65900000002'},sender)).status,429);
 const cross=new Request('https://educa.example/api/login/codigo',{method:'POST',headers:{Origin:'https://other.example'}});
 assert.equal((await whatsappRequestCode(cross,env,{phone},sender)).status,403);
 assert.equal(calls,0);
});
test('Worker bloqueia cadastro sem OTP e tokens demonstrativos nas rotas privadas',async()=>{
 const {env,db}=fixture();db.prepare('INSERT INTO usuarios(id,nome,numero) VALUES(1,?,?)').run('Participante',phone);
 const old=await issueLevelSession(env,1);
 const post=(path,body)=>app.fetch(new Request('https://educa.example'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),env);
 const registration=await post('/api/conta',{phone:'65900000002'});assert.equal(registration.status,409);assert.equal((await registration.json()).needs_login,true);
 for(const path of ['/api/progresso?phone='+phone,'/api/perfil-acessibilidade?phone='+phone,'/api/modo-livre/nivel']){
  const response=await app.fetch(new Request('https://educa.example'+path,{headers:{Authorization:'Bearer '+old}}),env);
  assert.equal(response.status,401,path);
 }
});
