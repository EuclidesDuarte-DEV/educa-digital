# Educa+ Digital V111.13 — Correção da videochamada da Lia

Esta versão contém o projeto V111.12 completo, sem alterar banco ou credenciais, e melhora a experiência da chamada:

- **Legenda no momento do áudio**: a resposta fica em preparação até o início real do `SpeechSynthesisUtterance.onstart`, `audio.onplaying` ou `video.onplaying`; em caso de voz indisponível, o texto fica acessível sem afirmar que está falando. A fala jamais é antecipada na tela só por receber a resposta textual da IA.
- **Resposta por voz mais ágil**: espera limitada a 650 ms pela voz feminina pt-BR quando o navegador ainda não informou as vozes, em vez dos 1,8 s anteriores. Se não existir voz feminina compatível, explica o bloqueio.
- **Interface compacta**: botões visíveis para Conversar, Digitar e Encerrar; conferir identidade fica em destaque educativo. Câmera, repetir áudio, Pix de treino e configuração neural/voz ficam em Ajustes da chamada. O teclado aparece ao tocar Digitar, não fica aberto permanentemente.
- **Voz neural original**: Kokoro e MuseTalk continuam opcionais por meio do gateway autorizado. Quando o MuseTalk está ativo, o áudio e o vídeo gerados são reproduzidos juntos. Sem GPU, os vídeos gravados são **ilustrativos**, não há sincronismo perfeito de boca; a sincronização da legenda com o início da fala não corrige fonemas dos clipes.

## Como testar

1. Extraia o ZIP e abra no VS Code a pasta onde estão `wrangler.toml` e `package.json`.
2. Rode `npm.cmd install` e `npm.cmd test`.
3. Rode `npm.cmd run dev` e abra a URL local do Wrangler (precisa do binding AI para diálogo; a interface é testável sem ele).
4. Siga WhatsApp → videochamada, toque em Atender e confirme: o texto da Lia só aparece quando a voz começa. Teste Digitar, Conversar, Ajustes, Ler tudo, Conferir identidade e Encerrar.
5. Teste num celular real com voz pt-BR instalada e, separadamente, com o backend Kokoro/MuseTalk autorizado, se existir.

**Não publicado na Cloudflare.** `npm.cmd run deploy` pode modificar seu site real; confira a conta/Worker antes. Não execute migrações D1 novamente. O serviço Cloudflare não processa MuseTalk (GPU externa continua necessária). Nenhum modelo/assinatura Simli foi incluído.
