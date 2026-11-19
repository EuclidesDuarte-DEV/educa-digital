/* V111.64 — APENAS WEB: navegação limpa e tipografia por hierarquia. */
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
    // V111.72: a tela de conclusão dimensiona título e descrição por CSS
    // fluido e rolagem própria. Impedir inline !important duplicado do
    // escalonador legado, que fazia "Muito bem!" ocupar três linhas.
    if (el.id === 'successTitle' || el.id === 'successText') return false;
    // V111.76: cartões de atividades têm escalas próprias no canal Web.
    // Impedir dupla ampliação inline ao alternar Grande/Muito grande.
    if (el.closest?.('#modulePathView .module-path-surface, #videoLessonView .video-lesson-surface')) return false;
    // V111.73: nas conversas WhatsApp, os tamanhos de fonte sao resolvidos
    // pela folha responsiva para nao transformar o nome/avatar/botoes
    // em texto gigante. Evitar inline !important impede a sobreposicao.
    if (el.closest('#chatView .chat-surface, #normalChatView .chat-surface, #whatsappView .whatsapp-surface')) return false;
    // V111.75: controles de navegacao possuem tipografia proporcional
    // na folha compartilhada. Aumentar cada filho novamente em linha
    // causava "Pesqui-sar", nomes de apps e cabecalhos sobrepostos.
    // A excecao so vale durante Modo Livre; outros testes preservados.
    if (phone.classList?.contains?.('free-active') &&
        el.closest('#homeView .launcher-grid, #homeView .launcher-bottom, #homeView .at-a-glance, #webRealView')) return false;
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
  // V111.64 — ícones vetoriais apenas na barra do Banco na Web.
  // Substitui glifos de fonte (⌂, ≡, ?) sem tocar nas telas Android/iOS
  // e sem remover os botões/handlers originais do treinamento.
  function polishBankNavigation() {
    const bar = document.querySelector('#bankHomeView .bank-bottom-nav');
    if (!bar || typeof document.createElementNS !== 'function') return;
    const namespace = 'http://www.w3.org/2000/svg';
    const icons = [
      ['Início', ['M3 10.5 12 3l9 7.5V21h-6.5v-6.5h-5V21H3V10.5Z']],
      ['Extrato', ['M9 6h11', 'M9 12h11', 'M9 18h11', 'M4 6h.01', 'M4 12h.01', 'M4 18h.01']],
      ['Ajuda', ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
        'M9.5 9.3a2.5 2.5 0 1 1 4.2 1.8c-1.3 1-1.7 1.7-1.7 3', 'M12 17.5h.01']]
    ];
    Array.from(bar.querySelectorAll('button')).slice(0, 3).forEach((button, index) => {
      if (button.querySelector('.web-bank-nav-icon')) return;
      const [fallbackLabel, paths] = icons[index];
      // O glifo antigo é um nó de texto; mantém o <span> com o rótulo.
      Array.from(button.childNodes).forEach(node => {
        if (node.nodeType === 3) node.nodeValue = '';
      });
      const svg = document.createElementNS(namespace, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '1.9');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      svg.classList.add('web-bank-nav-icon');
      for (const d of paths) {
        const path = document.createElementNS(namespace, 'path');
        path.setAttribute('d', d);
        svg.appendChild(path);
      }
      button.insertBefore(svg, button.firstChild);
      button.setAttribute('aria-label',
        button.querySelector('span')?.textContent?.trim() || fallbackLabel);
    });
  }

  /* V111.76 — somente canal WEB. Redesenha a apresentação da trilha,
   * sem duplicar estado ou substituir os botões do training.js. Os cartões
   * continuam com os mesmos data-module-lesson e listeners originais.
   * O progresso é derivado das classes .is-complete já renderizadas. */
  function installSimpleActivitiesWeb() {
    const view = document.getElementById?.('modulePathView');
    const list = document.getElementById?.('moduleLessonList');
    if (!view || !list) return;

    // V111.77 (somente Web). Reutiliza os logos que ja existem no projeto.
    // Nenhuma marca, etapa ou estado de conclusao vem de dados externos.
    const activityThemes = Object.freeze({
      pix:      {icon:'/static/icons/pix.svg'},
      whatsapp: {icon:'/static/icons/whatsapp.svg'},
      security: {icon:'/static/channels/web/security-shield-v11177.svg'},
      settings: {icon:'/static/icons/settings.svg'},
      govbr:    {icon:'/static/icons/govbr.svg'},
      playstore:{icon:'/static/icons/playstore.svg'}
    });
    const themeNames = Object.keys(activityThemes);
    function themeFor(title) {
      const name = String(title || '').normalize('NFD')
        .replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
      const match = ({
        'pix':'pix',
        'whatsapp':'whatsapp',
        'seguranca':'security',
        'ajustes':'settings',
        'gov.br':'govbr',
        'apps seguros':'playstore'
      })[name];
      return match || 'security';
    }
    function insertTopicIcon(header, content, className, iconSource) {
      if (!header || typeof document.createElement !== 'function') return;
      const text = header.querySelector?.(content);
      if (!text) return;
      let badge = header.querySelector?.('.' + className);
      if (!badge) {
        badge = document.createElement('span');
        badge.className = className;
        badge.setAttribute('aria-hidden','true');
        const image = document.createElement('img');
        image.alt = '';
        image.decoding = 'async';
        badge.appendChild(image);
        header.insertBefore(badge, text);
      }
      const image = badge.querySelector?.('img');
      if (image && image.getAttribute('src') !== iconSource)
        image.setAttribute('src', iconSource);
    }
    function enhanceActivityTopic(title) {
      const theme = themeFor(title);
      const videoView = document.getElementById?.('videoLessonView');
      for (const name of themeNames) {
        view.classList.toggle?.('is-theme-' + name, name === theme);
        videoView?.classList?.toggle?.('is-theme-' + name, name === theme);
      }
      videoView?.classList?.add?.('ed-web-video-polished');
      insertTopicIcon(
        view.querySelector?.('.module-path-header'),
        '.module-path-header > div',
        'ed-activity-topic-icon',
        activityThemes[theme].icon
      );
      insertTopicIcon(
        videoView?.querySelector?.('.video-lesson-header'),
        '.video-lesson-header > div',
        'ed-video-topic-icon',
        activityThemes[theme].icon
      );
    }

    function refresh() {
      const cards = [...list.querySelectorAll('button[data-module-lesson]')];
      if (!cards.length) return;
      const total = cards.length;
      const completed = cards.filter(card => card.classList.contains('is-complete')).length;
      const finished = completed === total;
      const title = document.getElementById('modulePathTitle')?.textContent?.trim() || '';
      const navigationLabel = view.querySelector('.module-path-header small');
      if (navigationLabel && navigationLabel.textContent !== 'Atividades livres')
        navigationLabel.textContent = 'Atividades livres';
      const isPix = title.toUpperCase() === 'PIX';
      const headline = document.getElementById('modulePathHeadline');
      const intro = document.getElementById('modulePathIntro');
      const progressText = document.getElementById('modulePathProgressText');
      const progressPanel = view.querySelector('.module-path-progress');
      const noteText = view.querySelector('.module-path-note p');

      view.classList.add('web-activity-simple');
      view.classList.toggle('is-web-activity-complete', finished);
      enhanceActivityTopic(title);
      if (isPix && !finished) {
        const headlineCopy = 'Aprenda como fazer um Pix com segurança';
        const introCopy = 'Siga os passos e pratique no seu ritmo.';
        if (headline && headline.textContent !== headlineCopy) headline.textContent = headlineCopy;
        if (intro && intro.textContent !== introCopy) intro.textContent = introCopy;
      }
      const progressCopy = finished
        ? 'Parabéns! 100% das atividades concluídas!'
        : completed + '/' + total;
      if (progressText && progressText.textContent !== progressCopy) progressText.textContent = progressCopy;
      if (progressPanel) {
        progressPanel.setAttribute('aria-label',
          completed + ' de ' + total + ' atividades concluídas' +
          (finished ? ', parabéns!' : ''));
      }
      if (finished && noteText) {
        const note = 'Volte quando quiser para revisar o que aprendeu!';
        if (noteText.textContent !== note) noteText.textContent = note;
      }
    }

    // training.js reconstrói a lista ao entrar na trilha ou voltar do treino.
    // Observar apenas childList evita loop com os textos alterados acima.
    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(refresh).observe(list, {childList:true});
    }
    refresh();
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
    polishBankNavigation();
    installSimpleActivitiesWeb();
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
    // V111.65: ícones do Design System apenas na Web.
    // Código e assets locais à Cloudflare, sem carregamento por CDN.
    if (document.head && typeof document.createElement === 'function' &&
        !document.getElementById?.('educa-web-icons-v11165')) {
      const iconScript = document.createElement('script');
      iconScript.id = 'educa-web-icons-v11165';
      iconScript.src = '/static/channels/web/icons-v11165.js?v=11165';
      iconScript.defer = true;
      document.head.appendChild(iconScript);
    }
    // V111.82 — módulo inteiramente Web. O motor livre compartilhado
    // e os aplicativos Android/iOS permanecem inalterados.
    if (document.head && typeof document.createElement === 'function' &&
        !document.getElementById?.('educa-web-gamification-v11182')) {
      const gameScript = document.createElement('script');
      gameScript.id = 'educa-web-gamification-v11182';
      gameScript.src = '/static/channels/web/gamification-v11182.js?v=11183';
      gameScript.async = false;
      document.head.appendChild(gameScript);
    }
    // V111.83 — interpretação conservadora de decisões na conversa, somente Web.
    // Ordem de execução garantida: o motor de níveis carrega primeiro.
    if (document.head && typeof document.createElement === 'function' &&
        !document.getElementById?.('educa-web-dialogue-v11183')) {
      const dialogueScript = document.createElement('script');
      dialogueScript.id = 'educa-web-dialogue-v11183';
      dialogueScript.src = '/static/channels/web/dialogue-v11183.js?v=11189';
      dialogueScript.async = false;
      document.head.appendChild(dialogueScript);
    }
    // V111.84 — novos contatos automáticos quando a pessoa está ociosa na Home.
    // Usa API pública do Modo Livre somente na versão Web; não interrompe chat,
    // SMS, ligação, LIA ou outras telas de atividade.
    if (document.head && typeof document.createElement === 'function' &&
        !document.getElementById?.('educa-web-free-events-v11184')) {
      const eventsScript = document.createElement('script');
      eventsScript.id = 'educa-web-free-events-v11184';
      eventsScript.src = '/static/channels/web/free-events-v11184.js?v=11184';
      eventsScript.async = false;
      document.head.appendChild(eventsScript);
    }
    // Interface pública de diagnóstico; nunca altera preferência da pessoa.
    window.EducaWebChannel = Object.freeze({
      name:'web',
      a11yActivityVersion:'11164',
      refreshActivityText: () => schedule(true)
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, {once:true});
  } else start();
})();
