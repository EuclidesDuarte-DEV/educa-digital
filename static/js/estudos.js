document.addEventListener("DOMContentLoaded", function () {
  // Mantém o mesmo comportamento dos GIFs que já existia no projeto.
  // A imagem estática continua visível até o GIF terminar de carregar.
  document.querySelectorAll("[data-hover-media]").forEach(function (areaImagem) {
    const fotoAnimada = areaImagem.querySelector(".trilhas-opcao-foto-animada");
    const gifUrl = areaImagem.dataset.gif;

    if (!fotoAnimada || !gifUrl) return;

    let urlTemporaria = null;

    function limparUrlTemporaria() {
      if (urlTemporaria) {
        URL.revokeObjectURL(urlTemporaria);
        urlTemporaria = null;
      }
    }

    if (document.body.classList.contains("reduzir-animacoes")) {
      areaImagem.classList.remove("animando", "gif-pronto");
      return;
    }

    fetch(gifUrl, { cache: "force-cache" })
      .then(function (response) {
        if (!response.ok) throw new Error("Falha ao carregar GIF");
        return response.blob();
      })
      .then(function (blob) {
        urlTemporaria = URL.createObjectURL(blob);
        fotoAnimada.onload = function () {
          areaImagem.classList.add("gif-em-memoria", "gif-pronto", "animando");
        };
        fotoAnimada.onerror = function () {
          areaImagem.classList.remove("gif-em-memoria", "gif-pronto", "animando");
          limparUrlTemporaria();
        };
        fotoAnimada.src = urlTemporaria;
      })
      .catch(function () {
        areaImagem.classList.remove("gif-em-memoria", "gif-pronto", "animando");
      });
  });

  function falar(texto) {
    if (!("speechSynthesis" in window) || !texto) return;
    window.speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = "pt-BR";
    fala.rate = 0.88;
    window.speechSynthesis.speak(fala);
  }

  document.querySelectorAll("[data-ouvir-area]").forEach(function (botao) {
    botao.addEventListener("click", function () {
      falar(botao.dataset.texto || "Vamos aprender juntos, com calma.");
    });
  });

  const ajuda = document.getElementById("abrirAjudaTrilhas");
  if (ajuda) {
    ajuda.addEventListener("click", function () {
      const acessibilidade = document.getElementById("abrirAcessibilidadeFlutuante");
      if (acessibilidade) acessibilidade.click();
    });
  }
});
