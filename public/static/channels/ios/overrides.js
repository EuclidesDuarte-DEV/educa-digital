/* V111.70 — iPhone PWA: orientacao gratuita para triagem de numeros nao salvos.
 * Este painel fica FORA do celular simulado. Nao intercepta chamadas,
 * nao acessa contatos, nao dispara notificacoes de ligacoes reais.
 */
(() => {
  'use strict';
  if (document.documentElement.dataset.educaPlatform !== 'ios') return;
  window.EducaIOSChannel = Object.freeze({
    name: 'ios',
    callScreening: 'system-settings-only',
    callEventAccess: false
  });

  const isNativeShell = () => Boolean(window.webkit?.messageHandlers?.educaIOS);
  const isInstalled = () => Boolean(
    window.navigator.standalone === true ||
    window.matchMedia?.('(display-mode: standalone)').matches
  );

  function start() {
    if (isNativeShell() || document.getElementById('educa-ios-call-screen-guide')) return;
    const target = document.body;
    if (!target) return;

    const launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'educa-ios-safety-launcher';
    launcher.id = 'educa-ios-call-screen-open';
    launcher.textContent = 'Proteção de chamadas';
    launcher.setAttribute('aria-label', 'Como proteger ligações de números não salvos no iPhone');

    const dialog = document.createElement('dialog');
    dialog.id = 'educa-ios-call-screen-guide';
    dialog.className = 'educa-ios-safety-dialog';
    dialog.setAttribute('aria-labelledby', 'educa-ios-safety-title');
    dialog.setAttribute('aria-describedby', 'educa-ios-safety-description');

    // Conteudo estatico, sem interpolacao de entrada do usuario.
    dialog.innerHTML = `
      <div class="educa-ios-safety-content">
        <div class="educa-ios-safety-heading">
          <span aria-hidden="true" class="educa-ios-safety-symbol">🛡️</span>
          <h2 id="educa-ios-safety-title">Proteção de chamadas no iPhone</h2>
          <button type="button" class="educa-ios-safety-close" aria-label="Fechar proteção de chamadas">×</button>
        </div>
        <div class="educa-ios-safety-education" id="educa-ios-safety-description">
          <strong>Educa+ Digital — Atenção</strong>
          <p>Número desconhecido. Tenha cuidado com possíveis tentativas de golpe. Nunca compartilhe senhas ou códigos.</p>
          <small>Mensagem educativa. Não é uma notificação disparada por uma chamada real.</small>
        </div>
        <h3>Proteja ligações de números não salvos, gratuitamente</h3>
        <ol>
          <li>Abra os <strong>Ajustes</strong> do iPhone.</li>
          <li>Entre em <strong>Apps → Telefone</strong>.</li>
          <li>Encontre <strong>Filtrar Números Desconhecidos</strong>.</li>
          <li>Selecione <strong>Perguntar Motivo da Ligação</strong>.</li>
        </ol>
        <p>O próprio iPhone perguntará o motivo antes de tocar para números não salvos. Esse aviso é do sistema Apple, não do Educa+.</p>
        <p class="educa-ios-safety-limit">Permitir notificações do Educa+ não dá acesso aos números das ligações. A versão instalada pelo Safari não pode exibir este texto automaticamente ao receber uma chamada.</p>
        <p class="educa-ios-safety-install" hidden>Para instalar: no Safari, toque em <strong>Compartilhar → Adicionar à Tela de Início</strong>. O Educa+ Web atualiza pela Cloudflare sem reinstalar.</p>
        <a class="educa-ios-safety-apple-link" href="https://support.apple.com/pt-br/guide/iphone/iphe4b3f7823/ios" target="_blank" rel="noopener noreferrer">Ver instruções oficiais da Apple</a>
        <button type="button" class="educa-ios-safety-done">Entendi</button>
      </div>
    `;

    const close = () => dialog.close();
    dialog.querySelector('.educa-ios-safety-close').addEventListener('click', close);
    dialog.querySelector('.educa-ios-safety-done').addEventListener('click', close);
    dialog.querySelector('.educa-ios-safety-install').hidden = isInstalled();
    launcher.addEventListener('click', () => dialog.showModal());
    dialog.addEventListener('close', () => launcher.focus());
    dialog.addEventListener('click', event => {
      if (event.target === dialog) close();
    });

    target.appendChild(launcher);
    target.appendChild(dialog);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once:true });
  } else start();
})();
