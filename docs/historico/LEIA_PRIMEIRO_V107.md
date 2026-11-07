# EDUCA+ DIGITAL V107 — Modo Livre com desafios automáticos e IA

**Versão local, NÃO publicada na Cloudflare nem enviada ao GitHub.**

## O que mudou da V106

- **Removido o botão “Desafio”.** O usuário recebe situações de forma automática, sem precisar iniciá-las manualmente.
- Ao entrar no Modo Livre, em aproximadamente **1 segundo**, chega uma mensagem fictícia do contato “Rafael · número novo” solicitando um Pix de treinamento. A notificação pode ser aberta ou dispensada; a mensagem permanece na caixa de entrada do WhatsApp simulado e o ícone indica mensagem não lida.
- O participante digita livremente. O personagem responde com **Workers AI no Cloudflare**, via `POST /api/modo-livre/conversar`, se o binding `AI` estiver ativo. No Flask local e na indisponibilidade do Workers AI, usa **roteiro simples** — não confundir o fallback com IA.
- Ao resolver a primeira situação e voltar ao Android, uma **ligação suspeita pode aparecer automaticamente**. A pessoa pode atender, recusar, escrever, ouvir a fala sintetizada em pt-BR ou usar reconhecimento de voz quando o navegador permitir e o microfone for autorizado.
- O Banco/Pix do treinamento continua fictício e permite cancelar ou confirmar um Pix educativo, com retorno sobre o risco.
- Após esses eventos, novas situações sorteadas podem ocorrer. O sistema evita interromper conversas e decisões já em andamento.
- Mantidos os ícones Android originais, os seis módulos, as 22 atividades, o pré-teste, a narração Archie já utilizada e o backend existente. Nenhum banco de produção é alterado.

## Como experimentar

Abra a pasta `EDUCA_DIGITAL_V107_MODO_LIVRE_AUTOMATICO_IA` no VS Code.

```powershell
py -3 -m pip install -r requirements.txt
py -3 app.py
```

Acesse `http://127.0.0.1:5000`, conclua o pré-teste e entre em **Modo Livre**. A mensagem surge sozinha logo depois de entrar. Abra o WhatsApp, converse e resolva a situação. Para provocar outra situação, conclua a primeira e retorne à tela inicial — não existe mais botão “Desafio”.

**Testes do código:** `npm.cmd test`.

## IA e publicação

A integração já está implementada em `src/free-chat.js` e `src/worker.js`, com `[ai] binding = "AI"` em `wrangler.toml`. **Isso NÃO significa que a IA real já esteja habilitada ou testada na sua conta**. O teste com modelo real requer ambiente Cloudflare e disponibilidade/cota do Workers AI. O código de teste usa IA simulada.

- Evite usar informações pessoais reais, inclusive chaves Pix, números de telefone, CPF, códigos e senhas.
- Não altere o banco D1 nem aplique `banco/schema.sql` em produção.
- Antes de publicar, faça backup e teste em navegador desktop e celulares, inclusive consentimento do microfone e alto volume. Não publique diretamente sem aprovação.
- Não há mensagens, ligações, transferências ou contatos reais.
- Para testar com Workers AI remotamente, use uma implantação de teste separada e confirme logs, latência, custos e limites antes da produção.

## Limitações

- Não é Android real, nem WhatsApp real: é uma simulação pedagógica navegável.
- O primeiro evento é roteirizado para garantir que haja um desafio imediato; **a IA gera as respostas posteriores** quando disponível. Eventos seguintes vêm de um catálogo, com ordem parcialmente aleatória.
- Chamadas utilizam síntese e reconhecimento de voz opcionais do navegador, não voz de IA em tempo real full-duplex. O bloqueio de reprodução automática/áudio pode variar por dispositivo.
- A validação visual no navegador automatizado não pôde ser concluída nesta execução por uma restrição do ambiente; testes automatizados de código foram executados.
