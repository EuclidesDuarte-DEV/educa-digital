import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => readFileSync(file, 'utf8');
const html = read('public/html/index.html');
const js = read('public/static/js/training.js');
const css = read('public/static/css/phone-entry-v11151.css');
const sw = read('public/static/sw.js');
const config = read('wrangler.toml');

test('V111.51: modal tem um telefone e um botão principal', () => {
  const modal = html.split('id="startModal"')[1].split('id="returnModal"')[0];
  const form = modal.split('id="quickStartForm"')[1].split('</form>')[0];
  assert.equal((form.match(/<input /g) || []).length, 1);
  assert.equal((form.match(/type="submit"/g) || []).length, 1);
  assert.match(modal, /id="startModalTitle">Digite seu celular/);
  assert.match(form, /id="quickPhone"[^>]+inputmode="numeric"/);
  assert.match(form, /id="quickSaveBtn" type="submit">Continuar/);
  assert.doesNotMatch(modal, /Já tenho conta|Aprender sem cadastro|quickSkipBtn|startAlreadyHaveAccount|Agora não/);
  assert.doesNotMatch(form, /name="quickName"|type="password"|type="email"|type="text"/);
  assert.match(form, /role="alert" aria-live="polite"/);
});

test('V111.51: fluxo reconhece automaticamente conta antiga e não repete o telefone', () => {
  assert.match(js, /async function openExistingAccountCode\(phone\)/);
  assert.match(js, /if \(!response\.ok && data\.needs_login\)/);
  assert.match(js, /await openExistingAccountCode\(digits\)/);
  assert.match(js, /returnPhoneStep\.hidden = true;\s*returnCodeStep\.hidden = false/);
  assert.match(js, /returningPhone = digits/);
  assert.match(js, /'\/api\/login\/codigo'/);
  assert.match(js, /'\/api\/login\/confirmar'/);
  assert.doesNotMatch(js, /#quickSkipBtn|#startAlreadyHaveAccount/);
  assert.match(js, /quickSaveBtn\.textContent = 'Continuar'/);
});

test('V111.51: visual conciso, responsivo e cache atualizado', () => {
  assert.match(css, /\.start-dialog\.start-dialog-simple/);
  assert.match(css, /#quickSaveBtn/);
  assert.match(css, /max-height:calc\(100dvh - 32px\)/);
  assert.match(css, /min-height:56px/);
  assert.match(css, /@media\(max-width:359px\)/);
  assert.match(html, /phone-entry-v11151\.css\?v=11151/);
  assert.match(html, /training\.js\?v=11151/);
  assert.match(sw, /(?:educa-cf11151-phone-entry|educa-cf11152-lia-kokoro-fluida|educa-cf11153-modo-livre-sms-contextual)/);
  assert.match(sw, /phone-entry-v11151\.css/);
});

test('V111.51: D1 oficial e D1 preview continuam separados', () => {
  assert.match(config, /database_name = "educa-digital"\s*\ndatabase_id = "25613d89-8073-40f2-af9b-91e751fb28d7"/);
  assert.match(config, /database_name = "educa-digital-preview"\s*\ndatabase_id = "5a3484de-9457-4343-89ff-1b7f455815c4"/);
});
