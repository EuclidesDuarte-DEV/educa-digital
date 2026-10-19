import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from '../src/worker.js';

function setup(){
 const db=new DatabaseSync(':memory:');
 db.exec(readFileSync(new URL('../banco/schema.sql',import.meta.url),'utf8'));
 const d1={prepare(sql){return {bind(...args){return {
    async first(){return db.prepare(sql).get(...args)||null},
    async run(){return db.prepare(sql).run(...args)},
    async all(){return {results:db.prepare(sql).all(...args)}}
 }}}}};
 const env={DB:d1,ASSETS:{fetch:async(req)=>new Response('PUBLIC_ASSET:'+new URL(req.url).pathname)}};
 const api=async(path,method='GET',data=null)=>{
  const r=new Request('https://educa-digital.example/'+path.replace(/^\//,''),{method,headers:data?{'content-type':'application/json'}:{},body:data?JSON.stringify(data):undefined});
  const response=await worker.fetch(r,env);
  const result=await response.json();return [response.status,result];
 };
 return {db,env,api};
}

test('static / and /treino and health API',async()=>{
 const {env,api}=setup();
 assert.equal((await worker.fetch(new Request('https://x.example/'),env)).status,200);
 assert.equal(await (await worker.fetch(new Request('https://x.example/'),env)).text(),'PUBLIC_ASSET:/html/');
 assert.equal(await (await worker.fetch(new Request('https://x.example/index.html'),env)).text(),'PUBLIC_ASSET:/html/');
 assert.equal(await (await worker.fetch(new Request('https://x.example/static/css/app.css'),env)).text(),'PUBLIC_ASSET:/static/css/app.css');
 assert.equal((await worker.fetch(new Request('https://x.example/treino'),env)).status,302);
 assert.equal((await api('/api/saude'))[1].ok,true);
});
test('catalog has 22 lessons',async()=>{
 const {api}=setup(),[status,result]=await api('/api/estrutura');
 assert.equal(status,200);
 assert.equal(result.modulos.length,6);
 assert.equal(result.modulos.flatMap(m=>m.capitulos.flatMap(c=>c.atividades)).length,22);
 assert.ok(result.modulos[0].capitulos[0].atividades[0].video_url);
});
test('demo account, saved progress, code login, and accessibility',async()=>{
 const {api}=setup();
 let [status,r]=await api('/api/conta','POST',{name:'Maria Exemplo',phone:'(65) 99999-0000'});
 assert.equal(status,201);assert.equal(r.existing,false);
 [status,r]=await api('/api/conta','POST',{name:'Maria Exemplo',phone:'65999990000'});
 assert.equal(status,200);assert.equal(r.existing,true);
 [status,r]=await api('/api/progresso','POST',{phone:'65999990000',activity_code:'pix-key',event:'attempt'});
 assert.equal(status,200);assert.equal(r.tentativas,1);assert.equal(r.concluido,0);
 [status,r]=await api('/api/progresso','POST',{phone:'65999990000',activity_code:'pix-key',event:'complete'});
 assert.equal(status,200);assert.equal(r.tentativas,1);assert.equal(r.concluido,1);
 [status,r]=await api('/api/progresso?phone=65999990000');
 assert.equal(status,200);assert.equal(r.atividades.length,1);assert.equal(r.atividades[0].atividade_codigo,'pix-key');
 [status,r]=await api('/api/perfil-acessibilidade','PATCH',{phone:'65999990000',tamanho_fonte:'extra_grande',alto_contraste:true});
 assert.equal(status,200);
 [status,r]=await api('/api/perfil-acessibilidade?phone=65999990000');
 assert.equal(r.perfil.tamanho_fonte,'extra_grande');assert.equal(r.perfil.alto_contraste,1);
 [status,r]=await api('/api/login/codigo','POST',{phone:'65999990000'});
 assert.equal(status,200);const code=r.demo_code;assert.match(code,/^\d{6}$/);
 [status,r]=await api('/api/login/confirmar','POST',{phone:'65999990000',code:'000000'});
 if(code!=='000000')assert.equal(status,400);
 [status,r]=await api('/api/login/confirmar','POST',{phone:'65999990000',code});
 assert.equal(status,200);assert.equal(r.name,'Maria Exemplo');
 [status,r]=await api('/api/login/confirmar','POST',{phone:'65999990000',code});
 assert.equal(status,400);
});
test('bad data, invalid activity, unknown paths',async()=>{
 const {api}=setup();
 assert.equal((await api('/api/conta','POST',{name:'A',phone:'abc'}))[0],400);
 assert.equal((await api('/api/progresso?phone=123'))[0],400);
 assert.equal((await api('/api/login/codigo','POST',{phone:'65999991111'}))[0],404);
 assert.equal((await api('/api/missing'))[0],404);
});
