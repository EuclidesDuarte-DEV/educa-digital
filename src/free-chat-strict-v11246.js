/* V112.46: output is a server-owned, finite catalog. The model is a selector,
 * never a text author, tool caller or authority. No raw model text leaves here. */
import {injectionAttempt,normalizeGuard,protectedReply} from './free-chat-guard-v11245.js';
export const SECURITY_REVISION='11246';
const common=Object.freeze({
 clarify:'Não entendi bem. Pode me explicar de outro jeito?',
 wait:'Tudo bem, não precisa decidir agora.',
 verify:'Pode confirmar pelo contato ou canal que você já conhece.',
 close:'Tudo bem, vamos deixar por aqui.'
});
const catalog={
 family:{hello:'Oi! Tudo bem por aí?',identity:'Sou o Rafael, falando deste número.',context:'Eu tinha comentado sobre a troca de número.',why:'É sobre aquele pedido que comentei antes.',amount:'São R$ 350 de treino. Não envie dinheiro de verdade.',doubt:'Entendo sua dúvida. Pode confirmar pelo número antigo.'},
 'family-photo':{hello:'Oi! Tudo bem por aí?',identity:'Sou o Rafael, falando deste número.',context:'Eu tinha comentado que mudei de número.',photo:'Uma foto não confirma quem está falando. Pode verificar pelo número antigo.',amount:'São R$ 650 fictícios. Não faça nenhum pagamento real.',doubt:'Tudo bem se você preferir confirmar pelo contato antigo.'},
 video:{hello:'Oi! Tudo bem com você?',identity:'Sou a Lia, neste contato de treino.',context:'Eu estava falando sobre o celular novo.',why:'É sobre aquele assunto que comentei na ligação.',amount:'São R$ 350 fictícios, apenas no banco de treinamento.',doubt:'Entendo. Pode confirmar por outro contato conhecido.'},
 bank:{hello:'Olá! Você conseguiu conferir a informação?',identity:'Estou falando sobre o aviso da central.',context:'O assunto é a movimentação que mencionei.',doubt:'Entendo sua preocupação. Confira no aplicativo oficial do banco.',verify:'Pode encerrar a ligação e procurar seu banco pelo canal oficial.'},
 code:{hello:'Oi! Você viu a mensagem?',identity:'Sou o contato que enviou a mensagem.',context:'Eu estava falando sobre a confirmação de acesso.',doubt:'Tudo bem, não me envie nenhum código.',verify:'Pode verificar pelo aplicativo oficial.'},
 delivery:{hello:'Olá! Você viu o aviso de entrega?',identity:'Estou falando sobre o aviso da entrega.',context:'É sobre a encomenda mencionada antes.',amount:'O aviso menciona R$ 12 fictícios. Não pague nada de verdade.',doubt:'Confira o pedido no aplicativo oficial.',verify:'Pode verificar a entrega pelo canal oficial.'},
 'sms-delivery':{hello:'Olá! O assunto é o aviso de entrega.',identity:'Esta mensagem se refere ao aviso da encomenda.',context:'É sobre a entrega que mencionei.',amount:'O valor mencionado é R$ 12 fictícios.',verify:'Confira a entrega diretamente no aplicativo oficial.'},
 'sms-bank':{hello:'Olá! Esta mensagem é sobre o aviso bancário.',identity:'Estou falando sobre o aviso de movimentação.',context:'É a movimentação mencionada na mensagem.',verify:'Confira diretamente no aplicativo oficial do banco.',doubt:'Tudo bem. Não compartilhe senhas ou códigos.'},
 'sms-prize':{hello:'Olá! O assunto é o aviso de promoção.',identity:'Esta mensagem se refere à promoção mencionada.',context:'É sobre aquele aviso de benefício.',verify:'Pode conferir a informação pelo canal oficial.',doubt:'Tudo bem. Não precisa enviar dados ou pagar nada.'},
 'call-tech':{hello:'Olá! Você conseguiu conferir o aparelho?',identity:'Estou falando sobre o aviso de suporte.',context:'É sobre aquela suposta falha no aparelho.',verify:'Você pode desligar e consultar o suporte oficial.',doubt:'Tudo bem. Não precisa instalar nada nem dar acesso ao aparelho.'},
 relative:{hello:'Oi! Tudo bem?',identity:'Sou sua prima, falando deste número.',context:'Eu tinha comentado sobre a mudança de número.',doubt:'Pode confirmar com a família pelo contato que já conhece.',why:'Era sobre aquele assunto que mencionei antes.'},
 account:{hello:'Olá! Você viu o aviso da conta?',identity:'Estou falando sobre o aviso de conta.',context:'É o aviso que apareceu na conversa.',verify:'Confira sua conta diretamente pelo aplicativo oficial.',doubt:'Tudo bem, não compartilhe nenhum código ou senha.'},
 prize:{hello:'Olá! Você viu o aviso da promoção?',identity:'Estou falando sobre a promoção mencionada.',context:'É sobre o benefício do aviso anterior.',verify:'Confira a informação diretamente pelo canal oficial.',doubt:'Tudo bem, não precisa fazer cadastro nem pagamento.'},
 friend:{hello:'Oi! Tudo bem com você?',identity:'Sou a Mariana!',context:'Eu estava pensando em como usar melhor o celular.',ordinary:'Que bom conversar com você! Como foi seu dia?',help:'A gente pode aprender a usar o celular juntos.',doubt:'Tudo bem, pode confirmar comigo pelo contato de sempre.',bye:'Até mais! Se cuida.'},
 daughter:{hello:'Oi, mãe! Como você está?',identity:'Sou a Maria!',context:'Só queria saber como você está.',ordinary:'Que bom falar com você! Como foi seu dia?',help:'Se precisar, podemos ver isso juntas.',doubt:'Tudo bem, pode me ligar pelo número de sempre.',bye:'Até mais, mãe!'},
 'family-group':{hello:'Oi, pessoal! Como vocês estão?',identity:'Oi! Aqui é alguém do grupo da família.',context:'Estávamos falando das coisas do dia a dia.',ordinary:'Que bom conversar com vocês! Como foi o dia?',help:'Se alguém precisar de ajuda com o celular, podemos conversar.',doubt:'Tudo bem, confirmem pelo contato de sempre.',bye:'Até mais, pessoal!'}
};
for(const k of Object.keys(catalog))catalog[k]=Object.freeze({...common,...catalog[k]});
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
function fallbackId(scenario,message,choices){
 const s=normalize(message);
 if(explicitExit(message))return 'close';
 if(/\b(?:confirmar|verificar|conferir|golpe|desconfio|suspeit|nao acredito|nao vou)\b/.test(s))return choices.doubt?'doubt':'verify';
 if(/\b(?:quem|nome|identidade)\b/.test(s))return choices.identity?'identity':'clarify';
 if(/\b(?:quanto|valor|reais|dinheiro|pix|taxa)\b/.test(s))return choices.amount?'amount':'verify';
 if(/\b(?:foto|imagem)\b/.test(s)&&choices.photo)return 'photo';
 if(/^(?:oi|ola|bom dia|boa tarde|boa noite|alo)(?:$| )/.test(s))return 'hello';
 if(/\b(?:por que|porque|motivo|assunto)\b/.test(s))return choices.context?'context':'clarify';
 return choices.ordinary?'ordinary':'clarify';
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
export async function selectStrictReply(parsed,env,model){
 const choices=approvedReplies(parsed.scenario);
 if(!choices)throw Error('unknown scenario');
 const respond=(id,source)=>({reply:choices[id],source,guarded:source!=='catalog-ai'});
 if(injectionAttempt(parsed.message))return {reply:protectedReply(parsed.scenario,parsed.message),source:'catalog-protection',guarded:true};
 if(explicitExit(parsed.message))return respond('close','catalog-protection');
 const fallback=fallbackId(parsed.scenario,parsed.message,choices);
 // An explicit request to verify or reject takes priority over the model.
 if(/\b(?:vou|quero|prefiro|preciso) (?:confirmar|verificar|conferir)\b|\bnao vou (?:pagar|enviar|mandar|transferir)\b/.test(normalize(parsed.message)))return respond(choices.doubt?'doubt':'verify','catalog-protection');
 const system='Escolha somente um identificador de resposta do catálogo para o diálogo em português. Considere a última fala e o contexto. Não escreva frases, explicações ou qualquer outro conteúdo. Retorne somente o identificador exato em letras minúsculas. Catálogo: '+JSON.stringify(choices);
 const user=JSON.stringify({history:safeHistory(parsed.history,choices),message:parsed.message});
 try{
  const result=await env.AI.run(model,{messages:[{role:'system',content:system},{role:'user',content:user}],...(model.includes('gemma-4')?{max_completion_tokens:24,chat_template_kwargs:{enable_thinking:false}}:{max_tokens:24}),temperature:0.15});
  const id=parseChoice(result?.response??result?.choices?.[0]?.message?.content,choices);
  if(id)return respond(id,'catalog-ai');
 }catch(_){/* No exception detail or model text is exposed or persisted. */}
 return respond(fallback,'catalog-protection');
}
