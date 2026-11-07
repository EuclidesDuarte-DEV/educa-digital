# Educa+ Digital — V105 · Modo Livre Inteligente

## O que há de novo

O **Modo Livre** foi ADICIONADO à tela de assuntos, depois do início do treino. **Nenhuma das 22 atividades anteriores foi removida ou substituída.** O pré-teste, as trilhas, os vídeos, o simulador de celular e o banco D1 existentes foram mantidos.

Neste modo, a pessoa pode navegar por WhatsApp, telefone, SMS, banco fictício, GOV.BR, ajustes, Play Store e contatos de treinamento. Banco, GOV.BR, ajustes e Play Store reaproveitam as telas que já existem. O botão flutuante **Modo livre** retorna ao início desse modo após a navegação por outros apps.

A cada cerca de 9 a 23 segundos podem chegar situações automáticas, como pedido suspeito pelo WhatsApp ou ligação falsa de banco. Para demonstrações rápidas, existe o botão **Simular evento agora**. O usuário escreve qualquer frase fictícia, e o personagem responde. As chamadas são **simulações por texto** na V105, não por voz. Os cenários incluem também conversa legítima e aviso de entrega.

## IA e versões local / online

- **Cloudflare Workers**: incluído binding `[ai] binding = "AI"` no `wrangler.toml` e rota `POST /api/modo-livre/conversar`; modelo `@cf/meta/llama-3.1-8b-instruct-fp8`. Quando o binding estiver funcional e dentro da franquia, o personagem produz respostas com IA em português brasileiro.
- **Flask local**: o mesmo endpoint retorna respostas por roteiro, sem pedir chave externa nem acessar modelos pagos.
- **Se a IA falhar**: o modo não trava; usa roteiros locais. O aplicativo indica quando a resposta veio da IA ou de roteiro.
- **Custos**: Workers AI possui franquia diária limitada; acompanhe o consumo no painel da Cloudflare. Evite testes de carga e a publicação até revisar os custos.
- **Privacidade**: nada do Modo Livre é gravado no banco. Mensagens podem ser transmitidas ao serviço de inferência Cloudflare no modo online. Não inserir informações reais, CPF, dados financeiros, códigos ou senhas.

## Passos para testar no Windows

1. Extraia todo este ZIP e abra a pasta `EDUCA_DIGITAL_V105_MODO_LIVRE_IA` no VS Code.
2. No PowerShell, nesta pasta, rode:

   ```powershell
   py -3 -m pip install -r requirements.txt
   py -3 app.py
   ```

3. Abra `http://127.0.0.1:5000`, inicie o treino normalmente e, na tela dos assuntos, clique em **Modo Livre · Situações reais**.
4. Explore os aplicativos, teste **Simular evento agora**, abra a notificação ou atenda a ligação, digite uma resposta e finalize verificando a identidade ou encerrando.
5. Rode os testes de JavaScript: `npm.cmd test`. Os arquivos novos possuem testes de validação e preservação das atividades.

## Publicação: SOMENTE após sua aprovação

O endereço de produção é `https://educa-digital.educamaisdigital.workers.dev` e o GitHub é `https://github.com/EuclidesDuarte-DEV/educa-digital`. **Esta entrega não foi publicada** em nenhum desses destinos. Verifique a branch e a versão antes de fazer deploy. O comando de publicação previsto é `npm.cmd run deploy`, após `npm.cmd install` e autenticação com `npx.cmd wrangler whoami`.

**Nunca rode `banco/schema.sql` ou migrações do D1 existente por causa do Modo Livre.** Essa funcionalidade não requer alteração do banco.

## Estado dos testes da entrega

- 10/10 testes Node.js aprovados, inclusive os 6 originais.
- Fluxo de entrada > notificação > WhatsApp digitável > roteiro > verificação > saída verificado no Chromium com recursos HTML/JS incorporados para contornar bloqueio de rede do ambiente de teste.
- `app.py` validado pelo compilador Python; testes Flask não executados nesta sessão porque Flask não estava instalado no ambiente e a instalação externa estava bloqueada.
- IA real e deploy Cloudflare **não executados**; precisam ser testados na conta após sua aprovação.

## Limitações honestas da V105

É um protótipo educacional, não Android real nem WhatsApp real. Apps que já existiam são reutilizados; alguns atalhos do celular antigo continuam somente demonstrativos. O usuário fala por texto; reconhecimento e síntese de voz em ligações não foram implementados. O catálogo antigo de atividades e o pré-teste não foram alterados.
