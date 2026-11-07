# Educa+ Digital V111.8 — Lia em modo escuta/fala (MP4 enviados)

Esta versão parte da V111.7 e substitui o vídeo único repetido pelos três vídeos reais que você enviou, todos **sem o áudio original**. Um trecho de boca fechada do vídeo de 8 s foi convertido em um loop silencioso de escuta.

## Testar no PC

Na pasta desta versão:

```powershell
npm.cmd install
npm.cmd test
npm.cmd run dev
```

O `npm run dev` pode inicializar o banco D1 local conforme `package.json`.

1. Abra o endereço indicado no terminal e acrescente `/teste-lia-voz-video.html` para testar imediatamente a alternância usando a voz PT-BR do navegador.
2. Para testar a conversa **real com a IA**, abra a página principal `/`, entre no Modo Livre e atenda à videochamada; o texto das respostas é solicitado ao Worker Cloudflare em `/api/modo-livre/conversar`.
3. Cada nova fala da IA começa o vídeo de boca em movimento na chegada do evento de reprodução de voz (`speechSynthesis.onstart` ou `Audio.onplay`) e volta ao loop de escuta quando termina (`onend`).
4. Os três clipes de fala são alternados entre respostas. Se uma fala dura mais que o clipe, o vídeo continua em loop até terminar o áudio. Não há playback de áudio gerado pelo Lovable.
5. Se houver backend Kokoro configurado na Cloudflare (gateway autorizado) ele pode substituir a voz do navegador, mesmo sem MuseTalk. A instalação Kokoro no Windows sozinha **não configura** o gateway do Worker hospedado.

## Limitações honestas

- **A boca mexe durante a fala e fecha quando a Lia ouve**, mas os lábios NÃO formam os fonemas exatos de cada nova frase. Isso só se consegue com inferência de lip-sync (MuseTalk ou equivalente); vídeos mudos prontos não carregam o conteúdo fonético da resposta futura.
- O vídeo de escuta foi composto de um trecho curto em que a boca está fechada; para uma escuta mais natural, envie um clipe de 10–20s com a mesma personagem piscando, respirando e mantendo os lábios fechados.
- A interface mostra explicitamente **SIMULAÇÃO COM IA · PERSONAGEM FICTÍCIA**, com Pix fictício e sem gravação de voz do usuário sem consentimento.
- Nenhuma alteração foi publicada na Cloudflare. Faça deploy somente após validar localmente.

## Alterações

- `public/static/videos/lia-ouvindo.mp4`, `lia-conversando-a.mp4`, `b.mp4`, `c.mp4`
- `public/html/index.html`, `public/static/js/free-video.js`, `public/static/css/lia-fotorreal.css`
- `public/teste-lia-voz-video.html` — demonstração sem servidor de IA
- Testes de regressão em `tests/lia-clips-v1118.test.js`.

**O projeto preserva os simuladores e o banco de dados da V111.7.**
