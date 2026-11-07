# Educa+ Digital — V110.5: integração de avatar neural (prévia técnica)

A V110.4 funciona e foi mantida. A V110.5 inclui um caminho opcional para usar Simli (vídeo neural) com áudio pt-BR produzido no Azure. O rosto é do avatar fictício Lia.

**Não confundir**: os novos módulos foram implementados, mas sem SIMLI_API_KEY, SIMLI_FACE_ID e voz Azure configurados, a chamada continua utilizando as animações antigas. A integração real ainda não foi validada em uma conta Simli.

Consulte ATIVAR_AVATAR_NEURAL_V110_5.md.

Comandos locais:
```powershell
npm.cmd install
npm.cmd test
npm.cmd run dev
```

O comando `npm.cmd run dev` prepara o D1 local.

A publicação na Cloudflare e o push no GitHub não foram realizados.
