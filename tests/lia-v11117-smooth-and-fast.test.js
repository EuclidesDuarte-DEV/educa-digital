import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const js=readFileSync('public/static/js/free-video.js','utf8');
const css=readFileSync('public/static/css/lia-fotorreal.css','utf8');
const html=readFileSync('public/html/index.html','utf8');
const server=readFileSync('lia_motor/server.py','utf8');
test('V111.17 espera pelos quadros antes de trocar de video, em vez de cortar seco',()=>{
 assert.match(js,/const CROSSFADE_MS=420/);
 assert.match(js,/\/\/ Never stop the listening footage until talking video has an actual frame/);
 assert.match(js,/\/\/ Keep the last talking frame visible while the listening clip starts/);
 assert.match(js,/target\.play\(\)/);
 assert.match(css,/transition:opacity \.42s ease-in-out/);
});
test('V111.17 permite priorizar voz rapida ou video sincronizado',()=>{
 assert.match(html,/id="freeVideoLatencyMode"/);
 assert.match(html,/Resposta rápida/);
 assert.match(html,/Sincronizar a boca/);
 assert.match(js,/latencyMode\?\.value==='sinc' \? 40000 : 1100/);
 assert.match(js,/playAudio\(result\.audio_url,signal,serial,text,result\.viseme_cues\)/);
});
test('STT reconhece parcial e final, finaliza no fim da fala e evita duplicidade',()=>{
 assert.match(js,/r\.interimResults=true/);
 assert.match(js,/r\.onspeechend=/);
 assert.match(js,/if\(submitted\|\|session\.rec!==r\)return/);
 assert.match(js,/r\.onend=r\.onerror=r\.onresult=r\.onspeechend=null/);
});
test('Chatterbox carrega o perfil de voz uma vez e habilita pre-aquecimento autenticado',()=>{
 assert.match(server,/model\.prepare_conditionals/);
 assert.match(server,/preload\(authorization/);
 assert.match(server,/auth\(authorization\)/);
 assert.match(server,/audio_prompt_path=None if hasattr/);
});
