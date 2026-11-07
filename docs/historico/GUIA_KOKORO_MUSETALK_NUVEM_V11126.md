# Educa+ Digital V111.26 — voz oficial Kokoro e boca neural (implantação)

## Estado real

Este pacote inclui o **Educa+ Digital** já existente e atualizações pontuais
para a videochamada. NENHUM servidor Kokoro, GPU MuseTalk ou nova versão
Cloudflare foi criado/publicado automaticamente ao gerar este ZIP.

A IA de conversa segue em Workers AI. O áudio **Kokoro pf_dora** só substitui a voz
do Chrome quando um servidor HTTPS que execute `lia_motor/server.py` está ativo.
O vídeo neural somente é sincronizado de verdade quando MuseTalk **gera um MP4
a partir do WAV da própria resposta**; os vídeos de referência, mesmo animados,
não fazem alinhamento fonético. Não existe sincronismo em tempo real garantido:
a espera por renderização GPU pode ser de muitos segundos por resposta.

## 1. Hospedar SOMENTE o motor Kokoro (voz feminina)

A pasta `deploy/kokoro/Dockerfile` inicia o motor Python CPU com a voz pf_dora;
não hospeda a IA pessoal independente nem outro site do Educa+. Use um provedor
que publique Docker HTTPS e permita o RAM/CPU exigidos pelos modelos.

No painel do provedor (por exemplo Render, usando repositório GitHub):

- Serviço: **Web Service / Docker**.
- Dockerfile path: `deploy/kokoro/Dockerfile` (contexto: raiz do projeto).
- Environment variables:
  - `LIA_API_TOKEN`: token forte aleatório de 32+ caracteres, gerado por você.
  - `LIA_PREWARM_VOICE=true`
  - `LIA_TTS_ENGINE=kokoro`
  - `LIA_MUSETALK_ENABLED=false`
- Porta: `7860` (o serviço também aceita `PORT` definido pelo provedor).
- Recomenda-se no mínimo alguns GB de RAM para PyTorch/Kokoro; medir consumo
  real. **O plano grátis Render oferece só 512 MB e hiberna**, portanto não é
  adequado para prometer Kokoro confiável. Verifique preço antes de provisionar.
- O filesystem efêmero perde WAVs e jobs ao reiniciar; use uma instância e
  aceite que chamadas em andamento podem falhar no reinício. Produção multi-
  instância requer armazenamento compartilhado e gerenciamento de fila.

Para gerar o token pelo PowerShell local (não compartilhe o valor no chat):

```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

Salve no servidor como `LIA_API_TOKEN`. Não envie para o navegador ou GitHub.

Quando a implantação fornecer, por exemplo, `https://SEU-MOTOR.exemplo`,
faça a verificação SEM colocar token em URL pública:

```powershell
$token = Read-Host "Token do motor"   # Não compartilhe este valor
Invoke-RestMethod -Uri "https://SEU-MOTOR.exemplo/health" -Headers @{ Authorization = "Bearer $token" }
```

A resposta deverá incluir `ok:true`, `female_voice_ready:true` e
`female_voice_id:"pf_dora"`. Esse health check sozinho não garante áudio bom:
faça a síntese de teste com uma frase curta e baixe o WAV.

## 2. Conectar o motor ao Worker que JÁ existe

No terminal da pasta da V111.26, verifique primeiro a conta e preserve seu D1:

```powershell
npx.cmd wrangler whoami
npx.cmd wrangler secret put LIA_BACKEND_URL
npx.cmd wrangler secret put LIA_BACKEND_TOKEN
npx.cmd wrangler secret put LIA_ENABLED
npx.cmd wrangler secret put LIA_STAFF_CODE
```

Insira quando for solicitado, respectivamente: URL HTTPS do motor (sem barra
final), MESMO token secreto do servidor, `true`, e código próprio da equipe.
Nunca cole token no chat. Com esses valores, Kokoro funciona em modo privado
para testes via botão "Verificar voz feminina da Lia".

**Sem servidor publicado, NÃO insira URL inventada nem ative LIA_ENABLED.**

Para permitir o áudio a alunos sem código, estabeleça primeiro regras
persistentes de Cloudflare WAF/rate limiting, limites de custo e monitoramento.
O rate limit em memória do Worker não é suficiente para uso público. Só depois:

```powershell
npx.cmd wrangler secret put LIA_PUBLIC_VOICE_ENABLED
```

Digite `true`. Voz pública permanece restrita a 300 caracteres por solicitação.
A chave do backend fica do lado do Worker. Há possibilidade de cobrança por
CPU, tráfego e uso malicioso.

Valide `https://educa-digital.educamaisdigital.workers.dev/api/avatar/health`.
Espere `enabled:true`, `voice_installed:true` e `public_voice:true` apenas
quando o servidor e as flags estiverem realmente configurados.

## 3. MuseTalk — sincronia labial REAL (GPU)

A implementação já contém fila e rotas `/v1/lia/render/{job_id}` e
`/v1/lia/render-status/{job_id}`. MuseTalk oficial v1.5 precisa de:

1. GPU NVIDIA CUDA em servidor com **Python do MuseTalk**, modelos
   `musetalkV15`, Whisper e SD-VAE baixados e FFmpeg;
2. Configurar `LIA_MUSETALK_DIR` no mesmo servidor que tem acesso aos WAVs;
3. `LIA_MUSETALK_ENABLED=true` e `LIA_MUSETALK_PYTHON` no ambiente;
4. Fonte de movimento (`LIA_MOTION_SOURCE`) MP4 da avatar fictícia, validada;
5. Confirmar no `/health` do motor: `video_enabled:true`, `video_reason:"ready"`;
6. Testar renderização privada da equipe (vídeo/áudio reais, sem lip sync
   demonstrado em vídeos pré-gravados).

O Dockerfile CPU fornecido NÃO instala MuseTalk e não é adequado para GPU.
É preciso preparar imagem/servidor de GPU com as dependências oficiais e dados
persistentes. MuseTalk v1.5 não garante baixa latência em GPU fraca.

Para permitir vídeo neural ao público, além da voz, esta versão tem
`LIA_PUBLIC_VIDEO_ENABLED=true` **DESLIGADO POR PADRÃO**. Somente habilite
após testar GPU, fila, custo máximo, limites WAF persistentes, abuso e proteção
contra geração excessiva. Esse flag permite rotas de render e MP4 ao público,
mas não cria a infraestrutura sozinho.

O seletor de latência da videochamada permite aguardar até 40 s em modo
sincronismo; no modo rápido, o site prioriza o áudio Kokoro e não promete boca
perfeita. Modelo de clipes gravados = animação aproximada; MP4 MuseTalk =
movimento neural correspondente ao mesmo WAV, sujeito a qualidade/latência.

## 4. Publicar o site, quando o código e o motor estiverem prontos

```powershell
npm.cmd install
npm.cmd test
npx.cmd wrangler whoami
npx.cmd wrangler deploy --dry-run
npm.cmd run deploy
```

O Worker usa o nome já existente `educa-digital`, o banco D1 é preservado.
Não execute SQL de migração ou `wrangler d1 execute --remote` para esta atualização.
O usuário final sempre abre somente o domínio Educa+ Digital. Não são
necessários .cmd ou Ollama no notebook do visitante.

## Checklist em produção

- `/api/modo-livre/capacidades` informa Workers AI e status de voz.
- `/api/avatar/health` confirma se Kokoro realmente está disponível.
- Videochamada inicia com avatar de repouso, não fala se áudio não tocou.
- Uma resposta gerada chama `/api/avatar/speak` (Kokoro, pf_dora).
- Em GPU disponível e autorizada, chama `/api/avatar/render`, depois
  `/api/avatar/render-status/{id}` e toca MP4 desta resposta.
- Em falha de GPU, áudio Kokoro continua com clipes ilustrativos, sem afirmar
  sincronismo exato.
- Sequência WhatsApp → videochamada → ligação e demais atividades preservadas.
- Testar Chrome, Firefox, iPhone/Android e permissões do microfone.
