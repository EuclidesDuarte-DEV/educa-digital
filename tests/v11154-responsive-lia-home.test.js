import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const html=read('public/html/index.html');
const training=read('public/static/js/training.js');
const video=read('public/static/js/free-video.js');
const css=read('public/static/css/responsive-v11154.css');
const sw=read('public/static/sw.js');
const db=read('wrangler.toml');

test('V111.54: dica de primeira atividade sobre Banco sem tour automático',()=>{
 assert.match(training,/function applyLandingPretest\(\)/);
 assert.match(training,/hint\.className = 'bank-start-cue'/);
 assert.match(training,/hint\.textContent = 'Toque aqui'/);
 assert.match(training,/bankTile\.appendChild\(hint\)/);
 assert.match(training,/el\.querySelector\('\.bank-start-cue'\)\?\.remove\(\)/);
 assert.match(training,/primeira atividade: toque aqui/i);
 assert.doesNotMatch(training,/scheduleGuide\(bankTile,\s*\{ label:/);
 assert.match(css,/body\.landing-pretest-active:not\(\.prototype-focus\)/);
 assert.match(css,/bank-start-cue::after/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test('V111.54: chamada usa tamanho do mockup e não largura do notebook',()=>{
 assert.match(video,/function syncLiaCallLayout\(\)/);
 assert.match(video,/ui\.view\.getBoundingClientRect\(\)/);
 assert.match(video,/ui\.view\.dataset\.liaLayout/);
 assert.match(video,/new ResizeObserver\(syncLiaCallLayout\)/);
 assert.match(video,/requestAnimationFrame\(syncLiaCallLayout\)/);
 assert.match(css,/#freeVideoView\{min-width:0;max-width:100%;overflow:hidden;container-type:inline-size/);
 assert.match(css,/\bcqw\b/);
 assert.match(css,/\.v110-video-toolbar>/);
 assert.match(css,/#phoneHardware #freeVideoView\[data-lia-layout="compact"\]/);
 assert.match(css,/#freeVideoView:not\(:fullscreen\)/);
});

test('V111.54: home desktop compacta, mobile pré-existente intacta',()=>{
 assert.match(css,/@media\(min-width:1100px\)/);
 assert.match(css,/height:72px!important/);
 assert.match(css,/padding-top:clamp\(12px,2vw,24px\)/);
 assert.match(html,/responsive-v11154\.css\?v=11154/);
 assert.match(html,/training\.js\?v=11154/);
 assert.match(html,/free-video\.js\?v=11154/);
 assert.match(sw,/educa-cf11154-home-video-cue/);
 assert.match(sw,/responsive-v11154\.css/);
});

test('V111.54: D1 produção, preview e motor Kokoro preservados',()=>{
 assert.match(db,/database_name = "educa-digital"\s*\ndatabase_id = "25613d89-8073-40f2-af9b-91e751fb28d7"/);
 assert.match(db,/database_name = "educa-digital-preview"\s*\ndatabase_id = "5a3484de-9457-4343-89ff-1b7f455815c4"/);
 assert.match(db,/LIA_CONTAINER_ENABLED = "false"/);
 assert.match(html,/lia-kokoro-browser\.js/);
 assert.match(html,/freeSmsView/);
});
