import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const worker=readFileSync('src/worker.js','utf8');
const js=readFileSync('public/static/js/free-video.js','utf8');
const server=readFileSync('lia_motor/server.py','utf8');
test('Código protegido verificado antes de renderização na UI',()=>{
 assert.match(js,/\/api\/avatar\/check/);
 assert.match(worker,/liaAuthorized\(request,env\)/);
 assert.match(worker,/route==='check'/);
 assert.match(js,/session\.renderReady=true/);
});
test('Lia distingue vídeo realista controlado pela voz e vídeo neural',()=>{
 assert.match(js,/fonemas são aproximados/);
 assert.match(js,/blob\.size<1024/);
 assert.match(js,/video_enabled/);
 assert.match(server,/gestures_generated.*False/);
 assert.doesNotMatch(js,/simli\.ai|simli-client/);
});
