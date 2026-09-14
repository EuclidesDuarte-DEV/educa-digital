(function () {
  "use strict";

  const CHAVES = {
    zoom: "educa_zoom",
    senior: "educa_modo_senior",
    contraste: "educa_alto_contraste"
  };

  let zoomAtual = Number(localStorage.getItem(CHAVES.zoom) || 100);

  function iniciar() {
    const body = document.body;
    const abrir = document.getElementById("abrirAcessibilidadeFlutuante");
    const fechar = document.getElementById("fecharAcessibilidade");
    const painel = document.getElementById("painelAcessibilidade");
    const overlay = document.getElementById("overlay");
    const diminuir = document.getElementById("diminuirFonte");
    const aumentar = document.getElementById("aumentarFonte");
    const porcentagem = document.getElementById("porcentagemFonte");
    const modoSenior = document.getElementById("modoSenior");
    const altoContraste = document.getElementById("altoContraste");
    const restaurar = document.getElementById("restaurar");
    const assistente = document.getElementById("lerVozAlta");

    if (!Number.isFinite(zoomAtual) || zoomAtual < 90 || zoomAtual > 140) zoomAtual = 100;

    function abrirPainel() {
      if (!painel) return;
      painel.classList.add("aberto");
      painel.setAttribute("aria-hidden", "false");
      abrir?.setAttribute("aria-expanded", "true");
      overlay?.classList.add("ativo");
      overlay?.setAttribute("aria-hidden", "false");
    }

    function fecharPainel() {
      if (!painel) return;
      painel.classList.remove("aberto");
      painel.setAttribute("aria-hidden", "true");
      abrir?.setAttribute("aria-expanded", "false");
      overlay?.classList.remove("ativo");
      overlay?.setAttribute("aria-hidden", "true");
    }

    abrir?.addEventListener("click", abrirPainel);
    fechar?.addEventListener("click", fecharPainel);
    overlay?.addEventListener("click", fecharPainel);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharPainel(); });

    const SELETOR_TEXTO_AJUSTAVEL = [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "a", "button", "label", "input", "textarea", "select",
      "small", "strong", "em", "li", "figcaption", "th", "td", "output",
      "span:not([aria-hidden=\"true\"])"
    ].join(",");

    function restaurarTamanhoOriginalDosTextos() {
      document.querySelectorAll("[data-educa-fonte-controlada]").forEach((elemento) => {
        const valorOriginal = elemento.dataset.educaFonteInline || "";
        const prioridadeOriginal = elemento.dataset.educaFontePrioridade || "";

        if (valorOriginal) {
          elemento.style.setProperty("font-size", valorOriginal, prioridadeOriginal);
        } else {
          elemento.style.removeProperty("font-size");
        }
      });
    }

    function ajustarSomenteTextos(fator) {
      restaurarTamanhoOriginalDosTextos();

      const elementos = Array.from(document.querySelectorAll(SELETOR_TEXTO_AJUSTAVEL))
        .filter((elemento) => !elemento.closest("svg") && elemento.getAttribute("aria-hidden") !== "true");

      /*
        Primeiro medimos todos os textos sem alterar nenhum deles.
        Assim um <span> dentro de um botão não recebe a escala duas vezes.
      */
      const medidas = elementos.map((elemento) => {
        if (!elemento.hasAttribute("data-educa-fonte-controlada")) {
          elemento.dataset.educaFonteControlada = "1";
          elemento.dataset.educaFonteInline = elemento.style.getPropertyValue("font-size") || "";
          elemento.dataset.educaFontePrioridade = elemento.style.getPropertyPriority("font-size") || "";
        }

        return {
          elemento,
          tamanhoBase: Number.parseFloat(getComputedStyle(elemento).fontSize)
        };
      });

      medidas.forEach(({ elemento, tamanhoBase }) => {
        if (!Number.isFinite(tamanhoBase)) return;

        elemento.style.setProperty(
          "font-size",
          `${Math.max(12, tamanhoBase * fator).toFixed(2)}px`,
          "important"
        );
      });
    }

    function aplicarZoom(valor, salvar = true) {
      zoomAtual = Math.max(90, Math.min(140, Number(valor) || 100));
      ajustarSomenteTextos(zoomAtual / 100);

      if (porcentagem) porcentagem.textContent = zoomAtual + "%";
      if (salvar) localStorage.setItem(CHAVES.zoom, String(zoomAtual));
    }

    diminuir?.addEventListener("click", () => aplicarZoom(zoomAtual - 10));
    aumentar?.addEventListener("click", () => aplicarZoom(zoomAtual + 10));
    aplicarZoom(zoomAtual, false);

    function aplicarSenior(ativo, salvar = true) {
      body.classList.toggle("modo-senior", ativo);
      if (modoSenior) modoSenior.checked = ativo;

      const tamanhoDesejado = ativo && zoomAtual < 110 ? 110 : zoomAtual;
      aplicarZoom(tamanhoDesejado, salvar);

      if (salvar) localStorage.setItem(CHAVES.senior, ativo ? "1" : "0");
    }

    aplicarSenior(localStorage.getItem(CHAVES.senior) === "1", false);
    modoSenior?.addEventListener("change", () => aplicarSenior(modoSenior.checked));

    function aplicarContraste(ativo, salvar = true) {
      body.classList.toggle("alto-contraste", ativo);
      if (altoContraste) altoContraste.checked = ativo;
      if (salvar) localStorage.setItem(CHAVES.contraste, ativo ? "1" : "0");
    }

    aplicarContraste(localStorage.getItem(CHAVES.contraste) === "1", false);
    altoContraste?.addEventListener("change", () => aplicarContraste(altoContraste.checked));

    restaurar?.addEventListener("click", function () {
      aplicarZoom(100);
      aplicarSenior(false);
      aplicarContraste(false);
      Object.values(CHAVES).forEach((chave) => localStorage.removeItem(chave));
      if (assistente?.checked) {
        assistente.checked = false;
        assistente.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();

document.addEventListener("DOMContentLoaded", function () {

  /* =====================================================
     MOSTRAR / OCULTAR SENHA
     ===================================================== */

  document
    .querySelectorAll("[data-toggle-senha]")
    .forEach(function (botao) {
      botao.addEventListener("click", function () {
        const idCampo = botao.getAttribute("data-toggle-senha");
        const campo = document.getElementById(idCampo);

        if (!campo) return;

        const mostrando = campo.type === "text";

        campo.type = mostrando ? "password" : "text";
        botao.textContent = mostrando ? "Mostrar" : "Ocultar";
        botao.setAttribute(
          "aria-label",
          mostrando ? "Mostrar senha" : "Ocultar senha"
        );

        campo.focus();
      });
    });


  /* =====================================================
     VÍDEO DA PÁGINA INICIAL
     ===================================================== */

  const videoEduca = document.getElementById("videoEduca");
  const videoCard = document.getElementById("videoCard");

  if (videoEduca && videoCard) {
    videoEduca.addEventListener("ended", function () {
      videoCard.classList.remove("reproduzindo");
      videoEduca.currentTime = 0;
    });
  }


/* =====================================================
   ANIMAÇÕES AO ENTRAR NA TELA
   ===================================================== */

const elementosRevelar =
  document.querySelectorAll(".revelar-scroll");

if (elementosRevelar.length) {

  const reduzirMovimento =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  if (reduzirMovimento) {
    elementosRevelar.forEach(function (elemento) {
      elemento.classList.add("visivel");
    });

  } else {
    /*
      Só agora ativamos o estado oculto.
      Assim, se o JS falhar, nada desaparece da página.
    */
    document.documentElement.classList.add(
      "animacoes-scroll-ativas"
    );

    const observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {

          if (!entrada.isIntersecting) {
            return;
          }

          /*
            requestAnimationFrame garante que o navegador
            registre primeiro o estado inicial e depois faça
            a transição. Isso deixa a entrada bem perceptível.
          */
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              entrada.target.classList.add("visivel");
            });
          });

          observador.unobserve(entrada.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    elementosRevelar.forEach(function (elemento) {
      observador.observe(elemento);
    });
  }
}

});

/* =====================================================
   COMPONENTES GLOBAIS DO EDUCA+
   Pequenos utilitários para evitar repetir JavaScript nas páginas.
   ===================================================== */
(function () {
  "use strict";

  function resolverElemento(alvo) {
    if (!alvo) return null;
    if (typeof alvo === "string") return document.querySelector(alvo);
    return alvo;
  }

  function definirCarregando(alvo, ativo, texto) {
    const botao = resolverElemento(alvo);
    if (!botao) return;

    if (ativo) {
      if (!botao.dataset.textoOriginal) botao.dataset.textoOriginal = botao.textContent.trim();
      botao.classList.add("esta-carregando");
      botao.setAttribute("aria-busy", "true");
      botao.disabled = true;
      if (texto) botao.textContent = texto;
      return;
    }

    botao.classList.remove("esta-carregando");
    botao.removeAttribute("aria-busy");
    botao.disabled = false;
    if (botao.dataset.textoOriginal) {
      botao.textContent = botao.dataset.textoOriginal;
      delete botao.dataset.textoOriginal;
    }
  }

  function abrirDialogo(alvo) {
    const dialogo = resolverElemento(alvo);
    if (!dialogo) return;
    if (typeof dialogo.showModal === "function" && !dialogo.open) dialogo.showModal();
  }

  function fecharDialogo(alvo) {
    const dialogo = resolverElemento(alvo);
    if (!dialogo) return;
    if (typeof dialogo.close === "function" && dialogo.open) dialogo.close();
  }

  function criarAviso(mensagem, tipo = "info", destino = document.body) {
    const area = resolverElemento(destino) || document.body;
    const aviso = document.createElement("div");
    const tiposPermitidos = ["info", "sucesso", "atencao", "erro"];
    const variante = tiposPermitidos.includes(tipo) ? tipo : "info";

    aviso.className = `aviso-ui aviso-ui-${variante}`;
    aviso.setAttribute("role", variante === "erro" ? "alert" : "status");
    aviso.textContent = mensagem;
    area.appendChild(aviso);
    return aviso;
  }

  window.EducaUI = Object.freeze({
    definirCarregando,
    abrirDialogo,
    fecharDialogo,
    criarAviso
  });
})();
