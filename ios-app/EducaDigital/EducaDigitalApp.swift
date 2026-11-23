import SwiftUI

@main
struct EducaDigitalApp: App {
    @StateObject private var state = TrainingState()
    var body: some Scene {
        WindowGroup {
            ZStack {
                // A versão instalada apresenta a mesma Home clara da Web.
                Color.white.ignoresSafeArea()

                // Sem botão flutuante de proteção que bloqueava controles.
                CloudflareTrainingWebView(state: state)

                if state.isOffline {
                    offlineScreen
                        .transition(.opacity)
                }
            }
            .preferredColorScheme(.light)
        }
    }

    private var offlineScreen: some View {
        VStack(spacing: 18) {
            Image(systemName: "wifi.exclamationmark")
                .font(.system(size: 48, weight: .medium))
                .foregroundColor(.blue)
                .accessibilityHidden(true)
            Text("Sem conexão com o Educa+")
                .font(.title2.weight(.bold))
                .multilineTextAlignment(.center)
            Text("Confira sua internet e tente novamente. A LIA precisa da Cloudflare para conversar.")
                .font(.body)
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
            Button("Tentar novamente") {
                state.retry()
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .accessibilityHint("Tenta reconectar ao Educa+ Digital")
        }
        .padding(28)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
    }
}

final class TrainingState: ObservableObject {
    @Published var isOffline = false
    @Published var retryVersion = 0

    func retry() {
        isOffline = false
        retryVersion += 1
    }
}
