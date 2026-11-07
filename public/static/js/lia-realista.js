/* Educa+ Digital V111.4 | FICTITIOUS Lia: reference preview vs real rendered neural video.
 * No external avatar SDK. The six-second Lovable clip is NEVER used as a lip-synced answer.
 */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const el={video:$('avatarVideo'),still:$('avatarStill'),label:$('stageLabel'),sub:$('subtitle'),clock:$('callClock'),begin:$('begin'),end:$('end'),mic:$('mic'),repeat:$('repeat'),preview:$('preview'),resume:$('resumeVideo'),form:$('form'),input:$('text'),send:$('send'),chat:$('messages'),status:$('status'),setup:$('setup'),backend:$('backendStatus')};
const reference='/static/videos/lia-lovable-referencia.mp4';
let active=false,busy=false,previewing=false,code='',health=null,last='',utterance=null,recognition=null,ctrl=null,mediaUrl=null,turn=0,seconds=0,timer=null,history=[];
const privateInput=s=>/(?:\d[\s.-]?){6,}|https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(s);
function status(s){el.status.textContent=s;}
function label(s){el.label.textContent=s;}
function append(who,s){const d=document.createElement('div');d.className='message '+(who==='user'?'me':'lia');d.textContent=s;el.chat.append(d);el.chat.scrollTop=el.chat.scrollHeight;}
function buttons(){el.begin.disabled=active;el.end.disabled=!active;el.mic.disabled=!active||busy;el.repeat.disabled=!active||busy||!last;el.send.disabled=!active||busy;el.input.disabled=!active||busy;el.preview.disabled=busy;}
function clearVideo(){el.video.pause();el.video.onended=null;el.video.onerror=null;el.video.removeAttribute('src');el.video.load();el.video.hidden=true;el.still.hidden=false;el.resume.hidden=true;if(mediaUrl)URL.revokeObjectURL(mediaUrl);mediaUrl=null;}
function stopSpeech(){turn++;ctrl?.abort();ctrl=null;recognition?.abort();recognition=null;window.speechSynthesis?.cancel();try{utterance?.pause?.();}catch(_){}utterance=null;previewing=false;clearVideo();}
function stop(){active=false;busy=false;stopSpeech();clearInterval(timer);timer=null;seconds=0;history=[];el.clock.textContent='Chamada encerrada';el.sub.textContent='A ligação educativa foi encerrada.';label('Referência visual da personagem · imagem parada');status('Chamada encerrada.');buttons();}
function timeout(ms,signal){return new Promise((resolve,reject)=>{const t=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},ms);const abort=()=>{clearTimeout(t);reject(Error('cancelled'));};signal.addEventListener('abort',abort,{once:true});});}
async function request(path,opts={}){const r=await fetch(path,{cache:'no-store',credentials:'same-origin',...opts});if(!r.ok)throw Error('Serviço indisponível (HTTP '+r.status+').');return r;}
function secureHeaders(json=false){return {'X-Educa-Lia-Code':code,...(json?{'Content-Type':'application/json'}:{})};}
async function configure(){status('Verificando o gateway privado da Lia…');try{health=await (await request('/api/avatar/health')).json();if(!health.enabled){el.backend.textContent='Motor privado offline ou não configurado; navegador continua disponível.';return;}
 const value=window.prompt('Código da equipe para testar Kokoro/MuseTalk (não é a senha do aluno):');if(!value)return;
 code=String(value).trim().slice(0,150);
 if(code.length<8){code='';el.backend.textContent='Código muito curto.';return;}
 el.backend.textContent=health.video_enabled?'Kokoro + MuseTalk informado como ativo. A disponibilidade real será testada ao falar.':'Kokoro disponível; vídeo neural não disponível: '+(health.video_reason||'GPU ausente');
 }catch(_){health={enabled:false};el.backend.textContent='Não foi possível acessar o motor privado. Sem alteração na chamada.';}finally{status(active?'Sua vez: fale ou digite.':'Pronta para iniciar');}}
function referenceMotion(){
 el.video.src=reference;el.video.muted=true;el.video.loop=true;el.video.playsInline=true;
 el.video.hidden=false;el.still.hidden=true;
 Promise.resolve(el.video.play()).catch(()=>{el.video.hidden=true;el.still.hidden=false;});
}
function browserVoice(s,id){clearVideo();label('Vídeo gravado em movimento + voz brasileira; sem sincronia dos lábios');if(!window.SpeechSynthesisUtterance||!window.speechSynthesis){status('Voz não disponível neste navegador. Texto pronto para leitura.');return;}
 const play=(pt)=>{
 if(id!==turn||!active)return;
 if(!pt||!/^pt[-_]BR$/i.test(pt.lang)){status('Voz feminina pt-BR não encontrada. Toque em “Escolher voz feminina” ou ative Kokoro.');return;}
 const u=new SpeechSynthesisUtterance(s);u.lang='pt-BR';u.rate=.96;u.pitch=1;u.voice=pt;
 u.onstart=()=>{if(id===turn&&active){referenceMotion();status('Lia falando pela voz do navegador; movimento visual não é lip-sync.');}};
 u.onend=()=>{if(id===turn&&active){clearVideo();status('Sua vez.');}};u.onerror=()=>{if(id===turn&&active){clearVideo();status('Voz não iniciou. Toque em Repetir para ouvir.');}};utterance=u;try{window.speechSynthesis.cancel();window.speechSynthesis.resume();window.speechSynthesis.speak(u);}catch(_){status('Falha ao iniciar a voz feminina. Leia a resposta.');}
 };const voice=window.EducaLiaVoice?.choose?.();if(voice){play(voice);}else{status('Carregando vozes femininas pt-BR…');void window.EducaLiaVoice?.waitForFemale?.().then(play);}}
async function media(path,signal){if(!/^\/api\/avatar\/media\/[a-f0-9]{32}\.(mp4|wav)$/.test(path))throw Error('Caminho de mídia inválido.');return (await request(path,{headers:secureHeaders(),signal})).blob();}
async function playback(blob,type,id){if(!active||id!==turn)return;clearVideo();mediaUrl=URL.createObjectURL(blob);el.video.src=mediaUrl;el.video.hidden=false;el.still.hidden=true;el.video.muted=false;el.video.loop=false;el.video.playsInline=true;label(type==='video'?'MuseTalk: vídeo gerado para esta resposta':'Kokoro: áudio gerado; vídeo não disponível');
 if(type==='audio'){clearVideo();return false;}
 el.video.onended=()=>{if(id!==turn||!active)return;clearVideo();label('Aguardando sua resposta · imagem parada');status('Sua vez de responder.');};
 el.video.onerror=()=>{if(id!==turn||!active)return;clearVideo();status('Não foi possível reproduzir o MP4.');};
 try{await el.video.play();status('Lia falando com áudio e vídeo renderizados para esta resposta.');}catch(_){el.resume.hidden=false;status('Toque em “Tocar vídeo gerado” para permitir áudio no iPhone.');}return true;}
async function neural(s,id){if(!code||!health?.enabled)return false;const controller=new AbortController();ctrl=controller;try{
 status('Kokoro está gerando áudio pt-BR…');const spoken=await (await request('/api/avatar/speak',{method:'POST',headers:secureHeaders(true),body:JSON.stringify({text:s.slice(0,450)}),signal:controller.signal})).json();
 if(id!==turn||!active)return true;
 if(spoken.video_enabled){status('MuseTalk está renderizando movimentos da boca na GPU…');let state=await (await request('/api/avatar/render',{method:'POST',headers:secureHeaders(true),body:JSON.stringify({job_id:spoken.job_id}),signal:controller.signal})).json();
  const start=Date.now();while(state.status!=='ready'&&state.status!=='failed'&&Date.now()-start<180000){await timeout(1800,controller.signal);if(id!==turn||!active)return true;state=await (await request('/api/avatar/render-status/'+spoken.job_id,{headers:secureHeaders(),signal:controller.signal})).json();}
  if(state.status==='ready'&&state.video_url){return await playback(await media(state.video_url,controller.signal),'video',id);}status('Vídeo não ficou pronto. Reproduzindo somente a voz.');}
 // No-video Kokoro path: play audio via HTMLAudioElement, do NOT animate the 6s reference.
 const wav=await media(spoken.audio_url,controller.signal);if(id!==turn||!active)return true;clearVideo();const url=URL.createObjectURL(wav);mediaUrl=url;const a=new Audio(url);utterance=a;
 label('Kokoro (pf_dora) · imagem parada, sem vídeo sincronizado');a.onended=()=>{if(id===turn&&active){status('Sua vez de responder.');URL.revokeObjectURL(url);if(mediaUrl===url)mediaUrl=null;}};
 try{await a.play();status('Lia falando com voz Kokoro em português brasileiro.');}catch(_){status('O áudio foi bloqueado pelo navegador. Toque em Repetir.');}return true;
 }catch(e){if(controller.signal.aborted||id!==turn)return true;console.warn('Lia render neural:',e);status('Motor neural indisponível; usando voz do navegador.');return false;}finally{if(ctrl===controller)ctrl=null;}}
function say(s){stopSpeech();const id=turn;last=s;el.sub.textContent=s;buttons();
 if(!code||!health?.enabled){browserVoice(s,id);buttons();return;}
 void neural(s,id).then(ok=>{if(!ok&&id===turn&&active)browserVoice(s,id);buttons();}).catch(()=>{if(id===turn&&active)browserVoice(s,id);buttons();});
}
async function begin(){if(active)return;active=true;seconds=0;el.clock.textContent='00:00 · em andamento';timer=setInterval(()=>{if(!active)return;seconds++;el.clock.textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')+' · em andamento';},1000);buttons();const s='Olá! Sou a Lia, uma personagem fictícia do Educa+ Digital. Vamos aprender a identificar sinais de golpes em videochamadas. O que você gostaria de praticar?';append('lia',s);await say(s);}
async function send(s){const msg=String(s||'').trim();if(!active||busy||!msg)return;if(privateInput(msg)){status('Evite números pessoais, links, CPF e códigos. Use apenas situações fictícias.');return;}
 stopSpeech();busy=true;buttons();append('user',msg);el.sub.textContent='Lia está pensando…';status('Consultando a IA do Educa+ Digital…');const thisTurn=turn;
 try{const r=await request('/api/modo-livre/conversar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scenario:'video',message:msg,history:history.slice(-6)})});const result=await r.json();if(!r.ok||result.mode!=='ia'||!result.ok||!result.reply)throw Error('Sem resposta da IA da Cloudflare.');if(!active||thisTurn!==turn)return;
 const reply=String(result.reply).slice(0,350);history.push({role:'user',content:msg},{role:'assistant',content:reply});history=history.slice(-8);append('lia',reply);busy=false;buttons();await say(reply);
 }catch(e){if(!active||thisTurn!==turn)return;busy=false;buttons();status('IA indisponível: confirme o Worker e Workers AI. '+String(e.message).slice(0,90));el.sub.textContent='A IA do Educa+ Digital está temporariamente indisponível.';}}
function preview(){if(busy)return;stopSpeech();el.video.src=reference;el.video.hidden=false;el.still.hidden=true;el.video.loop=false;el.video.muted=false;el.video.playsInline=true;previewing=true;label('PRÉVIA GRAVADA · não é uma resposta ao vivo');el.sub.textContent='Vídeo original do Lovable, apenas para visualizar a aparência da Lia.';el.video.onended=()=>{if(!previewing)return;previewing=false;clearVideo();label('Prévia encerrada · imagem parada');};el.video.play().catch(()=>{el.resume.hidden=false;status('Toque em ▶ para permitir a reprodução.');});}
function dictate(){if(!active||busy)return;const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){status('Reconhecimento de voz não suportado aqui. Use o teclado.');return;}stopSpeech();try{const r=new R();recognition=r;r.lang='pt-BR';r.interimResults=false;r.continuous=false;r.onresult=e=>{const value=String(e.results?.[0]?.[0]?.transcript||'');recognition=null;void send(value);};r.onerror=()=>{recognition=null;status('Microfone indisponível; escreva sua mensagem.');};r.start();status('Ouvindo… fale naturalmente.');}catch(_){status('Permissão de microfone indisponível.');}}
$('chooseFemaleVoice')?.addEventListener('click',()=>{stopSpeech();window.EducaLiaVoice?.openSettings?.();});el.begin.addEventListener('click',()=>{void begin();});el.end.addEventListener('click',stop);el.setup.addEventListener('click',()=>{void configure();});el.preview.addEventListener('click',preview);el.repeat.addEventListener('click',()=>{if(active&&!busy&&last)void say(last);});el.mic.addEventListener('click',dictate);el.resume.addEventListener('click',()=>{el.video.play().then(()=>el.resume.hidden=true).catch(()=>status('Reprodução bloqueada no dispositivo.'));});el.form.addEventListener('submit',e=>{e.preventDefault();const s=el.input.value;el.input.value='';void send(s);});window.addEventListener('pagehide',stop);buttons();
})();
