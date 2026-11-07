# Educa+ Digital V111.31 — Inicialização rápida da voz na videochamada

Base: V111.30. **Não foi publicada automaticamente na Cloudflare.**

## Correções

- O texto de abertura foi dividido em trechos curtos para a primeira fala começar antes (não depende de voz do Chrome).
- A chamada inicia o pré-carregamento do modelo Kokoro pf_dora enquanto ainda está tocando.
- O progresso da síntese agora é visível na parte superior da chamada, sem cobrir a face.
- Em caso de bloqueio de reprodução, há o botão **Ouvir voz oficial**; em falha, **Tentar voz oficial**.
- O rótulo `em andamento` é somente o cronômetro da chamada.
- Mantidas as simulações fictícias, a sequência WhatsApp → videochamada → ligação e o banco D1.
- O sincronismo dos vídeos continua aproximado. Não afirmar que o MuseTalk está ativo.

## Testar localmente

```powershell
npm.cmd install
npm.cmd test
npm.cmd run dev
```

Abra o site em http://localhost:8787, entre no Modo Livre e acesse WhatsApp → Videochamada. Abra a chamada e acompanhe `LIA: preparando voz...` na parte superior. Aguarde a primeira frase; se o navegador pedir permissão de reprodução, toque em **Ouvir voz oficial**. Ative o microfone apenas se desejar falar.

Se tudo funcionar, interrompa `npm.cmd run dev` com Ctrl+C e publique com `npx.cmd wrangler deploy` depois de verificar a conta Cloudflare e a integridade do cadastro. Depois de publicar, atualize o site com Ctrl+Shift+R.

Limites: sem teste real com áudio neste ambiente. A geração CPU q8 depende do dispositivo. Primeiro acesso pode baixar modelo grande. Não substitui lip-sync neural por fonemas no rosto gravado. Não ativa serviços pagos.
