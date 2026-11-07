import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import app from '../src/worker.js';
const root='https://educa.example';
const job='b'.repeat(32);
const request=(path,method='GET',payload=null)=>new Request(root+path,{method,headers:{Origin:root,'Content-Type':'application/json'},body:payload===null?undefined:JSON.stringify(payload)});
const base={LIA_ENABLED:'true',LIA_BACKEND_URL:'https://voz.educa.example',LIA_BACKEND_TOKEN:'secret-long-token-for-a-test',LIA_PUBLIC_VOICE_ENABLED:'true'};

test('V111.26: vídeo MuseTalk permanece privado mesmo com voz Kokoro pública',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async(url,opts)=>{
  assert.equal(opts.headers.Authorization,'Bearer secret-long-token-for-a-test');
  if(url.endsWith('/health'))return Response.json({ok:true,female_voice_ready:true,video_enabled:true});
  if(url.endsWith('/v1/lia/speak'))return Response.json({ok:true,job_id:job,video_enabled:true});
  return Response.json({status:'ready',video_url:'/v1/media/'+job+'.mp4'});
 };
 try{
  const health=await app.fetch(request('/api/avatar/health'),base);const info=await health.json();
  assert.equal(info.public_voice,true);assert.equal(info.video_enabled,false);
  const speak=await app.fetch(request('/api/avatar/speak','POST',{text:'Oi Lia'}),base);
  assert.equal((await speak.json()).video_enabled,false);
  assert.equal((await app.fetch(request('/api/avatar/render','POST',{job_id:job}),base)).status,403);
  assert.equal((await app.fetch(request('/api/avatar/media/'+job+'.mp4'),base)).status,403);
 }finally{globalThis.fetch=original;}
});

test('V111.26: flag GPU pública libera rotas somente quando explicitamente habilitada',async()=>{
 const original=globalThis.fetch,seen=[];
 globalThis.fetch=async(url,options)=>{
  seen.push(String(url));
  assert.equal(options.headers.Authorization,'Bearer secret-long-token-for-a-test');
  if(String(url).endsWith('/health'))return Response.json({ok:true,female_voice_ready:true,video_enabled:true});
  if(String(url).endsWith('/v1/lia/speak'))return Response.json({ok:true,job_id:job,video_enabled:true});
  if(String(url).endsWith('/v1/lia/render/'+job))return Response.json({ok:true,status:'queued'});
  if(String(url).endsWith('/v1/lia/render-status/'+job))return Response.json({ok:true,status:'ready',video_url:'/v1/media/'+job+'.mp4'});
  if(String(url).endsWith('.mp4'))return new Response(new Uint8Array(4096),{headers:{'content-type':'video/mp4'}});
  throw Error('Unexpected '+url);
 };
 try{
  const env={...base,LIA_PUBLIC_VIDEO_ENABLED:'true'};
  const health=await (await app.fetch(request('/api/avatar/health'),env)).json();
  assert.equal(health.public_video,true);assert.equal(health.video_enabled,true);
  const speak=await (await app.fetch(request('/api/avatar/speak','POST',{text:'Oi Lia'}),env)).json();
  assert.equal(speak.video_enabled,true);
  const render=await (await app.fetch(request('/api/avatar/render','POST',{job_id:job}),env)).json();
  assert.equal(render.status,'queued');
  const status=await (await app.fetch(request('/api/avatar/render-status/'+job),env)).json();
  assert.equal(status.video_url,'/api/avatar/media/'+job+'.mp4');
  const media=await app.fetch(request('/api/avatar/media/'+job+'.mp4'),env);
  assert.equal(media.status,200);assert.equal(media.headers.get('content-type'),'video/mp4');
  assert.ok(seen.some(path=>path.endsWith('/v1/media/'+job+'.mp4')));
 }finally{globalThis.fetch=original;}
});

test('V111.26: site espera health remoto antes de escolher voz e inclui Dockerfile CPU',()=>{
 const js=readFileSync('public/static/js/free-video.js','utf8');
 assert.match(js,/MOTOR_CHECK_TIMEOUT_MS/);
 assert.match(js,/session\.motorPending=inspectMotor/);
 assert.match(js,/Promise\.race\(\[session\.motorPending/);
 assert.match(js,/MuseTalk · áudio e boca da resposta sincronizados/);
 assert.ok(existsSync('deploy/kokoro/Dockerfile'));
 assert.ok(existsSync('docs/historico/GUIA_KOKORO_MUSETALK_NUVEM_V11126.md'));
});
