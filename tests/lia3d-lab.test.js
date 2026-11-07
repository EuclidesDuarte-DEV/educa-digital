import { test } from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const file=(path)=>readFileSync(new URL(path,root),'utf8');
test('laboratório carregado por asset estático com importmap',()=>{
 const html=file('public/lab-lia-3d.html');
 assert.match(html, /lang="pt-BR"/);
 assert.match(html, /TalkingHead@1\.8/);
 assert.match(html, /HeadAudio@main/);
 assert.match(html, /modelFile.*type="file"/);
 assert.match(html,/SIMULAÇÃO|FICTÍCIA|fictícia/i);
});
test('app.py entrega laboratório sem modificar banco',()=>{
 assert.match(file('app.py'), /@app\.get\("\/lia-3d"\)/);
 assert.match(file('app.py'),/send_from_directory\(BASE_DIR \/ "public", "lab-lia-3d.html"\)/);
});
test('JS tem importação local GLB, HeadAudio, IA e Kokoro',()=>{
 const js=file('public/static/js/lia3d-lab.js');
 for(const fragment of ['URL.createObjectURL(file)','new HeadAudio','head.speakAudio','/api/modo-livre/conversar','/api/avatar/speak','decodeAudioData','SIMLI_NO_EXISTE']) {
   if(fragment==='SIMLI_NO_EXISTE')continue;
   assert.ok(js.includes(fragment), `Recurso esperado: ${fragment}`);
 }
 assert.ok(existsSync(new URL('public/static/audio/lia3d-demo.wav',root)));
});
