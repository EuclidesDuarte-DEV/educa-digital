# Educa+ Digital V111.3 — LIA AO VIVO: avatar 3D próprio

## Entrega desta versão

Esta é uma versão **funcional de código**, não uma proposta visual. O motor original está em `public/static/js/lia3d-call.js`. Ele cria uma **personagem feminina fictícia estilizada em WebGL2**, em geometria tridimensional real: rosto, cabelo, olhos, pupilas, pálpebras, boca, lábios, corpo e roupa. Os objetos têm coordenadas de profundidade, luz e normais 3D. O motor movimenta olhos (piscadas), cabeça, expressão, respiração e abertura/formato da boca.

**Não há foto com GIF, frames de imagem, vídeo MP4 mascarado, GLB externo, SDK Simli, Avatar SDK, Avaturn, Three.js ou CDN de modelo.** O navegador renderiza a personagem, e o backend de IA do Educa+ Digital continua sendo o Cloudflare Workers AI existente. A Lia continua uma personagem fictícia, não uma imitação de uma pessoa real.

### Duas maneiras de abrir

1. **Página direta para testar a Lia:** `/lia-ao-vivo.html` — avatar, botão verde para atender, resposta por microfone (se o navegador oferecer reconhecimento de fala) ou por texto, botão para ouvir novamente, configuração opcional Kokoro e transcrição.
2. **Dentro do simulador Android:** a chamada de vídeo do Modo Livre continua funcionando como antes. Depois de atender, o novo avatar aparece na área principal do vídeo. O pré-teste, as 22 atividades e demais simuladores foram preservados.

### Passos no computador (Windows)

```powershell
# Dentro da pasta extraída:
npm.cmd install
npm.cmd test
npm.cmd run dev
```

Abra o endereço informado no terminal, seguido de `/lia-ao-vivo.html`, e clique no botão verde. `npm run dev` inicia apenas o banco D1 **local** em `predev`. **Não execute migrações no D1 remoto.**

Alternativa local para ver a personagem e ouvir a voz do navegador (sem IA do Cloudflare):

```powershell
py -3 -m pip install -r requirements.txt
py -3 app.py
```

Abra `http://127.0.0.1:5000/lia-ao-vivo.html`. No Flask local, a personagem anima e o texto inicial é pronunciado, mas a conversa com IA real só funciona quando o Worker Cloudflare e seu binding AI estiverem acessíveis. Ela **não inventa respostas fingindo ser IA** quando offline.

### Voz e sincronismo

- **Voz gratuita padrão:** Speech Synthesis do navegador em `pt-BR` (quando suportado). O texto que a voz está pronunciando alimenta aproximações de posições labiais; isso **não garante precisão de fonemas** e depende do dispositivo. Sem voz do aparelho, a transcrição por texto permanece disponível.
- **Kokoro `pf_dora`:** opcional. Se o motor Kokoro e o gateway HTTPS já estiverem configurados, a equipe pode clicar em **Usar voz Kokoro (configuração da equipe)**. A mesma onda WAV que o usuário ouve alimenta o analisador de amplitude no navegador, controlando a abertura da boca. A amplitude não basta para reconstruir com exatidão cada fonema.
- **IA conversacional:** endpoint `/api/modo-livre/conversar`, cenário `video`, mantido do projeto. Conversa **por turnos**, não WebRTC simultâneo nem sistema capaz de interromper frase espontaneamente.
- **Privacidade:** câmera do aluno continua opcional e local, sem envio de vídeo. Reconhecimento pelo navegador exige autorização. Nunca use fotos de pessoas reais sem consentimento; a IA é identificada como simulação de treinamento.

### Como atualizar sua Cloudflare existente

Revise localmente, faça backup de produção e publique **somente quando estiver satisfeito**:

```powershell
npm.cmd run deploy
```

O arquivo `wrangler.toml` permanece com o nome do Worker e vínculo D1 anteriores. **Nenhuma publicação remota ou migração D1 foi executada nesta entrega.** A rota `/lia-ao-vivo.html` está no diretório `public/` e será servida automaticamente pelo Worker. A página de pré-teste continua sendo `/`, sem botão novo que permita pular o treino.

### Situação real de testes e limitações

- Testes automatizados Node (renderizador com WebGL simulado, integração e rotas): todos passaram neste ambiente. O teste WebGL simulado **confere desenho/chamadas**, mas não comprova visualização perfeita em navegador real.
- Validação gráfica em Chromium real **não foi possível** neste ambiente (navegação local bloqueada pela política do navegador de testes). É indispensável testar no Chrome/Edge/Android/iPhone no seu aparelho antes de publicar.
- **Não é fotorrealismo**. A aparência é de personagem digital estilizada. Animar um avatar ultra-realista a partir de vídeo exige outro pipeline e hardware. A melhoria aqui é ter uma personagem 3D original e animada, no navegador, sem assinatura por minuto de avatar.
- Kokoro não foi acionado, nem Cloudflare remote Worker foi modificado. Sem acesso ao servidor privado do Kokoro, vale o TTS do próprio navegador.
