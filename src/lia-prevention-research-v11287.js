/* V112.87 — monitor de fontes oficiais de prevenção, não treinamento de fraude.
 * Nenhum HTML remoto é armazenado, executado ou enviado ao modelo.
 * Um hash identifica alterações; a equipe revisa o material na fonte original.
 */
export const PREVENTION_SOURCES=Object.freeze([
 Object.freeze({id:'cert-cartilha',title:'CERT.br — Cartilha de Segurança',url:'https://cartilha.cert.br/fasciculos/',summary:'Identificação de mensagens suspeitas, proteção de contas e orientações a vítimas.'}),
 Object.freeze({id:'bc-pix',title:'Banco Central — Segurança no Pix',url:'https://www.bcb.gov.br/estabilidadefinanceira/pix-seguranca',summary:'Conferência independente, proteção financeira e contestação de transações.'}),
 Object.freeze({id:'bc-dicas',title:'Banco Central — Prevenção de golpes',url:'https://www.bcb.gov.br/meubc/faqs/p/dicas-gerais-para-evitar-golpes',summary:'Verificação de identidade e confirmação por canais conhecidos.'}),
 Object.freeze({id:'gov-alertas',title:'Governo Federal — Alertas digitais',url:'https://www.gov.br/cisc/pt-br/alertas-de-golpes-digitais',summary:'Alertas públicos para conscientização e proteção do cidadão.'})
]);
const maxBytes=1024*1024;
export async function sourceFingerprint(url,fetcher=fetch){
 const response=await fetcher(url,{redirect:'error',signal:AbortSignal.timeout(12000),headers:{Accept:'text/html'}});
 if(!response.ok||!response.body)throw Error('SOURCE_UNAVAILABLE');
 if(!String(response.headers.get('content-type')||'').includes('text/html'))throw Error('SOURCE_TYPE');
 const reader=response.body.getReader();
 let size=0;const chunks=[];
 try{
  while(true){
   const {done,value}=await reader.read();if(done)break;
   size+=value.byteLength;if(size>maxBytes)throw Error('SOURCE_TOO_LARGE');
   chunks.push(value);
  }
 }finally{await reader.cancel().catch(()=>{});}
 const bytes=new Uint8Array(size);let offset=0;
 for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 const digest=await crypto.subtle.digest('SHA-256',bytes);
 return [...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
}
export async function refreshPreventionSources(env,{fetcher=fetch}={}){
 if(env?.LIA_PREVENTION_RESEARCH!=='true'||!env.DB||env.PREVIEW_DB_BOOTSTRAP==='true')return {enabled:false,checked:0,changed:0,errors:0};
 const db=env.DB;const bind=(q,...args)=>db.prepare(q).bind(...args);
 await db.prepare(`CREATE TABLE IF NOT EXISTS lia_prevention_source_checks (
  id TEXT PRIMARY KEY,fingerprint TEXT NOT NULL,checked_at TEXT NOT NULL DEFAULT (datetime('now'))
 )`).run();
 let checked=0,changed=0,errors=0;
 for(const source of PREVENTION_SOURCES){
  try{
   const fingerprint=await sourceFingerprint(source.url,fetcher);
   const previous=await bind('SELECT fingerprint FROM lia_prevention_source_checks WHERE id=?',source.id).first();
   if(previous?.fingerprint!==fingerprint){
    const id='prevention-review-'+source.id+'-'+fingerprint.slice(0,16);
    await bind(`INSERT OR IGNORE INTO lia_kb_nodes
      (id,title,category,project,summary,content,keywords,source,status,visibility)
      VALUES(?,?,'conhecimento','Educa+ Digital',?,?,?,?,'draft','private')`,
      id,'Revisar: '+source.title,source.summary,
      'Fonte oficial nova ou alterada. Revisar na página original e registrar apenas sinais de alerta, prevenção e orientação a vítimas. Nenhum texto externo foi importado automaticamente.',
      'prevencao seguranca orientacao revisao',source.url).run();
    changed++;
   }
   await bind(`INSERT INTO lia_prevention_source_checks(id,fingerprint) VALUES(?,?)
     ON CONFLICT(id) DO UPDATE SET fingerprint=excluded.fingerprint,checked_at=datetime('now')`,source.id,fingerprint).run();
   checked++;
  }catch(_){errors++;}
 }
 return {enabled:true,checked,changed,errors};
}
