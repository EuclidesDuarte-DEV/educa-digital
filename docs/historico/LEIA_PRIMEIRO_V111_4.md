# Educa+ Digital V111.4 — Lia realista (Lovable), sem Simli

## O que foi integrado de verdade

- Projeto base integral **V111.3**, sem substituir as 22 atividades, o pré-teste, o Modo Livre, o Worker, ou o D1.
- Vídeo original do Lovable fornecido pelo usuário em `public/static/videos/lia-lovable-referencia.mp4` (com o áudio original, apenas para prévia gravada) e quadro do mesmo rosto em `public/static/img/lia-lovable-poster.jpg`.
- **Nova rota `/lia-realista.html`**: vídeo de demonstração com selo de prévia gravada; botão Atender; conversa por texto ou reconhecimento de voz (quando disponível); retorno da **IA já existente na Cloudflare**; voz via Web Speech como fallback; opção de conectar o motor privado Kokoro/MuseTalk da equipe.
- Motor local: `lia_motor/assets/lia-lovable-movimento.mp4` é agora a fonte padrão de movimento da **personagem fictícia** para MuseTalk, mantendo suporte à configuração `LIA_MOTION_SOURCE`.
- `/lia-ao-vivo.html` ganhou link para a nova experiência sem alterar seu renderizador 3D anterior.

## O que **não** foi feito / limitações técnicas

- O repositório exportado do Lovable continha apenas uma aplicação TanStack vazia com `blank-app-v1.svg`; **nenhum motor de avatar ou modelo 3D foi entregue no ZIP**. Os seis segundos de vídeo compartilhados são a única referência visual obtida, não o modelo original da geração.
- O clipe gravado **não é mostrado como se fosse sincronizado com as respostas**. Sem GPU/modelos MuseTalk, durante a fala aparece a imagem parada e a voz do navegador; a conversa por texto ainda depende de Workers AI, que requer backend ativo.
- A geração neural **não é streaming WebRTC**. Kokoro e MuseTalk fazem processamento por turnos; podem demorar muito sem GPU. A Cloudflare hospeda site e Worker, **não fornece a GPU MuseTalk**. Nenhuma execução real do MuseTalk/Kokoro foi feita nesta entrega.
- O vídeo possui **6 s, 512×910, 30 fps**. É uma boa referência visual mas um trecho mais longo, com fala neutra e movimentos mais variados, tende a ser melhor para vídeo produzido. Com `LIA_REQUIRE_BODY_MOTION=true`, o diagnóstico ainda marca menos de 8 s como insuficiente; este limiar é uma política do projeto, não um requisito absoluto do MuseTalk.
- Na renderização o navegador recebe um MP4 sincronizado contendo o áudio gerado; quando indisponível, o Kokoro entrega somente WAV. Não usar um vídeo gravado de 6 s repetido e fingir que fala novas frases.
- O vídeo original tem resolução de 512×910; o CSS adapta ao iPhone e computadores sem aumentar magicamente sua resolução.

## Como testar antes de publicar

### Navegador no computador

1. Abra a pasta extraída.
2. `npm install` e `npm test` para verificar o projeto.
3. `npm run dev` (precisa de wrangler/D1 local na primeira vez), e abra `http://localhost:8787/lia-realista.html` se essa for a porta que o Wrangler indicar.
4. Ou instale as dependências Flask de `requirements.txt`, execute `python app.py` e abra `http://127.0.0.1:5000/lia-realista.html` (com backend local, o chat da IA pode estar indisponível — isso é esperado).
5. Teste os botões **Ver referência gravada**, **Atender**, **Encerrar**. Quando o navegador disponibilizar Speech Synthesis, deverá ouvir uma resposta introdutória.

### MuseTalk + Kokoro (opcional)

O motor da V111.3 permanece em `lia_motor/`. É preciso instalar e configurar separadamente Kokoro, MuseTalk 1.5, FFmpeg, pesos dos modelos, Python compatível e, para velocidade razoável, GPU CUDA. Veja `lia_motor/README.md` e documentação V110.8/111.3.

- `LIA_MOTION_SOURCE` agora assume `lia_motor/assets/lia-lovable-movimento.mp4` na ausência de override.
- O **Worker** precisa de `LIA_ENABLED=true`, `LIA_BACKEND_URL` HTTPS público da equipe, `LIA_BACKEND_TOKEN` (secret) e `LIA_STAFF_CODE` (secret) já suportados no projeto. Nunca coloque tokens em JavaScript, no repositório ou no ZIP.
- Na página `/lia-realista.html`, clique **Configurar motor Kokoro/MuseTalk (equipe)** e digite apenas o código de teste (não o token do backend).
- Confirme o `GET /api/avatar/health` sinalizando `video_enabled: true`. Mesmo assim, teste um render real; um health check não é prova de qualidade visual.

### Publicação Cloudflare

Faça backup do código e do D1 remoto. Com login do Wrangler, só depois de revisar e testar execute `npm run deploy`. **Não rode `banco/schema.sql` no banco remoto e não mova o repositório Lovable vazio para cima do Educa+ Digital.** Nenhuma publicação foi executada aqui.

### Nota importante sobre as versões

O ZIP `realistic-3d-avatar-main.zip` exportado do Lovable não possui o gerador que fez o MP4. Portanto é tecnicamente incorreto declarar que exportamos o avatar neural vivo do Lovable. Esta V111.4 integra o **vídeo de referência e o pipeline próprio já existente**, que precisa ser ativado no servidor com GPU.
