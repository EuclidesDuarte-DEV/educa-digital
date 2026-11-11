import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=p=>readFileSync(p,'utf8');
const html=read('public/html/index.html');
const training=read('public/static/js/training.js');
const onboarding=read('public/static/js/onboarding.js');
const external=read('public/static/js/accessibility-external.js');
const css=read('public/static/css/responsive-v11149.css');
const sw=read('public/static/sw.js');
const cfg=read('wrangler.toml');

test('V111.49: um único acionador de acessibilidade no frontend',()=>{
  assert.equal((html.match(/id="openAccessibilitySettings"/g)||[]).length,1);
  assert.doesNotMatch(html,/id="learningAccessibilityBtn"|id="learningAccessibilityQuickBtn"|id="learningReplayGuideBtn"/);
  assert.doesNotMatch(html,/id="learningHelpActions"/);
  assert.match(external,/focusMode = document\.body\.classList\.contains\('prototype-focus'\)/);
  assert.match(external,/wrapper\.classList\.toggle\('a11y-focus-toolbar'/);
  assert.match(external,/document\.body\.appendChild\(wrapper\)/);
  assert.match(external,/observe\(document\.body, \{attributes:true,attributeFilter:\['class'\]\}\)/);
  assert.match(css,/a11y-focus-toolbar/);
});

test('V111.49: cabeçalho alinhado e botão secundário discreto',()=>{
  assert.match(css,/flex-wrap:nowrap!important/);
  assert.match(css,/home-simple-header #headerTrust \{ display:none!important/);
  assert.match(css,/#logoutBtn:not\(\[hidden\]\)/);
  assert.match(html,/id="fullscreenBtn"[^>]*title="Tela cheia"/);
  assert.match(css,/#fullscreenBtn:not\(\[hidden\]\)/);
  assert.match(css,/#fullscreenBtn svg/);
  assert.match(training,/firstName \? `Olá, \$\{firstName\}` : 'Meu treino'/);
  assert.doesNotMatch(training,/`Olá, \$\{user\.name\.split\(/);
});

test('V111.49: zero tutoriais automáticos, pré-teste continua por toque',()=>{
  assert.doesNotMatch(onboarding,/if \(!rememberedAccount\(\)\?\.phone\) start\(\)/);
  assert.doesNotMatch(training,/window\.EducaGuidedTour\?\.startAuthenticated\?\.\(user\)/);
  assert.match(training,/scheduleGuide\(bankTile,\s*\{\s*label:\s*'Faça o pré-teste'/);
  assert.match(onboarding,/replay\?\.addEventListener\('click'/);
  assert.match(training,/bankTile\.classList\.add\('landing-pretest-target'\)/);
  assert.match(training,/pretestStepBar\.hidden = !showStep/);
  assert.match(training,/function guideBankPixAction/);
  assert.doesNotMatch(training,/requestSessionFullscreenFromGesture/);
  assert.match(training,/fullscreenBtn\?\.addEventListener\('click'/);
});

test('V111.49: cache atualizado e mesmos D1 de produção e Preview',()=>{
  assert.match(sw,/(?:educa-cf11149-clean-multidevice-ui|educa-cf11150-fullscreen-toolbar|educa-cf11151-phone-entry|educa-cf11152-lia-kokoro-fluida|educa-cf11153-modo-livre-sms-contextual|educa-cf11154-home-video-cue|educa-cf11155-bank-spotlight)/);
  assert.match(sw,/responsive-v11149\.css/);
  assert.match(html,/responsive-v11149\.css\?v=11149/);
  assert.match(html,/accessibility-external\.js\?v=111(?:49|50)/);
  assert.match(html,/training\.js\?v=111(?:49|51|54)/);
  assert.match(html,/onboarding\.js\?v=11149/);
  assert.match(cfg,/database_name = "educa-digital"\s*\ndatabase_id = "25613d89-8073-40f2-af9b-91e751fb28d7"/);
  assert.match(cfg,/database_name = "educa-digital-preview"\s*\ndatabase_id = "5a3484de-9457-4343-89ff-1b7f455815c4"/);
});
