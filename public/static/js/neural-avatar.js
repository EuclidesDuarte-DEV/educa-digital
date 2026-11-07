/* Educa+ Digital V110.7 — Lia, personagem FICTÍCIA de treinamento.
 * Kokoro => voz pt-BR; MuseTalk GPU opcional => vídeo + áudio do mesmo WAV.
 * Sem Simli, SDK de terceiros, Azure ou câmera enviada ao servidor.
 * Vídeo somente quando renderizado de verdade. Caso falhe, Web Speech de compatibilidade.
 */
(()=>{
'use strict';
const portrait=document.getElementById('freeVideoPortrait');
const video=document.getElementById('freeNeuralVideo');
const audio=document.getElementById('freeNeuralAudio');
let active=false,config=null,code='',controller=null,mediaUrl=null,serial=0;
const statusText=message=>{const state=document.getElementById('freeVideoState');if(state)state.textContent=message;};
function headers(json=false){const h={'X-Educa-Lia-Code':code};if(json)h['Content-Type']='application/json';return h;}
function cleanMedia(){
 for(const element of [video,audio])if(element){element.onended=null;element.onerror=null;element.pause();element.removeAttribute('src');element.load();}
 portrait?.classList.remove('v1105-neural-active');if(video)video.hidden=true;
 if(mediaUrl){URL.revokeObjectURL(mediaUrl);mediaUrl=null;}
}
async function request(path,options={}){
 const response=await fetch(path,{credentials:'same-origin',cache:'no-store',...options});
 if(!response.ok)throw new Error('Provedor temporariamente indisponível ('+response.status+').');
 return response;
}
async function status(){
 try{config=await (await request('/api/avatar/health')).json();}
 catch(_){config={enabled:false};}
 return config;
}
async function connect(){
 const cfg=await status();if(!cfg.enabled){active=false;return false;}
 // Somente a equipe possui o código. Não iniciar renderizações involuntariamente.
 if(cfg.staff_preview){
  code=sessionStorage.getItem('EDUCA_LIA_TEST_CODE')||'';
  if(!code){const value=window.prompt('Videochamada neural educativa: digite o código de teste da equipe (não é a senha do site).');code=String(value||'').trim();}
  if(!code){statusText('Modo neural não ativado. A ligação continua no modo básico.');return false;}
  sessionStorage.setItem('EDUCA_LIA_TEST_CODE',code);
 }
 active=true;
 statusText(cfg.video_enabled?'MuseTalk detectado: vídeo facial neural por resposta.':'Vídeo de IA indisponível. '+(cfg.video_reason||'Instale MuseTalk e uma GPU CUDA.'));
 return true;
}
function stopSpeech(){serial++;controller?.abort();controller=null;cleanMedia();}
function close(){stopSpeech();active=false;}
async function fetchMedia(path,signal){
 if(!/^\/api\/avatar\/media\/[a-f0-9]{32}\.(wav|mp4)$/.test(path))throw new Error('Formato de mídia inválido.');
 const response=await request(path,{headers:headers(),signal});
 return response.blob();
}
async function play(blob,isVideo,id,hooks){
 if(serial!==id||!active)return true;
 cleanMedia();
 const target=isVideo?video:audio;
 if(!target)return false;
 mediaUrl=URL.createObjectURL(blob);
 target.src=mediaUrl;
 target.preload='auto';
 target.muted=false;
 if(isVideo){target.hidden=false;target.playsInline=true;}
 // No video: a trilha do MP4 contém EXATAMENTE o áudio que dirigiu os lábios.
 target.onended=()=>{if(serial!==id)return;cleanMedia();hooks.onEnd?.();};
 target.onerror=()=>{if(serial!==id)return;cleanMedia();hooks.onError?.('Falha na reprodução da mídia.');};
 try{await target.play();}
 catch(e){cleanMedia();hooks.onError?.('O navegador bloqueou o áudio. Clique em Repetir para ouvir.');return true;}
 if(serial!==id)return true;
 if(isVideo)portrait?.classList.add('v1105-neural-active');
 hooks.onStart?.(isVideo?'video':'audio');
 return true;
}
async function speak(text,hooks={}){
 if(!active)return false;
 stopSpeech();const id=serial;
 const ctrl=new AbortController();controller=ctrl;
 try{
  statusText('Lia está preparando a voz brasileira…');
  const reply=await (await request('/api/avatar/speak',{method:'POST',headers:headers(true),body:JSON.stringify({text:String(text).slice(0,450)}),signal:ctrl.signal})).json();
  if(ctrl.signal.aborted||serial!==id)return true;
  if(!reply.ok||!reply.job_id)throw new Error('Áudio neural não gerado.');
  if(reply.video_enabled){
   statusText('Produzindo quadros faciais reais com MuseTalk… Isso pode demorar dependendo da GPU.');
   try{
    let result=await (await request('/api/avatar/render',{method:'POST',headers:headers(true),body:JSON.stringify({job_id:reply.job_id}),signal:ctrl.signal})).json();
    // Polling assíncrono: não perder o vídeo depois dos antigos 15 segundos.
    // A operação pesada corre no PC da equipe, nunca no Cloudflare Worker.
    const started=Date.now();
    while(result.status!=='ready'&&result.status!=='failed'&&Date.now()-started<600000){
     await new Promise((resolve,reject)=>{
      const abort=()=>{clearTimeout(timer);reject(new Error('Cancelado'));};
      const timer=setTimeout(()=>{ctrl.signal.removeEventListener('abort',abort);resolve();},1800);
      ctrl.signal.addEventListener('abort',abort,{once:true});
     });
     if(ctrl.signal.aborted||serial!==id)return true;
     result=await (await request('/api/avatar/render-status/'+reply.job_id,{headers:headers(),signal:ctrl.signal})).json();
     if(result.status==='queued')statusText('Avatar neural na fila. Aguardando GPU local…');
     else if(result.status==='rendering')statusText('MuseTalk gerando vídeo facial, aguarde a renderização local…');
    }
    if(ctrl.signal.aborted||serial!==id)return true;
    if(result.status==='ready'&&result.video_url){
      const blob=await fetchMedia(result.video_url,ctrl.signal);
      return play(blob,true,id,hooks);
    }
    statusText('Vídeo neural não pôde ser produzido; usando somente a voz.');
   }catch(e){
    if(ctrl.signal.aborted||serial!==id)return true;
    console.warn('Render neural não disponível:',String(e?.message||e));
    statusText('Erro no MuseTalk; a Lia continuará respondendo por voz e texto.');
   }
  }
  if(ctrl.signal.aborted||serial!==id)return true;
  statusText('Voz Kokoro ativa; sem renderização de vídeo facial nesta resposta.');
  return play(await fetchMedia(reply.audio_url,ctrl.signal),false,id,hooks);
 }catch(e){
  if(ctrl.signal.aborted||serial!==id)return true;
  console.warn('Kokoro local indisponível:',String(e?.message||e));
  stopSpeech();return false; // permitir voz Web Speech de compatibilidade
 }
}
window.EducaNeuralAvatar=Object.freeze({status,connect,speak,stopSpeech,close,isActive:()=>active});
})();
