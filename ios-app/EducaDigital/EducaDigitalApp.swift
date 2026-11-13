import SwiftUI

@main
struct EducaDigitalApp: App {
    @StateObject private var state = TrainingState()
    @State private var showingCallProtection = false

    var body: some Scene {
        WindowGroup {
            ZStack {
                Color(red: 0.045, green: 0.082, blue: 0.145)
                    .ignoresSafeArea()

                CloudflareTrainingWebView(state: state)
                    .ignoresSafeArea()

                // Painel nativo opcional: não altera as telas Web/Android.
                VStack {
                    HStack {
                        Spacer()
                        Button {
                            showingCallProtection = true
                        } label: {
                            Image(systemName: "shield.lefthalf.filled")
                                .font(.system(size: 19, weight: .semibold))
                                .foregroundColor(.white)
                                .frame(width: 46, height: 46)
                                .background(Color(red: 0.12, green: 0.46, blue: 0.77))
                                .clipShape(Circle())
                                .shadow(color: .black.opacity(0.18), radius: 5, y: 3)
                        }
                        .accessibilityLabel("Proteção contra chamadas suspeitas")
                        .accessibilityHint("Abre o painel para configurar a identificação de chamadas do iPhone")
                    }
                    .padding(.horizontal, 14)
                    .padding(.top, 52)
                    Spacer()
                }
                .allowsHitTesting(!state.isOffline)

                if state.isOffline {
                    offlineScreen
                        .transition(.opacity)
                }
            }
            .sheet(isPresented: $showingCallProtection) {
                CallProtectionView()
            }
            .statusBarHidden()
            .ignoresSafeArea(.keyboard, edges: .bottom)
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
