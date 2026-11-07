/* Educa+ Digital V111.11 — seleção explícita de voz brasileira feminina.
 * Web Speech não fornece gênero no objeto da voz. Só seleciona automaticamente
 * nomes femininos conhecidos; nunca usa a primeira voz pt-BR às cegas.
 * Kokoro pf_dora permanece a opção feminina neural independente do navegador.
 */
(()=>{
 'use strict';
 const FEMALE=[/francisca/,/\bmaria\b/,/luciana/,/\bvitoria\b/,/\bcamila\b/,/fernanda/,/heloisa/,/leticia/,/joana/,/raquel/,/bruna/,/isabela/,/mariana/,/karina/,/\bbia\b/,/\bana\b/,/\bhelo\b/,/google portugues do brasil/];
 const MALE=[/\bhenrique\b/,/\bdaniel\b/,/\bfelipe\b/,/\bricardo\b/,/\bantonio\b/,/\bpedro\b/,/\btiago\b/,/\broberto\b/,/\balex\b/,/\bsanta\b/,/\bmale\b/,/\bmasculin/];
 const STORAGE='EDUCA_LIA_VOZ_BR_FEMININA';
 const normalized=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const ptBR=v=>/^pt[-_]BR$/i.test(String(v?.lang||''));
 const female=v=>ptBR(v)&&!MALE.some(rx=>rx.test(normalized(v.name)))&&FEMALE.some(rx=>rx.test(normalized(v.name)));
 const male=v=>ptBR(v)&&MALE.some(rx=>rx.test(normalized(v.name)));
 const voices=()=>typeof window!=='undefined'&&window.speechSynthesis?.getVoices?.().filter(ptBR)||[];
 function stored(){try{return window.localStorage?.getItem(STORAGE)||'';}catch(_){return '';}}
 function save(v){try{window.localStorage?.setItem(STORAGE,v.voiceURI||v.name);}catch(_){} }
 function choose(input=voices(),wanted=stored()){
  const pt=input.filter(ptBR);
  // Uma escolha manual explícita permite vozes regionais com nomes não conhecidos.
  if(wanted){const found=pt.find(v=>(v.voiceURI||v.name)===wanted);if(found&&!male(found))return found;}
  const candidates=pt.filter(female);
  const rank=v=>{const n=normalized(v.name);return (/francisca/.test(n)?0:/luciana/.test(n)?1:/\bmaria\b/.test(n)?2:/google portugues/.test(n)?3:4)+(v.localService?0:.01);};
  return candidates.sort((a,b)=>rank(a)-rank(b))[0]||null;
 }
 function waitForFemale(timeout=1800){
  const now=choose();if(now)return Promise.resolve(now);
  return new Promise(resolve=>{
   const synth=window.speechSynthesis;
   if(!synth){resolve(null);return;}
   let done=false;
   function finish(){if(done)return;done=true;clearTimeout(t);synth.removeEventListener?.('voiceschanged',changed);resolve(choose());}
   function changed(){if(choose())finish();}
   synth.addEventListener?.('voiceschanged',changed);
   const t=setTimeout(finish,timeout);
   changed();
  });
 }
 function openSettings(){
  if(typeof document==='undefined')return;
  document.getElementById('lia-voice-dialog')?.remove();
  const box=document.createElement('dialog');box.id='lia-voice-dialog';box.className='lia-voice-dialog';
  box.innerHTML=`<form method="dialog"><div class="lia-voice-head"><strong>Voz feminina da Lia</strong><button value="close" aria-label="Fechar">✕</button></div>
  <p>Escolha uma voz em português brasileiro e ouça a prévia. A voz neural Kokoro (pf_dora) só funciona quando o motor privado estiver ativado.</p>
  <label for="lia-voice-choices">Voz disponível neste computador</label><select id="lia-voice-choices"></select>
  <div class="lia-voice-actions"><button type="button" id="lia-voice-preview">▶ Ouvir amostra</button><button type="button" id="lia-voice-save">Usar esta voz</button></div>
  <p id="lia-voice-feedback" role="status" aria-live="polite"></p><small>Vozes desconhecidas precisam ser testadas antes de salvar. Nenhuma voz masculina é selecionada automaticamente. Se não houver uma voz feminina, instale uma voz pt-BR no sistema ou ative Kokoro.</small></form>`;
  document.body.append(box);
  const select=box.querySelector('#lia-voice-choices'),feedback=box.querySelector('#lia-voice-feedback');
  const options=()=>{
   const vs=voices().filter(v=>!male(v));select.replaceChildren();
   for(const v of vs){const o=document.createElement('option');o.value=v.voiceURI||v.name;o.textContent=v.name+(female(v)?' · feminina identificada':' · confirme pelo teste');select.append(o);}
   const selected=choose();if(selected)select.value=selected.voiceURI||selected.name;
   if(!vs.length){feedback.textContent='Nenhuma voz pt-BR feminina/identificável encontrada. O áudio neural Kokoro não depende desta lista.';}
   return vs;
  };
  options();
  const getSelected=()=>voices().find(v=>(v.voiceURI||v.name)===select.value&&!male(v));
  let previewed='';
  select.addEventListener('change',()=>{previewed='';feedback.textContent='Ouça a prévia antes de escolher.';});
  box.querySelector('#lia-voice-preview').addEventListener('click',()=>{
   const v=getSelected();if(!v){feedback.textContent='Voz indisponível. Atualize a lista ou ative o motor Kokoro.';return;}
   if(!window.SpeechSynthesisUtterance||!window.speechSynthesis){feedback.textContent='Síntese de voz não suportada.';return;}
   window.speechSynthesis.cancel();
   const u=new SpeechSynthesisUtterance('Olá! Eu sou a Lia, sua assistente virtual. Vamos aprender juntas e juntos a usar a internet com segurança.');
   u.lang='pt-BR';u.voice=v;u.pitch=1;u.rate=.96;
   u.onstart=()=>{previewed=v.voiceURI||v.name;feedback.textContent='Prévia em reprodução: '+v.name;};
   u.onerror=()=>{previewed='';feedback.textContent='Falha ao reproduzir esta voz.';};
   window.speechSynthesis.resume();window.speechSynthesis.speak(u);
  });
  box.querySelector('#lia-voice-save').addEventListener('click',()=>{
   const v=getSelected();if(!v){feedback.textContent='Não foi possível escolher essa voz.';return;}
   if(!female(v)&&previewed!==(v.voiceURI||v.name)){feedback.textContent='Para selecionar uma voz não reconhecida, ouça a prévia primeiro.';return;}
   save(v);window.speechSynthesis?.cancel();feedback.textContent='Voz da Lia salva: '+v.name+'. Teste novamente a videochamada.';
  });
  box.addEventListener('close',()=>{window.speechSynthesis?.cancel();box.remove();});
  box.showModal();
 }
 if(typeof window!=='undefined')window.EducaLiaVoice=Object.freeze({choose,voices,female,male,waitForFemale,openSettings});
})();
