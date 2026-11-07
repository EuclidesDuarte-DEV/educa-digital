/* Demonstração direta da Lia V111.3. O motor 3D é o mesmo da videochamada principal. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const el={start:$('startCall'),stop:$('stopCall'),mic:$('micCall'),repeat:$('repeatCall'),form:$('liaForm'),send:$('liaSend'),input:$('liaInput'),sub:$('freeVideoSubtitle'),status:$('freeVideoState'),chat:$('conversation')};
let active=false,working=false,utterance=null,recognition=null,lastSpeech='',serial=0,history=[];
const voice=()=>{const choices=speechSynthesis.getVoices().filter(v=>/^pt[-_]BR$/i.test(v.lang));return choices.find(v=>/natural|neural|premium|francisca|google|microsoft/i.test(v.name))||choices[0];};
function setStatus(v){el.status.textContent=v;}
function add(role,text){const b=document.createElement('div');b.className='bubble '+role;b.textContent=text;el.chat.append(b);el.chat.scrollTop=el.chat.scrollHeight;}
function buttons(){el.start.disabled=active;el.stop.disabled=!active;el.mic.disabled=!active||working;el.repeat.disabled=!active||!lastSpeech;el.send.disabled=!active||working;el.input.disabled=!active||working;}
function stopVoice(){serial++;recognition?.abort();recognition=null;utterance=null;window.speechSynthesis?.cancel();window.EducaLia3D?.stopSpeech?.();window.EducaLia3D?.endBrowserSpeech?.();}
async function say(text){stopVoice();const id=serial;lastSpeech=text;buttons();el.sub.textContent=text;
 const ok=await window.EducaLia3D.speak(text,{onStart:()=>setStatus('Lia falando com Kokoro: o WAV controla os movimentos da boca.'),onEnd:()=>{if(id===serial)setStatus('Sua vez. Fale ou escreva uma resposta.');}});
 if(id!==serial||!active)return;if(ok)return;
 if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){setStatus('Voz indisponível, mas a conversa por texto está ativa.');return;}
 const v=voice();if(!v)setStatus('Tentando voz pt-BR padrão do dispositivo.');
 const u=new SpeechSynthesisUtterance(text);u.lang='pt-BR';if(v)u.voice=v;u.rate=.96;u.pitch=1.02;u.volume=1;
 u.onstart=()=>{if(id!==serial)return;window.EducaLia3D.beginBrowserSpeech(text);setStatus('Lia falando em português brasileiro · articulação aproximada pelo texto.');};
 u.onboundary=e=>{if(id===serial)window.EducaLia3D.wordBoundary(e.charIndex);};
 u.onend=()=>{if(id!==serial)return;utterance=null;window.EducaLia3D.endBrowserSpeech();setStatus('Sua vez. Pode responder por voz ou texto.');};
 u.onerror=()=>{if(id!==serial)return;utterance=null;window.EducaLia3D.endBrowserSpeech();setStatus('Não foi possível reproduzir voz. Leia a legenda e converse digitando.');};
 utterance=u;try{speechSynthesis.speak(u);}catch(e){setStatus('A voz não iniciou: '+e.message);}
}
async function start(){if(active)return;window.EducaLia3D.unlockAudio();active=true;buttons();
 const loaded=await window.EducaLia3D.open();if(!active)return;
 if(!loaded){setStatus('WebGL2 indisponível. Tente um navegador atualizado.');return;}
 const intro='Olá! Eu sou a Lia, uma assistente virtual. Aqui, vamos aprender a reconhecer sinais de golpes em videochamadas. Como posso ajudar?';
 add('lia',intro);await say(intro);
}
function hangup(){active=false;working=false;stopVoice();window.EducaLia3D.close();history=[];buttons();setStatus('Chamada encerrada. Toque em Atender para recomeçar.');el.sub.textContent='Simulação encerrada. Nenhum contato real foi realizado.';}
const looksPrivate=s=>/(?:\d[\s.\-]?){6,}|https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(s);
async function send(text){const msg=String(text||'').trim();if(!active||working||!msg)return;
 if(looksPrivate(msg)){setStatus('Para sua segurança, não informe números pessoais, códigos, endereços, links ou senhas.');return;}
 stopVoice();add('user',msg);working=true;buttons();setStatus('Consultando a IA do Educa+ Digital na Cloudflare…');el.sub.textContent='Lia está pensando…';
 try{const response=await fetch('/api/modo-livre/conversar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scenario:'video',message:msg,history:history.slice(-6)})});
  const data=await response.json();if(!response.ok||!data.ok||data.mode!=='ia'||!data.reply)throw Error(data.message||'Serviço de IA indisponível.');
  if(!active)return;const reply=String(data.reply).slice(0,330);
  history.push({role:'user',content:msg},{role:'assistant',content:reply});history=history.slice(-8);
  add('lia',reply);working=false;buttons();await say(reply);
 }catch(e){if(!active)return;working=false;buttons();el.sub.textContent='A conexão com a inteligência artificial está temporariamente indisponível.';
  setStatus('A conversa real depende do Worker da Cloudflare estar ativo: '+String(e.message).slice(0,140));}
}
function dictate(){if(!active||working)return;const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){setStatus('Reconhecimento de voz não disponível neste navegador. Use o teclado.');return;}
 stopVoice();try{const r=new SR();recognition=r;r.lang='pt-BR';r.continuous=false;r.interimResults=true;
  setStatus('Microfone ligado. Fale naturalmente e finalize a frase.');
  r.onresult=e=>{const lines=Array.from(e.results);const result=lines.find(x=>x.isFinal);
   if(result){recognition=null;r.onend=null;r.stop();void send(result[0].transcript);}else setStatus('Ouvindo: '+String(lines.at(-1)?.[0]?.transcript||'').slice(0,130));};
  r.onerror=()=>{recognition=null;setStatus('Microfone não autorizado ou indisponível. Use o teclado.');};
  r.onend=()=>{if(recognition===r)recognition=null;};r.start();
 }catch(_){setStatus('Não foi possível iniciar o reconhecimento de fala.');}}
el.start.addEventListener('click',()=>void start());el.stop.addEventListener('click',hangup);
el.mic.addEventListener('click',dictate);el.repeat.addEventListener('click',()=>void say(lastSpeech));
el.form.addEventListener('submit',e=>{e.preventDefault();const text=el.input.value;el.input.value='';void send(text);});
window.addEventListener('pagehide',()=>{stopVoice();window.EducaLia3D?.close?.();});
buttons();window.EducaLia3D.open().then(ok=>{if(!active)setStatus(ok?'Avatar 3D pronto. Toque no botão verde para iniciar a chamada.':'Seu navegador não suporta WebGL2 neste aparelho.');});
})();
