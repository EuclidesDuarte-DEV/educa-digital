import CallKit
import Foundation

/// O iOS só invoca esta extensão ao carregar a lista, NÃO por ligação.
/// Dados são compartilhados pelo App Group; nenhuma requisição à Cloudflare
/// ou leitura de contatos é feita na extensão.
final class CallDirectoryProvider: CXCallDirectoryProvider {
    override func beginRequest(with context: CXCallDirectoryExtensionContext) {
        context.delegate = self

        // Extensões incrementais têm regras específicas de exclusão.
        // Solicitar reload completo pelo aplicativo após editar a lista;
        // atualização incremental não altera números já registrados.
        if context.isIncremental {
            context.completeRequest()
            return
        }

        let items: [CXCallDirectoryPhoneNumber] = SpamNumberStore.read()
            .compactMap { CXCallDirectoryPhoneNumber($0) }
            .sorted()

        for number in items {
            context.addIdentificationEntry(
                withNextSequentialPhoneNumber: number,
                label: "Educa+: possível spam (marcado por você)"
            )
        }
        // Não bloquear chamadas automaticamente e nunca marcar números
        // não cadastrados como SPAM.
        context.completeRequest()
    }
}

extension CallDirectoryProvider: CXCallDirectoryExtensionContextDelegate {
    func requestFailed(for extensionContext: CXCallDirectoryExtensionContext, withError error: Error) {
        NSLog("Educa CallerID: erro na atualização da lista: %@", String(describing: error))
    }
}
