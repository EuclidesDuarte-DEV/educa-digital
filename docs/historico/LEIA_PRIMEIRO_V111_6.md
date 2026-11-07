# V111.6 — Lia realista: voz + movimento, sem Simli

**Correção do bug:** a versão V111.5 exibia apenas um retrato e, em algumas plataformas, o áudio não iniciava porque o `speechSynthesis.speak()` era acionado depois de um `await` mesmo quando o motor neural estava desligado. Na V111.6, a voz começa diretamente no gesto de Atender/🔊 Ouvir Lia, sem depender da GPU.

**O que funciona sem GPU:** rosto da mesma mulher do vídeo do Lovable; áudio falado com voz do navegador (pt-BR conforme disponibilidade do sistema); referência gravada de 6 s silenciosa em loop durante a fala; respostas geradas pelo Worker Cloudflare por `/api/modo-livre/conversar`; microfone onde houver suporte e permissão. A gravação é apenas movimento visual: os lábios **não** correspondem às palavras novas, e o vídeo não substitui sincronia neural.

**O que requer GPU:** renderização de cada resposta por Kokoro + MuseTalk v1.5 com o mesmo arquivo WAV (fim da dependência Simli). O servidor em `lia_motor/server.py` continua disponível. Para configurar GPU, siga `COMECE_AQUI_V111_5.md`, abra o site com `?equipe=1` para mostrar o botão reservado da equipe e ative no Worker `LIA_ENABLED`, `LIA_BACKEND_URL`, `LIA_BACKEND_TOKEN` e `LIA_STAFF_CODE`; não publique os secrets. Um Worker Cloudflare isolado não oferece GPU de inferência.

## Teste

1. `npm install`, `npm run dev`; abra a URL local do Wrangler (geralmente http://localhost:8787).
2. Inicie o Modo Livre e atenda a videochamada da Lia. Deve iniciar a **voz** e o vídeo de referência animado, mesmo sem GPU. Com o som do dispositivo ligado, use o botão **🔊 Ouvir Lia** se a voz inicial for bloqueada.
3. Envie uma frase fictícia no campo de texto; o Worker responde via Workers AI e a Lia reproduz a resposta. Se a IA estiver offline, a interface apresenta erro — sem inventar uma resposta falsa.
4. `/lia-realista.html` fornece uma segunda interface de teste com o mesmo mecanismo de fallback.
5. Para boca realmente sincronizada, é obrigatório configurar e testar o motor MuseTalk fora da Cloudflare. Não há como transformar apenas a foto em lábios sincronizados com precisão na infraestrutura atual.

**Segurança:** simulação educativa com personagem fictícia. Não há transferência financeira real, gravação da câmera do usuário ou publicação de voz sem consentimento.

Prévia independente: `VER_LIA_V111_6_COM_VOZ.html` (incluída fora do ZIP).
