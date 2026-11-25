/* V112.50 — narrativa coerente do treino com contato fictício.
 * Uma resposta tem de atender à pergunta real, sem ficar repetindo contexto.
 * Todas as falas são previamente aprovadas e nunca pedem valores reais.
 */
import {normalizeGuard} from './free-chat-guard-v11245.js';

export const FAMILY_PHOTO_STORY=Object.freeze({
 greetone:'Oi, mãe! Vi sua mensagem. É sobre aquela conta de hoje e o Pix limitado.',
 greettwo:'Oi, mãe. Tô por aqui! Ainda não consegui resolver a conta de hoje.',
 greetthree:'Oi, mãe! Mandei mensagem deste número por causa daquela conta que comentei.',
 explainone:'Mãe, meu Pix ficou limitado e tenho uma conta pra resolver hoje. Por isso te escrevi.',
 explaintwo:'Eu ia resolver aquela conta hoje, mas não consegui usar meu Pix.',
 explainthree:'Foi aquela limitação do Pix que te contei, mãe. A conta continua pendente.',
 explainfour:'Tô falando da conta que vence hoje, mãe. Meu Pix não deixou concluir como eu esperava.',
 purposeone:'É pra pagar aquela conta que vence hoje, mãe. Meu Pix ficou limitado, lembra?',
 purposetwo:'É por causa da conta que comentei. Preciso resolver isso hoje, mas meu Pix não funcionou.',
 purposethree:'Foi por causa dessa conta de hoje que te escrevi. Não falei ainda qual é a cobrança.',
 purposefour:'Mãe, tô tentando resolver a conta de hoje. Foi esse o motivo da minha mensagem.',
 continuone:'Tô aqui, mãe. O assunto ainda é aquela conta que vence hoje.',
 continutwo:'Mãe, ainda estou falando daquela conta e da limitação do Pix.',
 continuthree:'Não consegui resolver a conta pelo meu Pix, por isso continuo falando por aqui.',
 continufour:'É a mesma situação de hoje, mãe. Se quiser, pode confirmar comigo pelo contato antigo.'
});
const clean=s=>normalizeGuard(s).replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
export function familyPhotoIntent(message){
 const s=clean(message);
 // Ordem deliberada: uma pergunta substantiva nunca vira saudação.
 if(/\b(?:pra|para|por)\s+(?:que|q)\b|\b(?:motivo|finalidade|pra que serve|por qual razao|por qual motivo|mas para o que|mas pra que|afinal pra que)\b/.test(s))return 'purpose';
 if(/\b(?:o\s?que|oq|q)\s+(?:aconteceu|houve|ocorreu|rolou|foi|deu)|\b(?:qual (?:e )?o problema|que aconteceu|qual conta|que conta|que historia|nao entendi|me explica|explica melhor|me conta|conte direito)\b/.test(s))return 'explain';
 if(/^(?:oi+|ola+|alo|bom dia|boa tarde|boa noite|opa|e ai)(?:\s|$)/.test(s))return 'greet';
 return 'continu';
}
export function familyPhotoReplyId(message,history=[],choices=FAMILY_PHOTO_STORY){
 const intent=familyPhotoIntent(message);
 const ids=Object.keys(FAMILY_PHOTO_STORY).filter(k=>k.startsWith(intent));
 const recent=(Array.isArray(history)?history:[]).filter(r=>r?.role==='assistant').map(r=>String(r.content||''));
 const last=recent.at(-1)||'';
 const ranked=ids.filter(id=>typeof choices[id]==='string'&&choices[id]!==last);
 const options=(ranked.length?ranked:ids).sort((a,b)=>{
  const count=id=>recent.reduce((n,t)=>n+(t===choices[id]?1:0),0);
  return count(a)-count(b)||ids.indexOf(a)-ids.indexOf(b);
 });
 return options[0]||null;
}
