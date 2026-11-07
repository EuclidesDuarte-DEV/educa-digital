# Educa+ Digital V111.14 — resultados de verificação

- `node --check public/static/js/free-video.js`: aprovado.
- `npm test`: **71 testes aprovados**, nenhuma falha (67 anteriores + 4 novos de UI).
- Preview renderizado em Chromium headless com 390 × 844 px: elementos renderizados, sem erro de JavaScript no preview estático.
- Verificação interativa com Chromium (320 × 620 px), JavaScript real da videochamada: controles de som alternam estado, legendas aparecem apenas quando ativadas, teclado abre e fecha, sem rolagem horizontal e sem exceções de JavaScript.
- Não foi feito deploy na Cloudflare, nem alteração do D1; MuseTalk real continua dependendo de GPU e motor configurado.
- Câmera real e saída de áudio no Safari/iPhone ainda exigem teste manual no dispositivo do usuário; não foram verificados fisicamente.
