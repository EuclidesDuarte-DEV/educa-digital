# Educa+ Digital V111.1 — Lia 3D na videochamada principal

## O que mudou de fato

A V111.0 tinha apenas um **laboratório separado** de avatar. Esta V111.1 incorpora um **canvas WebGL com avatar 3D real** dentro da tela da **chamada do Modo Livre**. Não se trata de MP4, frames de foto ou MuseTalk.

- A mesma tela Android, o gatilho de chamada, a IA conversacional pelo Cloudflare Worker, a opção de microfone por reconhecimento do navegador, a câmera LOCAL opcional do visitante, botões de verificar/encerrar e o Pix fictício foram preservados.
- O `public/static/js/lia3d-call.js` carrega um `.glb` com **TalkingHead 1.8** e tenta ativar **HeadAudio**. Um GLB rigado tem movimentos contínuos de rosto, olhos, cabeça e tronco; os gestos de mão/braço são decididos por regras simples relacionadas ao texto da IA.
- Se o **Kokoro** estiver acessível, autorizado com código de equipe, o áudio WAV gerado pelo servidor é reproduzido via `head.speakAudio`, e o HeadAudio pode atualizar os blendshapes durante a fala. Sem Kokoro, usa a voz pt-BR do navegador (se disponível), com movimentação labial **estimada a partir do texto**, não visemas reais.
- É possível importar arquivo GLB local diretamente na tela da chamada; o GLB **não é enviado** para a Cloudflare. Arquivos com referências externas de mídia são rejeitados na importação.
- **Não existe chamada WebRTC real de pessoa para pessoa**: a conversa é simulada e **por turnos** com IA. Não alegar comunicação humana autêntica nem perfeição dos movimentos.

## Abrir e testar pelo Windows

Na raiz do projeto:

```powershell
npm.cmd install
npm.cmd test
npm.cmd run dev
```

O `predev` configura somente o **D1 LOCAL**, não o banco D1 remoto. Use a URL mostrada no terminal, entre no pré-teste e depois no **Modo Livre** até a chamada de vídeo educativa. Quando o celular de treino receber a chamada, clique em **Atender**. O avatar deve começar a carregar. A primeira visita depende de internet para baixar JavaScript e o GLB externo; caso a conexão/CDN esteja indisponível, fica um aviso em vez de exibir uma falsa animação neural.

Para teste independente do personagem e de áudio importado, a página `/lab-lia-3d.html` da V111.0 continua disponível.

## Modelo definitivo da Lia

**A imagem PNG antiga da Lia não é um modelo 3D.** O ZIP **não inclui** uma transformação 3D fotorealista desse PNG. A chamada começa com um avatar Avaturn **genérico de demonstração, NÃO COMERCIAL**, obtido de URL externa. Ele **não é a Lia definitiva**.

Para colocar a Lia definitiva, crie/exporte legalmente um modelo `.glb` completo de personagem fictícia com estrutura óssea compatível com Mixamo, blendshapes ARKit e visemas Oculus (consulte https://github.com/met4citizen/TalkingHead). Durante a chamada, use **Carregar avatar 3D (.glb)**. A importação é local à sessão atual e não é salva no servidor.

Sem esses blendshapes e rig, a cabeça/braços/boca não terão os movimentos esperados. **Sem o modelo definitivo e sem teste WebGL visual, não é correto declarar fotorrealismo ou prontidão para produção.** As bibliotecas e o modelo Avaturn de teste podem não permitir uso comercial: cheque as licenças antes de publicar para público.

## Voz Kokoro (somente equipe)

1. Ative o backend FastAPI/Kokoro já existente na V110.7, **sem precisar de MuseTalk**. Ex.: dentro de `lia_motor`, use um Python virtual com as dependências de `requirements.txt` e defina `LIA_API_TOKEN` com 20+ caracteres.
2. Ative a configuração da Cloudflare somente se houver **HTTPS seguro** do Worker até seu backend. Variáveis de ambiente (sem publicar segredos no repositório): `LIA_ENABLED=true`, `LIA_BACKEND_URL=https://...`, `LIA_BACKEND_TOKEN=<token>` e `LIA_STAFF_CODE=<código de teste>`. Não use `127.0.0.1` como backend do Worker remoto.
3. Quando o backend estiver ativo, durante a chamada clique em **Configurar Kokoro (equipe)** e digite apenas o código específico de teste. O código fica em memória no navegador e é descartado ao encerrar; não use CPF, senha pessoal ou conta bancária.
4. Na próxima resposta, a voz `pf_dora` será sintetizada no backend. O WAV é entregue pelo gateway `/api/avatar/speak` e `/api/avatar/media/…wav`; o **mesmo áudio** dirige o avatar pelo HeadAudio quando disponível. O renderizador roda no navegador e **não precisa de GPU para gerar vídeos**, pois nenhum vídeo neural é produzido.
5. Se Kokoro estiver desligado/indisponível, o sistema tenta usar uma voz `pt-BR` do dispositivo. Nesse modo o lip-sync é aproximado. O navegador pode usar serviços próprios para STT/TTS; consulte políticas do dispositivo.

**Cloudflare Workers não executa diretamente Kokoro/TTS Python**. A infraestrutura de síntese (PC/servidor privado) pode consumir CPU e energia; a solução **elimina cobrança da Simli por minuto**, não garante custo zero total para hospedagem/IA.

## Publicação (não executada por esta entrega)

Depois de testar localmente, faça backup da implantação atual e dos dados remotos; confirme seus segredos e execute:

```powershell
npm.cmd run deploy
```

O `wrangler.toml` continua apontando para o Worker `educa-digital` e para o banco existente. **Esta versão não executa migração nem recria D1 remoto.** `npm run deploy` muda o Worker/arquivos em produção; só rode quando estiver pronto.

## Limites e verificação

- Foram executados `node --check` e **41 testes Node.js, com 41 aprovações**. Abrangem HTML, rotas, integração estática, gravação/câmera, IA e segurança do Worker. Os testes **não comprovaram** execução de WebGL no celular, qualidade do GLB, latência ao vivo, sincronização pt-BR, acesso a CDN externos ou servidor Kokoro ativo.
- A biblioteca HeadAudio atualmente utiliza um modelo acústico em inglês. Com `pf_dora` (pt-BR) o movimento da boca reage à voz, mas **não é alinhamento fonêmico perfeito**.
- `lia_motor/server.py` mantém endpoints legados de MuseTalk para compatibilidade com versões anteriores; **a tela V111.1 não chama nenhum deles**. `public/static/js/neural-avatar.js` continua arquivado, mas não é importado por `index.html`.
- A videochamada educativa e o avatar são sempre explicitamente identificados como **simulação com IA/personagem fictícia**. Não importar a aparência/voz de pessoas reais para criar impostores sem autorização.
