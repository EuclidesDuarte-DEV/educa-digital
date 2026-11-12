import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('modelo pf_dora com fonetização pt-BR em worker',()=>{const s=read('public/static/js/lia-kokoro-worker.js');assert.match(s,/VOICE='pf_dora'/);assert.match(s,/loadVoice\('pt-br'\)/);assert.match(s,/g2p.phonemes\(phrase\)/);assert.match(s,/tts.model\(input\)/);});
test('serviço sem token exposto e sem hospedagem paga',()=>{const s=read('public/static/js/lia-kokoro-worker.js');assert.doesNotMatch(s,/LIA_BACKEND_TOKEN|Bearer |secret put/);assert.match(s,/postMessage\(\{type:'audio'/);});
test('áudio real é pré-requisito do movimento labial',()=>{const s=read('public/static/js/free-video.js');assert.match(s,/if\(!startSpeechMotion\(audio,result.cues\)\)referenceMotion\(\)/);assert.match(s,/stopSpeechMotion\(\)/);});
test('Kokoro não finge ter feito vídeo neural',()=>{const s=read('public/static/js/free-video.js');assert.match(s,/vídeo original não é neural/);});
test('entrada e service worker registram motor local',()=>{assert.match(read('public/html/index.html'),/lia-kokoro-browser.js\?v=111(?:30|32|52|57)/);assert.match(read('public/static/sw.js'),/lia-kokoro-worker.js/);});

test('página diagnóstica de voz só afirma sucesso após gerar WAV',()=>{const h=read('public/testar-voz-lia.html');assert.match(h,/Gerar voz e ouvir/);assert.match(h,/synthesize\(document\.querySelector/);assert.match(h,/Não foi possível gerar pf_dora/);});
