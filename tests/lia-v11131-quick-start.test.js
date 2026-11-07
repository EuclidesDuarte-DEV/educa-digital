import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
test('separa primeira fala em trechos e prossegue após terminar WAV',()=>{
 const s=read('public/static/js/free-video.js');
 assert.match(s,/function speechSegments\(text\)/);
 assert.match(s,/session\.speechQueue=chunks/);
 assert.match(s,/if\(session\.active&&session\.connected&&session\.speechQueue\.length\)/);
 assert.match(s,/startSpeechChunk\(next,serial\)/);
});
test('pré-aquece pf_dora sem Ollama ao aparecer videochamada',()=>{
 const s=read('public/static/js/free-video.js');
 assert.match(s,/if\(browser&&selectedEngine\(\)!=='padrao'\)void browser\.prepare\(\)\.catch\(\(\)=>\{\}\)/);
});
test('progresso de voz aparece na chamada e oferece tentar novamente',()=>{
 const html=read('public/html/index.html'),js=read('public/static/js/free-video.js');
 assert.match(html,/id="freeVideoVoiceProgress"/);
 assert.match(js,/getStatus\?\.\(\)/);
 assert.match(js,/Tentar voz oficial/);
 assert.match(js,/Ouvir voz oficial da LIA/);
 assert.match(js,/session\.serial\+\+;session\.speechQueue=\[\]/);
});
test('mantém descrição educativa e não afirma lip-sync fonético exato',()=>{
 const js=read('public/static/js/free-video.js');
 assert.match(js,/Pix fictício de R\$ 350/);
 assert.match(js,/vídeo original não é neural/);
 assert.match(read('public/static/sw.js'),/(?:educa-cf1113(?:1|2|3|4|5|6|7|8|9)|educa-cf11140-access-drawer|educa-cf11143-guide-start-train)/);
});
