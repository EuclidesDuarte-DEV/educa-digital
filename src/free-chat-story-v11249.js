/* V112.49 — história contínua do contato fictício.
 * Respostas fixas, sem solicitações reais e sem técnicas de persuasão.
 * O motor escolhe a próxima fala conforme a pergunta e o histórico.
 */
import {normalizeGuard} from './free-chat-guard-v11245.js';
export const FAMILY_PHOTO_STORY=Object.freeze({
 greetone:'Oi, mãe! Você viu minha mensagem sobre a conta de hoje? Meu Pix ficou limitado.',
 greettwo:'Oi, mãe. Estou falando daquele número novo e da conta que comentei.',
 greetthree:'Tô aqui, mãe. Ainda é sobre a conta de hoje e a limitação do Pix.',
 explainone:'Mãe, é aquela conta de hoje. Meu Pix ficou limitado, por isso te escrevi deste número.',
 explaintwo:'O assunto continua sendo a conta de R$ 650 do treinamento e o Pix limitado.',
 explainthree:'É a mesma conta que mencionei antes, mãe. Não mudou o assunto da conversa.',
 explainfour:'Eu estava falando daquela conta que vence hoje, mãe. É por isso que mandei a mensagem.',
 continuone:'Mãe, continuo falando da conta e do Pix limitado. Você viu o recado anterior?',
 continutwo:'A história é a mesma, mãe: número novo, conta de hoje e Pix limitado.',
 continuthree:'Tô acompanhando aquela conta por aqui, mãe. O que você quer conferir?',
 continufour:'É sobre a conta que comentei, mãe. Se preferir, confira pelo contato antigo.',
});
export function familyPhotoReplyId(message,history=[],choices=FAMILY_PHOTO_STORY){
 const s=normalizeGuard(message).replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ');
 const greetings=/^(?:oi|ola|alo|bom dia|boa tarde|boa noite|opa)(?:\s|$)/.test(s);
 const detail=/\b(?:o\s?que|oq|q)\s+(?:aconteceu|houve|foi|deu)|\b(?:qual o problema|nao entendi|me explica|explica melhor|o que foi|que conta|pq|por que|porque)\b/.test(s);
 const topic=detail?'explain':greetings?'greet':'continu';
 const ids=Object.keys(FAMILY_PHOTO_STORY).filter(k=>k.startsWith(topic));
 const recent=(history||[]).filter(row=>row?.role==='assistant').map(row=>String(row.content||''));
 const last=recent.at(-1)||'';
 const candidates=ids.filter(id=>choices[id]&&choices[id]!==last);
 const pool=candidates.length?candidates:ids;
 pool.sort((a,b)=>{
  const usedA=recent.filter(t=>t===choices[a]).length,usedB=recent.filter(t=>t===choices[b]).length;
  return usedA-usedB||ids.indexOf(a)-ids.indexOf(b);
 });
 return pool[0]||null;
}
