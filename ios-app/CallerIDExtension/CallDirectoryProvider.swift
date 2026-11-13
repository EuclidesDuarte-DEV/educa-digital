import CallKit
import Foundation

/// Extensão oficial Call Directory: apenas números que o usuário marcou.
/// Nunca consulta contatos ou rede; não classifica números desconhecidos
/// automaticamente. Apple solicita dados completos OU deltas incrementais.
final class CallDirectoryProvider: CXCallDirectoryProvider {
    override func beginRequest(with context: CXCallDirectoryExtensionContext) {
        context.delegate = self

        let current = SpamNumberStore.read()
        let previous = SpamNumberStore.applied()
        let wanted = Set(current)
        let loaded = Set(previous)

        if context.isIncremental {
            // Remover entradas desmarcadas (ordem crescente).
            for phone in loaded.subtracting(wanted).sorted() {
                if let number = CXCallDirectoryPhoneNumber(phone) {
                    context.removeIdentificationEntry(withPhoneNumber: number)
                }
            }
            // Inserir apenas entradas NOVAS (ordem crescente).
            for phone in wanted.subtracting(loaded).sorted() {
                if let number = CXCallDirectoryPhoneNumber(phone) {
                    context.addIdentificationEntry(
                        withNextSequentialPhoneNumber: number,
                        label: "Educa+: possível spam (marcado por você)"
                    )
                }
            }
        } else {
            // O iOS pode solicitar reconstrução total a qualquer momento.
            for phone in current {
                if let number = CXCallDirectoryPhoneNumber(phone) {
                    context.addIdentificationEntry(
                        withNextSequentialPhoneNumber: number,
                        label: "Educa+: possível spam (marcado por você)"
                    )
                }
            }
        }

        // O retorno true indica que o pedido expirou; não marcar aplicado.
        context.completeRequest(completionHandler: { expired in
            if !expired { SpamNumberStore.recordApplied(current) }
        })
    }
}

extension CallDirectoryProvider: CXCallDirectoryExtensionContextDelegate {
    func requestFailed(for extensionContext: CXCallDirectoryExtensionContext, withError error: Error) {
        NSLog("Educa CallerID: falha ao carregar números: %@", String(describing: error))
    }
}
