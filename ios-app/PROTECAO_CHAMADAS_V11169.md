# Educa+ Digital — proteção de números não salvos no iPhone (V111.69)

## O que foi implementado somente no iOS

Ao tocar no **escudo** do aplicativo nativo, a pessoa encontra:
1. Um guia integrado para configurar a **triagem automática de chamadas de números não salvos** do próprio iOS 26.
2. A mensagem educativa solicitada, em texto grande, legível e acessível:
   - **Educa+ Digital — Atenção**
   - **Número desconhecido. Tenha cuidado com possíveis tentativas de golpe. Nunca compartilhe senhas ou códigos.**
3. Permissão opcional para notificações, com um botão para testar a mensagem **fora do app**. A notificação traz o prefixo **SIMULAÇÃO**; nenhuma ligação é detectada por esse teste.
4. A extensão `Call Directory`, já presente, para rotular **números específicos que o usuário cadastrou como suspeitos**, diretamente na interface de chamada da Apple.
5. Link para as [instruções oficiais da Apple](https://support.apple.com/pt-br/111106).

## Como ativar triagem automática de números não salvos (iOS 26)

1. Instale o Educa+ nativo assinado e abra o ícone de escudo.
2. Siga as instruções da seção **Proteger ligações de números não salvos**:
   `Ajustes → Apps → Telefone → Filtrar Números Desconhecidos → Perguntar Motivo da Ligação`.
3. Esta função do iPhone pergunta o nome e o motivo antes de tocar, quando a pessoa não está salva. A escolha `Silenciar` também existe, mas pode silenciar ligações importantes.
4. Volte ao Educa+, ative `Permitir notificações` somente se quiser avisos educativos e toque em `Testar notificação fora do aplicativo`, para conferir a prévia em tela bloqueada/início.
5. Para marcar **números já conhecidos como suspeitos**, habilite `Educa+ Proteção de Chamadas` nas configurações de identificação e cadastre o número no aplicativo.

Em iOS anterior ao 26, o painel informa que a opção `Perguntar Motivo da Ligação` pode não estar disponível e orienta onde encontrar `Silenciar Desconhecidos`, quando suportado.

## O que um aplicativo de terceiros NÃO consegue fazer

Não há API pública que entregue ao Educa+ um evento contendo o número de toda ligação de telefonia celular recebida, nem uma API pública para saber se cada número em tempo real está salvo nos contatos. A autorização de `UserNotifications` **não** dá esse acesso.

Assim, **a mensagem personalizada do Educa+ NÃO é disparada automaticamente por toda ligação não salva**. Isso seria uma promessa falsa. A proteção automática de chamadas não salvas vem da triagem nativa do iOS, que exibe a interface **da Apple**, não a mensagem personalizada do Educa+.

A extensão `Call Directory` funciona por **correspondência exata de números previamente carregados** e não é chamada uma vez por ligação. A outra tecnologia Apple, `Live Caller ID Lookup`, serve para identificar **números conhecidos de uma base de reputação**, exigindo infraestrutura de servidor KPIR/Privacy Pass, relays e validação Apple. Ela não transforma, sozinha, qualquer número não salvo em spam e não foi implementada nesta entrega.

## Privacidade e isolamento

Não foram solicitados contatos, histórico de chamadas, SMS nem microfone de ligações reais. Ninguém recebe rótulo de fraude apenas por não estar salvo. Nenhum bloqueio é aplicado automaticamente. Android, Web, Cloudflare Workers, D1 e motor LIA não foram modificados.

## Testes e distribuição

- `node --test tests/platform-ios-spam-call-v11167.test.js tests/platform-ios-real-notifications-v11168.test.js tests/platform-ios-unknown-screening-v11169.test.js`
- CI XcodeGen: compilar o app e a extensão para iPhone e simulador.
- Compilação sem assinatura é verificável no CI, mas não permite instalar ou testar uma chamada real diretamente no iPhone.
- Teste físico: instalar o app assinado, ativar a triagem nativa e a extensão em Ajustes, fazer uma ligação de um segundo número autorizado, e observar o comportamento do sistema.

## Referências oficiais

- https://support.apple.com/pt-br/111106
- https://support.apple.com/pt-br/guide/iphone/iphe4b3f7823/ios
- https://developer.apple.com/documentation/callkit/identifying-and-blocking-calls
- https://developer.apple.com/documentation/identitylookup/getting-up-to-date-calling-and-blocking-information-for-your-app
- https://developer.apple.com/documentation/uikit/uiapplication/opensettingsurlstring
