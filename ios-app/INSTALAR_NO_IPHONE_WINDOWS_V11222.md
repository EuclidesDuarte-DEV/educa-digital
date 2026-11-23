# Instalar o Educa+ Digital V112.22 no iPhone usando Windows

Este é o **app iOS nativo** do Educa+ Digital (SwiftUI + WKWebView), não um print ou uma simulação de instalação. A Home é a mesma da Web e os exercícios continuam hospedados na Cloudflare.

## Qual arquivo escolher?

- **IPA pessoal (recomendado para instalar no seu próprio iPhone):** [V112.22 iOS Pessoal](https://github.com/EuclidesDuarte-DEV/educa-digital/releases/tag/v11222-ios-pessoal) → baixar `EducaMaisDigital-iOS-v11222-Pessoal-SEM-ASSINATURA.ipa`.
- **IPA original para desenvolvimento e distribuição formal:** [V112.22 iOS nativo](https://github.com/EuclidesDuarte-DEV/educa-digital/releases/tag/v11222-ios-native-beta). Inclui extensão Call Directory e App Groups e pode exigir capacidades adicionais de assinatura.

**Importante:** nenhum arquivo acima está assinado pela Apple. Baixar um arquivo IPA pelo Safari **não instala o app**. A versão pessoal foi criada **sem a proteção nativa de chamadas e sem o antigo botão flutuante**, para facilitar assinatura gratuita. O protótipo continua com as atividades de segurança digital, WhatsApp, SMS, Gmail, Fotos, YouTube, Maps, Agenda, LIA e simulações de ligações.

## Instalar pelo Windows e cabo USB

1. No PC Windows, baixe a **IPA pessoal** no release acima, e instale o [Sideloadly oficial](https://sideloadly.io/).
2. Instale os componentes de conexão do iPhone exigidos pelo Sideloadly (por exemplo, suporte para dispositivo Apple/Bonjour se solicitado). Evite sites terceiros e não envie suas credenciais em chats ou repositórios.
3. Desbloqueie o iPhone, conecte ao PC via USB e toque **Confiar neste computador** se o iPhone perguntar.
4. Abra o Sideloadly. Na área **iDevice**, confirme que ele reconheceu o iPhone.
5. Arraste a IPA pessoal para o Sideloadly. Selecione o modo de assinatura com **sua própria Conta Apple** no aplicativo; siga os avisos de autenticação e as solicitações do próprio programa. A conta deve estar sob seu controle.
6. Inicie a instalação e aguarde a confirmação do **Sideloadly**. Se o iPhone solicitar **Modo de Desenvolvedor**, vá em **Ajustes → Privacidade e Segurança → Modo de Desenvolvedor**, habilite e siga a reinicialização solicitada pelo sistema. Se aparecer confiança no perfil, siga as instruções exibidas pelo iOS em **Ajustes → Geral → VPN e Gerenciamento de Dispositivo**, conforme a versão.
7. Abra o ícone **Educa+ Digital** no iPhone e teste: página inicial, Começar treinamento, Banco, YouTube, Fotos, Gmail, SMS, Maps, Agenda e retorno.
8. Para evitar que a assinatura expire, configure o **automatic refresh** do Sideloadly e mantenha o computador disponível quando necessário.

## Condições e limitações

- **Conta Apple gratuita:** os perfis de provisionamento normalmente expiram após **7 dias**; assine novamente antes do prazo. Fonte oficial: [Apple Developer — tipos de contas](https://developer.apple.com/br/help/account/basics/about-your-developer-account/).
- A instalação pessoal é uma assinatura **local e específica do aparelho**, não distribuição via App Store ou TestFlight. O Educa+ não tem acesso à sua Conta Apple por meio do site, repositório ou ChatGPT.
- A edição pessoal **não inclui a extensão nativa de identificação de chamadas** nem consegue detectar ligações reais. Os treinos de chamadas suspeitas continuam **simulações**.
- IA, áudio e outros conteúdos podem precisar de internet e de permissões solicitadas pelo iOS. O iPhone precisa ser compatível com o alvo do app (**iOS 16.4 ou posterior**).
- Se a instalação falhar por limite de apps/IDs ou assinatura, verifique o registro exibido no Sideloadly. **Não exponha tokens, senhas, certificados ou dados da sua Conta Apple.**
- Documentação da ferramenta: [Sideloadly — FAQ](https://sideloadly.io/faq).

## Sem computador: versão Web instalável no iPhone

Se você só tiver o iPhone em mãos, abra no **Safari**:
https://educa-digital.educamaisdigital.workers.dev/html/?experience=web

Toque em **Compartilhar → Adicionar à Tela de Início → Adicionar** (ou **Abrir como App da Web**, quando oferecido). Essa instalação é gratuita e não exige assinatura semanal, mas **é um aplicativo Web**, não o binário SwiftUI nativo.

## Distribuição futura via TestFlight

O workflow `.github/workflows/ios-testflight.yml` está preparado. Para disponibilizar builds nativos automaticamente a testadores, o titular precisa configurar assinatura Apple, App Store Connect e seus segredos no GitHub Actions. **Não coloque chaves ou certificados em commits ou no chat.** A falta dessas credenciais mantém o TestFlight desativado — não é erro de compilação.

