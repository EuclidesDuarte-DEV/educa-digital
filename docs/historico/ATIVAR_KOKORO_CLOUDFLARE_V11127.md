# Educa+ Digital V111.27 — Kokoro `pf_dora` por Cloudflare Containers

## Situação real

V111.27 adapta a V111.26 existente para rodar **site + IA Workers AI + Kokoro CPU** na mesma conta Cloudflare. Usa o repositório atual, o Worker `educa-digital` e o banco D1 já existente. Nenhum motor Kokoro foi publicado automaticamente. O site já publicado permanece na V111.25 até uma nova implantação ser concluída.

> Containers exigem **Workers Paid (a partir de US$ 5/mês, sujeito ao uso adicional)**. **Não ative cobrança sem consentimento.** A instância `standard-1` tem 4 GiB e 0,5 vCPU. O aquecimento/modelos Kokoro podem demorar e consumir CPU/RAM. Cloudflare Containers não oferece GPU CUDA para o MuseTalk; o movimento labial exato continua pendente de GPU separada.

## Passo 1: conferir plano, ferramentas e conta

No painel da Cloudflare confira que sua conta tem Workers Paid e permissão para Containers. No VS Code abra a pasta V111.27, e execute:

```powershell
node -v
npm.cmd -v
docker info
npm.cmd install
npm.cmd test
npx.cmd wrangler whoami
```

Se `docker info` falhar, instale/inicie Docker Desktop com engine Linux antes de prosseguir. Verifique no terminal que `whoami` aponta para a conta do Worker **educa-digital**. Se ainda não conectou, execute `npx.cmd wrangler login`.

## Passo 2: conferir recursos sem mexer no banco

No `wrangler.toml`: nome `educa-digital`, binding `DB` com o mesmo database_id, `AI`, container `LiaKokoroContainer`, `max_instances=1`, `LIA_PUBLIC_VOICE_ENABLED=false`, `LIA_PUBLIC_VIDEO_ENABLED=false`.

O Container passa a usar a mesma senha `LIA_BACKEND_TOKEN` já disponível como secret do Worker. **Não** precisamos de `LIA_BACKEND_URL` no modo Container. A rota interna não é pública.

Configure o token do backend **apenas** no terminal local, sem incluí-lo no GitHub ou enviar pelo chat:

```powershell
npx.cmd wrangler secret put LIA_BACKEND_TOKEN
```

Quando solicitado, cole uma senha aleatória com 32+ caracteres, gerada no seu computador. Para gerar:

```powershell
$bytes=New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Guarde o valor em um gerenciador de senhas. O segredo não deve entrar em `wrangler.toml`, Dockerfile ou `.env` versionado. Se um segredo antigo do Worker estiver configurado e o sistema o usa em outro serviço, não o substitua antes de verificar.

Configure o código privado da equipe:

```powershell
npx.cmd wrangler secret put LIA_STAFF_CODE
```

Cole outro segredo aleatório longo e diferente. Esse código será solicitado na videochamada enquanto os testes forem privados. Não use o token do backend como código da equipe.

## Passo 3: preparar a publicação e confirmar custo

Faça backup da versão que já funciona, e confirme os dados de conta do Wrangler. Execute:

```powershell
npx.cmd wrangler deploy --dry-run
```

Depois de revisar plano, deploy, Docker e o risco de cobranças, publique:

```powershell
npm.cmd run deploy
```

O Wrangler publica o **Worker antes** de terminar de implantar o Container; esses passos não são uma transação única. Um erro de build pode deixar o Worker novo ativo enquanto o Container ainda não funciona. Nessa situação, não habilite voz pública; a interface preserva o fallback do navegador. Logs no painel Workers & Pages > Containers. No primeiro deploy, a instancia pode demorar para ficar pronta.

Confira:

```powershell
npx.cmd wrangler containers list
npx.cmd wrangler containers images list
```

## Passo 4: validar a voz oficial antes de abrir ao público

Abra `https://educa-digital.educamaisdigital.workers.dev/api/avatar/health` e confira `enabled:true`, `voice_ready:true` e `voice_engine:"kokoro"` quando a instância já respondeu. A rota só comprova diagnóstico; para confirmar o som, entre na atividade de videochamada, clique em Verificar voz feminina da Lia, informe **o código da equipe** e realize uma conversa curta. Confirme que o navegador faz a chamada à rota `/api/avatar/speak` e recebe um arquivo WAV real com voz `pf_dora`.

Confirme também o pré-teste, as demais atividades, WhatsApp primeiro e ligação depois; teste microfone no Chrome e Android/iPhone. O movimento labial ainda é ilustrativo (clipes/visemas aproximados) em modo CPU.

## Passo 5: liberar para estudantes (somente após proteger custos/abuso)

O pacote mantém voz pública DESATIVADA por padrão para evitar consumo não autorizado de processamento pago. Antes de mudar, configure controles persistentes de Cloudflare Rate Limiting/WAF para `/api/avatar/speak` (não dependa só do mapa JS na memória), limites de uso e alertas de cobrança. Só então altere `LIA_PUBLIC_VOICE_ENABLED` para `"true"` no `wrangler.toml` e publique de novo. Confirme `public_voice:true` em `/api/avatar/health` e fala real sem código.

**Nunca** habilite `LIA_PUBLIC_VIDEO_ENABLED` nesse container CPU: ele não possui MuseTalk/GPU. Para sincronismo labial neural, o MuseTalk requer GPU CUDA em serviço separado e processamento real a partir do WAV, com limitações de latência.

## Solução de problemas

- `requires Workers Paid`: conferir/contratar plano conscientemente no painel. Não é gratuito.
- `cannot connect to Docker daemon`: iniciar Docker Desktop (Linux containers).
- `entrypoint/Module not found`: execute `npm.cmd install`; Wrangler com suporte a Containers moderno.
- `/api/avatar/health` sem Kokoro: verificar `LIA_BACKEND_TOKEN`, `LIA_STAFF_CODE`, logs de Containers e aquecimento/modelos.
- Voz do Chrome ainda ativa: a opção pública está desligada ou o motor remoto não está pronto; conferir `/api/avatar/health`, testar com o código da equipe.
- Docker build lento ou sem memória: a imagem inclui PyTorch CPU e Kokoro, precisa recursos.

## Documentação oficial

- https://developers.cloudflare.com/containers/get-started/
- https://developers.cloudflare.com/containers/guides/deploy/
- https://developers.cloudflare.com/containers/platform/pricing/
- https://developers.cloudflare.com/containers/configuration/wrangler/
