import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const html=readFileSync('public/html/index.html','utf8');
const js=readFileSync('public/static/js/free-video.js','utf8');
const css=readFileSync('public/static/css/lia-fotorreal.css','utf8');
test('Lia tem estado de ESCUTA animada e estado de FALA em vídeos diferentes',()=>{
 assert.match(html,/id="liaPhotoIdle"/);assert.match(html,/id="liaPhotoSpeech"/);
 assert.match(js,/function idleMotion\(/);assert.match(js,/function referenceMotion\(/);
 assert.match(js,/function toListening\(/);assert.match(css,/lia-photo-speaking/);
});
test('Clipes da usuária estão disponíveis e removidos da voz original',()=>{
 for(const name of ['lia-ouvindo.mp4','lia-conversando-a.mp4','lia-conversando-b.mp4','lia-conversando-c.mp4']){
  assert.ok(statSync('public/static/videos/'+name).size>40_000);
 }
});
test('Vídeo começa quando a voz começa; ao terminar retorna a ouvir',()=>{
 assert.match(js,/u\.onstart=.*referenceMotion/s);assert.match(js,/audio\.onplaying=.*referenceMotion/s);
 assert.match(js,/u\.onend=.*completed/s);assert.match(js,/audio\.onended=.*completed/s);
 assert.match(js,/function completed\(\).*clearMedia/s);
 assert.match(js,/function clearMedia\(\).*idleMotion/s);
});
test('A IA real continua em uso e não há promessa de lipsync exato',()=>{
 assert.match(readFileSync('public/static/js/free-mode.js','utf8'),/\/api\/modo-livre\/conversar/);
 assert.match(js,/fonemas são aproximados/);assert.match(js,/MuseTalk/);
 assert.doesNotMatch(js,/simli-client|simli\.ai/);
});
