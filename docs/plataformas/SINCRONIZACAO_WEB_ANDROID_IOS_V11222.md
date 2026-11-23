# V112.22 — Sincronização Web → Android e iOS (22/11/2026)

## Diagnóstico no código real
- O site (`/html/`) já tinha **Home Educativa**: logo Educa+, hero "Aprenda no seu ritmo. Pratique com segurança", ação começar/continuar, guia de pré-teste do Banco, acessibilidade e o telefone de treino **abaixo**.
- O APK e o shell iOS abriam `/?app=1&platform=...`; a classe `educa-mobile-app` escondia o cabeçalho, a apresentação, o pré-teste e a moldura para mostrar **somente o telefone em tela inteira**.
- A maioria das melhorias visuais de 2026 foi aplicada somente sob `html[data-educa-platform="web"]`; abrir o mesmo servidor sem esse seletor não bastava para replicar as melhorias.
- No iOS, ainda havia dois controles nativos/semi-nativos para proteção de chamadas: um botão SwiftUI sobre o WebView e outro botão PWA criado por `channels/ios/overrides.js`. O usuário pediu sua retirada.
- No Android, `WebChromeClient` não implementava `onShowFileChooser`, deixando o botão de adicionar Fotos sem um seletor de imagens confiável no APK.

## Implementação
1. **Uma única apresentação compartilhada:** Android e iOS nativos abrem `/html/?app=1&platform=android|ios&experience=web`. A Home é a mesma da Web, com rolagem da página e a moldura do celular.
2. **PWA instalado:** o manifest inicia `/html/?experience=web`; o identificador do PWA permanece `/?app=1` para não trocar a identidade da instalação. O parâmetro `experience=web` impede o modo imersivo legado, sem impedir o uso dele em outros fluxos antigos.
3. **Canais distintos:** `EducaReleaseChannel.platform` continua `android` ou `ios`, e `data-educa-native-platform` informa o canal físico. Apenas a **renderização** usa `data-educa-platform=web` para reaproveitar o design e a lógica Web. A rota nunca concede permissões de câmera/áudio por parâmetro de URL.
3a. **Camada Web completa:** a rota de paridade também carrega `/static/channels/web/overrides.css` e `.js` (ícones do design system, acessibilidade, trilhas, gamificação, feedback e diálogos), além dos arquivos Web V112.09–21. Isso é necessário porque a Web possuía implementações que não estavam em `index.html` diretamente.
4. **Android:** remove a experiência escura de tela inteira, usa barras claras, desativa escurecimento automático e implementa seletor de imagens por escolha voluntária. Câmera/microfone continuam sujeitos a permissões explícitas do sistema e origem HTTPS oficial.
5. **iOS:** remove a camada SwiftUI e o botão iOS PWA de chamadas que flutuavam sobre o treinamento; mostra Home clara e respeita área segura do sistema. A extensão Call Directory, quando previamente ativada pelo usuário, continua **independente**. Não observa automaticamente todas as chamadas nem tem acesso livre a números desconhecidos.
6. **Versões:** APK Android e projeto SwiftUI/iOS V112.22, com novos números de build e artefatos. Cloudflare continua compartilhada para IA/LIA, banco e treinamento.

## Matriz das funcionalidades compartilhadas
| Área | Web V112.21 | Android V112.22 | iOS V112.22 |
|---|---|---|---|
| Home + pré-teste e destaque Banco | Sim | Mesmo HTML | Mesmo HTML |
| Trilhas, progresso, login por número e acessibilidade | Sim | Mesmo HTML/JS | Mesmo HTML/JS |
| Modo Livre — WhatsApp, SMS, ligação e vídeo fictícios | Sim | Fluxo Web | Fluxo Web |
| LIA e IA/voz hospedadas | Servidor Cloudflare | Mesmo servidor | Mesmo servidor |
| Fotos locais (inclusão voluntária) | Seletor do navegador | Novo seletor WebChromeClient | Seletor WKWebView |
| Gmail e mensagens fictícias em modo claro | V112.16–21 | UI Web | UI Web |
| YouTube, Maps, Agenda simulados | V112.19–21 | UI Web | UI Web |
| Busca + filtros juntos e listas com rolagem própria | V112.21 | UI Web | UI Web |
| Recuperação de toques perdidos | V112.20 | UI Web | UI Web |
| Identificação de chamadas reais | Não | Não | Somente Call Directory opcional, com limites iOS |

> As simulações não acessam suas contas reais de Gmail, YouTube, Maps, WhatsApp ou SMS; não fazem Pix real e não têm GPS sem autorização. As fotos só são adicionadas por escolha explícita.

## Pesquisa técnica: documentação oficial
- **Apple WKWebView / WebKit**: a WebView é apropriada para conteúdo Web embutido; a navegação, permissões e área segura devem ser controladas pelo aplicativo. Fonte: https://developer.apple.com/documentation/webkit/wkwebview
- **Apple Human Interface Guidelines — Web Views**: comportamento de navegação não é automático; respeitar interações e controles. Fonte: https://developer.apple.com/design/human-interface-guidelines/web-views
- **Apple CallKit — identificar e bloquear**: identificação se dá por `CXCallDirectoryProvider` e requer ativação da extensão; não é interceptação irrestrita de chamadas. Fonte: https://developer.apple.com/documentation/callkit/identifying-and-blocking-calls
- **Apple App Review Guidelines §4.2**: publicação na App Store demanda funcionalidade e valor além de um site simplesmente reembalado; o aplicativo deve preservar acessibilidade e recursos adicionais. Fonte: https://developer.apple.com/app-store/review/guidelines/
- **Android WebView / WebSettings**: habilitar JavaScript somente no domínio permitido, cuidado com interfaces de JS, origem HTTPS e permissões. Fonte: https://developer.android.com/develop/ui/views/layout/webapps/webview
- **Android FileChooserParams**: `WebChromeClient.onShowFileChooser` usa retorno `ValueCallback<Uri[]>`; limitar tipo e exigir ação explícita. Fonte: https://developer.android.com/reference/android/webkit/WebChromeClient.FileChooserParams
- **Android WebView e WindowInsets**: respeitar entalhes, teclado e barras do sistema; não consumir ou adicionar duas vezes os insets. Fonte: https://developer.android.com/develop/ui/views/layout/webapps/understand-window-insets
- **Android edge-to-edge (SDK 35+)**: em Android 15 e posterior, não esconder interações atrás das barras de sistema. Fonte: https://developer.android.com/develop/ui/views/layout/edge-to-edge

## Distribuição e limitações de validação
- O merge pode publicar os **arquivos Web** no domínio oficial pela Cloudflare, mas um aplicativo nativo instalado precisa de **novo binário** para adotar a nova rota e remover o botão SwiftUI.
- O APK no GitHub Actions é de **teste com assinatura de depuração**, não Google Play. Pode ser necessário desinstalar a versão anterior se a assinatura for diferente.
- O arquivo IPA fornecido pelo CI iOS é **não assinado**: não instala diretamente no iPhone. TestFlight exige certificados e App Store Connect configurados pelo titular. O workflow de TestFlight deve verificar segredos antes de tentar envio.
- Os testes de WebKit/Chromium, Gradle e Xcode validam código e navegação; a verificação final de toque, safe areas, acessibilidade, câmera, fotos, voz e notificações deve ser feita em aparelhos físicos.
- Web e nativos compartilham HTML/CSS/JS no mesmo backend; por isso **futuras alterações da camada compartilhada podem aparecer nos três canais**, a menos que sejam isoladas explicitamente. Código de permissões e binários continuará segregado.
