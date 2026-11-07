import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import app from '../src/worker.js';
const root='https://educa.example';
const token='do-backend-secret-not-exposed';
const req=(path,method='GET',body=null,extra={})=>new Request(root+path,{
  method,headers:{Origin:root,'Content-Type':'application/json',...extra},
  body:body===null?undefined:JSON.stringify(body)
});
function mockEnv(){
  const calls=[];
  const env={LIA_CONTAINER_ENABLED:'true',LIA_ENABLED:'true',LIA_PUBLIC_VOICE_ENABLED:'false',
  LIA_BACKEND_TOKEN:token,LIA_STAFF_CODE:'codigo-equipe-lia-123',
  LIA_KOKORO:{getByName(name){assert.equal(name,'lia-kokoro-main');return {fetch:async(request)=>{
    const url=new URL(request.url);calls.push({url:url.pathname,authorization:request.headers.get('Authorization')});
    if(url.pathname==='/health')return Response.json({ok:true,voice_engine:'kokoro',female_voice_ready:true,video_enabled:false});
    if(url.pathname==='/v1/lia/speak')return Response.json({ok:true,job_id:'f'.repeat(32),viseme_cues:[]});
    throw Error('unexpected container path '+url.pathname);
  }}}}};
  return {env,calls};
}
test('V111.27: health uses private Durable Object binding, no external URL',async()=>{
 const {env,calls}=mockEnv();
 const response=await app.fetch(req('/api/avatar/health'),env);const d=await response.json();
 assert.equal(d.enabled,true);assert.equal(d.voice_ready,true);assert.equal(d.public_voice,false);
 assert.equal(calls[0].authorization,'Bearer '+token);
 assert.deepEqual(calls.map(c=>c.url),['/health']);
});
test('V111.27: staff can synthesize, public cannot until explicitly enabled',async()=>{
 const {env,calls}=mockEnv();
 const denied=await app.fetch(req('/api/avatar/speak','POST',{text:'Teste'}),env);
 assert.equal(denied.status,403);
 const allowed=await app.fetch(req('/api/avatar/speak','POST',{text:'Teste'}, {'X-Educa-Lia-Code':'codigo-equipe-lia-123'}),env);
 assert.equal(allowed.status,200);
 const info=await allowed.json();assert.equal(info.audio_url,'/api/avatar/media/'+'f'.repeat(32)+'.wav');
 assert.equal(calls.length,1);
});
test('V111.28: free deploy preserves D1, disables paid Container and MuseTalk',()=>{
 const c=readFileSync('wrangler.toml','utf8');
 assert.match(c,/main = "src\/worker.js"/);
 assert.doesNotMatch(c,/\[\[containers\]\]/);
 assert.match(c,/LIA_PUBLIC_VIDEO_ENABLED = "false"/);
 assert.match(c,/LIA_CONTAINER_ENABLED = "false"/);
 assert.match(c,/database_id = "25613d89-8073-40f2-af9b-91e751fb28d7"/);
 const docker=readFileSync('deploy/kokoro/Dockerfile','utf8');
 assert.match(docker,/PYTHONPATH=\/app:\/app\/lia_motor/);
});
