# Educa+ Digital — acionador proprio de atividade de chamada (V111.71)

## O que agora existe

A versao nativa do Educa+ iOS inclui um monitor opcional de eventos de chamadas reais, `RealCallEventBridge.swift`, usando a API publica Apple `CXCallObserver`. Ela pode receber mudanças de estado de chamadas do iPhone **se o processo do Educa+ estiver em execucao**.

Quando o usuario abre o Educa+ nativo, toca no escudo, permite notificacoes e ativa **Avisar sobre atividade de ligação no iPhone**, o aplicativo registra o observador. Se uma chamada for observada como **recebida e ainda nao atendida**, ele tenta postar uma notificacao local (uma por UUID de chamada):

> Educa+ Digital — Atenção
>
> Ligação recebida. Se o número for desconhecido, tenha cuidado com possíveis tentativas de golpe. Nunca compartilhe senhas ou códigos.

Esse evento corresponde a uma **mudanca real de estado de chamada**, nao uma ligacao inventada nem um aviso programado por tempo. A entrega do banner permanece sujeita ao sistema iOS.

## Limites tecnicos e privacidade

- `CXCallObserver` informa `uuid`, `isOutgoing`, `hasConnected`, `hasEnded` e `isOnHold`. **Nao disponibiliza numero do chamador nem informa se ele esta salvo nos contatos.** O texto usa "Se o número for desconhecido", jamais afirma que verificou ser desconhecido.
- O observador opera **somente quando a aplicacao esta em execucao**. O iOS pode suspender o app ao abrir a tela de chamada, inclusive antes de entregar o evento. Nao e gatilho garantido com app encerrado, tela bloqueada ou em background, nem garante a exibicao da notificacao durante o toque.
- A permissao `UserNotifications` e exigida para exibir banners. Ativar a preferencia do observador e independente de `Call Directory`. Uma notificacao local nao e uma substituta da tela nativa de chamada.
- Nao coleta numeros, contatos, audio, SMS, historico de ligacoes, nem envia dados a Cloudflare; a opcao fica salva em `UserDefaults`. Usa apenas UUID efemero em memoria para evitar avisos duplicados.
- A extensao Call Directory ja existente continua identificando **somente numeros previamente cadastrados** pelo usuario, conforme os perfis App Group e permissao em Ajustes.
- **Nao funciona no PWA/Safari.** A App Store/Apple exige assinatura para app nativo, mesmo com instalacao manual por conta gratuita. A alternativa sem app nativo e usar a triagem automatica de numeros desconhecidos do proprio iOS.

## Como testar

1. Instale uma compilacao nativa **assinada** da V111.71, com `CallerIDExtension` e App Group provisionados corretamente.
2. Abra Educa+, toque no icone de escudo, autorize notificacoes e ative **Avisar sobre atividade de ligação no iPhone**.
3. Mantenha o aplicativo **em execucao**. De outro aparelho/linha autorizada, ligue para o iPhone.
4. O Educa+ tenta solicitar a notificacao local quando recebe o evento de chamada recebida ainda nao atendida. O banner pode nao aparecer: a tela da chamada tem prioridade e o sistema pode suspender o app. Verifique o Centro de Notificacoes quando possivel.
5. Repita sem abrir o aplicativo: **nao e esperado** que o Educa+ receba o evento enquanto estiver encerrado.
6. Desative o botao no escudo para remover o observador e interromper tentativas.

Este recurso precisa ser **validado fisicamente com uma chamada real**. O build de simulador ou o teste estrutural CI nao garantem funcionamento em iPhones reais.

## Referencias Apple

- https://developer.apple.com/documentation/callkit/cxcallobserver
- https://developer.apple.com/documentation/callkit/cxcall
- https://developer.apple.com/documentation/callkit/identifying-and-blocking-calls
- https://developer.apple.com/documentation/usernotifications/asking-permission-to-use-notifications
