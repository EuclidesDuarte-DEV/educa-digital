/* V111.63 — APENAS WEB. Garante legibilidade mínima no modo de letras muito grandes
 * e a visibilidade do feedback da revisão de Pix.
 */
/* V111.62 — APENAS WEB. Corrige tremor no destaque do Pix sem afetar apps nativos.
 * Evita que mudanças no balão do guia disparem reflow de todas as letras.
 * Mantém o aumento de fontes implementado na V111.61.
 */
/* V111.61 — APENAS WEB.
 * O painel original aplica a11y-text-large/extra ao <html>, mas os
 * exercícios internos usam centenas de font-size fixos em px/!important.
 * Esta camada mede o tamanho normal de cada texto e amplia o conteúdo
 * das atividades sem alterar Android, iOS, APIs, nem o banco.
 */
(() => {
  'use strict';
  if (document.documentElement.dataset.educaPlatform !== 'web') return;

  const html = document.documentElement;
  const phone = document.querySelector('#phoneScreen');
  if (!phone) return;

  const textSelector = [
    'p','span','small','strong','b','em','label','button','a','li',
    'h1','h2','h3','h4','h5','h6','div','section','article',
    'input','textarea','select','summary','blockquote','output'
  ].join(',');
  const formTags = new Set(['INPUT','TEXTAREA','SELECT']);
  const previousInline = new WeakMap();
  // Nós já ampliados não precisam ter a fonte recalculada a cada mutação.
  // A medição repetida alterava as dimensões do alvo seguido pelo guia Pix.
  const scaled = new WeakSet();
  let pendingFrame = 0;
  let pendingFull = false;

  function isEnlarged() {
    return html.classList.contains('a11y-text-large') ||
           html.classList.contains('a11y-text-extra');
  }
  function eligible(el) {
    if (!el || !el.tagName) return false;
    if (el.closest('[aria-hidden="true"],svg,[data-educa-web-ignore-font]')) return false;
    if (formTags.has(el.tagName)) return true;
    // Somente nós que têm texto próprio: não amplia contêineres, imagens
    // nem botões compostos apenas por ícones.
    const direct = Array.from(el.childNodes || [])
      .filter(node => node.nodeType === 3)
      .map(node => node.nodeValue || '').join('').trim();
    if (!direct || !/[\p{L}\p{N}]/u.test(direct)) return false;
    const family = getComputedStyle(el).fontFamily || '';
    if (/material icons|font awesome|lucide/i.test(family)) return false;
    return true;
  }
  function remember(el) {
    if (previousInline.has(el)) return;
    previousInline.set(el, {
      value: el.style.getPropertyValue('font-size'),
      priority: el.style.getPropertyPriority('font-size')
    });
  }
  function restore(el) {
    const old = previousInline.get(el);
    if (!old) return;
    if (old.value) el.style.setProperty('font-size', old.value, old.priority);
    else el.style.removeProperty('font-size');
  }
  function nodesForScan(full) {
    const roots = full
      ? [...phone.querySelectorAll('.android-view')]
      : [...phone.querySelectorAll('.android-view.is-active')];
    const unique = new Set();
    for (const root of roots) {
      for (const el of root.querySelectorAll(textSelector)) {
        if (eligible(el)) unique.add(el);
      }
    }
    return [...unique];
  }
  function sync(full = false) {
    const enlarged = isEnlarged();
    // Com texto normal, devolver exatamente o estilo inline original.
    if (!enlarged) {
      for (const el of phone.querySelectorAll('[data-educa-web-a11y-text]')) {
        restore(el);
        scaled.delete(el);
        el.removeAttribute('data-educa-web-a11y-text');
      }
      return;
    }
    // Em telas com guia, mexer em elementos já ampliados induz reflow,
    // ResizeObserver e reposicionamento em ciclo (o efeito de tremor).
    // Só configura fontes de elementos NOVOS; mudar grande/muito grande
    // atua automaticamente via a variável CSS --ed-font-factor.
    const targets = nodesForScan(full).filter(el => !scaled.has(el));
    if (!targets.length) return;
    for (const el of targets) { remember(el); restore(el); }

    // Mede SEM ampliação: inclusive se a folha legada usa !important.
    // A remoção/reaplicação ocorre na mesma tarefa, sem frame intermediário.
    const large = html.classList.contains('a11y-text-large');
    const extra = html.classList.contains('a11y-text-extra');
    html.classList.remove('a11y-text-large', 'a11y-text-extra');
    try {
      for (const el of targets) {
        const base = parseFloat(getComputedStyle(el).fontSize);
        if (!(base >= 6 && base <= 120 && Number.isFinite(base))) continue;
        const originalPixels = Math.round(base * 100) / 100;
        el.style.setProperty(
          'font-size',
          'max(var(--ed-web-text-min, 14px), calc(' + originalPixels + 'px * var(--ed-font-factor, 1)))',
          'important'
        );
        el.setAttribute('data-educa-web-a11y-text', '');
        scaled.add(el);
      }
    } finally {
      if (large) html.classList.add('a11y-text-large');
      if (extra) html.classList.add('a11y-text-extra');
    }
  }
  function schedule(full = false) {
    pendingFull = pendingFull || full;
    if (pendingFrame) return;
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = 0;
      const all = pendingFull;
      pendingFull = false;
      sync(all);
    });
  }
  function start() {
    // A11y é disparado também quando o usuário modifica o seletor no meio
    // de uma atividade, sem precisar recarregar a página.
    window.addEventListener('educa:accessibility-change', () => schedule(true));
    // Lições, mensagens de golpe, cartões Pix e GOV.BR surgem dinamicamente.
    // Em atualizações de conteúdo, recalcular apenas a atividade visível.
    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(records => {
        if (!isEnlarged()) return;
        // O treinamento escreve o texto do balão do guia Pix a cada
        // reposicionamento. Esse balão é IRMÃO das telas .android-view,
        // nunca é uma nova atividade: ignorá-lo interrompe o loop.
        const activityContentChanged = records.some(rec => {
          const parent = rec.target?.nodeType === 1
            ? rec.target : rec.target?.parentElement;
          if (!parent?.closest?.('.android-view.is-active')) return false;
          if (rec.type === 'characterData') {
            // Alterar texto de um nó já ampliado não altera seu font-size.
            return !scaled.has(parent) && eligible(parent);
          }
          if (rec.type !== 'childList') return false;
          return Array.from(rec.addedNodes || []).some(node =>
            node.nodeType === 1 ||
            (node.nodeType === 3 && Boolean(node.nodeValue?.trim()))
          );
        });
        if (activityContentChanged) schedule(false);
      }).observe(phone, {subtree:true, childList:true, characterData:true});
    }
    window.addEventListener('resize', () => { if (isEnlarged()) schedule(true); }, {passive:true});
    window.visualViewport?.addEventListener('resize', () => { if (isEnlarged()) schedule(true); }, {passive:true});
    schedule(true);

    // A conclusão acontece 900 ms após a resposta correta. O feedback
    // também fica disponível na tela de atividade concluída, para dar
    // tempo de leitura às pessoas que precisam de letras maiores.
    let pendingSuccessNote = '';
    const successView = document.getElementById?.('successView');
    if (successView && typeof MutationObserver !== 'undefined') {
      new MutationObserver(() => {
        const isSuccess = phone.dataset.currentView === 'success';
        const old = successView.querySelector('.web-pix-review-result');
        if (isSuccess && pendingSuccessNote) {
          const note = old || document.createElement('p');
          note.className = 'web-pix-review-result';
          note.setAttribute('role', 'status');
          note.textContent = pendingSuccessNote;
          if (!old) {
            const anchor = successView.querySelector('#successLearned');
            if (anchor) anchor.insertAdjacentElement('afterend', note);
            else successView.querySelector('.success-screen')?.appendChild(note);
          }
          pendingSuccessNote = '';
        } else if (!isSuccess) {
          old?.remove();
          pendingSuccessNote = '';
        }
      }).observe(phone, {attributes:true,attributeFilter:['data-current-view']});
    }

    // V111.63 — o guia é desenhado sobre a confirmação do Pix.
    // Depois da escolha, deixa a explicação visível e dentro da rolagem.
    // Não modifica regras do Pix nem o comportamento de iOS/Android.
    for (const [optionsId, feedbackId] of [
      ['bankReviewOptions', 'bankAnswerFeedback'],
      ['bankScamOptions', 'bankScamFeedback']
    ]) {
      const options = document.getElementById?.(optionsId);
      const feedback = document.getElementById?.(feedbackId);
      options?.addEventListener('click', event => {
        if (!event.target.closest('[data-bank-answer],[data-bank-scam-answer]')) return;
        requestAnimationFrame(() => {
          if (!feedback || feedback.hidden) return;
          if (event.target.closest('[data-bank-answer="correct"],[data-bank-scam-answer="correct"]')) {
            pendingSuccessNote = String(feedback.textContent || '').trim();
          }
          const panel = feedback.closest('.bank-content');
          if (!panel) return;
          const viewport = panel.getBoundingClientRect();
          const message = feedback.getBoundingClientRect();
          if (message.bottom > viewport.bottom - 12) {
            panel.scrollTop += message.bottom - viewport.bottom + 16;
          }
        });
      });
    }
    // Interface pública de diagnóstico; nunca altera preferência da pessoa.
    window.EducaWebChannel = Object.freeze({
      name:'web',
      a11yActivityVersion:'11163',
      refreshActivityText: () => schedule(true)
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, {once:true});
  } else start();
})();
