import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const html=readFileSync('public/html/index.html','utf8');
const js=readFileSync('public/static/js/free-video.js','utf8');
const worker=readFileSync('src/worker.js','utf8');
const server=readFileSync('lia_motor/server.py','utf8');
const starter=readFileSync('scripts/windows/INICIAR_LIA_VOZ_HUMANA_WINDOWS.ps1','utf8');

test('V111.52 prioriza voz feminina Kokoro na videochamada',()=>{
 assert.match(html,/id="freeVideoVoiceEngine"/);
 assert.match(html,/<option value="feminina" selected>/);
 assert.match(html,/Kokoro pf_dora · voz feminina neural|Kokoro pf_dora no navegador/);
 assert.match(js,/engine:selectedEngine\(\)/);
 assert.match(js,/selectedEngine=\(\)=>voiceEngine\?\.value==='padrao'\?'padrao':'feminina'/);
});
test('Worker valida a opção de voz e não permite parâmetros arbitrários',()=>{
 assert.match(worker,/\['feminina','padrao'\]/);
 assert.match(worker,/payload=\{text:t,style,engine\}/);
 assert.match(worker,/liaAuthorized\(request,env\)/);
});
test('A referência anterior grave não é mais o padrão do Chatterbox',()=>{
 assert.match(server,/lia_voz_feminina_pf_dora.wav/);
 assert.doesNotMatch(server,/str\(ROOT \/ 'assets' \/ 'lia_voz_referencia_demo.wav'\)/);
 assert.match(starter,/lia_voz_feminina_pf_dora.wav/);
 assert.ok(existsSync('lia_motor/gerar_referencia_feminina.py'));
 assert.ok(existsSync('scripts/windows/PREPARAR_VOZ_FEMININA_LIA_WINDOWS.ps1'));
});
