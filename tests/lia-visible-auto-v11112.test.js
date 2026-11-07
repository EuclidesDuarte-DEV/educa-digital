import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('public/html/index.html','utf8');
const css=readFileSync('public/static/css/lia-fotorreal.css','utf8');
const video=readFileSync('public/static/js/free-video.js','utf8');
const mode=readFileSync('public/static/js/free-mode.js','utf8');

test('V111.12: o rosto ocupa a chamada com controles secundários recolhidos',()=>{
 assert.match(html,/<details class="v112-video-more" id="freeVideoMore">/);
 assert.match(html,/id="freeVideoCaptionToggle"[^>]*aria-expanded="false"/);
 assert.match(html,/id="freeVideoVerify">Conferir identidade/);
 assert.match(css,/#freeVideoView \.v110-video-bottom\{bottom:28px/);
 assert.match(css,/#freeVideoView \.v110-video-subtitle\{[^}]*-webkit-line-clamp:2/);
 assert.match(video,/captionToggle\?\.addEventListener\('click'/);
 assert.match(video,/\$\('freeVideoMore'\)\.open=false/);
});

test('V111.12: WhatsApp, vídeo e ligação avançam sem botão obrigatório',()=>{
 assert.match(mode,/setTimeout\(\(\)=>\{state\.transitionTimer=null;continueTraining\(\);\},2800\)/);
 assert.match(mode,/if\(next\?\.id==='video'\)/);
 assert.match(mode,/if\(next\?\.id==='bank'\)/);
 assert.match(mode,/function stop\(\)\{clearTransition\(\)/);
 assert.match(html,/id="freeSummaryAuto"/);
});
