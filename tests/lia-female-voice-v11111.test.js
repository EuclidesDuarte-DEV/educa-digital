import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function make(voiceList,selection=''){
 let saved=selection;
 const window={speechSynthesis:{getVoices:()=>voiceList},localStorage:{getItem:()=>saved,setItem:(_k,v)=>saved=v}};
 vm.runInNewContext(readFileSync('public/static/js/lia-female-voice.js','utf8'),{window,console,Promise,setTimeout,clearTimeout});
 return {api:window.EducaLiaVoice,selected:()=>saved};
}
const voice=(name,lang='pt-BR')=>({name,voiceURI:name,lang});

test('seleciona Francisca brasileira antes de uma voz masculina ou genérica',()=>{
 const {api}=make([voice('Microsoft Henrique - Portuguese (Brazil)'),voice('Microsoft Maria - Portuguese (Brazil)'),voice('Microsoft Francisca Online (Natural) - Portuguese (Brazil)')]);
 assert.match(api.choose().name,/Francisca/);
});
test('jamais seleciona um nome masculino só por ser primeira voz pt-BR',()=>{
 const {api}=make([voice('Microsoft Henrique'),voice('Microsoft Antonio')]);
 assert.equal(api.choose(),null);
});
test('ignora vozes de Portugal e voz genérica de gênero desconhecido',()=>{
 const {api}=make([voice('Helia','pt-PT'),voice('Português Brasil')]);
 assert.equal(api.choose(),null);
});
test('voz desconhecida pode ser configurada manualmente, mas nome masculino é vetado',()=>{
 const generic=voice('Teste regional pt-BR'),male=voice('Microsoft Henrique');
 const {api}=make([generic,male]);
 assert.equal(api.choose(),null);
 assert.equal(api.choose([generic,male],generic.voiceURI).name,generic.name);
 assert.equal(api.choose([generic,male],male.voiceURI),null);
});
test('HTML principal e visualizações usam módulo unificado de voz feminina',()=>{
 const html=readFileSync('public/html/index.html','utf8');
 const main=readFileSync('public/static/js/free-video.js','utf8');
 const standalone=readFileSync('public/lia-realista.html','utf8');
 const preview=readFileSync('public/teste-lia-voz-video.html','utf8');
 assert.match(html,/id="freeVideoVoiceSettings"/);
 assert.match(html,/lia-female-voice\.js/);
 assert.match(main,/EducaLiaVoice\?\.choose/);
 assert.doesNotMatch(main,/voices\.find\(v=>\/\^pt/);
 assert.match(standalone,/id="chooseFemaleVoice"/);
 assert.match(preview,/id="voice"/);
});
