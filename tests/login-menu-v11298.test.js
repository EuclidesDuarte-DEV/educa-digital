import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const script=readFileSync('public/static/js/training.js','utf8');
const html=readFileSync('public/html/index.html','utf8');
const mobileHtml=readFileSync('public/static/channels/web/senior-preview-v11279/index.html','utf8');

test('V112.98 — o menu do Educa+ existe nas duas entradas, sem substituir por launcher Android',()=>{
 for(const entry of [html,mobileHtml]){
  for(const id of ['homeView','learningView','freeModeEntry','startNowBtn','modulePathView','videoPracticeBtn','phoneScreen']){
   assert.ok(entry.includes('id="'+id+'"'),id);
  }
  for(const topic of ['pix','security','whatsapp','govbr']){
   assert.ok(entry.includes('data-learning-topic="'+topic+'"'),topic);
  }
 }
});
test('V112.98 — home só para explorar aparelho ou Modo Livre, menu padrão para conta registrada',()=>{
 assert.match(script,/let exploringPhoneLauncher = false/);
 assert.match(script,/if \(name === 'home' && trainingStarted && accessMode === 'registered'/);
 assert.match(script,/!exploringPhoneLauncher && !window\.EducaFreeMode\?\.isActive\?\.\(\)/);
 assert.match(script,/name = 'learning';/);
 assert.match(script,/function openLearningHub\(\) \{[\s\S]*?exploringPhoneLauncher = false/);
 assert.match(script,/openAndroidHome\?\.addEventListener\('click', \(\) => \{\s*exploringPhoneLauncher = true/);
 assert.match(script,/window\.addEventListener\('educa:system-home',[\s\S]*?openLearningHub\(\)/);
});
test('V112.98 — todas as entradas autenticadas abrem trilhas sem esperar servidor de progresso',()=>{
 assert.match(script,/saveRememberedUser\(data\.name, data\.phone, data\.level_token\);\s*closeReturnModal\(\);\s*startTraining\(\{ focus: true, boot: true \}\);\s*void loadServerProgress\(data\.phone\);/);
 assert.match(script,/saveRememberedUser\(data\.name \|\| 'Participante', data\.phone \|\| digits, data\.level_token\);\s*accountCard\.hidden = true;\s*startTraining\(\{ focus: true, boot: true \}\);\s*void loadServerProgress/);
 assert.match(script,/window\.setTimeout\(\(\) => \{\s*closeStartModal\(\);\s*startTraining\(\{ focus: true, boot: true \}\);/);
 assert.match(script,/if \(user\?\.name && user\?\.phone\) \{[\s\S]*?startTraining\(\{ focus: true, boot: true \}\);/);
});
test('V112.98 — atividade guiada começa depois do botão Quero praticar',()=>{
 assert.match(script,/if \(lessonVideos\[action\] \|\| guidedActivities\[action\]\?\.signals\) openLessonVideo/);
 assert.match(script,/videoPracticeBtn\?\.addEventListener\('click'/);
 assert.match(script,/window\.EducaGuidedAppFlow\?\.start/);
 assert.match(script,/function startTraining\([\s\S]*?openLearningHub\(\)/);
});
