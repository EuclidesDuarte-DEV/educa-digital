(function(){
  "use strict";

  const CH = {
    paleta:"educa_paleta_acessivel",
    contraste:"educa_nivel_contraste",
    escuro:"educa_modo_escuro_acessivel",
    leitura:"educa_leitura_tela_ativa",
    velocidade:"educa_assistente_velocidade"
  };

  const classesPaleta=["paleta-azul-laranja","paleta-azul-rosa","paleta-universal","paleta-cinza"];
  let leituraEmAndamento=false;

  function qs(s,c=document){return c.querySelector(s)}
  function qsa(s,c=document){return [...c.querySelectorAll(s)]}
  function status(msg){const e=qs("#statusAcessibilidade"); if(e)e.textContent=msg;}
  function statusVoz(msg){const e=qs("#statusVoz"); if(e)e.textContent=msg||""; status(msg||"");}

  function atualizarAparenciaNativa(){
    const escuro=document.body.classList.contains("modo-escuro-acessivel");
    const maximo=document.body.classList.contains("alto-contraste");
    const paletaClasse=classesPaleta.find(c=>document.body.classList.contains(c));
    const paletaAtiva=paletaClasse?paletaClasse.replace("paleta-",""):"original";
    document.body.classList.toggle("tema-acessibilidade-ativo",paletaAtiva!=="original"||escuro||maximo);
    document.documentElement.dataset.educaTema=maximo?"contraste-maximo":escuro?`escuro-${paletaAtiva}`:paletaAtiva;
    document.documentElement.style.colorScheme=(escuro||maximo)?"dark":"light";

    let meta=document.querySelector('meta[name="theme-color"]');
    if(!meta){meta=document.createElement("meta");meta.name="theme-color";document.head.appendChild(meta);}
    const css=getComputedStyle(document.body);
    meta.content=maximo?"#000000":escuro?"#09131F":css.getPropertyValue("--a11y-bg").trim()||css.getPropertyValue("--cor-fundo-suave").trim()||"#EEF6FF";
  }

  function aplicarPaleta(valor, salvar=true){
    const v=["original","azul-laranja","azul-rosa","universal","cinza"].includes(valor)?valor:"original";
    document.body.classList.remove(...classesPaleta);
    if(v!=="original") document.body.classList.add(`paleta-${v}`);
    qsa('input[name="paletaAcessivel"]').forEach(r=>r.checked=r.value===v);
    if(salvar)localStorage.setItem(CH.paleta,v);
    atualizarAparenciaNativa();
    status(v==="original"?"Cores originais aplicadas.":"Cores acessíveis aplicadas.");
  }

  function aplicarModoEscuro(ativo, salvar=true){
    const on=ativo===true;
    document.body.classList.toggle("modo-escuro-acessivel",on);
    const el=qs("#modoEscuroAcessivel");
    if(el)el.checked=on;
    if(salvar)localStorage.setItem(CH.escuro,on?"1":"0");
    atualizarAparenciaNativa();
    status(on?"Modo escuro ativado.":"Modo escuro desativado.");
  }

  function aplicarAltoContraste(ativo, salvar=true){
    const on=ativo===true;
    document.body.classList.remove("contraste-reforcado");
    document.body.classList.toggle("alto-contraste",on);
    const el=qs("#altoContraste");
    if(el)el.checked=on;
    if(salvar){
      localStorage.setItem(CH.contraste,on?"maximo":"normal");
      // Mantém compatibilidade com o controle de contraste das versões anteriores.
      localStorage.setItem("educa_alto_contraste",on?"1":"0");
    }
    atualizarAparenciaNativa();
    status(on?"Alto contraste ativado.":"Alto contraste desativado.");
  }

  function textoVisivelDaTela(){
    const raiz=qs("#conteudoPrincipal");
    if(!raiz)return document.title;
    const clone=raiz.cloneNode(true);
    clone.querySelectorAll('[hidden],script,style,.sr-only,[aria-hidden="true"],dialog,nav').forEach(e=>e.remove());
    return `${document.title}. ${clone.innerText||clone.textContent||""}`.replace(/\s+/g," ").trim().slice(0,16000);
  }

  function velocidadeAtual(){
    const v=Number(localStorage.getItem(CH.velocidade)||"1.02");
    return Number.isFinite(v)?Math.max(.85,Math.min(1.12,v)):1.02;
  }

  function pararLeitura(mensagem="Leitura parada."){
    leituraEmAndamento=false;
    try{ if("speechSynthesis" in window) window.speechSynthesis.cancel(); }catch(_){ }
    statusVoz(mensagem);
  }

  function falarTexto(texto){
    if(!texto){statusVoz("Não encontrei texto para ler nesta página.");return;}
    if(!("speechSynthesis" in window)){
      statusVoz("A leitura em voz alta não está disponível neste navegador.");
      const t=qs("#lerTelaAutomatico"); if(t)t.checked=false;
      localStorage.setItem(CH.leitura,"0");
      return;
    }

    window.speechSynthesis.cancel();
    leituraEmAndamento=true;
    const partes=texto.match(/.{1,700}(?:\s|$)/g)||[texto];
    let i=0;

    const proxima=()=>{
      if(!leituraEmAndamento)return;
      if(i>=partes.length){statusVoz("Leitura concluída.");leituraEmAndamento=false;return;}
      const u=new SpeechSynthesisUtterance(partes[i++]);
      u.lang="pt-BR";
      u.rate=velocidadeAtual();
      u.pitch=1;
      u.onend=proxima;
      u.onerror=()=>{
        leituraEmAndamento=false;
        statusVoz("A leitura foi interrompida. Desligue e ligue novamente para tentar outra vez.");
      };
      window.speechSynthesis.speak(u);
    };

    statusVoz("Lendo esta página…");
    proxima();
  }

  function definirLeituraAtiva(ativo, iniciarAgora=true){
    const on=ativo===true;
    const toggle=qs("#lerTelaAutomatico");
    if(toggle)toggle.checked=on;
    localStorage.setItem(CH.leitura,on?"1":"0");
    if(on){
      statusVoz("Leitura em voz alta ativada.");
      if(iniciarAgora) falarTexto(textoVisivelDaTela());
    }else{
      pararLeitura("Leitura em voz alta desativada.");
    }
  }

  function dialogoPorId(id){
    const el=qs(`#${id}`);
    return el && el.tagName === "DIALOG" ? el : null;
  }

  function abrirDialogo(id, gatilho){
    const dlg=dialogoPorId(id);
    if(!dlg)return;
    dlg.dataset.retornoId = gatilho?.id || "";
    if(typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
    requestAnimationFrame(()=>dlg.querySelector("[data-acess-voltar], input, button")?.focus());
  }

  function fecharDialogo(dlg){
    if(!dlg)return;
    const retornoId=dlg.dataset.retornoId;
    if(typeof dlg.close === "function" && dlg.open) dlg.close();
    else dlg.removeAttribute("open");
    if(retornoId) requestAnimationFrame(()=>qs(`#${retornoId}`)?.focus());
  }

  function fecharTodosDialogos(){qsa(".acess-dialogo").forEach(d=>fecharDialogo(d));}

  function init(){
    // Migração e estado persistido.
    aplicarPaleta(localStorage.getItem(CH.paleta)||"original",false);

    const contrasteSalvo=localStorage.getItem(CH.contraste);
    const contrasteAntigo=localStorage.getItem("educa_alto_contraste")==="1";
    aplicarAltoContraste(contrasteSalvo==="maximo"||contrasteAntigo,false);

    aplicarModoEscuro(localStorage.getItem(CH.escuro)==="1",false);

    // Recursos removidos do menu “Mais opções” não ficam presos em um estado invisível.
    document.body.classList.remove("foco-reforcado","reduzir-movimento","contraste-reforcado");
    localStorage.removeItem("educa_foco_reforcado");
    localStorage.removeItem("educa_reduzir_movimento");

    atualizarAparenciaNativa();

    qs("#abrirCoresVisao")?.addEventListener("click",e=>abrirDialogo("acessTelaCores",e.currentTarget));
    qsa("[data-acess-voltar]").forEach(b=>b.addEventListener("click",()=>fecharDialogo(b.closest("dialog"))));
    qsa(".acess-dialogo").forEach(d=>d.addEventListener("cancel",e=>{e.preventDefault();fecharDialogo(d);}));

    qsa('input[name="paletaAcessivel"]').forEach(r=>r.addEventListener("change",()=>aplicarPaleta(r.value)));

    qs("#modoEscuroAcessivel")?.addEventListener("change",e=>aplicarModoEscuro(e.currentTarget.checked));
    qs("#altoContraste")?.addEventListener("change",e=>aplicarAltoContraste(e.currentTarget.checked));
    qs("#lerTelaAutomatico")?.addEventListener("change",e=>definirLeituraAtiva(e.currentTarget.checked,true));

    const leituraSalva=localStorage.getItem(CH.leitura)==="1";
    const toggleLeitura=qs("#lerTelaAutomatico");
    if(toggleLeitura)toggleLeitura.checked=leituraSalva;
    if(leituraSalva){
      // Mantém o modo de leitura entre páginas. Em navegadores que exigem gesto do usuário,
      // o primeiro acionamento do interruptor já fornece esse gesto.
      setTimeout(()=>{
        if(qs("#lerTelaAutomatico")?.checked) falarTexto(textoVisivelDaTela());
      },450);
    }

    qs("#restaurar")?.addEventListener("click",()=>{
      pararLeitura("");
      Object.values(CH).forEach(k=>localStorage.removeItem(k));
      localStorage.removeItem("educa_alto_contraste");
      localStorage.removeItem("educa_foco_reforcado");
      localStorage.removeItem("educa_reduzir_movimento");
      document.body.classList.remove(...classesPaleta,"alto-contraste","contraste-reforcado","modo-escuro-acessivel","foco-reforcado","reduzir-movimento");
      qsa('input[name="paletaAcessivel"]').forEach(r=>r.checked=r.value==="original");
      const escuro=qs("#modoEscuroAcessivel"); if(escuro)escuro.checked=false;
      const contraste=qs("#altoContraste"); if(contraste)contraste.checked=false;
      const leitura=qs("#lerTelaAutomatico"); if(leitura)leitura.checked=false;
      localStorage.setItem(CH.velocidade,"1.02");
      atualizarAparenciaNativa();
      fecharTodosDialogos();
      status("Configurações de acessibilidade restauradas.");
    });

    qs("#fecharAcessibilidade")?.addEventListener("click",()=>fecharTodosDialogos());
    qs("#overlay")?.addEventListener("click",()=>fecharTodosDialogos());
    qs(".atalho-conteudo")?.addEventListener("click",()=>setTimeout(()=>qs("#conteudoPrincipal")?.focus(),0));

    // Cancela a fala ao sair da página para não sobrepor a próxima leitura.
    window.addEventListener("pagehide",()=>{try{window.speechSynthesis?.cancel();}catch(_){ }});
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init); else init();
})();
