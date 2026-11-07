# V110.5 — Avatar neural fotorrealista com Simli + Azure

Esta versão **não apresenta uma foto com bocas recortadas como resultado neural**. Ela fornece uma integração opcional para vídeo de rosto gerado a partir do **mesmo áudio** enviado ao avatar. Sem credenciais Simli e Azure, o protótipo conserva o modo básico anterior. Não há geração fotorrealista ativa por padrão.

## 1. Criar o avatar fictício Lia

1. Acesse https://app.simli.com/ e crie sua conta. Verifique franquia e custos no painel.
2. Gere um rosto Trinity a partir da foto fictícia `public/static/img/avatar-lia-v110.webp` (ou foto frontal de alta resolução aprovada pela plataforma).
3. Aguarde o processamento e copie o `faceId` válido. Não use fotos de pessoas reais sem consentimento.
4. Crie API key no painel e guarde em segredo, fora do Git.

## 2. Cloudflare Wrangler — configuração somente para TESTE PRIVADO

Com a pasta V110.5 aberta no PowerShell:

```powershell
npx.cmd wrangler secret put SIMLI_API_KEY
npx.cmd wrangler secret put SIMLI_TEST_ACCESS_CODE
npx.cmd wrangler secret put AZURE_SPEECH_KEY
```

Em `.dev.vars` local (não fazer commit):

```ini
SIMLI_NEURAL_ENABLED=true
SIMLI_API_KEY=SUA_CHAVE_SIMLI
SIMLI_FACE_ID=SEU_FACE_ID
SIMLI_TEST_ACCESS_CODE=CODIGO_FORTE_EXCLUSIVO_DA_EQUIPE
AZURE_SPEECH_KEY=SUA_CHAVE_AZURE
AZURE_SPEECH_REGION=SUA_REGIAO
AVATAR_SPEECH_ENABLED=true
```

Para testes na nuvem, além dos secrets, configure `SIMLI_FACE_ID`, `SIMLI_NEURAL_ENABLED`, `AZURE_SPEECH_REGION`, `AVATAR_SPEECH_ENABLED` no ambiente Wrangler ou no painel. Não publique para visitantes antes de adicionar Cloudflare Access, quotas com Durable Objects e limites de custo.

**Atenção**: O código de teste é solicitado ao professor quando ele atende a videochamada e só é mantido na sessão do navegador. **NÃO use cadastro/telefone do protótipo como proteção para custo**, pois o cadastro é demonstrativo.

## 3. Integração

- Cloudflare `POST /api/avatar/neural-session`: gera token temporário sem expor SIMLI_API_KEY.
- Browser usa `simli-client` por import ESM em `esm.sh`, conecta WebRTC/LiveKit. Requer rede para o CDN.
- Resposta da IA atual continua vindo do Workers AI.
- Azure Speech gera áudio pt-BR PCM/WAV. O cliente converte para PCM16 mono 16 kHz e envia à Simli, cuja transmissão entrega **vídeo e áudio sincronizados**.
- Microfone e câmera são opcionais, e a videochamada é sempre identificada como simulação educativa.

## 4. O que pode falhar

- Sem `SIMLI_*` e Azure: permanece animação básica.
- Se a geração de rosto Simli não concluir, `faceId` não será válido.
- Bloqueio do CDN `esm.sh`, microfone, WebRTC/ICE ou cobrança/franquia insuficiente pode impedir conexão.
- A versão não oferece streaming *full duplex* com interrupção neural sem latência; a IA responde por turnos, como no site atual.
- A voz e os movimentos dependem de dois serviços externos. É necessário ensaio no navegador real antes de lançar.

**Não publique secrets e não altere o banco D1 de produção.**
