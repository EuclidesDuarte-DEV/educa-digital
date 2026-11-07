# Educa+ Digital V110 — videochamada educativa conversável

A V110 adiciona à **V109** uma chamada de vídeo fictícia dentro do Android já existente. **Não altera o pré-teste, as 22 atividades guiadas nem o banco D1 remoto.** A personagem **Lia** é inteiramente artificial, criada para este projeto; não representa uma pessoa real.

## O que funciona

- Depois do primeiro desafio por WhatsApp e da ligação fictícia, a próxima situação automática poderá ser uma **videochamada inesperada** de Lia. Também é possível abrir a videochamada pelo ícone de câmera no cabeçalho do WhatsApp original durante o Modo Livre.
- O participante pode **atender, recusar, desligar**, **digitar qualquer frase**, falar pelo microfone quando houver reconhecimento de fala, ouvir a resposta em uma voz **pt-BR instalada no dispositivo**, ligar sua câmera voluntariamente e verificar a identidade ou abrir o **Pix fictício**.
- Cada frase livre é enviada pelo endpoint já existente `/api/modo-livre/conversar`, agora com o cenário `video`. A resposta é produzida pelo **Cloudflare Workers AI**. Se falhar, **não existe resposta falsa pré-programada**: o app informa o erro.
- A imagem fictícia apresenta **movimentos visuais discretos durante a fala**. **Isto NÃO é uma transmissão de rosto fotorrealista em tempo real, nem há sincronização labial por fonemas.** O diálogo é dinâmico. O rosto reativo é uma aproximação visual.
- **Câmera:** inteiramente opcional, exibida apenas como prévia local, sem envio de imagem ou vídeo ao servidor. A síntese de voz e o reconhecimento podem depender de funcionalidades e políticas do navegador. Não gravamos áudio nem falas no D1. O navegador pode utilizar serviços externos para reconhecimento de voz. Não informe dados reais.
- Para evitar sotaque de Portugal, a fala sintetizada só ocorre quando o navegador informa explicitamente uma voz `pt-BR`. Caso contrário, as **legendas e o teclado** permanecem disponíveis.

## Como rodar

Na pasta da V110, no PowerShell:

```powershell
npm.cmd install
npm.cmd test
npx.cmd wrangler d1 execute educa-digital --local --file=./banco/schema.sql
npx.cmd wrangler dev
```

Acesse `http://127.0.0.1:8787`; faça o pré-teste e entre no Modo Livre. O comando `d1 execute` com `--local` prepara o banco do projeto nesse diretório, sem alterar o banco online. **Não utilize `--remote`**. O endpoint de IA depende da configuração de Workers AI na sua conta e a chamada real ao provedor **ainda deve ser testada no seu ambiente**.

**Teste rápido:** entre no Modo Livre, abra o WhatsApp original, acesse qualquer contato e toque no ícone de videochamada. Atenda como Lia. Digite: “Como posso ter certeza de quem está falando?”. A personagem deve responder com IA; verifique se não surge uma resposta guiada. Para a voz, use o botão Falar. Alternativamente, encerre outras situações e a chamada de vídeo chegará automaticamente.

## O que exige outro serviço para o nível premium

Para que a **boca e as expressões** do avatar se movam **fotorealisticamente a cada frase**, com streaming WebRTC real, é necessário um fornecedor de avatar ao vivo (por exemplo, LiveAvatar ou Simli) e uma conta/chave de API configurada. **Não há integração paga ativada, nem credenciais incluídas aqui.** É uma melhoria independente, sujeita a custo e autorização.

## Segurança e limitações

Toda chamada é sinalizada como **SIMULAÇÃO EDUCATIVA**. Nenhum número telefônico real é chamado, nenhum Pix real é enviado e não clonamos pessoas existentes. As transcrições são mantidas na sessão local do protótipo e encaminhadas ao Worker somente quando o participante responde; não devem conter dados reais. Avalie consentimento de participantes e acessibilidade antes do uso público.

V110 foi construída sobre a V109 e está destinada a testes locais. **Nenhuma publicação Cloudflare/GitHub nem migração remota foi realizada.**

## Atualizacao V110.1: D1 local preparado automaticamente

Depois de `npm.cmd install`, inicie com `npm.cmd run dev` (em vez de `npx.cmd wrangler dev`). O `predev` executa `banco/schema.sql` no banco `--local` antes de abrir o Worker e evita `D1_ERROR: no such table: usuarios`. Nao modifica o D1 online. Veja `LEIA_PRIMEIRO_V110_1.md`.

