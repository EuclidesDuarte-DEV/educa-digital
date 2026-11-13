import CallKit
import Foundation
import SwiftUI
import UIKit
import UserNotifications

/// Interface nativa para ativar a identificação no iOS.
/// Não acessa lista de contatos, histórico de chamadas nem redes externas.
/// Mensagem educativa solicitada para avisar sobre riscos de números não salvos.
/// O texto NÃO é uma interceptação de ligação celular real.
enum UnknownCallerSafetyMessage {
    static let title = "Educa+ Digital — Atenção"
    static let body = "Número desconhecido. Tenha cuidado com possíveis tentativas de golpe. Nunca compartilhe senhas ou códigos."
    static let appleGuide = URL(string: "https://support.apple.com/pt-br/111106")!
}

@MainActor
final class CallProtectionModel: ObservableObject {
    static let extensionID = "com.educamaisdigital.educa.callerid"

    @Published var numbers: [String] = []
    @Published var enabled = false
    @Published var statusText = "Verificando a proteção..."
    @Published var infoText = ""
    @Published var newPhone = ""
    @Published var busy = false
    @Published var notificationsAllowed = false
    @Published var notificationPermissionDenied = false
    @Published var notificationBusy = false
    @Published var notificationStatus = "Verificando permissão..."
    @Published var notificationMessage = ""

    init() {
        numbers = SpamNumberStore.read()
    }

    func check() {
        CXCallDirectoryManager.sharedInstance.getEnabledStatusForExtension(
            withIdentifier: Self.extensionID
        ) { [weak self] state, error in
            DispatchQueue.main.async {
                guard let self else { return }
                if let error {
                    self.enabled = false
                    self.statusText = "Não foi possível consultar a proteção: \(error.localizedDescription)"
                    return
                }
                self.enabled = state == .enabled
                switch state {
                case .enabled: self.statusText = "Identificação de chamadas ativada"
                case .disabled: self.statusText = "Ative a identificação nos Ajustes do iPhone"
                default: self.statusText = "Estado da identificação desconhecido"
                }
            }
        }
    }

    /// Autorizar notificações é opcional e NÃO permite observar chamadas celulares.
    /// A identificação na ligação usa Call Directory, de forma independente.
    func checkNotificationPermissions() {
        UNUserNotificationCenter.current().getNotificationSettings { [weak self] settings in
            DispatchQueue.main.async {
                guard let self else { return }
                switch settings.authorizationStatus {
                case .authorized:
                    self.notificationsAllowed = true
                    self.notificationPermissionDenied = false
                    self.notificationStatus = "Notificações permitidas"
                case .provisional, .ephemeral:
                    self.notificationsAllowed = true
                    self.notificationPermissionDenied = false
                    self.notificationStatus = "Notificações silenciosas ou temporárias"
                case .denied:
                    self.notificationsAllowed = false
                    self.notificationPermissionDenied = true
                    self.notificationStatus = "Notificações desativadas nos Ajustes"
                default:
                    self.notificationsAllowed = false
                    self.notificationPermissionDenied = false
                    self.notificationStatus = "Notificações ainda não autorizadas"
                }
            }
        }
    }

    func requestNotificationPermission() {
        notificationBusy = true
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { [weak self] granted, error in
            DispatchQueue.main.async {
                guard let self else { return }
                self.notificationBusy = false
                if let error {
                    self.notificationMessage = "Não foi possível pedir a permissão: \(error.localizedDescription)"
                } else {
                    self.notificationMessage = granted
                        ? "Permissão registrada. Faça um teste para conhecer o aviso fora do aplicativo."
                        : "Você pode permitir as notificações depois nos Ajustes do iPhone."
                }
                self.checkNotificationPermissions()
            }
        }
    }

    func openNotificationSettings() {
        guard let settings = URL(string: UIApplication.openSettingsURLString) else { return }
        UIApplication.shared.open(settings)
    }

    /// Notificação LOCAL explicitamente identificada como teste, nunca como chamada real.
    /// Não acessa o histórico de chamadas, CallKit em tempo real ou APNs.
    func sendTestNotification() {
        guard notificationsAllowed else {
            notificationMessage = "Permita as notificações antes de testar."
            return
        }
        notificationBusy = true
        let content = UNMutableNotificationContent()
        content.title = "SIMULAÇÃO — " + UnknownCallerSafetyMessage.title
        content.body = UnknownCallerSafetyMessage.body + " Apenas demonstração: nenhuma ligação real foi identificada."
        content.sound = .default
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 8, repeats: false)
        let request = UNNotificationRequest(
            identifier: "educa-ios-call-protection-notification-demo",
            content: content,
            trigger: trigger
        )
        UNUserNotificationCenter.current().add(request) { [weak self] error in
            DispatchQueue.main.async {
                guard let self else { return }
                self.notificationBusy = false
                if let error {
                    self.notificationMessage = "Não foi possível agendar o aviso de demonstração: \(error.localizedDescription)"
                } else {
                    self.notificationMessage = "Teste agendado. Volte à tela inicial ou bloqueie o iPhone para ver o aviso; a entrega depende dos Ajustes do iOS."
                }
            }
        }
    }

    func openSettings() {
        CXCallDirectoryManager.sharedInstance.openSettings { [weak self] error in
            DispatchQueue.main.async {
                if let error {
                    self?.infoText = "Abra Ajustes → Apps → Telefone → Bloqueio e Identificação de Chamadas. \(error.localizedDescription)"
                }
            }
        }
    }

    func add() {
        guard let value = SpamNumberStore.normalize(newPhone) else {
            infoText = "Digite um número completo com DDD. Para exterior, use + e o código do país."
            return
        }
        guard !numbers.contains(value) else {
            infoText = "Esse número já está na sua lista."
            return
        }
        let saved = numbers + [value]
        guard SpamNumberStore.write(saved) else {
            infoText = "Não foi possível salvar. Verifique a configuração App Groups do aplicativo assinado."
            return
        }
        numbers = SpamNumberStore.read()
        newPhone = ""
        infoText = "Número marcado por você como suspeito, não verificado por uma operadora."
        reload()
    }

    func remove(_ number: String) {
        guard SpamNumberStore.write(numbers.filter { $0 != number }) else {
            infoText = "Não foi possível remover o número da lista."
            return
        }
        numbers = SpamNumberStore.read()
        reload()
    }

    func reload() {
        busy = true
        CXCallDirectoryManager.sharedInstance.reloadExtension(
            withIdentifier: Self.extensionID
        ) { [weak self] error in
            DispatchQueue.main.async {
                guard let self else { return }
                self.busy = false
                if let error {
                    self.infoText = "Lista salva no aparelho, mas o iOS não a carregou: \(error.localizedDescription). Ative a extensão nos Ajustes."
                } else {
                    self.infoText = "Atualização solicitada ao iPhone. O aviso aparecerá apenas para números cadastrados."
                }
                self.check()
            }
        }
    }
}

struct CallProtectionView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var model = CallProtectionModel()

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Label("Proteção contra ligações suspeitas", systemImage: "shield.lefthalf.filled")
                        .font(.headline)
                        .accessibilityAddTraits(.isHeader)
                    Text("O aviso de identificação aparece na tela de chamada do próprio iPhone, mesmo com o Educa+ fechado — não dentro do celular simulado.")
                    Text("O rótulo “Educa+: possível spam” funciona somente para números que você marcou como suspeitos e que o iOS carregou na extensão.")
                    Text("Desconhecido não significa golpista. O Educa+ não analisa automaticamente suas ligações, não bloqueia chamadas e não acessa seus contatos.")
                        .foregroundStyle(.secondary)
                }

                Section("Proteger ligações de números não salvos") {
                    Label("Triagem automática do próprio iPhone", systemImage: "phone.arrow.down.left.fill")
                        .font(.headline)
                    Text("A proteção para números não salvos é feita pelo iOS, mesmo com o Educa+ fechado. Você precisa ativá-la nos Ajustes; nenhum aplicativo pode ativá-la por você.")
                    if ProcessInfo.processInfo.operatingSystemVersion.majorVersion >= 26 {
                        Text("1. Abra Ajustes → Apps → Telefone.")
                        Text("2. Procure Filtrar Números Desconhecidos.")
                        Text("3. Selecione Perguntar Motivo da Ligação.")
                        Text("O iPhone perguntará o nome e o motivo da ligação antes de tocar para números não salvos. Você decide se atende; o Educa+ não recebe os dados da ligação.")
                            .foregroundStyle(.secondary)
                    } else {
                        Text("1. Abra Ajustes → Telefone (ou Apps → Telefone).")
                        Text("2. Ative Silenciar Desconhecidos, se disponível.")
                        Text("Em versões antigas, a triagem com pergunta sobre o motivo pode não estar disponível. Silenciar pode fazer você perder ligações legítimas.")
                            .foregroundStyle(.secondary)
                    }
                    Button {
                        UIApplication.shared.open(UnknownCallerSafetyMessage.appleGuide)
                    } label: {
                        Label("Consultar instruções oficiais da Apple", systemImage: "arrow.up.right.square")
                    }
                    .accessibilityHint("Abre o guia oficial da Apple para configurar ligações desconhecidas")
                }

                Section("Aviso educativo para números desconhecidos") {
                    Label(UnknownCallerSafetyMessage.title, systemImage: "exclamationmark.shield.fill")
                        .font(.headline)
                        .foregroundStyle(.orange)
                    Text(UnknownCallerSafetyMessage.body)
                    Text("Esta mensagem aparece nesta orientação e na notificação de DEMONSTRAÇÃO, quando solicitada. A Apple não permite mostrá-la automaticamente como notificação do Educa+ em toda ligação real não salva.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }

                Section("Notificações no iPhone real") {
                    Label(model.notificationStatus, systemImage: model.notificationsAllowed ? "bell.badge.fill" : "bell.slash")
                        .foregroundStyle(model.notificationsAllowed ? .green : .secondary)
                    Text("Permita notificações para receber avisos educativos que o Educa+ realmente agendar. Autorizar não fornece ao app o número de quem está ligando e não ativa alertas por ligação real.")
                        .font(.subheadline)
                    if model.notificationPermissionDenied {
                        Button("Abrir Ajustes de notificações") {
                            model.openNotificationSettings()
                        }
                    } else if !model.notificationsAllowed {
                        Button("Permitir notificações") {
                            model.requestNotificationPermission()
                        }
                        .disabled(model.notificationBusy)
                    }
                    Button("Testar notificação fora do aplicativo") {
                        model.sendTestNotification()
                    }
                    .disabled(!model.notificationsAllowed || model.notificationBusy)
                    .accessibilityHint("Mostra a mensagem educativa do Educa+ como SIMULAÇÃO fora do aplicativo, sem detectar ligação real.")
                    if !model.notificationMessage.isEmpty {
                        Text(model.notificationMessage)
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                }

                Section("Identificação de chamadas reais") {
                    Label(model.statusText, systemImage: model.enabled ? "checkmark.shield.fill" : "exclamationmark.shield")
                        .foregroundStyle(model.enabled ? .green : .orange)
                    Button("Abrir identificação de chamadas nos Ajustes") {
                        model.openSettings()
                    }
                    .accessibilityHint("Abre os Ajustes do iOS para ativar o Educa+ Proteção de Chamadas")
                    Button("Recarregar lista") {
                        model.reload()
                    }
                    .disabled(model.busy)
                }

                Section("Marcar número suspeito") {
                    TextField("Ex.: 65 99999-9999", text: $model.newPhone)
                        .keyboardType(.phonePad)
                        .textContentType(.telephoneNumber)
                        .accessibilityLabel("Número suspeito com DDD")
                    Button("Adicionar à lista") {
                        model.add()
                    }
                    .disabled(model.newPhone.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || model.busy)
                    Text("Adicione somente números que você identificou como suspeitos. A indicação exibida na ligação é baseada no seu cadastro.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }

                Section("Sua lista local (\(model.numbers.count))") {
                    if model.numbers.isEmpty {
                        Text("Nenhum número cadastrado. O Educa+ não marcará chamadas reais como spam até você adicionar números e ativar a extensão.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(model.numbers, id: \.self) { number in
                            HStack {
                                Label(SpamNumberStore.display(number), systemImage: "phone.down.fill")
                                    .lineLimit(2)
                                Spacer(minLength: 4)
                                Button("Excluir") { model.remove(number) }
                                    .buttonStyle(.borderless)
                                    .tint(.red)
                                    .accessibilityLabel("Remover o número \(number)")
                            }
                        }
                    }
                }

                if !model.infoText.isEmpty {
                    Section {
                        Text(model.infoText)
                            .font(.subheadline)
                            .accessibilityAddTraits(.updatesFrequently)
                    }
                }

                Section {
                    Text("O treinamento do Modo Livre continua dentro do protótipo, mas não exibe mais o aviso de spam sobre a ligação simulada. O aviso real é responsabilidade do sistema Telefone do iPhone.")
                    Text("Não é possível detectar toda ligação desconhecida apenas permitindo notificações. Para filtrar ou silenciar desconhecidos, consulte os recursos do próprio iPhone em Ajustes → Apps → Telefone, conforme a versão do iOS.")
                }
                .font(.footnote)
                .foregroundStyle(.secondary)
            }
            .navigationTitle("Proteção de chamadas")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Fechar") { dismiss() }
                }
            }
            .onAppear {
                model.check()
                model.checkNotificationPermissions()
            }
        }
    }
}
