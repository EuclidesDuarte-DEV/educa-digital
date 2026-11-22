import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import vm from 'node:vm';

const free=readFileSync('public/static/js/free-mode.js','utf8');
const profile=readFileSync('public/static/js/web-contact-profile-v11214.js','utf8');
const css=readFileSync('public/static/css/web-contact-profile-v11214.css','utf8');
const html=readFileSync('public/html/index.html','utf8');
const prompt=readFileSync('src/free-chat.js','utf8');
const photo='public/static/img/free-family-photo-v11214.webp';

test('V112.14: foto estática nova de resolução maior, não texto fingindo comprovação',()=>{
 const b=readFileSync(photo);
 assert.ok(statSync(photo).size>7000);
 assert.equal(b.toString('ascii',0,4),'RIFF');
 assert.equal(b.toString('ascii',8,12),'WEBP');
 assert.match(free,/photoUrl:'\/static\/img\/free-family-photo-v11214\.webp'/);
 assert.match(free,/intro:'Oi, é o Rafa\. Troquei de número, salva esse aqui pra mim\.'/);
 assert.match(free,/photoAsk:'Mãe, tô com uma conta pra pagar hoje/);
 assert.doesNotMatch(free,/Olha a foto que tirei agora/);
 assert.match(free,/renderPhoto\(s\)/);
 assert.match(prompt,/sem anunciar ou justificar a foto/);
 assert.match(free,/WEB_SCRIPTED_ORDER=Object\.freeze\(\['family-photo','video','bank'\]\)/);
});
test('V112.14: perfil é script Web independente, com menu, busca, ações e acessibilidade',()=>{
 assert.doesNotThrow(()=>new vm.Script(profile));
 assert.match(profile,/dataset\.educaPlatform!=='web'/);
 assert.match(profile,/currentScenario\?\.\(\)==='family-photo'/);
 assert.match(profile,/freeContactProfileLayer/);
 for(const label of ['Dados do contato','Mídia, links e docs','Pesquisar','Notificações','Tema da conversa','Mensagens temporárias','Bloquear contato','Denunciar contato','Favoritos']) assert.ok(profile.includes(label),label);
 assert.match(profile,/PHOTO='\/static\/img\/free-family-photo-v11214\.webp'/);
 assert.match(profile,/free-training-photo img/);
 for(const label of ['Liberar espaço de armazenamento','Salvar no Fotos','Idioma de transcrição','Trancar conversa','Conversa restrita','Criptografia','Grupos em comum','Compartilhar contato']) assert.ok(profile.includes(label),'falta opção: '+label);
 for(const action of ['storage','save','transcribe','lock','restricted','encryption','group','share']) assert.ok(profile.includes("data-fc=\""+action+"\""),'ação indisponível: '+action);
 assert.match(profile,/Object\.hasOwn\(demonstrations,name\)/);
 assert.match(profile,/freeFamilyBlock/);
 assert.match(profile,/reportContact/);
 assert.match(profile,/event.*Escape|e\.key==='Escape'/);
 assert.match(profile,/role','dialog'/);
 assert.match(css,/html\[data-educa-platform="web"\] #chatView/);
 assert.match(css,/overflow-y:auto/);
 assert.match(css,/z-index:105/);
 assert.match(html,/web-contact-profile-v11214\.js\?v=11214/);
 assert.match(html,/web-contact-profile-v11214\.css\?v=11214/);
 assert.match(html,/familyphoto=11212&flow=11214/);
});
test('V112.14: bloqueio e denúncia são apenas educativos, Android/iOS sem alteração',()=>{
 assert.match(free,/reportContact:\(\)=>\{if\(isWebTraining\(\)/);
 assert.match(free,/finish\('safe','Você denunciou e bloqueou o contato suspeito/);
 assert.match(free,/const SCRIPTED_ORDER=Object\.freeze\(\['family','video','bank'\]\)/);
 assert.doesNotMatch(profile,/navigator\.contacts|PaymentRequest|fetch\(|XMLHttpRequest|localStorage|sessionStorage/);
});
