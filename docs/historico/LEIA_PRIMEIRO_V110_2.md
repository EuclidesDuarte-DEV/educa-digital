# Educa+ Digital V110.2 — Lia com movimentos labiais

Esta atualização substitui o efeito artificial de boca na videochamada por **oito posições faciais derivadas do avatar fictício**. Os movimentos começam com a fala e terminam no silêncio; o sistema usa eventos `onboundary` da Web Speech API quando o navegador os disponibiliza. A combinação com texto é uma **aproximação de articulação**, não um motor neural de sincronização exata por fonemas nem streaming de uma pessoa real.

## Como testar

1. Extraia o ZIP e abra a pasta no VS Code.
2. Execute `npm.cmd install` (se necessário), `npm.cmd test` e `npm.cmd run dev`.
3. Acesse `http://127.0.0.1:8787`, conclua o pré-teste e entre no Modo Livre.
4. Atenda a videochamada da Lia. Observe a boca reagindo durante a locução e voltando ao repouso quando a fala termina.
5. Use *Falar* ou digite no campo; a resposta depende da IA real no Worker, não de respostas guiadas.
6. Ao selecionar *Verificar identidade* ou *Encerrar*, os movimentos devem cessar.

## Limitações

- Para fala fotorrealista com sincronização exata em tempo real, é necessário um motor próprio de avatar (por exemplo, Wireface 2D com SDK/rig licenciado ou serviço WebRTC especializado). Não há credenciais nem SDK privados desses provedores neste ZIP.
- A voz brasileira continua dependendo das vozes disponíveis no navegador/dispositivo.
- A câmera do aluno é opcional e só é acessada mediante permissão.
- O banco local segue sendo preparado por `npm.cmd run dev`, sem tocar no D1 de produção.
- O site da Cloudflare e o GitHub não foram alterados.
- Priorize teste com dispositivo real, verificando sotaque, latência, boca/voz, microfone e navegadores.
