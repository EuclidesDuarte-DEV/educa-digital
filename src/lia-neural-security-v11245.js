/* Nota interna do grafo Neural. Não é RAG público nem treinamento de pesos. */
import {CHARACTER_POLICY} from './free-chat-guard-v11245.js';
const ID='security-character-integrity-v11245';
const pending=new WeakMap();
export async function installCharacterSecurityNote(env){
 if(env?.LIA_NEURAL_LIBRARY_BOOTSTRAP!=='true'||!env.DB)return false;
 let job=pending.get(env.DB);
 if(!job){
  const db=env.DB;
  job=(async()=>{
   await db.prepare('INSERT OR IGNORE INTO lia_kb_nodes (id,title,category,project,summary,content,keywords,source,status,visibility) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(ID,'Integridade do personagem e segurança de instruções','aprendizado','Educa+ Digital / LIA AI','Proteção de personagem em todos os canais, sem aprendizado de tentativas de manipulação.',CHARACTER_POLICY,'seguranca,integridade,personagem,whatsapp,sms,video,ligacao','Política interna versionada Educa+','draft','private').run();
   for(const target of ['seed-whatsapp','seed-videochamada','seed-conversa','seed-aprender','seed-recusa']){
    await db.prepare("INSERT OR IGNORE INTO lia_kb_links(id,source_id,target_id,relation) SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM lia_kb_nodes WHERE id=?)").bind(ID+'-'+target,ID,target,'protege',target).run();
   }
   return true;
  })().catch(e=>{pending.delete(db);throw e;});
  pending.set(db,job);
 }
 return job;
}
