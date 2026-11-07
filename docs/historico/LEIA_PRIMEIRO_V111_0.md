# Educa+ Digital V111.0 — Laboratório Avaturn + TalkingHead (GLB)

Esta edição acrescenta **um experimento isolado** sem modificar a interface, o banco D1 ou o motor MuseTalk/Kokoro existentes. Testes anteriores permaneceram preservados. Não é uma implementação validada de ligação ao vivo: é a bancada para comprovar que o avatar 3D e o áudio podem funcionar no navegador, antes da integração da chamada.

## Abrir o teste

1. Na raiz do projeto execute `npm install`, `npm test` e `npm run dev` no VS Code (PowerShell: `npm.cmd` se necessário).
2. No navegador, abra **http://localhost:8787/lab-lia-3d.html** (o Wrangler imprime a porta, que pode ser outra). Caso prefira o Flask, execute `pip install -r requirements.txt` e `python app.py` e abra **http://127.0.0.1:5000/lia-3d**.
3. Clique em **Testar avatar Avaturn de exemplo**. O GLB (~13 MB) e as bibliotecas 3D são obtidos da internet na primeira vez.
4. Clique em **Ouvir frase de teste**. A boca deve tentar seguir o som; a amostra WAV incluída foi produzida offline por eSpeak (voz propositalmente sintética/robótica) e não pretende representar a qualidade final de Kokoro.
5. Teste câmera (rosto/busto/corpo), expressões e a importação de áudio externo. Se HeadAudio não carregar, a tela informa a falha em vez de fingir sincronização.

## Gerar e exportar sua Lia no Avaturn

1. Entre no site oficial https://avaturn.me/ . Escolha criar avatar T2 com blendshapes/visemas, se a ferramenta disponibilizar.
2. Personalize a aparência da personagem **fictícia**. Não use imagens de pessoas reais sem consentimento e não presuma que a foto antiga `lia_ficticia.png` se transforma automaticamente em um GLB.
3. Exporte como **GLB**, com rig Mixamo compatível, expressões ARKit e visemas Oculus, sempre que disponíveis. As opções da exportação podem depender do serviço/conta/termos.
4. No laboratório, selecione **Importar meu GLB do Avaturn** e escolha o arquivo. O navegador cria uma URL temporária local. O arquivo não é enviado ao Worker.
5. Faça os testes com a frase de demonstração, um WAV gerado pelo Kokoro (ou outro TTS autorizado), expressões e ângulos.

## IA e Kokoro (etapa opcional, apenas para equipe)

- Com o Worker Cloudflare configurado com AI, o botão **Enviar à IA** usa o mesmo endpoint educativo `/api/modo-livre/conversar` com a cena `video`; não solicita dados pessoais. Quando estiver usando o Flask local, este endpoint pode não existir, e a tela sinalizará isso.
- A voz é solicitada de `/api/avatar/speak` e a mídia de `/api/avatar/media/:id.wav` **apenas se** o motor Kokoro existente estiver acessível por HTTPS autenticado no Worker e a equipe preencher o código de teste. Este código nunca é gravado em disco ou enviado a terceiros.
- Quando Kokoro estiver desligado, o chat mostra texto sem áudio; a frase de teste/importação de WAV segue independente.
- **Não há Google TTS nem Simli** nessa implementação. O navegador desenha o modelo, enquanto HeadAudio analisa o som e altera os visemas; não são garantidos fonemas precisos e os gestos são os básicos do TalkingHead.

## Dependências externas e direitos

- Motor JS: [TalkingHead](https://github.com/met4citizen/TalkingHead) (MIT) e [HeadAudio](https://github.com/met4citizen/HeadAudio) (MIT). O protótipo carrega os módulos pela CDN pública do jsDelivr, logo precisa de internet. Em produção, fixar hashes/versões e hospedar os recursos aprovados localmente para confiabilidade.
- **Avatar de exemplo Avaturn:** o arquivo público do repositório TalkingHead é atribuído a Avaturn e destinado a **testes não comerciais**. Não está incluído no ZIP e não deve ser reutilizado como personagem público de produção sem confirmar os direitos.
- **Avatar personalizado Avaturn:** consultar os termos de exportação e de uso em página pública. O modelo GLB exposto ao navegador pode ser baixado por visitantes.
- O classificador HeadAudio usa modelo experimental treinado em fala inglesa. O TalkingHead recebe idioma interno `en` porque este pacote JS distribuído não traz o módulo `pt`; quem dirige os lábios é o HeadAudio, mesmo quando o WAV é em português brasileiro: a sincronização de PT-BR pode ter imprecisões.
- Sem custo por minuto de avatar. A plataforma Avaturn, recursos de IA hospedados na Cloudflare ou a hospedagem do processamento poderão ter termos, limites ou custos próprios.

## Por que não substituir a ligação atual de imediato?

A V110.9 ainda usa uma chamada educativa controlada e pode ativar MuseTalk/Kokoro quando disponível. Esta bancada se destina a testar GLB antes de ligar um novo renderizador 3D à chamada, evitando uma regressão no celular simulado. A próxima etapa de implantação é selecionar um GLB real de Lia com licença apropriada, testar o visual e somente então conectar o renderizador aos eventos `incoming`, `answer`, `speak`, `close` da chamada.

## Observações do ensaio

Verificações automatizadas cobrem sintaxe, rotas/arquivos e regressões da aplicação. **Não** fazem renderização WebGL no navegador nem baixam os modelos externos; a verificação visual/sonora real deve ser feita em Chrome ou Edge com internet. A execução dos testes não implica que o Avaturn tenha sido acessado nem que um avatar personalizado tenha sido exportado.
