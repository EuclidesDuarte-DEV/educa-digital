# Educa+ Digital V111.30 — Diagnóstico da inferência Kokoro

O diagnóstico V111.29 mostrou o estágio “Fonetizado em português; sintetizando áudio pf_dora… / Sem erro”. Essa mensagem **não significa que o áudio foi gerado**: significa somente que o Worker chegou à execução do modelo.

## Mudanças
- Primeira tentativa em CPU WebAssembly q8 (em vez de escolher automaticamente GPU fp32), opção WebGPU disponível para comparação.
- Texto inicial curto para isolar lentidão de inferência.
- Relatório de estágio, mecanismo e número de tokens.
- Watchdog: 90 segundos para áudio e 180 segundos para carregamento; finaliza Worker travado e permite nova tentativa.
- Não instala Kokoro no Windows nem demanda Cloudflare Containers pago.
- Não altera banco D1, conversas, atividades ou lógica de simulação.

## Como testar
1. Extraia esta versão em pasta nova, abra a pasta no VS Code.
2. `npm.cmd install` e `npm.cmd test`.
3. `npx.cmd wrangler dev` e abra `http://127.0.0.1:8787/testar-voz-lia.html`.
4. Escolha **CPU q8**, clique em **Preparar modelo**, depois **Gerar voz e ouvir**.
5. Se o áudio aparecer, clique em Play; se der erro, use **Copiar diagnóstico** e envie o texto.
6. Se CPU falhar, teste **WebGPU fp32** no seletor para comparar (pode consumir mais memória).
7. Só publique com `npx.cmd wrangler deploy` depois de ouvir áudio real.

## Limitações
- Código não prova que a inferência funcione neste navegador; dependências externas precisam carregar e áudio real precisa ser ouvido.
- A causa exata de um travamento (memória, GPU, ORT, rede ou API) só poderá ser identificada com o novo diagnóstico/Console.
- Lip-sync realista de vídeos MP4 ainda não é neural, continua aproximado.
