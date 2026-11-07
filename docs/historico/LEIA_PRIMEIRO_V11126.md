# V111.26 — Educa+ Digital, LIA voz neural Kokoro/MuseTalk

Base: V111.25 publicada manualmente pelo usuário na Cloudflare.

**Atenção:** esta pasta ainda não está publicada na Cloudflare. A atualização
não executa servidores externos nem cria GPU. Para a voz oficial pf_dora
funcionar no endereço da Cloudflare, hospede o motor em HTTPS e configure
os segredos do Worker. Os vídeos MuseTalk só terão boca sincronizada com uma
GPU/modelos MuseTalk executando de verdade.

## Alterações

- Detecção automática de Kokoro remoto antes de usar voz do Chrome no site
  HTTPS; limite de espera de 2,2 s antes do fallback.
- Voz oficial fixa em Kokoro pf_dora quando configurada para alunos.
- Clipes de boca do modo sem GPU alternam entre repouso/fala conforme a energia
  do WAV; são aproximados. O modo neural real reproduz o MP4 feito do WAV.
- Flag separada de ativação pública de render GPU: `LIA_PUBLIC_VIDEO_ENABLED`.
  Permanece desativada até a equipe providenciar infraestrutura e limite de uso.
- Dockerfile CPU do motor Kokoro e guia de implantação online.
- Preservados bancos, módulos, páginas, vídeos, IA do Cloudflare, simulador
  WhatsApp e Pix educativo sem transferência financeira.

## Comece aqui

Leia `GUIA_KOKORO_MUSETALK_NUVEM_V11126.md`. O projeto principal continua
sendo o Educa+ Digital na Cloudflare; só o motor de mídia fica no backend.

Testes: `npm.cmd test`; testes Python: `python -m unittest discover -s lia_motor -p "test_*.py"`.
Não rode migrações D1 para esta versão.
