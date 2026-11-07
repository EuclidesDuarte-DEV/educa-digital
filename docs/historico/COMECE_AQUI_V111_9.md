# Educa+ Digital V111.9 — alternância natural da Lia

Esta versão **atualiza a V111.8**. Preserva o protótipo Android, pré-teste obrigatório, seis módulos, 22 atividades, conteúdo educativo, Cloudflare Worker e D1, e mantém a IA conversacional atual.

## O que foi corrigido

1. **Durante a fala**: a Lia usa `lia-conversando-a.mp4`, `-b.mp4`, `-c.mp4` (todos mudos) em sequência não repetitiva. Se a voz durar mais que um clipe, o próximo começa antes de o anterior acabar. O áudio da IA segue contínuo e não fica preso a um vídeo.
2. **Na escuta**: três alternativas mudas com boca fechada (`lia-ouvindo.mp4`, `-b.mp4`, `-c.mp4`) são alternadas sem repetir o mesmo arquivo imediatamente. `b` foi recortado de um intervalo silencioso já existente em `lia-conversando-b.mp4`; `c` é uma variação de duração/trecho da gravação de escuta original. Não são três novas gravações independentes.
3. Dois elementos `<video>` por estado permitem que um vídeo entre enquanto o outro sai, com transição de 260 ms e sem reiniciar a voz.
4. Ao encerrar, pausar ou interromper o áudio, a Lia sai do estado de fala e volta para a escuta. O botão Encerrar libera os vídeos.
5. Na rota de **MuseTalk**, o vídeo MP4 gerado para aquela resposta continua com prioridade, incluindo o áudio sincronizado. As alternâncias de clipes gravados são apenas a alternativa sem inferência de vídeo.
6. O Service Worker recebeu novo nome de cache para não reutilizar JavaScript antigo após uma atualização.

## Teste rápido sem Cloudflare nem GPU

Na pasta raiz do ZIP descompactado, com Python instalado:

```powershell
python -m http.server 8766 --directory public
```

Abra **http://localhost:8766/teste-lia-voz-video.html**; clique em **Fazer Lia falar**, digite uma frase longa e observe as alternâncias; teste também **Próximo gesto** e **Parar fala**. Esse arquivo usa a voz disponível no navegador e não conversa com a IA em nuvem.

## Testar com a IA do Educa+ Digital

```powershell
npm.cmd install
npm.cmd test
npm.cmd run dev
```

Abra o endereço local indicado pelo Wrangler, faça o pré-teste, entre no Modo Livre e atenda à videochamada. A conversa envia as respostas ao Worker de IA; a reprodução escolhe entre voz local disponível e backend Kokoro configurado, conforme sua instalação. **Nenhum novo serviço MuseTalk ou Kokoro é habilitado automaticamente pela atualização.**

## Estado real da solução

- A alternância **não gera movimentos labiais fonema a fonema**. Vídeos silenciosos de fala são ilustrativos e podem não corresponder à frase da IA.
- Para sincronia labial do áudio da frase atual, mantenha MuseTalk 1.5 instalado em hardware próprio com GPU e o backend Kokoro configurado; o navegador e a Cloudflare, sozinhos, não executam inferência GPU.
- A chamada é identificada como **SIMULAÇÃO COM IA · PERSONAGEM FICTÍCIA** para treinamento contra golpes; não se trata de uma pessoa de verdade ou de uma chamada telefônica externa.
- **Não execute migrações D1, nem publique na Cloudflare sem revisão.** Este ZIP é uma atualização local, não um deploy remoto já realizado.

## Arquivos alterados

- `public/static/js/free-video.js`
- `public/static/css/lia-fotorreal.css`
- `public/html/index.html`
- `public/teste-lia-voz-video.html`
- `public/static/videos/lia-ouvindo-b.mp4` e `lia-ouvindo-c.mp4` (novos)
- `public/static/sw.js`
- testes `tests/lia-clips-v1119.test.js`, `tests/lia-live-state-v1118.test.js`, `tests/free-video.test.js`
