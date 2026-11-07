# Educa+ Digital V111.12 — rosto da Lia maior e fluxo automático

Esta versão parte **integralmente da V111.11** (voz feminina, Lia em clipes de fala/escuta, Cloudflare Worker, banco D1 e motor neural opcional). Nenhum banco remoto foi alterado e não foi feito deploy.

## Mudanças

- **Videochamada imersiva**: o rosto ocupa todo o fundo do telefone; nome, selo de simulação e câmera pequena no alto; controles de chamada mais compactos e fixados embaixo.
- **Legenda reduzida**: exibe até duas linhas; se houver texto maior, botão **Ler tudo / Recolher** mantém o conteúdo disponível. A fala e as mensagens não foram excluídas.
- **Sem excesso de botões**: opções de verificação do motor e escolha de voz feminina foram colocadas em **⚙ Ajustes da chamada**, inicialmente recolhido. **Conferir identidade** continua disponível durante a ligação, pois faz parte da aprendizagem.
- **Fluxo sem confirmar cada etapa**: ao concluir a atividade WhatsApp (bloquear contato ou conferir por canal conhecido), aparece um breve resumo e a **videochamada toca automaticamente**. Ao encerrar/conferir a videochamada, inicia automaticamente a **ligação da falsa central bancária**. Depois dela, o Modo Livre volta a gerar novas situações. O botão **Avançar agora** é só um atalho para não aguardar a transição.
- **Segurança**: a chamada continua sendo uma simulação com a personagem fictícia Lia; Pix fictício, sem transmissão da câmera do aluno. O uso de MuseTalk/Kokoro não foi modificado.

## Testar no computador

1. Extraia este ZIP.
2. Abra a pasta raiz no VS Code.
3. No PowerShell: `npm.cmd install`, `npm.cmd test`, `npm.cmd run dev`.
4. Entre no Modo Livre, abra a notificação de WhatsApp, bloqueie o contato e **não clique em Próximo**: a videochamada deve aparecer por conta própria em aproximadamente 3 segundos.
5. Toque em **Atender** (necessário para ativar áudio no navegador), finalize a ligação com **Encerrar** ou **Conferir identidade** e observe a próxima ligação telefônica aparecer sem novo clique de navegação.
6. A opção **⚙ Ajustes da chamada** expande o diagnóstico do avatar e a escolha de voz feminina quando necessário. O botão **Ler tudo** expande a legenda.

O avanço é automático entre atividades; **atender à videochamada continua exigindo toque do aluno**, especialmente para permitir áudio no Safari/iPhone. Isso imita uma ligação real sem forçar permissões.

## Publicação na Cloudflare

`npm.cmd run dev` é local e **não publica**. Caso seu projeto já esteja configurado para a conta e Worker corretos, publique separadamente com `npm.cmd run deploy` após verificar o alvo da configuração. **Não rode `banco/schema.sql` ou migrações no banco D1 de produção.** Preserve suas variáveis privadas e o backend de GPU externo, quando usado.

Limite técnico mantido: sem MuseTalk em GPU, clipes de vídeo são pré-gravados e a sincronia labial com o áudio da IA é apenas aproximada; a V111.12 não transforma esses clipes em vídeo neural em tempo real.
