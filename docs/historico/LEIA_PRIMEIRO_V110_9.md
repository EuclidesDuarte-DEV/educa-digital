# Educa+ Digital V110.9 — Movimento coordenado da Lia (sem Simli)

Esta versão adapta o motor existente da V110.8 para aceitar um **vídeo-base autoral da Lia fictícia** com movimentos reais ou previamente animados de cabeça, olhar, ombros e postura. O MuseTalk v1.5 recebe esse vídeo de referência e substitui a área da boca com o áudio Kokoro. Os movimentos corporais **vêm da referência**, não são criados pelo MuseTalk.

## Configuração (Windows)

1. Mantenha a instalação da V110.8, o token privado e a conexão Cloudflare.
2. Crie um vídeo de 8 a 15 segundos, 25/30 fps, >= 480px, mostrando a Lia fictícia da cabeça até pelo menos os ombros, sem cortes bruscos e com boca neutra. Use vídeo original, gravado com autorização, ou gerado de personagem fictícia. Não use fotos nem rostos de terceiros reais.
3. Grave como `lia_motor/assets/lia_movimento.mp4`.
4. No terminal que inicia o servidor da Lia, defina as variáveis antes de rodar:

```powershell
$env:LIA_MOTION_SOURCE = (Resolve-Path '.\lia_motor\assets\lia_movimento.mp4').Path
$env:LIA_REQUIRE_BODY_MOTION = 'true'
```

5. Inicie o motor da Lia conforme as instruções já existentes e acesse `/health` com token para conferir `body_motion_quality.suitable=true` e `video_enabled=true`.
6. Faça uma chamada de teste; a resposta continua sendo um MP4 por turno, **não vídeo transmitido em tempo real**. Sem GPU, a chamada preserva áudio/texto e informa indisponibilidade do vídeo.

## O que fica pendente para realismo equivalente à referência

- Criar e avaliar um vídeo-base original longo o bastante com microexpressões e movimentos de tronco que sejam naturais e não repetitivos. O `lia_idle.mp4` incluído na V110.8 possui só 2 segundos em 512x512; não cumpre o requisito de movimento corporal.
- Validar o enquadramento do vídeo-base, porque o corte quadrado pode ocultar os ombros.
- Medir sincronização visema-áudio, erros em olhos, boca e queixo e tempo entre turnos numa GPU real.
- Para **conversa verdadeiramente contínua**, implementar streaming de áudio e vídeo com pipeline de baixa latência. O atual MuseTalk roda renderização assíncrona por resposta.

Não há SDK Simli ou cobrança por minuto neste código; o custo de GPU/servidor, energia e tráfego continua existindo. O projeto mantém identificação visível de **simulação educativa e personagem fictícia**.
