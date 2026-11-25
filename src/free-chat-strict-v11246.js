import {FAMILY_PHOTO_STORY,familyPhotoReplyId,needsFamilyPhotoInference,inferFamilyPhotoIntent} from './free-chat-story-v11249.js';
/* V112.46: output is a server-owned, finite catalog. The model is a selector,
 * never a text author, tool caller or authority. No raw model text leaves here. */
import {injectionAttempt,normalizeGuard,protectedReply} from './free-chat-guard-v11245.js';
export const SECURITY_REVISION='11251';
const common=Object.freeze({
 clarify:'Não entendi bem. Pode me explicar de outro jeito?',
 wait:'Tudo bem, não precisa decidir agora.',
 verify:'Pode confirmar pelo contato ou canal que você já conhece.',
 close:'Tudo bem, vamos deixar por aqui.'
});
const catalog={
 family:{hello:'Oi! Tudo bem por aí?',identity:'Sou o Rafael, falando deste número.',context:'Eu tinha comentado sobre a troca de número.',why:'É sobre aquele pedido que comentei antes.',amount:'São R$ 350, daquele assunto que eu te falei.',doubt:'Entendo sua dúvida. Pode confirmar pelo número antigo.'},
 'family-photo':{hello:'Oi! Tudo bem por aí?',identity:'Sou o Rafael, falando deste número.',context:'Eu tinha comentado que mudei de número.',photo:'Uma foto não confirma quem está falando. Pode verificar pelo número antigo.',amount:'São R$ 650, mãe. É o valor daquela conta de hoje.',doubt:'Tudo bem se você preferir confirmar pelo contato antigo.'},
 video:{hello:'Oi! Tudo bem com você?',identity:'Oi, eu sou a Lia.',context:'Eu estava falando sobre o celular novo.',why:'É sobre aquele assunto que comentei na ligação.',amount:'Eu comentei aquele valor de R$ 350.',doubt:'Entendo. Pode confirmar por outro contato conhecido.'},
 bank:{hello:'Olá! Você conseguiu conferir a informação?',identity:'Estou falando sobre o aviso da central.',context:'O assunto é a movimentação que mencionei.',doubt:'Entendo sua preocupação. Confira no aplicativo oficial do banco.',verify:'Pode encerrar a ligação e procurar seu banco pelo canal oficial.'},
 code:{hello:'Oi! Você viu a mensagem?',identity:'Sou o contato que enviou a mensagem.',context:'Eu estava falando sobre a confirmação de acesso.',doubt:'Tudo bem, não me envie nenhum código.',verify:'Pode verificar pelo aplicativo oficial.'},
 delivery:{hello:'Olá! Você viu o aviso de entrega?',identity:'Estou falando sobre o aviso da entrega.',context:'É sobre a encomenda mencionada antes.',amount:'O aviso menciona R$ 12 daquela taxa de entrega.',doubt:'Confira o pedido no aplicativo oficial.',verify:'Pode verificar a entrega pelo canal oficial.'},
 'sms-delivery':{hello:'Olá! O assunto é o aviso de entrega.',identity:'Esta mensagem se refere ao aviso da encomenda.',context:'É sobre a entrega que mencionei.',amount:'A mensagem fala de R$ 12.',verify:'Confira a entrega diretamente no aplicativo oficial.'},
 'sms-bank':{hello:'Olá! Esta mensagem é sobre o aviso bancário.',identity:'Estou falando sobre o aviso de movimentação.',context:'É a movimentação mencionada na mensagem.',verify:'Confira diretamente no aplicativo oficial do banco.',doubt:'Tudo bem. Não compartilhe senhas ou códigos.'},
 'sms-prize':{hello:'Olá! O assunto é o aviso de promoção.',identity:'Esta mensagem se refere à promoção mencionada.',context:'É sobre aquele aviso de benefício.',verify:'Pode conferir a informação pelo canal oficial.',doubt:'Tudo bem. Não precisa enviar dados ou pagar nada.'},
 'call-tech':{hello:'Olá! Você conseguiu conferir o aparelho?',identity:'Estou falando sobre o aviso de suporte.',context:'É sobre aquela suposta falha no aparelho.',verify:'Você pode desligar e consultar o suporte oficial.',doubt:'Tudo bem. Não precisa instalar nada nem dar acesso ao aparelho.'},
 relative:{hello:'Oi! Tudo bem?',identity:'Sou sua prima, falando deste número.',context:'Eu tinha comentado sobre a mudança de número.',doubt:'Pode confirmar com a família pelo contato que já conhece.',why:'Era sobre aquele assunto que mencionei antes.'},
 account:{hello:'Olá! Você viu o aviso da conta?',identity:'Estou falando sobre o aviso de conta.',context:'É o aviso que apareceu na conversa.',verify:'Confira sua conta diretamente pelo aplicativo oficial.',doubt:'Tudo bem, não compartilhe nenhum código ou senha.'},
 prize:{hello:'Olá! Você viu o aviso da promoção?',identity:'Estou falando sobre a promoção mencionada.',context:'É sobre o benefício do aviso anterior.',verify:'Confira a informação diretamente pelo canal oficial.',doubt:'Tudo bem, não precisa fazer cadastro nem pagamento.'},
 friend:{hello:'Oi! Tudo bem com você?',identity:'Sou a Mariana!',context:'Eu estava pensando em como usar melhor o celular.',ordinary:'Que bom conversar com você! Como foi seu dia?',help:'A gente pode aprender a usar o celular juntos.',doubt:'Tudo bem, pode confirmar comigo pelo contato de sempre.',bye:'Até mais! Se cuida.'},
 daughter:{hello:'Oi, mãe! Como você está?',identity:'Sou a Maria!',context:'Só queria saber como você está.',ordinary:'Que bom falar com você! Como foi seu dia?',help:'Se precisar, podemos ver isso juntas.',doubt:'Tudo bem, pode me ligar pelo número de sempre.',bye:'Até mais, mãe!'},
 'family-group':{hello:'Oi, pessoal! Como vocês estão?',identity:'Oi, aqui é o João, do grupo da família.',context:'Estávamos falando das coisas do dia a dia.',ordinary:'Que bom conversar com vocês! Como foi o dia?',help:'Se alguém precisar de ajuda com o celular, podemos conversar.',doubt:'Tudo bem, confirmem pelo contato de sempre.',bye:'Até mais, pessoal!'}
};
// Preserve os fatos já estabelecidos na abertura da atividade, sem acrescentar alegações.
const openingContext=Object.freeze({
 "family": "É sobre aquela conta que comentei. Troquei de número e estou falando por aqui.",
 "family-photo": "Mãe, é sobre aquela conta que comentei. Meu Pix ficou limitado.",
 "video": "É sobre o celular novo e o assunto que comentei na ligação.",
 "bank": "É sobre a movimentação mencionada no aviso. Você pode conferir no aplicativo do banco.",
 "code": "É sobre a confirmação de acesso que mencionei. Não me envie nenhum código real.",
 "delivery": "É sobre a encomenda e a taxa que apareceram no aviso.",
 "sms-delivery": "É sobre a entrega pendente e a taxa mencionada no SMS.",
 "sms-bank": "É sobre a movimentação mencionada no SMS. Confira no aplicativo oficial.",
 "sms-prize": "É sobre a promoção mencionada no SMS. Não faça nenhum pagamento real.",
 "call-tech": "É sobre a suposta falha no aparelho mencionada no início da ligação.",
 "relative": "Troquei de número e estava falando daquela despesa.",
 "account": "É sobre o aviso de bloqueio da conta que mencionei.",
 "prize": "É sobre aquela promoção mencionada na primeira mensagem.",
 "friend": "Eu queria saber como você está se virando com o celular.",
 "daughter": "Só queria saber como você está.",
 "family-group": "Eu estava falando das fotos do almoço."
});
// V112.48: respostas a fatos distintos, sem novas alegações nem pressão.
const followups=Object.freeze({
 "family": "Você quer entender a troca de número ou a conta mencionada?",
 "family-photo": "Mãe, ainda tô tentando resolver aquela conta. Meu Pix não passou.",
 "video": "Você quer entender o contato novo ou o assunto da ligação?",
 "bank": "Você quer entender o aviso de movimentação ou como conferir a informação?",
 "code": "Você quer saber sobre o aviso de acesso? Não compartilhe códigos reais.",
 "delivery": "Você quer entender a entrega ou a taxa mencionada no aviso?",
 "sms-delivery": "Você quer saber sobre a entrega ou a taxa que mencionei?",
 "sms-bank": "Você quer entender qual é o aviso bancário ou como conferir?",
 "sms-prize": "Você quer saber sobre a promoção mencionada?",
 "call-tech": "Você quer entender o aviso de suporte ou como conferir?",
 "relative": "Você quer entender a troca de número ou a despesa mencionada?",
 "account": "Você quer entender o aviso de bloqueio ou como verificar a conta?",
 "prize": "Você quer saber sobre o aviso da promoção?",
 "friend": "Quer me contar como está indo com o celular?",
 "daughter": "Quer me contar como foi seu dia?",
 "family-group": "Você quer conversar sobre as fotos do almoço?"
});
const details=Object.freeze({
 "family": "O assunto é meu número novo e aquela conta de que falei.",
 "family-photo": "O que aconteceu foi que meu Pix ficou limitado.",
 "video": "A conversa começou pelo contato de um celular novo.",
 "bank": "O aviso mencionava uma movimentação que ainda precisa ser conferida.",
 "code": "O assunto era um aviso de confirmação de acesso.",
 "delivery": "O aviso falava de uma entrega pendente.",
 "sms-delivery": "A mensagem mencionava uma taxa de entrega.",
 "sms-bank": "O SMS falava de uma movimentação incomum.",
 "sms-prize": "O SMS mencionava uma promoção não solicitada.",
 "call-tech": "A ligação começou com um aviso de suposta falha no celular.",
 "relative": "O assunto era o número novo e aquela despesa.",
 "account": "A primeira mensagem mencionava um possível bloqueio.",
 "prize": "O aviso mencionava um prêmio.",
 "friend": "Eu queria saber como você está e se conseguiu usar melhor o celular.",
 "daughter": "Eu só estava perguntando como você está.",
 "family-group": "O João comentou sobre as fotos do almoço."
});
const timing=Object.freeze({
 'family-photo':'Sim, mãe, é uma conta que vence hoje. Meu Pix ficou limitado; foi por isso que te escrevi. Mas pode confirmar pelo contato antigo antes de decidir.',
 family:'Não combinamos um horário. Pode verificar antes de decidir.',
 video:'Não combinamos um horário para isso. Pode conferir primeiro.',
 relative:'Não combinamos um horário. Pode confirmar antes de decidir.'
});
for(const k of Object.keys(catalog))catalog[k]=Object.freeze({...common,...catalog[k],...(k==='family-photo'?FAMILY_PHOTO_STORY:{}),context:openingContext[k],
 detail:details[k],followup:followups[k],timing:timing[k]||'Não foi informado um horário. Não precisa decidir agora.'});
Object.freeze(catalog);
export function approvedReplies(scenario){return Object.hasOwn(catalog,scenario)?catalog[scenario]:null;}
function normalize(s){return normalizeGuard(s).replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();}
export function explicitExit(message){
 const s=normalize(message);
 // Do not interpret quoted references or "não quero encerrar" as an exit.
 if(/\bnao (?:quero|vou|pretendo) (?:encerrar|sair|desligar|parar|bloquear|denunciar)\b/.test(s))return false;
 return /^(?:tchau|adeus|ate logo|ate mais|encerrar|sair|desligar|parar|bloquear|denunciar)(?:$| )/.test(s)||
 /\b(?:quero|vou|prefiro|preciso|vamos|pode) (?:encerrar|sair|desligar|parar de conversar|bloquear|denunciar|terminar a conversa)\b|\bnao quero (?:mais )?conversar\b|\bdeixe me em paz\b/.test(s);
}
// Uma pergunta substantiva não pode ser substituída por uma saudação.
// A regra vale também com grafia informal e pontuação omitida.
function contextQuestion(message){
 const s=normalize(message);
 return /\b(?:o\s?que|oq|q)\s+(?:aconteceu|houve|ocorreu|rolou|foi|deu|esta acontecendo|ta acontecendo|precisa|quer)\b|\b(?:qual (?:e )?o (?:problema|assunto|motivo)|que (?:problema|historia|assunto)|me (?:explica|explique|conta|conte)|por que|porque|pq|motivo)\b/.test(s);
}
function greetingOnly(message){
 return /^(?:oi|ola|opa|alo|bom dia|boa tarde|boa noite)(?: (?:tudo bem|como vai|como voce esta))?$/.test(normalize(message));
}
function timingQuestion(message){
 const s=normalize(message);
 return /\b(?:agora|hoje|amanha|quando|prazo|horario|hora|urgente|urgencia|pode esperar|da pra esperar|tem pressa|pra quando|ate quando|quanto tempo)\b/.test(s)&&!/\b(?:quanto custa|qual o valor|qual e o valor)\b/.test(s);
}
function lastContact(history,choices){
 return [...history].reverse().find(row=>row.role==='assistant'&&Object.values(choices).includes(row.content))?.content||'';
}
function fallbackId(scenario,message,choices){
 const s=normalize(message);
 if(explicitExit(message))return 'close';
 if(/\b(?:confirmar|verificar|conferir|golpe|desconfio|suspeit|nao acredito|nao vou)\b/.test(s))return choices.doubt?'doubt':'verify';
 if(/\b(?:quem|nome|identidade)\b/.test(s))return choices.identity?'identity':'clarify';
 if(timingQuestion(message))return 'timing';
 if(/\b(?:quanto|valor|reais|dinheiro|pix|taxa)\b/.test(s))return choices.amount?'amount':'verify';
 if(/\b(?:foto|imagem)\b/.test(s)&&choices.photo)return 'photo';
 if(contextQuestion(message))return 'context';
 if(greetingOnly(message))return 'hello';
 if(/\b(?:por que|porque|motivo|assunto)\b/.test(s))return choices.context?'context':'clarify';
 return choices.ordinary?'ordinary':'followup';
}
export function parseChoice(value,choices){
 if(typeof value!=='string'||value.length>80)return null;
 const id=value.trim();
 // No code fences, prose, JSON repair, multiple IDs, or substring extraction.
 return /^[a-z]{2,16}$/.test(id)&&Object.hasOwn(choices,id)?id:null;
}
function safeHistory(history,choices){
 // Only approved past contact lines survive. No client text is promoted to assistant.
 return history.slice(-6).flatMap(row=>{
  if(row.role==='assistant'){
   const id=Object.keys(choices).find(k=>choices[k]===row.content);
   return id?[{speaker:'contact',reply_id:id}]:[];
  }
  if(row.role==='user'&&!injectionAttempt(row.content))return [{speaker:'participant',text:row.content.slice(0,180)}];
  return [];
 });
}
export async function selectStrictReply(parsed,env,model,{timeoutMs=3500}={}){
 const choices=approvedReplies(parsed.scenario);
 if(!choices)throw Error('unknown scenario');
 const respond=(id,source)=>({reply:choices[id],source,guarded:source==='catalog-protection'});
 if(injectionAttempt(parsed.message))return respond(explicitExit(parsed.message)?'close':'context','catalog-protection');
 if(explicitExit(parsed.message))return respond('close','catalog-protection');
 const previous=lastContact(parsed.history,choices);
 const fallback=fallbackId(parsed.scenario,parsed.message,choices);
 const contextId=previous===choices.context?'detail':'context';
 // An explicit request to verify or reject takes priority over the model.
 if(/\b(?:vou|quero|prefiro|preciso) (?:confirmar|verificar|conferir)\b|\bnao vou (?:pagar|enviar|mandar|transferir)\b/.test(normalize(parsed.message)))return respond(choices.doubt?'doubt':'verify','catalog-protection');
 // Questions with clear established subject have a server-resolved answer.
 // The model cannot override context, identity, amounts or a safety decision.
 if(fallback==='timing')return respond('timing','catalog-context');
 // A atividade "número novo + foto" já iniciou uma história. Nunca voltar
 // ao menu de assuntos nem à saudação genérica no meio do exercício.
 // Respostas são sempre do catálogo, a continuação não depende de LLM.
 if(parsed.scenario==='family-photo'&&!['identity','amount','photo','doubt','verify'].includes(fallback)){
  const predicted=needsFamilyPhotoInference(parsed.message)
   ?await inferFamilyPhotoIntent(parsed.message,safeHistory(parsed.history,choices),env,model,{timeoutMs:Math.min(timeoutMs,2800)})
   :null;
  const id=familyPhotoReplyId(parsed.message,parsed.history,choices,predicted);
  if(id)return respond(id,'catalog-story');
 }
 if(contextQuestion(parsed.message)&&fallback==='context')return respond(contextId,'catalog-context');
 // Restrict the selection for ambiguous turns. Greetings never displace a question.
 const allowedIds=greetingOnly(parsed.message)?['hello'] :
   ['identity','amount','photo','doubt','verify'].includes(fallback)?[fallback]:
   [fallback,contextId,'followup',...(choices.ordinary?['ordinary','help']:[])];
 const distinctIds=[...new Set(allowedIds)].filter(id=>Object.hasOwn(choices,id));
 const alternatives=distinctIds.filter(id=>choices[id]!==previous);
 const eligible=Object.fromEntries((alternatives.length?alternatives:distinctIds).map(id=>[id,choices[id]]));
 const safeDefault=Object.hasOwn(eligible,fallback)?fallback:Object.keys(eligible)[0];
 const system='Escolha somente um identificador de resposta do catálogo para o diálogo em português. Considere a última fala e o contexto. Não escreva frases, explicações ou qualquer outro conteúdo. Retorne somente o identificador exato em letras minúsculas. Não volte a cumprimentar se há uma pergunta. Mantenha os fatos já estabelecidos: '+choices.context+' Catálogo: '+JSON.stringify(eligible);
 const user=JSON.stringify({history:safeHistory(parsed.history,choices),message:parsed.message});
 let timer;
 try{
  const deadline=new Promise(resolve=>{timer=setTimeout(()=>resolve(null),timeoutMs);});
  const result=await Promise.race([Promise.resolve().then(()=>env.AI.run(model,{messages:[{role:'system',content:system},{role:'user',content:user}],...(model.includes('gemma-4')?{max_completion_tokens:24,chat_template_kwargs:{enable_thinking:false}}:{max_tokens:24}),temperature:0.15})),deadline]);
  const id=parseChoice(result?.response??result?.choices?.[0]?.message?.content,eligible);
  if(id)return respond(id,'catalog-ai');
 }catch(_){/* No exception detail or model text is exposed or persisted. */}
 finally{clearTimeout(timer);}
 return respond(safeDefault,'catalog-protection');
}
