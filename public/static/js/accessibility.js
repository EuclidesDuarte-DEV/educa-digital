/* Educa+ Digital V111.34 — preferências simples de acessibilidade.
 * Não é avaliação médica nem coleta dados pessoais. Configurações locais,
 * opcionais e alteráveis. Não interfere na voz Kokoro da LIA.
 */
(() => {
  'use strict';
  const STORAGE = 'educa-accessibility-v1';
  const DEFAULTS = Object.freeze({ text: 'normal', colors: false, reading: true, configured: false });
  const allowedText = new Set(['normal', 'large', 'extra']);
  const $ = (selector) => document.querySelector(selector);

  function normalize(input) {
    const data = input && typeof input === 'object' ? input : {};
    return {
      text: allowedText.has(data.text) ? data.text : DEFAULTS.text,
      colors: data.colors === true,
      reading: data.reading !== false,
      configured: data.configured === true
    };
  }
  function load() {
    try { return normalize(JSON.parse(localStorage.getItem(STORAGE))); }
    catch (_) { return { ...DEFAULTS }; }
  }
  function save(prefs) {
    try { localStorage.setItem(STORAGE, JSON.stringify(prefs)); }
    catch (_) { /* Privacidade/restrições do navegador: preferências funcionam na sessão. */ }
  }

  let prefs = load();
  let activeUtterance = null;
  let reading = false;
  let voiceReady = false;
  let pendingGuide = null;
  let guideTimer = null, guideKey = '', guideText = '', retryGuide = null;
  const callOrMedia = () => !!document.querySelector('#freeCallView.is-active, #freeVideoView.is-active, #liaCallView.is-active, #waCallActiveView.is-active') || !!document.querySelector('#videoLessonView.is-active video:not([paused])') && [...document.querySelectorAll('#videoLessonView.is-active video')].some(v=>!v.paused&&!v.ended);
  const inFreeMode=()=>window.EducaFreeMode?.isActive?.()===true;
  const dialog = $('#accessibilityDialog');
  const status = $('#a11yFeedback');
  const readButton = $('#a11yReadNow');
  const readStatus = $('#a11yReadStatus');
  const fontSelect = $('#a11yFontSize');
  const colorInput = $('#a11yColors');
  const readingInput = $('#a11yReading');

  function report(message) {
    if (status) status.textContent = message;
  }
  function apply() {
    const root = document.documentElement;
    root.classList.toggle('a11y-text-large', prefs.text === 'large');
    root.classList.toggle('a11y-text-extra', prefs.text === 'extra');
    root.classList.toggle('a11y-distinct-colors', prefs.colors);
    root.classList.toggle('a11y-reading', prefs.reading);
    if (readButton) readButton.hidden = !prefs.reading;
    if (fontSelect) fontSelect.value = prefs.text;
    if (colorInput) colorInput.checked = prefs.colors;
    if (readingInput) readingInput.checked = prefs.reading;
    if (!prefs.reading) { pendingGuide = null; retryGuide=null; guideKey='';clearTimeout(guideTimer);stopReading(); }
    window.dispatchEvent(new CustomEvent('educa:accessibility-change', { detail: { ...prefs } }));
  }
  function update(next) {
    prefs = normalize({ ...prefs, ...next });
    apply();
    save(prefs);
    report('Preferência aplicada. Você pode mudar novamente quando quiser.');
    if (prefs.reading && next.reading === true) {
      const t = document.querySelector('#educaTourTitle')?.textContent?.trim();
      const d = document.querySelector('#educaTourText')?.textContent?.trim();
      if (t && document.querySelector('#educaTour')?.hidden === false) pendingGuide = `${t}. ${d || ''}`;
    }
  }
  function open() {
    if (!dialog || dialog.open) return;
    apply();
    report('');
    try { dialog.showModal(); }
    catch (_) { dialog.setAttribute('open', ''); }
    $('#a11ySkip')?.focus();
    window.dispatchEvent(new CustomEvent('educa:accessibility-open'));
  }
  function close() {
    if (!dialog) return;
    prefs.configured = true;
    save(prefs);
    if (dialog.open && typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  function stopReading() {
    clearTimeout(guideTimer);guideTimer=null;retryGuide=null;
    window.EducaLiaNeuralPlayback?.stop?.('guide');
    activeUtterance = null;
    reading = false;
    if (readButton) { readButton.textContent = 'Ouvir esta tela'; readButton.classList.remove('is-speaking'); readButton.setAttribute('aria-label','Ouvir esta tela'); }
    if (readStatus) readStatus.textContent = '';
  }
  function visibleText() {
    const selection = window.getSelection?.()?.toString().trim();
    if (selection) return selection.slice(0, 1200);
    const activePhone = $('.android-view.is-active');
    const coach = $('#coachCard:not([hidden])');
    const roots = dialog?.open
      ? [dialog.querySelector('.a11y-dialog-header'), dialog.querySelector('.a11y-options')].filter(Boolean)
      : activePhone && getComputedStyle(activePhone).display !== 'none'
        ? [coach, activePhone].filter(Boolean)
        : [$('.hero-copy'), $('.how-it-works')].filter(Boolean);
    const text = roots.map(root => {
      const copy = root.cloneNode(true);
      copy.querySelectorAll('script,style,svg,button,input,textarea,select,[hidden],[aria-hidden="true"],.guide-overlay').forEach(el => el.remove());
      return copy.innerText || copy.textContent || '';
    }).join('. ').replace(/\s+/g, ' ').trim();
    return text.slice(0, 1300);
  }
  // V112.61: a leitura utiliza a mesma Dora neural gratuita da videochamada,
  // em vez da voz antiga do sistema operacional.
  function speak(text, { automatic = false } = {}) {
    const message = String(text || '').trim();
    if (!message) {
      if (readStatus) readStatus.textContent = 'Nenhum texto disponível nesta tela.';
      return;
    }
    const neural = window.EducaLiaNeuralPlayback;
    stopReading();
    if (!neural?.speak) {
      if (readStatus) readStatus.textContent = 'Voz neural indisponível neste navegador. O texto continua visível.';
      return;
    }
    reading = true;
    const session = {};
    activeUtterance = session;
    if (readButton) {
      readButton.textContent = 'Parar leitura';
      readButton.classList.add('is-speaking');
      readButton.setAttribute('aria-label','Parar leitura');
    }
    if (readStatus) readStatus.textContent = 'Preparando voz neural brasileira…';
    const complete = message => {
      if (activeUtterance !== session) return;
      activeUtterance = null;reading = false;
      if (readButton) {
        readButton.textContent = 'Ouvir esta tela';readButton.classList.remove('is-speaking');
        readButton.setAttribute('aria-label','Ouvir esta tela');
      }
      if (readStatus) readStatus.textContent = message || '';
    };
    void neural.speak(message,{
      owner:'guide',speed:0.97,
      onStart:()=>{if(activeUtterance===session&&readStatus)readStatus.textContent='Lendo com a voz neural Dora.';},
      onEnd:()=>complete(''),
      onBlocked:()=>{if(activeUtterance!==session)return;complete('O navegador bloqueou o som. Toque novamente para ouvir.');if(automatic)retryGuide=message;},
      onError:()=>{if(activeUtterance!==session)return;complete('A voz neural não pôde ser carregada. O texto continua disponível.');if(automatic)retryGuide=message;}
    }).catch(()=>complete('Não foi possível iniciar a voz neural.'));
  }

  // Navegadores exigem interação da pessoa para liberar síntese de voz.
  // Depois do primeiro toque, cada passo do guia será lido automaticamente,
  // exceto quando a preferência estiver desligada.
  const announce = (text, key) => {
    const message=String(text||'').replace(/\s+/g,' ').trim();
    if(!message||!prefs.reading||inFreeMode()||callOrMedia())return;
    if(key===guideKey&&message===guideText)return;
    guideKey=key;guideText=message;retryGuide=null;
    if(!voiceReady){pendingGuide=message;return;}
    clearTimeout(guideTimer);
    guideTimer=setTimeout(()=>{guideTimer=null;if(prefs.reading&&!inFreeMode()&&!callOrMedia())speak(message,{automatic:true});},180);
  };
  const unlockVoice = () => {
    voiceReady = true;
    if(!prefs.reading)return;
    window.EducaLiaNeuralPlayback?.unlock?.();
    if(inFreeMode()||callOrMedia())return;
    const message=pendingGuide||retryGuide;
    if(message){pendingGuide=null;retryGuide=null;speak(message,{automatic:true});}
  };
  // Não usar once: Safari pode suspender/interromper áudio ao trocar de tela.
  for(const type of ['pointerup','touchend','click','keydown'])
    document.addEventListener(type,unlockVoice,{capture:true,passive:true});
  window.addEventListener('educa:guide-step', ({ detail }) => {
    const text=[detail?.title,detail?.description].filter(Boolean).join('. ');
    announce(text,'tour:'+String(detail?.step||''));
  });
  // O controlador das aulas emite mudanças de tela e instruções reais.
  window.addEventListener('educa:training-view',({detail})=>{
    pendingGuide=null;stopReading();guideKey='';guideText='';
    if(!prefs.reading||inFreeMode()||callOrMedia())return;
    const name=detail?.view;
    const fallback={
      home:'Escolha um aplicativo para praticar. Se o Banco estiver destacado, toque nele para iniciar o pré-teste.',
      learning:'Escolha o assunto que deseja aprender. Você pode fazer uma atividade de cada vez.',
      'module-path':()=>[$('#modulePathTitle')?.textContent,$('#modulePathHeadline')?.textContent,'Escolha uma atividade da lista para começar.'].filter(Boolean).join('. '),
      'guided-practice':()=>[$('#guidedTitle')?.textContent,$('#guidedInstruction')?.textContent].filter(Boolean).join('. '),
      'video-lesson':'Assista à explicação e depois toque em praticar para continuar.',
      'bank-home':'Você está no banco de treinamento. Toque em Pix para praticar.',
      'bank-pix':'Escolha a opção Pix indicada pela atividade.',
      'bank-send':'Escolha uma chave de exemplo e siga a orientação na tela.',
      'bank-review':'Confira os dados de exemplo antes de escolher como continuar.',
      whatsapp:'Escolha uma conversa para praticar.',
      'settings-main':'Escolha o ajuste que deseja aprender.',
      'govbr-login':'Toque na opção indicada para treinar o acesso com segurança.',
      success:'Muito bem! Confira o resultado e escolha como deseja continuar.'
    }[name];
    if(fallback)announce(typeof fallback==='function'?fallback():fallback,'view:'+name);
  });
  window.addEventListener('educa:training-guide',({detail})=>{
    if(!prefs.reading||inFreeMode()||callOrMedia())return;
    const text=[detail?.title,detail?.description].filter(Boolean).join('. ');
    announce(text,'lesson:'+String(detail?.view||''));
  });
  // Alguns exercícios preenchem o mini-guia diretamente. Observar apenas os
  // dois textos pedagógicos, nunca o conteúdo das conversas ou dados digitados.
  const coachNodes=[$('#miniCoachTitle'),$('#miniCoachText')].filter(Boolean);
  if(typeof MutationObserver==='function'){
    let previousCoach=coachNodes.map(e=>e.textContent.trim()).join('. ');
    const observer=new MutationObserver(()=>{
      const message=coachNodes.map(e=>e.textContent.trim()).filter(Boolean).join('. ');
      if(message===previousCoach)return;
      previousCoach=message;
      const view=$('#phoneScreen')?.dataset.currentView||'home';
      if(!view.startsWith('free-')&&view!=='video-lesson')announce(message,'lesson:'+view);
    });
    for(const el of coachNodes)observer.observe(el,{childList:true,characterData:true,subtree:true});
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden){pendingGuide=null;stopReading();}});
  // A tela continua disponível mesmo que o visitante decida não configurar nada.
  $('#openAccessibilitySettings')?.addEventListener('click', open);
  $('#a11yFinish')?.addEventListener('click', close);
  $('#a11ySkip')?.addEventListener('click', close);
  $('#a11yReset')?.addEventListener('click', () => {
    update({ text: 'normal', colors: false, reading: false });
    report('Padrão restaurado. Você pode personalizar novamente.');
  });
  $('#a11yExample')?.addEventListener('click', () => { window.EducaLiaNeuralPlayback?.unlock?.(); speak('Olá! Este é um exemplo de leitura em voz alta do Educa Mais Digital.'); });
  fontSelect?.addEventListener('change', () => update({ text: fontSelect.value }));
  colorInput?.addEventListener('change', () => update({ colors: colorInput.checked }));
  readingInput?.addEventListener('change', () => update({ reading: readingInput.checked }));
  readButton?.addEventListener('click', () => reading ? stopReading() : speak(visibleText()));
  // No Android simulado, o link abre as mesmas preferências reais do Educa+.
  document.querySelectorAll('[data-open-educa-accessibility]').forEach(button => button.addEventListener('click', open));
  dialog?.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
  // Fechar ao tocar fora do painel, preservando o comportamento nativo do dialog.
  dialog?.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close();
  });
  dialog?.addEventListener('close', () => { prefs.configured = true; save(prefs); });
  apply();
  // V111.34: painel apenas sob demanda; guia visual é o primeiro contato.
  // Não abrir o diálogo automaticamente, mesmo em uma primeira visita.
  window.EducaAccessibility = Object.freeze({ open, get: () => ({ ...prefs }), update, speak, stopReading });
})();
