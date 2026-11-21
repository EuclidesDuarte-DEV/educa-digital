/* V111.97 — trechos do treino, com consentimento distinto, revisão administrativa.
 * Não armazena histórico, IP, identidade, áudio, contas ou IDs de participantes.
 */
const SIMULATED=new Set(['family','relative','bank','video','code','delivery','account','prize',
 'sms-delivery','sms-bank','sms-prize','call-tech']);
const CHANNELS=Object.freeze({
 family:'whatsapp',relative:'whatsapp',code:'whatsapp',delivery:'whatsapp',
 account:'whatsapp',prize:'whatsapp',bank:'call',video:'video',
 'sms-delivery':'sms','sms-bank':'sms','sms-prize':'sms','call-tech':'call'
});
const TURN_LIMIT=new Map();
const MAX_TURN=8;
const sql=(db,query,...args)=>db.prepare(query).bind(...args);
export const TRAINING_EXAMPLES_SQL=[
 "CREATE TABLE IF NOT EXISTS lia_training_examples ("+
 "id TEXT PRIMARY KEY,scenario TEXT NOT NULL,channel TEXT NOT NULL,"+
 "signal TEXT NOT NULL CHECK(signal IN ('verify','refuse','question','accept','other')),"+
 "participant_excerpt TEXT NOT NULL,character_excerpt TEXT NOT NULL,"+
 "review_state TEXT NOT NULL DEFAULT 'pending' CHECK(review_state IN ('pending','reviewed')),"+
 "created_at TEXT NOT NULL DEFAULT (datetime('now')),"+
 "expires_at TEXT NOT NULL DEFAULT (datetime('now','+7 days')))",
 "CREATE INDEX IF NOT EXISTS idx_lia_training_examples_expires ON lia_training_examples(expires_at)",
 "CREATE INDEX IF NOT EXISTS idx_lia_training_examples_review ON lia_training_examples(review_state,created_at)"
];
const personalData=/(?:\b\d[\d\s()./-]{3,}\d\b|https?:\/\/|www\.|@[\w.]+|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b|\b(?:cpf|cnpj|rg|cep|endereço|endereco|logradouro|bairro|avenida|meu nome|me chamo|meu telefone|minha senha|meu e-mail|minha conta|minha chave pix|minha chave|minha rua|moro em|moro na|minha cidade|meus dados|meu cartão|meu cartao|meu endereço|meu endereco)\b)/iu;
const sensitiveInstructions=/(?:\b(?:dados? banc[aá]rios|senha|c[oó]digo de acesso|chave pix real|instale|acesso remoto)\b)/iu;
export function screenDialogueExcerpt(input,max=190){
 if(typeof input!=='string'||input.length>520)return null;
 const text=input.normalize('NFKC').replace(/[\u200b-\u200f\u202a-\u202e]/g,'')
   .replace(/[\r\n\t]+/g,' ').replace(/\s+/g,' ').trim();
 if(text.length<4||text.length>max||personalData.test(text)||sensitiveInstructions.test(text))return null;
 // Não cortar trechos: o final da frase pode conter dado privado.
 return text;
}
function canCollect(request){
 const key=String(request?.headers?.get?.('CF-Connecting-IP')||'anonymous').slice(0,100);
 const now=Date.now();
 if(TURN_LIMIT.size>1600)TURN_LIMIT.clear();
 const recent=(TURN_LIMIT.get(key)||[]).filter(t=>now-t<60000);
 if(recent.length>=MAX_TURN)return false;
 recent.push(now);TURN_LIMIT.set(key,recent);return true;
}
const CLEANUP=new WeakMap();
async function cleanup(db){
 if(Date.now()<(CLEANUP.get(db)||0))return;
 await db.prepare("DELETE FROM lia_training_examples WHERE expires_at <= datetime('now')").run();
 CLEANUP.set(db,Date.now()+180000);
}
export async function storeTrainingExample(env,request,{scenario,participant,character,signal,consent}={}){
 if(consent!==true||env?.LIA_EXAMPLES_ENABLED!=='true'||!env?.DB||
    !SIMULATED.has(scenario)||!['verify','refuse','question','accept','other'].includes(signal))
  return false;
 const user=screenDialogueExcerpt(participant,190);
 const assistant=screenDialogueExcerpt(character,330);
 if(!user||!assistant||!canCollect(request))return false;
 try{
  await cleanup(env.DB);
  await sql(env.DB,"INSERT INTO lia_training_examples "+
   "(id,scenario,channel,signal,participant_excerpt,character_excerpt) VALUES(?,?,?,?,?,?)",
   crypto.randomUUID(),scenario,CHANNELS[scenario],signal,user,assistant).run();
  return true;
 }catch(_){return false;}
}
export async function listTrainingExamples(env){
 if(!env?.DB)throw Error('DB_MISSING');
 await cleanup(env.DB);
 const r=await sql(env.DB,"SELECT id,scenario,channel,signal,participant_excerpt,character_excerpt,"+
  "review_state,created_at,expires_at FROM lia_training_examples "+
  "WHERE expires_at>datetime('now') ORDER BY created_at DESC LIMIT 50").all();
 return (r.results||[]).map(x=>({
  id:x.id,scenario:x.scenario,channel:x.channel,signal:x.signal,
  participant_excerpt:x.participant_excerpt,character_excerpt:x.character_excerpt,
  review_state:x.review_state,created_at:x.created_at,expires_at:x.expires_at
 }));
}
export async function deleteTrainingExample(env,id){
 if(!/^[a-f0-9-]{36}$/i.test(id))return false;
 await sql(env.DB,"DELETE FROM lia_training_examples WHERE id=?",id).run();
 return true;
}
export function examplePolicy(){return {
 enabled:true,storage:'consented-excerpts',full_transcripts:false,retention_days:7,
 direct_model_training:false,admin_only:true,requires_separate_consent:true
};}
