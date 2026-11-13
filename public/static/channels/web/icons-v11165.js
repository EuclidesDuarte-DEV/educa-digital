/* Educa+ Web V111.65 — sistema de ícones Lucide SVG.
 * SVGs locais: /static/channels/web/icons-data-v11165.json
 * Licença ISC: Copyright (c) 2026 Lucide Icons and Contributors.
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted provided this copyright
 * and permission notice appear in all copies.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 * https://lucide.dev/license
 */
(() => {
  'use strict';
  if (document.documentElement.dataset.educaPlatform !== 'web') return;
  const phone = document.querySelector('#phoneScreen');
  if (!phone || !document.createElementNS || !window.fetch) return;
  const svgNs = 'http://www.w3.org/2000/svg';
  const asset = '/static/channels/web/icons-data-v11165.json';
  let icons = null;
  let scheduled = false;

  function vector(name) {
    if (!icons || !icons[name]) return null;
    const svg = document.createElementNS(svgNs, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.classList.add('ed-lucide-icon');
    // Só aceita SVGs locais e fixos da biblioteca, nunca dados do usuário.
    svg.innerHTML = icons[name];
    return svg;
  }

  // Troca só o glifo isolado; preserva classes, handlers, títulos e rótulos.
  function glyph(el, name, label = '') {
    if (!el || el.querySelector?.('.ed-lucide-icon') || el.children?.length) return;
    if (!el.textContent?.trim()) return;
    const svg = vector(name);
    if (!svg) return;
    el.textContent = '';
    el.appendChild(svg);
    el.classList.add('ed-lucide-slot');
    if (label && el.tagName === 'BUTTON' && !el.hasAttribute('aria-label')) {
      el.setAttribute('aria-label', label);
    }
  }

  // Conserva a palavra depois de símbolos como '✉ E-mail' e '☎ Banco'.
  function prefix(el, name, label = '') {
    if (!el || el.querySelector?.('.ed-lucide-icon')) return;
    const n = Array.from(el.childNodes || []).find(x => x.nodeType === 3 && x.nodeValue?.trim());
    if (!n) return;
    const before = n.nodeValue;
    const clean = before.replace(/^\s*[^\p{L}\p{N}]+/u, '').trimStart();
    if (before.trimStart() === clean) return;
    const svg = vector(name);
    if (!svg) return;
    n.nodeValue = clean;
    el.insertBefore(svg, n);
    el.classList.add('ed-lucide-row');
    if (label && el.tagName === 'BUTTON' && !el.hasAttribute('aria-label')) {
      el.setAttribute('aria-label', label);
    }
  }

  // Seletor e ícone nomeados (sem converter indiscriminadamente texto).
  const staticRules = [
    ['#pixTypeGrid [data-pix-type="email"]','mail','prefix'],
    ['#pixTypeGrid [data-pix-type="phone"]','smartphone','prefix'],
    ['#pixTypeGrid [data-pix-type="cpf"]','id-card','prefix'],
    ['#bankPixView .bank-action-symbol','arrow-up-right'],
    ['#bankSecurityBtn > span:first-child','shield-check'],
    ['#bankReviewView .bank-warning-card > span:first-child','shield-question-mark'],
    ['.bank-movement .movement-dot.in','arrow-down-left'],
    ['.bank-movement .movement-dot.out','arrow-up-right'],
    ['.gov-bottom-nav button[data-gov-nav="govbr-home"] > span:first-child','house'],
    ['.gov-bottom-nav button[data-gov-nav="govbr-data"] > span:first-child','user-round'],
    ['.gov-bottom-nav button[data-gov-nav="govbr-qr"] > span:first-child','qr-code'],
    ['.gov-bottom-nav button[data-gov-nav="govbr-docs"] > span:first-child','id-card'],
    ['.gov-bottom-nav button[data-gov-nav="govbr-menu"] > span:first-child','menu'],
    ['.gov-search-card > b','search'],
    ['.gov-real-search > span:last-child','search'],
    ['.gov-share-fab','share-2'],
    ['.gov-proof-hero > span:first-child','scan-face'],
    ['.gov-breadcrumb','house','prefix'],
    ['#govTwoFactorRow > span:first-child','lock-keyhole'],
    ['#govSecurityMenuRow > span:first-child','shield-check'],
    ['.system-notice-icon.blue','shield-check'],
    ['.recent-icon.pale','house'],
    ['.module-path-note > span:first-child','circle-check'],
    ['.video-safe-note > span:first-child','shield-check'],
    ['.v106-caller-avatar','phone'],
    ['#freeContactsView button','phone','prefix'],
    ['#freeFloatingBack','house','prefix'],
    ['.wa-hangup > span:first-child','phone'],
    ['.playstore-safety-banner > span:first-child','shield-check'],
    ['.official-developer-card > span:first-child','badge-check'],
    ['.protect-shield','shield-check'],
    ['.playstore-search > span:first-child','search'],
    ['.gov-shortcuts-pill','qr-code','prefix'],
    ['.gov-agenda-toolbar > button:first-child','list-filter','prefix'],
    ['.gov-agenda-toolbar > div > span:first-child','calendar-days'],
    ['.gov-agenda-toolbar > div > span:nth-child(2)','list'],
    ['.wifi-network .wifi-symbol','wifi'],
    ['.slider-ends > span','smartphone'],
    ['.slider-ends > strong','smartphone'],
    ['#freeOriginalSend','send'],
    ['#bankSendPixBtn .bank-action-symbol','arrow-up-right']
  ];

  const serviceMap = [
    ['Procuração','users'],['Caixa Postal','mail'],
    ['Carteira de documentos','id-card'],['Assinar documentos','file-pen-line'],
    ['Agenda','calendar-days'],['Consultar serviços','search'],
    ['Baixar certidões','download'],['Login sem senha','qr-code'],
    ['Prova de vida','scan-face'],['Segurança da conta','shield-check']
  ];
  const bankMap = [
    ['Pagar','receipt-text'],['Extrato','list'],['Cartão','credit-card']
  ];
  const pixMap = [
    ['Ler QR Code','qr-code'],['Copia e Cola','copy'],
    ['Receber Pix','arrow-down-left'],['Minhas chaves','key-round']
  ];
  const securityMap = [
    ['Privacidade','lock-keyhole'],['Listas','list'],
    ['Conta','user-round'],['Conversas','message-circle'],
    ['Notificações','bell-off'],['Armazenamento','settings'],['Ajuda','circle-question-mark'],
    ['Verificação em duas etapas','lock-keyhole'],
    ['Histórico de acessos','list']
  ];
  const loginMap = [
    ['Login com seu banco','credit-card'],
    ['Seu aplicativo gov.br','smartphone'],
    ['Seu certificado digital','lock-keyhole']
  ];
  function lookup(text, entries) {
    const item = entries.find(([term]) => text.includes(term));
    return item?.[1] || null;
  }
  function iconFromParent(elements, parentSelector, textSelector, pairs) {
    elements.forEach(el => {
      const parent = el.closest(parentSelector);
      const name = lookup(parent?.querySelector(textSelector)?.textContent?.trim() || '',pairs);
      if (name) glyph(el,name);
    });
  }

  function apply() {
    if (!icons) return;
    for(const [selector,name,mode] of staticRules) {
      for(const el of phone.querySelectorAll(selector)) {
        if(mode === 'prefix') prefix(el,name);
        else glyph(el,name);
      }
    }

    iconFromParent(phone.querySelectorAll('.bank-shortcut-icon.bank-generic-icon'),
      '.bank-shortcut','strong',bankMap);
    iconFromParent(phone.querySelectorAll('#bankPixView .bank-action-grid button > span:first-child'),
      'button','strong',pixMap);
    iconFromParent(phone.querySelectorAll('.gov-service-card .gov-service-icon,.gov-home-row > span.icon'),
      '.gov-service-card,.gov-home-row','strong',serviceMap);
    iconFromParent(phone.querySelectorAll('.wa-settings-list button > span:first-child'),
      'button','strong',securityMap);
    iconFromParent(phone.querySelectorAll('#govbrSecurityView button > span:first-child'),
      'button','strong',securityMap);
    iconFromParent(phone.querySelectorAll('.gov-app-surface button > span:first-child'),
      'button','strong',loginMap);

    for(const el of phone.querySelectorAll('.gov-browser-header .gov-browser-round')) {
      const txt=el.textContent.trim();
      if(txt==='☰') glyph(el,'menu','Abrir menu');
      if(txt==='✕') glyph(el,'x','Fechar');
    }
    for(const el of phone.querySelectorAll('.wifi-network > b:last-child')) {
      if(el.textContent.trim()==='⚙') glyph(el,'settings');
      else if(el.textContent.trim()==='🔒') glyph(el,'lock-keyhole');
    }
    for(const el of phone.querySelectorAll('.wa-call-controls > span')) {
      const label=el.querySelector('small')?.textContent?.trim() || '';
      const name=lookup(label,[['Áudio','volume-2'],['Teclado','keyboard'],['Alto-falante','volume-2']]);
      if(name) prefix(el,name);
    }
    for(const el of phone.querySelectorAll('.chat-composer > button')) {
      const buttons=Array.from(el.parentElement.querySelectorAll(':scope > button'));
      const index=buttons.indexOf(el);
      const marks=['☺','⌕','◉','●','➤'];
      const names=['message-circle','paperclip','camera','mic','send'];
      const labels=['Emojis','Anexos','Câmera','Mensagem de áudio','Enviar mensagem'];
      if(index>=0 && index<5 && el.textContent.trim()===marks[index]) {
        glyph(el,names[index],labels[index]);
      }
    }
    // A barra inferior do Banco já tem os ícones SVG V111.64.
    // Logos oficiais (Pix, Gmail, WhatsApp e gov.br) permanecem intactos.
  }

  function schedule() {
    if(scheduled) return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      apply();
    });
  }
  function start() {
    fetch(asset, {cache:'force-cache'})
      .then(response => {
        if(!response.ok) throw Error('Pacote de ícones indisponível');
        return response.json();
      })
      .then(data => {
        if(!data || typeof data!=='object' || !data.mail || !data['qr-code']) return;
        icons=data;
        apply();
        if(typeof MutationObserver==='undefined') return;
        new MutationObserver(records => {
          // Evita o loop do tutorial Pix: ignora alterações do próprio guia.
          const relevant = records.some(rec => {
            if(rec.type!=='childList') return false;
            if(rec.target?.closest?.('#guideOverlay')) return false;
            return Array.from(rec.addedNodes||[]).some(node =>
              node.nodeType===1 && node.tagName!=='svg' &&
              !node.closest?.('.ed-lucide-icon'));
          });
          if(relevant) schedule();
        }).observe(phone,{childList:true,subtree:true});
      })
      .catch(() => { /* Sem conexão: mantém glifos antigos, app funcional. */ });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
