# Educa+ Digital V111.10 — videochamada após o golpe no WhatsApp

A V111.10 é uma atualização incremental da V111.9. **Nenhuma migração de banco ou implantação remota foi realizada.** Preserva Cloudflare Workers AI, D1, conteúdos de aprendizagem, MuseTalk/Kokoro opcionais e os clipes de fala/escuta da Lia.

## Nova ordem do Modo Livre

1. **Golpe pelo WhatsApp**: um falso familiar escreve pedindo Pix fictício. O participante pode responder, usar **Conferir por outro canal** (agenda simulada) ou **Bloquear contato** para concluir de forma segura. Se descartar a notificação, a atividade permanece pendente; a ligação não é antecipada.
2. **Videochamada com a Lia**: depois da conclusão do WhatsApp, o resumo mostra o botão **Próximo: videochamada com IA**. Ao clicar, a Lia liga imediatamente; também aparece automaticamente após retornar ao celular. A simulação continua com selo **PERSONAGEM FICTÍCIA**. A sincronização labial exata depende do backend opcional MuseTalk, não desta alteração.
3. **Ligação telefônica suspeita**: depois da videochamada, o resumo oferece **Próximo: ligação telefônica**, com a falsa central bancária (voz). Não foi excluída.
4. Ao completar esses três eventos, o Modo Livre volta a sortear demais situações de treino (códigos, entregas, etc.).

**A ordem avança quando um desafio é concluído** (inclusive se o aluno escolheu a opção insegura de Pix *fictício*); não avança apenas porque um aviso foi recebido ou dispensado. O objetivo pedagógico é não saltar a experiência de vídeo.

## Como testar neste computador (VS Code / Windows PowerShell)

Extraia o ZIP, abra a pasta do projeto no VS Code e execute:

```powershell
npm.cmd install
npm.cmd test
npm.cmd run dev
```

Abra a URL indicada pelo Wrangler (em geral `http://localhost:8787`), entre no pré-teste e depois no **Modo Livre**. Aguarde a notificação do WhatsApp, abra a conversa e clique em **Bloquear contato** ou **Conferir por outro canal**. No resumo toque em **Próximo: videochamada com IA** e verifique se a Lia aparece **antes** da central bancária.

### Mudanças realizadas

- `public/static/js/free-mode.js`: sequência controlada por conclusão e acesso direto ao próximo desafio.
- `public/html/index.html`: botões de decisão e avanço, descrição do Modo Livre, revisões das URLs de cache.
- `public/static/css/free-mode.css`: visual e acessibilidade dos botões.
- `public/static/sw.js`: cache da versão atualizado.
- `tests/free-mode-sequence-v11110.test.js`: teste de fluxo integral e de avisos descartados.
- Atualização de testes legados para a ordem e cache novos.

## Cloudflare e segurança

**Não precisa criar banco de dados nem rodar migrações no D1 remoto** para esta atualização. `npm.cmd run dev` inicia a execução local; não publica automaticamente no site já hospedado. Para publicar, revise as configurações e o destino da conta antes de qualquer `npm.cmd run deploy`.

A videochamada continua sendo **simulação educativa com personagem fictícia**, não uma chamada real ao telefone. Não insira dados pessoais, códigos ou chaves Pix reais. Os motores de voz/vídeo locais, caso usados, ainda precisam ser iniciados separadamente.
