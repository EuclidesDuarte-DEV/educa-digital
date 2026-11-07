import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
test('pré-aquecimento começa no modo livre, antes da chamada, sem desviar do WhatsApp',()=>{
 const free=read('public/static/js/free-mode.js');
 assert.match(free,/prewarmIntro\(\)/);
 assert.match(free,/SCRIPTED_ORDER=Object\.freeze\(\['family','video','bank'\]\)/);
});
test('cache contém apenas abertura fixa; sem armazenar falas do aluno',()=>{
 const b=read('public/static/js/lia-kokoro-browser.js');
 assert.match(b,/FIXED_INTRO=new Map/);
 assert.match(b,/INTRO_CACHE/);
 assert.match(b,/function introKey/);
 assert.match(b,/const inFlight=new Map/);
 assert.match(b,/if\(inFlight.has\(key\)\)return inFlight.get\(key\)/);
 assert.match(b,/if\(!key\)return/);
});
test('gera o próximo WAV enquanto o atual toca, mas limita a um trecho antecipado',()=>{
 const v=read('public/static/js/free-video.js');
 assert.match(v,/function prefetchNextChunk\(serial\)/);
 assert.match(v,/session\.speechQueue\[0\]/);
 assert.match(v,/audio\.onplaying=.*prefetchNextChunk\(serial\)/);
 assert.match(v,/session\.prefetched=null/);
});
test('WebGPU precisa produzir WAV antes de ser salvo na preferência; CPU permanece disponível',()=>{
 const h=read('public/testar-voz-lia.html'),b=read('public/static/js/lia-kokoro-browser.js');
 assert.match(h,/player.addEventListener\('play'/);
 assert.match(h,/WebGPU fp32/);
 assert.match(b,/localStorage.setItem\(PREF_KEY,device\)/);
 assert.match(b,/device='wasm'/);
});
test('preserva simulação educativa e sinaliza clipes de boca aproximados',()=>{
 const v=read('public/static/js/free-video.js');
 assert.match(v,/Pix fictício/);
 assert.match(v,/vídeo original não é neural/);
});
