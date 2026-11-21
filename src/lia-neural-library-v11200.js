/* V112.00 — bootstrap aditivo da biblioteca real, autorizado pelo proprietario.
 * Importa 31 rascunhos e conexoes preexistentes; publica somente pesquisas
 * cujo conteudo e fonte foram revisados com registros institucionais em 2026.
 * Nunca solicita token, expõe mensagens de participantes ou altera dados antigos.
 */
import {LIA_NEURAL_SEEDS,LIA_NEURAL_SEED_LINKS} from './lia-neural-seeds.js';
import {LIA_NEURAL_RESEARCH_2026,LIA_NEURAL_RESEARCH_LINKS} from './lia-neural-research-2026.js';

export const VERIFIED_LIBRARY_IDS=Object.freeze([
 'research-central-2026',
 'research-inss-prova-2026',
 'research-inss-biometria-2026',
 'research-deepfake-video-2026',
 'research-clonagem-voz-2026'
]);
const BRIDGES=Object.freeze([
 {id:'verified-edge-falsa-central',source_id:'research-central-2026',target_id:'verified-bc-bank',relation:'orientacao-verificada'},
 {id:'verified-edge-prova-inss',source_id:'research-inss-prova-2026',target_id:'verified-cert-sms',relation:'alerta-sms'},
 {id:'verified-edge-biometria-inss',source_id:'research-inss-biometria-2026',target_id:'verified-cert-sms',relation:'desinformacao'},
 {id:'verified-edge-video-ia',source_id:'research-deepfake-video-2026',target_id:'verified-bc-family',relation:'confirmar-identidade'},
 {id:'verified-edge-voz-ia',source_id:'research-clonagem-voz-2026',target_id:'verified-bc-family',relation:'confirmar-identidade'}
]);
const BOOT=new WeakMap();
const NOTE_SQL='INSERT OR IGNORE INTO lia_kb_nodes (id,title,category,project,summary,content,keywords,source,status,visibility) VALUES(?,?,?,?,?,?,?,?,?,?)';
const LINK_SQL='INSERT OR IGNORE INTO lia_kb_links (id,source_id,target_id,relation) VALUES(?,?,?,?)';
const MIGRATION_KEY='neural-full-library-v11200';
const DB_SCHEMA="CREATE TABLE IF NOT EXISTS lia_kb_bootstrap_jobs (key TEXT PRIMARY KEY,completed_at TEXT NOT NULL DEFAULT (datetime('now')))";
async function runBatch(db,statements){
 if(typeof db.batch==='function')return db.batch(statements);
 for(const item of statements)await item.run();
}
export async function populateReviewedNeuralLibrary(env){
 if(env?.LIA_NEURAL_LIBRARY_BOOTSTRAP!=='true'||!env?.DB)return {enabled:false};
 let pending=BOOT.get(env.DB);
 if(!pending){
  pending=(async()=>{
   const db=env.DB;
   await db.prepare(DB_SCHEMA).run();
   const marker=await db.prepare("SELECT key FROM lia_kb_bootstrap_jobs WHERE key=?").bind(MIGRATION_KEY).first();
   if(marker)return {enabled:true,already_prepared:true};
   // INSERT OR IGNORE nunca sobrescreve uma nota que o administrador editou.
   const nodes=[...LIA_NEURAL_SEEDS,...LIA_NEURAL_RESEARCH_2026];
   const nodeStatements=nodes.map(n=>db.prepare(NOTE_SQL).bind(
    n.id,n.title,n.category,n.project,n.summary,n.content,n.keywords,n.source,'draft','private'));
   await runBatch(db,nodeStatements);
   const relations=[...LIA_NEURAL_SEED_LINKS,...LIA_NEURAL_RESEARCH_LINKS,...BRIDGES];
   const linkStatements=relations.map(l=>db.prepare(LINK_SQL).bind(
    l.id,l.source_id,l.target_id,l.relation));
   await runBatch(db,linkStatements);
   // Publicacao editorial limitada: 5 fontes institucionais conferidas,
   // somente se id, fonte e texto correspondem ao registro original intacto.
   // Se a equipe tiver modificado o conteudo, permanece aguardando aprovacao.
   const reviewed=LIA_NEURAL_RESEARCH_2026.filter(n=>VERIFIED_LIBRARY_IDS.includes(n.id));
   if(reviewed.length!==VERIFIED_LIBRARY_IDS.length)throw Error('VERIFIED_LIBRARY_MISMATCH');
   let released=0;
   for(const note of reviewed){
    if(!['conhecimento','cenario','decisao'].includes(note.category)||
       !/^https:\/\/(?:[^/]+\.)?(?:gov\.br|febraban\.org\.br|nic\.br)\/|^https:\/\/www\.gov\.br\//.test(note.source))
      throw Error('LIBRARY_SOURCE_NOT_APPROVED');
    const result=await db.prepare(
     "UPDATE lia_kb_nodes SET status='published',visibility='public',updated_at=datetime('now') "+
     "WHERE id=? AND status='draft' AND visibility='private' AND source=? AND content=?"
    ).bind(note.id,note.source,note.content).run();
    released+=Number(result?.meta?.changes||0);
   }
   // So marque concluido depois que todos os lotes e revisoes terminarem.
   await db.prepare("INSERT OR IGNORE INTO lia_kb_bootstrap_jobs(key) VALUES(?)")
    .bind(MIGRATION_KEY).run();
   return {enabled:true,imported_candidates:nodes.length,relations:relations.length,reviewed:reviewed.length,released};
  })().catch(error=>{BOOT.delete(env.DB);throw error;});
  BOOT.set(env.DB,pending);
 }
 return pending;
}
