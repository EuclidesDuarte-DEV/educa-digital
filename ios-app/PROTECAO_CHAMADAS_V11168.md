# Educa+ Digital iOS — V111.68: alertas fora do protótipo

## Objetivo

A identificação das chamadas telefônicas reais deve aparecer **na tela de ligação do próprio iPhone**, inclusive quando o Educa+ Digital estiver fechado. Ela **não** aparece dentro do celular simulado do Modo Livre.

A V111.68 mantém a extensão nativa de identificação da V111.67, remove a etiqueta de spam inserida pelo WKWebView nas ligações fictícias e acrescenta um painel nativo para solicitar permissão de notificações e testar um **aviso de demonstração** fora do aplicativo.

## Duas permissões diferentes

| Recurso | O que faz | O que não faz |
| --- | --- | --- |
| Notificações (UserNotifications) | Permite que o Educa+ exiba avisos educativos na tela inicial/tela bloqueada, quando autorizados | **Não** revela chamadas celulares recebidas; não oferece um gatilho por ligação |
| Identificação de chamadas (CallKit / Call Directory) | Exibe o rótulo “Educa+: possível spam (marcado por você)” na interface do Telefone para números que a pessoa cadastrou e o iOS carregou | **Não** marca automaticamente todos os números não salvos |

Autorizar notificações **não** substitui habilitar Call Directory, e ativar Call Directory **não** exige autorizar notificações. Não há push/APNs, servidor de reputação, análise de áudio, acesso a contatos ou leitura de histórico de ligações.

Um número desconhecido não é necessariamente fraudulento. Não é correto exibir “golpe” sem evidências. Para identificação de números por reputação em tempo real, seria necessário cadastrar um serviço de Live Caller ID Lookup, infraestrutura PIR/relay e aprovação/validação exigida pela Apple — fora desta versão.

## Como ativar no iPhone

1. Instale o **app nativo iOS assinado** com o target CallerIDExtension e App Group `group.com.educamaisdigital.educa` devidamente provisionados. Instalar o site pela tela de início (PWA/Safari) não habilita CallKit.
2. Abra o Educa+ e toque no **escudo azul**.
3. Em **Notificações no iPhone real**, toque em **Permitir notificações**. O próprio iOS exibirá o diálogo de autorização. Se a permissão já foi negada, toque em **Abrir Ajustes de notificações** para alterar manualmente.
4. Para comprovar que os avisos educativos podem aparecer **fora** do app, toque em **Testar notificação fora do aplicativo** e vá à tela de início ou bloqueie o celular. O aviso será agendado para aproximadamente 8 segundos e terá título **“Educa+ — aviso de demonstração”**. Sua entrega depende dos Ajustes, foco e comportamento do iOS. **Isso não é um alerta de chamada real.**
5. Em **Identificação de chamadas reais**, toque em **Abrir identificação de chamadas nos Ajustes**. Ative **Educa+ Proteção de Chamadas** em Ajustes → Apps → Telefone → Bloqueio e Identificação de Chamadas (nome/caminho podem variar).
6. Cadastre um número que você mesmo verificou ser suspeito (com DDD), toque em **Adicionar à lista** e depois em **Recarregar lista**. A exibição depende da extensão habilitada e do carregamento concluído.
7. Para testar a extensão, faça uma chamada **com um segundo número seu ou autorizado** que esteja na lista. O rótulo é apresentado pelo sistema Telefone do iOS, não por uma notificação programada pelo Educa+.

## Sobre números ainda não cadastrados

Sem uma base de reputação e sem a extensão Live Caller ID Lookup aprovada e operacional, um número que não está em seus contatos **não pode ser marcado automaticamente como suspeito pelo Educa+**. O iOS não fornece ao aplicativo comum o número de cada ligação celular em andamento, mesmo com permissão de notificações. Os recursos próprios do iPhone para silenciar/filtrar desconhecidos estão nas configurações do Telefone, quando disponíveis.

A V111.68 não adiciona proteção a Android ou à versão Web, nem altera o Worker oficial, o banco D1 ou a IA.

## Teste e entrega

- Testes estruturais: `node --test tests/platform-ios-spam-call-v11167.test.js tests/platform-ios-real-notifications-v11168.test.js`
- Build iOS no CI: compilar target do aplicativo e extensão via XcodeGen sem assinatura. **Build bem-sucedido não substitui teste com chamada real.**
- Entrega ao usuário: aplicativo iOS **assinado**, extensão ativada, permissão de notificações opcional para alertas educativos.
- Resultado das chamadas reais: permanece pendente de validação em iPhone físico após distribuição assinada.

### Fontes Apple

- https://developer.apple.com/documentation/usernotifications/asking-permission-to-use-notifications
- https://developer.apple.com/documentation/callkit/identifying-and-blocking-calls
- https://developer.apple.com/documentation/identitylookup/getting-up-to-date-calling-and-blocking-information-for-your-app
