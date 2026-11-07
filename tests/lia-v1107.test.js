import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import worker from '../src/worker.js';
const js=readFileSync('public/static/js/neural-avatar.js','utf8');
const ui=readFileSync('public/static/js/free-video.js','utf8');
const html=readFileSync('public/html/index.html','utf8');
const req=(url,opts={})=>worker.fetch(new Request('https://educa.example'+url,opts),{});
const serverEnv={LIA_ENABLED:'true',LIA_BACKEND_URL:'https://lia.private.example',LIA_BACKEND_TOKEN:'server-secret-keep-private',LIA_STAFF_CODE:'private-test-code'};
const clientHeaders={'X-Educa-Lia-Code':'private-test-code',Origin:'https://educa.example'};

test('Disabled by default; does not require D1, no Simli/Azure routes',async()=>{
 const r=await req('/api/avatar/health');assert.equal(r.status,200);assert.equal((await r.json()).enabled,false);
 assert.equal((await req('/api/avatar/speak',{method:'POST',body:'{}'})).status,503);
 assert.equal((await req('/api/avatar/neural-session',{method:'POST'})).status,404);
 assert.equal((await req('/api/avatar/speech-token')).status,404);
 assert.doesNotMatch(js,/simli-client|api\.simli\.ai|\.sendAudioData/);
 assert.doesNotMatch(html,/azure-viseme/);
 assert.match(ui,/playVideo/);
 assert.match(html,/SIMULAÇÃO COM IA/);
 assert.equal(existsSync('lia_motor/assets/lia_idle.mp4'),true);
});
test('Without staff code and correct origin, requests are denied before backend calls',async()=>{
 let hits=0;const original=globalThis.fetch;globalThis.fetch=async()=>{hits++;throw new Error('should not be called')};
 try{
  let r=await worker.fetch(new Request('https://educa.example/api/avatar/speak',{method:'POST',body:'{}'}),serverEnv);
  assert.equal(r.status,403);
  r=await worker.fetch(new Request('https://educa.example/api/avatar/speak',{method:'POST',headers:{...clientHeaders,Origin:'https://other.example'},body:'{}'}),serverEnv);
  assert.equal(r.status,403);assert.equal(hits,0);
 }finally{globalThis.fetch=original;}
});
test('Kokoro proxy, video render proxy, and media proxy keep backend token private',async()=>{
 const original=globalThis.fetch;let calls=[];
 globalThis.fetch=async(url,opts)=>{
  calls.push([url,opts.headers.Authorization]);
  assert.equal(opts.headers.Authorization,'Bearer server-secret-keep-private');
  if(String(url).endsWith('/health'))return Response.json({ok:true,video_enabled:true});
  if(String(url).endsWith('/v1/lia/speak'))return Response.json({ok:true,job_id:'a'.repeat(32),audio_url:'/v1/media/'+'a'.repeat(32)+'.wav',video_enabled:true});
  if(String(url).endsWith('/v1/lia/render/'+'a'.repeat(32)))return Response.json({ok:true,status:'queued'});
  if(String(url).endsWith('/v1/lia/render-status/'+'a'.repeat(32)))return Response.json({ok:true,status:'ready',video_url:'/v1/media/'+'a'.repeat(32)+'.mp4'});
  if(String(url).endsWith('.mp4'))return new Response(new Uint8Array([0,0,0,4]),{headers:{'Content-Type':'video/mp4'}});
  throw new Error('unknown fetch');
 };
 try{
  const health=await worker.fetch(new Request('https://educa.example/api/avatar/health'),serverEnv);
  assert.deepEqual((await health.json()).video_enabled,true);
  const r=await worker.fetch(new Request('https://educa.example/api/avatar/speak',{method:'POST',headers:clientHeaders,body:JSON.stringify({text:'Olá, vamos fazer um treino.'})}),serverEnv);
  const body=await r.json();assert.equal(r.status,200);assert.equal(body.audio_url,'/api/avatar/media/'+'a'.repeat(32)+'.wav');
  assert.ok(!JSON.stringify(body).includes('server-secret'));
  const render=await worker.fetch(new Request('https://educa.example/api/avatar/render',{method:'POST',headers:clientHeaders,body:JSON.stringify({job_id:'a'.repeat(32)})}),serverEnv);
  assert.equal((await render.json()).status,'queued');
  const status=await worker.fetch(new Request('https://educa.example/api/avatar/render-status/'+'a'.repeat(32),{headers:clientHeaders}),serverEnv);
  assert.equal((await status.json()).video_url,'/api/avatar/media/'+'a'.repeat(32)+'.mp4');
  const media=await worker.fetch(new Request('https://educa.example/api/avatar/media/'+'a'.repeat(32)+'.mp4',{headers:clientHeaders}),serverEnv);
  assert.equal(media.status,200);assert.equal(media.headers.get('Content-Type'),'video/mp4');
  assert.equal(calls.length,5);
 }finally{globalThis.fetch=original;}
});
test('Bad IDs and voice text are blocked before reaching own server',async()=>{
 const invalid=await worker.fetch(new Request('https://educa.example/api/avatar/render',{method:'POST',headers:clientHeaders,body:'{"job_id":"../../bad"}'}),serverEnv);
 assert.equal(invalid.status,400);
 const bad=await worker.fetch(new Request('https://educa.example/api/avatar/speak',{method:'POST',headers:clientHeaders,body:JSON.stringify({text:''})}),serverEnv);
 assert.equal(bad.status,400);
});
