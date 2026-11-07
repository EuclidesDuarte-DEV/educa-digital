/* Educa+ Digital V111.34 — preferências simples de acessibilidade.
 * Não é avaliação médica nem coleta dados pessoais. Configurações locais,
 * opcionais e alteráveis. Não interfere na voz Kokoro da LIA.
 */
(() => {
  'use strict';
  const STORAGE = 'educa-accessibility-v1';
  const DEFAULTS = Object.freeze({ text: 'normal', colors: false, reading: false, configured: false });
  const allowedText = new Set(['normal', 'large', 'extra']);
  const $ = (selector) => document.querySelector(selector);

  function normalize(input) {
    const data = input && typeof input === 'object' ? input : {};
    return {
      text: allowedText.has(data.text) ? data.text : DEFAULTS.text,
      colors: data.colors === true,
      reading: data.reading === true,
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
    if (!prefs.reading) stopReading();
    window.dispatchEvent(new CustomEvent('educa:accessibility-change', { detail: { ...prefs } }));
  }
  function update(next) {
    prefs = normalize({ ...prefs, ...next });
    apply();
    save(prefs);
    report('Preferência aplicada. Você pode mudar novamente quando quiser.');
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
    if (activeUtterance) {
      try { window.speechSynthesis?.cancel(); } catch (_) {}
      activeUtterance = null;
    }
    reading = false;
    if (readButton) readButton.textContent = '🔊 Ouvir esta tela';
    if (readStatus) readStatus.textContent = '';
  }
  function visibleText() {
    const selection = window.getSelection?.()?.toString().trim();
    if (selection) return selection.slice(0, 1200);
    const activePhone = $('.android-view.is-active');
    const coach = $('#coachCard:not([hidden])');
    const roots = activePhone && getComputedStyle(activePhone).display !== 'none'
      ? [coach, activePhone].filter(Boolean)
      : [$('.hero-copy'), $('.how-it-works')].filter(Boolean);
    const text = roots.map(root => {
      const copy = root.cloneNode(true);
      copy.querySelectorAll('script,style,svg,button,input,textarea,select,[hidden],[aria-hidden="true"],.guide-overlay').forEach(el => el.remove());
      return copy.innerText || copy.textContent || '';
    }).join('. ').replace(/\s+/g, ' ').trim();
    return text.slice(0, 1300);
  }
  function speak(text) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      if (readStatus) readStatus.textContent = 'A leitura em voz alta não está disponível neste navegador.';
      return;
    }
    const message = String(text || '').trim();
    if (!message) {
      if (readStatus) readStatus.textContent = 'Nenhum texto disponível nesta tela.';
      return;
    }
    stopReading();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.88;
    const voices = window.speechSynthesis.getVoices?.() || [];
    const ptBR = voices.find(v => /^pt[-_]BR$/i.test(v.lang));
    if (ptBR) utterance.voice = ptBR;
    activeUtterance = utterance;
    reading = true;
    if (readButton) readButton.textContent = '⏹ Parar leitura';
    if (readStatus) readStatus.textContent = 'Lendo o texto da tela.';
    utterance.onend = utterance.onerror = () => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
        reading = false;
        if (readButton) readButton.textContent = '🔊 Ouvir esta tela';
        if (readStatus) readStatus.textContent = '';
      }
    };
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (_) {
      stopReading();
      if (readStatus) readStatus.textContent = 'Não foi possível iniciar a leitura.';
    }
  }

  // A tela continua disponível mesmo que o visitante decida não configurar nada.
  $('#openAccessibilitySettings')?.addEventListener('click', open);
  $('#a11yFinish')?.addEventListener('click', close);
  $('#a11ySkip')?.addEventListener('click', close);
  $('#a11yReset')?.addEventListener('click', () => {
    update({ text: 'normal', colors: false, reading: false });
    report('Padrão restaurado. Você pode personalizar novamente.');
  });
  $('#a11yExample')?.addEventListener('click', () => speak('Olá! Este é um exemplo de leitura em voz alta do Educa Mais Digital.'));
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
