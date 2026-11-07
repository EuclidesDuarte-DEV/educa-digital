# Educa+ Digital V106 — Android livre com desafios e IA

**Esta é uma NOVA versão local do projeto. Não foi publicada automaticamente na Cloudflare nem enviada ao GitHub.**

## O que mudou

- A tela duplicada e os ícones gigantes da V105 foram removidos. O Modo Livre agora abre o **`homeView` do Android já existente**, com todos os ícones originais intactos.
- Corrigido um erro de HTML na V105: o `<link>` de `android-system.css` estava sem `>`, comprometendo a aplicação dos estilos seguintes.
- Criados avisos inesperados após um intervalo variável. Podem surgir durante a navegação; o participante decide se abre ou ignora.
- WhatsApp e SMS fictícios possuem caixa de entrada e mensagens digitadas livremente, com respostas de roteiro local ou IA no Cloudflare Worker.
- Ligações fictícias podem ser atendidas/recusadas; resposta por teclado, voz sintetizada via navegador, e microfone quando `SpeechRecognition` estiver disponível e autorizado.
- O Banco Educa original continua disponível; tocar em Banco → Pix → Enviar Pix durante o Modo Livre abre uma confirmação **100% fictícia** relacionada ao desafio.
- O usuário pode **confirmar o Pix fictício e aprender com o erro** ou cancelar, verificar contato e aprender com a decisão segura. Nunca há pagamento ou números/chaves Pix verdadeiros.
- Conservados os 6 módulos, 22 atividades, pré-teste, vídeos (incluindo Archie pt-BR via URL já existente), banco de dados e restante do site.

## IA, hospedagem e modo offline

- `wrangler.toml` possui `[ai] binding = "AI"`.
- A rota `POST /api/modo-livre/conversar` usa `env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', ...)` somente quando o binding está disponível.
- Há fallback roteirizado quando a chamada de IA falha ou a aplicação é testada localmente no Flask. Esse fallback não equivale a uma IA conversacional completa.
- **Não foram realizados testes com a conta real da Cloudflare.** Faça um teste em ambiente de prévia antes de publicar; Workers AI tem limites/consumo por requisição.
- O serviço de reconhecimento de voz de alguns navegadores pode processar áudio externamente. Não habilite por padrão nem use dados reais.

## Testar em Windows / VS Code

Abra a pasta onde estão `app.py` e `wrangler.toml`, e execute:

```powershell
py -3 -m pip install -r requirements.txt
py -3 app.py
```

Acesse `http://127.0.0.1:5000` e conclua o pré-teste para abrir os assuntos. Toque em **Modo Livre**.

Para os testes JavaScript/backend:

```powershell
npm.cmd install
npm.cmd test
```

Teste manual sugerido: iniciar Modo Livre → esperar a mensagem ou tocar em **Desafio** (apenas para testar) → abrir WhatsApp → responder → entrar no Banco → Pix → Enviar Pix → confirmar/cancelar → observar retorno educativo. Teste também o app Telefone, atender/recusar, verificar e sair do modo.

## Antes de publicar

1. Faça backup do código e confira se esta é a pasta V106, não V104/V105.
2. Teste no celular real, especialmente telas estreitas, zoom e teclado virtual.
3. Confira o áudio Archie no link externo e as 22 atividades preexistentes.
4. Confira a IA e os limites da Cloudflare no seu ambiente; nenhuma chave deve estar no JS público.
5. Não rode `banco/schema.sql` no banco D1 atual. Esta versão **não exige migração do banco**.
6. Após revisão e autorização, execute `npm.cmd run deploy` na pasta correta. O GitHub deve ser sincronizado separadamente se desejado.

## Limitações conhecidas

- O Modo Livre é **uma simulação web**, não um Android real; a navegação de aplicativos reaproveita os já existentes, com comportamentos de treino.
- O agendador cria situações de um catálogo finito; a IA, quando disponível, **conversa dentro do cenário**, mas ainda não inventa qualquer evento do zero.
- A voz da ligação utiliza recursos opcionais do navegador, não um motor de voz full duplex em tempo real.
- As situações do Modo Livre não são salvas no D1; a sessão se reinicia ao sair.
