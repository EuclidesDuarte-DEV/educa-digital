import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const worker=readFileSync('src/worker.js','utf8');
const js=readFileSync('public/static/js/free-video.js','utf8');
const html=readFileSync('public/html/index.html','utf8');
const server=readFileSync('lia_motor/server.py','utf8');

test('V111.16 permite selecionar prosódia sem mudar avatar ou IA',()=>{
 assert.match(html,/id="freeVideoVoiceStyle"/);
 assert.match(html,/value="natural"/);
 assert.match(html,/value="calma"/);
 assert.match(html,/value="clara"/);
 assert.match(js,/style:selectedStyle\(\)/);
 assert.match(js,/selectedStyle\(\)==='calma'/);
});
test('Worker valida estilo de fala e preserva autenticação do motor',()=>{
 assert.match(worker,/\['natural','calma','clara'\]/);
 assert.match(worker,/payload=\{text:t,style,engine\}/);
 assert.match(worker,/liaAuthorized\(request,env\)/);
});
test('Chatterbox V3 opcional preserva Kokoro como padrão',()=>{
 assert.match(server,/LIA_TTS_ENGINE', 'kokoro'/);
 assert.match(server,/ChatterboxMultilingualTTS.from_pretrained\(device=device, t3_model='v3'\)/);
 assert.match(server,/language_id='pt'/);
 assert.match(server,/audio_prompt_path=/);
 assert.match(server,/join_audio\(chunks, rate, request.style\)/);
});
