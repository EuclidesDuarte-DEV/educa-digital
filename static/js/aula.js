document.addEventListener("DOMContentLoaded", function () {
  const pagina = document.getElementById("aulaInterativa");
  if (!pagina) return;

  const aulaSlug = pagina.dataset.aulaSlug;
  const totalPassos = Number(pagina.dataset.totalPassos || 0);
  const passoInicial = Number(pagina.dataset.passoInicial || 1);
  let atividades = JSON.parse(document.getElementById("dadosAtividades").textContent || "[]");

  const passos = Array.from(document.querySelectorAll(".aula-passo"));
  const secaoAtividade = document.getElementById("aulaAtividade");
  const secaoConcluida = document.getElementById("aulaConcluida");
  const navegacao = document.getElementById("aulaNavegacao");
  const btnAnterior = document.getElementById("passoAnterior");
  const btnProximo = document.getElementById("proximoPasso");
  const btnRecomecar = document.getElementById("recomecarAula");
  const instrucaoRodape = document.getElementById("aulaInstrucaoRodape");
  const barra = document.getElementById("aulaProgressoBarra");
  const numero = document.getElementById("aulaProgressoNumero");
  const mensagem = document.getElementById("aulaProgressoMensagem");
  const atividadeNumero = document.getElementById("atividadeNumero");
  const atividadePergunta = document.getElementById("atividadePergunta");
  const atividadeFeedback = document.getElementById("atividadeFeedback");
  const atividadeDica = document.getElementById("atividadeDica");
  const btnDicaAtividade = document.getElementById("mostrarDicaAtividade");
  const btnOuvirAtividade = document.getElementById("ouvirPerguntaAtividade");
  const atividadeOpcoes = document.getElementById("atividadeOpcoes");
  const atividadeContador = document.getElementById("atividadeContador");
  const irProximaAula = document.getElementById("irProximaAula");
  const btnOuvirObjetivo = document.querySelector("[data-ouvir-objetivo]");
  const botoesModoAula = Array.from(document.querySelectorAll("[data-modo-aula]"));
  const objetivoAula = pagina.dataset.objetivo || document.getElementById("aulaObjetivo")?.textContent || "";

  // Estilo do indicador é injetado aqui para não substituir o CSS principal do projeto.
  if (!document.getElementById("estiloAtividadeAdaptativa")) {
    const estilo = document.createElement("style");
    estilo.id = "estiloAtividadeAdaptativa";
    estilo.textContent = `
      .atividade-ritmo{width:fit-content;max-width:100%;margin:0 0 14px;padding:9px 12px;display:flex;flex-wrap:wrap;align-items:center;gap:7px 10px;border:1px solid #d8e8fb;border-radius:14px;background:linear-gradient(180deg,#fff 0%,#eef6ff 100%);color:#0b2357}
      .atividade-ritmo>span{color:#2863eb;font-size:.76rem;font-weight:900;text-transform:uppercase;letter-spacing:.04em}
      .atividade-ritmo>strong{font-size:.88rem}.atividade-ritmo>small{width:100%;color:#617995;font-size:.76rem;line-height:1.4}
      body.modo-senior .atividade-ritmo{padding:12px 14px}body.modo-senior .atividade-ritmo>strong{font-size:1rem}body.modo-senior .atividade-ritmo>small{font-size:.88rem}
      body.alto-contraste .atividade-ritmo{background:#111!important;color:#fff!important;border-color:#ffd51f!important}body.alto-contraste .atividade-ritmo>span{color:#ffd51f!important}body.alto-contraste .atividade-ritmo>small{color:#fff!important}
    `;
    document.head.appendChild(estilo);
  }

  let indicadorRitmo = null;
  const blocoTextoAtividade = secaoAtividade?.querySelector(".atividade-texto");
  if (blocoTextoAtividade && atividadeNumero) {
    indicadorRitmo = document.createElement("div");
    indicadorRitmo.className = "atividade-ritmo";
    indicadorRitmo.setAttribute("aria-live", "polite");
    blocoTextoAtividade.insertBefore(indicadorRitmo, atividadeNumero);
  }

  let modoAula = "guiado";
  let indicePasso = Math.max(0, Math.min(passoInicial - 1, totalPassos));
  let perguntaAtual = 0;
  let respostasCertas = 0;
  let tentativasAtividade = 0;
  let dicaUsadaAtividade = false;
  const passosConcluidos = new Set();

  // Treino adaptativo: aumenta a quantidade/complexidade da prática quando
  // a pessoa demonstra segurança, mas nunca remove áudio, dicas ou repetição.
  const CHAVE_RITMO = "educa_ritmo_aprendizado_v1";
  const ATIVIDADES_ADAPTATIVAS = {
    "celular-no-dia-a-dia-enviar-uma-mensagem-no-whatsapp": [
      { id: "zap-curta", nivelMinimo: 1, tipo: "digitacao", enunciado: "Treino de digitação: escreva BOM DIA.", resposta: "BOM DIA", aceitar: ["bom dia"], dica: "Digite BOM, toque no espaço e depois escreva DIA.", explicacao: "Muito bem. Você treinou uma mensagem curta." },
      { id: "zap-maria", nivelMinimo: 2, tipo: "digitacao", enunciado: "Agora escreva: BOM DIA, MARIA", resposta: "BOM DIA MARIA", aceitar: ["bom dia maria", "bom dia, maria"], dica: "Primeiro BOM DIA, depois espaço e MARIA.", explicacao: "Ótimo. Você escreveu uma mensagem um pouco maior." },
      { id: "zap-livre", nivelMinimo: 3, tipo: "digitacao-palavras", enunciado: "Escreva uma mensagem curta para Maria dizendo que está tudo bem.", palavras_chave: [["maria"], ["bem", "tudo bem"]], minimo_caracteres: 12, placeholder: "Ex.: Oi Maria, estou bem", dica: "Escreva do seu jeito. Tente usar o nome Maria e dizer que está bem.", explicacao: "Muito bem. Você criou sua própria mensagem." }
    ],
    "seguranca-na-pratica-boleto-falso": [
      { id: "boleto-conferir", nivelMinimo: 1, tipo: "digitacao", enunciado: "Digite a palavra que devemos lembrar antes de pagar: CONFERIR", resposta: "CONFERIR", aceitar: ["conferir"], dica: "Começa com C e termina com R.", explicacao: "Isso. Conferir antes de pagar reduz o risco de cair em golpes." },
      { id: "boleto-beneficiario", nivelMinimo: 2, tipo: "digitacao", enunciado: "Treine esta palavra importante: BENEFICIÁRIO", resposta: "BENEFICIARIO", aceitar: ["beneficiario", "beneficiário"], dica: "Digite devagar: B-E-N-E-F-I-C-I-A-R-I-O.", explicacao: "Perfeito. O beneficiário é quem vai receber o pagamento." },
      { id: "boleto-regra", nivelMinimo: 3, tipo: "digitacao-palavras", enunciado: "Escreva o que você deve conferir antes de pagar um boleto.", palavras_chave: [["nome", "beneficiario", "beneficiário"], ["valor"]], minimo_caracteres: 15, placeholder: "Ex.: nome e valor", dica: "Tente escrever duas coisas: quem recebe e quanto será pago.", explicacao: "Muito bem. Conferir beneficiário e valor é um hábito importante." }
    ],
    "seguranca-na-pratica-pix-sem-pressa": [
      { id: "pix-conferir", nivelMinimo: 1, tipo: "digitacao", enunciado: "Antes de confirmar um PIX, digite: CONFERIR", resposta: "CONFERIR", aceitar: ["conferir"], dica: "Digite uma letra por vez: C-O-N-F-E-R-I-R.", explicacao: "Isso. Pare e confira antes de confirmar." },
      { id: "pix-destinatario", nivelMinimo: 2, tipo: "digitacao", enunciado: "Você queria pagar MARIA SOUZA. Digite o nome esperado: MARIA SOUZA", resposta: "MARIA SOUZA", aceitar: ["maria souza"], dica: "Digite primeiro MARIA, espaço, depois SOUZA.", explicacao: "Muito bem. Conferir o nome do destinatário é essencial." },
      { id: "pix-regra", nivelMinimo: 3, tipo: "digitacao-palavras", enunciado: "Escreva duas coisas que você deve conferir antes do PIX.", palavras_chave: [["nome", "destinatario", "destinatário"], ["valor"]], minimo_caracteres: 12, placeholder: "Ex.: nome e valor", dica: "Pense em quem vai receber e quanto dinheiro será enviado.", explicacao: "Excelente. Nome e valor devem ser conferidos antes da confirmação." }
    ],
    "seguranca-na-pratica-conta-invadida-e-codigos": [
      { id: "codigo-nao-compartilhar", nivelMinimo: 1, tipo: "digitacao", enunciado: "Digite esta regra: NÃO COMPARTILHAR CÓDIGO", resposta: "NAO COMPARTILHAR CODIGO", aceitar: ["nao compartilhar codigo", "não compartilhar código"], dica: "Você pode digitar sem acentos: NAO COMPARTILHAR CODIGO.", explicacao: "Muito bem. Código de verificação não deve ser entregue a desconhecidos." },
      { id: "codigo-oficial", nivelMinimo: 2, tipo: "digitacao", enunciado: "Se sua conta for invadida, digite: CANAL OFICIAL", resposta: "CANAL OFICIAL", aceitar: ["canal oficial"], dica: "CANAL, espaço, OFICIAL.", explicacao: "Certo. Recuperação deve começar no aplicativo ou site oficial." }
    ],
    "govbr-na-pratica-recuperar-senha": [
      { id: "gov-esqueceu", nivelMinimo: 1, tipo: "digitacao", enunciado: "Treine a frase que você deve procurar: ESQUECI MINHA SENHA", resposta: "ESQUECI MINHA SENHA", aceitar: ["esqueci minha senha"], dica: "São três palavras: ESQUECI, MINHA, SENHA.", explicacao: "Muito bem. Essa opção inicia a recuperação quando você não lembra a senha." },
      { id: "gov-endereco", nivelMinimo: 2, tipo: "digitacao", comparacao: "url", enunciado: "Digite o endereço oficial de treinamento: gov.br", resposta: "gov.br", aceitar: ["gov.br", "www.gov.br", "https://www.gov.br"], dica: "Digite GOV, ponto, BR.", explicacao: "Isso. Confirmar o endereço oficial ajuda a evitar páginas falsas." },
      { id: "gov-regra", nivelMinimo: 3, tipo: "digitacao-palavras", enunciado: "Escreva uma frase curta dizendo onde você deve recuperar a conta.", palavras_chave: [["oficial", "gov.br", "govbr"]], minimo_caracteres: 12, placeholder: "Ex.: no site oficial", dica: "A frase precisa lembrar que a recuperação deve ser feita em um canal oficial.", explicacao: "Perfeito. Recuperar pelo canal oficial é o caminho mais seguro." }
    ],
    "govbr-na-pratica-encontrar-servicos": [
      { id: "gov-busca-saude", nivelMinimo: 2, tipo: "digitacao", enunciado: "Agora pratique outra busca. Digite: SAÚDE", resposta: "SAUDE", aceitar: ["saude", "saúde"], dica: "Digite S-A-U-D-E. O acento não é obrigatório neste treino.", explicacao: "Muito bem. Você já consegue praticar buscas por assuntos diferentes." },
      { id: "gov-busca-trabalho", nivelMinimo: 3, tipo: "digitacao", enunciado: "Pratique uma busca maior: CARTEIRA DE TRABALHO", resposta: "CARTEIRA DE TRABALHO", aceitar: ["carteira de trabalho"], dica: "São três palavras. Use o espaço entre elas.", explicacao: "Excelente. Você treinou uma pesquisa com várias palavras." }
    ],
    "redes-sociais-seguras-perfil-falso": [
      { id: "insta-confirmar", nivelMinimo: 1, tipo: "digitacao", enunciado: "Quando um perfil novo pede dinheiro, digite: VOU CONFIRMAR", resposta: "VOU CONFIRMAR", aceitar: ["vou confirmar"], dica: "VOU, espaço, CONFIRMAR.", explicacao: "Muito bem. Confirmar por outro caminho é mais seguro." },
      { id: "insta-telefone", nivelMinimo: 2, tipo: "digitacao", enunciado: "Digite uma forma segura de confirmar: LIGAR POR TELEFONE", resposta: "LIGAR POR TELEFONE", aceitar: ["ligar por telefone"], dica: "LIGAR, espaço, POR, espaço, TELEFONE.", explicacao: "Isso. Um contato conhecido ajuda a confirmar a identidade." },
      { id: "insta-frase", nivelMinimo: 3, tipo: "digitacao-palavras", enunciado: "Escreva uma mensagem curta dizendo que vai confirmar antes de enviar dinheiro.", palavras_chave: [["confirmar", "conferir"], ["dinheiro", "pix", "pagar"]], minimo_caracteres: 18, placeholder: "Ex.: Vou confirmar antes do PIX", dica: "Use uma palavra como confirmar e outra relacionada ao pagamento.", explicacao: "Excelente. Você praticou uma resposta segura para uma situação real." }
    ],
    "redes-sociais-seguras-links-no-direct": [
      { id: "direct-senha", nivelMinimo: 1, tipo: "digitacao", enunciado: "Digite: NÃO VOU ENVIAR MINHA SENHA", resposta: "NAO VOU ENVIAR MINHA SENHA", aceitar: ["nao vou enviar minha senha", "não vou enviar minha senha"], dica: "Você pode escrever sem acentos.", explicacao: "Muito bem. Senha não deve ser enviada pelo Direct." },
      { id: "direct-app", nivelMinimo: 2, tipo: "digitacao", enunciado: "Digite: VOU CONFERIR NO APLICATIVO", resposta: "VOU CONFERIR NO APLICATIVO", aceitar: ["vou conferir no aplicativo"], dica: "VOU, espaço, CONFERIR, espaço, NO, espaço, APLICATIVO.", explicacao: "Certo. Abrir o aplicativo por conta própria é mais seguro que usar um link inesperado." }
    ]
  };

  function carregarRitmo() {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_RITMO) || "{}");
      return { pontos: Math.max(0, Math.min(10, Number(salvo.pontos || 0))) };
    } catch (erro) {
      return { pontos: 0 };
    }
  }

  function nivelDoRitmo(pontos) {
    if (pontos >= 7) return 3;
    if (pontos >= 3) return 2;
    return 1;
  }

  function nomeDoRitmo(nivel) {
    if (nivel >= 3) return "Prática completa";
    if (nivel >= 2) return "Mais prática";
    return "Passo a passo";
  }

  const ritmo = carregarRitmo();
  let nivelRitmo = nivelDoRitmo(ritmo.pontos);
  const extrasIncluidos = new Set();

  function salvarRitmo() {
    try { localStorage.setItem(CHAVE_RITMO, JSON.stringify(ritmo)); } catch (erro) {}
  }

  function adicionarExtrasAteNivel(nivel) {
    const extras = ATIVIDADES_ADAPTATIVAS[aulaSlug] || [];
    let adicionadas = 0;
    extras.forEach(function (extra) {
      if (extra.nivelMinimo > nivel || extrasIncluidos.has(extra.id)) return;
      atividades.push({ ...extra, adaptativa: true });
      extrasIncluidos.add(extra.id);
      adicionadas += 1;
    });
    return adicionadas;
  }

  adicionarExtrasAteNivel(nivelRitmo);

  function atualizarIndicadorRitmo(mensagemExtra) {
    if (!indicadorRitmo) return;
    indicadorRitmo.innerHTML = `<span>Treino no seu ritmo</span><strong>${nomeDoRitmo(nivelRitmo)}</strong><small>${mensagemExtra || "Áudio e dicas continuam disponíveis."}</small>`;
  }

  atualizarIndicadorRitmo();

  function registrarDesempenhoDaAtividade() {
    const nivelAntes = nivelRitmo;
    if (tentativasAtividade === 0 && !dicaUsadaAtividade) {
      ritmo.pontos = Math.min(10, ritmo.pontos + 1);
    } else if (tentativasAtividade >= 2) {
      ritmo.pontos = Math.max(0, ritmo.pontos - 1);
    }
    salvarRitmo();
    nivelRitmo = nivelDoRitmo(ritmo.pontos);

    if (nivelRitmo > nivelAntes) {
      const novas = adicionarExtrasAteNivel(nivelRitmo);
      const mensagem = novas > 0
        ? "Você está indo muito bem. Acrescentei um treino um pouco mais completo, mas as dicas continuam aqui."
        : "Você está indo muito bem. Vamos continuar praticando no seu ritmo.";
      atualizarIndicadorRitmo(mensagem);
      return mensagem;
    }

    atualizarIndicadorRitmo();
    return "";
  }

  for (let i = 0; i < Math.min(indicePasso, totalPassos); i += 1) {
    passosConcluidos.add(i);
  }

  function normalizarTexto(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  const BASE_ICONES_SIMULADOR = "/static/img/icones/simulador/";

  const CATALOGO_ICONES_SIMULADOR = [
    // Aplicativos e serviços conhecidos: ficam primeiro para evitar ícones genéricos.
    { termos: ["whatsapp"], arquivo: "whatsapp.svg" },
    { termos: ["instagram"], arquivo: "instagram.svg" },
    { termos: ["facebook"], arquivo: "facebook.svg" },
    { termos: ["youtube"], arquivo: "youtube.svg" },
    { termos: ["gmail", "e-mail", "email"], arquivo: "gmail.svg" },
    { termos: ["google chrome", "chrome"], arquivo: "chrome.svg" },
    { termos: ["google", "pesquisa google"], arquivo: "google.svg" },
    { termos: ["google maps", "mapas", "maps"], arquivo: "maps.svg" },
    { termos: ["uber"], arquivo: "uber.svg" },
    { termos: ["carteira de trabalho", "ctps"], arquivo: "ctps.svg" },
    { termos: ["meu inss"], arquivo: "inss.svg" },
    { termos: ["gov.br", "gov br"], arquivo: "govbr.svg" },
    { termos: ["meu sus", "sus digital"], arquivo: "health.svg" },

    // Funções do aparelho e do celular de treinamento.
    { termos: ["virar camera"], arquivo: "rotate-camera.svg" },
    { termos: ["tirar foto"], arquivo: "shutter.svg" },
    { termos: ["foto da familia.jpg"], arquivo: "file-image.svg" },
    { termos: ["receitas.txt"], arquivo: "file-text.svg" },
    { termos: ["meus documentos"], arquivo: "folder.svg" },
    { termos: ["bloco de notas"], arquivo: "notes.svg" },
    { termos: ["mensagens", "sms"], arquivo: "messages.svg" },
    { termos: ["meus exames"], arquivo: "exams.svg" },
    { termos: ["agendar consulta"], arquivo: "calendar.svg" },
    { termos: ["dr. antonio", "dr antonio"], arquivo: "doctor.svg" },
    { termos: ["grupo da igreja", "grupo da familia"], arquivo: "group.svg" },
    { termos: ["joao (neto)", "maria (filha)", "vizinha ana"], arquivo: "person.svg" },
    { termos: ["tela e brilho", "brilho"], arquivo: "brightness.svg" },
    { termos: ["clipe", "anexar"], arquivo: "attach.svg" },
    { termos: ["microfone"], arquivo: "microphone.svg" },
    { termos: ["localizacao"], arquivo: "location.svg" },
    { termos: ["documento"], arquivo: "document.svg" },
    { termos: ["contatos"], arquivo: "contacts.svg" },
    { termos: ["recentes"], arquivo: "recent.svg" },
    { termos: ["teclado"], arquivo: "dialpad.svg" },
    { termos: ["recusar"], arquivo: "decline.svg" },
    { termos: ["atender"], arquivo: "answer.svg" },
    { termos: ["lixeira"], arquivo: "trash.svg" },
    { termos: ["navegador"], arquivo: "chrome.svg" },
    { termos: ["ajustes", "configuracoes"], arquivo: "settings.svg" },
    { termos: ["camera"], arquivo: "camera.svg" },
    { termos: ["telefone", "ligacoes"], arquivo: "phone.svg" },
    { termos: ["fotos", "galeria"], arquivo: "photos.svg" },
    { termos: ["wifi", "wi-fi"], arquivo: "wifi.svg" },
    { termos: ["bluetooth"], arquivo: "bluetooth.svg" },
    { termos: ["sons", "volume"], arquivo: "volume.svg" },
    { termos: ["pix"], arquivo: "pix.svg" },
    { termos: ["saldo"], arquivo: "balance.svg" },
    { termos: ["cartoes"], arquivo: "card.svg" },
    { termos: ["meu banco", "banco"], arquivo: "bank.svg" },
    { termos: ["vacinas"], arquivo: "vaccine.svg" },
    { termos: ["saude"], arquivo: "health.svg" },
    { termos: ["receitas"], arquivo: "prescription.svg" },
    { termos: ["flash"], arquivo: "flash.svg" }
  ];

  function detectarArquivoIcone(rotulo) {
    const texto = normalizarTexto(rotulo);
    const item = CATALOGO_ICONES_SIMULADOR.find(function (entrada) {
      return entrada.termos.some(function (termo) { return texto.includes(termo); });
    });
    return item ? item.arquivo : "generic.svg";
  }

  function aplicarIconesReais(contexto) {
    if (!contexto) return;

    contexto.querySelectorAll(".aula-simulador .item.icone, .atividade-celular .item.icone").forEach(function (item) {
      const rotuloEl = item.querySelector(".rot");
      const rotulo = rotuloEl ? rotuloEl.textContent : item.textContent;
      const arquivo = detectarArquivoIcone(rotulo);

      item.classList.add("item-icone-real");

      const emoji = item.querySelector(".emoji");
      if (emoji) {
        emoji.setAttribute("aria-hidden", "true");
        emoji.style.display = "none";
      }

      let icone = item.querySelector(".app-icon");
      if (!icone) {
        icone = document.createElement("span");
        item.insertBefore(icone, item.firstChild);
      }
      icone.className = "app-icon app-icon-imagem";
      icone.setAttribute("aria-hidden", "true");
      icone.replaceChildren();

      const imagem = document.createElement("img");
      imagem.src = `${BASE_ICONES_SIMULADOR}${arquivo}`;
      imagem.alt = "";
      imagem.loading = "eager";
      imagem.decoding = "async";
      icone.appendChild(imagem);
    });

    // Em telas de aplicativos reais, mostra também o símbolo reconhecível no topo.
    contexto.querySelectorAll(".aula-simulador .barra .tit, .atividade-celular .barra .tit").forEach(function (titulo) {
      if (titulo.querySelector(".app-icon-barra")) return;
      const arquivo = detectarArquivoIcone(titulo.textContent);
      if (arquivo === "generic.svg") return;
      const mini = document.createElement("img");
      mini.src = `${BASE_ICONES_SIMULADOR}${arquivo}`;
      mini.alt = "";
      mini.className = "app-icon-barra";
      mini.setAttribute("aria-hidden", "true");
      titulo.prepend(mini);
    });
  }

  function animarCenaSimulador(contexto) {
    if (!contexto) return;

    const moldura = contexto.querySelector(".aula-simulador .moldura, .atividade-celular");
    const itens = Array.from(contexto.querySelectorAll(".aula-simulador .item, .atividade-opcao"));

    if (moldura) {
      moldura.classList.remove("cena-entrada-ativa");
      void moldura.offsetWidth;
      moldura.classList.add("cena-entrada-ativa");
    }

    itens.forEach(function (item, indice) {
      item.classList.remove("entrada-esquerda-direita");
      item.style.setProperty("--entrada-delay", `${160 + (indice * 120)}ms`);
      void item.offsetWidth;
      item.classList.add("entrada-esquerda-direita");
    });
  }

  function percentual() {
    const total = totalPassos + atividades.length;
    if (!total) return 100;
    return Math.round(((passosConcluidos.size + respostasCertas) / total) * 100);
  }

  function atualizarProgresso() {
    const valor = Math.min(100, percentual());
    barra.style.width = `${valor}%`;
    numero.textContent = `${valor}%`;

    if (valor === 0) {
      mensagem.textContent = "Vamos com calma. Uma coisa de cada vez.";
    } else if (valor < 50) {
      mensagem.textContent = "Muito bem! Você já começou. Continue assim.";
    } else if (valor < 100) {
      mensagem.textContent = "Você está indo muito bem. Falta pouco.";
    } else {
      mensagem.textContent = "Parabéns! Aula concluída.";
    }
  }

  async function salvarPasso(passo) {
    try {
      await fetch("/api/progresso-aula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aula_slug: aulaSlug, passo: passo })
      });
    } catch (erro) {
      // O estudo continua mesmo se a conexão cair por alguns segundos.
    }
  }

  function prepararItensClicaveis(passo) {
    const itens = passo.querySelectorAll(".item");
    let tentativasPasso = 0;

    function ajudaProgressiva() {
      const feedback = passo.querySelector("[data-feedback-passo]");
      const dica = passo.querySelector("[data-dica-passo]");
      const alvo = passo.querySelector(".item.alvo");
      const textoDica = dica?.textContent.trim() || "Procure com calma a opção indicada na instrução.";

      if (tentativasPasso === 1) {
        if (feedback) feedback.textContent = "Quase. Não tem problema. Leia o nome dos botões com calma e tente novamente.";
        if (modoAula === "guiado") falar("Quase. Não tem problema. Leia o nome dos botões com calma e tente novamente.");
        return;
      }

      if (dica) {
        dica.hidden = false;
        dica.classList.add("visivel");
      }

      if (tentativasPasso === 2) {
        if (feedback) feedback.textContent = `Vou ajudar mais: ${textoDica}`;
        falar(`Vou dar uma dica. ${textoDica}`);
        return;
      }

      if (alvo) {
        alvo.classList.add("alvo-destaque-extra");
        alvo.focus({ preventScroll: true });
        setTimeout(function () { alvo.classList.remove("alvo-destaque-extra"); }, 2200);
      }
      if (feedback) feedback.textContent = "Vou mostrar onde fica. Procure a opção que está destacada e toque nela.";
      falar("Vou mostrar onde fica. Procure a opção destacada e toque nela.");
    }

    itens.forEach(function (item) {
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
      item.setAttribute("aria-label", `Opção ${item.innerText.trim()}`);

      function escolher() {
        if (item.classList.contains("alvo")) {
          item.classList.add("item-acerto");
          passo.classList.add("passo-liberado");
          passosConcluidos.add(Number(passo.dataset.passo) - 1);

          const feedback = passo.querySelector("[data-feedback-passo]");
          if (feedback) {
            feedback.textContent = "Muito bem! É exatamente aqui. Agora você pode ir para o próximo passo.";
          }
          if (modoAula === "guiado") falar("Muito bem. É exatamente aqui.");

          if (passo === passos[indicePasso]) {
            btnProximo.disabled = false;
          }

          atualizarProgresso();
          salvarPasso(Math.min(totalPassos + 1, Number(passo.dataset.passo) + 1));
        } else {
          tentativasPasso += 1;
          item.classList.remove("item-tentativa");
          void item.offsetWidth;
          item.classList.add("item-tentativa");
          ajudaProgressiva();
        }
      }

      item.addEventListener("click", escolher);
      item.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          escolher();
        }
      });
    });
  }

  passos.forEach(prepararItensClicaveis);
  passos.forEach(aplicarIconesReais);

  function falar(texto) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = "pt-BR";
    fala.rate = 0.9;
    window.speechSynthesis.speak(fala);
  }

  function definirModoAula(novoModo, anunciar) {
    modoAula = novoModo === "sozinho" ? "sozinho" : "guiado";
    pagina.dataset.modoAula = modoAula;
    botoesModoAula.forEach(function (botao) {
      const ativo = botao.dataset.modoAula === modoAula;
      botao.classList.toggle("ativo", ativo);
      botao.setAttribute("aria-pressed", ativo ? "true" : "false");
    });
    if (anunciar) {
      falar(modoAula === "guiado"
        ? "Modo fazer comigo ativado. Eu vou explicar cada passo e sempre haverá dicas disponíveis."
        : "Modo tentar sozinho ativado. Você continua podendo ouvir, pedir uma dica ou pedir para eu mostrar onde tocar.");
    }
  }

  if (btnOuvirObjetivo) {
    btnOuvirObjetivo.addEventListener("click", function () {
      falar(`Sua missão de hoje. ${objetivoAula}`);
    });
  }

  botoesModoAula.forEach(function (botao) {
    botao.addEventListener("click", function () {
      definirModoAula(botao.dataset.modoAula, true);
    });
  });

  document.querySelectorAll("[data-ver-dica-passo]").forEach(function (botao) {
    botao.addEventListener("click", function () {
      const passo = botao.closest(".aula-passo");
      const dica = passo?.querySelector("[data-dica-passo]");
      if (!dica) return;
      dica.hidden = false;
      dica.classList.add("visivel");
      falar(`Dica. ${dica.textContent.trim()}`);
    });
  });

  document.querySelectorAll("[data-ouvir-explicacao]").forEach(function (botao) {
    botao.addEventListener("click", function () {
      const passo = botao.closest(".aula-passo");
      const titulo = passo.querySelector("h2")?.textContent || "";
      const narracao = passo.querySelector(".aula-passo-narracao")?.textContent || "";
      const dica = passo.querySelector(".aula-passo-dica")?.textContent || "";
      falar(`${titulo}. ${narracao}. ${dica}`);
    });
  });

  document.querySelectorAll("[data-focar-simulador]").forEach(function (botao) {
    botao.addEventListener("click", function () {
      const passo = botao.closest(".aula-passo");
      const alvo = passo.querySelector(".item.alvo");
      if (alvo) {
        alvo.focus();
        alvo.classList.add("alvo-destaque-extra");
        setTimeout(function () { alvo.classList.remove("alvo-destaque-extra"); }, 1300);
      }
    });
  });

  function esconderTudo() {
    passos.forEach(function (passo) { passo.hidden = true; });
    secaoAtividade.hidden = true;
    secaoConcluida.hidden = true;
  }

  function mostrarPasso(indice) {
    esconderTudo();
    indicePasso = Math.max(0, Math.min(indice, totalPassos - 1));
    const passo = passos[indicePasso];
    passo.hidden = false;
    aplicarIconesReais(passo);
    animarCenaSimulador(passo);

    btnAnterior.disabled = indicePasso === 0;
    btnProximo.textContent = indicePasso === totalPassos - 1 ? "Ir para as atividades" : "Próximo passo";
    btnProximo.disabled = !passosConcluidos.has(indicePasso);
    navegacao.hidden = false;
    instrucaoRodape.hidden = false;
    instrucaoRodape.textContent = btnProximo.disabled
      ? "Clique no lugar indicado no celular para liberar o próximo passo."
      : (indicePasso === totalPassos - 1
          ? "Muito bem. A aula terminou. Agora vamos para as atividades."
          : "Muito bem. Você já pode seguir para o próximo passo.");

    const alvo = passo.querySelector(".item.alvo");
    if (alvo) setTimeout(function () { alvo.focus({ preventScroll: true }); }, 80);
    atualizarProgresso();

    if (modoAula === "guiado") {
      const titulo = passo.querySelector("h2")?.textContent || "";
      const narracao = passo.querySelector(".aula-passo-narracao")?.textContent || "";
      setTimeout(function () { falar(`${titulo}. ${narracao}`); }, 350);
    }
  }

  function textoDaAtividade(questao) {
    const partes = [questao.enunciado || ""];
    if (Array.isArray(questao.alternativas)) {
      questao.alternativas.forEach(function (alt) {
        partes.push(`${alt.letra}. ${alt.texto}`);
      });
    }
    return partes.join(". ");
  }

  function mostrarDicaAtual(falarDica) {
    dicaUsadaAtividade = true;
    const questao = atividades[perguntaAtual];
    if (!questao || !atividadeDica) return;

    let texto = questao.dica || "Vá com calma. Leia a pergunta novamente e procure a opção que combina com a situação.";
    if (tentativasAtividade >= 2 && questao.tipo === "digitacao" && questao.resposta) {
      texto += ` Se precisar, use este modelo: ${questao.resposta}.`;
    }

    atividadeDica.hidden = false;
    atividadeDica.textContent = `Dica: ${texto}`;
    if (falarDica) falar(texto);

    if (tentativasAtividade >= 2 && questao.correta) {
      const correta = atividadeOpcoes.querySelector(`[data-letra="${questao.correta}"]`);
      if (correta) correta.classList.add("dica-destaque");
    }
  }

  function normalizarRespostaAtividade(valor, questao) {
    if (questao.comparacao === "numeros") {
      return String(valor || "").replace(/\D/g, "");
    }
    if (questao.comparacao === "url") {
      return normalizarTexto(valor)
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/$/, "")
        .replace(/\s+/g, "");
    }
    return normalizarTexto(valor).replace(/\s+/g, " ");
  }

  function marcarAtividadeCorreta(questao) {
    atividadeFeedback.hidden = false;
    atividadeFeedback.className = "atividade-feedback correta";
    const mensagemRitmo = registrarDesempenhoDaAtividade();
    atividadeFeedback.textContent = `Muito bem! ${questao.explicacao || "Você conseguiu."}${mensagemRitmo ? " " + mensagemRitmo : ""}`;
    respostasCertas = Math.max(respostasCertas, perguntaAtual + 1);
    btnProximo.disabled = false;
    btnProximo.textContent = perguntaAtual === atividades.length - 1 ? "Concluir aula →" : "Próxima atividade";
    atualizarProgresso();
  }

  function renderizarAtividadeDigitacao(questao) {
    const bloco = document.createElement("div");
    bloco.className = "atividade-digitacao";

    const label = document.createElement("label");
    label.className = "atividade-digitacao-label";
    label.htmlFor = "atividadeRespostaDigitada";
    label.textContent = questao.tipo === "digitacao-palavras" ? "Escreva com suas palavras:" : "Digite aqui:";

    const linha = document.createElement("div");
    linha.className = "atividade-digitacao-linha";

    const input = document.createElement("input");
    input.id = "atividadeRespostaDigitada";
    input.className = "atividade-digitacao-input";
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.inputMode = questao.inputmode || (questao.comparacao === "numeros" ? "numeric" : "text");
    input.placeholder = questao.placeholder || "Toque aqui e digite";
    input.setAttribute("aria-describedby", "atividadeDica atividadeFeedback");

    const voz = document.createElement("button");
    voz.type = "button";
    voz.className = "atividade-voz-btn";
    voz.textContent = "🎤";
    voz.title = "Falar em vez de digitar";
    voz.setAttribute("aria-label", "Falar em vez de digitar");

    const statusVoz = document.createElement("p");
    statusVoz.className = "atividade-voz-status";
    statusVoz.hidden = true;

    const Reconhecimento = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Reconhecimento) {
      voz.hidden = true;
    } else {
      voz.addEventListener("click", function () {
        const reconhecimento = new Reconhecimento();
        reconhecimento.lang = "pt-BR";
        reconhecimento.interimResults = false;
        reconhecimento.maxAlternatives = 1;
        statusVoz.hidden = false;
        statusVoz.textContent = "Pode falar. Estou ouvindo...";
        voz.disabled = true;
        reconhecimento.onresult = function (evento) {
          const texto = evento.results?.[0]?.[0]?.transcript || "";
          input.value = texto;
          statusVoz.textContent = `Eu ouvi: ${texto}. Confira e, se estiver certo, toque em conferir.`;
          input.focus();
        };
        reconhecimento.onerror = function () {
          statusVoz.textContent = "Não consegui ouvir bem. Você pode tentar de novo ou digitar devagar.";
        };
        reconhecimento.onend = function () { voz.disabled = false; };
        reconhecimento.start();
      });
    }

    const conferir = document.createElement("button");
    conferir.type = "button";
    conferir.className = "atividade-digitacao-conferir";
    conferir.textContent = "Conferir o que digitei";

    function validar() {
      const digitado = normalizarRespostaAtividade(input.value, questao);
      const respostasAceitas = (questao.aceitar && questao.aceitar.length ? questao.aceitar : (questao.resposta ? [questao.resposta] : []))
        .map(function (valor) { return normalizarRespostaAtividade(valor, questao); });

      const respostaLivreValida = questao.tipo === "digitacao-palavras"
        ? (digitado.length >= Number(questao.minimo_caracteres || 8) && (questao.palavras_chave || []).every(function (grupo) {
            const termos = Array.isArray(grupo) ? grupo : [grupo];
            return termos.some(function (termo) { return digitado.includes(normalizarTexto(termo)); });
          }))
        : false;

      if ((respostasAceitas.includes(digitado) && digitado) || respostaLivreValida) {
        input.disabled = true;
        conferir.disabled = true;
        voz.disabled = true;
        input.classList.add("correta");
        marcarAtividadeCorreta(questao);
        if (modoAula === "guiado") falar("Muito bem. Você digitou corretamente.");
        return;
      }

      tentativasAtividade += 1;
      atividadeFeedback.hidden = false;
      atividadeFeedback.className = "atividade-feedback errada";
      atividadeFeedback.textContent = tentativasAtividade === 1
        ? "Quase. Não precisa apagar tudo. Confira letra por letra e tente novamente."
        : "Vamos facilitar. Use a dica abaixo e corrija somente o que estiver diferente.";
      mostrarDicaAtual(tentativasAtividade >= 2);
      input.classList.remove("atividade-tentativa");
      void input.offsetWidth;
      input.classList.add("atividade-tentativa");
      input.focus();
    }

    conferir.addEventListener("click", validar);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        validar();
      }
    });

    linha.append(input, voz);
    bloco.append(label, linha, statusVoz, conferir);
    atividadeOpcoes.appendChild(bloco);
    setTimeout(function () { input.focus({ preventScroll: true }); }, 100);
  }

  function renderizarAtividadeEscolha(questao) {
    questao.alternativas.forEach(function (alternativa) {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "atividade-opcao";
      botao.dataset.letra = alternativa.letra;
      botao.innerHTML = `<span>${alternativa.letra}</span><strong>${alternativa.texto}</strong>`;
      botao.addEventListener("click", function () {
        if (alternativa.letra === questao.correta) {
          atividadeOpcoes.querySelectorAll("button").forEach(function (b) { b.disabled = true; });
          botao.classList.add("correta");
          marcarAtividadeCorreta(questao);
        } else {
          tentativasAtividade += 1;
          botao.classList.add("errada");
          atividadeFeedback.hidden = false;
          atividadeFeedback.className = "atividade-feedback errada";
          atividadeFeedback.textContent = tentativasAtividade === 1
            ? "Ainda não. Pode tentar outra opção sem medo."
            : "Tudo bem. Vou dar uma dica mais clara para ajudar você.";
          if (modoAula === "guiado") falar(atividadeFeedback.textContent);
          mostrarDicaAtual(tentativasAtividade >= 2);
          setTimeout(function () { botao.classList.remove("errada"); }, 900);
        }
      });
      atividadeOpcoes.appendChild(botao);
    });
  }

  function renderizarAtividade() {
    esconderTudo();
    secaoAtividade.hidden = false;
    navegacao.hidden = false;
    instrucaoRodape.hidden = false;

    const questao = atividades[perguntaAtual];
    if (!questao) {
      concluirAula();
      return;
    }

    tentativasAtividade = 0;
    dicaUsadaAtividade = false;
    atualizarIndicadorRitmo();
    atividadeNumero.textContent = `ATIVIDADE ${perguntaAtual + 1} DE ${atividades.length}`;
    atividadePergunta.textContent = questao.enunciado;
    atividadeContador.textContent = `${perguntaAtual + 1} / ${atividades.length}`;
    atividadeFeedback.hidden = true;
    atividadeFeedback.textContent = "";
    atividadeFeedback.className = "atividade-feedback";
    if (atividadeDica) {
      atividadeDica.hidden = true;
      atividadeDica.textContent = "";
    }
    atividadeOpcoes.innerHTML = "";

    if (questao.tipo === "digitacao" || questao.tipo === "digitacao-palavras") {
      renderizarAtividadeDigitacao(questao);
    } else {
      renderizarAtividadeEscolha(questao);
    }

    btnAnterior.disabled = false;
    btnProximo.disabled = true;
    btnProximo.textContent = perguntaAtual === atividades.length - 1 ? "Concluir aula →" : "Próxima atividade";
    instrucaoRodape.textContent = (questao.tipo === "digitacao" || questao.tipo === "digitacao-palavras")
      ? "Digite com calma. Se precisar, ouça a pergunta ou peça uma dica."
      : "Escolha uma resposta. Você pode ouvir e pedir dicas quantas vezes precisar.";
    animarCenaSimulador(secaoAtividade);
    atualizarProgresso();
    if (modoAula === "guiado") {
      setTimeout(function () { falar(textoDaAtividade(questao)); }, 350);
    }
  }

  if (btnDicaAtividade) {
    btnDicaAtividade.addEventListener("click", function () {
      mostrarDicaAtual(true);
    });
  }

  if (btnOuvirAtividade) {
    btnOuvirAtividade.addEventListener("click", function () {
      const questao = atividades[perguntaAtual];
      if (questao) falar(textoDaAtividade(questao));
    });
  }

  async function concluirAula() {
    try {
      const resposta = await fetch("/api/concluir-aula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aula_slug: aulaSlug })
      });
      const dados = await resposta.json();
      esconderTudo();
      navegacao.hidden = true;
      instrucaoRodape.hidden = true;
      secaoConcluida.hidden = false;
      barra.style.width = "100%";
      numero.textContent = "100%";
      mensagem.textContent = "Parabéns! Aula concluída.";
      if (dados.proxima_url) {
        irProximaAula.href = dados.proxima_url;
        irProximaAula.textContent = dados.fim ? "Ver todas as aulas →" : `Próxima aula: ${dados.proxima_titulo} →`;
      }
    } catch (erro) {
      atividadeFeedback.textContent = "A aula foi concluída, mas não conseguimos salvar agora. Tente novamente em alguns segundos.";
    }
  }

  btnProximo.addEventListener("click", function () {
    if (indicePasso < totalPassos) {
      if (indicePasso < totalPassos - 1) {
        mostrarPasso(indicePasso + 1);
      } else {
        indicePasso = totalPassos;
        salvarPasso(totalPassos + 1);
        perguntaAtual = 0;
        renderizarAtividade();
      }
      return;
    }

    if (perguntaAtual < atividades.length - 1) {
      perguntaAtual += 1;
      renderizarAtividade();
    } else {
      concluirAula();
    }
  });

  btnAnterior.addEventListener("click", function () {
    if (indicePasso === totalPassos) {
      if (perguntaAtual > 0) {
        perguntaAtual -= 1;
        renderizarAtividade();
      } else {
        mostrarPasso(totalPassos - 1);
      }
      return;
    }
    if (indicePasso > 0) mostrarPasso(indicePasso - 1);
  });

  btnRecomecar.addEventListener("click", function () {
    passosConcluidos.clear();
    respostasCertas = 0;
    perguntaAtual = 0;
    tentativasAtividade = 0;
    dicaUsadaAtividade = false;
    atualizarIndicadorRitmo();
    passos.forEach(function (passo) {
      passo.classList.remove("passo-liberado");
      passo.querySelectorAll(".item").forEach(function (item) {
        item.classList.remove("item-acerto", "item-tentativa", "alvo-destaque-extra");
      });
      const feedback = passo.querySelector("[data-feedback-passo]");
      if (feedback) feedback.textContent = "Pode clicar sem medo — aqui nada quebra e nada é de verdade.";
      const dica = passo.querySelector("[data-dica-passo]");
      if (dica) { dica.hidden = true; dica.classList.remove("visivel"); }
    });
    salvarPasso(1);
    mostrarPasso(0);
  });

  definirModoAula("guiado", false);

  if (passoInicial > totalPassos) {
    indicePasso = totalPassos;
    perguntaAtual = 0;
    renderizarAtividade();
  } else {
    mostrarPasso(indicePasso);
  }
});
