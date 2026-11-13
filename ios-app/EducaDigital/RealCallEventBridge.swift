import CallKit
import Foundation
import UserNotifications

/// Observa atividade de chamadas reais SOMENTE enquanto o processo nativo
/// esta em execucao. O CallKit nao oferece telefone/contato em CXCall.
/// Nao e um servico de background e nao substitui CallerIDExtension.
final class RealCallEventBridge: NSObject, ObservableObject, CXCallObserverDelegate, UNUserNotificationCenterDelegate {
    private static let preferenceKey = "educa-ios-real-call-activity-alerts"
    private let callObserver = CXCallObserver()
    private var notifiedCalls = Set<UUID>()
    private var observing = false

    @Published private(set) var enabled = UserDefaults.standard.bool(forKey: preferenceKey)
    @Published private(set) var statusText = "O aviso por atividade de ligação está desativado."

    func activateIfNeeded() {
        guard enabled, !observing else { return }
        // Uma extensão Call Directory NAO e notificada por chamada.
        // Esta observacao ocorre apenas se o aplicativo nativo estiver ativo.
        observing = true
        callObserver.setDelegate(self, queue: .main)
        let notifications = UNUserNotificationCenter.current()
        if notifications.delegate == nil {
            notifications.delegate = self
        }
        statusText = "Monitor ativo enquanto o Educa+ estiver em execução."
    }

    func setEnabled(_ requested: Bool) {
        enabled = requested
        UserDefaults.standard.set(requested, forKey: Self.preferenceKey)
        if requested {
            activateIfNeeded()
        } else {
            callObserver.setDelegate(nil, queue: nil)
            observing = false
            notifiedCalls.removeAll()
            statusText = "O aviso por atividade de ligação está desativado."
        }
    }

    // O evento nao indica se o numero esta salvo. Nada e classificado como
    // suspeito automaticamente e nenhum numero e armazenado.
    func callObserver(_ callObserver: CXCallObserver, callChanged call: CXCall) {
        guard enabled else { return }
        if call.hasEnded {
            notifiedCalls.remove(call.uuid)
            return
        }
        guard !call.isOutgoing, !call.hasConnected else { return }
        guard notifiedCalls.insert(call.uuid).inserted else { return }

        UNUserNotificationCenter.current().getNotificationSettings { [weak self] settings in
            guard let self else { return }
            let permission = settings.authorizationStatus
            guard permission == .authorized || permission == .provisional ||
                  permission == .ephemeral else {
                DispatchQueue.main.async {
                    self.statusText = "Ligação observada, mas notificações não estão permitidas."
                }
                return
            }

            let content = UNMutableNotificationContent()
            content.title = "Educa+ Digital — Atenção"
            content.body = "Ligação recebida. Se o número for desconhecido, tenha cuidado com possíveis tentativas de golpe. Nunca compartilhe senhas ou códigos."
            content.sound = .default
            content.threadIdentifier = "educa-real-call-activity"
            let request = UNNotificationRequest(
                identifier: "educa-ios-call-activity-\(call.uuid.uuidString)",
                content: content,
                trigger: nil
            )
            // O iOS pode adiar ou suprimir o banner durante o toque da chamada.
            // Nunca prometer alerta garantido nem recepcao com app encerrado.
            UNUserNotificationCenter.current().add(request) { error in
                DispatchQueue.main.async {
                    self.statusText = error == nil
                        ? "Aviso solicitado para atividade de chamada real. A exibição depende do iOS."
                        : "O iPhone não aceitou o aviso: \(error!.localizedDescription)"
                }
            }
        }
    }

    // Se Educa+ estiver na frente quando o aviso chegar, solicita banner.
    // Outros delegados existentes nao sao sobrescritos por esta classe.
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .list, .sound])
    }
}
