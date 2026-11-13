import CallKit
import Foundation
import SwiftUI

/// Interface nativa para ativar a identificação no iOS.
/// Não acessa lista de contatos, histórico de chamadas nem redes externas.
@MainActor
final class CallProtectionModel: ObservableObject {
    static let extensionID = "com.educamaisdigital.educa.callerid"

    @Published var numbers: [String] = []
    @Published var enabled = false
    @Published var statusText = "Verificando a proteção..."
    @Published var infoText = ""
    @Published var newPhone = ""
    @Published var busy = false

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
                    Text("O iPhone pode mostrar “Educa+: possível spam” ao receber ligação de um número que você marcou nesta lista.")
                    Text("Desconhecido não significa golpista. O Educa+ não analisa automaticamente suas ligações, não bloqueia chamadas e não acessa seus contatos.")
                        .foregroundStyle(.secondary)
                }

                Section("Status do iPhone") {
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
                    Text("Na prática educativa, números desconhecidos recebem um aviso de atenção. Isso é uma simulação, não uma análise de chamadas reais.")
                    Text("Para triagem automática de qualquer número desconhecido, o iPhone oferece funções próprias em Ajustes → Apps → Telefone, conforme a versão do iOS.")
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
            .onAppear { model.check() }
        }
    }
}
