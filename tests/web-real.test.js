import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('public/html/index.html','utf8');
const js=readFileSync('public/static/js/web-real.js','utf8');
const mode=readFileSync('public/static/js/free-mode.js','utf8');
const sw=readFileSync('public/static/sw.js','utf8');
test('V109 tem uma tela única de recursos reais sem substituir o Android original',()=>{
 assert.match(html,/data-view="home"/);
 assert.match(html,/data-view="webreal"/);
 assert.match(html,/data-view="whatsapp"/);
 assert.match(html,/data-view="chat"/);
 assert.match(html,/web-real\.js\?v=109/);
 assert.match(js,/isFree\(\)/);
});
test('Camera solicita permissão e termina tracks ao sair',()=>{
 assert.match(js,/getUserMedia/);
 assert.match(js,/video:\{facingMode/);
 assert.match(js,/for\(const track of stream\.getTracks\(\)\)track\.stop\(\)/);
 assert.match(js,/visibilitychange/);
});
test('Fotos e agenda são locais, sem envio ao servidor',()=>{
 assert.match(js,/indexedDB\.open/);
 assert.match(js,/localStorage\.setItem/);
 assert.match(js,/text\/calendar/);
 assert.doesNotMatch(js,/fetch\(/);
});
test('Gmail, Play Store, Maps e YouTube abrem canais oficiais explícitos',()=>{
 for(const d of ['mail.google.com','play.google.com','google.com/maps','youtube.com'])assert.ok(js.includes(d));
 assert.match(js,/OAuth 2\.0/);
 assert.match(js,/window\.open\(u\.href/);
});
test('Telefone e SMS exigem confirmação e números válidos',()=>{
 assert.match(js,/window\.confirm\(msg\)/);
 assert.match(js,/sms:/);
 assert.match(js,/tel:/);
 assert.ok(js.includes('\\d{8,15}'));
});
test('Desafios espontâneos e IA do WhatsApp original foram mantidos',()=>{
 assert.match(mode,/schedule\(900,1450\)/);
 assert.match(mode,/\/api\/modo-livre\/conversar/);
 assert.match(mode,/app\.dataset\.openApp==='whatsapp'/);
 assert.match(sw,/web-real\.js|educa-cf11147-phone-only-responsive-a11y/);
});
