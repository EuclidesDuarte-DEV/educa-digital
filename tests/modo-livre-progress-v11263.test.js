import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {issueLevelSession,levelProgressApi} from '../src/modo-livre-progress-v11263.js';
function database(){
 const db=new DatabaseSync(':memory:');
 db.exec('PRAGMA foreign_keys=ON;CREATE TABLE usuarios(id INTEGER PRIMARY KEY);INSERT INTO usuarios VALUES(1),(2);');
 const wrapper={
  prepare(query){
   const stmt=db.prepare(query);
   const bound=args=>({bind:(...next)=>bound(next),run:async()=>stmt.run(...args),first:async()=>stmt.get(...args)});
   return bound([]);
  },
  async batch(items){
   db.exec('BEGIN');
   try{const result=[];for(const item of items)result.push(await item.run());db.exec('COMMIT');return result;}
   catch(error){db.exec('ROLLBACK');throw error;}
  }
 };
 return {DB:wrapper};
}
test('V112.63: XP no D1 por conta, retomada e evento idempotente',async()=>{
 const env=database();const a=await issueLevelSession(env,1),b=await issueLevelSession(env,2);
 assert.match(a,/^[a-f0-9]{64}$/);assert.notEqual(a,b);
 const call=async(token,data)=>levelProgressApi(new Request('https://educa.example/api/modo-livre/nivel',{method:data?'POST':'GET',headers:token?{authorization:'Bearer '+token}:{},...(data?{body:JSON.stringify(data)}:{})}),env);
 assert.equal((await call(null)).status,401);
 const e={eventId:'test-event-0001',outcome:'safe',phone:'ignored'};
 assert.equal((await (await call(a,e)).json()).xp,20);
 assert.equal((await (await call(a,e)).json()).xp,20);
 assert.equal((await (await call(b)).json()).xp,0);
 assert.equal((await (await call(b,{...e,outcome:'risk'})).json()).xp,0);
 assert.equal((await (await call(a,{eventId:'test-event-0002',outcome:'risk'})).json()).xp,5);
 const secondDevice=await issueLevelSession(env,1);
 assert.equal((await (await call(secondDevice)).json()).xp,5);
 assert.equal((await call(a,{eventId:'test-event-0003',outcome:'anything',xp:9999})).status,400);
 assert.equal((await call('0'.repeat(64))).status,401);
});
