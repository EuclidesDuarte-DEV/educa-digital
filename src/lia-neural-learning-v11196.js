// V111.96 — Knowledge base educativo e aprendizado agregado, SEM chats gravados.
// Bootstrap intencionalmente aditivo/idempotente; ativado via LIA_NEURAL_AUTO_SETUP=true.
// Apenas metadados categóricos anônimos e notas oficiais curadas alimentam o D1.
import { TRAINING_EXAMPLES_SQL } from './lia-training-examples-v11197.js';
const SCENARIOS=Object.freeze({
 family:'whatsapp',relative:'whatsapp',account:'whatsapp',code:'whatsapp',delivery:'whatsapp',
 prize:'whatsapp',friend:'whatsapp',daughter:'whatsapp','family-group':'whatsapp',
 video:'video',bank:'call','call-tech':'call','sms-delivery':'sms','sms-bank':'sms','sms-prize':'sms'
});
const LIMIT=new Map();
const BOOT=new WeakMap();
let nextPrune=0; // evita SQL de limpeza em cada turno de voz
const CATALOG=Object.freeze([
 {id:'verified-bc-pix',title:'Pix: confira o recebedor',keywords:'pix,seguranca,pagamento,beneficiario',
  content:'Antes de confirmar um Pix, confira nome do beneficiário e valor na instituição financeira. Um pedido urgente de dinheiro exige verificar a identidade por um canal conhecido.',
  source:'https://www.bcb.gov.br/estabilidadefinanceira/pix-seguranca'},
 {id:'verified-bc-bank',title:'Falsa central bancária',keywords:'banco,central,ligacao,telefone,seguranca',
  content:'Diante de ligação inesperada alegando fraude na conta, não realize procedimentos nem forneça dados. Encerre o contato e use um canal oficial do banco obtido independentemente.',
  source:'https://www.bcb.gov.br/meubc/faqs/p/cuidado-com-ligacoes-de-falsas-centrais-de-atendimento'},
 {id:'verified-bc-family',title:'Falso familiar e voz criada com IA',keywords:'familia,whatsapp,video,voz,deepfake,pix',
  content:'Áudios e vídeos podem ser produzidos por inteligência artificial e não comprovam identidade. Confirme pedidos de familiares pelo número já conhecido ou pessoalmente, antes de decidir.',
  source:'https://www.bcb.gov.br/meubc/faqs/p/dicas-gerais-para-evitar-golpes'},
 {id:'verified-cert-sms',title:'Links em mensagens e SMS',keywords:'sms,mensagem,link,phishing,entrega,encomenda',
  content:'Desconfie de links recebidos em mensagens de bancos, entregas ou promoções. Acesse o serviço pelo aplicativo oficial ou endereço digitado diretamente; não informe senhas ou códigos.',
  source:'https://cartilha.cert.br/'}
]);
export const NEURAL_SQL=[
 `CREATE TABLE IF NOT EXISTS lia_kb_nodes (
 id TEXT PRIMARY KEY, title TEXT NOT NULL,
 category TEXT NOT NULL CHECK(category IN ('conhecimento','cenario','memoria','aprendizado','decisao')),
 project TEXT NOT NULL DEFAULT 'Educa+ Digital',summary TEXT NOT NULL DEFAULT '',
 content TEXT NOT NULL DEFAULT '',keywords TEXT NOT NULL DEFAULT '',source TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
 visibility TEXT NOT NULL DEFAULT 'private' CHECK(visibility IN ('private','public')),
 created_at TEXT NOT NULL DEFAULT (datetime('now')),updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
 "CREATE INDEX IF NOT EXISTS idx_lia_kb_nodes_scope ON lia_kb_nodes(status, visibility, category)",
 "CREATE INDEX IF NOT EXISTS idx_lia_kb_nodes_project ON lia_kb_nodes(project, updated_at)",
 `CREATE TABLE IF NOT EXISTS lia_kb_links (
 id TEXT PRIMARY KEY,source_id TEXT NOT NULL REFERENCES lia_kb_nodes(id) ON DELETE CASCADE,
 target_id TEXT NOT NULL REFERENCES lia_kb_nodes(id) ON DELETE CASCADE,
 relation TEXT NOT NULL DEFAULT 'relacionado',created_at TEXT NOT NULL DEFAULT (datetime('now')),
 UNIQUE(source_id,target_id,relation),CHECK(source_id<>target_id))`,
 "CREATE INDEX IF NOT EXISTS idx_lia_kb_links_source ON lia_kb_links(source_id)",
 "CREATE INDEX IF NOT EXISTS idx_lia_kb_links_target ON lia_kb_links(target_id)",
 `CREATE TABLE IF NOT EXISTS lia_training_signals (
 day TEXT NOT NULL DEFAULT (date('now')),
 scenario TEXT NOT NULL, channel TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('turn','outcome')),
 signal TEXT NOT NULL CHECK(signal IN ('verify','refuse','question','accept','other','safe','unsafe')),
 total INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(day,scenario,channel,kind,signal))`,
 "CREATE INDEX IF NOT EXISTS idx_lia_training_retention ON lia_training_signals(day,scenario)",
 ...TRAINING_EXAMPLES_SQL
];
const s=(db,query,...args)=>db.prepare(query).bind(...args);
const pubNotes=()=>CATALOG.length;
export async function setupNeuralDB(env){
 if(env?.LIA_NEURAL_AUTO_SETUP!=='true'||!env?.DB)return false;
 let work=BOOT.get(env.DB);
 if(!work){
  work=(async()=>{
   for(const q of NEURAL_SQL)await env.DB.prepare(q).run();
   // Apenas conteúdo anti-fraude com fontes oficiais verificáveis é público.
   // INSERT OR IGNORE preserva quaisquer edições/revisões da equipe.
   for(const n of CATALOG){
    await s(env.DB,`INSERT OR IGNORE INTO lia_kb_nodes
     (id,title,category,project,summary,content,keywords,source,status,visibility)
     VALUES(?,?,'conhecimento','Educa+ Digital',?,?,?,?,'published','public')`,
     n.id,n.title,n.content,n.content,n.keywords,n.source).run();
   }
  })().catch(err=>{BOOT.delete(env.DB);throw err;});
  BOOT.set(env.DB,work);
 }
 await work;return true;
}
const normalized=v=>String(v||'').toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export function classifyTrainingTurn(scenario,text){
 if(!Object.hasOwn(SCENARIOS,String(scenario||'')))return null;
 // O texto bruto só existe na memória da requisição e NUNCA é gravado.
 const t=normalized(text).slice(0,350);
 if(/(vou|quero|prefiro|vou tentar).{0,25}(verificar|confirmar|conferir|consultar)|canal oficial|numero antigo|banco oficial/.test(t))
  return 'verify';
 if(/vou bloquear|quero desligar|desligar|nao quero|nao vou|pare|isso e golpe|vou denunciar/.test(t))return 'refuse';
 if(/vou enviar|vou fazer o pix|vou transferir|eu pago|vou mandar o dinheiro/.test(t))return 'accept';
 if(/[?]|quem e|onde|como|por que|porque|pode explicar/.test(t))return 'question';
 return 'other';
}
function allow(request){
 const key=String(request.headers?.get('CF-Connecting-IP')||'anonymous').slice(0,100);
 const now=Date.now();
 if(LIMIT.size>2000)LIMIT.clear();
 const row=(LIMIT.get(key)||[]).filter(ts=>now-ts<60000);
 if(row.length>=24)return false;
 row.push(now);LIMIT.set(key,row);return true;
}
async function countSignal(db,scenario,channel,kind,signal){
 if(Date.now()>=nextPrune){
  // Retenção máxima de trinta dias para contagens agregadas.
  await db.prepare("DELETE FROM lia_training_signals WHERE day < date('now','-30 days')").run();
  nextPrune=Date.now()+86400000;
 }
 await s(db,`INSERT INTO lia_training_signals(day,scenario,channel,kind,signal,total)
 VALUES(date('now'),?,?,?,?,1)
 ON CONFLICT(day,scenario,channel,kind,signal)
 DO UPDATE SET total=total+1`,scenario,channel,kind,signal).run();
}
export async function saveLearningTurn(env,request,scenario,message,consent){
 if(consent!==true||!Object.hasOwn(SCENARIOS,String(scenario||''))||!env?.DB||!allow(request))return false;
 const signal=classifyTrainingTurn(scenario,message);
 if(!signal)return false;
 try{await countSignal(env.DB,scenario,SCENARIOS[scenario],'turn',signal);return true;}catch(_){return false;}
}
const validOutcome=new Set(['safe','unsafe']);
export async function trainingOutcome(request,env){
 if(request.method!=='POST')return Response.json({ok:false},{status:405});
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return Response.json({ok:false},{status:403});
 if(Number(request.headers.get('content-length')||0)>260)return Response.json({ok:false},{status:413});
 let body;
 try{const raw=await request.text();if(raw.length>260)throw Error('large');body=JSON.parse(raw);}catch(_){return Response.json({ok:false},{status:400});}
 if(body?.consent!==true)return Response.json({ok:true,stored:false});
 const scenario=String(body.scenario||''),outcome=String(body.outcome||'');
 if(!Object.hasOwn(SCENARIOS,scenario)||!validOutcome.has(outcome))return Response.json({ok:false},{status:422});
 if(!env?.DB||!allow(request))return Response.json({ok:false},{status:429});
 try{
  await countSignal(env.DB,scenario,SCENARIOS[scenario],'outcome',outcome);
  // Forma apenas uma nota privada agregada, sem IP, conversa, telefone ou ID.
  // A nota NUNCA entra em RAG sem revisão e publicação do administrador.
  const rows=(await s(env.DB,`SELECT signal,SUM(total) AS total
    FROM lia_training_signals WHERE scenario=? AND kind='outcome'
      AND day>=date('now','-30 days') GROUP BY signal`,scenario).all()).results||[];
  const safe=Number(rows.find(r=>r.signal==='safe')?.total||0);
  const unsafe=Number(rows.find(r=>r.signal==='unsafe')?.total||0);
  const total=safe+unsafe;
  if(total>=10&&total%10===0){
   const content=`Treino coletivo anônimo dos últimos 30 dias: ${total} exercícios concluídos neste cenário; ${safe} decisões protetivas, ${unsafe} decisões inseguras apenas no simulador. Sugestão: revisar os sinais de alerta e oferecer exercícios didáticos progressivos. Nenhuma mensagem de participante foi guardada.`;
   await s(env.DB,`INSERT INTO lia_kb_nodes
    (id,title,category,project,summary,content,keywords,source,status,visibility)
    VALUES(?,?,'aprendizado','Educa+ Digital',?,?,?,'Indicadores anônimos opt-in','draft','private')
    ON CONFLICT(id) DO UPDATE SET summary=excluded.summary,content=excluded.content,updated_at=datetime('now')
    WHERE lia_kb_nodes.status='draft' AND lia_kb_nodes.visibility='private'
     AND lia_kb_nodes.source='Indicadores anônimos opt-in'`,
    'learning-'+scenario,'Aprendizado coletivo: '+scenario,content,content,
    scenario+','+SCENARIOS[scenario]).run();
  }
  return Response.json({ok:true,stored:true},{headers:{'Cache-Control':'no-store'}});
 }catch(_){return Response.json({ok:false,message:'Registro anônimo indisponível'},{status:503});}
}
export async function trainingReadiness(env){
 if(!env?.DB)return {learning_ready:false};
 try{
  const t=await s(env.DB,"SELECT name FROM sqlite_master WHERE type='table' AND name='lia_training_signals'").first();
  const e=await s(env.DB,"SELECT name FROM sqlite_master WHERE type='table' AND name='lia_training_examples'").first();
  return {learning_ready:!!t,learning_mode:'opt-in-aggregates',
    examples_ready:!!e&&env.LIA_EXAMPLES_ENABLED==='true',
    examples_policy:'consentimento separado · sete dias · revisão administrativa',
    raw_chat_stored:false};
 }catch(_){return {learning_ready:false};}
}
export async function learningHint(env,scenario){
 if(!env?.DB||!Object.hasOwn(SCENARIOS,String(scenario||'')))return '';
 try{
  const rows=(await s(env.DB,`SELECT signal,SUM(total) AS total FROM lia_training_signals
   WHERE scenario=? AND kind='outcome' AND day>=date('now','-30 days')
   GROUP BY signal`,scenario).all()).results||[];
  const safe=Number(rows.find(r=>r.signal==='safe')?.total||0),
   unsafe=Number(rows.find(r=>r.signal==='unsafe')?.total||0);
  if(safe+unsafe<12||unsafe/(safe+unsafe)<.3)return '';
  return 'Neste cenário, reforce sinais de alerta adequados à alfabetização digital e ofereça oportunidades claras de conferir a identidade por outro canal. Não acrescente pedidos de dados reais nem pressão além do limite pedagógico.';
 }catch(_){return '';}
}

// Painel administrativo: tendências de treino agrupadas. O limite de 12
// conclusões consentidas por cenário impede expor decisões individuais.
export async function trainingInsights(env){
 if(!env?.DB)return {scenarios:[],message:'Banco de aprendizado indisponível.'};
 try{
  const response=await s(env.DB,`SELECT scenario,signal,SUM(total) AS total
   FROM lia_training_signals WHERE kind='outcome'
   AND day>=date('now','-30 days') GROUP BY scenario,signal`).all();
  const grouped=new Map();
  for(const row of response.results||[]){
   if(!Object.hasOwn(SCENARIOS,String(row.scenario||'')))continue;
   if(!['safe','unsafe'].includes(row.signal))continue;
   const key=row.scenario;
   const g=grouped.get(key)||{scenario:key,safe:0,unsafe:0};
   g[row.signal]+=Math.max(0,Number(row.total)||0);
   grouped.set(key,g);
  }
  const scenarios=[...grouped.values()].filter(g=>g.safe+g.unsafe>=12)
   .map(g=>{
    const completed=g.safe+g.unsafe,needReview=g.unsafe/completed>=0.3;
    return {
     scenario:g.scenario,completed,
     needs_review:needReview,
     recommendation:needReview
      ?'Reforçar sinais de alerta e a verificação independente da identidade antes de avançar.'
      :'Continuar os exercícios e alternar situações educativas com sinais de alerta distintos.'
    };
   }).sort((a,b)=>b.completed-a.completed).slice(0,25);
  return {scenarios,minimum_group:12,period_days:30,
   message:scenarios.length
    ?'Tendências de exercícios consentidos e agregados. Nenhuma conversa ou pessoa é identificada.'
    :'Ainda não há doze conclusões consentidas por cenário. Os dados individuais não são exibidos.'};
 }catch(_){return {scenarios:[],message:'Não foi possível calcular os resultados coletivos.'};}
}
