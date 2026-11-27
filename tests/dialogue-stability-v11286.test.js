import test from 'node:test';
import assert from 'node:assert/strict';
import {approvedReplies,selectStrictReply} from '../src/free-chat-strict-v11246.js';
const env={AI:{run:async()=>({response:'unapproved_response'})}};
const model='test-model';
test('V112.86: a repeated approved line does not become a dialogue loop',async()=>{
 const choices=approvedReplies('video');
 const parsed={scenario:'video',message:'Oi',history:[{role:'assistant',content:choices.hello}]};
 const result=await selectStrictReply(parsed,env,model);
 assert.notEqual(result.reply,choices.hello);
 assert.ok(Object.values(choices).includes(result.reply));
});
test('V112.86: normal questions retain the selected scenario and established facts',async()=>{
 for(const scenario of ['video','family-photo']){
  const choices=approvedReplies(scenario);
  const result=await selectStrictReply({scenario,message:'Qual o valor?',history:[]},env,model);
  assert.equal(result.reply,choices.amount);
 }
});
test('V112.86: exit is respected even after multiple dialogue turns',async()=>{
 for(const scenario of ['video','family-photo','bank']){
  const choices=approvedReplies(scenario);
  const result=await selectStrictReply({scenario,message:'Quero encerrar',history:[{role:'assistant',content:choices.context}]},env,model);
  assert.equal(result.reply,choices.close);
 }
});
test('V112.86: invalid model output cannot become a message to the participant',async()=>{
 const choices=approvedReplies('video');
 const result=await selectStrictReply({scenario:'video',message:'Pode explicar melhor?',history:[]},env,model);
 assert.ok(Object.values(choices).includes(result.reply));
 assert.notEqual(result.reply,'unapproved_response');
});
