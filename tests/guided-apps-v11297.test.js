import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const files=await Promise.all([
 readFile('public/static/js/guided-prevention-catalog-v11292.js','utf8'),
 readFile('public/static/js/guided-app-routes-v11297.js','utf8'),
 readFile('public/static/js/guided-app-flow-v11297.js','utf8'),
 readFile('public/static/js/training.js','utf8'),
 readFile('public/html/index.html','utf8'),
 readFile('public/static/channels/web/senior-preview-v11279/index.html','utf8'),
 readFile('public/static/js/web-real.js','utf8')
]);
const [catalog,rawRoutes,engine,training,web,native,webReal]=files;
const mock={window:{}};runInNewContext(catalog,mock);runInNewContext(rawRoutes,mock);
const old=['guided-link-dados','guided-falso-sequestro','guided-pix-devolucao','guided-whatsapp-voz','guided-whatsapp-loja','guided-gov-prova-vida'];
const codes=[...old,...mock.window.EducaGuidedPrevention.map(x=>x.code)];
const routes=mock.window.EducaGuidedAppRoutes;
test('V112.97: exactly 38 unique authored exercise routes, no generic quiz fallback',()=>{
 assert.equal(codes.length,38);
 assert.equal(new Set(codes).size,38);
 assert.equal(Object.keys(routes).length,38);
 assert.deepEqual(Object.keys(routes).sort(),codes.sort());
 assert.match(training,/window\.EducaGuidedAppFlow\?\.start/);
 assert.match(training,/Never substitute a detached quiz screen/);
});
test('V112.97: all original simulated apps have dedicated entries and reviewed safe actions',()=>{
 const apps=new Set(['bank','whatsapp','govbr','gmail','messages','chrome','phone','settings']);
 for(const code of codes){
  const r=routes[code];
  assert.ok(apps.has(r.app),code);
  assert.ok(r.sender?.length>3,code);
  assert.ok(r.message?.length>18,code);
  assert.ok(r.verifyAction?.length>6,code);
  assert.ok(r.verifyTitle?.length>5,code);
  assert.doesNotMatch(r.message,/https?:\/\/|\b(?:pix|transferir)\s*para\s*\d{6,}/i,code);
  if(r.app==='bank')assert.ok(['extrato','pagar','qr','cartao','ajuda'].includes(r.bankStep),code);
  if(r.app==='govbr')assert.ok(['proof','security'].includes(r.govStep),code);
 }
});
test('V112.97: front door and video preparation preserved in both channels',()=>{
 for(const html of [web,native]){
  for(const id of ['startNowBtn','learningView','freeModeEntry','modulePathView','videoPracticeBtn','phoneScreen'])
   assert.ok(html.includes('id="'+id+'"'),id);
  assert.ok(html.indexOf('/static/js/guided-app-routes-v11297.js')<html.indexOf('/static/js/training.js'));
  assert.ok(html.indexOf('/static/js/guided-app-flow-v11297.js')<html.indexOf('/static/js/training.js'));
 }
 assert.match(training,/if \(lessonVideos\[action\] \|\| guidedActivities\[action\]\?\.signals\) openLessonVideo/);
 assert.match(training,/Agora quero praticar/);
});
test('V112.97: web apps remain simulated and free mode remains separate',()=>{
 assert.match(webReal,/openGuidedApp/);
 assert.match(webReal,/!screen\?\.dataset\.guidedAppLesson\|\|isFree\(\)/);
 assert.match(engine,/window\.EducaFreeMode\?\.isActive\?\.\(\)/);
 assert.match(engine,/function startWhats/);
 assert.match(engine,/function startBank/);
 assert.match(engine,/function startGov/);
 assert.match(engine,/function startWeb/);
 assert.match(engine,/function startSettings/);
 assert.doesNotMatch(engine,/window\.open\(|window\.location\s*=|fetch\(/);
});
