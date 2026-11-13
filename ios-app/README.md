# Educa+ Digital iOS nativo — V111.71

Aplicativo **SwiftUI + WebKit** para iPhone, com código-fonte próprio em Swift e acesso ao mesmo backend Cloudflare usado na web e Android.

## Recursos

- Inicializa em `https://educa-digital.educamaisdigital.workers.dev/?app=1&platform=ios`, com a tela do simulador sem a moldura de celular.
- Mantém login, progresso e sessões com `WKWebsiteDataStore.default()`.
- Continua usando **Cloudflare Workers AI / Gemma 4** e a síntese **Kokoro pf_dora** no navegador (onde suportada).
- WebView nativo permite vídeos inline, usa prompts de permissões do iOS e bloqueia navegação principal para origens desconhecidas. Links externos abrem o Safari.
- Feedback tátil nativo para botões do treinamento, tela de reconexão quando o endereço oficial está indisponível.
- Não há chaves, tokens, secrets, certificados, armazenamento de senhas ou pagamentos reais no código.
- O app requer internet para a IA, não é uma LIA neural offline.

## Novo V111.71 — acionador real experimental de ligacoes

O aplicativo iOS **nativo assinado** inclui o `CXCallObserver` para observar alterações de estado de chamadas **enquanto o processo do Educa+ estiver em execução**. No escudo, ative o botão **Avisar sobre atividade de ligação no iPhone** e conceda permissão de notificações. Quando uma ligação recebida for observada, o aplicativo tentará emitir um aviso real e condicional: **"Educa+ Digital — Atenção. Ligação recebida. Se o número for desconhecido, tenha cuidado com possíveis tentativas de golpe. Nunca compartilhe senhas ou códigos."** (não é simulação quando acionado por uma ligação, mas pode ser suprimido pelo iOS).

**Limitações:** `CXCallObserver` não fornece número telefônico nem acesso aos contatos. O app não consegue saber se o número está salvo; a notificação condicional é igual para qualquer chamada recebida. Com o app encerrado/suspenso, **não há promessa de detecção ou aviso**. A interface de ligação do sistema pode suprimir o banner. O Safari/PWA não suporta o acionador. Para a proteção permanente de números desconhecidos, ative a triagem do próprio iOS em Ajustes. O módulo não captura histórico, áudio, contatos ou números de telefone; nada é enviado a servidor.

Veja [REAL_CALL_EVENT_TRIGGER_V11171.md](./REAL_CALL_EVENT_TRIGGER_V11171.md).

## Proteção nativa contra chamadas suspeitas (V111.69)

A versão **SwiftUI instalada e assinada** inclui uma extensão Call Directory do CallKit. Pela tela do escudo, o usuário pode marcar números específicos como suspeitos, ativar a extensão nos Ajustes do iPhone e solicitar a atualização da lista local. A extensão **não bloqueia chamadas**, não intercepta áudio e não classifica números desconhecidos automaticamente.

**A V111.68 remove o aviso de suspeita dentro da chamada simulada do Modo Livre iOS.** A identificação de uma chamada REAL é exibida pelo aplicativo Telefone do iPhone apenas para números específicos cadastrados e carregados na extensão.

Na tela nativa do escudo, o usuário também pode pedir permissão de notificações e agendar um **aviso de demonstração** para a tela do iPhone fora do Educa+. Esse aviso é claramente identificado como teste, não é acionado por chamadas e não significa que o aplicativo consegue observar todas as ligações. A autorização de notificações é independente da ativação da extensão Call Directory.

**Novo na V111.69:** o painel do escudo explica como ativar a **triagem automática de números não salvos no iOS 26**, usando o ajuste nativo `Ajustes → Apps → Telefone → Filtrar Números Desconhecidos → Perguntar Motivo da Ligação`. Esta função do sistema pergunta quem está ligando e por quê antes de tocar, sem depender de um alerta do Educa+. O painel mostra a mensagem educativa **“Educa+ Digital — Atenção. Número desconhecido. Tenha cuidado com possíveis tentativas de golpe. Nunca compartilhe senhas ou códigos.”** e a reproduz numa notificação local **SIMULAÇÃO** quando solicitada explicitamente.

**Limite técnico:** apps de terceiros não recebem evento/número para cada chamada celular não salva. A permissão de notificações não detecta ligações e o aviso educativo personalizado do Educa+ não aparece automaticamente a cada chamada real. A proteção automática dos números não salvos depende de configurar a triagem da Apple pelo usuário, e a identificação individual do Educa+ continua limitada aos números cadastrados previamente. Nenhuma mudança Android, Web, Workers, D1 ou IA.

Veja [PROTECAO_CHAMADAS_V11169.md](./PROTECAO_CHAMADAS_V11169.md), o [guia V111.68](./PROTECAO_CHAMADAS_V11168.md) e o [registro histórico V111.67](./PROTECAO_CHAMADAS_V11167.md) para configuração App Groups, assinatura, testes físicos, privacidade e limitações. A instalação via Safari/PWA **não** permite extensões CallKit — é necessário o app iOS nativo assinado.

## Atualização automática via TestFlight (preparada)

O pipeline [`ios-testflight.yml`](../.github/workflows/ios-testflight.yml) está pronto para assinar o app **e a extensão CallKit** usando certificados/perfis Apple armazenados exclusivamente em GitHub Actions Secrets e enviar novas versões nativas ao App Store Connect/TestFlight. A primeira configuração da conta Apple Developer e dos oito secrets é obrigatória, assim como cadastrar um grupo de testadores no App Store Connect. Enquanto faltarem credenciais, a etapa de publicação é ignorada e o workflow explica o que está pendente.

Depois de configurado, pushes iOS na `main` disparam o upload automaticamente. A pessoa ativa **Automatic Updates** no TestFlight do iPhone para receber os builds disponibilizados pela Apple. O site Cloudflare carregado pelo WKWebView se atualiza independentemente de um novo IPA.

**[Guia de configuração e instalação TestFlight](./TESTFLIGHT_AUTOUPDATE.md)**. O IPA público `*-unsigned.ipa` continua sendo apenas para testes de compilação e não instala diretamente no iPhone.

## Criar o projeto no Mac

1. Instale Xcode e XcodeGen (`brew install xcodegen`).
2. Na raiz do repositório: `bash ios-app/scripts/preparar-icone.sh`.
3. `xcodegen generate --spec ios-app/project.yml --project ios-app`.
4. Abra `ios-app/EducaDigitalIOS.xcodeproj` no Xcode.
5. Selecione um iPhone conectado, abra **Signing & Capabilities** e associe sua **Personal Team** (conta Apple gratuita). Ajuste o bundle ID se necessário e toque Run. O Xcode fará a assinatura local, sujeita à duração do perfil de desenvolvimento.

## Arquivo IPA gerado na nuvem

A Action **Educa+ Digital iOS nativo V111.59** compila e gera `EducaMaisDigital-iOS-v11159-unsigned.ipa` sem certificado. Esse arquivo é próprio para posterior assinatura; **não é instalável simplesmente tocando no download do Safari**.

Use o Xcode com Apple Account gratuita em um Mac, ou uma ferramenta de assinatura de desenvolvimento (AltStore Classic/Sideloadly), respeitando as regras da Apple. Com conta gratuita, a assinatura normalmente expira em 7 dias. Para instalar em vários iPhones por um link de distribuição é necessário Apple Developer Program com método de entrega válido e assinaturas/notarização.

## App Store

Publicar um WKWebView com o site, isoladamente, não garante aprovação. As [diretrizes 4.2 da Apple](https://developer.apple.com/app-store/review/guidelines/) exigem funcionalidades, conteúdo e interface além de uma mera reformulação do site. O protótipo contém haptics, permissões nativas, estado offline e integração com treinamentos, mas a experiência precisa ser auditada antes da submissão.

## Privacidade e segurança

O aplicativo solicita permissão para microfone e câmera apenas se uma função web do treinamento exigir; as permissões são mediadas pelo iOS. Conteúdos externos nunca recebem essas permissões pelo aplicativo. Os endpoints e contas continuam mantidos na Cloudflare. As simulações de golpes usam dinheiro **fictício**, sem Pix real.
