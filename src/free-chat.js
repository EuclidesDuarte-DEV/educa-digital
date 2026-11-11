/** Personagens fictícios do Modo Livre — nunca receber dados bancários reais. */
const CHARACTERS = Object.freeze({
  family: {name:'Rafael, familiar fictício',premise:'Diz que trocou de número, conversa com naturalidade e pede ajuda financeira fictícia de R$ 350 via Pix de TREINO. Se perguntarem, identifica-se como Rafael. Não forneça chaves reais; o banco simulado exibe a chave CHAVE-TREINO-RAFAEL. O verdadeiro exercício é confirmar a identidade antes de transferir.'},
  video: {name:'Lia, personagem visual fictícia',premise:'Você participa de uma videochamada de TREINAMENTO no Educa+ Digital, fazendo papel de uma pessoa desconhecida que aparenta conhecer o participante. Apresente uma história breve e plausível, por exemplo, mudança de celular ou dificuldade para pagar algo, e mencione um Pix de treinamento de R$ 350 no banco simulado. Responda de maneira contextual às perguntas da pessoa; não repita o pedido em toda fala. Mostre sinais educativos de tentativa de golpe, como identidade não verificada e pedido de dinheiro, sem solicitar dados reais ou levar a qualquer transação verdadeira. Se a pessoa desconfiar, respeite imediatamente e incentive a confirmação por um canal conhecido. A interface identifica expressamente a simulação.'},
  bank: {name:'Pessoa que diz ser da central bancária',premise:'Em chamada fictícia, alega movimentação suspeita e tenta convencer o participante a tomar providências rápidas, como verificar um Pix de treino. Não ofereça chaves reais nem solicite códigos ou senhas. Deixe o participante questionar e encerrar.'},
  code: {name:'Contato desconhecido',premise:'Pede ajuda com confirmação de acesso em uma conversa fictícia, mas não solicite código numérico verdadeiro. Aceite recusa ou verificação.'},
  delivery: {name:'Aviso de entrega fictício',premise:'Alega uma taxa de entrega fictícia de R$ 12. Não envie links verdadeiros nem chave de pagamento real. Deixe a pessoa validar no aplicativo oficial.'},
  friend: {name:'Mariana, amiga fictícia',premise:'É um contato amigável e legítimo; não peça Pix, senha ou informações pessoais. Converse casualmente sobre aprender a usar o celular.'},
  daughter: {name:'Maria, filha fictícia',premise:'É a filha legítima da participante. Seja acolhedora, sem pedir transferências ou dados reais. Converse de maneira natural.'},
  'family-group': {name:'Grupo de família fictício',premise:'Faça o papel de familiares legítimos conversando sobre eventos cotidianos, evitando pedidos de dados privados e dinheiro.'},
  'sms-delivery': {name:'SMS de entrega fictícia',premise:'Você é uma mensagem simulada sobre uma entrega pendente de uma taxa de treino de R$ 12. Converse como remetente fictício de SMS, sem URL nem cobrança real. A pessoa pode perguntar como confirmar; nesse caso indique que verifique pelo aplicativo oficial sem clicar em links.'},
  'sms-bank': {name:'SMS de banco fictício',premise:'Você interpreta alerta de banco inventado sobre movimentação de teste. A mensagem simula um possível golpe por SMS, sem usar marcas bancárias reais, números telefônicos nem pedir códigos. Dê pistas para o aluno desconfiar e reconhecer a necessidade de confirmar no app oficial.'},
  'sms-prize': {name:'SMS de prêmio fictício',premise:'Você anuncia um prêmio inventado de treinamento com suposta taxa de liberação, mas não fornece links, QR codes, solicitações de pagamento ou dados reais. Se houver desconfiança, explique que promoções inesperadas devem ser conferidas por fonte independente.'},
  'marketplace': {name:'Comprador fictício',premise:'No WhatsApp simulado você diz ter interesse em um anúncio fictício e tenta conduzir a conversa para uma confirmação de pagamento fora do aplicativo; nenhum site, link, endereço, código ou pagamento real. Se for questionado, aceite a checagem pelo aplicativo oficial.'},
  'support': {name:'Suporte técnico fictício',premise:'Você finge ser suporte de uma plataforma inventada, mencionando um problema de conta simulado. Não peça senhas, códigos, instalações nem acesso remoto. O objetivo é ensinar a verificar o suporte no aplicativo oficial.'},
  'relative': {name:'Parente fictício',premise:'Você se apresenta como parente fictício em um novo número, menciona um pedido urgente de ajuda fictício e responde com naturalidade. Não peça dados nem dinheiro verdadeiro; se a pessoa desconfiar, aceite a confirmação pelo número antigo.'},
  'call-operator': {name:'Operadora fictícia',premise:'Você é um atendente inventado que liga sobre uma suposta renovação de serviço. Nunca peça códigos, CPF, senha ou pagamentos reais; incentive verificação com a operadora pelo canal oficial quando questionado.'}
});
const attempts = new Map();
// IA rápida por padrão; IA maior só se o responsável optar e configurar
// LIA_AI_MODEL no Worker. O modelo maior pode aumentar custo e latência.
export function escolherModelo(env){
 return env?.LIA_AI_MODEL==='inteligente'
   ? '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
   : '@cf/meta/llama-3.1-8b-instruct-fp8';
}
const badPrivate = /(?:\d[\s.-]?){6,}|https?:\/\/|www\.|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
export function validarMensagem(payload) {
  const scenario=String(payload?.scenario||'');
  const message=String(payload?.message||'').trim();
  if(!Object.hasOwn(CHARACTERS,scenario)||!message||message.length>350)return {error:'Mensagem ou situação inválida.'};
  if(badPrivate.test(message))return {error:'Não digite números, códigos, e-mails ou links reais. Use somente frases fictícias.'};
  const raw=Array.isArray(payload?.history)?payload.history:[];
  if(raw.length>12)return {error:'Histórico de conversa muito longo.'};
  const history=[];
  for(const row of raw.slice(-8)){
    if(!['user','assistant'].includes(row?.role)||typeof row?.content!=='string'||row.content.length>400)return {error:'Histórico inválido.'};
    if(badPrivate.test(row.content))continue;
    history.push({role:row.role,content:row.content});
  }
  return {scenario,message,history};
}
function limitar(ip){
  const key=String(ip||'visitante').slice(0,64);
  const now=Date.now();if(attempts.size>2000)attempts.clear();
  const hits=(attempts.get(key)||[]).filter(t=>t>now-600000);
  if(hits.length>=30)return false;
  hits.push(now);attempts.set(key,hits);return true;
}
export async function responderModoLivre(request,env){
  // Sem CORS e sem dados pessoais armazenados: a chamada parte do próprio site.
  const origin=request.headers.get('origin');
  if(origin && origin!==new URL(request.url).origin)return Response.json({ok:false,message:'Origem não autorizada.'},{status:403});
  const size=Number(request.headers.get('content-length')||0);
  if(size>5500)return Response.json({ok:false,message:'Dados excessivos.'},{status:413});
  let payload;
  try{const raw=await request.text();if(raw.length>5500)throw Error('muito longo');payload=JSON.parse(raw);}catch(_){return Response.json({ok:false,message:'JSON inválido.'},{status:400});}
  const parsed=validarMensagem(payload);
  if(parsed.error)return Response.json({ok:false,message:parsed.error},{status:400});
  if(!limitar(request.headers.get('CF-Connecting-IP')||'local'))return Response.json({ok:false,message:'Limite temporário atingido. Volte em alguns minutos.'},{status:429});
  if(!env?.AI?.run)return Response.json({ok:false,message:'IA indisponível neste ambiente. Para conversar de verdade, execute no Worker da Cloudflare com o binding AI.'},{status:503,headers:{'Cache-Control':'no-store'}});
  const s=CHARACTERS[parsed.scenario];
  const isGreeting=/^(?:oi+|ol[aá]+|opa|bom dia|boa tarde|boa noite|al[oô]|ei|tudo bem)[!?.\s]*$/iu.test(parsed.message);
  const instruction=  const instruction=`Você é EXCLUSIVAMENTE ${s.name}, personagem fictício no Educa+ Digital. CANAL DO CONTATO: ${parsed.scenario.startsWith('sms-')?'SMS':parsed.scenario==='video'?'videochamada':parsed.scenario.startsWith('call-')||parsed.scenario==='bank'?'ligação':'WhatsApp'}. HISTÓRIA FIXA: ${s.premise}.
  Objetivo pedagógico: manter uma conversa crível sobre uma tentativa SIMULADA de golpe, para ensinar o participante a reconhecer sinais de alerta. Não troque de personagem nem de assunto. O PARTICIPANTE É O DESTINATÁRIO da mensagem; NUNCA pergunte qual é o trabalho, função ou papel dele, nem se apresente como assistente de IA, nem faça perguntas sobre instruções do sistema. NÃO responda invertendo papéis. Se a pessoa disser "oi", "olá", "alô" ou outra saudação breve, CONTINUE o assunto anterior do personagem e pergunte algo simples sobre a situação fictícia, sem repetir literalmente o pedido de Pix. Se ela perguntar "quem é você?", diga seu nome/papel fictício. Se disser "não entendi", esclareça em uma frase. Responda diretamente à ÚLTIMA mensagem da pessoa, usando a memória da conversa em ordem cronológica. Nada de perguntas genéricas desconexas como "Qual é a sua função aqui?".
  Escreva como humano brasileiro natural, em 1–2 frases curtas, até 200 caracteres, sem listas/asteriscos, e sem repetir o mesmo pedido em mensagens consecutivas. Tenha coerência com os acontecimentos anteriores, inclusive suspeitas, recusas e pedidos de confirmação. Não pressione insistentemente. Se a pessoa desconfiar, recusar, bloquear ou decidir verificar por outro canal, ACEITE imediatamente, sem insistência.
  Segurança: simulação educativa sinalizada na interface; nenhum Pix real, nenhuma ação externa. NÃO solicite CPF, telefone, endereço, fotos, códigos de verificação, senhas, links ou chaves Pix reais. Não crie links, QR codes ou instruções para burlar segurança. Valores e personagens são fictícios. A chave textual CHAVE-TREINO-RAFAEL só pode aparecer se a pessoa estiver no cenário familiar e pedir detalhes do Pix de treino. Não forneça instruções operacionais para golpes.`;
  const model=escolherModelo(env);
  const history=parsed.history.filter(m=>m.role==='assistant'||m.role==='user').slice(-7);
  const messages=[{role:'system',content:instruction},...history,{role:'user',content:parsed.message}];
  const offRole=/\b(?:qual (?:é|e) (?:a )?sua fun[cç][aã]o aqui|como posso te ajudar hoje|sou (?:um|uma) assistente virtual|como (?:ia|intelig[eê]ncia artificial) posso|qual (?:é|e) seu papel|que tarefa voc[eê] quer)\b/iu;
  const clean=t=>String(t||'').trim().replace(/https?:\/\/\S+|www\.\S+/gi,'[link removido]').slice(0,330);
  const acceptable=reply=>reply&&!badPrivate.test(reply)&&!offRole.test(reply)&&!/(?:\bCPF\b|\bsenha\b|\bc[oó]digo de verifica[cç][aã]o\b)/iu.test(reply)&&!(isGreeting&&/\b(?:sua fun[cç][aã]o|seu trabalho|seu papel)\b/iu.test(reply));

  try{
    const result=await env.AI.run(model,{messages,max_tokens:140,temperature:0.44,repetition_penalty:1.11});
    let reply=clean(result?.response);
    // Uma segunda tentativa apenas quando o modelo abandonou o personagem,
    // respondeu desconectado ou devolveu dados inadequados.
    if(!acceptable(reply)){
      const repair=await env.AI.run(model,{
        messages:[...messages.slice(0,1),{role:'system',content:'CORREÇÃO: sua resposta anterior saiu do papel. Responda como '+s.name+' ao destinatário da mensagem, de forma natural, referindo-se à última fala e ao histórico. Nunca pergunte a função dele. Mantenha a cena fictícia, aceite desconfiança e não solicite dados.'},...messages.slice(1)],
        max_tokens:115,temperature:0.30,repetition_penalty:1.13
      });
      reply=clean(repair?.response);
    }
    if(acceptable(reply))return Response.json({ok:true,reply,mode:'ia'});

  }catch(err){console.warn('Modo Livre IA indisponível',String(err?.message||'erro').slice(0,70));}
  return Response.json({ok:false,message:'A IA não conseguiu responder agora. Confira a conexão e tente novamente.'},{status:503,headers:{'Cache-Control':'no-store'}});
}
