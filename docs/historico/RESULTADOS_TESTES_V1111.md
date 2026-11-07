# Resultado da V111.1

- `node --check public/static/js/lia3d-call.js`: aprovado
- `node --check public/static/js/free-video.js`: aprovado
- `npm test`: **41 de 41 aprovados**
- Testes incluídos: regressão V110, proteção das rotas Kokoro, fluxo do Modo Livre, PWA e novos testes estáticos de integração 3D.

**Não executado neste ambiente**: WebGL com modelo Avaturn carregado pela CDN, reconhecimento de fala no celular físico, Kokoro acessível remotamente, sincronização real dos visemas, deployment Cloudflare.

**Arquivo de ponto de partida:** V111.0. Não altera banco D1 remoto. A tela da chamada não depende de SDK de Simli ou de MP4 gerado por MuseTalk. O código legado opcional permanece arquivado fora da execução.
