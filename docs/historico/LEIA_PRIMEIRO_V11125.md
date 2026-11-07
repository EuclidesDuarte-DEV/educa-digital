# Educa+ Digital V111.25 — abrir somente o site

A **hospedagem do Educa+** é a entrada principal. O Modo Livre tem IA via
Cloudflare Workers AI, independentemente de `ollama serve` ou dos scripts CMD
no notebook. A LIA independente continua fora deste projeto.

Com a hospedagem atual publicada corretamente, já é possível conversar por
texto e, quando houver voz feminina compatível no navegador, ouvir a Lia.
O avatar conserva vídeos ilustrativos de fala/escuta, sem prometer lábios exatos.

O Kokoro real só ficará automático a todos depois de implantar um backend
neural remoto HTTPS e ativar os controles indicados em
`README_HOSPEDAGEM_AUTOMATICA_V11125.md`. Apenas alterar os arquivos não liga
um servidor remoto nem publica este ZIP no seu domínio.

### Testes
`npm test`: cobertura de regressão e testes isolados do gateway hosted.
`GET /api/modo-livre/capacidades`: conferir IA e rota de voz anunciadas.

### Publicação (equipe técnica)
Com Cloudflare autenticado: `npm install` e `npm run deploy`. Se já estiver em
produção, **não altere os segredos existentes sem validar**. O banco D1 e os
arquivos originais de atividades permanecem inalterados neste pacote.
