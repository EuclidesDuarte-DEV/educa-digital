/* V111.39 — Atalho da página inicial NO CABEÇALHO; tela cheia abaixo da saída.
 * Não depende da posição do aparelho nem segue a rolagem. */
(() => {
  'use strict';
  const wrapper = document.querySelector('.educa-external-access');
  const control = document.querySelector('#openAccessibilitySettings');
  const actions = document.querySelector('.home-simple-header .header-actions');
  const guideButton = document.querySelector('#openGuidedTour');
  const exitButton = document.querySelector('#exitFullscreen');
  if (!wrapper || !control || !actions) return;
  let pending = 0;
  function place() {
    pending = 0;
    const fullscreen = document.documentElement.classList.contains('educa-fullscreen-active')
      && exitButton && !exitButton.hidden;
    const focusMode = document.body.classList.contains('prototype-focus');
    wrapper.classList.toggle('a11y-focus-toolbar', focusMode && !fullscreen);
    if (fullscreen) {
      // O cabeçalho é escondido quando o celular é ampliado; mover o controle
      // temporariamente para o body garante que permaneça visível fora do telefone.
      if (wrapper.parentElement !== document.body) document.body.appendChild(wrapper);
      wrapper.classList.add('a11y-below-exit');
      const r = exitButton.getBoundingClientRect();
      wrapper.style.setProperty('--a11y-fullscreen-top', `${Math.round(r.bottom + 10)}px`);
      wrapper.style.setProperty('--a11y-fullscreen-right', `${Math.max(12, Math.round(window.innerWidth - r.right))}px`);
    } else if (focusMode) {
      // A área logada não mostra o cabeçalho. Mantemos UM único atalho
      // fora do Android simulado, ao lado do botão Sair, sem cobrir conteúdos.
      if (wrapper.parentElement !== document.body) document.body.appendChild(wrapper);
      wrapper.classList.remove('a11y-below-exit');
      wrapper.style.removeProperty('--a11y-fullscreen-top');
      wrapper.style.removeProperty('--a11y-fullscreen-right');
    } else {
      // Na página principal pertence ao cabeçalho, ANTES de Como usar.
      if (wrapper.parentElement !== actions) {
        if (guideButton?.parentElement === actions) actions.insertBefore(wrapper, guideButton);
        else actions.prepend(wrapper);
      }
      wrapper.classList.remove('a11y-below-exit');
      wrapper.style.removeProperty('--a11y-fullscreen-top');
      wrapper.style.removeProperty('--a11y-fullscreen-right');
    }
  }
  function schedule() {
    if (pending) cancelAnimationFrame(pending);
    pending = requestAnimationFrame(place);
  }
  window.addEventListener('resize', schedule, { passive:true });
  window.visualViewport?.addEventListener('resize', schedule, { passive:true });
  document.addEventListener('fullscreenchange', schedule);
  document.addEventListener('visibilitychange', schedule);
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(schedule).observe(document.documentElement, {attributes:true,attributeFilter:['class']});
    new MutationObserver(schedule).observe(document.body, {attributes:true,attributeFilter:['class']});
    if (exitButton) new MutationObserver(schedule).observe(exitButton, {attributes:true,attributeFilter:['hidden']});
  }
  schedule();
})();
