/**
 * Educa+ Digital — experiência Android simulada (V103).
 *
 * Mantém a V102 intacta: não substitui as telas das aulas ou as rotas da API.
 * Wi-Fi, Bluetooth, brilho e notificações abaixo são exemplos educativos.
 * Não são usados dados pessoais ou APIs para alterar o aparelho do visitante.
 */
(() => {
  'use strict';

  const screen = document.querySelector('#phoneScreen');
  const shade = document.querySelector('#androidShade');
  const recents = document.querySelector('#androidRecents');
  const trigger = document.querySelector('#androidShadeTrigger');
  const guide = document.querySelector('#guideOverlay');
  const dimmer = document.querySelector('#androidDisplayDimmer');
  const gestureBar = document.querySelector('#gestureHome');
  if (!screen || !shade || !recents || !trigger || !gestureBar) return;

  const qs = (selector, parent = document) => parent.querySelector(selector);
  const state = { wifi: true, bluetooth: false, silent: false, airplane: false, brightness: 100 };
  let guideWasVisible = false;
  let initialGesture = null;
  let longPressTimer = null;
  let suppressGestureClick = false;
  let panelPointerStart = null;
  const phoneGestureThreshold = 52;

  function syncClock() {
    const now = new Date();
    qs('#androidShadeClock').textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    qs('#androidShadeDate').textContent = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  function temporarilySuspendGuide() {
    // Ao abrir o painel, pausamos a máscara escura da atividade, sem apagar o progresso.
    guideWasVisible = !!guide && !guide.hidden;
    if (guideWasVisible) guide.hidden = true;
  }

  function restoreGuide() {
    // Reabrir apenas se ainda houver uma etapa guiada ativa na mesma tela.
    if (guideWasVisible && guide && qs('.guide-target', screen)) guide.hidden = false;
    guideWasVisible = false;
  }

  function dimmerOpacity(panelOpen = false) {
    const ambient = Math.max(0, (100 - state.brightness) / 180);
    return String(Math.min(.55, ambient + (panelOpen ? .12 : 0)));
  }

  function showShade() {
    if (!recents.hidden) hideRecents();
    if (!shade.hidden) return;
    temporarilySuspendGuide();
    syncClock();
    shade.hidden = false;
    dimmer.style.opacity = dimmerOpacity(true);
    trigger.setAttribute('aria-expanded', 'true');
    screen.classList.add('has-system-panel');
    qs('#closeAndroidShade')?.focus({ preventScroll: true });
  }

  function hideShade() {
    if (shade.hidden) return;
    shade.hidden = true;
    dimmer.style.opacity = dimmerOpacity();
    trigger.setAttribute('aria-expanded', 'false');
    screen.classList.remove('has-system-panel');
    restoreGuide();
  }

  function showRecents() {
    if (!shade.hidden) hideShade();
    if (!recents.hidden) return;
    temporarilySuspendGuide();
    recents.hidden = false;
    dimmer.style.opacity = dimmerOpacity(true);
    screen.classList.add('has-system-panel');
    qs('#closeAndroidRecents')?.focus({ preventScroll: true });
  }

  function hideRecents() {
    if (recents.hidden) return;
    recents.hidden = true;
    dimmer.style.opacity = dimmerOpacity();
    screen.classList.remove('has-system-panel');
    restoreGuide();
  }

  function syncTiles() {
    document.querySelectorAll('[data-system-toggle]').forEach(button => {
      const on = state[button.dataset.systemToggle];
      button.classList.toggle('is-on', on);
      button.setAttribute('aria-pressed', String(on));
    });
    qs('#systemWifiState').textContent = state.wifi ? 'Conectado (simulado)' : 'Desligado';
    qs('#systemBluetoothState').textContent = state.bluetooth ? 'Ligado' : 'Desligado';
    qs('#systemSilentState').textContent = state.silent ? 'Ligado' : 'Desligado';
    qs('#systemAirplaneState').textContent = state.airplane ? 'Ligado' : 'Desligado';
    const wifiIcon = qs('#wifiIcon');
    if (wifiIcon) wifiIcon.style.opacity = state.wifi ? '1' : '.3';
  }

  function toggleSetting(setting) {
    if (!(setting in state) || setting === 'brightness') return;
    if (setting === 'wifi' && state.airplane) return; // No exercício, avião bloqueia rede.
    state[setting] = !state[setting];
    if (setting === 'airplane' && state.airplane) state.wifi = false;
    syncTiles();
  }

  shade.addEventListener('click', event => {
    const tile = event.target.closest('[data-system-toggle]');
    if (tile) toggleSetting(tile.dataset.systemToggle);
  });

  const slider = qs('#androidBrightness');
  slider?.addEventListener('input', () => {
    state.brightness = Number(slider.value);
    // Apenas o desenho da tela fica mais escuro; o brilho físico não é modificado.
    dimmer.style.opacity = dimmerOpacity(!shade.hidden || !recents.hidden);
  });

  function openSettingsFromShade() {
    hideShade();
    const button = qs('#homeView [data-open-app="settings"]');
    // Usa o fluxo original de Ajustes da V102.
    if (guide) guide.hidden = true;
    if (button) button.click();
  }

  // Captura na janela é necessária para a guia educacional não bloquear o painel.
  window.addEventListener('click', event => {
    if (event.target.closest('#androidShadeTrigger')) {
      event.preventDefault();
      event.stopPropagation();
      showShade();
    }
    if (event.target.closest('#gestureHome') && suppressGestureClick) {
      event.preventDefault();
      event.stopPropagation();
      suppressGestureClick = false;
    }
  }, true);

  qs('#closeAndroidShade')?.addEventListener('click', hideShade);
  qs('#closeAndroidRecents')?.addEventListener('click', hideRecents);
  qs('#androidOpenSettings')?.addEventListener('click', openSettingsFromShade);
  qs('#androidReturnTraining')?.addEventListener('click', () => {
    hideRecents();
    // Mantém o atalho já existente para continuar treinando.
    window.dispatchEvent(new CustomEvent('educa:system-learning'));
  });
  qs('#androidReturnHome')?.addEventListener('click', () => {
    hideRecents();
    window.dispatchEvent(new CustomEvent('educa:system-home'));
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!shade.hidden) hideShade();
    if (!recents.hidden) hideRecents();
  });

  function inInteractiveArea(target) {
    return !!target.closest('input, textarea, select, video, .android-system-shade, .android-recents');
  }

  // Gestos do smartphone virtual; não interceptam rolagem de textos e exercícios.
  screen.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (inInteractiveArea(event.target)) return;
    const rect = screen.getBoundingClientRect();
    initialGesture = { x: event.clientX, y: event.clientY, top: event.clientY - rect.top, left: event.clientX - rect.left, at: Date.now() };
  }, { passive: true });

  screen.addEventListener('pointerup', event => {
    if (!initialGesture) return;
    const gesture = initialGesture;
    initialGesture = null;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!shade.hidden && dy < -phoneGestureThreshold) { hideShade(); return; }
    if (!recents.hidden && Math.abs(dy) > phoneGestureThreshold) { hideRecents(); return; }
    if (shade.hidden && recents.hidden && gesture.top < 45 && dy > phoneGestureThreshold) { showShade(); return; }
    // Voltar deslizando a partir da borda, como no Android moderno.
    if (shade.hidden && recents.hidden && (!guide || guide.hidden) && gesture.left < 18 && dx > 90 && Math.abs(dy) < 60) {
      window.dispatchEvent(new CustomEvent('educa:system-back'));
    }
  }, { passive: true });

  screen.addEventListener('pointercancel', () => { initialGesture = null; });

  // Painéis têm rolagem própria. Tratamos o gesto de fechar neles, sem bloquear
  // controles como os botões e o seletor de brilho.
  [shade, recents].forEach(panel => {
    panel.addEventListener('pointerdown', event => {
      if (event.target.closest('input, button')) return;
      panelPointerStart = { y: event.clientY, panel };
    }, { passive: true });
    panel.addEventListener('pointerup', event => {
      if (!panelPointerStart || panelPointerStart.panel !== panel) return;
      const vertical = event.clientY - panelPointerStart.y;
      panelPointerStart = null;
      if (panel === shade && vertical < -95) hideShade();
      if (panel === recents && Math.abs(vertical) > 95) hideRecents();
    }, { passive: true });
    panel.addEventListener('pointercancel', () => { panelPointerStart = null; });
  });



  // Segurar a barra inferior abre aplicativos recentes; toque curto mantém
  // o comportamento de navegação já existente na V102.
  gestureBar.addEventListener('pointerdown', () => {
    window.clearTimeout(longPressTimer);
    longPressTimer = window.setTimeout(() => {
      suppressGestureClick = true;
      showRecents();
    }, 600);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => gestureBar.addEventListener(type, () => {
    window.clearTimeout(longPressTimer);
  }));

  // Entrada acessível alternativa: tecla Enter com foco no pequeno controle superior.
  trigger.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      showShade();
    }
  });

  syncClock();
  syncTiles();
  window.setInterval(syncClock, 60000);
  window.EducaAndroidSystem = Object.freeze({ showShade, hideShade, showRecents, hideRecents });
})();
