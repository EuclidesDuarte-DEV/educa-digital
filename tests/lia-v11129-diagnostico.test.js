import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('fonetizador usa distribuição navegador explícita em vez de escolher Node',()=>{const s=read('public/static/js/lia-kokoro-worker.js');assert.match(s,/spellophone@0\.2\.1\/browser/);assert.match(s,/loadVoice\('pt-br'\)/);});
test('tela diagnóstica expõe versão, erro e botão copiar',()=>{const s=read('public/testar-voz-lia.html');assert.match(s,/V111\.(29|30|32)/);assert.match(s,/Copiar diagnóstico/);assert.match(s,/getDiagnostics/);});
test('falha neural não disfarçada com Chrome se opção oficial selecionada',()=>{const s=read('public/static/js/free-video.js');assert.match(s,/selectedEngine\(\)==='padrao'\)audioOnly/);assert.match(s,/Kokoro pf_dora indisponível/);});
test('deploy de navegador sem container pago',()=>{const s=read('wrangler.toml');assert.doesNotMatch(s,/\[\[containers\]\]/);assert.match(s,/LIA_CONTAINER_ENABLED = "false"/);});
