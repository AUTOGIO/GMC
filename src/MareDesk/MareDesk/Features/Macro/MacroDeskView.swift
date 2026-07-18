import SwiftUI
import SwiftData

struct MacroDeskView: View {
    @Environment(AppDependencies.self) private var dependencies
    @Query(sort: \MacroIndicator.indicatorName) private var indicators: [MacroIndicator]
    @Query(sort: \OperatorMemo.createdAt, order: .reverse) private var memos: [OperatorMemo]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                DeskPanel(title: "MACRO INDICATORS") {
                    Table(indicators) {
                        TableColumn("Signal") { indicator in Text(indicator.indicatorName) }
                        TableColumn("Value") { indicator in Text("\(indicator.reading)").monospacedDigit() }
                        TableColumn("Regime") { indicator in Text(indicator.regimeLabel) }
                        TableColumn("Emphasis") { indicator in Text(indicator.emphasisToken) }
                        TableColumn("Notes") { indicator in Text(indicator.annotation).foregroundStyle(DeskTheme.label) }
                    }
                    .frame(minHeight: 240)
                }

                HStack(alignment: .top, spacing: 16) {
                    DeskPanel(title: "TRIGGER RULES") {
                        let rules = memos.filter(\.isTriggerRule).prefix(6)
                        if rules.isEmpty {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("If liquidity ratio < 12% → shift 5% from cyclical to cash-like instruments.")
                                Text("If DXY acceleration > 1.5σ → reduce EM exposure by 2 tactical units.")
                                Text("If inflation impulse cools for 3 prints → add duration in core fixed income.")
                            }
                            .foregroundStyle(DeskTheme.label)
                        } else {
                            ForEach(Array(rules), id: \.persistentModelID) { rule in
                                Text(rule.bodyText)
                            }
                        }
                    }

                    DeskPanel(title: "OPERATOR MEMOS") {
                        let notes = memos.filter { !$0.isTriggerRule && $0.scope == .macro }.prefix(6)
                        if notes.isEmpty {
                            Text("No macro memos for the latest capture.").foregroundStyle(DeskTheme.label)
                        } else {
                            ForEach(Array(notes), id: \.persistentModelID) { note in
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(note.title).font(.headline)
                                    Text(note.bodyText).foregroundStyle(DeskTheme.label)
                                }
                            }
                        }
                    }
                }

                aiAssistPanel
            }
            .padding(20)
        }
        .navigationTitle("Macro")
    }

    private var aiAssistPanel: some View {
        DeskPanel(title: "AI REGIME ASSIST") {
            HStack {
                Text("Analyze current macro indicators with your configured local or cloud model.")
                    .foregroundStyle(DeskTheme.label)
                Spacer()
                Button("Analyze Regime") {
                    Task { await analyzeRegime() }
                }
            }
        }
    }

    private func analyzeRegime() async {
        let prompt = indicators.map { "\($0.indicatorName): \($0.reading) (\($0.regimeLabel))" }.joined(separator: "\n")
        do {
            _ = try await dependencies.aiCoordinator.complete(
                AICompletionRequest(
                    prompt: "Summarize macro regime posture and tactical implications:\n\(prompt)",
                    systemInstruction: "You are a macro risk analyst for Giovannini Mare Capital.",
                    maxTokens: 800
                )
            )
        } catch {
            AppLogger.ai.error("Macro analysis failed: \(error.localizedDescription, privacy: .public)")
        }
    }
}
