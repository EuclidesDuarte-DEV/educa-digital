(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const phoneStage = $('#phoneStage');
  const focusLogoutBtn = $('#focusLogoutBtn');
  const focusExpandBtn = $('#focusExpandBtn');
  const prototypeBoot = $('#prototypeBoot');
  const prototypeBootTitle = $('#prototypeBootTitle');
  const prototypeBootText = $('#prototypeBootText');
  const phoneScreen = $('#phoneScreen');
  const fullscreenBtn = $('#fullscreenBtn');
  const browserFullscreenGate = $('#browserFullscreenGate');
  const browserFullscreenGateBtn = $('#browserFullscreenGateBtn');
  const exitFullscreen = $('#exitFullscreen');
  // V97: fixed viewport controls must not inherit phone-stage transforms.
  if (exitFullscreen && exitFullscreen.parentElement !== document.body) document.body.appendChild(exitFullscreen);
  const coachCard = $('#coachCard');
  const accountCard = $('#accountCard');
  const coachTitle = $('#coachTitle');
  const coachText = $('#coachText');
  const trainingProgress = $('#trainingProgress');
  const progressFill = $('#progressFill');
  const coachStatus = $('#coachStatus');
  const hintBtn = $('#hintBtn');
  const hintText = $('#hintText');
  const speakBtn = $('#speakBtn');
  const accountForm = $('#accountForm');
  const accountMessage = $('#accountMessage');
  const skipAccount = $('#skipAccount');
  const startModal = $('#startModal');
  const startModalTitle = $('#startModalTitle');
  const startModalIntro = $('#startModalIntro');
  const quickStartForm = $('#quickStartForm');
  const quickName = $('#quickName');
  const quickPhone = $('#quickPhone');
  const quickStartMessage = $('#quickStartMessage');
  const quickSaveBtn = $('#quickSaveBtn');
  let participantName = '';
  let progressSaved = false;
  const headerTrust = $('#headerTrust');
  const startNowLabel = $('#startNowLabel');
  const heroActionNote = $('#heroActionNote');
  const logoutBtn = $('#logoutBtn');
  const learningAccountOptions = $('#learningAccountOptions');
  const returnModal = $('#returnModal');
  const returnPhoneStep = $('#returnPhoneStep');
  const returnCodeStep = $('#returnCodeStep');
  const returnPhone = $('#returnPhone');
  const returnCode = $('#returnCode');
  const returnPhoneMessage = $('#returnPhoneMessage');
  const returnCodeMessage = $('#returnCodeMessage');
  const demoCodeBox = $('#demoCodeBox');
  const demoCodeValue = $('#demoCodeValue');
  const returnPhoneForm = $('#returnPhoneForm');
  const returnCodeForm = $('#returnCodeForm');
  let returningPhone = '';
  const clock = $('#clock');
  const glanceDate = $('#glanceDate');
  const chatWallpaper = $('#chatWallpaper');
  const scenarioTitle = $('#scenarioTitle');
  const scenarioSubtitle = $('#scenarioSubtitle');
  const scenarioAvatar = $('#scenarioAvatar');
  const decisionOptions = $('#decisionOptions');
  const batteryPercent = $('#batteryPercent');
  const batteryFill = $('#batteryFill');
  const wifiIcon = $('#wifiIcon');
  const signalIcon = $('#signalIcon');
  const miniCoachKicker = $('#miniCoachKicker');
  const miniCoachTitle = $('#miniCoachTitle');
  const miniCoachText = $('#miniCoachText');
  const trainingBadge = $('.training-badge');
  const pretestStepBar = $('#pretestStepBar');
  const pretestStepLabel = $('#pretestStepLabel');
  const pretestStepHint = $('#pretestStepHint');
  const learningGreeting = $('#learningGreeting');
  const guidedKicker = $('#guidedKicker');
  const guidedTitle = $('#guidedTitle');
  const guidedInstruction = $('#guidedInstruction');
  const guidedExample = $('#guidedExample');
  const guidedOptions = $('#guidedOptions');
  const guidedFeedback = $('#guidedFeedback');
  const bankGreeting = $('#bankGreeting');
  const bankPixBtn = $('#bankPixBtn');
  const bankSendPixBtn = $('#bankSendPixBtn');
  const bankContinuePix = $('#bankContinuePix');
  const bankKeysBtn = $('#bankKeysBtn');
  const bankKeysLearnedBtn = $('#bankKeysLearnedBtn');
  const bankSecurityBtn = $('#bankSecurityBtn');
  const bankReviewOptions = $('#bankReviewOptions');
  const bankAnswerFeedback = $('#bankAnswerFeedback');
  const bankScamOptions = $('#bankScamOptions');
  const bankScamFeedback = $('#bankScamFeedback');
  const bankExtractBtn = $('#bankExtractBtn');
  const scenarioAnswerFeedback = $('#scenarioAnswerFeedback');
  const successKicker = $('#successKicker');
  const successTitle = $('#successTitle');
  const successText = $('#successText');
  const successLearned = $('#successLearned');
  const nextLessonBtn = $('#nextLessonBtn');
  const backSubjectsBtn = $('#backSubjectsBtn');
  const openAndroidHome = $('#openAndroidHome');
  const guideOverlay = $('#guideOverlay');
  const guideSpotlight = $('#guideSpotlight');
  const guidePointer = $('#guidePointer');
  const learningAccess = $('#learningAccess');
  const learningAccessTitle = $('#learningAccessTitle');
  const learningAccessText = $('#learningAccessText');
  const featuredAccessNote = $('#featuredAccessNote');
  let currentLearningTopic = '';
  let currentLessonIndex = 0;
  let currentTopicAction = '';
  let activeGuide = null;
  let guideEpoch = 0;
  let guideTimer = null;
  let guidePositionRaf = null;
  let guideTrackedTarget = null;
  let guideTrackedLabel = 'Toque aqui';
  let guideScrollParents = [];
  let guideResizeObserver = null;
  let accessMode = 'guest';
  let isGuestPretest = false; // O foco inicial no Banco é opcional.
  const guestCompletedLessons = new Set(); // Progresso de visita, sem dados pessoais.
  const topicEntryApps = { security: 'whatsapp', whatsapp: 'whatsapp', pix: 'bank', settings: 'settings', govbr: 'govbr', playstore: 'playstore' };
  const waMoreBtn = $('#waMoreBtn');
  const waMenu = $('#waMenu');
  const waSettingsBtn = $('#waSettingsBtn');
  const waOpenRealBtn = $('#waOpenRealBtn');
  const settingsDisplayRow = $('#settingsDisplayRow');
  const settingsTextSizeRow = $('#settingsTextSizeRow');
  const settingsSoundRow = $('#settingsSoundRow');
  const settingsNetworkRow = $('#settingsNetworkRow');
  const settingsInternetRow = $('#settingsInternetRow');
  const fontSizeSlider = $('#fontSizeSlider');
  const fontSizeLabel = $('#fontSizeLabel');
  const fontPreviewTitle = $('#fontPreviewTitle');
  const fontPreviewText = $('#fontPreviewText');
  const mediaVolumeSlider = $('#mediaVolumeSlider');
  const mediaVolumeValue = $('#mediaVolumeValue');
  const wifiCasaRow = $('#wifiCasaRow');
  const wifiCasaStatus = $('#wifiCasaStatus');
  const openRealSettingsBtn = $('#openRealSettingsBtn');
  const govLoginBtn = $('#govLoginBtn');
  const govAuthCpf = $('#govAuthCpf');
  const govAuthContinueBtn = $('#govAuthContinueBtn');
  const govUseDemoCpfBtn = $('#govUseDemoCpfBtn');
  const govEnable2faBtn = $('#govEnable2faBtn');
  const govSkip2faBtn = $('#govSkip2faBtn');
  const govServicesNav = $('#govServicesNav');
  const govProfileNav = $('#govProfileNav');
  const govProofRow = $('#govProofRow');
  const govProofFoundBtn = $('#govProofFoundBtn');
  const govLogoutBtn = $('#govLogoutBtn');
  const govHeaderProfileBtn = $('#govHeaderProfileBtn');
  const govWelcomeName = $('#govWelcomeName');
  const govFullNameData = $('#govFullNameData');
  const govFullNameDoc = $('#govFullNameDoc');
  const govSearchBox = $('#govSearchBox');
  const govServiceSearch = $('#govServiceSearch');
  const govSecurityMenuRow = $('#govSecurityMenuRow');
  const govTwoFactorRow = $('#govTwoFactorRow');
  const gov2faLearnBtn = $('#gov2faLearnBtn');
  const openRealGovBtn = $('#openRealGovBtn');
  const openRealPlayStoreBtn = $('#openRealPlayStoreBtn');
  const playProtectBtn = $('#playProtectBtn');
  const playWhatsAppCard = $('#playWhatsAppCard');
  const playStoreDetailBack = $('#playStoreDetailBack');
  const playProtectBack = $('#playProtectBack');
  const playDeveloperLearnedBtn = $('#playDeveloperLearnedBtn');
  const playProtectLearnedBtn = $('#playProtectLearnedBtn');
  const openRealBbBtn = $('#openRealBbBtn');
  const openRealCaixaBtn = $('#openRealCaixaBtn');
  const lessonVideo = $('#lessonVideo');
  const videoLessonTitle = $('#videoLessonTitle');
  const videoLessonSummary = $('#videoLessonSummary');
  const videoLessonBack = $('#videoLessonBack');
  const videoPracticeBtn = $('#videoPracticeBtn');
  const videoFullscreenBtn = $('#videoFullscreenBtn');
  const videoLessonKicker = $('#videoLessonKicker');
  const modulePathView = $('#modulePathView');
  const modulePathBack = $('#modulePathBack');
  const modulePathTitle = $('#modulePathTitle');
  const modulePathEyebrow = $('#modulePathEyebrow');
  const modulePathHeadline = $('#modulePathHeadline');
  const modulePathIntro = $('#modulePathIntro');
  const modulePathIcon = $('#modulePathIcon');
  const moduleLessonList = $('#moduleLessonList');
  const modulePathProgressText = $('#modulePathProgressText');
  const modulePathProgressPct = $('#modulePathProgressPct');
  const modulePathProgressFill = $('#modulePathProgressFill');
  let currentVideoTopic = '';
  let currentVideoLessonIndex = 0;
  const completedLessons = new Set(JSON.parse(localStorage.getItem('educaCompletedLessonsV44') || '[]'));
  let govSessionActive = false;

  const scenarios = {
    family: {
      title: 'Filho — número novo', avatar: 'F', avatarClass: 'blue',
      hint: 'Quando alguém troca de número e pede dinheiro com urgência, confirme usando um contato antigo que você já conhecia.',
      messages: [
        ['Oi mãe, meu celular quebrou. Esse é meu número novo.', '15:10'],
        ['Preciso pagar uma conta urgente. Você consegue fazer um PIX de R$ 850 pra mim agora?', '15:11', true]
      ],
      warning: '⚠️ Número novo + urgência + pedido de dinheiro.',
      answers: [
        ['Fazer o PIX para ajudar rápido', false],
        ['Ligar para o número antigo e confirmar', true],
        ['Enviar minha senha para confirmar', false]
      ],
      correct: 'Isso! Antes de enviar dinheiro, confirme por outro canal com a pessoa que você já conhece.'
    },
    bank: {
      title: 'Banco • Atendimento', avatar: 'B', avatarClass: 'bank-avatar',
      hint: 'Bancos não pedem senha, código ou instalação de aplicativos por mensagem. Abra o aplicativo oficial por conta própria.',
      messages: [
        ['Olá. Identificamos um acesso suspeito na sua conta.', '14:56'],
        ['Sua conta será bloqueada hoje. Clique agora em banco-seguranca-verificar.com para evitar o bloqueio.', '14:57', true]
      ],
      warning: '⚠️ Ameaça de bloqueio + link recebido por mensagem.',
      answers: [
        ['Clicar no link imediatamente', false],
        ['Abrir o aplicativo oficial do banco e conferir', true],
        ['Responder enviando minha senha', false]
      ],
      correct: 'Muito bem! Você evitou o link e procurou o canal oficial do banco.'
    },
    code: {
      title: 'Contato desconhecido', avatar: '?', avatarClass: 'purple',
      hint: 'Códigos de confirmação são pessoais. Quem pede esse código pode estar tentando entrar na sua conta.',
      messages: [
        ['Oi! Estou tentando adicionar você a um grupo da família.', '14:29'],
        ['Vai chegar um código por SMS. Me manda os 6 números aqui para eu confirmar você.', '14:31', true]
      ],
      warning: '⚠️ Pedido de código recebido por SMS.',
      answers: [
        ['Enviar o código para a pessoa', false],
        ['Não compartilhar o código e encerrar a conversa', true],
        ['Mandar uma foto do SMS inteiro', false]
      ],
      correct: 'Perfeito! Código de confirmação não deve ser compartilhado com outras pessoas.'
    }
  };

  const learningTopics = {
    security: {
      title: 'Segurança',
      intro: 'Treine situações que podem acontecer no WhatsApp e no celular.',
      chapters: ['Golpe do falso familiar', 'Links e mensagens falsas', 'Códigos de verificação', 'Falsa central bancária'],
      lessons: [
        ['Golpe do falso filho', 'Aprenda a confirmar antes de fazer um PIX.', 'family', true],
        ['Link falso do banco', 'Veja como agir quando receber um link urgente.', 'bank', true],
        ['Código por SMS', 'Saiba por que nunca compartilhar códigos.', 'code', true],
        ['Falsa central bancária', 'Treine como agir quando alguém liga pedindo senha ou instalação de app.', 'fake-bank-call', true]
      ]
    },
    whatsapp: {
      title: 'WhatsApp',
      intro: 'Pratique as funções mais usadas, sem medo de errar.',
      chapters: ['Conversas', 'Mensagens', 'Chamadas', 'Código de verificação'],
      lessons: [
        ['Encontrar uma conversa', 'Aprenda a localizar uma pessoa na lista.', 'wa-list', true],
        ['Enviar uma mensagem', 'Abra uma conversa e escreva uma mensagem.', 'wa-message', true],
        ['Fazer uma ligação', 'Conheça onde fica o botão de chamada.', 'wa-call', true],
        ['Proteger código de verificação', 'Aprenda por que códigos nunca devem ser enviados por mensagem.', 'wa-code-safety', true]
      ]
    },
    pix: {
      title: 'PIX',
      intro: 'Aprenda dentro de um banco de treino, como acontece no celular real.',
      chapters: ['Primeiros passos no Pix', 'Chaves Pix', 'Segurança no pagamento'],
      lessons: [
        ['Encontrar o Pix no banco', 'Abra o banco, entre no Pix e confira o destinatário.', 'pix-recipient', true],
        ['Entender as chaves Pix', 'Veja CPF, celular, e-mail e chave aleatória.', 'pix-key', true],
        ['Reconhecer pedido suspeito', 'Aprenda a parar diante de urgência e número novo.', 'pix-scam', true]
      ]
    },
    settings: {
      title: 'Ajustes',
      intro: 'Deixe o celular mais confortável para você usar.',
      chapters: ['Tamanho do texto', 'Som e volume', 'Wi-Fi'],
      lessons: [
        ['Aumentar as letras', 'Deixe textos maiores e mais fáceis de ler.', 'settings-font', true],
        ['Ajustar o volume', 'Aumente ou diminua o som do aparelho.', 'settings-volume', true],
        ['Conectar ao Wi‑Fi', 'Aprenda a escolher uma rede com segurança.', 'settings-wifi', true]
      ]
    },
    govbr: {
      title: 'GOV.BR',
      intro: 'Aprenda a usar serviços públicos com calma e segurança.',
      chapters: ['Acesso seguro', 'Serviços públicos', 'Encerrar sessão', 'Verificação em duas etapas'],
      lessons: [
        ['Entrar com segurança', 'Reconheça o acesso oficial do GOV.BR.', 'gov-login', true],
        ['Encontrar um serviço', 'Saiba onde procurar o que você precisa.', 'gov-service', true],
        ['Sair da conta', 'Proteja seus dados depois de usar.', 'gov-logout', true],
        ['Verificação em duas etapas', 'Entenda onde o código é gerado e como protegê-lo.', 'gov-2fa', true]
      ]
    },
    playstore: {
      title: 'Apps seguros',
      intro: 'Aprenda a reconhecer aplicativos oficiais antes de instalar.',
      chapters: ['Aplicativo oficial', 'Desenvolvedor', 'Play Protect', 'Permissões'],
      lessons: [
        ['Encontrar o app oficial', 'Use a Play Store e confira o nome do aplicativo.', 'play-find', true],
        ['Conferir o desenvolvedor', 'Veja quem realmente publicou o aplicativo.', 'play-developer', true],
        ['Usar o Play Protect', 'Conheça a proteção do Google contra apps nocivos.', 'play-protect', true],
        ['Revisar permissões', 'Confira câmera, microfone e localização antes de permitir acesso.', 'play-permissions', true]
      ]
    }
  };

  // Educa+ Digital — aprender fazendo, sem questionário ao concluir.
  // As decisões de segurança que fazem parte da própria simulação continuam
  // nas telas do Banco, WhatsApp, GOV.BR e demais aplicativos.

  const lessonVideos = {
    'pix-recipient': {
      title: 'Pix com segurança',
      summary: 'Antes de começar, veja o que conferir antes de tocar em confirmar.',
      src: '/static/videos/pix_seguranca.mp4?v=1041'
    },
    'pix-scam': {
      title: 'Pedido urgente? Pare e confirme',
      summary: 'Número novo, urgência e pedido de dinheiro são sinais para confirmar por outro meio.',
      src: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3ITdvjP8F16LCyy9GylHD3JQeFs/a5a4b9cc-d596-4040-9a48-131c706b76d9.mp4'
    },
    'wa-code-safety': {
      title: 'WhatsApp com segurança',
      summary: 'Veja por que códigos, senhas e dados bancários nunca devem ser enviados por mensagem.',
      src: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3ITdvjP8F16LCyy9GylHD3JQeFs/a5a4b9cc-d596-4040-9a48-131c706b76d9.mp4'
    },
    'gov-login': {
      title: 'GOV.BR com segurança',
      summary: 'Use o aplicativo oficial e conheça as proteções da sua conta antes de praticar.',
      src: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3ITdvjP8F16LCyy9GylHD3JQeFs/55e49222-b669-47d8-8363-0f6d12b11c96.mp4'
    },
    'gov-2fa': {
      title: 'Proteja o código do GOV.BR',
      summary: 'O código da verificação em duas etapas é gerado dentro do aplicativo e não deve ser compartilhado.',
      src: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3ITdvjP8F16LCyy9GylHD3JQeFs/55e49222-b669-47d8-8363-0f6d12b11c96.mp4'
    },
    'family': {
      title: "Golpe do falso familiar",
      summary: "Veja a explicação e depois pratique a atividade com dados fictícios.",
      src: '/static/videos/family.mp4?v=71'
    },
    'bank': {
      title: "Link falso do banco",
      summary: "Veja a explicação e depois pratique a atividade com dados fictícios.",
      src: '/static/videos/bank.mp4?v=71'
    },
    'code': {
      title: "Código recebido por SMS",
      summary: "Veja a explicação e depois pratique a atividade com dados fictícios.",
      src: '/static/videos/code.mp4?v=71'
    },
    'fake-bank-call': {
      title: "Falsa central bancária",
      summary: "Veja a explicação e depois pratique a atividade com dados fictícios.",
      src: '/static/videos/fake-bank-call.mp4?v=71'
    },
    'wa-list': {
      title: "Encontrar uma conversa",
      summary: "Veja a explicação e depois pratique a atividade com dados fictícios.",
      src: '/static/videos/wa-list.mp4?v=71'
    },
    'wa-message': {
      title: "Enviar uma mensagem",
      summary: "Veja a explicação e depois pratique a atividade com dados fictícios.",
      src: '/static/videos/wa-message.mp4?v=71'
    },
    'wa-call': {
      title: "Fazer uma ligação",
      summary: "Veja a explicação e depois pratique a atividade com dados fictícios.",
      src: '/static/videos/wa-call.mp4?v=71'
    },
    'pix-key': {
      title: "Entender as chaves Pix",
      summary: "Veja a explicação e depois pratique a atividade com dados fictícios.",
      src: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3L7kVPrU6jkavZYl2V0lQ2eS9ko/5cb5c6b1-5c6b-4776-b950-b64a51c2b376.mp4'
    },
    'settings-font': {
      title: "Aumentar as letras",
      summary: "Veja a explicação e depois pratique a atividade com dados fictícios.",
      src: '/static/videos/settings-font.mp4?v=71'
    },
    'settings-volume': {
      title: "Ajustar o volume",
      summary: "Veja a explicação e depois pratique a atividade com dados fictícios.",
      src: '/static/videos/settings-volume.mp4?v=71'
    },
    'settings-wifi': {
      title: "Conectar ao Wi-Fi",
      summary: "Veja a explicação e depois pratique a atividade com dados fictícios.",
      src: '/static/videos/settings-wifi.mp4?v=71'
    },
    'gov-service': {
      title: "Encontrar um serviço público",
      summary: "Veja a explicação e depois pratique a atividade com dados fictícios.",
      src: '/static/videos/gov-service.mp4?v=71'
    },
    'gov-logout': {
      title: "Sair da conta com segurança",
      summary: "Veja a explicação e depois pratique a atividade com dados fictícios.",
      src: '/static/videos/gov-logout.mp4?v=71'
    },
    'play-find': {
      title: "Encontrar um aplicativo oficial",
      summary: "Veja a explicação e depois pratique a atividade com dados fictícios.",
      src: '/static/videos/play-find.mp4?v=71'
    },
    'play-developer': {
      title: "Conferir o desenvolvedor",
      summary: "Veja a explicação e depois pratique a atividade com dados fictícios.",
      src: '/static/videos/play-developer.mp4?v=71'
    },
    'play-protect': {
      title: "Usar o Play Protect",
      summary: "Veja a explicação e depois pratique a atividade com dados fictícios.",
      src: '/static/videos/play-protect.mp4?v=71'
    },
    'play-permissions': {
      title: "Revisar permissões dos aplicativos",
      summary: "Veja a explicação e depois pratique a atividade com dados fictícios.",
      src: '/static/videos/play-permissions.mp4?v=71'
    }
  };

  const guidedActivities = {
    'pix-recipient': {
      kicker: 'PIX', title: 'Confira antes de pagar',
      instruction: 'Antes de confirmar um PIX, qual é a atitude mais segura?',
      example: '<strong>PIX de R$ 120,00</strong><span>Destinatário: Carlos Almeida</span><small>Confira com calma antes de continuar.</small>',
      options: [['Conferir nome e valor antes de confirmar', true], ['Confirmar rápido sem conferir', false]],
      learned: 'Sempre confira o nome do destinatário e o valor antes de confirmar o PIX.'
    },
    'pix-key': {
      kicker: 'PIX', title: 'Entenda a chave PIX',
      instruction: 'Qual destas opções pode ser uma chave PIX?',
      example: '<strong>Chave PIX</strong><span>Ela serve para identificar quem vai receber.</span>',
      options: [['CPF, celular, e-mail ou chave aleatória', true], ['Somente o número do cartão', false]],
      learned: 'Uma chave PIX pode ser CPF, celular, e-mail ou uma chave aleatória.'
    },
    'pix-scam': {
      kicker: 'PIX', title: 'Desconfie da urgência',
      instruction: 'Uma pessoa pede um PIX urgente por um número novo. O que fazer?',
      example: '<strong>“Preciso de R$ 500 agora. Meu número mudou.”</strong><small>Pedido inesperado + urgência.</small>',
      options: [['Parar e confirmar com a pessoa por outro contato', true], ['Fazer o PIX imediatamente', false]],
      learned: 'Pedidos urgentes de dinheiro devem ser confirmados por outro canal conhecido.'
    },
    'settings-font': {
      kicker: 'AJUSTES', title: 'Aumente as letras',
      instruction: 'Escolha um tamanho mais confortável para leitura.',
      example: '<div class="font-demo"><span class="font-small-demo">Texto pequeno</span><span class="font-large-demo">Texto maior e mais fácil de ler</span></div>',
      options: [['Usar letras maiores', true], ['Manter o menor tamanho mesmo com dificuldade', false]],
      learned: 'Você pode aumentar o tamanho do texto para deixar o celular mais confortável.'
    },
    'settings-volume': {
      kicker: 'AJUSTES', title: 'Ajuste o volume',
      instruction: 'Se o som estiver baixo, qual atitude é melhor?',
      example: '<strong>Volume de mídia</strong><div class="volume-demo"><i></i></div><small>Ajuste aos poucos até ficar confortável.</small>',
      options: [['Aumentar o volume aos poucos', true], ['Colocar no máximo sem testar', false]],
      learned: 'Ajuste o volume aos poucos até ouvir com conforto.'
    },
    'settings-wifi': {
      kicker: 'AJUSTES', title: 'Conecte ao Wi‑Fi',
      instruction: 'Qual rede é mais segura para usar?',
      example: '<strong>Redes disponíveis</strong><span>🏠 Casa_Maria 🔒</span><span>📶 WiFi_Gratis_Sem_Senha</span>',
      options: [['Casa_Maria, que você reconhece', true], ['WiFi grátis desconhecido', false]],
      learned: 'Prefira redes que você conhece e evite redes públicas desconhecidas para atividades sensíveis.'
    },
    'gov-login': {
      kicker: 'GOV.BR', title: 'Entre pelo acesso oficial',
      instruction: 'Qual opção parece ser o acesso oficial do GOV.BR?',
      example: '<strong>Atenção ao endereço</strong><span>Serviços oficiais usam o domínio gov.br.</span>',
      options: [['Acessar pelo GOV.BR oficial', true], ['Entrar por um link estranho recebido em mensagem', false]],
      learned: 'Para serviços públicos, procure o acesso oficial do GOV.BR e evite links suspeitos.'
    },
    'gov-service': {
      kicker: 'GOV.BR', title: 'Encontre um serviço',
      instruction: 'Se você precisa de um serviço, qual caminho é mais simples?',
      example: '<strong>Buscar serviços</strong><span>Digite o nome do que você precisa.</span><small>Ex.: “Carteira de Trabalho”, “INSS”.</small>',
      options: [['Pesquisar o serviço pelo nome dentro do GOV.BR', true], ['Clicar em qualquer propaganda da internet', false]],
      learned: 'Procure o serviço pelo nome dentro do ambiente oficial.'
    },
    'gov-logout': {
      kicker: 'GOV.BR', title: 'Saia da conta com segurança',
      instruction: 'Terminou de usar o GOV.BR em um aparelho compartilhado. O que fazer?',
      example: '<strong>Conta GOV.BR</strong><span>Seus dados pessoais estão conectados.</span>',
      options: [['Usar a opção Sair da conta', true], ['Deixar a conta aberta', false]],
      learned: 'Em aparelhos compartilhados, saia da conta quando terminar.'
    },
    'fake-bank-call': {
      kicker: 'SEGURANÇA', title: 'Falsa central bancária',
      instruction: 'Ligação suspeita na tela. Use o telefone de treino para interromper o golpe.',
      example: '<div class="educa-native-alert"><small>TELEFONE · LIGAÇÃO SUSPEITA</small><strong>Chamada de número desconhecido</strong><span>“Instale um aplicativo e informe sua senha para cancelar a compra.”</span><em>Simulação educativa · não é uma ligação real</em></div>',
      options: [['Desligar e procurar o banco pelo canal oficial', true], ['Seguir as instruções do desconhecido', false]],
      learned: 'Bancos não devem pedir sua senha em ligação ativa nem mandar instalar aplicativo para “cancelar” uma compra.'
    },
    'wa-code-safety': {
      kicker: 'WHATSAPP', title: 'Proteja seus códigos',
      instruction: 'Chegou uma mensagem pedindo seu código. Escolha uma ação na conversa simulada.',
      example: '<div class="educa-native-message"><small>WHATSAPP · CONVERSA DESCONHECIDA</small><span>Vai chegar um código. Me manda os 6 números.</span><em>Mensagem simulada · não compartilhe códigos reais</em></div>',
      options: [['Encerrar a conversa sem compartilhar o código', true], ['Enviar o código recebido', false]],
      learned: 'Códigos de verificação, senhas e dados bancários não devem ser enviados por mensagem.'
    },
    'gov-2fa': {
      kicker: 'GOV.BR', title: 'Verificação em duas etapas',
      instruction: 'Você está na segurança da conta simulada. Escolha onde abrir a verificação em duas etapas.',
      example: '<div class="educa-native-gov"><small>gov.br · SEGURANÇA DA CONTA</small><strong>Verificação em duas etapas</strong><span>Gerencie o acesso usando o próprio aplicativo oficial.</span><em>Ambiente de demonstração, sem CPF ou senha</em></div>',
      options: [['Abrir verificação no aplicativo GOV.BR', true], ['Usar código enviado por desconhecido', false]],
      learned: 'O código da verificação em duas etapas é gerado no próprio aplicativo GOV.BR e não deve ser compartilhado.'
    },
    'play-permissions': {
      kicker: 'APPS SEGUROS', title: 'Revise as permissões',
      instruction: 'Um aplicativo pede muitos acessos. Toque na opção para ajustar as permissões com segurança.',
      example: '<div class="educa-native-permission"><small>AJUSTES · PERMISSÕES</small><strong>Acesso solicitado pelo aplicativo</strong><span>🎤 Microfone　📷 Câmera　📍 Localização</span><em>Examine os acessos antes de permitir</em></div>',
      options: [['Negar acessos que não são necessários', true], ['Permitir todos os acessos', false]],
      learned: 'Revise as permissões e permita apenas acessos necessários para a função do aplicativo.'
    }
  };

  const normalChats = {
    daughter: {
      title: 'Maria (filha)', avatar: 'M',
      messages: [
        ['incoming', 'Oi mãe! Chego por volta das seis ❤️', '13:35'],
        ['outgoing', 'Está bem, minha filha. Até mais tarde!', '13:36'],
        ['incoming', 'Até mais tarde ❤️', '13:40']
      ]
    },
    'family-group': {
      title: 'Grupo da família', avatar: 'G',
      messages: [
        ['incoming', 'João: mandei as fotos do almoço de domingo.', '12:03'],
        ['outgoing', 'Ficaram lindas! Obrigada.', '12:04'],
        ['incoming', 'Maria: depois te ensino a salvar no celular 😊', '12:05']
      ]
    }
  };

  let trainingStarted = false;
  let currentScenario = null;
  let completed = new Set();
  let transitionLock = false;
  let accountPromptShown = false;

  const coachSteps = [
    ['Abra o WhatsApp', 'Toque no ícone do WhatsApp no celular.', 'O ícone é verde, com um telefone branco dentro.'],
    ['Primeira situação', 'Abra a conversa “Filho — número novo” e veja o que aconteceu.', scenarios.family.hint],
    ['Continue praticando', 'Agora escolha outra conversa com aviso não lido e analise a situação.', 'Procure as conversas Banco • Atendimento e Contato desconhecido.'],
    ['Você está indo muito bem', 'Complete as três situações de segurança para finalizar a experiência.', 'Você pode voltar à lista de conversas e escolher as que ainda não têm o ✓.']
  ];

  function setView(name) {
    // Every screen change invalidates pending arrows from the previous screen.
    guideEpoch += 1;
    if (guideTimer) {
      window.clearTimeout(guideTimer);
      guideTimer = null;
    }
    stopGuidePositionTracking();
    stopGuideIconMotion();
    if (guideOverlay) {
      guideOverlay.hidden = true;
      guideOverlay.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('guide-focus-active');
    guidePointer?.classList.remove('below-target');
    $$('.guide-target').forEach(el => { el.classList.remove('guide-target'); el.classList.remove('guide-icon-motion'); });

    const views = $$('.android-view');
    const exists = views.some(view => view.dataset.view === name);
    const safeName = exists ? name : 'learning';
    views.forEach(view => view.classList.toggle('is-active', view.dataset.view === safeName));
    phoneScreen?.setAttribute('data-current-view', safeName);
    syncPretestStepUI(safeName);
  }

  // O pré-teste não cria uma segunda atividade fora do celular.
  // O resumo compacto acompanha o aplicativo ativo e continua visível na rolagem.
  function syncPretestStepUI(viewName = phoneScreen?.dataset.currentView || 'home') {
    const steps = { 'bank-home': 1, 'bank-pix': 2, 'bank-send': 3, 'bank-review': 4 };
    const step = steps[viewName];
    const showStep = Boolean(isGuestPretest && accessMode !== 'registered' && trainingStarted && step);
    document.body.classList.toggle('pretest-in-progress', showStep);
    document.body.classList.toggle('educa-session-active', trainingStarted);
    if (pretestStepBar) pretestStepBar.hidden = !showStep;
    if (!showStep) return;
    if (pretestStepLabel) pretestStepLabel.textContent = `PRÉ-TESTE DE PIX · ETAPA ${step} DE 4`;
    if (pretestStepHint) {
      pretestStepHint.textContent = miniCoachTitle?.textContent?.trim() || 'Siga a orientação destacada no celular.';
    }
  }

  // Ponte opcional: o modo livre navega sem alterar as atividades guiadas.
  window.EducaFreeView = { setView, openLearningHub, isTraining: () => trainingStarted };

  function clearGuide({ keepState = false } = {}) {
    guideEpoch += 1;
    if (guideTimer) {
      window.clearTimeout(guideTimer);
      guideTimer = null;
    }
    stopGuidePositionTracking();
    stopGuideIconMotion();
    if (guideOverlay) {
      guideOverlay.hidden = true;
      guideOverlay.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('guide-focus-active');
    if (guideSpotlight) {
      guideSpotlight.style.left = '';
      guideSpotlight.style.top = '';
      guideSpotlight.style.width = '';
      guideSpotlight.style.height = '';
      guideSpotlight.style.borderRadius = '';
    }
    if (guidePointer) {
      guidePointer.classList.remove('below-target', 'no-guide-arrow');
      guidePointer.style.left = '';
      guidePointer.style.top = '';
    }
    $$('.guide-target').forEach(el => { el.classList.remove('guide-target'); el.classList.remove('guide-icon-motion'); });
    if (!keepState) activeGuide = null;
  }

  function clearLandingPretest() {
    $$('.landing-pretest-target').forEach(el => { el.classList.remove('landing-pretest-target'); el.classList.remove('guide-icon-motion'); });
    document.body.classList.remove('landing-pretest-active');
  }

  function applyLandingPretest() {

    // Um recarregamento da página nunca deve restaurar visualmente uma atividade
    // que ainda não foi iniciada nesta sessão. Para quem já tem progresso salvo,
    // deixamos o celular em estado neutro até a pessoa tocar em “Continuar meu treino”.
    if (trainingStarted) {
      clearLandingPretest();
      return;
    }

    setView('home');
    clearGuide();
    clearLandingPretest();
    if (trainingBadge) trainingBadge.hidden = false;
    const bankTile = $('[data-open-app="bank"]');
    if (!bankTile) return;
    document.body.classList.add('landing-pretest-active');
    bankTile.classList.add('landing-pretest-target');
    if (miniCoachKicker) miniCoachKicker.textContent = 'PRÉ-TESTE · PIX';
    if (miniCoachTitle) miniCoachTitle.textContent = 'Experimente pelo Banco';
    if (miniCoachText) miniCoachText.textContent = 'Toque no Banco para experimentar uma atividade de Pix.';
    // V111.49: na tela inicial, destacar o Banco sem escurecer o celular.
    // O guia passo a passo começa somente quando a pessoa abre a atividade.
  }

  function scheduleGuide(target, options = {}, delay = 100) {
    const expectedEpoch = guideEpoch;
    if (guideTimer) window.clearTimeout(guideTimer);
    guideTimer = window.setTimeout(() => {
      guideTimer = null;
      if (expectedEpoch !== guideEpoch) return;
      showGuideOnTarget(target, options);
    }, delay);
  }

  function getGuideScrollParents(target) {
    const parents = [];
    let node = target?.parentElement || null;
    while (node && node !== phoneScreen) {
      const style = window.getComputedStyle(node);
      const canScrollY = /(auto|scroll|overlay)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1;
      const canScrollX = /(auto|scroll|overlay)/.test(style.overflowX) && node.scrollWidth > node.clientWidth + 1;
      if (canScrollY || canScrollX) parents.push(node);
      node = node.parentElement;
    }
    if (phoneScreen) parents.push(phoneScreen);
    return [...new Set(parents)];
  }

  function stopGuidePositionTracking() {
    if (guidePositionRaf) {
      window.cancelAnimationFrame(guidePositionRaf);
      guidePositionRaf = null;
    }
    guideScrollParents.forEach(parent => parent.removeEventListener('scroll', scheduleGuidePositionUpdate));
    guideScrollParents = [];
    if (guideResizeObserver) {
      guideResizeObserver.disconnect();
      guideResizeObserver = null;
    }
    guideTrackedTarget = null;
  }

  function scheduleGuidePositionUpdate() {
    if (guidePositionRaf || !guideTrackedTarget || !guideOverlay) return;
    guidePositionRaf = window.requestAnimationFrame(() => {
      guidePositionRaf = null;
      positionGuideOnTarget(guideTrackedTarget, guideTrackedLabel);
    });
  }

  // V91: área segura do aparelho. Não use a faixa do relógio, a câmera ou
  // a barra de gesto para posicionar o alvo ou o texto do tutorial.
  function guideSafeBounds(target = null) {
    const box = phoneScreen.getBoundingClientRect();
    const top = box.top + Math.max(46, Math.min(62, box.height * .065));
    const bottom = target?.closest?.('.gov-bottom-nav, .whatsapp-bottom, .launcher-bottom, .chat-composer, .normal-chat-composer')
      ? box.bottom - 12
      : box.bottom - Math.max(48, Math.min(70, box.height * .07));
    return { left: box.left + 8, right: box.right - 8, top, bottom };
  }

  function guideClippingBounds(target) {
    const safe = guideSafeBounds(target);
    let bounds = { ...safe };
    for (const parent of getGuideScrollParents(target)) {
      if (parent === phoneScreen) continue;
      const rect = parent.getBoundingClientRect();
      const style = window.getComputedStyle(parent);
      if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) {
        bounds.top = Math.max(bounds.top, rect.top + 2);
        bounds.bottom = Math.min(bounds.bottom, rect.bottom - 2);
      }
      if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) {
        bounds.left = Math.max(bounds.left, rect.left + 2);
        bounds.right = Math.min(bounds.right, rect.right - 2);
      }
    }
    return bounds;
  }

  // Rola apenas os painéis internos do celular. O corpo da página não muda
  // enquanto uma aula procura o próximo botão.
  function revealGuideTarget(target) {
    const scrollParents = getGuideScrollParents(target).filter(el => el !== phoneScreen);
    let moved = false;
    const safe = guideSafeBounds(target);
    scrollParents.forEach(parent => {
      const style = window.getComputedStyle(parent);
      if (!/(auto|scroll|overlay)/.test(style.overflowY) || parent.scrollHeight <= parent.clientHeight + 1) return;
      const view = parent.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      const top = Math.max(view.top + 12, safe.top + 8);
      const bottom = Math.min(view.bottom - 12, safe.bottom - 8);
      if (bottom <= top) return;
      // Para grupos altos, priorize o centro; para um botão pequeno,
      // preserve 12 px de respiro entre ele e o limite da tela.
      let delta = 0;
      if (rect.height > bottom - top) delta = (rect.top + rect.bottom) / 2 - (top + bottom) / 2;
      else if (rect.top < top) delta = rect.top - top;
      else if (rect.bottom > bottom) delta = rect.bottom - bottom;
      if (Math.abs(delta) > 1) {
        const before = parent.scrollTop;
        parent.scrollTop += delta;
        moved ||= Math.abs(parent.scrollTop - before) > 1;
      }
    });
    return moved;
  }

  function positionGuideOnTarget(target, label = 'Toque aqui') {
    if (!guideOverlay || !guideSpotlight || !guidePointer || !phoneScreen || !target || !target.isConnected) return;
    const targetView = target.closest('.android-view');
    if (targetView && !targetView.classList.contains('is-active')) { clearGuide({ keepState:true }); return; }
    if (target.getClientRects().length === 0) { clearGuide({ keepState:true }); return; }

    const pointerLabel = guidePointer.querySelector('span');
    if (pointerLabel) pointerLabel.textContent = label;

    const screenRect = phoneScreen.getBoundingClientRect();
    // Primeiro garanta que o próprio alvo esteja dentro da rolagem disponível.
    revealGuideTarget(target);
    const safe = guideClippingBounds(target);
    const isAppIcon = target.matches('.app-tile');
    const iconElement = isAppIcon ? (target.querySelector('.adaptive-icon') || target) : target;
    const iconRect = iconElement.getBoundingClientRect();
    let rect = iconRect;
    if (isAppIcon) {
      const nameElement = target.lastElementChild;
      if (nameElement && nameElement !== iconElement) {
        const nameRect = nameElement.getBoundingClientRect();
        rect = {
          left: Math.min(iconRect.left, nameRect.left),
          top: Math.min(iconRect.top, nameRect.top),
          right: Math.max(iconRect.right, nameRect.right),
          bottom: Math.max(iconRect.bottom, nameRect.bottom),
          width: Math.max(iconRect.right, nameRect.right) - Math.min(iconRect.left, nameRect.left),
          height: Math.max(iconRect.bottom, nameRect.bottom) - Math.min(iconRect.top, nameRect.top)
        };
      }
    }

    const visible = {
      left: Math.max(rect.left, safe.left),
      right: Math.min(rect.right, safe.right),
      top: Math.max(rect.top, safe.top),
      bottom: Math.min(rect.bottom, safe.bottom)
    };
    // Nunca finja que há um botão na borda se a ação verdadeira não está à vista.
    if (visible.right <= visible.left + 8 || visible.bottom <= visible.top + 8) {
      guideOverlay.hidden = true;
      document.body.classList.remove('guide-focus-active');
      // Libere o clique/rolagem, evitando prender idosos em um passo invisível.
      return;
    }
    guideOverlay.hidden = false;
    document.body.classList.add('guide-focus-active');
    const padX = isAppIcon ? 11 : 7;
    const padY = isAppIcon ? 9 : 6;
    const leftEdge = Math.max(safe.left, visible.left - padX);
    const rightEdge = Math.min(safe.right, visible.right + padX);
    const topEdge = Math.max(safe.top, visible.top - padY);
    const bottomEdge = Math.min(safe.bottom, visible.bottom + padY);
    guideSpotlight.style.left = `${leftEdge - screenRect.left}px`;
    guideSpotlight.style.top = `${topEdge - screenRect.top}px`;
    guideSpotlight.style.width = `${Math.max(1, rightEdge - leftEdge)}px`;
    guideSpotlight.style.height = `${Math.max(1, bottomEdge - topEdge)}px`;
    guideSpotlight.style.borderRadius = isAppIcon ? '25px' : '15px';

    // O balão acompanha o alvo (flip + shift), não o rodapé do telefone.
    const pointerWidth = guidePointer.offsetWidth || 110;
    const pointerHeight = guidePointer.offsetHeight || 39;
    const margin = 18; // inclui a seta
    const above = topEdge - pointerHeight - margin;
    const below = bottomEdge + margin;
    const fitsAbove = above >= safe.top + 2;
    const fitsBelow = below + pointerHeight <= safe.bottom - 2;
    let isBelow = false;
    let pointerTop;
    if (fitsAbove) pointerTop = above;
    else if (fitsBelow) { pointerTop = below; isBelow = true; }
    else {
      // Um painel muito baixo não comporta balão + seta. Não sobreponha a
      // barra inferior: posicione a etiqueta junto ao alvo e oculte a seta.
      pointerTop = Math.max(safe.top + 2, Math.min(above, safe.bottom - pointerHeight - 2));
      guidePointer.classList.add('no-guide-arrow');
    }
    if (fitsAbove || fitsBelow) guidePointer.classList.remove('no-guide-arrow');
    const centerX = (visible.left + visible.right) / 2;
    const pointerLeft = Math.max(safe.left + 2, Math.min(centerX - pointerWidth / 2, safe.right - pointerWidth - 2));
    guidePointer.style.left = `${pointerLeft - screenRect.left}px`;
    guidePointer.style.top = `${pointerTop - screenRect.top}px`;
    guidePointer.classList.toggle('below-target', isBelow);
    const arrow = guidePointer.querySelector('i');
    if (arrow) {
      const arrowX = Math.max(14, Math.min(pointerWidth - 14, centerX - pointerLeft));
      arrow.style.left = `${arrowX}px`;
    }
  }

  function startGuidePositionTracking(target, label) {
    guideTrackedTarget = target;
    guideTrackedLabel = label;
    guideScrollParents = getGuideScrollParents(target);
    guideScrollParents.forEach(parent => parent.addEventListener('scroll', scheduleGuidePositionUpdate, { passive: true }));

    if ('ResizeObserver' in window) {
      guideResizeObserver = new ResizeObserver(scheduleGuidePositionUpdate);
      guideResizeObserver.observe(target);
      guideResizeObserver.observe(phoneScreen);
    }
  }


  let guideIconMotionAnimation = null;

  function stopGuideIconMotion() {
    if (guideIconMotionAnimation) {
      try { guideIconMotionAnimation.cancel(); } catch (_) {}
      guideIconMotionAnimation = null;
    }
  }

  function startGuideIconMotion(target) {
    stopGuideIconMotion();
    if (!target?.matches?.('.app-tile')) return;
    const iconImage = target.querySelector('.adaptive-icon > img');
    if (!iconImage || typeof iconImage.animate !== 'function') return;

    // A luz fica parada. Somente a imagem do ícone sobe levemente e volta.
    guideIconMotionAnimation = iconImage.animate([
      { transform: 'translate3d(0, 0, 0) scale(1)' },
      { transform: 'translate3d(0, -4px, 0) scale(1.065)' },
      { transform: 'translate3d(0, 0, 0) scale(1)' }
    ], {
      duration: 1350,
      iterations: Infinity,
      easing: 'ease-in-out'
    });
  }

  function showGuideOnTarget(target, { label = 'Toque aqui' } = {}) {
    if (!guideOverlay || !guideSpotlight || !guidePointer || !phoneScreen || !target || !target.isConnected) return;
    const targetView = target.closest('.android-view');
    if (targetView && !targetView.classList.contains('is-active')) return;
    if (target.getClientRects().length === 0) return;

    clearGuide({ keepState: true });
    target.classList.add('guide-target');
    const isInitialIconTarget = target.matches('.app-tile');
    target.classList.toggle('guide-icon-motion', isInitialIconTarget);
    if (isInitialIconTarget) startGuideIconMotion(target);
    guideOverlay.hidden = false;
    guideOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('guide-focus-active');

    startGuidePositionTracking(target, label);
    requestAnimationFrame(() => positionGuideOnTarget(target, label));
  }

  function updateLearningAccessUI() {
    const registered = accessMode === 'registered' || progressSaved;
    learningAccess?.classList.toggle('registered', registered);
    learningAccess?.classList.toggle('demo', !registered);
    if (learningAccountOptions) learningAccountOptions.hidden = registered;
    // V102: removido aviso de acesso dentro do celular; escolha livre continua disponível.
    if (learningAccessText) learningAccessText.textContent = registered
      ? 'Escolha qualquer assunto ou atividade, na ordem que preferir.'
      : 'Todas as atividades estão disponíveis. Salvar o progresso é opcional.';
    if (featuredAccessNote) featuredAccessNote.textContent = 'Escolha qualquer atividade do Pix';
    $$('[data-learning-topic]').forEach(card => {
      card.classList.remove('is-locked');
      card.removeAttribute('aria-disabled');
      card.disabled = false;
    });
    $$('.training-chat, .normal-chat').forEach(row => row.classList.remove('demo-locked'));
  }

  function startGuidedTopic(topicId) {
    const topic = learningTopics[topicId];
    if (!topic || !topic.lessons?.length) return;
    isGuestPretest = false;
    trainingStarted = true;
    clearLandingPretest();
    clearGuide();
    openModulePath(topicId);
  }

  function lessonKey(topicId, lessonIndex) {
    return `${topicId}:${lessonIndex}`;
  }

  function isLessonComplete(topicId, lessonIndex) {
    const key = lessonKey(topicId, lessonIndex);
    return accessMode === 'registered' ? completedLessons.has(key) : guestCompletedLessons.has(key);
  }

  function saveLessonComplete(topicId, lessonIndex) {
    if (!topicId && topicId !== '') return;
    const key = lessonKey(topicId, lessonIndex);
    if (accessMode !== 'registered' || !getRememberedUser()?.phone) {
      // Uma pessoa sem conta pode praticar e acompanhar o que concluiu nesta visita.
      guestCompletedLessons.add(key);
      return;
    }
    completedLessons.add(key);
    try { localStorage.setItem('educaCompletedLessonsV44', JSON.stringify([...completedLessons])); } catch (_) {}
    const activityCode = learningTopics[topicId]?.lessons?.[lessonIndex]?.[2];
    if (activityCode) syncProgressEvent(activityCode, 'complete');
  }

  function firstIncompleteLesson(topicId) {
    const topic = learningTopics[topicId];
    if (!topic) return 0;
    const idx = topic.lessons.findIndex((_, i) => !isLessonComplete(topicId, i));
    return idx === -1 ? topic.lessons.length - 1 : idx;
  }

  function openModulePath(topicId) {
    clearLandingPretest();
    clearGuide();
    const topic = learningTopics[topicId];
    if (!topic) return openLearningHub();
    currentLearningTopic = topicId;
    currentLessonIndex = firstIncompleteLesson(topicId);
    currentTopicAction = topic.lessons[currentLessonIndex]?.[2] || '';
    if (modulePathTitle) modulePathTitle.textContent = topic.title;
    // V111.46: um objetivo por tela; o método de treino não se repete nos cartões.
    const topicObjectives = {
      pix: 'Confira os dados antes de pagar',
      security: 'Aprenda a reconhecer golpes',
      whatsapp: 'Use o WhatsApp com confiança',
      settings: 'Ajuste seu celular com facilidade',
      govbr: 'Acesse serviços com segurança',
      playstore: 'Escolha aplicativos com segurança'
    };
    if (modulePathHeadline) modulePathHeadline.textContent = topicObjectives[topicId] || `Aprenda ${topic.title}`;
    if (modulePathIntro) modulePathIntro.textContent = 'Veja a orientação e depois pratique. Faça uma etapa de cada vez.';
    if (modulePathEyebrow) modulePathEyebrow.textContent = `${topic.lessons.length} PASSOS SIMPLES`;
    if (modulePathIcon) modulePathIcon.textContent = topicId === 'pix' ? 'PIX' : topic.title.slice(0,2).toUpperCase();

    const completedCount = topic.lessons.filter((_, i) => isLessonComplete(topicId, i)).length;
    const pct = Math.round((completedCount / topic.lessons.length) * 100);
    if (modulePathProgressText) modulePathProgressText.textContent = `${completedCount} de ${topic.lessons.length} atividades concluídas`;
    if (modulePathProgressPct) modulePathProgressPct.textContent = `${pct}%`;
    if (modulePathProgressFill) modulePathProgressFill.style.width = `${pct}%`;

    if (moduleLessonList) {
      moduleLessonList.innerHTML = topic.lessons.map((lesson, index) => {
        const [title, summary] = lesson;
        const complete = isLessonComplete(topicId, index);
        // Cada atividade tem um único título visível e um botão com alvo de toque amplo.
        // O nome do capítulo permanece no catálogo, mas não duplica o título no card.
        const current = index === firstIncompleteLesson(topicId);
        const state = complete ? 'Concluída' : 'Abrir atividade';
        const nextStep = current && !complete;
        const stepLabel = complete ? '<span class="module-lesson-eyebrow is-done">CONCLUÍDA</span>'
          : nextStep ? '<span class="module-lesson-eyebrow is-next">COMECE AQUI</span>' : '';
        return `<section class="module-chapter"><button class="module-lesson-card${complete ? ' is-complete' : ''}${nextStep ? ' is-current' : ''}" type="button" data-module-lesson="${index}" aria-label="Atividade ${index + 1}: ${title}. ${state}."><span class="module-lesson-number" aria-hidden="true">${complete ? '✓' : index + 1}</span><span class="module-lesson-card-copy">${stepLabel}<strong>${title}</strong><small>${summary}</small></span><span class="module-lesson-state" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button></section>`;
      }).join('');
    }
    setView('module-path');
    window.requestAnimationFrame(() => { if (modulePathView) modulePathView.scrollTop = 0; });
    if (miniCoachKicker) miniCoachKicker.textContent = topic.title.toUpperCase();
    if (miniCoachTitle) miniCoachTitle.textContent = 'Escolha qualquer atividade';
    if (miniCoachText) miniCoachText.textContent = 'Escolha uma etapa e pratique no seu ritmo.';
  }

  function openLessonVideo(topicId, lessonIndex) {
    const topic = learningTopics[topicId];
    const lesson = topic?.lessons?.[lessonIndex];
    if (!lesson) return openModulePath(topicId);
    const video = lessonVideos[lesson[2]];
    if (!video) return startTopic(topicId, lessonIndex);
    currentVideoTopic = topicId;
    currentVideoLessonIndex = lessonIndex;
    currentLearningTopic = topicId;
    currentLessonIndex = lessonIndex;
    currentTopicAction = lesson[2];
    if (videoLessonKicker) videoLessonKicker.textContent = `VÍDEO · CAPÍTULO ${lessonIndex + 1} DE ${topic.lessons.length}`;
    if (videoLessonTitle) videoLessonTitle.textContent = video.title;
    if (videoLessonSummary) videoLessonSummary.textContent = video.summary;
    if (lessonVideo) { lessonVideo.pause(); lessonVideo.src = video.src; lessonVideo.load(); }
    setView('video-lesson');
    if (miniCoachKicker) miniCoachKicker.textContent = `${topic.title.toUpperCase()} · VÍDEO`;
    if (miniCoachTitle) miniCoachTitle.textContent = video.title;
    if (miniCoachText) miniCoachText.textContent = 'Assista e, quando estiver pronto, toque em “Agora quero praticar”.';
  }

  function startLessonFlow(topicId, lessonIndex) {
    const topic = learningTopics[topicId];
    if (!topic?.lessons?.[lessonIndex]) return openModulePath(topicId);
    const action = topic.lessons[lessonIndex][2];
    if (lessonVideos[action]) openLessonVideo(topicId, lessonIndex);
    else startTopic(topicId, lessonIndex);
  }

  function enterPrototypeFocus({ boot = true } = {}) {
    if (accessMode !== 'registered' && !progressSaved) return;
    document.body.classList.add('prototype-focus');
    updatePrototypeViewportFit();
    if (focusLogoutBtn) focusLogoutBtn.hidden = false;
    if (focusExpandBtn) focusExpandBtn.hidden = isPhoneExpanded();
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (boot && prototypeBoot) {
      const firstName = participantName && participantName !== 'Participante' ? participantName.trim().split(/\s+/)[0] : '';
      if (prototypeBootTitle) prototypeBootTitle.textContent = firstName ? `Olá, ${firstName}` : 'Preparando seu treino';
      if (prototypeBootText) prototypeBootText.textContent = 'Preparando sua central de aprendizagem...';
      prototypeBoot.hidden = false;
      prototypeBoot.setAttribute('aria-hidden', 'false');
      window.setTimeout(() => {
        prototypeBoot.classList.add('is-leaving');
        window.setTimeout(() => {
          prototypeBoot.hidden = true;
          prototypeBoot.classList.remove('is-leaving');
          prototypeBoot.setAttribute('aria-hidden', 'true');
        }, 320);
      }, 1150);
    }
  }

  function exitPrototypeFocus() {
    document.documentElement.classList.remove('educa-immersive-active');
    syncFullscreenControls();
    document.body.classList.remove('prototype-focus');
    if (focusLogoutBtn) focusLogoutBtn.hidden = true;
    if (focusExpandBtn) focusExpandBtn.hidden = true;
    if (prototypeBoot) {
      prototypeBoot.hidden = true;
      prototypeBoot.classList.remove('is-leaving');
      prototypeBoot.setAttribute('aria-hidden', 'true');
    }
  }

  async function syncAndroidStatus() {
    if (!window.EducaAndroidApi) return;
    try {
      const state = await window.EducaAndroidApi.getDeviceState();
      const level = Math.max(0, Math.min(100, Number(state?.battery ?? 84)));
      if (batteryPercent) batteryPercent.textContent = `${level}%`;
      if (batteryFill) batteryFill.style.width = `${Math.max(8, level)}%`;
      const network = String(state?.network || '').toLowerCase();
      if (wifiIcon) wifiIcon.style.opacity = network.includes('wifi') ? '1' : '.35';
      if (signalIcon) signalIcon.style.opacity = network.includes('cell') || network.includes('mobile') ? '1' : '.7';
      if (state?.source === 'android' || window.EducaAndroidApi.isNative()) {
        document.body.dataset.androidNative = 'true';
      }
    } catch (_) {}
  }

  function nativeHaptic(type='tap') {
    window.EducaAndroidApi?.haptic?.(type);
  }

  function announce(message, good = true) {
    if (!coachStatus) return;
    coachStatus.textContent = message;
    coachStatus.className = `coach-status ${good ? 'good' : 'bad'}`;
  }

  function setCoach(index) {
    const [title, text, hint] = coachSteps[index] || coachSteps[coachSteps.length - 1];
    coachTitle.textContent = title;
    coachText.textContent = text;
    if (miniCoachKicker) miniCoachKicker.textContent = 'TREINO DE SEGURANÇA';
    if (miniCoachTitle) miniCoachTitle.textContent = title;
    if (miniCoachText) miniCoachText.textContent = text;
    hintText.textContent = hint;
    hintText.hidden = true;
    const n = Math.min(index + 1, 4);
    trainingProgress.textContent = `${n} de 4`;
    progressFill.style.width = `${n * 25}%`;
  }

  function saveRememberedUser(name, phone) {
    try {
      localStorage.setItem('educaRememberedUser', JSON.stringify({ name, phone }));
    } catch (_) {}
    participantName = name || '';
    progressSaved = true;
    accessMode = 'registered';
    updateReturningUI();
  }

  function getRememberedUser() {
    try {
      const raw = localStorage.getItem('educaRememberedUser');
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }


  async function syncProgressEvent(activityCode, eventName) {
    const user = getRememberedUser();
    if (!user?.phone || !activityCode) return;
    try {
      await fetch('/api/progresso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone, activity_code: activityCode, event: eventName })
      });
    } catch (_) {
      // A experiência continua offline; o localStorage ainda preserva o estado neste aparelho.
    }
  }

  async function loadServerProgress(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.length < 10) return;
    try {
      const response = await fetch(`/api/progresso?phone=${encodeURIComponent(digits)}`);
      if (!response.ok) return;
      const data = await response.json();
      const completedCodes = new Set((data.atividades || []).filter(item => item.concluido).map(item => item.atividade_codigo));
      Object.entries(learningTopics).forEach(([topicId, topic]) => {
        (topic.lessons || []).forEach((lesson, index) => {
          if (completedCodes.has(lesson[2])) completedLessons.add(lessonKey(topicId, index));
        });
      });
      try { localStorage.setItem('educaCompletedLessonsV44', JSON.stringify([...completedLessons])); } catch (_) {}
    } catch (_) {}
  }

  function clearRememberedUser() {
    try {
      localStorage.removeItem('educaRememberedUser');
    } catch (_) {}
    participantName = '';
    progressSaved = false;
    accessMode = 'guest';
    updateReturningUI();
  }

  function updateReturningUI() {
    const user = getRememberedUser();
    if (user?.name && user?.phone) {
      participantName = user.name;
      progressSaved = true;
      accessMode = 'registered';
      // Login apenas por telefone: "Participante" é um identificador técnico,
      // não deve aparecer como nome pessoal no cabeçalho.
      const firstName = user.name && user.name !== 'Participante' ? user.name.trim().split(/\s+/)[0] : '';
      if (headerTrust) headerTrust.textContent = firstName ? `Olá, ${firstName}` : 'Meu treino';
      if (startNowLabel) startNowLabel.textContent = 'Continuar meu treino';
      if (heroActionNote) heroActionNote.textContent = 'Seu progresso está salvo neste aparelho';
      if (logoutBtn) logoutBtn.hidden = false;
    } else {
      progressSaved = false;
      if (accessMode !== 'demo') accessMode = 'guest';
      if (headerTrust) headerTrust.textContent = 'Pré-teste gratuito';
      if (startNowLabel) startNowLabel.textContent = 'Começar meu treino';
      if (heroActionNote) heroActionNote.textContent = 'Acesso livre, sem cadastro';
      if (logoutBtn) logoutBtn.hidden = true;
    }
    updateLearningAccessUI();
  }

  function openReturnModal() {
    if (!returnModal) return;
    returnModal.hidden = false;
    returnModal.setAttribute('aria-hidden', 'false');
    returnPhoneStep.hidden = false;
    returnCodeStep.hidden = true;
    if (returnPhoneMessage) returnPhoneMessage.hidden = true;
    if (returnCodeMessage) returnCodeMessage.hidden = true;
    if (demoCodeBox) demoCodeBox.hidden = true;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => returnPhone?.focus(), 120);
  }

  function closeReturnModal() {
    if (!returnModal) return;
    returnModal.hidden = true;
    returnModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showReturnMessage(el, message, cls='error') {
    if (!el) return;
    el.hidden = false;
    el.className = `return-message ${cls}`;
    el.textContent = message;
  }

  function openStartModal({ unlock = false, fromPretest = false, entry = false } = {}) {
    if (!startModal) return;
    if (startModalTitle) startModalTitle.textContent = fromPretest
      ? 'Muito bem! Vamos criar sua conta?'
      : (entry ? 'Comece seu treino no Educa+' : 'Quer salvar seu progresso?');
    if (startModalIntro) startModalIntro.textContent = fromPretest
      ? 'Você terminou o pré-teste. Para continuar, digite somente seu celular com DDD.'
      : 'Informe seu celular com DDD. O Educa+ encontrará seu treino ou criará um novo.';
    const kicker = $('#startModalKicker');
    if (kicker) kicker.textContent = fromPretest ? 'PRÉ-TESTE CONCLUÍDO' : (entry ? 'COMEÇAR MEU TREINO' : 'SALVAR MEU PROGRESSO');
    if (quickSaveBtn) {
      const label = fromPretest ? 'Criar minha conta' : entry ? 'Criar conta e começar' : 'Salvar meu progresso';
      quickSaveBtn.textContent = label;
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('class', 'nav-vector'); icon.setAttribute('viewBox', '0 0 24 24');
      icon.setAttribute('fill', 'none'); icon.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d', 'm9 5 7 7-7 7'); path.setAttribute('stroke','currentColor');
      path.setAttribute('stroke-width','2.15'); path.setAttribute('stroke-linecap','round');
      path.setAttribute('stroke-linejoin','round'); icon.appendChild(path);
      quickSaveBtn.appendChild(icon);
    }
    if ($('#quickSkipBtn')) $('#quickSkipBtn').textContent = fromPretest ? 'Voltar ao início' : (entry ? 'Aprender sem cadastro' : 'Agora não');
    startModal.dataset.unlock = unlock ? '1' : '0';
    startModal.dataset.origin = fromPretest ? 'pretest' : (entry ? 'entry' : 'progress');
    startModal.hidden = false;
    startModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (quickStartMessage) quickStartMessage.hidden = true;
    window.setTimeout(() => quickPhone?.focus(), 120);
  }

  function closeStartModal() {
    if (!startModal) return;
    startModal.hidden = true;
    startModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showQuickStartMessage(message, cls='error') {
    if (!quickStartMessage) return;
    quickStartMessage.hidden = false;
    quickStartMessage.className = `quick-start-message ${cls}`;
    quickStartMessage.textContent = message;
  }

  function formatPhone(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits ? `(${digits}` : '';
    if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  }

  function openInfoModal() {
    const modal = $('#infoModal');
    if (!modal) return;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeInfoModal() {
    const modal = $('#infoModal');
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function updateLearningGreeting() {
    if (!learningGreeting) return;
    const firstName = participantName && participantName !== 'Participante' ? participantName.trim().split(/\s+/)[0] : '';
    learningGreeting.textContent = firstName ? `${firstName}, o que você quer aprender hoje?` : 'O que você quer aprender hoje?';
  }

  function setCoachMessage(kicker, title, text) {
    if (trainingBadge) trainingBadge.hidden = false;
    if (miniCoachKicker) miniCoachKicker.textContent = kicker;
    if (miniCoachTitle) miniCoachTitle.textContent = title;
    if (miniCoachText) miniCoachText.textContent = text;
    syncPretestStepUI();
  }

  function openSettingsView(view = 'settings-main') {
    clearGuide({ keepState: true });
    setView(view);
  }

  function guideSettingsAction(action) {
    clearGuide({ keepState: true });
    if (action === 'settings-font') {
      openSettingsView('settings-main');
      setCoachMessage('AJUSTES · PASSO 1', 'Entre em Tela e toque', 'Toque em “Tela e toque” para encontrar o tamanho das letras.');
      scheduleGuide(settingsDisplayRow, { label: 'Tela e toque' }, 100);
      return;
    }
    if (action === 'settings-volume') {
      openSettingsView('settings-main');
      setCoachMessage('AJUSTES · PASSO 1', 'Entre em Som e vibração', 'Toque em “Som e vibração” para encontrar os controles de volume.');
      scheduleGuide(settingsSoundRow, { label: 'Som e vibração' }, 100);
      return;
    }
    if (action === 'settings-wifi') {
      openSettingsView('settings-main');
      setCoachMessage('AJUSTES · PASSO 1', 'Entre em Rede e Internet', 'Toque em “Rede e Internet” para encontrar o Wi‑Fi.');
      scheduleGuide(settingsNetworkRow, { label: 'Rede e Internet' }, 100);
    }
  }

  function updateGovName() {
    // Somente nome do participante informado NO EDUCA, não há acesso a dados GOV.BR.
    const safeName = participantName ? participantName.trim().slice(0, 40) : 'Maria (exemplo)';
    const firstName = (safeName.split(/\s+/)[0] || 'Maria').toUpperCase();
    if (govWelcomeName) govWelcomeName.textContent = firstName;
    if (govFullNameData) govFullNameData.textContent = safeName.toUpperCase();
    if (govFullNameDoc) govFullNameDoc.textContent = safeName.toUpperCase();
  }

  function openGovView(view) {
    clearGuide({ keepState: true });
    updateGovName();
    setView(view);
    if (view === 'govbr-services') {
      govSearchUsed = false;
      if (govServiceSearch) govServiceSearch.value = '';
      $$('.gov-service-list.inner .gov-service-card').forEach(row => { row.hidden = false; });
      const help = $('#govSearchHelp');
      if (help) help.textContent = 'Digite, por exemplo, “Prova de vida”, “Carteira” ou “Agenda”.';
    }
  }

  function guideGovAction(action) {
    clearGuide({ keepState: true });
    if (action === 'gov-login') {
      govSessionActive = false;
      openGovView('govbr-login');
      setCoachMessage('GOV.BR · PASSO 1', 'Entre pelo botão oficial', 'No aplicativo gov.br, o acesso começa pelo botão azul “Entrar com gov.br”.');
      scheduleGuide(govLoginBtn, { label: 'Entrar aqui' }, 100);
      return;
    }
    govSessionActive = true;
    openGovView('govbr-home');
    if (action === 'gov-service') {
      setCoachMessage('GOV.BR · PASSO 1', 'Abra a busca de serviços', 'Toque em “Encontre serviços públicos” para pesquisar ou escolher o serviço que deseja conhecer.');
      scheduleGuide(govSearchBox, { label: 'Buscar serviço' }, 100);
      return;
    }
    if (action === 'gov-logout') {
      setCoachMessage('GOV.BR · PASSO 1', 'Abra o Menu', 'Toque em “Menu” para encontrar a opção de sair com segurança.');
      scheduleGuide(govProfileNav, { label: 'Menu' }, 100);
      return;
    }
    if (action === 'gov-2fa') {
      setCoachMessage('GOV.BR · PASSO 1', 'Abra o Menu', 'A verificação em duas etapas fica nas configurações de segurança da conta.');
      scheduleGuide(govProfileNav, { label: 'Menu' }, 100);
      return;
    }
  }

  function openLearningHub() {
    isGuestPretest = false;
    trainingStarted = true;
    clearLandingPretest();
    if (trainingBadge) trainingBadge.hidden = false;
    // Returning to the subjects screen always ends the previous temporary lesson state.
    clearGuide();
    $$('.target-app, .target-chat').forEach(el => el.classList.remove('target-app', 'target-chat'));
    currentLearningTopic = '';
    currentLessonIndex = 0;
    currentTopicAction = '';
    currentScenario = null;
    transitionLock = false;
    activeGuide = null;
    waMenu?.classList.remove('is-open');
    $$('.guide-target').forEach(el => el.classList.remove('guide-target'));
    updateLearningGreeting();
    updateLearningAccessUI();
    setView('learning');
    // Sempre abra a central no topo. Em telas menores o scroll interno pode ficar
    // salvo pelo navegador e esconder o título ao voltar para esta tela.
    window.requestAnimationFrame(() => {
      const learningView = $('.android-view[data-view="learning"]');
      if (learningView) learningView.scrollTop = 0;
      const learningSurface = learningView?.querySelector('.learning-surface');
      if (learningSurface) learningSurface.scrollTop = 0;
    });
    if (miniCoachKicker) miniCoachKicker.textContent = 'ESCOLHA UM ASSUNTO';
    if (miniCoachTitle) miniCoachTitle.textContent = 'O que você quer aprender hoje?';
    if (miniCoachText) miniCoachText.textContent = 'Toque em um dos blocos no celular.';
  }

  function startTopic(topicId, lessonIndex = 0) {
    waSearchUsed = false;
    govSearchUsed = false;
    const topic = learningTopics[topicId];
    if (!topic || !topic.lessons?.length) return;
    currentLearningTopic = topicId;
    currentLessonIndex = Math.max(0, Math.min(lessonIndex, topic.lessons.length - 1));
    currentTopicAction = topic.lessons[currentLessonIndex][2];
    syncProgressEvent(currentTopicAction, 'attempt');
    openTopicAction(currentTopicAction);
  }

  function renderGuidedActivity(action) {
    const activity = guidedActivities[action];
    if (!activity) return;
    if (guidedKicker) guidedKicker.textContent = activity.kicker;
    if (guidedTitle) guidedTitle.textContent = activity.title;
    if (guidedInstruction) guidedInstruction.textContent = activity.instruction;
    if (guidedExample) guidedExample.innerHTML = activity.example;
    if (guidedFeedback) { guidedFeedback.hidden = true; guidedFeedback.textContent = ''; guidedFeedback.className = 'guided-feedback'; }
    if (guidedOptions) guidedOptions.innerHTML = activity.options.map(([label, correct]) =>
      `<button type="button" data-guided-correct="${correct ? '1' : '0'}"><span class="answer-copy">${label}</span><span class="answer-result" aria-hidden="true"></span></button>`
    ).join('');
    setView('guided-practice');
    if (miniCoachKicker) miniCoachKicker.textContent = activity.kicker;
    if (miniCoachTitle) miniCoachTitle.textContent = activity.title;
    if (miniCoachText) miniCoachText.textContent = activity.instruction;
  }

  function returnToLandingPretest() {
    if (accessMode === 'registered') return openLearningHub();
    isGuestPretest = false;
    lessonVideo?.pause();
    exitPrototypeFocus();
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    trainingStarted = false;
    progressSaved = false;
    accessMode = 'guest';
    currentLearningTopic = '';
    currentLessonIndex = 0;
    currentTopicAction = '';
    currentVideoTopic = '';
    currentVideoLessonIndex = 0;
    currentScenario = null;
    transitionLock = false;
    activeGuide = null;
    closeStartModal();
    closeReturnModal();
    closeInfoModal();
    window.scrollTo({ top: 0, behavior: 'auto' });
    applyLandingPretest();
    announce('Pré-teste concluído. Você pode salvar seu progresso para continuar aprendendo.', true);
  }

  function showLessonComplete(learnedText) {
    // A conclusão acontece depois da última AÇÃO PRÁTICA dentro do aplicativo:
    // pesquisar, enviar, desligar, ajustar, conferir ou recusar quando necessário.
    // Não mostrar questionários ou provas separados da experiência no celular.
    if (!trainingStarted) return;
    finalizeLessonComplete(learnedText);
  }

  function finalizeLessonComplete(learnedText) {
    if (!trainingStarted) return;
    clearGuide();
    const topic = learningTopics[currentLearningTopic];
    if (!topic) return returnToLandingPretest();
    const isLast = currentLessonIndex >= topic.lessons.length - 1;
    const demoFinished = isGuestPretest && accessMode !== 'registered';
    saveLessonComplete(currentLearningTopic, currentLessonIndex);
    if (successKicker) successKicker.textContent = demoFinished ? 'PRÉ-TESTE CONCLUÍDO' : 'ATIVIDADE CONCLUÍDA';
    if (successTitle) successTitle.textContent = 'Muito bem!';
    if (successText) successText.textContent = demoFinished
      ? 'Você concluiu a experiência gratuita de Pix! Crie sua conta para começar a aprender outros assuntos.'
      : `Você concluiu a atividade “${topic.lessons[currentLessonIndex][0]}” de ${topic.title}.`;
    if (successLearned) successLearned.textContent = learnedText || 'Continue no seu ritmo.';
    if (nextLessonBtn) nextLessonBtn.textContent = demoFinished ? 'Criar minha conta' : `Ver atividades de ${topic.title}`;
    if (backSubjectsBtn) {
      backSubjectsBtn.hidden = false;
      backSubjectsBtn.textContent = demoFinished ? 'Voltar ao início' : 'Escolher outro assunto';
    }
    setView('success');
    if (miniCoachKicker) miniCoachKicker.textContent = demoFinished ? 'PRÉ-TESTE CONCLUÍDO' : topic.title.toUpperCase();
    if (miniCoachTitle) miniCoachTitle.textContent = 'Muito bem!';
    if (miniCoachText) miniCoachText.textContent = demoFinished
      ? 'Você terminou o pré-teste. Crie sua conta para começar o treinamento.'
      : (isLast ? 'Você concluiu este assunto.' : 'Quando quiser, continue para a próxima atividade.');
    // Só depois da atividade gratuita mostramos o antigo pop-up de nome e celular.
    if (demoFinished) window.setTimeout(() => {
      if (isGuestPretest && accessMode !== 'registered' && $('#successView')?.classList.contains('is-active')) {
        openStartModal({ fromPretest: true });
      }
    }, 250);
  }

  function openBankView(name) {
    clearGuide();
    setView(name);
    if (bankGreeting && participantName) bankGreeting.textContent = `Olá, ${participantName.trim().split(/\s+/)[0]}`;
  }

  function guideBankPixAction(action) {
    clearGuide();
    if (action === 'pix-recipient') {
      openBankView('bank-home');
      setCoachMessage('ETAPA 1 DE 4 · PIX', 'Encontre o Pix no banco', 'Dentro do banco, toque no botão Pix.');
      announce('Você abriu o banco. Agora toque no botão Pix.', true);
      scheduleGuide(bankPixBtn, { label: 'Pix' }, 120);
      return;
    }
    if (action === 'pix-key') {
      openBankView('bank-pix');
      setCoachMessage('PIX · CHAVES', 'Abra Minhas chaves', 'Veja os tipos de chave que podem identificar uma conta.');
      announce('Toque em Minhas chaves.', true);
      scheduleGuide(bankKeysBtn, { label: 'Toque aqui' }, 120);
      return;
    }
    if (action === 'pix-scam') {
      openBankView('bank-pix');
      setCoachMessage('PIX · SEGURANÇA', 'Abra Segurança no Pix', 'Vamos analisar um pedido urgente de dinheiro.');
      announce('Toque em Segurança no Pix.', true);
      scheduleGuide(bankSecurityBtn, { label: 'Segurança' }, 120);
      return;
    }
  }

  function openTopicAction(action) {
    currentTopicAction = action;
    if (action.startsWith('pix-')) { guideBankPixAction(action); return; }
    const securityGuides = {
      family: { row: '[data-scenario="family"]', title: 'Abra a conversa suspeita', text: 'Toque em “Filho — número novo” para ver a situação.' },
      bank: { row: '[data-scenario="bank"]', title: 'Abra a conversa do banco', text: 'Toque em “Banco • Atendimento” para continuar o treino.' },
      code: { row: '[data-scenario="code"]', title: 'Abra a conversa desconhecida', text: 'Toque em “Contato desconhecido” para analisar com calma.' }
    };
    if (securityGuides[action]) {
      setView('whatsapp');
      announce(securityGuides[action].text, true);
      if (miniCoachKicker) miniCoachKicker.textContent = 'PASSO 2 DE 2 · SEGURANÇA';
      if (miniCoachTitle) miniCoachTitle.textContent = securityGuides[action].title;
      if (miniCoachText) miniCoachText.textContent = securityGuides[action].text;
      scheduleGuide($(securityGuides[action].row), { kicker: 'TREINO GUIADO', title: securityGuides[action].title, text: securityGuides[action].text }, 90);
      return;
    }
    if (action === 'wa-list') {
      setView('whatsapp');
      announce('Primeiro toque na pesquisa e digite Maria.', true);
      showWhatsAppSearch();
      if (miniCoachKicker) miniCoachKicker.textContent = 'WHATSAPP';
      if (miniCoachTitle) miniCoachTitle.textContent = 'Encontre a conversa';
      if (miniCoachText) miniCoachText.textContent = 'Toque em “Maria (filha)” para abrir a conversa.';
      scheduleGuide(waSearchInput, {label:'Digite Maria'}, 90);
      return;
    }
    if (action === 'wa-message') {
      openNormalChat('daughter');
      if (miniCoachKicker) miniCoachKicker.textContent = 'WHATSAPP';
      if (miniCoachTitle) miniCoachTitle.textContent = 'Envie uma mensagem';
      if (miniCoachText) miniCoachText.textContent = 'Toque no campo Mensagem e escreva com calma.';
      announce('Toque no campo de mensagem para digitar.', true);
      scheduleGuide($('.active-composer'), { kicker: 'TREINO GUIADO', title: 'Digite sua mensagem', text: 'Toque no campo branco “Mensagem” e depois no botão de enviar.', label: 'Digite aqui' }, 90);
      return;
    }
    if (action === 'wa-call') {
      openNormalChat('daughter');
      if (miniCoachKicker) miniCoachKicker.textContent = 'WHATSAPP';
      if (miniCoachTitle) miniCoachTitle.textContent = 'Encontre o botão de ligação';
      if (miniCoachText) miniCoachText.textContent = 'Toque no ícone de telefone no alto da conversa.';
      announce('Toque no ícone de telefone no alto da conversa.', true);
      scheduleGuide($('#normalCallBtn'), { label: 'Ligar' }, 90);
      return;
    }
    if (action.startsWith('settings-')) {
      guideSettingsAction(action);
      return;
    }
    if (action.startsWith('gov-')) {
      guideGovAction(action);
      return;
    }
    if (action === 'play-find') {
      setView('playstore-home');
      setCoachMessage('APPS SEGUROS', 'Encontre um aplicativo conhecido', 'Na Play Store, toque no WhatsApp e confira quem publicou.');
      announce('Toque no WhatsApp e confira o desenvolvedor.', true);
      scheduleGuide(playWhatsAppCard, { label: 'Confira aqui' }, 100);
      return;
    }
    if (action === 'play-developer') {
      setView('playstore-detail');
      setCoachMessage('APPS SEGUROS', 'Confira o desenvolvedor', 'O WhatsApp oficial é publicado por WhatsApp LLC.');
      announce('Confira o nome do aplicativo e também o desenvolvedor.', true);
      scheduleGuide(playDeveloperLearnedBtn, { label: 'Entendi' }, 100);
      return;
    }
    if (action === 'play-protect') {
      setView('playstore-protect');
      setCoachMessage('PLAY PROTECT', 'Mantenha a verificação ativada', 'O Play Protect ajuda a detectar aplicativos potencialmente nocivos.');
      announce('Veja se a verificação com Play Protect está ativada.', true);
      scheduleGuide(playProtectLearnedBtn, { label: 'Concluir' }, 100);
      return;
    }
    renderGuidedActivity(action);
  }

  function startTraining({ fullscreen = false, focus = false, boot = false, firstActivity = false } = {}) {
    clearLandingPretest();
    trainingStarted = true;
    clearGuide();
    if (coachCard) { coachCard.hidden = true; coachCard.classList.remove('is-visible'); }
    if (accountCard) accountCard.hidden = true;

    if (focus && accessMode === 'registered') enterPrototypeFocus({ boot });
    else phoneStage?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (firstActivity) {
      startGuidedTopic('pix');
      const firstName = participantName && participantName !== 'Participante' ? participantName.split(/\s+/)[0] : '';
      announce(firstName ? `${firstName}, vamos começar pelo banco e praticar Pix com segurança.` : 'Vamos começar pelo banco e praticar Pix com segurança.', true);
    } else {
      openLearningHub();
      if (focus && accessMode === 'registered') {
        const resetLearningScroll = () => {
          const surface = $('#learningView .learning-surface');
          if (surface) surface.scrollTop = 0;
          const active = $('#learningView');
          if (active) active.scrollTop = 0;
          const phone = $('#phoneScreen');
          if (phone) phone.scrollTop = 0;
        };
        resetLearningScroll();
        window.requestAnimationFrame(resetLearningScroll);
        window.setTimeout(resetLearningScroll, 140);
      }
      const welcome = participantName && participantName !== 'Participante' ? `Tudo certo, ${participantName.split(/\s+/)[0]}! Escolha o que você quer aprender hoje.` : 'Escolha um assunto para começar. Você pode fazer uma atividade de cada vez.';
      announce(welcome, true);
    }

    if (fullscreen) window.setTimeout(openPhoneFullscreen, 500);

    // V111.49: nunca iniciar tutorial longo ao entrar.
    // Os cartões mostram as opções e a ajuda fica estritamente sob demanda.
  }

  function renderScenario(id) {
    clearGuide();
    const s = scenarios[id];
    if (!s) return;
    currentScenario = id;
    scenarioTitle.textContent = s.title;
    scenarioSubtitle.textContent = 'online';
    scenarioAvatar.textContent = s.avatar;
    scenarioAvatar.className = `avatar small ${s.avatarClass}`;
    chatWallpaper.innerHTML = '<span class="chat-day">Hoje</span>' + s.messages.map(([text, time, suspicious]) =>
      `<div class="message incoming${suspicious ? ' suspicious' : ''}">${text}<time>${time}</time></div>`
    ).join('') + `<div class="security-note">${s.warning}</div>` +
      `<div class="scenario-progress-note">Situações concluídas: ${completed.size} de 3</div>`;
    decisionOptions.innerHTML = s.answers.map(([text, correct], idx) =>
      `<button type="button" data-scenario-answer="${correct ? 'correct' : 'wrong'}" data-index="${idx}"><span class="answer-copy">${text}</span><span class="answer-result" aria-hidden="true"></span></button>`
    ).join('');
    if (scenarioAnswerFeedback) { scenarioAnswerFeedback.hidden = true; scenarioAnswerFeedback.textContent = ''; scenarioAnswerFeedback.className = 'scenario-answer-feedback'; }
    setView('chat');
    hintText.textContent = s.hint;
    hintText.hidden = true;
  }

  function markScenarioComplete(id) {
    completed.add(id);
    const row = $(`[data-scenario="${id}"]`);
    row?.classList.add('is-complete');
    row?.classList.remove('target-chat');
    announce(scenarios[id].correct, true);
    transitionLock = true;
    window.setTimeout(() => {
      transitionLock = false;
      showLessonComplete(scenarios[id].correct);
    }, 1100);
  }

  function showAccountPrompt() {
    if (progressSaved) {
      const firstName = participantName && participantName !== 'Participante' ? participantName.split(/\s+/)[0] : 'você';
      announce(`Muito bem, ${firstName}! Seu progresso desta experiência já ficou salvo.`, true);
      if (document.fullscreenElement) document.exitFullscreen?.();
      setView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (accountPromptShown) return;
    accountPromptShown = true;
    const reveal = () => {
      coachCard.hidden = true;
      accountCard.hidden = false;
      accountCard.classList.add('is-visible');
      accountCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => $('#accountName')?.focus(), 500);
    };
    if (document.fullscreenElement) document.exitFullscreen().finally(() => setTimeout(reveal, 250));
    else reveal();
  }

  function openNormalChat(id) {
    clearGuide();
    const data = normalChats[id];
    if (!data) return;
    $('#normalTitle').textContent = data.title;
    $('#normalAvatar').textContent = data.avatar;
    $('#normalMessages').innerHTML = '<span class="chat-day">Hoje</span>' + data.messages.map(([type, text, time]) =>
      `<div class="message ${type}">${text}<time>${time}</time></div>`
    ).join('') + '<span class="system-chip">Esta é uma conversa normal de demonstração. Você pode escrever uma mensagem abaixo.</span>';
    setView('normal-chat');
  }

  function sendNormalMessage() {
    const input = $('#normalMessageInput');
    const text = input.value.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    $('#normalMessages').insertAdjacentHTML('beforeend', `<div class="message outgoing">${text.replace(/[<>&]/g, '')}<time>${now}</time></div>`);
    input.value = '';
    $('#normalMessages').scrollTop = $('#normalMessages').scrollHeight;
    if (currentLearningTopic === 'whatsapp' && currentTopicAction === 'wa-message') {
      window.setTimeout(() => showLessonComplete('Você encontrou o campo de mensagem e conseguiu enviar uma mensagem.'), 500);
    }
  }

  function performLogout() {
    const ok = window.confirm('Deseja sair deste aparelho?');
    if (!ok) return;

    // A saída encerra também o modo tela cheia do protótipo.
    exitPrototypeFocus();
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    clearRememberedUser();

    // Zere o estado ANTES de restaurar o pré-teste; caso contrário,
    // applyLandingPretest() interpreta que o treino ainda está aberto.
    trainingStarted = false;
    completed = new Set();
    accountPromptShown = false;
    currentLearningTopic = '';
    currentLessonIndex = 0;
    currentTopicAction = '';
    currentScenario = null;
    govSessionActive = false;
    transitionLock = false;
    activeGuide = null;
    waMenu?.classList.remove('is-open');
    $$('.target-app, .target-chat').forEach(el => el.classList.remove('target-app', 'target-chat'));

    closeStartModal();
    closeReturnModal();
    closeInfoModal();
    announce('Você saiu deste aparelho. Faça o pré-teste pelo Banco.', true);
    window.scrollTo({ top: 0, behavior: 'auto' });

    // Retorna exatamente à tela inicial: sombreado, Banco destacado,
    // "PRÉ-TESTE · PIX" e seta "Faça o pré-teste".
    applyLandingPretest();
  }
  logoutBtn?.addEventListener('click', performLogout);
  focusLogoutBtn?.addEventListener('click', performLogout);
  $('#startNowBtn')?.addEventListener('click', () => {
    const user = getRememberedUser();
    if (user?.name && user?.phone) {
      participantName = user.name; progressSaved = true; accessMode = 'registered';
      // Tela cheia é sempre escolha explícita pelo botão "Tela cheia".
      startTraining({ focus: true, boot: true });
      updatePrototypeViewportFit();
    } else {
      // A entrada oficial volta a ser apenas por “Começar meu treino”.
      // O visitante pode criar conta ou escolher explicitamente acessar sem cadastro.
      openStartModal({ entry: true });
    }
  });
  $('#quickSkipBtn')?.addEventListener('click', () => {
    const origin = startModal?.dataset.origin;
    closeStartModal();
    if (origin === 'pretest') {
      // Fechar a criação após o pré-teste NÃO revela o menu de atividades.
      returnToLandingPretest();
      return;
    }
    if (origin === 'entry') {
      participantName = '';
      progressSaved = false;
      accessMode = 'guest';
      isGuestPretest = false;
      startTraining();
    }
  });
  $('#startAlreadyHaveAccount')?.addEventListener('click', () => {
    closeStartModal();
    openReturnModal();
  });
  $('#closeStartModal')?.addEventListener('click', () => closeStartModal());
  $('#startBackdrop')?.addEventListener('click', () => closeStartModal());
  quickPhone?.addEventListener('input', () => {
    quickPhone.value = formatPhone(quickPhone.value);
  });
  quickStartForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const phone = formatPhone(quickPhone?.value || '');
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return showQuickStartMessage('Digite seu celular com DDD para salvar o progresso.', 'error');
    if (quickPhone) quickPhone.value = phone;
    // V111.49: finalizar cadastro não solicita fullscreen automaticamente.
    if (quickSaveBtn) { quickSaveBtn.disabled = true; quickSaveBtn.innerHTML = 'Salvando...'; }
    try {
      const response = await fetch('/api/conta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await response.json();
      if (!response.ok && data.needs_login) {
        closeStartModal();
        openReturnModal();
        if (returnPhone) returnPhone.value = formatPhone(digits);
        showReturnMessage(returnPhoneMessage, 'Este número já foi usado. Toque em “Mostrar código de treino” para continuar.', 'neutral');
        return;
      }
      if (!response.ok) {
        return showQuickStartMessage(data.message || 'Não foi possível salvar agora.', 'error');
      }
      saveRememberedUser(data.name || 'Participante', data.phone || digits);
      isGuestPretest = false;
      await loadServerProgress(data.phone || digits);
      showQuickStartMessage(data.message || 'Seu progresso foi salvo.', 'success');
      window.setTimeout(() => {
        closeStartModal();
        startTraining({ focus: true, boot: true });
      }, 500);
    } catch (_) {
      showQuickStartMessage('Não foi possível salvar. Verifique se o servidor do Educa+ está ativo; abra o site pelo servidor do Educa+ Digital.', 'error');
    } finally {
      if (quickSaveBtn) {
        quickSaveBtn.disabled = false;
        quickSaveBtn.textContent = startModal?.dataset.unlock === '1'
          ? 'Salvar meu progresso' : 'Salvar meu progresso e começar';
        const icon = document.createElementNS('http://www.w3.org/2000/svg','svg');
        icon.setAttribute('class','nav-vector'); icon.setAttribute('viewBox','0 0 24 24');
        icon.setAttribute('fill','none'); icon.setAttribute('aria-hidden','true');
        const path = document.createElementNS('http://www.w3.org/2000/svg','path');
        path.setAttribute('d','m9 5 7 7-7 7'); path.setAttribute('stroke','currentColor');
        path.setAttribute('stroke-width','2.15'); path.setAttribute('stroke-linecap','round');
        path.setAttribute('stroke-linejoin','round');icon.appendChild(path);quickSaveBtn.appendChild(icon);
      }
    }
  });
  $('#closeReturnModal')?.addEventListener('click', closeReturnModal);
  $('#returnBackdrop')?.addEventListener('click', closeReturnModal);
  $('#changePhoneBtn')?.addEventListener('click', () => {
    returnPhoneStep.hidden = false;
    returnCodeStep.hidden = true;
    window.setTimeout(() => returnPhone?.focus(), 80);
  });
  returnPhone?.addEventListener('input', () => { returnPhone.value = formatPhone(returnPhone.value); });
  returnCode?.addEventListener('input', () => { returnCode.value = returnCode.value.replace(/\D/g, '').slice(0, 6); });
  returnPhoneForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const phone = formatPhone(returnPhone?.value || '');
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return showReturnMessage(returnPhoneMessage, 'Digite seu celular com DDD.');
    returningPhone = digits;
    try {
      const response = await fetch('/api/login/codigo', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({phone:digits}) });
      const data = await response.json();
      if (!response.ok) return showReturnMessage(returnPhoneMessage, data.message || 'Não encontramos seu progresso.');
      returnPhoneStep.hidden = true;
      returnCodeStep.hidden = false;
      if (data.demo_code) { demoCodeValue.textContent = data.demo_code; demoCodeBox.hidden = false; }
      window.setTimeout(() => returnCode?.focus(), 100);
    } catch (_) {
      showReturnMessage(returnPhoneMessage, 'Não foi possível conectar ao servidor. Abra o site pelo Flask ou PythonAnywhere.');
    }
  });
  returnCodeForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const code = (returnCode?.value || '').replace(/\D/g, '');
    if (code.length !== 6) return showReturnMessage(returnCodeMessage, 'Digite os 6 números do código.');
    // V111.49: entrar com código não solicita fullscreen automaticamente.
    try {
      const response = await fetch('/api/login/confirmar', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({phone:returningPhone, code}) });
      const data = await response.json();
      if (!response.ok) return showReturnMessage(returnCodeMessage, data.message || 'Código incorreto.');
      saveRememberedUser(data.name, data.phone);
      await loadServerProgress(data.phone);
      closeReturnModal();
      startTraining({ focus: true, boot: true });
    } catch (_) {
      showReturnMessage(returnCodeMessage, 'Não foi possível conectar ao servidor para entrar.');
    }
  });
  $('#learnMoreBtn')?.addEventListener('click', () => openInfoModal());
  $('#infoConfirmBtn')?.addEventListener('click', () => closeInfoModal());
  $('#closeInfoModal')?.addEventListener('click', () => closeInfoModal());
  $('#infoBackdrop')?.addEventListener('click', () => closeInfoModal());

  waMoreBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    if (waMenu) waMenu.hidden = !waMenu.hidden;
  });
  waSettingsBtn?.addEventListener('click', () => {
    if (waMenu) waMenu.hidden = true;
    setView('wa-settings');
    window.EducaAndroidApi?.haptic?.('tap');
  });
  waOpenRealBtn?.addEventListener('click', async () => {
    if (waMenu) waMenu.hidden = true;
    const ok = await window.EducaAndroidApi?.openWhatsApp?.();
    if (!ok) {
      window.EducaAndroidApi?.toast?.('WhatsApp não está disponível neste aparelho.');
      announce('O WhatsApp real não está disponível neste aparelho. O treino continua aqui.', true);
    }
  });
  document.addEventListener('click', (event) => {
    if (!waMenu || waMenu.hidden) return;
    if (!waMenu.contains(event.target) && event.target !== waMoreBtn) waMenu.hidden = true;
  });

  $('#learningSaveProgressBtn')?.addEventListener('click', () => openStartModal());
  $$('[data-learning-topic]').forEach(btn => {
    btn.addEventListener('click', () => {
      nativeHaptic('tap');
      startGuidedTopic(btn.dataset.learningTopic);
    });
  });
  openAndroidHome?.addEventListener('click', () => {
    clearGuide();
    setView('home');
    if (miniCoachKicker) miniCoachKicker.textContent = 'CELULAR ANDROID';
    if (miniCoachTitle) miniCoachTitle.textContent = 'Explore o aparelho';
    if (miniCoachText) miniCoachText.textContent = 'Quando quiser voltar aos treinos, toque no botão de início.';
  });

  guidedOptions?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-guided-correct]');
    if (!btn || btn.disabled) return;
    const activity = guidedActivities[currentTopicAction];
    const result = btn.querySelector('.answer-result');
    if (btn.dataset.guidedCorrect === '1') {
      nativeHaptic('success');
      guidedOptions.querySelectorAll('button').forEach(option => { option.disabled = true; option.classList.remove('is-wrong'); });
      btn.classList.add('is-correct');
      if (result) result.textContent = '✓ CORRETO';
      if (guidedFeedback) { guidedFeedback.hidden = false; guidedFeedback.className = 'guided-feedback good'; guidedFeedback.textContent = '✓ Correto! Muito bem. Você escolheu a opção mais segura.'; }
      window.setTimeout(() => showLessonComplete(activity?.learned), 1200);
    } else {
      nativeHaptic('error');
      btn.classList.add('is-wrong');
      if (result) result.textContent = '✕ ERRO';
      if (guidedFeedback) { guidedFeedback.hidden = false; guidedFeedback.className = 'guided-feedback bad'; guidedFeedback.textContent = '✕ Errado. Tente novamente com calma.'; }
    }
  });
  $('#guidedBackBtn')?.addEventListener('click', () => {
    if (currentLearningTopic) openModulePath(currentLearningTopic);
    else openLearningHub();
  });
  nextLessonBtn?.addEventListener('click', () => {
    if (isGuestPretest && accessMode !== 'registered') return openStartModal({ fromPretest: true });
    if (currentLearningTopic) openModulePath(currentLearningTopic);
    else openLearningHub();
  });
  backSubjectsBtn?.addEventListener('click', () => {
    if (isGuestPretest && accessMode !== 'registered') return returnToLandingPretest();
    openLearningHub();
  });
  $('#normalCallBtn')?.addEventListener('click', () => {
    if (currentLearningTopic === 'whatsapp' && currentTopicAction === 'wa-call') {
      nativeHaptic('tap');
      setView('wa-call-active');
      $('#waCallStatus').textContent = 'Em chamada · simulação';
      setCoachMessage('WHATSAPP · PASSO 3', 'Encerre a ligação de treino', 'Toque no botão vermelho para encerrar a chamada simulada.');
      scheduleGuide($('#waHangUpBtn'), {label:'Encerrar chamada'}, 100);
    }
  });
  $('#waHangUpBtn')?.addEventListener('click', () => {
    if (currentLearningTopic === 'whatsapp' && currentTopicAction === 'wa-call') {
      nativeHaptic('success');
      showLessonComplete('Você iniciou e encerrou uma ligação simulada com segurança.');
    } else {setView('normal-chat');}
  });

  $$('[data-bank-back]').forEach(btn => btn.addEventListener('click', () => {
    nativeHaptic('tap');
    openBankView(btn.dataset.bankBack || 'bank-home');
  }));

  bankPixBtn?.addEventListener('click', () => {
    nativeHaptic('tap');
    openBankView('bank-pix');
    if (currentLearningTopic === 'pix' && currentTopicAction === 'pix-recipient') {
      setCoachMessage('ETAPA 2 DE 4 · PIX', 'Escolha Enviar Pix', 'Agora toque em Enviar Pix.');
      announce('Agora toque em Enviar Pix.', true);
      scheduleGuide(bankSendPixBtn, { label: 'Enviar Pix' }, 120);
    }
  });

  // As chaves abaixo são EXCLUSIVAMENTE fictícias. Não solicitamos dados reais.
  const pixDemoKeys = {
    email: { label: 'E-mail', value: 'joao@exemplo.teste' },
    phone: { label: 'Celular', value: '(00) 90000-0000' },
    cpf: { label: 'CPF', value: '000.000.000-00' }
  };
  let pixChosenType = '';
  let pixChosenKey = false;
  let pixChosenAmount = '';
  function pixFormFeedback(message, attention = false) {
    const info = $('#pixPracticeFeedback');
    if (!info) return;
    info.textContent = message;
    info.classList.toggle('needs-attention', attention);
  }
  function pixGuideNext(target, label, title, instruction) {
    // Descarta o destaque anterior e o reposiciona na próxima ação real.
    clearGuide();
    setCoachMessage('PIX · TREINO GUIADO', title, instruction);
    if (target && currentLearningTopic === 'pix' && currentTopicAction === 'pix-recipient') {
      scheduleGuide(target, { label }, 120);
    }
  }
  function resetPixForm() {
    pixChosenType = '';
    pixChosenKey = false;
    pixChosenAmount = '';
    $$('#pixTypeGrid button, #pixAmountGrid button').forEach(x => {
      x.classList.remove('selected');
      x.setAttribute('aria-pressed', 'false');
    });
    const keyBtn = $('#pixDemoKey');
    if (keyBtn) {
      keyBtn.disabled = true;
      keyBtn.classList.remove('selected');
      keyBtn.setAttribute('aria-pressed', 'false');
      keyBtn.setAttribute('aria-label', 'Escolha um tipo de chave acima');
      keyBtn.querySelector('b').textContent = 'João Pereira · exemplo';
      keyBtn.querySelector('small').textContent = 'Escolha E-mail, Celular ou CPF acima para ver a chave fictícia pronta.';
    }
    pixFormFeedback('Escolha um tipo de chave. Os exemplos já estão preparados para você.');
  }
  $('#pixTypeGrid')?.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-pix-type]');
    if (!btn) return;
    const type = btn.dataset.pixType;
    const example = pixDemoKeys[type];
    if (!example) return;
    nativeHaptic('tap');
    pixChosenType = type;
    pixChosenKey = false;
    $$('#pixTypeGrid button').forEach(x => {
      const chosen = x === btn;
      x.classList.toggle('selected', chosen);
      x.setAttribute('aria-pressed', String(chosen));
    });
    const keyBtn = $('#pixDemoKey');
    keyBtn.disabled = false;
    keyBtn.classList.remove('selected');
    keyBtn.setAttribute('aria-pressed', 'false');
    keyBtn.querySelector('b').textContent = `João Pereira · ${example.label}`;
    keyBtn.querySelector('small').textContent = `${example.value} · chave fictícia pronta`;
    keyBtn.setAttribute('aria-label', `Selecionar chave ${example.label} fictícia de João: ${example.value}`);
    pixFormFeedback(`Pronto! A chave ${example.label} apareceu. Toque nela para continuar.`);
    pixGuideNext(keyBtn, 'Toque na chave', 'Chave pronta para escolher', `Toque na chave ${example.label} fictícia de João. Não precisa digitar.`);
  });
  $('#pixDemoKey')?.addEventListener('click', () => {
    if (!pixDemoKeys[pixChosenType]) return;
    nativeHaptic('tap');
    pixChosenKey = true;
    $('#pixDemoKey').classList.add('selected');
    $('#pixDemoKey').setAttribute('aria-pressed', 'true');
    if (pixChosenAmount) {
      pixFormFeedback('Perfeito! Os dados estão prontos. Agora confira o destinatário.');
      pixGuideNext(bankContinuePix, 'Conferir dados', 'Confira antes de avançar', 'Toque em Conferir destinatário e veja se o nome está correto.');
    } else {
      pixFormFeedback('Muito bem! Agora escolha um dos dois valores fictícios.');
      pixGuideNext($('#pixAmountGrid'), 'Escolha o valor', 'Qual valor quer praticar?', 'Toque em um valor. Nenhum dinheiro será enviado.');
    }
  });
  $('#pixAmountGrid')?.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-pix-amount]');
    if (!btn) return;
    nativeHaptic('tap');
    pixChosenAmount = btn.dataset.pixAmount;
    $$('#pixAmountGrid button').forEach(x => {
      const chosen = x === btn;
      x.classList.toggle('selected', chosen);
      x.setAttribute('aria-pressed', String(chosen));
    });
    if (!pixChosenType) {
      pixFormFeedback('Valor escolhido! Falta escolher E-mail, Celular ou CPF.', true);
      pixGuideNext($('#pixTypeGrid'), 'Escolha a chave', 'Escolha o tipo de chave', 'Selecione E-mail, Celular ou CPF para ver um exemplo pronto.');
    } else if (!pixChosenKey) {
      pixFormFeedback('Valor escolhido! Agora toque na chave fictícia de João.', true);
      pixGuideNext($('#pixDemoKey'), 'Toque na chave', 'Confirme a chave de exemplo', 'A chave já está pronta. Basta tocar nela.');
    } else {
      pixFormFeedback('Tudo pronto! Toque em Conferir destinatário.');
      pixGuideNext(bankContinuePix, 'Conferir dados', 'Falta só conferir', 'Antes de fazer um Pix, confirme o nome e o valor.');
    }
  });

  bankSendPixBtn?.addEventListener('click', () => {
    nativeHaptic('tap');
    resetPixForm();
    openBankView('bank-send');
    if (currentLearningTopic === 'pix' && currentTopicAction === 'pix-recipient') {
      setCoachMessage('ETAPA 3 DE 4 · PIX', 'Escolha uma chave de exemplo', 'Pode ser E-mail, Celular ou CPF. As três têm exemplos fictícios prontos.');
      announce('Escolha o tipo de chave, toque no exemplo pronto e selecione um valor.', true);
      scheduleGuide($('#pixTypeGrid'), { label: 'Escolha uma opção' }, 120);
    }
  });

  bankContinuePix?.addEventListener('click', () => {
    nativeHaptic('tap');
    if (!pixChosenType) {
      pixFormFeedback('Primeiro escolha uma opção: E-mail, Celular ou CPF.', true);
      pixGuideNext($('#pixTypeGrid'), 'Escolha aqui', 'Escolha o tipo de chave', 'Selecione uma das três opções.');
      return;
    }
    if (!pixChosenKey) {
      pixFormFeedback('Agora toque na chave fictícia que apareceu. Ela já está pronta.', true);
      pixGuideNext($('#pixDemoKey'), 'Toque na chave', 'Selecione a chave pronta', 'Toque no exemplo de João para confirmar.');
      return;
    }
    if (!pixChosenAmount) {
      pixFormFeedback('Falta escolher um valor de treino. Pode ser qualquer uma das duas opções.', true);
      pixGuideNext($('#pixAmountGrid'), 'Escolha um valor', 'Escolha um valor fictício', 'Selecione R$ 50,00 ou R$ 500,00.');
      return;
    }
    pixFormFeedback('Muito bem! Agora veja o nome do destinatário.');
    const reviewKey = $('#pixReviewKey');
    const reviewAmount = $('#pixReviewAmount');
    if (reviewKey) reviewKey.textContent = pixDemoKeys[pixChosenType].value;
    if (reviewAmount) reviewAmount.textContent = Number(pixChosenAmount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    clearGuide();
    openBankView('bank-review');
    setCoachMessage('ETAPA 4 DE 4 · PIX', 'Confira com atenção', 'Você esperava João, mas apareceu Carlos. Escolha a atitude mais segura.');
    announce('Atenção! Você esperava João Pereira, mas apareceu Carlos Almeida. O que é mais seguro fazer?', true);
    scheduleGuide(bankReviewOptions, { label: 'O que você faria?' }, 130);
  });

  bankReviewOptions?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-bank-answer]');
    if (!btn) return;
    nativeHaptic(btn.dataset.bankAnswer === 'correct' ? 'success' : 'error');
    bankReviewOptions.querySelectorAll('button').forEach(option => option.classList.remove('is-correct','is-wrong'));
    if (btn.dataset.bankAnswer === 'correct') {
      btn.classList.add('is-correct');
      btn.querySelector('b').textContent = '✓ CORRETO';
      if (bankAnswerFeedback) { bankAnswerFeedback.hidden = false; bankAnswerFeedback.className = 'bank-answer-feedback good'; bankAnswerFeedback.textContent = 'Correto! O nome não é o esperado. Cancele e confirme com a pessoa antes de enviar.'; }
      window.setTimeout(() => showLessonComplete('Antes de confirmar um Pix, confira nome, CPF mascarado, instituição e valor.'), 900);
    } else {
      btn.classList.add('is-wrong');
      btn.querySelector('b').textContent = '✕ ERRO';
      if (bankAnswerFeedback) { bankAnswerFeedback.hidden = false; bankAnswerFeedback.className = 'bank-answer-feedback bad'; bankAnswerFeedback.textContent = 'Atenção: o destinatário não é a pessoa esperada. Não confirme o Pix.'; }
    }
  });

  bankKeysBtn?.addEventListener('click', () => {
    nativeHaptic('tap');
    openBankView('bank-keys');
    setCoachMessage('PIX · CHAVES', 'Tipos de chave Pix', 'CPF, celular, e-mail e chave aleatória podem identificar quem recebe.');
    announce('Veja os tipos de chave Pix. Depois toque em Entendi.', true);
    if (currentLearningTopic === 'pix' && currentTopicAction === 'pix-key') scheduleGuide(bankKeysLearnedBtn, { label: 'Entendi' }, 120);
  });

  bankKeysLearnedBtn?.addEventListener('click', () => {
    nativeHaptic('success');
    if (currentLearningTopic === 'pix' && currentTopicAction === 'pix-key') showLessonComplete('Uma chave Pix pode ser CPF, celular, e-mail ou chave aleatória.');
    else openBankView('bank-pix');
  });

  bankSecurityBtn?.addEventListener('click', () => {
    nativeHaptic('tap');
    openBankView('bank-security');
    setCoachMessage('PIX · SEGURANÇA', 'Desconfie da urgência', 'Número novo + pedido urgente de dinheiro merece confirmação por outro canal.');
    announce('Leia a mensagem e escolha a atitude mais segura.', true);
  });

  bankScamOptions?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-bank-scam-answer]');
    if (!btn) return;
    nativeHaptic(btn.dataset.bankScamAnswer === 'correct' ? 'success' : 'error');
    bankScamOptions.querySelectorAll('button').forEach(option => option.classList.remove('is-correct','is-wrong'));
    if (btn.dataset.bankScamAnswer === 'correct') {
      btn.classList.add('is-correct');
      btn.querySelector('b').textContent = '✓ CORRETO';
      if (bankScamFeedback) { bankScamFeedback.hidden = false; bankScamFeedback.className = 'bank-answer-feedback good'; bankScamFeedback.textContent = 'Correto! Confirme pelo número antigo ou por outro contato conhecido antes de enviar dinheiro.'; }
      window.setTimeout(() => showLessonComplete('Pedidos urgentes de Pix devem ser confirmados por outro canal conhecido.'), 900);
    } else {
      btn.classList.add('is-wrong');
      btn.querySelector('b').textContent = '✕ ERRO';
      if (bankScamFeedback) { bankScamFeedback.hidden = false; bankScamFeedback.className = 'bank-answer-feedback bad'; bankScamFeedback.textContent = 'Não faça o Pix só por causa da urgência. Primeiro confirme a identidade da pessoa.'; }
    }
  });

  bankExtractBtn?.addEventListener('click', () => { nativeHaptic('tap'); openBankView('bank-extract'); });

  $$('[data-open-app]').forEach(btn => {
    btn.addEventListener('click', () => {
      nativeHaptic('tap');
      const app = btn.dataset.openApp;
      if (!trainingStarted && app === 'bank') {
        const remembered = getRememberedUser();
        clearLandingPretest();
        isGuestPretest = !remembered?.phone;
        if (!remembered?.name || !remembered?.phone) accessMode = 'guest';
        trainingStarted = true;
        clearGuide();
        currentLearningTopic = 'pix';
        currentLessonIndex = 0;
        currentTopicAction = learningTopics.pix.lessons[0][2];
        guideBankPixAction(currentTopicAction);
        announce('Muito bem. Você abriu o banco. Agora encontre o botão Pix.', true);
        return;
      }
      if (!trainingStarted) startTraining();
      if (activeGuide && activeGuide.stage === 'open-app' && activeGuide.app === app) {
        clearGuide({ keepState: true });
        activeGuide = null;
        openTopicAction(currentTopicAction);
        return;
      }
      if (app === 'bank') {
        clearGuide();
        if (activeGuide && activeGuide.stage === 'open-app' && activeGuide.app === 'bank') {
          activeGuide = null;
          guideBankPixAction(currentTopicAction || 'pix-recipient');
          return;
        }
        openBankView('bank-home');
        setCoachMessage('BANCO DE TREINO', 'Banco Educa', 'O Pix está dentro do aplicativo do banco, como acontece em bancos reais.');
        announce('Banco de treino aberto. Toque em Pix para praticar.', true);
        return;
      }
      if (app === 'whatsapp') {
        clearGuide();
        setView('whatsapp');
        announce('Explore as conversas. As que têm um número verde fazem parte do treino.', true);
        setCoachMessage('WHATSAPP', 'Explore com calma', 'Toque em uma conversa para continuar.');
        return;
      }
      if (app === 'settings') {
        clearGuide();
        openSettingsView('settings-main');
        setCoachMessage('AJUSTES DO ANDROID', 'Explore as Configurações', 'Esta tela segue a organização atual dos celulares Pixel/Android.');
        announce('Você pode explorar os Ajustes com segurança dentro do protótipo.', true);
        return;
      }
      if (app === 'govbr') {
        clearGuide();
        openGovView(govSessionActive ? 'govbr-home' : 'govbr-login');
        setCoachMessage('GOV.BR', 'Treine no aplicativo simulado', 'A interface reproduz os caminhos mais importantes do app atual sem usar dados reais.');
        announce('Treine aqui sem informar CPF, senha ou documentos reais.', true);
        return;
      }
      if (app === 'playstore') {
        clearGuide();
        setView('playstore-home');
        setCoachMessage('GOOGLE PLAY', 'Confira antes de instalar', 'Nome, desenvolvedor e Play Protect ajudam a reconhecer aplicativos oficiais.');
        announce('Explore a Play Store simulada com segurança.', true);
        return;
      }
      const label = btn.getAttribute('aria-label') || app;
      announce(`Você abriu ${label}. Quando quiser, volte aos assuntos para seguir um treino guiado.`, true);
      window.EducaAndroidApi?.toast?.(`${label} aberto no protótipo`);
    });
  });

  modulePathBack?.addEventListener('click', () => {
    openLearningHub();
  });
  moduleLessonList?.addEventListener('click', (event) => {
    const card = event.target.closest('[data-module-lesson]');
    if (!card || card.disabled) return;
    nativeHaptic('tap');
    const index = Number(card.dataset.moduleLesson || 0);
    startLessonFlow(currentLearningTopic, index);
  });

  videoFullscreenBtn?.addEventListener('click', () => {
    if (!lessonVideo?.currentSrc) return;
    // No Safari/iPhone, webkitEnterFullscreen abre o player nativo.
    // Em outros navegadores usamos Fullscreen API; se não suportada,
    // abrimos o vídeo numa nova aba para leitura com maior área útil.
    try {
      if (typeof lessonVideo.webkitEnterFullscreen === 'function') {
        lessonVideo.webkitEnterFullscreen();
      } else if (typeof lessonVideo.requestFullscreen === 'function') {
        lessonVideo.requestFullscreen().catch(() => {
          window.open(lessonVideo.currentSrc, '_blank', 'noopener,noreferrer');
        });
      } else {
        window.open(lessonVideo.currentSrc, '_blank', 'noopener,noreferrer');
      }
    } catch (_) {
      window.open(lessonVideo.currentSrc, '_blank', 'noopener,noreferrer');
    }
  });

  videoLessonBack?.addEventListener('click', () => {
    lessonVideo?.pause();
    openModulePath(currentVideoTopic || currentLearningTopic);
  });

  videoPracticeBtn?.addEventListener('click', () => {
    lessonVideo?.pause();
    startTopic(currentVideoTopic || currentLearningTopic || 'pix', currentVideoLessonIndex || 0);
  });

  playWhatsAppCard?.addEventListener('click', () => {
    nativeHaptic('tap');
    setView('playstore-detail');
    if (currentLearningTopic === 'playstore' && currentTopicAction === 'play-find') {
      setCoachMessage('APPS SEGUROS', 'Agora confira quem publicou', 'O nome do desenvolvedor fica logo abaixo do nome do aplicativo.');
      scheduleGuide(playDeveloperLearnedBtn, { label: 'Entendi' }, 100);
    }
  });
  playStoreDetailBack?.addEventListener('click', () => setView('playstore-home'));
  playProtectBack?.addEventListener('click', () => setView('playstore-home'));
  playProtectBtn?.addEventListener('click', () => { nativeHaptic('tap'); setView('playstore-protect'); });
  playDeveloperLearnedBtn?.addEventListener('click', () => {
    nativeHaptic('success');
    if (currentLearningTopic === 'playstore') showLessonComplete('Antes de instalar, confira o nome do aplicativo e quem é o desenvolvedor oficial.');
  });
  playProtectLearnedBtn?.addEventListener('click', () => {
    nativeHaptic('success');
    if (currentLearningTopic === 'playstore') showLessonComplete('O Google Play Protect ajuda a verificar aplicativos e alertar sobre comportamentos potencialmente nocivos.');
  });
  openRealPlayStoreBtn?.addEventListener('click', async () => {
    const opened = await window.EducaAndroidApi?.openPlayStore?.('com.whatsapp');
    if (!opened) announce('Para abrir a Play Store real, execute o protótipo pelo aplicativo Android.', true);
  });
  openRealBbBtn?.addEventListener('click', async () => {
    const opened = await window.EducaAndroidApi?.openBancoBrasil?.();
    if (!opened) announce('O aplicativo BB não foi encontrado neste aparelho. Use apenas o app oficial da loja do sistema.', true);
  });
  openRealCaixaBtn?.addEventListener('click', async () => {
    const opened = await window.EducaAndroidApi?.openCaixa?.();
    if (!opened) announce('O aplicativo CAIXA não foi encontrado neste aparelho. Use apenas o app oficial da loja do sistema.', true);
  });

  $$('.settings-home-back').forEach(btn => btn.addEventListener('click', () => {
    if (trainingStarted) openLearningHub();
    else { clearGuide(); setView('home'); }
  }));

  $$('[data-settings-back]').forEach(btn => btn.addEventListener('click', () => {
    clearGuide({ keepState: true });
    setView(btn.dataset.settingsBack || 'settings-main');
  }));

  $$('[data-settings-nav]').forEach(btn => btn.addEventListener('click', () => {
    nativeHaptic('tap');
    const target = btn.dataset.settingsNav;
    clearGuide({ keepState: true });
    setView(target);
    if (currentLearningTopic !== 'settings') return;
    if (currentTopicAction === 'settings-font') {
      if (target === 'settings-display') {
        setCoachMessage('AJUSTES · PASSO 2', 'Abra Texto e tamanho de exibição', 'Aqui ficam os controles de tamanho da fonte e dos itens da tela.');
        scheduleGuide(settingsTextSizeRow, { label: 'Toque aqui' }, 100);
      } else if (target === 'settings-text') {
        setCoachMessage('AJUSTES · PASSO 3', 'Aumente a fonte', 'Arraste o controle para a direita até o texto ficar confortável.');
        scheduleGuide($('#fontSizeCard'), { label: 'Aumente aqui' }, 100);
      }
    } else if (currentTopicAction === 'settings-volume' && target === 'settings-sound') {
      setCoachMessage('AJUSTES · PASSO 2', 'Ajuste o volume da mídia', 'Arraste o primeiro controle. Faça isso aos poucos.');
      scheduleGuide($('#volumeTrainingCard'), { label: 'Ajuste aqui' }, 100);
    } else if (currentTopicAction === 'settings-wifi') {
      if (target === 'settings-network') {
        setCoachMessage('AJUSTES · PASSO 2', 'Abra Internet', 'Toque em “Internet” para ver as redes Wi‑Fi.');
        scheduleGuide(settingsInternetRow, { label: 'Internet' }, 100);
      } else if (target === 'settings-internet') {
        setCoachMessage('AJUSTES · PASSO 3', 'Escolha uma rede conhecida', 'No treino, toque em “Casa_Maria”, que é a rede conhecida e protegida.');
        scheduleGuide(wifiCasaRow, { label: 'Casa_Maria' }, 100);
      }
    }
  }));

  fontSizeSlider?.addEventListener('input', () => {
    const value = Number(fontSizeSlider.value || 2);
    const labels = ['Muito pequeno', 'Pequeno', 'Padrão', 'Grande', 'Muito grande'];
    if (fontSizeLabel) fontSizeLabel.textContent = labels[value] || 'Padrão';
    if (fontPreviewTitle) fontPreviewTitle.style.fontSize = `${15 + value * 2}px`;
    if (fontPreviewText) fontPreviewText.style.fontSize = `${8.5 + value * 1.1}px`;
    if (currentLearningTopic === 'settings' && currentTopicAction === 'settings-font' && value >= 3 && !transitionLock) {
      transitionLock = true;
      clearGuide();
      nativeHaptic('success');
      window.setTimeout(() => {
        transitionLock = false;
        showLessonComplete('Você encontrou o tamanho da fonte e aumentou as letras para uma leitura mais confortável.');
      }, 380);
    }
  });

  mediaVolumeSlider?.addEventListener('input', () => {
    if (mediaVolumeValue) mediaVolumeValue.textContent = `${mediaVolumeSlider.value}%`;
  });
  mediaVolumeSlider?.addEventListener('change', () => {
    if (currentLearningTopic === 'settings' && currentTopicAction === 'settings-volume') {
      clearGuide();
      nativeHaptic('success');
      showLessonComplete('Você encontrou o controle de volume da mídia e aprendeu a ajustá-lo aos poucos.');
    }
  });

  wifiCasaRow?.addEventListener('click', () => {
    if (wifiCasaStatus) wifiCasaStatus.textContent = 'Conectado · rede salva';
    nativeHaptic('success');
    if (currentLearningTopic === 'settings' && currentTopicAction === 'settings-wifi') {
      clearGuide();
      window.setTimeout(() => showLessonComplete('Você encontrou o Wi‑Fi e escolheu uma rede conhecida. Em redes reais, confira sempre o nome e o cadeado.'), 300);
    }
  });

  openRealSettingsBtn?.addEventListener('click', async () => {
    const opened = await window.EducaAndroidApi?.openSettings?.();
    if (!opened) announce('Para abrir os Ajustes reais, execute o protótipo pelo aplicativo Android.', true);
  });

  // Os demais cards abrem uma explicação real da função, nunca ficam sem resposta.
  const govExtraInfo = {'Procuracao eletronica': 'Conheça o serviço de procuração eletrônica e confira quando pode ser utilizado por meio dos canais oficiais.','Caixa Postal': 'Consulte avisos recebidos de órgãos oficiais sem abrir links desconhecidos.','Assinar documentos digitalmente': 'Aprenda a conferir um documento antes de usar a assinatura eletrônica.','Consultar servicos solicitados': 'Acompanhe solicitações feitas por serviços públicos e confira os protocolos.','Baixar certidoes': 'Procure certidões pelos canais oficiais e confira a origem dos documentos.','Aumentar nivel': 'Os níveis da conta indicam diferentes recursos e verificações de identidade.','Adicionando documento': 'Na carteira digital, veja quais documentos estão disponíveis para incluir.','Biometria': 'O login por biometria usa o sistema de autenticação do celular.','Historico de acessos': 'Veja como consultar acessos e gerenciar autorizações de sua conta.','Privacidade': 'Confira as informações sobre o uso de dados e suas autorizações.','Ajuda': 'Veja opções oficiais de atendimento e orientação sobre a conta gov.br.','Rever telas': 'Reveja as telas iniciais para se orientar dentro do aplicativo.','Termos e privacidade': 'Entenda onde ler os termos de uso e o aviso de privacidade do gov.br.'};
  let govExtraPrevious = 'govbr-home';
  const isGovServiceExercise = () => trainingStarted && currentLearningTopic === 'govbr' && currentTopicAction === 'gov-service';
  // O treino pode ser concluído ao aprender qualquer serviço, não só Prova de vida.
  // Outros contextos do GOV.BR continuam com botão de retorno normal.
  let govSelectedService = '';
  const govExtraDone = $('#govExtraDone');
  $$('[data-gov-detail]').forEach(btn => btn.addEventListener('click', () => {
    nativeHaptic('tap');
    const key = btn.dataset.govDetail;
    govExtraPrevious = btn.closest('.android-view')?.dataset.view || 'govbr-home';
    const title = key.replace('Procuracao','Procuração').replace('eletronica','eletrônica').replace('servicos','serviços').replace('certidoes','certidões').replace('nivel','nível');
    govSelectedService = title;
    $('#govExtraTitle').textContent = title;
    $('#govExtraHeading').textContent = title;
    $('#govExtraText').textContent = govExtraInfo[key] || 'Confira este recurso pelos canais oficiais do gov.br.';
    if (govExtraDone) govExtraDone.textContent = (isGovServiceExercise() && ['govbr-home', 'govbr-services'].includes(govExtraPrevious)) ? 'Concluir atividade' : 'Voltar ao aplicativo';
    openGovView('govbr-extra-detail');
    if (govExtraDone && govExtraDone.textContent === 'Concluir atividade') {
      setCoachMessage('GOV.BR · ÚLTIMO PASSO', 'Conclua a atividade', 'Você encontrou e conheceu o serviço. Toque em “Concluir atividade”.');
      scheduleGuide(govExtraDone, { label: 'Concluir' }, 100);
    }
  }));
  const govCloseExtra = () => openGovView(govExtraPrevious);
  $('#govExtraBack')?.addEventListener('click', govCloseExtra);
  govExtraDone?.addEventListener('click', () => {
    if (isGovServiceExercise() && ['govbr-home', 'govbr-services'].includes(govExtraPrevious)) {
      nativeHaptic('success');
      showLessonComplete(`Você encontrou o serviço “${govSelectedService}” e aprendeu onde consultar suas informações no gov.br.`);
    } else govCloseExtra();
  });

  // Serviços que têm telas próprias também precisam terminar o exercício.
  // Só mostrar a conclusão quando um cartão de serviço foi escolhido de fato.
  const govServiceTargets = new Set(['govbr-docs','govbr-agenda','govbr-qr','govbr-proof','govbr-security']);
  function offerGovServiceFinish(target, serviceName) {
    $$('.gov-service-finish').forEach(button => button.remove());
    if (!isGovServiceExercise() || !govServiceTargets.has(target)) return;
    if (target === 'govbr-proof') return; // Prova de vida já tem botão próprio.
    const screen = $(`.android-view[data-view="${target}"] .gov-app-surface`);
    if (!screen) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gov-service-finish';
    btn.textContent = 'Concluir atividade';
    btn.setAttribute('aria-label', `Concluir atividade após conhecer ${serviceName}`);
    screen.append(btn);
    btn.addEventListener('click', () => {
      nativeHaptic('success');
      showLessonComplete(`Você encontrou o serviço “${serviceName}” e aprendeu onde acessá-lo no gov.br.`);
    }, { once:true });
    setCoachMessage('GOV.BR · ÚLTIMO PASSO', 'Conheça o serviço', 'Confira as informações e toque em “Concluir atividade”.');
    scheduleGuide(btn, {label:'Concluir'}, 140);
  }

  $$('[data-gov-nav]').forEach(btn => btn.addEventListener('click', () => {
    nativeHaptic('tap');
    const target = btn.dataset.govNav;
    const parent = btn.closest('.android-view');
    const fromServiceCard = !!btn.closest('.gov-service-card, .gov-home-row');
    const selectedName = btn.querySelector('strong')?.textContent?.trim() || btn.textContent?.trim() || 'Serviço público';
    clearGuide({ keepState: true });
    openGovView(target);
    if (currentLearningTopic !== 'govbr') return;
    if (isGovServiceExercise() && fromServiceCard && ['govbr-home','govbr-services'].includes(parent?.dataset.view) && govServiceTargets.has(target)) {
      offerGovServiceFinish(target, selectedName);
      return;
    }
    if (currentTopicAction === 'gov-service' && target === 'govbr-services') {
      setCoachMessage('GOV.BR · PASSO 2', 'Busque ou escolha um serviço', 'Você pode pesquisar pelo nome ou tocar diretamente no serviço que deseja conhecer.');
      scheduleGuide(govServiceSearch?.closest('.gov-real-search') || govServiceSearch, { label: 'Pesquisar' }, 100);
    } else if (currentTopicAction === 'gov-logout' && target === 'govbr-menu') {
      setCoachMessage('GOV.BR · PASSO 2', 'Saia da conta', 'Em aparelho compartilhado, procure “Sair e desvincular sua conta deste aparelho” quando terminar.');
      scheduleGuide(govLogoutBtn, { label: 'Sair da conta' }, 100);
    } else if (currentTopicAction === 'gov-2fa' && target === 'govbr-menu') {
      setCoachMessage('GOV.BR · PASSO 2', 'Abra Segurança da conta', 'Toque em “Segurança da conta” para encontrar a verificação em duas etapas.');
      scheduleGuide(govSecurityMenuRow, { label: 'Segurança' }, 100);
    } else if (currentTopicAction === 'gov-2fa' && target === 'govbr-security') {
      setCoachMessage('GOV.BR · PASSO 3', 'Abra a verificação em duas etapas', 'Agora toque em “Verificação em duas etapas”.');
      scheduleGuide(govTwoFactorRow, { label: 'Verificação 2 etapas' }, 100);
    }
  }));

  govSearchBox?.addEventListener('click', () => {
    openGovView('govbr-services');
    govServiceSearch?.focus();
  });
  govServiceSearch?.addEventListener('focus', () => {
    // O teclado e o campo precisam permanecer visíveis e clicáveis durante a digitação.
    clearGuide({ keepState: true });
  });
  govServiceSearch?.addEventListener('input', (e) => {
    const normalize = value => value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
    const query = normalize(e.target.value);
    const rows = $$('#govbrServicesView .gov-service-list.real-services .gov-service-card');
    const found = [];
    rows.forEach(row => {
      const matched = !query || normalize(row.textContent).includes(query);
      row.hidden = !matched;
      if (matched) found.push(row);
    });
    govSearchUsed = !!query && found.length > 0;
    const help = $('#govSearchHelp');
    if (help) help.textContent = govSearchUsed
      ? `${found.length} serviço(s) encontrado(s). Toque no que deseja conhecer.`
      : query ? 'Nenhum serviço encontrado. Tente outra palavra ou apague a pesquisa.'
      : 'Digite, por exemplo, “Prova de vida”, “Carteira” ou “Agenda”.';
    const list = $('#govbrServicesView .gov-service-list.real-services');
    if (list) list.scrollTop = 0;
    if (govSearchUsed && isGovServiceExercise()) {
      setCoachMessage('GOV.BR · PASSO 3', 'Abra o resultado', 'Você encontrou o serviço. Toque no cartão para conhecer suas informações.');
      scheduleGuide(found[0], {label:'Abrir serviço'}, 140);
    }
  });

  govHeaderProfileBtn?.addEventListener('click', () => openGovView('govbr-data'));

  govLoginBtn?.addEventListener('click', () => {
    nativeHaptic('tap');
    openGovView('govbr-auth');
    if (govAuthCpf) govAuthCpf.value = '';
    if (govAuthContinueBtn) govAuthContinueBtn.disabled = true;
    if (currentTopicAction === 'gov-login') {
      setCoachMessage('GOV.BR · PASSO 2', 'Use o ambiente de treino', 'Você pode preencher o CPF de treino automaticamente e continuar sem usar dados reais.');
      scheduleGuide(govUseDemoCpfBtn || govAuthCpf, { label: 'Usar treino' }, 100);
    }
  });

  // Não solicitamos nem validamos CPF real. Somente dados fictícios preenchidos pelo botão.
  govUseDemoCpfBtn?.addEventListener('click', () => {
    nativeHaptic('tap');
    if (govAuthCpf) govAuthCpf.value = '000.000.000-00';
    if (govAuthContinueBtn) govAuthContinueBtn.disabled = false;
    clearGuide();
    setCoachMessage('GOV.BR · PASSO 3', 'Toque em Continuar', 'Pronto! O CPF de exemplo foi preenchido. Agora toque no botão azul “Continuar”.');
    announce('CPF fictício preenchido. Toque em Continuar.', true);
    scheduleGuide(govAuthContinueBtn, { label: 'Continuar' }, 130);
  });

  govAuthContinueBtn?.addEventListener('click', () => {
    nativeHaptic('success');
    openGovView('govbr-2fa-prompt');
    if (currentTopicAction === 'gov-login') {
      setCoachMessage('GOV.BR · PASSO 3', 'Escolha como continuar', 'Você pode ativar a verificação em duas etapas ou tocar em “Agora não”. As duas opções funcionam neste treino.');
      scheduleGuide(govSkip2faBtn?.closest('.gov-2fa-prompt-actions'), { label: 'Escolha uma opção' }, 100);
    }
  });

  govEnable2faBtn?.addEventListener('click', () => {
    nativeHaptic('success');
    govSessionActive = true;
    openGovView('govbr-home');
    if (currentTopicAction === 'gov-login') showLessonComplete('Você entrou pelo fluxo oficial do gov.br e reconheceu a etapa de verificação em duas etapas.');
  });

  govSkip2faBtn?.addEventListener('click', () => {
    nativeHaptic('success');
    govSessionActive = true;
    openGovView('govbr-home');
    if (currentTopicAction === 'gov-login') showLessonComplete('Você entrou no ambiente simulado do gov.br sem usar dados reais.');
  });

  govProofRow?.addEventListener('click', () => {
    openGovView('govbr-proof');
    if (currentLearningTopic === 'govbr' && currentTopicAction === 'gov-service') {
      setCoachMessage('GOV.BR · ÚLTIMO PASSO', 'Conheça o serviço', 'Leia as orientações e toque em “Entendi como localizar” para concluir.');
      scheduleGuide(govProofFoundBtn, { label: 'Concluir' }, 100);
    }
  });

  govProofFoundBtn?.addEventListener('click', () => {
    if (currentLearningTopic === 'govbr' && currentTopicAction === 'gov-service') {
      nativeHaptic('success');
      showLessonComplete('Você aprendeu a localizar a Prova de vida dentro de Serviços no gov.br. A disponibilidade depende do órgão responsável pelo benefício.');
    }
  });

  govSecurityMenuRow?.addEventListener('click', () => {
    if (currentLearningTopic === 'govbr' && currentTopicAction === 'gov-2fa') {
      setCoachMessage('GOV.BR · PASSO 3', 'Abra a verificação em duas etapas', 'Agora toque em “Verificação em duas etapas”.');
      scheduleGuide(govTwoFactorRow, { label: 'Verificação 2 etapas' }, 100);
    }
  });

  govTwoFactorRow?.addEventListener('click', () => {
    openGovView('govbr-security-2fa');
    if (currentLearningTopic === 'govbr' && currentTopicAction === 'gov-2fa') {
      setCoachMessage('GOV.BR · PASSO 4', 'Ative a proteção', 'Toque em “Ativar verificação em duas etapas” para concluir o treino.');
      scheduleGuide(gov2faLearnBtn, { label: 'Ativar' }, 100);
    }
  });

  gov2faLearnBtn?.addEventListener('click', () => {
    nativeHaptic('success');
    if (currentLearningTopic === 'govbr' && currentTopicAction === 'gov-2fa') {
      showLessonComplete('Você encontrou a verificação em duas etapas e entendeu que o código deve ser gerado no próprio aplicativo gov.br.');
    } else {
      openGovView('govbr-security');
    }
  });

  govLogoutBtn?.addEventListener('click', () => {
    nativeHaptic('tap');
    openGovView('govbr-exit-review');
  });
  $('#govConfirmExitBtn')?.addEventListener('click', () => {
    govSessionActive = false;
    nativeHaptic('success');
    openGovView('govbr-login');
    if (currentLearningTopic === 'govbr' && currentTopicAction === 'gov-logout') showLessonComplete('Você confirmou a saída e encerrou a sessão de treino de forma segura.');
  });

  openRealGovBtn?.addEventListener('click', async () => {
    const opened = await window.EducaAndroidApi?.openGovBr?.();
    if (!opened) announce('O aplicativo gov.br real não está instalado ou o protótipo não está rodando no Android nativo.', true);
  });

  $$('.training-chat').forEach(row => row.addEventListener('click', () => {
    if (transitionLock) return;
    clearGuide();
    nativeHaptic('tap');
    renderScenario(row.dataset.scenario);
    coachTitle.textContent = 'Leia com calma';
    coachText.textContent = 'Observe a mensagem e escolha a atitude mais segura.';
    if (miniCoachTitle) miniCoachTitle.textContent = 'Leia com calma';
    if (miniCoachText) miniCoachText.textContent = 'Observe a mensagem e escolha a atitude mais segura.';
  }));

  let waSearchUsed = false;
  let govSearchUsed = false;
  const waSearchBtn = $('.whatsapp-search');
  const waSearchInline = $('#waSearchInline');
  const waSearchInput = $('#waSearchInput');
  function showWhatsAppSearch() {
    if (!waSearchInline || !waSearchInput) return;
    waSearchInline.hidden = false;
    waSearchBtn?.setAttribute('aria-expanded', 'true');
    waSearchInput.focus();
  }
  waSearchBtn?.addEventListener('click', showWhatsAppSearch);
  $('#waSearchClose')?.addEventListener('click', () => {
    waSearchInline.hidden = true;
    waSearchBtn?.setAttribute('aria-expanded', 'false');
    waSearchInput.value = '';
    $$('.wa-chat-list .chat-row').forEach(row => row.hidden = false);
    if ($('#waSearchEmpty')) $('#waSearchEmpty').hidden = true;
  });
  waSearchInput?.addEventListener('input', () => {
    const norm = s => s.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const query = norm(waSearchInput.value.trim());
    let count=0;
    $$('.wa-chat-list .chat-row').forEach(row => {
      row.hidden = !!query && !norm(row.textContent).includes(query);
      if (!row.hidden) count++;
    });
    $('#waSearchEmpty').hidden = !!count;
    if (query.includes('maria')) {
      waSearchUsed = true;
      if (currentTopicAction === 'wa-list') {
        announce('Você encontrou Maria. Confira o nome e abra a conversa.', true);
        scheduleGuide($('.normal-chat[data-normal-chat="daughter"]'), {label:'Abra Maria'}, 160);
      }
    }
  });

  $$('.normal-chat').forEach(row => row.addEventListener('click', () => {
    if (currentLearningTopic === 'whatsapp' && currentTopicAction === 'wa-list' && row.dataset.normalChat === 'daughter' && !waSearchUsed) {
      announce('Primeiro toque na pesquisa e digite Maria para localizar a conversa.', true);
      showWhatsAppSearch();
      return;
    }
    clearGuide();
    openNormalChat(row.dataset.normalChat);
    if (currentLearningTopic === 'whatsapp' && currentTopicAction === 'wa-list' && row.dataset.normalChat === 'daughter') {
      window.setTimeout(() => showLessonComplete('Você encontrou e abriu a conversa certa.'), 650);
    }
  }));

  decisionOptions?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-scenario-answer]');
    if (!btn || btn.disabled || transitionLock || !currentScenario) return;
    const result = btn.querySelector('.answer-result');
    if (btn.dataset.scenarioAnswer === 'correct') {
      nativeHaptic('success');
      decisionOptions.querySelectorAll('button').forEach(option => { option.disabled = true; option.classList.remove('is-wrong'); });
      btn.classList.add('is-correct');
      if (result) result.textContent = '✓ CORRETO';
      if (scenarioAnswerFeedback) { scenarioAnswerFeedback.hidden = false; scenarioAnswerFeedback.className = 'scenario-answer-feedback good'; scenarioAnswerFeedback.textContent = '✓ Correto! Essa é a atitude mais segura.'; }
      markScenarioComplete(currentScenario);
    } else {
      nativeHaptic('error');
      btn.classList.add('is-wrong');
      if (result) result.textContent = '✕ ERRO';
      if (scenarioAnswerFeedback) { scenarioAnswerFeedback.hidden = false; scenarioAnswerFeedback.className = 'scenario-answer-feedback bad'; scenarioAnswerFeedback.textContent = '✕ Errado. Tente outra opção com calma.'; }
      announce('Cuidado. Essa escolha pode aumentar o risco. Tente outra opção.', false);
      btn.animate([{ transform:'translateX(0)' },{ transform:'translateX(-5px)' },{ transform:'translateX(5px)' },{ transform:'translateX(0)' }],{ duration:280 });
    }
  });

  // Durante uma etapa guiada, só a ação iluminada pode ser executada.
  // Isso evita cliques acidentais e mantém uma ação por vez, como sugerido na mentoria.
  phoneScreen?.addEventListener('click', (event) => {
    if (!guideOverlay || guideOverlay.hidden) return;
    const target = $('.guide-target', phoneScreen);
    if (!target || !target.getClientRects().length || target.contains(event.target)) return;
    if (document.body.classList.contains('landing-pretest-active') && event.target.closest('[data-open-app]')) {
      clearGuide();
      clearLandingPretest();
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    nativeHaptic('error');
    announce('Toque no item iluminado para continuar.', false);
  }, true);

  window.addEventListener('resize', scheduleGuidePositionUpdate, { passive: true });

  $$('.android-back').forEach(btn => btn.addEventListener('click', () => { clearGuide(); setView(btn.dataset.backHome || 'home'); }));
  // A camada Android V103 utiliza eventos explícitos para não duplicar o fluxo das aulas.
  window.addEventListener('educa:system-learning', () => { if (trainingStarted) openLearningHub(); else setView('home'); });
  window.addEventListener('educa:system-home', () => { clearGuide(); setView('home'); });
  window.addEventListener('educa:system-back', () => {
    const active = $('.android-view.is-active');
    if (!active || active.dataset.view === 'home') return;
    const back = $('.android-back, [aria-label="Voltar"]', active);
    if (back && !back.disabled) back.click();
    else if (active.dataset.view === 'module-path' && modulePathBack) modulePathBack.click();
    else if (active.dataset.view === 'video-lesson' && videoLessonBack) videoLessonBack.click();
    else if (trainingStarted) openLearningHub();
    else setView('home');
  });
  $('#gestureHome')?.addEventListener('click', () => {
    nativeHaptic('tap');
    if (trainingStarted) openLearningHub();
    else { clearGuide(); setView('home'); }
  });
  $('#finishTraining')?.addEventListener('click', showAccountPrompt);
  $('#sendNormalMessage')?.addEventListener('click', sendNormalMessage);
  $('#normalMessageInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') sendNormalMessage(); });

  hintBtn?.addEventListener('click', () => { hintText.hidden = !hintText.hidden; });
  speakBtn?.addEventListener('click', () => {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(`${coachTitle.textContent}. ${coachText.textContent}. ${hintText.textContent || ''}`);
    msg.lang = 'pt-BR'; msg.rate = 0.88; speechSynthesis.speak(msg);
  });

  function isInstalledDisplayMode() {
    return window.matchMedia?.('(display-mode: fullscreen)').matches ||
           window.matchMedia?.('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  function maybeShowBrowserFullscreenGate() {
    if (!browserFullscreenGate) return;
    const remembered = getRememberedUser?.();
    const isBrowserTab = !isInstalledDisplayMode();
    // O aviso não deve interromper a abertura do simulador.
    // A opção de ampliar fica visível na barra superior.
    browserFullscreenGate.hidden = true;
  }

  // V99: tela cheia é uma escolha explícita. Safari no iPhone não
  // disponibiliza a Fullscreen API para o documento em abas normais;
  // neste caso ampliamos o simulador para o viewport visível, sem mudar
  // a atividade nem abrir a central de aprendizagem automaticamente.
  function isPhoneExpanded() {
    return Boolean(document.fullscreenElement || document.documentElement.classList.contains('educa-immersive-active'));
  }

  async function openPhoneFullscreen() {
    if (isPhoneExpanded()) return true;
    const root = document.documentElement;
    if (root.requestFullscreen) {
      try {
        await root.requestFullscreen({ navigationUI: 'hide' });
        syncFullscreenControls();
        return true;
      } catch (_) {
        try {
          await root.requestFullscreen();
          syncFullscreenControls();
          return true;
        } catch (_) {}
      }
    }
    // Modo visual alternativo para iPhone/iOS e navegadores que bloqueiam a API.
    root.classList.add('educa-immersive-active');
    syncFullscreenControls();
    return true;
  }

  async function closePhoneFullscreen() {
    document.documentElement.classList.remove('educa-immersive-active');
    if (document.fullscreenElement && document.exitFullscreen) {
      try { await document.exitFullscreen(); } catch (_) {}
    }
    syncFullscreenControls();
  }

  // V59: usa a área realmente visível do navegador. Isso faz o protótipo
  // se adaptar ao F11, mudança de zoom, barra do navegador e redimensionamento.
  function updatePrototypeViewportFit() {
    const viewport = window.visualViewport;
    // Não imponha piso de 320x480: tablets em paisagem e zoom do browser
    // podem disponibilizar menos CSS pixels, sobretudo com o teclado aberto.
    const width = Math.max(1, Math.round(viewport?.width || window.innerWidth || document.documentElement.clientWidth));
    const height = Math.max(1, Math.round(viewport?.height || window.innerHeight || document.documentElement.clientHeight));
    document.documentElement.style.setProperty('--educa-visible-w', `${width}px`);
    document.documentElement.style.setProperty('--educa-visible-h', `${height}px`);
  }

  updatePrototypeViewportFit();
  window.addEventListener('resize', updatePrototypeViewportFit, { passive: true });
  window.visualViewport?.addEventListener('resize', updatePrototypeViewportFit, { passive: true });
  window.visualViewport?.addEventListener('scroll', updatePrototypeViewportFit, { passive: true });
  browserFullscreenGateBtn?.addEventListener('click', async () => {
    const ok = await openPhoneFullscreen();
    if (ok && browserFullscreenGate) browserFullscreenGate.hidden = true;
  });

  // V76: alinha o pequeno botão de ampliação à DIREITA do aparelho.
  // Quando a margem à direita é insuficiente, ele fica acima do canto direito
  // da moldura, sem encobrir o destaque do pré-teste ou qualquer ícone.
  function placeExpandButton() {
    if (!fullscreenBtn || document.fullscreenElement) return;
    const tools = fullscreenBtn.closest('.phone-tools');
    const wrap = fullscreenBtn.closest('.phone-preview-wrap');
    const phone = $('#phoneHardware');
    if (!tools || !wrap || !phone) return;
    if (window.matchMedia('(max-width: 600px)').matches) {
      wrap.classList.remove('educa-expand-above');
      tools.style.removeProperty('--educa-expand-x');
      tools.style.removeProperty('--educa-expand-y');
      return;
    }
    const frame = phone.getBoundingClientRect();
    const area = wrap.getBoundingClientRect();
    if (!frame.width || !frame.height) return;
    const size = 90;
    const height = 72;
    const gap = 14;
    const viewportRight = Math.min(window.innerWidth, (window.visualViewport?.offsetLeft || 0) + (window.visualViewport?.width || window.innerWidth));
    let x = frame.right + gap;
    let y = frame.top + 20;
    const abovePhone = x + size > viewportRight - 6;
    // Reserva uma folga vertical só quando o botão não cabe ao lado.
    wrap.classList.toggle('educa-expand-above', abovePhone);
    if (abovePhone) {
      // Mede novamente depois de aplicar a margem reservada no CSS.
      const shifted = phone.getBoundingClientRect();
      x = Math.min(shifted.right - size, viewportRight - size - 8);
      y = shifted.top - height - 17;
    }
    x = Math.max(8, x);
    tools.style.setProperty('--educa-expand-x', `${Math.round(x - area.left)}px`);
    tools.style.setProperty('--educa-expand-y', `${Math.round(y - area.top)}px`);
  }
  window.addEventListener('resize', () => window.requestAnimationFrame(placeExpandButton), { passive: true });
  window.visualViewport?.addEventListener('resize', () => window.requestAnimationFrame(placeExpandButton), { passive: true });
  if (typeof ResizeObserver !== 'undefined') {
    const controlObserver = new ResizeObserver(() => window.requestAnimationFrame(placeExpandButton));
    const targetPhone = $('#phoneHardware');
    if (targetPhone) controlObserver.observe(targetPhone);
  }

  // V74: controles de tela cheia mutuamente exclusivos, fora da área do celular.
  // O alvo da Fullscreen API é o elemento <html>, não #phoneStage.
  function syncFullscreenControls() {
    const expanded = isPhoneExpanded();
    document.documentElement.classList.toggle('educa-fullscreen-active', expanded);
    if (fullscreenBtn) {
      fullscreenBtn.hidden = expanded;
      fullscreenBtn.setAttribute('aria-hidden', expanded ? 'true' : 'false');
    }
    if (exitFullscreen) {
      exitFullscreen.hidden = !expanded;
      exitFullscreen.setAttribute('aria-hidden', expanded ? 'false' : 'true');
    }
    if (focusExpandBtn) focusExpandBtn.hidden = expanded || !document.body.classList.contains('prototype-focus');
    updatePrototypeViewportFit();
    maybeShowBrowserFullscreenGate();
    window.requestAnimationFrame(placeExpandButton);
  }

  focusExpandBtn?.addEventListener('click', () => {
    // Controle do modo logado: não altera a atividade em andamento.
    openPhoneFullscreen();
  });
  fullscreenBtn?.addEventListener('click', () => {
    // V96: Ampliar é uma ação VISUAL, não o início do treinamento.
    // Visitantes devem permanecer na Home com o Banco destacado para
    // o pré-teste; só o toque no Banco inicia a atividade do Pix.
    openPhoneFullscreen();
  });
  exitFullscreen?.addEventListener('click', closePhoneFullscreen);
  document.addEventListener('fullscreenchange', syncFullscreenControls);
  // ESC, F11 ou a saída automática também restauram o botão de ampliar.
  syncFullscreenControls();

  accountForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const phone = ($('#accountPhone')?.value || '').trim();
    const digits = phone.replace(/\D/g, '');
    const submit = $('.create-account-btn', accountForm);
    const show = (message, cls) => { accountMessage.hidden = false; accountMessage.className = `account-message ${cls}`; accountMessage.textContent = message; };
    if (digits.length < 10 || digits.length > 11) return show('Digite seu celular com DDD.', 'error');
    submit.disabled = true; submit.textContent = 'Verificando...';
    try {
      const response = await fetch('/api/conta', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({phone:digits}) });
      const data = await response.json();
      if (!response.ok && data.needs_login) {
        accountCard.hidden = true;
        openReturnModal();
        if (returnPhone) returnPhone.value = formatPhone(digits);
        showReturnMessage(returnPhoneMessage, 'Este celular já tem um treino. Receba seu código demonstrativo para continuar.', 'neutral');
        return;
      }
      if (!response.ok) return show(data.message || 'Não foi possível criar sua conta.', 'error');
      saveRememberedUser(data.name || 'Participante', data.phone || digits);
      accountCard.hidden = true;
      await loadServerProgress(data.phone || digits);
      startTraining({ focus: true, boot: true });
    } catch (_) { show('Não foi possível salvar agora. Verifique sua conexão.', 'error'); }
    finally { submit.disabled = false; submit.textContent = 'Quero continuar aprendendo'; }
  });

  skipAccount?.addEventListener('click', () => {
    accountForm.hidden = true;
    accountMessage.hidden = false;
    accountMessage.className = 'account-message neutral';
    accountMessage.textContent = 'Tudo bem. Você pode continuar usando a experiência sem conta.';
  });

  function updateClock() {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
    glanceDate.textContent = now.toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (document.documentElement.classList.contains('educa-immersive-active')) closePhoneFullscreen();
      closeInfoModal(); closeStartModal(); closeReturnModal();
      // O próprio navegador já desativa a tela cheia com Esc. Preserve o
      // modo de treino, evitando voltar ao site quando o usuário dá zoom-out.
    }
  });

  updateReturningUI();
  updateClock();
  syncAndroidStatus();
  window.setInterval(syncAndroidStatus, 60000);
  setInterval(updateClock, 30000);
  clearGuide();
  currentLearningTopic = '';
  currentTopicAction = '';

  // V102: landing começa SEMPRE no pré-teste; usuário salvo só continua por clique.
  trainingStarted = false;
  setView('home');
  applyLandingPretest();

})();
