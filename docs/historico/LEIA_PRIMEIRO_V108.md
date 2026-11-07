# Educa+ Digital — V108 | Modo Livre + IA no WhatsApp original

## O que mudou

- O Modo Livre agora **abre o WhatsApp ORIGINAL do protótipo** (`data-view="whatsapp"` e `data-view="chat"`), mantendo a lista de conversas, a aparência, os ícones e as abas existentes.
- As telas duplicadas `free-inbox` e `free-chat` foram removidas.
- A primeira mensagem fictícia chega automaticamente logo após entrar no Modo Livre. Novos eventos podem surgir posteriormente ao usar o celular, inclusive chamadas.
- O usuário digita livremente; o frontend envia a mensagem e até oito mensagens de histórico ao endpoint `POST /api/modo-livre/conversar`.
- **Não existem respostas roteirizadas disfarçadas de IA.** O backend usa `env.AI.run` do Cloudflare Workers AI, modelo `@cf/meta/llama-3.1-8b-instruct-fp8`. Sem binding, cota ou resposta válida, a tela mostra indisponibilidade e não inventa conversa.
- O chat do WhatsApp usa os próprios elementos e estilos do protótipo. Ao sair do modo, contatos, prévias e notificações temporárias são restaurados.
- O Banco de treino e o Pix são fictícios; nenhum dinheiro real é movimentado. Chamadas e microfone usam recursos opcionais do navegador, não telefonia real.

## IMPORTANTE — IA REAL

O Flask (`py -3 app.py`) **não tem `env.AI`**. Ao abrir o projeto só pelo Flask, você poderá testar a interface, mas **não** terá respostas do modelo. Esse comportamento é intencional; a V108 não finge que está conversando com IA.

Para testar o modelo real, use a conta Cloudflare autenticada e o Wrangler. `wrangler.toml` já contém:

```toml
[ai]
binding = "AI"
```

No terminal PowerShell do VS Code, após extrair o ZIP e entrar na raiz do projeto:

```powershell
npm.cmd install
npm.cmd test
npx.cmd wrangler whoami
npx.cmd wrangler dev
```

Abra o endereço local exibido pelo Wrangler e passe pelo pré-teste até chegar ao Modo Livre. **A execução da IA pode contar para a cota da conta Cloudflare**, mesmo durante testes locais. Para validar, responda no WhatsApp com perguntas diferentes; a IA deverá gerar respostas contextualizadas. Se mostrar uma mensagem de indisponibilidade, confira o painel Cloudflare → Workers AI, o binding AI e os logs do Wrangler. Nunca coloque tokens no HTML/JS.

### Produção (não executado)

Faça deploy somente depois de testar e conferir a configuração:

```powershell
npm.cmd test
npx.cmd wrangler deploy
```

Site existente: https://educa-digital.educamaisdigital.workers.dev

O banco D1 existente continua vinculado. **Não execute `banco/schema.sql` em produção.** Esta versão **não foi publicada** e o GitHub **não foi alterado**.

## Estado de validação

- Testes Node.js: 15 aprovados, zero falhas.
- Teste visual do WhatsApp original: executado em 1280 px e 390 px com ambiente de navegador isolado.
- Conversa dinâmica: testada com resposta de IA **simulada somente no teste**, não com o modelo da conta.
- Resposta indisponível: confirmada no teste, sem fallback de texto pronto.
- Conversão voz real: usa reconhecimento e síntese do navegador; não é um motor de áudio bidirecional em tempo real.

## Preservado

Pré-teste, seis módulos, 22 atividades, vídeos, Android original, Flask, Cloudflare Worker e D1. Não enviar senhas, códigos, CPF ou dados bancários verdadeiros durante simulações.
