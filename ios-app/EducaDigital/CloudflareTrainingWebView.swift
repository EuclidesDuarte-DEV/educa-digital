import SwiftUI
import UIKit
import WebKit

/// App iOS V111.59. A Cloudflare continua sendo a fonte única de conteúdo,
/// conta, IA Gemma, voz Kokoro e simulações educativas, sem segredos no app.
struct CloudflareTrainingWebView: UIViewRepresentable {
    @ObservedObject var state: TrainingState

    static let officialHost = "educa-digital.educamaisdigital.workers.dev"
    static let startURL = URL(string: "https://educa-digital.educamaisdigital.workers.dev/?app=1&platform=ios")!

    func makeCoordinator() -> Coordinator {
        Coordinator(state: state)
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.defaultWebpagePreferences.allowsContentJavaScript = true
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let bridge = """
        (function() {
          if (location.host !== 'educa-digital.educamaisdigital.workers.dev') return;
          window.EducaIOS = Object.freeze({
            haptic: function(style) {
              window.webkit.messageHandlers.educaIOS.postMessage({
                action:'haptic', style: typeof style === 'string' ? style : 'light'
              });
            },
            shareApp: function() {
              window.webkit.messageHandlers.educaIOS.postMessage({action:'share'});
            }
          });
          document.addEventListener('click', function(event) {
            if (event.target && event.target.closest('button,[role="button"]')) {
              window.EducaIOS.haptic('light');
            }
          }, {capture:true, passive:true});
        })();
        """
        config.userContentController.addUserScript(WKUserScript(
            source: bridge,
            injectionTime: .atDocumentEnd,
            forMainFrameOnly: true
        ))
        // Somente WKWebView iOS: alerta educativo ao receber ligação
        // desconhecida na simulação. Não intercepta chamadas telefônicas reais.
        let simulatedCallerWarning = """
        (function() {
          if (location.host !== 'educa-digital.educamaisdigital.workers.dev') return;
          function update() {
            const screen = document.getElementById('freeCallView');
            const name = document.getElementById('freeCallName');
            const state = document.getElementById('freeCallLine');
            if (!screen || !name || !state) return;
            let badge = document.getElementById('educa-ios-training-caller-warning');
            if (!badge) {
              badge = document.createElement('div');
              badge.id = 'educa-ios-training-caller-warning';
              badge.setAttribute('role','status');
              badge.setAttribute('aria-live','polite');
              badge.style.cssText = 'display:none;margin:12px 16px 8px;padding:12px 14px;border:1px solid #fbbf24;border-radius:13px;background:#fffbeb;color:#78350f;font:700 15px/1.5 -apple-system,BlinkMacSystemFont,sans-serif;overflow-wrap:anywhere;text-align:center;';
              state.insertAdjacentElement('afterend', badge);
            }
            const unknown = /desconhecid|unknown|não identificad/i.test(name.textContent || '');
            const active = screen.classList.contains('is-active');
            badge.style.display = active && unknown ? 'block' : 'none';
            const warning = '⚠️ Possível spam — número não identificado. No treino, não compartilhe códigos, senhas ou faça Pix sem verificar.';
            if (badge.textContent !== warning) badge.textContent = warning;
          }
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', start, {once:true});
          } else start();
          function start() {
            update();
            const root = document.getElementById('phoneScreen');
            if (!root) return;
            new MutationObserver(update).observe(root, {
              attributes:true, attributeFilter:['class'], childList:true,
              characterData:true, subtree:true
            });
          }
        })();
        """
        config.userContentController.addUserScript(WKUserScript(
            source: simulatedCallerWarning,
            injectionTime: .atDocumentEnd,
            forMainFrameOnly: true
        ))
        config.userContentController.add(context.coordinator, name: "educaIOS")

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.backgroundColor = UIColor(red: 0.045, green: 0.082, blue: 0.145, alpha: 1)
        webView.isOpaque = false
        webView.scrollView.backgroundColor = webView.backgroundColor
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.allowsBackForwardNavigationGestures = true
        context.coordinator.webView = webView

        webView.load(URLRequest(url: Self.startURL, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 25))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        guard context.coordinator.lastRetryVersion != state.retryVersion else { return }
        context.coordinator.lastRetryVersion = state.retryVersion
        webView.load(URLRequest(url: Self.startURL, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 25))
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
        private let state: TrainingState
        weak var webView: WKWebView?
        var lastRetryVersion = 0

        init(state: TrainingState) {
            self.state = state
        }

        private func isTrusted(_ url: URL?) -> Bool {
            guard let url else { return false }
            return url.scheme == "https"
                && url.host?.lowercased() == CloudflareTrainingWebView.officialHost
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            // O site web pode baixar fontes/modelos HTTPS, mas somente a
            // Cloudflare oficial navega no quadro principal do aplicativo.
            guard navigationAction.targetFrame?.isMainFrame == true else {
                if navigationAction.targetFrame == nil,
                   let url = navigationAction.request.url,
                   url.scheme == "https" {
                    UIApplication.shared.open(url)
                }
                decisionHandler(.cancel)
                return
            }
            guard isTrusted(navigationAction.request.url) else {
                if let url = navigationAction.request.url,
                   ["https", "mailto", "tel"].contains(url.scheme ?? "") {
                    UIApplication.shared.open(url)
                }
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            DispatchQueue.main.async { self.state.isOffline = false }
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            displayOffline(error)
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            displayOffline(error)
        }

        private func displayOffline(_ error: Error) {
            if (error as NSError).code == NSURLErrorCancelled { return }
            DispatchQueue.main.async { self.state.isOffline = true }
        }

        // O sistema iOS sempre solicita permissão antes do primeiro acesso
        // à câmera/microfone. Nunca conceder silenciosamente, nem a terceiros.
        func webView(
            _ webView: WKWebView,
            requestMediaCapturePermissionFor origin: WKSecurityOrigin,
            initiatedByFrame frame: WKFrameInfo,
            type: WKMediaCaptureType,
            decisionHandler: @escaping (WKPermissionDecision) -> Void
        ) {
            let trusted = origin.protocol == "https"
                && origin.host.lowercased() == CloudflareTrainingWebView.officialHost
            decisionHandler(trusted ? .prompt : .deny)
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            let origin = message.frameInfo.securityOrigin
            guard origin.protocol == "https",
                  origin.host.lowercased() == CloudflareTrainingWebView.officialHost,
                  let body = message.body as? [String: Any],
                  let action = body["action"] as? String else { return }

            switch action {
            case "haptic":
                let style = body["style"] as? String ?? "light"
                let impact: UIImpactFeedbackGenerator.FeedbackStyle = style == "heavy" ? .heavy : .light
                UIImpactFeedbackGenerator(style: impact).impactOccurred()
            case "share":
                let controller = UIActivityViewController(
                    activityItems: [CloudflareTrainingWebView.startURL],
                    applicationActivities: nil
                )
                if let popover = controller.popoverPresentationController {
                    popover.sourceView = webView
                    popover.sourceRect = CGRect(x: webView?.bounds.midX ?? 0,
                                                y: webView?.bounds.midY ?? 0,
                                                width: 1, height: 1)
                }
                webView?.window?.rootViewController?.present(controller, animated: true)
            default:
                break
            }
        }
    }
}
