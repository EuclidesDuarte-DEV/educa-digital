# Educa+ Digital iOS nativo — V111.67

Aplicativo **SwiftUI + WebKit** para iPhone, com código-fonte próprio em Swift e acesso ao mesmo backend Cloudflare usado na web e Android.

## Recursos

- Inicializa em `https://educa-digital.educamaisdigital.workers.dev/?app=1&platform=ios`, com a tela do simulador sem a moldura de celular.
- Mantém login, progresso e sessões com `WKWebsiteDataStore.default()`.
- Continua usando **Cloudflare Workers AI / Gemma 4** e a síntese **Kokoro pf_dora** no navegador (onde suportada).
- WebView nativo permite vídeos inline, usa prompts de permissões do iOS e bloqueia navegação principal para origens desconhecidas. Links externos abrem o Safari.
- Feedback tátil nativo para botões do treinamento, tela de reconexão quando o endereço oficial está indisponível.
- Não há chaves, tokens, secrets, certificados, armazenamento de senhas ou pagamentos reais no código.
- O app requer internet para a IA, não é uma LIA neural offline.

## Proteção nativa contra chamadas suspeitas (V111.67)

A versão **SwiftUI instalada e assinada** inclui uma extensão Call Directory do CallKit. Pela tela do escudo, o usuário pode marcar números específicos como suspeitos, ativar a extensão nos Ajustes do iPhone e solicitar a atualização da lista local. A extensão **não bloqueia chamadas**, não intercepta áudio e não classifica números desconhecidos automaticamente.

Chamadas fictícias do **Modo Livre iOS** mostram aviso de atenção quando o personagem aparece como número desconhecido. Essa simulação não é um detector real de spam.

Veja [PROTECAO_CHAMADAS_V11167.md](./PROTECAO_CHAMADAS_V11167.md) para configuração App Groups, assinatura, testes físicos, privacidade e limitações. A instalação via Safari/PWA **não** permite extensões CallKit — é necessário o app iOS nativo assinado.

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
