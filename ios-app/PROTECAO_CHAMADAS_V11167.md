# Educa+ Digital iOS — Proteção de chamadas V111.67

## Objetivo e resultado real

O **app nativo iOS (SwiftUI)** agora contém um painel de proteção e uma **Call Directory Extension** do CallKit. Após a pessoa instalar um app **assinado**, ativar a extensão nos Ajustes e **marcar manualmente números suspeitos**, o iPhone pode exibir o rótulo:

> Educa+: possível spam (marcado por você)

Isso funciona na **interface de chamada do próprio iOS** quando o número corresponde à lista que o sistema carregou. Não é um pop-up do Educa+ nem uma notificação inventada. A extensão **não intercepta chamadas**, não pode escutar, gravar, analisar o áudio ou consultar a Cloudflare a cada ligação. O aviso pode variar conforme a versão do iOS e as prioridades de identificação de contatos.

**Importante: desconhecido não significa spam.** O sistema não classifica automaticamente todos os desconhecidos e não possui neste momento uma base externa de números fraudulentos verificados. Uma lista vazia não identifica ninguém. Não há bloqueio automático.

## As duas experiências

1. **Ligação de treinamento dentro do Educa+ iOS:** `CloudflareTrainingWebView.swift` injeta um aviso discreto e com acessibilidade quando a tela `#freeCallView` está ativa e o chamador simulado aparece como desconhecido. A mensagem é **educativa**: `Possível spam — número não identificado`. Esse aviso aparece apenas no app Swift nativo do iPhone, não no Safari/PWA, Android ou Web.
2. **Ligação telefônica real:** extensão `CallerIDExtension/CallDirectoryProvider.swift` lê números **marcados pela própria pessoa** e os envia ao CallKit para identificação futura, com controle explícito do usuário.

## Como ativar no iPhone real

1. **Instale a compilação nativa assinada** do Educa+ Digital V111.67, com a extensão `com.educamaisdigital.educa.callerid` incluída e App Group configurado nos perfis de assinatura de **ambos** os targets. Um IPA não assinado não pode ser instalado diretamente pelo Safari.
2. Abra o aplicativo e toque no ícone azul de **escudo** no topo direito.
3. Toque em **Abrir identificação de chamadas nos Ajustes**. Se precisar, acesse manualmente `Ajustes → Apps → Telefone → Bloqueio e Identificação de Chamadas` (a organização pode mudar conforme o iOS). Ative **Educa+ Proteção de Chamadas**.
4. Volte ao Educa+, adicione um **número que você já identificou como suspeito** com DDD ou no formato internacional `+código...`. Se desejar, remova depois com **Excluir**.
5. Toque em **Recarregar lista** e verifique o status. Números serão identificados apenas quando o iOS concluir o carregamento e houver correspondência exata na ligação recebida.

O aplicativo não solicita acesso a contatos, histórico do Telefone, SMS, microfone de chamadas reais ou ligações da operadora; nenhuma lista é enviada à Cloudflare. Para mudar de aparelho e conservar a lista, seria preciso implementar um método de backup com consentimento (não incluído).

## Arquitetura e arquivos (somente iOS)

| Arquivo | Responsabilidade |
| --- | --- |
| `ios-app/project.yml` | Targets `EducaDigital` e `CallerIDExtension`, App Group, versão V111.67 e embed de `.appex` |
| `ios-app/EducaDigital/EducaDigitalApp.swift` | Ícone de escudo no app e abertura do painel nativo |
| `ios-app/EducaDigital/CallProtectionView.swift` | Ativar/consultar CallKit, adicionar/remover número, recarregar identificação |
| `ios-app/Shared/SpamNumberStore.swift` | Normalização E.164, lista privada, snapshot e sincronização App Group |
| `ios-app/CallerIDExtension/CallDirectoryProvider.swift` | Envio incremental/completo da lista ao iOS, sem requests ou bloqueios |
| `ios-app/EducaDigital/CloudflareTrainingWebView.swift` | Aviso de possível spam apenas nas ligações **simuladas** do iPhone |
| `tests/platform-ios-spam-call-v11167.test.js` | Testes de integridade, classificação e separação de plataformas |

O `entitlements` gerado pelo XcodeGen usa o App Group `group.com.educamaisdigital.educa`; na conta Apple usada para distribuir, confirme que esse identificador existe e foi autorizado para os targets. Sem assinatura que contenha o App Group, o armazenamento compartilhado ou a própria instalação podem falhar.

## Compilação na nuvem

O workflow iOS existente faz `xcodegen generate` e compila com `CODE_SIGNING_ALLOWED=NO`. Isso permite validar Swift e montar um IPA **sem assinatura**, mas **não valida a identificação de uma chamada telefônica de verdade**. O workflow ainda usa o nome histórico `v11159-ios-native-beta` para seus artefatos; confira a versão interna `111.67` nos Info.plists. A distribuição nativa assinada requer uma conta/provisionamento Apple com capacidades apropriadas.

Teste num iPhone real com um número **sob seu controle** cadastrado na lista; ligue a partir desse número e confira o nome mostrado. Remova a marcação depois. Não teste chamando terceiros sem consentimento.

## Pesquisa (fontes Apple)

- [Identifying and blocking calls — Call Directory](https://developer.apple.com/documentation/callkit/identifying-and-blocking-calls)
- [CXCallDirectoryManager — status, recarregar, abrir Ajustes](https://developer.apple.com/documentation/callkit/cxcalldirectorymanager)
- [CXCallDirectoryExtensionContext — atualização completa e incremental](https://developer.apple.com/documentation/callkit/cxcalldirectoryextensioncontext)
- [Configuring App Groups](https://developer.apple.com/documentation/xcode/configuring-app-groups)
- [Live Caller ID Lookup e privacidade](https://developer.apple.com/documentation/identitylookup/understanding-how-live-caller-id-lookup-preserves-privacy)
- [Apple Support — Filtre e bloqueie ligações no iPhone](https://support.apple.com/pt-br/guide/iphone/iphe4b3f7823/ios)

### Futuro: identificação de spam na nuvem

É possível evoluir com uma base de **números de spam verificados**, com origem, data de última revisão, correção de falsos positivos e opt-in. A `Call Directory` exige baixar a base antes da chamada; não faz consulta ao servidor em tempo real por ligação. Para consultas privadas e em tempo real, o recurso **Live Caller ID Lookup** exige infraestrutura específica de Private Information Retrieval (PIR), Private Access/Privacy Pass, relay Apple e validação de endpoints. Isso **não** foi prometido ou implementado nesta V111.67.
