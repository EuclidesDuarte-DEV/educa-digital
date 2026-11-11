/* Educa+ Digital V111.44 — guia da entrada e primeira sessão autenticada.
 * Destaque real nos elementos relevantes, sem questionário e sem abrir automaticamente
 * o painel de acessibilidade. O guia do pré-teste existente continua após a conclusão.
 */
(() => {
  'use strict';
  const KEY = 'educa-tour-v11143-finished';
  const ACCOUNT_KEY_PREFIX = 'educa-tour-first-login-v11144';
  const $ = (selector) => document.querySelector(selector);
  const tour = $('#educaTour');
  const spotlight = $('#educaTourSpotlight');
  const hotspot = $('#educaTourHotspot');
  const card = $('#educaTourCard');
  const title = $('#educaTourTitle');
  const description = $('#educaTourText');
  const progress = $('#educaTourProgress');
  const next = $('#educaTourNext');
  const back = $('#educaTourBack');
  const replay = $('#openGuidedTour');
  const landingSteps = [
    {
      selector: '#startNowBtn',
      title: 'Comece seu treino aqui',
      description: 'Toque em “Começar meu treino” para entrar no ambiente de prática do Educa+ Digital.',
      targetLabel: 'Começar meu treino'
    },
    {
      selector: '[data-open-app="bank"]',
      title: 'Conheça seu primeiro treino',
      description: 'No celular simulado, toque no Banco para experimentar o pré-teste de Pix com segurança e sem dinheiro real.',
      targetLabel: 'Abrir Banco e iniciar pré-teste'
    },
    {
      selector: '#openAccessibilitySettings',
      title: 'Deixe a tela do seu jeito',
      description: 'Precisa de letras maiores, cores mais fáceis de distinguir ou leitura em voz alta? Toque neste ícone de acessibilidade.',
      targetLabel: 'Abrir opções de acessibilidade'
    }
  ];
  // A versão logada é enxuta e só aparece se a pessoa pedir ajuda.
  // Nenhum tour automático ocupa a tela durante o primeiro acesso.
  const accountSteps = [
    {
      selector: '#learningView .learning-featured',
      title: 'Escolha um assunto',
      description: 'Toque no assunto que quer praticar. Comece por Pix, se preferir.',
      targetLabel: 'Abrir atividades de Pix'
    },
    {
      selector: '#freeModeEntry',
      title: 'Treine com segurança',
      description: 'O Modo Livre oferece simulações educativas de mensagens e chamadas.',
      targetLabel: 'Conhecer o Modo Livre'
    }
  ];
  let steps = landingSteps;
  let mode = 'landing';
  let keyToSave = KEY;
  let current = -1;
  let activeTarget = null;
  let previousFocus = null;
  let scheduled = 0;

  // Identifica a conclusão por conta sem gravar o número do celular na chave.
  // Não é um identificador de autenticação: serve apenas à preferência local do guia.
  function accountGuideKey(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.length < 10) return null;
    let hash = 2166136261;
    for (const code of digits) {
      hash ^= code.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return `${ACCOUNT_KEY_PREFIX}-${(hash >>> 0).toString(36)}`;
  }
  function rememberedAccount() {
    try { return JSON.parse(localStorage.getItem('educaRememberedUser') || 'null'); }
    catch (_) { return null; }
  }

  function finishedBefore() {
    try { return localStorage.getItem(keyToSave) === '1'; } catch (_) { return false; }
  }
  function saveFinished() {
    try { localStorage.setItem(keyToSave, '1'); } catch (_) { /* Opera também sem armazenamento. */ }
  }
  function isDisplayed(element) {
    if (!element?.isConnected) return false;
    const st = getComputedStyle(element);
    const bounds = element.getBoundingClientRect();
    return st.display !== 'none' && st.visibility !== 'hidden' && bounds.width > 0 && bounds.height > 0;
  }
  function pickTarget(step) {
    if (step.selector === '#openAccessibilitySettings') {
      const primary = $('#openAccessibilitySettings');
      if (isDisplayed(primary)) return primary;
      return null;
    }
    return $(step.selector);
  }
  function position() {
    if (tour?.hidden || !activeTarget || !isDisplayed(activeTarget)) return;
    const rect = activeTarget.getBoundingClientRect();
    const vw = Math.max(1, document.documentElement.clientWidth);
    const vh = Math.max(1, window.innerHeight);
    const gap = 7;
    const x = Math.max(4, rect.left - gap);
    const y = Math.max(4, rect.top - gap);
    const w = Math.min(vw - x - 4, rect.width + gap * 2);
    const h = Math.min(vh - y - 4, rect.height + gap * 2);
    for (const box of [spotlight, hotspot]) {
      box.style.left = `${x}px`;
      box.style.top = `${y}px`;
      box.style.width = `${Math.max(1, w)}px`;
      box.style.height = `${Math.max(1, h)}px`;
    }
    spotlight.style.borderRadius = current === steps.length - 1 ? '14px' : '22px';
    hotspot.setAttribute('aria-label', steps[current].targetLabel);

    const cw = Math.min(360, vw - 24);
    card.style.width = `${cw}px`;
    const ch = Math.max(150, card.getBoundingClientRect().height || 180);
    const availableBelow = vh - (y + h);
    const availableAbove = y;
    let top;
    if (availableBelow >= ch + 22) top = y + h + 18;
    else if (availableAbove >= ch + 22) top = y - ch - 18;
    else top = availableBelow > availableAbove ? vh - ch - 12 : 12;
    const left = Math.min(vw - cw - 12, Math.max(12, x + w / 2 - cw / 2));
    card.style.top = `${Math.round(Math.max(12, Math.min(vh - ch - 12, top)))}px`;
    card.style.left = `${Math.round(left)}px`;
  }
  function reposition() {
    if (current < 0 || tour.hidden) return;
    if (scheduled) cancelAnimationFrame(scheduled);
    scheduled = requestAnimationFrame(() => {
      scheduled = 0;
      if (!isDisplayed(activeTarget)) { stop(); return; }
      position();
    });
  }
  function show(index) {
    const step = steps[index];
    if (!step || !tour) return stop();
    const target = pickTarget(step);
    if (!target) return stop();
    current = index;
    activeTarget = target;
    progress.textContent = `PASSO ${index + 1} DE ${steps.length}`;
    title.textContent = step.title;
    description.textContent = step.description;
    window.dispatchEvent(new CustomEvent('educa:guide-step', {
      detail: { title: step.title, description: step.description, step: index + 1, total: steps.length }
    }));
    next.innerHTML = index === steps.length - 1 ? 'Concluir <span aria-hidden="true">✓</span>' : 'Próximo <span aria-hidden="true">→</span>';
    if (back) back.disabled = index === 0;
    // Reposiciona após rolar se o ícone-alvo estiver fora da área visível.
    const rect = target.getBoundingClientRect();
    if (rect.bottom < 90 || rect.top > window.innerHeight - 100) {
      target.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
    requestAnimationFrame(() => { position(); card.focus({ preventScroll: true }); });
  }
  function start({ force = false, authenticated = false, user = null } = {}) {
    if (!tour) return;
    // Não reinicia uma orientação que já está ativa.
    if (!tour.hidden) {
      if (!force) return;
      stop({ markComplete: false });
    }
    const candidateKey = authenticated ? accountGuideKey(user?.phone) : KEY;
    if (authenticated && (!candidateKey || !document.body.classList.contains('prototype-focus')
      || !$('#learningView')?.classList.contains('is-active'))) return;
    if (!authenticated && document.body.classList.contains('prototype-focus')) return;
    mode = authenticated ? 'account' : 'landing';
    steps = authenticated ? accountSteps : landingSteps;
    keyToSave = candidateKey;
    if (!force && finishedBefore()) return;
    if (!isDisplayed(pickTarget(steps[0]))) return;
    if ($('#accessibilityDialog')?.open) return;
    // Evita sobrepor mensagens e formulários de cadastro.
    if (['#startModal', '#returnModal', '#infoModal'].some(selector => {
      const modal = $(selector);
      return modal && !modal.hidden;
    })) return;
    previousFocus = document.activeElement;
    tour.hidden = false;
    document.body.classList.add('educa-tour-active');
    show(0);
  }
  function stop({ markComplete = true } = {}) {
    if (!tour || tour.hidden) return;
    current = -1;
    activeTarget = null;
    if (scheduled) cancelAnimationFrame(scheduled);
    scheduled = 0;
    tour.hidden = true;
    document.body.classList.remove('educa-tour-active');
    if (markComplete) saveFinished();
    if (previousFocus?.isConnected && previousFocus !== document.body) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
    mode = 'landing';
    steps = landingSteps;
    keyToSave = KEY;
  }
  function advance() {
    if (current + 1 < steps.length) show(current + 1);
    else stop();
  }
  function actOnTarget() {
    const target = activeTarget;
    stop();
    if (target?.isConnected) target.click();
  }
  // O elemento apontado é realmente tocável: clicar no destaque ativa a função correta.
  hotspot?.addEventListener('click', actOnTarget);
  next?.addEventListener('click', advance);
  back?.addEventListener('click', () => { if (current > 0) show(current - 1); });
  $('#educaTourSkip')?.addEventListener('click', stop);
  $('#educaTourClose')?.addEventListener('click', stop);
  replay?.addEventListener('click', () => start({ force: true }));
  // Nunca disputar espaço com o painel acessível; clicar nele encerra o tutorial.
  window.addEventListener('educa:accessibility-open', stop);
  window.addEventListener('resize', reposition, { passive: true });
  window.addEventListener('scroll', reposition, { passive: true, capture: true });
  window.visualViewport?.addEventListener('resize', reposition, { passive: true });
  document.addEventListener('keydown', (event) => {
    if (tour?.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); stop(); }
    else if (event.key === 'Tab') {
      const elements = Array.from(card.querySelectorAll('button:not([disabled])'));
      if (!elements.length) return;
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === card)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  });
  // V111.49: guia somente por escolha explícita em "Como usar".
  // Nenhuma chamada de start() no carregamento da página ou após o login.
  window.EducaGuidedTour = Object.freeze({
    start: () => start({ force: true }),
    startAuthenticated: (user, force = false) => start({ authenticated: true, user, force }),
    stop
  });
})();
