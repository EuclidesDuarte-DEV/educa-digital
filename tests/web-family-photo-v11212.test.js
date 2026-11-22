import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validarMensagem} from '../src/free-chat.js';
import {classifyTrainingTurn} from '../src/lia-neural-learning-v11196.js';
const free=readFileSync('public/static/js/free-mode.js','utf8');
const css=readFileSync('public/static/css/web-family-photo-v11212.css','utf8');
const html=readFileSync('public/html/index.html','utf8');
const chat=readFileSync('src/free-chat.js','utf8');
const gamification=readFileSync('public/static/channels/web/gamification-v11182.js','utf8');
const dialogue=readFileSync('public/static/channels/web/dialogue-v11183.js','utf8');

test('V112.12: personagem fictício envia foto ANTES do pedido de Pix e só na Web',()=>{
 assert.match(free,/id:'family-photo',channel:'whatsapp'/);
 assert.match(free,/photoUrl:'\/static\/img\/free-family-photo-v11212\.jpg'/);
 assert.match(free,/photoAsk:'Estou precisando pagar uma conta hoje/);
 assert.match(free,/if\(isWebTraining\(\)&&s\.photoUrl&&s\.photoAsk/);
 assert.match(free,/renderPhoto\(s\)/);
 assert.match(free,/isWebTraining\(\)\?\[byId\['family-photo'\]\]:\[\]/);
 assert.match(free,/isWebTraining\(\)&&!state\.completedSteps\.has\('family-photo'\)/);
 assert.match(free,/state\.completedSteps\.add\(s\.id\)/);
 assert.match(css,/html\[data-educa-platform="web"\] #chatWallpaper \.message\.incoming\.free-training-photo/);
 assert.match(css,/object-fit:cover/);
 assert.match(html,/web-family-photo-v11212\.css\?v=11212/);
 assert.match(html,/familyphoto=11212/);
});
test('V112.12: Neural reconhece pedido por foto, rejeita dados reais e mantém nativos isolados',()=>{
 assert.equal(validarMensagem({scenario:'family-photo',message:'Essa foto é mesmo sua?',history:[]}).scenario,'family-photo');
 assert.match(chat,/parsed\.scenario==='family-photo'&&!webOnly/);
 assert.match(chat,/FOTO TOTALMENTE SINTÉTICA/);
 assert.match(chat,/R\$ 650 FICTÍCIOS/);
 assert.match(chat,/sem.*?real|pagamento real/);
 assert.match(gamification,/'family-photo'/);
 assert.match(dialogue,/'family-photo'/);
});
test('V112.12: sinais consentidos são reconhecidos sem guardar foto ou conversa',()=>{
 assert.equal(classifyTrainingTurn('family-photo','vou te mandar'),'accept');
 assert.equal(classifyTrainingTurn('family-photo','não vou mandar'),'refuse');
 assert.equal(classifyTrainingTurn('family-photo','vou confirmar pelo número antigo'),'verify');
 assert.equal(classifyTrainingTurn('daughter','vou te mandar'),null);
 assert.doesNotMatch(css,/https?:\/\//);
});
