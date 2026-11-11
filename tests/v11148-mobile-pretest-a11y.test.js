import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const html = read('public/html/index.html');
const css = read('public/static/css/responsive-v11148.css');
const js = read('public/static/js/training.js');
const a11y = read('public/static/js/accessibility.js');
const sw = read('public/static/sw.js');
const wrangler = read('wrangler.toml');

test('V111.48: botao de audio fica exclusivamente no painel de acessibilidade', () => {
  assert.equal((html.match(/id="a11yReadNow"/g) || []).length, 1);
  const dialog = html.split('<dialog id="accessibilityDialog"')[1].split('</dialog>')[0];
  assert.match(dialog, /class="a11y-inline-reader"/);
  assert.match(dialog, /id="a11yReadNow"/);
  assert.match(dialog, /id="a11yReadStatus"/);
  assert.match(css, /\.a11y-inline-reader \.a11y-read-button\s*\{[\s\S]*?position:static!important/);
  assert.match(a11y, /dialog\?\.open/);
  assert.match(a11y, /educa:guide-step/);
});

test('V111.48: apenas um resumo do pre-teste, sem segundo cartao sobre o Android', () => {
  assert.equal((html.match(/id="pretestStepBar"/g) || []).length, 1);
  assert.match(html, /class="pretest-step-bar" hidden role="status"/);
  assert.match(css, /body\.pretest-in-progress \.preview-badge\.training-badge \{ display:none!important/);
  assert.match(js, /function syncPretestStepUI/);
  assert.match(js, /isGuestPretest && accessMode !== 'registered' && trainingStarted/);
  assert.match(js, /pretestStepBar\.hidden = !showStep/);
  assert.match(js, /'bank-home': 1, 'bank-pix': 2, 'bank-send': 3, 'bank-review': 4/);
  assert.match(js, /syncPretestStepUI\(safeName\)/);
  assert.match(js, /syncPretestStepUI\(\);/);
  assert.doesNotMatch(html, /ETAPA 4 DE 7/);
});

test('V111.48: interfaces compactas e texto ampliado sem zoom de pagina', () => {
  for (const breakpoint of ['359','360','390','391','600','601','1024']) assert.ok(css.includes(breakpoint), breakpoint);
  assert.match(css, /--ed-phone-compact/);
  assert.match(css, /#phoneHardware/);
  assert.match(css, /html\.a11y-text-extra #learningView \.learning-grid/);
  assert.match(css, /\.a11y-distinct-colors/);
  assert.doesNotMatch(css, /transform\s*:\s*scale\(|\bzoom\s*:/);
  assert.match(html, /responsive-v11148\.css\?v=11148/);
  assert.match(sw, /educa-cf11148-mobile-pretest-a11y|(?:educa-cf11149-clean-multidevice-ui|educa-cf11150-fullscreen-toolbar|educa-cf11151-phone-entry)/);
  assert.match(sw, /responsive-v11148\.css/);
});

test('V111.48: o banco oficial permanece o mesmo e o Preview isolado', () => {
  assert.match(wrangler, /database_name = "educa-digital"\s*\ndatabase_id = "25613d89-8073-40f2-af9b-91e751fb28d7"/);
  assert.match(wrangler, /\[\[previews\.d1_databases\]\]/);
  assert.match(wrangler, /database_name = "educa-digital-preview"\s*\ndatabase_id = "5a3484de-9457-4343-89ff-1b7f455815c4"/);
  assert.match(wrangler, /\[previews\.vars\]\s*\nPREVIEW_DB_BOOTSTRAP = "true"/);
});
