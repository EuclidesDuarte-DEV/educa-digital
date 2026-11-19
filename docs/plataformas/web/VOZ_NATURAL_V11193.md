# V111.93 — Voz feminina mais natural e rápida (somente Web)

O objetivo é reduzir a espera percebida sem exigir uma GPU no computador dos participantes.

## Sempre disponível, sem custo adicional de TTS
- A LIA prefere vozes pt-BR explicitamente identificadas como **Natural/Neural/Online** pelo navegador e, quando disponível, o modelo local Kokoro **pf_dora**.
- Falas dinâmicas com voz Web Speech são reproduzidas **inteiras**, sem fragmentação que cause pausas robóticas. O Kokoro continua sendo pré-aquecido ao entrar no Modo Livre, com cache somente de uma saudação **fixa**.
- Se a voz de alta qualidade ficar lenta ou indisponível, o navegador recupera uma voz feminina identificada sem trocar timbre no meio do turno.

## Upgrade opcional de estúdio — Cloudflare
- O modelo **xai/grok-tts** oferece português brasileiro (\`pt-BR\`) e a voz \`ara\` (tom acolhedor). Preço publicado em 19/11/2026: **US$0,000015/caractere**. O custo depende do uso; **não está habilitado neste commit**.
- A implementação usa apenas o binding **AI** do Worker e um endpoint seguro \`POST /api/lia/voz-web/speak\`. Nenhuma API key é exposta ao navegador.
- **Não ativar sem consentimento explícito do responsável por custos.** Para testar isoladamente no Preview, configurar \`LIA_WEB_HQ_TTS_ENABLED=true\` **somente nas variáveis do Preview** Cloudflare. Não editar \`wrangler.toml\` da produção e não colocar o flag em \`[vars]\`.
- O endpoint \`GET /api/lia/voz-web/status\` informa se há configuração ativa, sem gerar áudio nem cobrança.
- O navegador Web abandona a tentativa premium após **2,2 segundos**, mantendo a conversa ágil com a voz local. O custo pode ocorrer mesmo se a resposta for descartada depois do timeout; orçamentos e WAF precisam ser configurados pela equipe.
- A API limita a 450 caracteres por chamada, recusa links, códigos e dados pessoais; limita solicitações por IP por instância e não armazena o conteúdo.
- O provedor retorna um arquivo MP3; o Worker busca o áudio de domínio permitido e entrega diretamente à Web. A sincronização labial é **aproximada**, pela energia do áudio. Realismo de boca fonema a fonema continua dependendo do MuseTalk/GPU.
- A qualidade natural de \`ara\` em **português brasileiro** e a latência real devem ser avaliadas em Preview. Pode haver variações de sotaque, custos ou incompatibilidade da conta.

## Testar
1. Conferir \`GET /api/lia/voz-web/status\` no Preview: \`enabled:false\` é o resultado seguro padrão.
2. Rodar \`node --test tests/platform-web-hq-voice-v11193.test.js\`, \`npm test\` e auditar Web em tela grande, tablet e celular.
3. Sem ativar cobrança, testar WhatsApp e depois videochamada: a resposta deve aparecer imediatamente em legenda e a voz feminina instalada começar rápido.
4. Apenas se a equipe aceitar o custo e configurar limites do AI Gateway/Workers AI, habilitar a variável no **Preview**. Medir tempos de resposta e qualidade da voz \`ara\` em pt-BR, preferencialmente com participação de idosos.
5. Não habilitar em produção nem fazer migração D1 como parte desta alteração. Android/iOS não usam esta rota.

Fontes oficiais:
- https://developers.cloudflare.com/ai/models/xai/grok-tts/
- https://developers.cloudflare.com/workers/previews/configuration/
