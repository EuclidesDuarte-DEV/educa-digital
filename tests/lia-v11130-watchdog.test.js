import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
test('geração local tem timeout e libera Worker travado',()=>{const s=read('public/static/js/lia-kokoro-browser.js');assert.match(s,/SPEAK_LIMIT_MS=45000/);assert.match(s,/worker\.terminate\(\)/);assert.match(s,/requests\.clear\(\)/);});
test('CPU quantizada é padrão, GPU é opt-in',()=>{const w=read('public/static/js/lia-kokoro-worker.js');const b=read('public/static/js/lia-kokoro-browser.js');assert.match(b,/device='wasm'/);assert.match(w,/device==='webgpu'\?'fp32':'q8'/);});
test('diagnóstico mostra modo real, etapa e não declara sucesso precoce',()=>{const h=read('public/testar-voz-lia.html');assert.match(h,/getDiagnostics/);assert.match(h,/Ouça no botão de reprodução/);assert.match(h,/Oi! Eu sou a Lia/);});
