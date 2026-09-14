(function () {
  const painel = document.getElementById('assistenteAuth');
  const texto = document.getElementById('assistenteAuthTexto');
  const ouvir = document.getElementById('assistenteAuthOuvir');
  const campos = document.querySelectorAll('[data-ajuda-auth] input, [data-ajuda-auth] button');

  function falar(msg) {
    if (!('speechSynthesis' in window) || !msg) return;
    window.speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance(msg);
    fala.lang = 'pt-BR';
    fala.rate = 0.88;
    window.speechSynthesis.speak(fala);
  }

  function atualizarAjuda(el) {
    const grupo = el.closest('[data-ajuda-auth]');
    if (!grupo || !texto) return;
    texto.textContent = grupo.dataset.ajudaAuth;
  }

  campos.forEach((el) => {
    el.addEventListener('focus', () => atualizarAjuda(el));
    el.addEventListener('click', () => atualizarAjuda(el));
  });

  if (ouvir) ouvir.addEventListener('click', () => falar(texto ? texto.textContent : ''));
})();

(function () {
  document.querySelectorAll('[data-toggle-senha]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const campo = document.getElementById(botao.dataset.toggleSenha);
      if (!campo) return;

      const mostrar = campo.type === 'password';
      campo.type = mostrar ? 'text' : 'password';
      botao.textContent = mostrar ? 'Ocultar' : 'Mostrar';
      botao.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
      campo.focus();
    });
  });
})();

(function () {
  const dialogo = document.getElementById('cadastroDialogo');
  const form = document.getElementById('formCadastroGuiado');
  if (!dialogo || !form) return;

  const etapas = Array.from(form.querySelectorAll('[data-cadastro-etapa]'));
  const progressoTexto = document.getElementById('cadastroProgressoTexto');
  const progressoBarra = document.getElementById('cadastroProgressoBarra');
  const nome = document.getElementById('nome');
  const telefone = document.getElementById('telefone');
  const senha = document.getElementById('senha');
  const forca = document.getElementById('forcaSenha');
  let etapaAtual = Number(dialogo.dataset.etapaInicial || 1);

  function somenteNumeros(valor) {
    return String(valor || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '').slice(0, 11);
  }

  function formatarTelefone(valor) {
    const numeros = somenteNumeros(valor);
    if (numeros.length <= 2) return numeros ? `(${numeros}` : '';
    if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 10) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }

  function mostrarErro(id, mensagem) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = mensagem || '';
  }

  function validarEtapa(etapa) {
    if (etapa === 1) {
      const valor = nome ? nome.value.trim() : '';
      if (valor.length < 2) {
        mostrarErro('erroNome', 'Digite seu nome para continuar.');
        nome?.focus();
        return false;
      }
      mostrarErro('erroNome', '');
      return true;
    }

    if (etapa === 2) {
      const numeros = somenteNumeros(telefone ? telefone.value : '');
      if (![10, 11].includes(numeros.length)) {
        mostrarErro('erroTelefone', 'Digite o celular com DDD. Exemplo: (65) 99999-9999.');
        telefone?.focus();
        return false;
      }
      mostrarErro('erroTelefone', '');
      return true;
    }

    if (etapa === 3) {
      const valor = senha ? senha.value : '';
      if (valor.length < 8) {
        mostrarErro('erroSenha', 'Use pelo menos 8 caracteres para proteger sua conta.');
        senha?.focus();
        return false;
      }
      mostrarErro('erroSenha', '');
      return true;
    }

    return true;
  }

  function exibirEtapa(numero) {
    etapaAtual = Math.max(1, Math.min(3, Number(numero) || 1));

    etapas.forEach((etapa) => {
      etapa.hidden = Number(etapa.dataset.cadastroEtapa) !== etapaAtual;
    });

    if (progressoTexto) progressoTexto.textContent = `Etapa ${etapaAtual} de 3`;
    if (progressoBarra) progressoBarra.style.width = `${(etapaAtual / 3) * 100}%`;

    const campo = etapaAtual === 1 ? nome : etapaAtual === 2 ? telefone : senha;
    window.setTimeout(() => campo?.focus(), 60);
  }

  if (telefone) {
    telefone.addEventListener('input', () => {
      const cursorNoFim = telefone.selectionStart === telefone.value.length;
      telefone.value = formatarTelefone(telefone.value);
      if (cursorNoFim) telefone.setSelectionRange(telefone.value.length, telefone.value.length);
    });
  }

  if (senha && forca) {
    senha.addEventListener('input', () => {
      const valor = senha.value;
      if (!valor) {
        forca.textContent = 'A senha fica protegida e não é mostrada para outras pessoas.';
      } else if (valor.length < 8) {
        forca.textContent = `Faltam ${8 - valor.length} caracteres.`;
      } else {
        forca.textContent = 'Tamanho mínimo alcançado ✓';
      }
    });
  }

  form.querySelectorAll('[data-proxima-etapa]').forEach((botao) => {
    botao.addEventListener('click', () => {
      if (validarEtapa(etapaAtual)) exibirEtapa(botao.dataset.proximaEtapa);
    });
  });

  form.querySelectorAll('[data-voltar-etapa]').forEach((botao) => {
    botao.addEventListener('click', () => exibirEtapa(botao.dataset.voltarEtapa));
  });

  form.addEventListener('submit', (evento) => {
    if (!validarEtapa(3)) evento.preventDefault();
  });

  dialogo.addEventListener('cancel', (evento) => {
    evento.preventDefault();
  });

  if (!dialogo.open && typeof dialogo.showModal === 'function') {
    dialogo.showModal();
  } else {
    dialogo.setAttribute('open', '');
  }

  exibirEtapa(etapaAtual);
})();

(function () {
  document.querySelectorAll('[data-copiar]').forEach(function (botao) {
    botao.addEventListener('click', async function () {
      const alvo = document.getElementById(botao.dataset.copiar);
      if (!alvo) return;

      const valor = alvo.textContent.trim();
      if (navigator.clipboard) await navigator.clipboard.writeText(valor);
      botao.textContent = 'Copiado ✓';
    });
  });
})();
