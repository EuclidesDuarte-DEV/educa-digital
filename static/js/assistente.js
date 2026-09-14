(function () {
  "use strict";

  const STORAGE_ATIVO = "educa_assistente_super_ativo";
  const STORAGE_HISTORICO = "educa_assistente_super_historico";
  const STORAGE_CUMPRIMENTOU = "educa_assistente_super_cumprimentou";
  const STORAGE_TERMOS = "educa_assistente_termos_aprendidos";
  const STORAGE_VOZ = "educa_assistente_voz_preferida";
  const STORAGE_VOZ_NEURAL = "educa_assistente_voz_neural";
  const STORAGE_TELA_ANTERIOR = "educa_assistente_tela_anterior";

  let ativo = false;
  let falando = false;
  let processando = false;
  let stream = null;
  let audioCtx = null;
  let analyser = null;
  let source = null;
  let rafId = 0;
  let recorder = null;
  let chunks = [];
  let gravando = false;
  let inicioFala = 0;
  let ultimoSom = 0;
  let framesComSom = 0;
  let ultimaFala = "";
  let taxaVoz = Number(localStorage.getItem("educa_assistente_velocidade") || "1.02");

  window.addEventListener("educa:velocidade-voz",(evento)=>{
    const valor=Number(evento?.detail?.valor);
    if(Number.isFinite(valor))taxaVoz=Math.max(.84,Math.min(1.15,valor));
  });

  let estadoTelaAtual = null;
  let versaoTela = 0;
  let observadorTela = null;
  let filaAudioNeural = [];
  let tocandoAudioNeural = false;
  let audioNeuralAtual = null;
  let ttsNeuralDisponivel = null;

  let reconhecimentoBrowser = null;
  let textoBrowser = "";
  let textoBrowserInterino = "";

  const LIMIAR_SOM = 0.010;
  const FRAMES_PARA_INICIAR = 2;
  const SILENCIO_PARA_ENVIAR = 1400;
  const MIN_GRAVACAO = 900;
  const MAX_GRAVACAO = 18000;

  function textoLimpo(v) { return String(v || "").replace(/\s+/g, " ").trim(); }
  function normalizar(v) { return textoLimpo(v).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }

  function limparParaVoz(v){
    let t=String(v||"");

    // Markdown e símbolos que o sintetizador poderia ler em voz alta.
    t=t.replace(/```[\s\S]*?```/g," ");
    t=t.replace(/`([^`]+)`/g,"$1");
    t=t.replace(/\[([^\]]+)\]\((?:[^)]+)\)/g,"$1");
    t=t.replace(/!\[([^\]]*)\]\((?:[^)]+)\)/g,"$1");
    t=t.replace(/^\s{0,3}#{1,6}\s*/gm,"");
    t=t.replace(/^\s*[-*•]\s+/gm,"");
    t=t.replace(/^\s*\d+[.)]\s+/gm,"");
    t=t.replace(/\*\*([^*]+)\*\*/g,"$1");
    t=t.replace(/__([^_]+)__/g,"$1");
    t=t.replace(/\*([^*]+)\*/g,"$1");
    t=t.replace(/_([^_]+)_/g,"$1");
    t=t.replace(/[>*#`]+/g," ");

    // Evita que caminhos internos e URLs sejam lidos de forma robótica.
    t=t.replace(/https?:\/\/\S+/gi,"um link");
    t=t.replace(/\b(?:localhost|127\.0\.0\.1)(?::\d+)?\S*/gi,"o site");
    t=t.replace(/(^|\s)\/(?:[a-z0-9_-]+\/?)+/gi,"$1");

    // Pequenas trocas para a voz brasileira soar mais natural.
    t=t.replace(/\bWi[- ]?Fi\b/gi,"uai fai");
    t=t.replace(/\bEduca\+\b/gi,"Educa mais");
    t=t.replace(/\be-mail\b/gi,"email");
    t=t.replace(/\bWhatsApp\b/gi,"WhatsApp");
    t=t.replace(/\bPix\b/g,"Pix");

    // Remove restos de notação que não fazem sentido em uma conversa por voz.
    t=t.replace(/[{}\[\]<>|\\]/g," ");
    t=t.replace(/\s*[:]{2,}\s*/g," ");
    t=t.replace(/\s*[=]{2,}\s*/g," ");

    return textoLimpo(t)
      .replace(/\s+([,.;!?])/g,"$1")
      .replace(/([,.;!?])(?=[^\s])/g,"$1 ");
  }


  function elementoVisivel(el) {
    if (!el) return false;
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return s.display !== "none" && s.visibility !== "hidden" && r.width > 0 && r.height > 0;
  }

  function nomeTelaPeloCaminho(pathname){
    const p=String(pathname||"/").toLowerCase();

    const mapa=[
      [/^\/cadastro\/?$/,"Cadastro"],
      [/^\/login\/?$/,"Entrar"],
      [/^\/conta-pronta\/?$/,"Conta pronta"],
      [/^\/recuperar-conta\/?$/,"Recuperar conta"],
      [/^\/perfil\/?$/,"Perfil"],
      [/^\/estudos\/todos\/?$/,"Todas as aulas"],
      [/^\/estudos\/?$/,"Estudos"],
      [/^\/trilhas\/?$/,"Trilhas"],
      [/^\/trilha\//,"Trilha de estudo"],
      [/^\/aula\//,"Aula"],
      [/^\/continuar-aula\/?$/,"Continuar aula"],
      [/^\/como-funciona\/?$/,"Como funciona"],
      [/^\/sobre\/?$/,"Sobre o Educa+"],
      [/^\/inicio-aluno\/?$/,"Início do aluno"],
      [/^\/$/,"Início"]
    ];

    const achado=mapa.find(([re])=>re.test(p));
    if(achado)return achado[1];

    const h1=textoLimpo(document.querySelector("main h1, h1")?.textContent);
    return h1||document.title||"Página atual";
  }

  function rotuloCampo(el){
    if(!el)return "";

    const id=el.id;
    let label="";

    if(id){
      try{
        label=textoLimpo(document.querySelector(`label[for="${CSS.escape(id)}"]`)?.innerText);
      }catch(_){}
    }

    if(!label){
      label=textoLimpo(el.closest("label")?.innerText);
    }

    if(!label){
      label=textoLimpo(
        el.getAttribute("aria-label")
        || el.getAttribute("placeholder")
        || el.getAttribute("name")
      );
    }

    // Remove textos enormes de labels que envolvem outros elementos.
    return label.slice(0,90);
  }

  function estadoCampo(el){
    const tipo=(el.type||el.tagName||"campo").toLowerCase();

    if(tipo==="checkbox"||tipo==="radio"){
      return el.checked?"marcado":"não marcado";
    }

    if(el.tagName==="SELECT"){
      return el.selectedIndex>0?"preenchido":"vazio";
    }

    // O valor NUNCA é devolvido. Só o estado.
    return String(el.value||"").trim()?"preenchido":"vazio";
  }

  function descricaoCamposVisiveis(){
    const campos=[];

    document.querySelectorAll("input,select,textarea").forEach(el=>{
      if(!elementoVisivel(el))return;
      if((el.type||"").toLowerCase()==="hidden")return;
      if(el.closest("#painelAcessibilidade"))return;

      const rotulo=rotuloCampo(el)||"Campo sem nome";
      const tipo=(el.type||el.tagName||"campo").toLowerCase();
      const requerido=el.required?"obrigatório":"opcional";
      const situacao=estadoCampo(el);

      campos.push(`${rotulo} (${tipo}, ${requerido}, ${situacao})`);
    });

    return campos.slice(0,14);
  }

  function campoEmFoco(){
    const el=document.activeElement;
    if(!el||!el.matches?.("input,select,textarea,button,a,[role='button']"))return "nenhum";

    if(el.matches("input,select,textarea")){
      return `${rotuloCampo(el)||"campo"} — ${estadoCampo(el)}`;
    }

    return textoLimpo(
      el.getAttribute("aria-label")
      || el.innerText
      || el.textContent
    ).slice(0,100)||"nenhum";
  }

  function avisosVisiveis(){
    const avisos=[];

    document.querySelectorAll(
      ".mensagens, .alert, .erro, .error, .aviso, [role='alert'], .flash, .mensagem"
    ).forEach(el=>{
      if(!elementoVisivel(el))return;
      const t=textoLimpo(el.innerText||el.textContent);
      if(t&&t.length<300&&!avisos.includes(t))avisos.push(t);
    });

    return avisos.slice(0,4);
  }

  function capturarTelaAtual(motivo="consulta"){
    versaoTela+=1;

    const nome=nomeTelaPeloCaminho(location.pathname);
    const h1=textoLimpo(document.querySelector("main h1, h1")?.textContent);
    const anterior=sessionStorage.getItem(STORAGE_TELA_ANTERIOR)||"";
    const mudou=Boolean(anterior&&anterior!==location.pathname);

    const textos=[];
    const acoes=[];

    const seletor=[
      "main h1","main h2","main h3","main p",
      "label","summary","button","a","[role='button']",
      ".aula-passo",".atividade-texto",".atividade-opcao"
    ].join(",");

    document.querySelectorAll(seletor).forEach(el=>{
      if(!elementoVisivel(el))return;
      if(el.closest("#painelAcessibilidade")||el.closest(".assistente-local-status"))return;

      let t=textoLimpo(
        el.getAttribute("aria-label")
        || el.innerText
        || el.textContent
      );

      if(!t||t.length<2)return;
      if(t.length>220)t=t.slice(0,220)+"…";

      if(!textos.includes(t))textos.push(t);
      if(el.matches("button,a,[role='button'],summary")&&!acoes.includes(t))acoes.push(t);
    });

    const campos=descricaoCamposVisiveis();
    const avisos=avisosVisiveis();

    estadoTelaAtual={
      versao:versaoTela,
      motivo,
      nome,
      pathname:location.pathname,
      titulo:document.title,
      h1,
      mudou,
      anterior,
      foco:campoEmFoco(),
      campos,
      acoes:acoes.slice(0,16),
      textos:textos.slice(0,20),
      avisos,
      capturadaEm:Date.now()
    };

    sessionStorage.setItem(STORAGE_TELA_ANTERIOR,location.pathname);
    return estadoTelaAtual;
  }

  function contextoPagina(){
    // Captura sempre de novo. Nunca reutiliza uma tela antiga como fonte de verdade.
    const tela=capturarTelaAtual("pergunta");

    const anterior=tela.mudou
      ? `A pessoa acabou de mudar de tela. Caminho anterior: ${tela.anterior}.`
      : "Não há mudança de tela pendente.";

    return [
      "TELA ATUAL CONFIRMADA — ESTA É A FONTE DE VERDADE:",
      `Nome da tela: ${tela.nome}`,
      `Título principal: ${tela.h1||tela.titulo||tela.nome}`,
      `Caminho atual: ${tela.pathname}`,
      anterior,
      `Elemento ou campo em foco: ${tela.foco}`,
      `Campos visíveis sem valores: ${tela.campos.join(" | ")||"nenhum"}`,
      `Ações visíveis agora: ${tela.acoes.join(" | ")||"nenhuma"}`,
      `Avisos visíveis agora: ${tela.avisos.join(" | ")||"nenhum"}`,
      `Conteúdo principal visível: ${tela.textos.join(" | ")||"nenhum"}`,
      `Vocabulário aprendido: ${carregarTermos().join(" | ")||"nenhum"}`,
      "Nunca use uma tela anterior para orientar se ela divergir desta tela.",
      "Os valores digitados não são enviados. Apenas vazio ou preenchido."
    ].join("\n").slice(0,3400);
  }

  function instalarObservadorTela(){
    if(observadorTela)return;

    const atualizar=()=>{
      clearTimeout(instalarObservadorTela._timer);
      instalarObservadorTela._timer=setTimeout(()=>capturarTelaAtual("mudança no conteúdo"),180);
    };

    observadorTela=new MutationObserver(atualizar);
    observadorTela.observe(document.documentElement,{
      subtree:true,
      childList:true,
      attributes:true,
      attributeFilter:["class","hidden","aria-hidden","disabled"]
    });

    window.addEventListener("popstate",()=>capturarTelaAtual("navegação"));
    window.addEventListener("hashchange",()=>capturarTelaAtual("navegação"));
    window.addEventListener("pageshow",()=>capturarTelaAtual("página exibida"));
    document.addEventListener("focusin",()=>capturarTelaAtual("foco mudou"),true);

    capturarTelaAtual("inicialização");
  }


  function carregarHistorico() {
    try { const h = JSON.parse(sessionStorage.getItem(STORAGE_HISTORICO) || "[]"); return Array.isArray(h) ? h.slice(-8) : []; }
    catch (_) { return []; }
  }
  function salvarHistorico(h) { try { sessionStorage.setItem(STORAGE_HISTORICO, JSON.stringify(h.slice(-8))); } catch (_) {} }

  function criarBarraStatus() {
    let b = document.querySelector(".assistente-local-status");
    if (b) return b;
    b = document.createElement("section");
    b.className = "assistente-local-status";
    b.setAttribute("role", "status"); b.setAttribute("aria-live", "polite");
    b.innerHTML = `
      <span class="assistente-local-ponto" aria-hidden="true"></span>
      <span class="assistente-local-mensagem"><strong>Assistente Educa+</strong><small>Preparando…</small></span>
      <span class="assistente-local-nivel" aria-hidden="true"><i></i></span>
      <button class="assistente-local-repetir" type="button">Repetir</button>
      <button class="assistente-local-interromper" type="button">Parar fala</button>
      <button class="assistente-local-encerrar" type="button">Encerrar</button>`;
    b.querySelector(".assistente-local-repetir").onclick = () => ultimaFala && falar(ultimaFala);
    b.querySelector(".assistente-local-interromper").onclick = interromperFala;
    b.querySelector(".assistente-local-encerrar").onclick = desligar;
    document.body.appendChild(b); return b;
  }

  function status(texto, tipo="normal", nivel=null) {
    const p = document.getElementById("statusVoz"); if (p) p.textContent = texto;
    const b = criarBarraStatus(); b.dataset.tipo = tipo; b.querySelector("small").textContent = texto;
    b.querySelector(".assistente-local-interromper").hidden = tipo !== "falando";
    if (nivel !== null) b.querySelector(".assistente-local-nivel i").style.width = `${Math.min(100, Math.max(3, nivel * 900))}%`;
  }
  function esconderStatus(){ document.querySelector(".assistente-local-status")?.remove(); }

  const VOZES_NEURAIS = [
    {key:"francisca",nome:"Francisca"},
    {key:"antonio",nome:"Antonio"}
  ];

  function vozNeuralAtual(){
    const salva=localStorage.getItem(STORAGE_VOZ_NEURAL)||"francisca";
    return VOZES_NEURAIS.find(v=>v.key===salva)||VOZES_NEURAIS[0];
  }

  function percentualVelocidadeNeural(){
    return Math.max(-12,Math.min(15,Math.round((taxaVoz-1)*100)));
  }

  function vozesPtBrOrdenadas(){
    const vs=speechSynthesis?.getVoices?.()||[];
    const pt=vs.filter(v=>/^pt(-BR)?/i.test(v.lang||""));

    const nota=v=>{
      const n=(v.name+" "+v.voiceURI).toLowerCase();
      let p=0;
      if(/pt-br/i.test(v.lang||""))p+=20;
      if(/natural|neural|online|premium/.test(n))p+=18;
      if(/francisca|antonio|thalita|luciana/.test(n))p+=14;
      if(/microsoft/.test(n))p+=10;
      if(/google/.test(n))p+=8;
      if(/desktop|compact|espeak/.test(n))p-=10;
      return p;
    };

    return pt.sort((a,b)=>nota(b)-nota(a));
  }

  function melhorVozPtBr(){
    const lista=vozesPtBrOrdenadas();
    if(!lista.length)return null;
    return lista[0];
  }

  function falarBrowserFallback(texto,fim){
    texto=limparParaVoz(texto);
    if(!texto){fim?.();return;}

    const u=new SpeechSynthesisUtterance(texto);
    u.lang="pt-BR";
    u.rate=Math.max(.86,Math.min(1.08,taxaVoz));
    u.pitch=1;
    u.volume=1;

    const voz=melhorVozPtBr();
    if(voz)u.voice=voz;

    u.onend=()=>fim?.();
    u.onerror=()=>fim?.();

    speechSynthesis.speak(u);
  }

  function pararTodaVoz(){
    try{
      if(audioNeuralAtual){
        audioNeuralAtual.pause();
        audioNeuralAtual.src="";
      }
    }catch(_){}

    audioNeuralAtual=null;
    filaAudioNeural=[];
    tocandoAudioNeural=false;

    try{speechSynthesis?.cancel();}catch(_){}
  }

  async function blobVozNeural(texto){
    if(ttsNeuralDisponivel===false){
      throw new Error("tts_neural_indisponivel");
    }

    const voz=vozNeuralAtual();

    const r=await fetch("/api/assistente/local/voz",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        texto:limparParaVoz(texto),
        voz:voz.key,
        velocidade:percentualVelocidadeNeural()
      })
    });

    if(!r.ok){
      const d=await r.json().catch(()=>({}));
      if(d.code==="edge_tts_nao_instalado")ttsNeuralDisponivel=false;
      throw new Error(d.code||"tts_neural_falhou");
    }

    ttsNeuralDisponivel=true;
    return await r.blob();
  }

  function enfileirarVoz(texto,fim){
    texto=limparParaVoz(texto);
    if(!texto){fim?.();return;}

    filaAudioNeural.push({texto,fim});
    processarFilaVoz();
  }

  async function processarFilaVoz(){
    if(tocandoAudioNeural||!filaAudioNeural.length)return;

    tocandoAudioNeural=true;
    const item=filaAudioNeural.shift();

    const finalizar=()=>{
      tocandoAudioNeural=false;
      audioNeuralAtual=null;
      try{item.fim?.();}catch(_){}
      processarFilaVoz();
    };

    try{
      const blob=await blobVozNeural(item.texto);
      const url=URL.createObjectURL(blob);
      const audio=new Audio(url);
      audioNeuralAtual=audio;

      audio.onended=()=>{
        URL.revokeObjectURL(url);
        finalizar();
      };

      audio.onerror=()=>{
        URL.revokeObjectURL(url);
        falarBrowserFallback(item.texto,finalizar);
      };

      await audio.play();

    }catch(e){
      console.warn("Voz neural indisponível; usando voz do navegador.",e);
      falarBrowserFallback(item.texto,finalizar);
    }
  }

  function falar(texto,fim){
    texto=limparParaVoz(texto);
    if(!texto){fim?.();return;}

    ultimaFala=texto;
    falando=true;
    processando=false;
    pararTodaVoz();
    status("Educa está falando…","falando");

    enfileirarVoz(texto,()=>{
      falando=false;
      fim?.();
      if(ativo)status("Estou ouvindo. Pode falar normalmente.","ouvindo",0);
    });
  }

  function trocarVoz(){
    const atual=vozNeuralAtual();
    let indice=VOZES_NEURAIS.findIndex(v=>v.key===atual.key);
    indice=(indice+1)%VOZES_NEURAIS.length;

    const nova=VOZES_NEURAIS[indice];
    localStorage.setItem(STORAGE_VOZ_NEURAL,nova.key);
    ttsNeuralDisponivel=null;

    falar(`Agora vou usar a voz ${nova.nome}. Fala comigo e vê se prefere esta.`);
    return true;
  }

  function interromperFala(){
    pararTodaVoz();
    falando=false;
    if(ativo)status("Pode falar. Estou ouvindo.","ouvindo",0);
  }


  function encontrarElementoPorTexto(alvo){
    const p=normalizar(alvo); if(!p)return null; let melhor=null, notaM=0;
    document.querySelectorAll("button,a,[role='button'],summary,label,h1,h2,h3,.atividade-opcao,.item.alvo").forEach(el=>{
      if(!elementoVisivel(el))return; const t=normalizar(el.getAttribute("aria-label")||el.innerText||el.textContent); let n=0;
      if(t===p)n=100; else if(t.includes(p))n=80; else if(p.includes(t)&&t.length>3)n=65; if(n>notaM){notaM=n;melhor=el;}
    }); return melhor;
  }
  function destacar(alvo){ document.querySelectorAll(".educa-assistente-alvo").forEach(e=>e.classList.remove("educa-assistente-alvo")); const el=encontrarElementoPorTexto(alvo); if(!el)return false; el.classList.add("educa-assistente-alvo"); el.scrollIntoView({behavior:"smooth",block:"center"}); setTimeout(()=>el.classList.remove("educa-assistente-alvo"),9000); return true; }
  function acionarControle(id,valor){ const el=document.getElementById(id); if(!el)return false; if("checked" in el&&typeof valor==="boolean"){el.checked=valor;el.dispatchEvent(new Event("change",{bubbles:true}));}else el.click(); return true; }
  function executarAcao(acao,alvo,fala){
    const nav={ir_inicio:"/",ir_estudos:"/estudos",ir_login:"/login",ir_cadastro:"/cadastro",ir_perfil:"/perfil"};
    if(acao==="destacar"){destacar(alvo);falar(fala);return;}
    if(acao==="aumentar_fonte")acionarControle("aumentarFonte"); if(acao==="diminuir_fonte")acionarControle("diminuirFonte");
    if(acao==="modo_senior_ligar")acionarControle("modoSenior",true); if(acao==="modo_senior_desligar")acionarControle("modoSenior",false);
    if(acao==="alto_contraste_ligar")acionarControle("altoContraste",true); if(acao==="alto_contraste_desligar")acionarControle("altoContraste",false);
    if(nav[acao]){ falar(fala,()=>location.href=nav[acao]); return; } falar(fala);
  }



  function carregarTermos(){
    try{
      const v=JSON.parse(localStorage.getItem(STORAGE_TERMOS)||"[]");
      return Array.isArray(v)?v.slice(-24):[];
    }catch(_){return [];}
  }

  function salvarTermo(termo){
    termo=textoLimpo(termo).replace(/^["“]|["”]$/g,"").slice(0,45);
    if(!termo)return false;
    const lista=carregarTermos();
    if(!lista.some(x=>normalizar(x)===normalizar(termo))){
      lista.push(termo);
      localStorage.setItem(STORAGE_TERMOS,JSON.stringify(lista.slice(-24)));
    }
    return true;
  }

  function tentarAprenderTermo(texto){
    const original=textoLimpo(texto);
    const n=normalizar(original);
    if(!/(aprenda|guarde|lembre).*(palavra|termo)/.test(n))return false;

    const m=original.match(/(?:palavra|termo)\s+["“]?([^"”]{2,45})["”]?$/i);
    if(!m)return false;

    const termo=textoLimpo(m[1]);
    if(!salvarTermo(termo))return false;
    falar(`Certo. Vou considerar a palavra ${termo} nas próximas falas.`);
    return true;
  }

  function tokensUteis(v){
    const stop=new Set(["onde","clico","clicar","aperto","apertar","para","pra","quero","abrir","abre","botao","botão","aqui","nesse","nessa","este","esta","isso","me","mostra"]);
    return normalizar(v).split(/\s+/).filter(x=>x.length>=3&&!stop.has(x));
  }

  function encontrarElementoPorFala(fala){
    const ft=tokensUteis(fala);
    if(!ft.length)return null;

    let melhor=null,nota=-1;
    document.querySelectorAll("button,a,[role='button'],summary").forEach(el=>{
      if(!elementoVisivel(el))return;
      const txt=textoLimpo(el.getAttribute("aria-label")||el.innerText||el.textContent);
      const et=tokensUteis(txt);
      if(!et.length)return;

      let n=0;
      for(const f of ft){
        for(const e of et){
          if(f===e)n+=5;
          else if(f.length>=4&&e.length>=4&&(f.includes(e)||e.includes(f)))n+=3;
        }
      }
      if(normalizar(fala).includes(normalizar(txt))&&txt.length>2)n+=8;
      if(n>nota){nota=n;melhor=el;}
    });
    return nota>=3?melhor:null;
  }

  function destacarElemento(el){
    if(!el)return false;
    document.querySelectorAll(".educa-assistente-alvo").forEach(e=>e.classList.remove("educa-assistente-alvo"));
    el.classList.add("educa-assistente-alvo");
    el.scrollIntoView({behavior:"smooth",block:"center"});
    setTimeout(()=>el.classList.remove("educa-assistente-alvo"),9000);
    return true;
  }

  function respostaSegurancaImediata(texto){
    const n=normalizar(texto);
    const segredo=/(senha|cvv|pin|token|codigo sms|codigo de verificacao|codigo de autenticacao)/.test(n);
    const compartilhar=/(passar|mandar|enviar|falar|dizer|compartilhar|pediram|pediu|dar meu|dar o)/.test(n);
    if(segredo&&compartilhar){
      falar("Não compartilhe esse código ou senha. Posso ajudar você a verificar o que fazer com segurança.");
      return true;
    }
    return false;
  }

  function primeiroCampoPendente(){
    const campos=[...document.querySelectorAll("input,select,textarea")]
      .filter(el=>
        elementoVisivel(el)
        && (el.type||"").toLowerCase()!=="hidden"
        && !el.closest("#painelAcessibilidade")
      );

    // Primeiro os obrigatórios vazios.
    let el=campos.find(c=>c.required&&estadoCampo(c)==="vazio");

    // Se a tela não marcou required, usa o primeiro campo vazio.
    if(!el)el=campos.find(c=>estadoCampo(c)==="vazio");

    return el||null;
  }

  function orientarProximoPassoLocal(){
    const tela=capturarTelaAtual("pedido de próximo passo");
    const campo=primeiroCampoPendente();

    if(campo){
      destacarElemento(campo);
      const nome=rotuloCampo(campo)||"este campo";
      const tipo=(campo.type||"").toLowerCase();

      if(tipo==="password"){
        falar(`Você está na tela ${tela.nome}. Agora preencha ${nome} diretamente nesse campo. Não fale sua senha em voz alta.`);
      }else{
        falar(`Você está na tela ${tela.nome}. Agora preencha ${nome}. Eu destaquei o campo para você.`);
      }
      return true;
    }

    const botao=[...document.querySelectorAll("button,input[type='submit'],a[role='button']")]
      .find(el=>elementoVisivel(el)&&!el.closest("#painelAcessibilidade"));

    if(botao){
      destacarElemento(botao);
      const nome=textoLimpo(
        botao.getAttribute("aria-label")
        || botao.value
        || botao.innerText
        || botao.textContent
      )||"continuar";

      falar(`Você está na tela ${tela.nome}. Os campos parecem preenchidos. Revise com calma e, se estiver tudo certo, toque em ${nome}.`);
      return true;
    }

    falar(`Você está na tela ${tela.nome}. Me diga o que deseja fazer aqui e eu te guio.`);
    return true;
  }

  function tentarComandoSistema(texto){
    const n=normalizar(texto);

    // Segurança crítica continua imediata.
    if(respostaSegurancaImediata(texto))return true;

    // Só comandos do próprio assistente ficam prontos.
    if(/^(troca|trocar|muda|mudar|outra).*(voz)|^(outra voz|troque a voz)/.test(n)){
      return trocarVoz();
    }

    if(/^(repete|repetir|fala de novo|diga de novo)/.test(n)){
      if(ultimaFala)falar(ultimaFala);
      else falar("Ainda não tenho uma resposta para repetir.");
      return true;
    }

    if(/(fale|fala).*(mais rapido|mais rapida)/.test(n)){
      taxaVoz=Math.min(1.15,taxaVoz+0.06);
      localStorage.setItem("educa_assistente_velocidade",String(taxaVoz));
      falar("Vou falar um pouco mais rápido.");
      return true;
    }

    if(/(fale|fala).*(mais devagar|mais lento|mais lenta)/.test(n)){
      taxaVoz=Math.max(0.84,taxaVoz-0.06);
      localStorage.setItem("educa_assistente_velocidade",String(taxaVoz));
      falar("Vou falar um pouco mais devagar.");
      return true;
    }

    if(/(aumenta|aumentar).*(letra|fonte)/.test(n)){
      acionarControle("aumentarFonte");
      falar("Aumentei o tamanho do texto. Veja se ficou melhor.");
      return true;
    }

    if(/(diminui|diminuir).*(letra|fonte)/.test(n)){
      acionarControle("diminuirFonte");
      falar("Diminuí o tamanho do texto. Veja se ficou confortável.");
      return true;
    }

    if(/modo senior/.test(n)){
      const desligar=/(desliga|desativ|tirar|tira)/.test(n);
      acionarControle("modoSenior",!desligar);
      falar(desligar?"Desativei o modo sênior.":"Ativei o modo sênior.");
      return true;
    }

    if(/contraste/.test(n)){
      const desligar=/(desliga|desativ|tirar|tira)/.test(n);
      acionarControle("altoContraste",!desligar);
      falar(desligar?"Desativei o alto contraste.":"Ativei o alto contraste.");
      return true;
    }

    // Pedidos de ajuda, navegação, cadastro, estudos e dúvidas
    // sempre vão para a IA com contexto e histórico.
    return false;
  }


  function prepararReconhecimentoBrowser(){
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR || reconhecimentoBrowser) return;

    try{
      reconhecimentoBrowser = new SR();
      reconhecimentoBrowser.lang = "pt-BR";
      reconhecimentoBrowser.continuous = false;
      reconhecimentoBrowser.interimResults = true;
      reconhecimentoBrowser.maxAlternatives = 1;

      reconhecimentoBrowser.onresult = (ev) => {
        let finalTxt = "", parcial = "";
        for(let i=ev.resultIndex;i<ev.results.length;i++){
          const t = textoLimpo(ev.results[i][0]?.transcript || "");
          if(ev.results[i].isFinal) finalTxt += (finalTxt?" ":"") + t;
          else parcial += (parcial?" ":"") + t;
        }
        if(finalTxt) textoBrowser = textoLimpo((textoBrowser+" "+finalTxt));
        textoBrowserInterino = textoLimpo(parcial);
      };

      reconhecimentoBrowser.onerror = () => {};
      reconhecimentoBrowser.onend = () => {};
    }catch(_){
      reconhecimentoBrowser = null;
    }
  }

  function iniciarReconhecimentoBrowser(){
    textoBrowser = "";
    textoBrowserInterino = "";
    prepararReconhecimentoBrowser();
    try{ reconhecimentoBrowser?.start(); }catch(_){}
  }

  function pararReconhecimentoBrowser(){
    try{ reconhecimentoBrowser?.stop(); }catch(_){}
  }

  function textoReconhecidoPeloBrowser(){
    return textoLimpo(textoBrowser || textoBrowserInterino || "");
  }

  function mimePreferido(){ const tipos=["audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus","audio/mp4"]; return tipos.find(t=>MediaRecorder.isTypeSupported(t)) || ""; }

  function iniciarGravacao(){
    if(!ativo||falando||processando||gravando||!stream)return;
    chunks=[]; const mime=mimePreferido();
    try{ recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined); }catch(e){ status("Não consegui iniciar a gravação do microfone.","erro"); return; }
    recorder.ondataavailable=e=>{if(e.data&&e.data.size>0)chunks.push(e.data);};
    recorder.onstop=enviarAudio; iniciarReconhecimentoBrowser(); recorder.start(250); gravando=true; inicioFala=performance.now(); ultimoSom=inicioFala; status("Estou ouvindo você…","gravando");
  }

  function finalizarGravacao(){ if(!gravando||!recorder)return; gravando=false; pararReconhecimentoBrowser(); try{recorder.stop();}catch(_){} }

  let falasStreamAtivas=0, streamTerminou=false, acaoPendente=null;

  function executarAcaoSemFalar(acao,alvo){
    const nav={ir_inicio:"/",ir_estudos:"/estudos",ir_login:"/login",ir_cadastro:"/cadastro",ir_perfil:"/perfil"};
    if(acao==="destacar"){destacar(alvo);return;}
    if(acao==="aumentar_fonte")acionarControle("aumentarFonte");
    if(acao==="diminuir_fonte")acionarControle("diminuirFonte");
    if(acao==="modo_senior_ligar")acionarControle("modoSenior",true);
    if(acao==="modo_senior_desligar")acionarControle("modoSenior",false);
    if(acao==="alto_contraste_ligar")acionarControle("altoContraste",true);
    if(acao==="alto_contraste_desligar")acionarControle("altoContraste",false);
    if(nav[acao]) location.href=nav[acao];
  }

  function finalizarStreamSePronto(){
    if(!streamTerminou||falasStreamAtivas>0)return;
    falando=false; processando=false;
    if(acaoPendente){executarAcaoSemFalar(acaoPendente.acao,acaoPendente.alvo);acaoPendente=null;}
    if(ativo)status("Estou ouvindo. Pode falar normalmente.","ouvindo",0);
  }

  function falarTrechoStream(texto){
    texto=limparParaVoz(texto);
    if(!texto)return;

    ultimaFala=(ultimaFala?ultimaFala+" ":"")+texto;

    falasStreamAtivas++;
    falando=true;
    status("Educa está respondendo…","falando");

    enfileirarVoz(texto,()=>{
      falasStreamAtivas=Math.max(0,falasStreamAtivas-1);
      finalizarStreamSePronto();
    });
  }


  function extrairFrases(buffer,forcar=false){
    const saidas=[];
    let resto=buffer;

    while(resto.length){
      // Prefere terminar uma frase de verdade. Isso deixa a voz menos picotada.
      const frase=resto.match(/^([\s\S]{24,}?[.!?])(?:\s+|$)/);

      if(frase){
        const falavel=limparParaVoz(frase[1]);
        if(falavel)saidas.push(falavel);
        resto=resto.slice(frase[0].length);
        continue;
      }

      // Se o modelo demorar para pontuar, libera um trecho maior e natural.
      if(resto.length>=118){
        let corte=resto.lastIndexOf(" ",108);
        if(corte<78)corte=resto.indexOf(" ",86);

        if(corte>=78){
          const falavel=limparParaVoz(resto.slice(0,corte));
          if(falavel)saidas.push(falavel);
          resto=resto.slice(corte+1);
          continue;
        }
      }

      if(forcar&&resto.trim()){
        const falavel=limparParaVoz(resto);
        if(falavel)saidas.push(falavel);
        resto="";
      }
      break;
    }

    return {saidas,resto};
  }

  async function enviarAudio(){
    if(!ativo||falando||processando||!chunks.length)return;

    processando=true;
    streamTerminou=false;
    acaoPendente=null;
    ultimaFala="";

    const tipo=recorder?.mimeType||"audio/webm";
    const blob=new Blob(chunks,{type:tipo});
    chunks=[];

    const ext=tipo.includes("ogg")?"ogg":tipo.includes("mp4")?"m4a":"webm";

    try{
      status("Entendi que você falou. Preparando a resposta…","pensando");

      await new Promise(r=>setTimeout(r,120));
      let ouvido=textoLimpo(textoReconhecidoPeloBrowser());
      const palavrasBrowser=ouvido.split(/\s+/).filter(Boolean).length;

      if(ouvido.length<5||palavrasBrowser<2){
        const fd=new FormData();
        fd.append("audio",blob,`fala.${ext}`);
        fd.append("contexto",contextoPagina());
        fd.append("texto_navegador",ouvido);

        const rt=await fetch("/api/assistente/local/transcrever",{
          method:"POST",
          body:fd
        });

        const dt=await rt.json().catch(()=>({}));
        if(!rt.ok||!dt.ok){
          throw new Error(dt.error||"Não consegui entender bem a fala.");
        }

        ouvido=textoLimpo(dt.texto||"");
      }

      if(!ouvido)throw new Error("Não consegui entender bem a fala.");

      status(`Ouvi: “${ouvido.slice(0,95)}${ouvido.length>95?"…":""}”`,"pensando");

      if(tentarComandoSistema(ouvido)){
        const h=carregarHistorico();
        h.push({role:"user",content:ouvido});
        salvarHistorico(h);
        processando=false;
        streamTerminou=true;
        return;
      }

      // Perguntas e conversa seguem para a IA online.
      // A resposta é curta para funcionar bem em hospedagens com poucos recursos antes de
      // pedir a voz neural, porque a conta gratuita possui apenas um worker.
      const corpo={
        mensagem:ouvido,
        contexto:contextoPagina(),
        historico:carregarHistorico()
      };

      const r=await fetch("/api/assistente/local/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(corpo)
      });

      const d=await r.json().catch(()=>({}));

      if(!r.ok||!d.ok){
        console.error("Educa:",r.status,d);
        throw new Error(
          d.error
          || "A inteligência da Educa não conseguiu responder agora."
        );
      }

      const respostaCompleta=limparParaVoz(d.text||"");

      if(!respostaCompleta){
        throw new Error("A resposta da Educa veio vazia.");
      }

      const h=carregarHistorico();
      h.push({role:"user",content:ouvido});
      h.push({role:"assistant",content:respostaCompleta});
      salvarHistorico(h);

      processando=false;
      streamTerminou=true;

      const acao={
        acao:d.action||"nenhuma",
        alvo:d.target||""
      };

      falar(respostaCompleta,()=>{
        if(acao.acao&&acao.acao!=="nenhuma"){
          executarAcaoSemFalar(acao.acao,acao.alvo);
        }
      });

    }catch(e){
      console.error("Educa:",e);

      processando=false;
      streamTerminou=true;
      falasStreamAtivas=0;
      pararTodaVoz();

      // Nunca leia ContinueError, RuntimeError, stack trace ou mensagem do servidor.
      const msg=String(e?.message||"");
      const escuta = /entender|palavras suficientes|fala|escuta/i.test(msg);
      const fala = escuta
        ? "Não ouvi a frase inteira. Pode repetir? Estou escutando."
        : "Eu ouvi você, mas a resposta da IA local não chegou. Tente novamente.";

      status(fala,"erro");
      falar(fala);
    }
  }

  function monitorarMicrofone(){
    if(!ativo||!analyser){rafId=0;return;} const dados=new Uint8Array(analyser.fftSize); analyser.getByteTimeDomainData(dados);
    let soma=0; for(const v of dados){const x=(v-128)/128;soma+=x*x;} const rms=Math.sqrt(soma/dados.length), agora=performance.now();
    if(!falando&&!processando){
      status(gravando?"Estou ouvindo você…":"Estou ouvindo. Pode falar normalmente.",gravando?"gravando":"ouvindo",rms);
      if(rms>LIMIAR_SOM){ framesComSom++; ultimoSom=agora; if(!gravando&&framesComSom>=FRAMES_PARA_INICIAR)iniciarGravacao(); }
      else{ framesComSom=0; if(gravando){ const dur=agora-inicioFala, sil=agora-ultimoSom; if((dur>MIN_GRAVACAO&&sil>SILENCIO_PARA_ENVIAR)||dur>MAX_GRAVACAO)finalizarGravacao(); } }
    }
    rafId=requestAnimationFrame(monitorarMicrofone);
  }

  async function abrirMicrofone(){
    if(stream)return; stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}});
    audioCtx=new (window.AudioContext||window.webkitAudioContext)(); source=audioCtx.createMediaStreamSource(stream); analyser=audioCtx.createAnalyser(); analyser.fftSize=1024; analyser.smoothingTimeConstant=.42; source.connect(analyser);
    monitorarMicrofone();
  }

  async function verificarBackend(){
    const r=await fetch("/api/assistente/local/status",{cache:"no-store"});
    const d=await r.json().catch(()=>({}));

    if(!r.ok||!d.ok){
      throw new Error(
        d.error
        || "A inteligência da Educa ainda não está configurada no servidor."
      );
    }

    return d;
  }

  async function aquecerAssistente(silencioso=false){
    if(!silencioso)status("Conectando a inteligência da Educa…","pensando");
    const r=await fetch("/api/assistente/local/aquecer",{method:"POST",cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.ok)throw new Error(d.error||"Não consegui conectar a inteligência da Educa.");
    return d;
  }

  async function iniciar(){
    if(ativo)return;
    ativo=true;
    localStorage.setItem(STORAGE_ATIVO,"1");
    status("Abrindo o microfone…","pensando");

    if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){
      ativo=false;
      status("Use Google Chrome ou Microsoft Edge para o assistente por voz.","erro");
      return;
    }

    try{
      await verificarBackend();
      await abrirMicrofone();
      aquecerAssistente(true).catch(e=>console.warn("Aquecimento Educa:",e));
    }catch(e){
      ativo=false;
      localStorage.removeItem(STORAGE_ATIVO);
      status(e.message,"erro");
      const t=document.getElementById("lerVozAlta");
      if(t)t.checked=false;
      return;
    }

    const cumpr=sessionStorage.getItem(STORAGE_CUMPRIMENTOU)==="1";
    if(!cumpr){
      sessionStorage.setItem(STORAGE_CUMPRIMENTOU,"1");
      {
        capturarTelaAtual("saudação");
        falar("Oi. Eu sou a Educa. Pode falar comigo normalmente. Eu acompanho o que aparece na sua tela para conseguir te ajudar.");
      }
    }else{
      status("Estou ouvindo. Pode falar normalmente.","ouvindo",0);
    }
  }

  function desligar(remover=true){ativo=false;processando=false;falando=false;if(gravando)finalizarGravacao();cancelAnimationFrame(rafId);rafId=0;speechSynthesis?.cancel();stream?.getTracks().forEach(t=>t.stop());stream=null;try{audioCtx?.close();}catch(_){}audioCtx=null;analyser=null;source=null;localStorage.removeItem(STORAGE_ATIVO);const t=document.getElementById("lerVozAlta");if(t)t.checked=false;if(remover)esconderStatus();}

  function preparar(){
    instalarObservadorTela();

    // Carrega as vozes cedo; alguns navegadores só as disponibilizam depois.
    try{ speechSynthesis?.getVoices?.(); }catch(_){}
    if("speechSynthesis" in window){
      window.speechSynthesis.onvoiceschanged=()=>vozesPtBrOrdenadas();
    }

    const t=document.getElementById("lerVozAlta");
    if(!t)return;

    setTimeout(()=>aquecerAssistente(true).catch(()=>{}),250);

    setTimeout(async()=>{
      try{
        const r=await fetch("/api/assistente/local/vozes",{cache:"no-store"});
        const d=await r.json();
        ttsNeuralDisponivel=Boolean(d?.neural);
      }catch(_){}
    },350);

    const seguir=localStorage.getItem(STORAGE_ATIVO)==="1";
    t.checked=seguir;
    t.addEventListener("change",()=>t.checked?iniciar():desligar());
    if(seguir)setTimeout(iniciar,450);
  }
  window.addEventListener("beforeunload",()=>{if(gravando)try{recorder.stop();}catch(_){};stream?.getTracks().forEach(t=>t.stop());});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",preparar);else preparar();
})();
