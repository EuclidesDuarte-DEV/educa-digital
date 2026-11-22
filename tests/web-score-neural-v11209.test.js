import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {classifyTrainingTurn} from '../src/lia-neural-learning-v11196.js';

const free=readFileSync('public/static/js/free-mode.js','utf8');
const ai=readFileSync('src/free-chat.js','utf8');
const html=readFileSync('public/html/index.html','utf8');
const css=readFileSync('public/static/css/web-score-v11209.css','utf8');
const body=name=>{
 const anchor='function '+name+'(';
 const start=free.indexOf(anchor);
 assert.notEqual(start,-1,'missing '+name);
 const end=free.indexOf('\n}',start);
 assert.ok(end>start,'missing end of '+name);
 return free.slice(start,end+2);
};
const getRisk=overrides=>{
 const base={state:{conversations:new Map([
    ['family',[{role:'assistant',content:'Preciso de Pix R$ 350' }]],
    ['relative',[{role:'assistant',content:'Pode mandar o dinheiro para a despesa de treino?'}]]
   ]),riskyScenarios:new Set(),score:100},
  document:{documentElement:{dataset:{educaPlatform:'web'}},
    createElement:()=>({setAttribute(){},textContent:'',className:''})},
  visible:()=> 'chat',
  els:{wallpaper:{append(){},scrollHeight:200,scrollTop:0}},
  $:()=>({textContent:''}),syncUI:()=>{},
  ...overrides};
 const helpers=[
  'function isWebTraining(){return document.documentElement?.dataset?.educaPlatform===\'web\';}',
  body('riskyTrainingPromise'),body('registerWebRisk')
 ].join('\n');
 return {sandbox:base,check:runInNewContext(helpers+'\nriskyTrainingPromise',base),
  apply:runInNewContext(helpers+'\nregisterWebRisk',base)};
};

test('V112.09 — frases de aceite pontuam; dúvidas e verificação não são queda',()=>{
 const {check}=getRisk();
 const fake={id:'family',kind:'pix',intro:'Pode me mandar R$ 350 pelo Pix?'};
 for(const phrase of ['vou te mandar','vou te enviar','vou fazer o pix','vou transferir','vou pagar'])
  assert.equal(check(fake,phrase),true,phrase);
 for(const phrase of ['qual seu pix?','vou te mandar depois que confirmar','não vou mandar','vou conferir pelo número antigo','vou verificar'])
  assert.equal(check(fake,phrase),false,phrase);
 assert.equal(check({id:'friend',kind:'normal',intro:'Oi'},'vou te mandar'),false);
 assert.equal(getRisk({document:{documentElement:{dataset:{educaPlatform:'ios'}}}}).check(fake,'vou te mandar'),false);
});
test('V112.09 — desconto uma vez por cenário, sem transação real',()=>{
 const {sandbox,apply}=getRisk();
 const fake={id:'family',kind:'pix',intro:'Me manda R$ 350 pelo Pix'};
 apply(fake,'vou te mandar');
 assert.equal(sandbox.state.score,85);
 assert.ok(sandbox.state.riskyScenarios.has('family'));
 apply(fake,'vou te mandar');
 assert.equal(sandbox.state.score,85);
 assert.match(free,/const pixLoss=isWebTraining\(\)&&!safe\?\(commitmentLoss\?25:40\):0/);
 assert.match(free,/Pontuação: \$\{state\.score\} pontos/);
 assert.match(free,/Nenhum Pix real foi feito/);
});
test('V112.09 — Web usa RAG Neural e dificuldade; nativos mantêm a rota antiga',()=>{
 assert.match(free,/fetch\(isWebTraining\(\)\?'\/api\/modo-livre\/conversar-web':'\/api\/modo-livre\/conversar'/);
 assert.match(free,/webChallenge:\{level:Math\.min\(3,/);
 assert.match(ai,/const remembered=webOnly\?await retrieveLiaKnowledge/);
 assert.match(ai,/const focus=webOnly\?await learningHint/);
 assert.match(ai,/const paymentCue=paymentAcceptance/);
 assert.match(html,/free-mode\.js\?v=11189[^"]*&summaryscroll=11208&score=11209/);
 assert.match(html,/web-score-v11209\.css\?v=11209/);
 assert.match(css,/html\[data-educa-platform="web"\] #chatWallpaper \.free-risk-feedback/);
});
test('V112.09 — aprendizado Web classifica aceite explicitamente, sem gravar texto bruto',()=>{
 assert.equal(classifyTrainingTurn('family','vou te mandar'),'accept');
 assert.equal(classifyTrainingTurn('relative','vou te enviar'),'accept');
 assert.equal(classifyTrainingTurn('family','vou fazer o pix'),'accept');
 assert.equal(classifyTrainingTurn('family','vou conferir no número antigo'),'verify');
 assert.equal(classifyTrainingTurn('family','não vou pagar'),'refuse');
 assert.equal(classifyTrainingTurn('friend','vou te mandar'),null);
});
