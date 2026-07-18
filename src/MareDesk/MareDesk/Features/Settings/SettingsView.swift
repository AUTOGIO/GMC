import SwiftUI

struct SettingsView: View {
    @Environment(AppDependencies.self) private var dependencies
    @Environment(\.dismiss) private var dismiss
    @State private var selectedProvider: AIProviderKind = .claude
    @State private var configured: [AIProviderKind] = []
    @State private var operatorMode = OperatorDataMode.offline.rawValue
    @State private var dataSource = "—"
    @State private var ibkrStatus = "Not connected"

    var body: some View {
        Form {
            Section("AI Provider") {
                Picker("Active Provider", selection: $selectedProvider) {
                    ForEach(AIProviderKind.allCases) { kind in
                        Text(kind.displayName).tag(kind)
                    }
                }
                .onChange(of: selectedProvider) { _, newValue in
                    dependencies.aiCoordinator.setActive(newValue)
                }

                if configured.isEmpty {
                    Text("No providers configured. Set API keys in environment or start Ollama/LM Studio locally.")
                        .foregroundStyle(.secondary)
                } else {
                    Text("Configured: \(configured.map(\.displayName).joined(separator: ", "))")
                }
            }

            Section("Capture Import") {
                Text("Import Giovannini Mare Capital JSON bundles from the sidebar action or via Shortcuts.")
                Text("Expected layout: portfolio/ and real_estate/ folders with GMC export JSON files.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Section("Runtime") {
                LabeledContent("Operator Mode", value: operatorMode)
                LabeledContent("Data Source", value: dataSource)
                LabeledContent("IBKR Gateway", value: ibkrStatus)
                LabeledContent("Persistence", value: "SwiftData (local)")
                LabeledContent("Platform", value: "Apple Silicon macOS")
            }
        }
        .formStyle(.grouped)
        .frame(width: 520, height: 420)
        .navigationTitle("Settings")
        .toolbar {
            ToolbarItem(placement: .confirmationAction) {
                Button("Done") { dismiss() }
            }
        }
        .task {
            selectedProvider = dependencies.aiCoordinator.activeProvider
            configured = await dependencies.aiCoordinator.configuredProviders()
            let status = await dependencies.runtimeStatus()
            operatorMode = status.mode.rawValue
            dataSource = status.source
            await dependencies.brokerageCoordinator.refreshAvailability()
            if dependencies.brokerageCoordinator.isIBKRAuthenticated {
                ibkrStatus = "Authenticated (localhost:5001)"
            } else if dependencies.brokerageCoordinator.isIBKRAvailable {
                ibkrStatus = "Running — login required"
            } else {
                ibkrStatus = "Not running"
            }
        }
    }
}

struct MenuBarStatusView: View {
    @Environment(AppDependencies.self) private var dependencies
    @State private var regime = "—"
    @State private var drift = "—"

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Mare Desk").font(.headline)
            Text("Regime: \(regime)")
            Text("Drift: \(drift)")
            Button("Open Mission Control") {
                NSApp.activate(ignoringOtherApps: true)
            }
        }
        .padding(12)
        .task { await refresh() }
    }

    private func refresh() async {
        do {
            let snapshot = try await dependencies.overviewUseCase.execute()
            regime = snapshot.activeRegime
            drift = String(format: "%.2f%%", snapshot.kpis.driftPercent)
        } catch {
            regime = "UNAVAILABLE"
        }
    }
}
