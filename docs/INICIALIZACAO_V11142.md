# Inicializacao V111.42 — LIA Educa+ Digital

- Nenhuma dependencia ou modelo e instalado automaticamente.
- `INICIAR_EDUCA_COM_LIA.cmd` inicia o site local Flask na porta 5015, verifica Ollama na 11434 e Kokoro Python na 8900.
- O modelo Kokoro **do navegador** e independente do motor Python e utiliza o pre-aquecimento do modo livre.
- A visita ao site online nao pode ligar o notebook do desenvolvedor; em producao e necessario backend hospedado ou arquitetura integralmente em navegador/Worker.
- Os arquivos em `LIGAR_LIA_EDUCA` sao legados mantidos para compatibilidade.
- `npm run dev` permanece com Wrangler e D1 local; nao foi alterado para evitar regressao.
- Na ausencia de Ollama ou Kokoro instalados, o comando avisa explicitamente; nao afirma que o motor esta pronto.
- Fluxo seguro: sem envio automatico de tokens para GitHub, sem mudancas em D1 remoto ou Cloudflare.
