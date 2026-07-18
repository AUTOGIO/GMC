import SwiftUI
import Charts

struct OverviewView: View {
    @Environment(AppDependencies.self) private var dependencies
    @State private var viewModel: OverviewViewModel?
    @State private var operatorMode = OperatorDataMode.offline.rawValue
    @State private var dataSource = "—"

    var body: some View {
        Group {
            if let viewModel {
                overviewContent(viewModel)
            } else {
                ProgressView("Loading Mission Control…")
            }
        }
        .task {
            if viewModel == nil {
                viewModel = OverviewViewModel(useCase: dependencies.overviewUseCase)
            }
            await refreshRuntimeStatus()
            await viewModel?.refresh()
        }
        .refreshable {
            await viewModel?.refresh()
        }
        .onReceive(NotificationCenter.default.publisher(for: .mareDeskDataDidRefresh)) { _ in
            Task {
                await refreshRuntimeStatus()
                await viewModel?.refresh()
            }
        }
    }

    @ViewBuilder
    private func overviewContent(_ viewModel: OverviewViewModel) -> some View {
        VStack(spacing: 0) {
            if let snapshot = viewModel.snapshot {
                StatusRail(
                    mode: operatorMode,
                    regime: snapshot.activeRegime,
                    dataSource: dataSource,
                    refreshedAt: formattedNow()
                )

                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        kpiStrip(snapshot.kpis)
                        allocationSection(snapshot)
                        chartsSection(snapshot)
                        macroSection(snapshot)
                        notesSection(snapshot)
                        healthSection(snapshot)
                    }
                    .padding(20)
                }
            } else if viewModel.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let error = viewModel.errorMessage {
                ContentUnavailableView("Unable to load overview", systemImage: "exclamationmark.triangle", description: Text(error))
            }
        }
        .navigationTitle("Overview")
    }

    private func kpiStrip(_ kpis: OverviewKPIs) -> some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 5), spacing: 12) {
            MetricTile(label: "TOTAL CURRENT", value: formatUSD(kpis.totalCurrent), tone: .positive)
            MetricTile(label: "TOTAL TARGET", value: formatUSD(kpis.totalTarget), tone: .info)
            MetricTile(label: "DRIFT", value: String(format: "%.2f%%", kpis.driftPercent), tone: kpis.driftPercent >= 0 ? .caution : .alert)
            MetricTile(label: "ACTIVE", value: "\(kpis.activeCount)", tone: .positive)
            MetricTile(label: "WATCH", value: "\(kpis.watchCount)", tone: .caution)
        }
    }

    private func allocationSection(_ snapshot: OverviewSnapshot) -> some View {
        DeskPanel(title: "ALLOCATION SUMMARY") {
            Table(snapshot.allocationRows) {
                TableColumn("Category") { row in Text(row.categoryName) }
                TableColumn("Current") { row in Text(formatUSD(row.current)).monospacedDigit() }
                TableColumn("Target") { row in Text(formatUSD(row.target)).monospacedDigit() }
                TableColumn("Drift") { row in Text(String(format: "%.2f%%", row.driftPercent)).monospacedDigit() }
                TableColumn("Weight") { row in Text(String(format: "%.2f%%", row.weightPercent)).monospacedDigit() }
            }
            .frame(minHeight: 180)
        }
    }

    private func chartsSection(_ snapshot: OverviewSnapshot) -> some View {
        HStack(alignment: .top, spacing: 16) {
            DeskPanel(title: "COMPOSITION") {
                Chart(snapshot.allocationRows) { row in
                    SectorMark(
                        angle: .value("Current", (row.current as NSDecimalNumber).doubleValue),
                        innerRadius: .ratio(0.55),
                        angularInset: 1.5
                    )
                    .foregroundStyle(DeskTheme.hex(row.accentHex))
                }
                .frame(height: 220)
            }

            DeskPanel(title: "TARGET VS CURRENT") {
                Chart(snapshot.topHoldings) { holding in
                    BarMark(
                        x: .value("Instrument", holding.symbol.isEmpty ? holding.name : holding.symbol),
                        y: .value("Current", (holding.current as NSDecimalNumber).doubleValue)
                    )
                    .foregroundStyle(DeskTheme.accent.opacity(0.85))

                    BarMark(
                        x: .value("Instrument", holding.symbol.isEmpty ? holding.name : holding.symbol),
                        y: .value("Target", (holding.target as NSDecimalNumber).doubleValue)
                    )
                    .foregroundStyle(DeskTheme.label.opacity(0.5))
                }
                .frame(height: 220)
            }
        }
    }

    private func macroSection(_ snapshot: OverviewSnapshot) -> some View {
        DeskPanel(title: "MACRO REGIME") {
            Table(snapshot.macroIndicators) {
                TableColumn("Signal") { item in Text(item.name) }
                TableColumn("Value") { item in Text("\(item.reading)").monospacedDigit() }
                TableColumn("Regime") { item in Text(item.regime) }
                TableColumn("Notes") { item in Text(item.annotation).foregroundStyle(DeskTheme.label) }
            }
            .frame(minHeight: 160)
        }
    }

    private func notesSection(_ snapshot: OverviewSnapshot) -> some View {
        DeskPanel(title: "RECENT MEMOS") {
            if snapshot.recentMemos.isEmpty {
                Text("No operator memos for the latest capture.")
                    .foregroundStyle(DeskTheme.label)
            } else {
                ForEach(snapshot.recentMemos) { memo in
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(memo.title).font(.headline)
                            Spacer()
                            Text(memo.createdAt.formatted(date: .abbreviated, time: .shortened))
                                .font(.caption)
                                .foregroundStyle(DeskTheme.label)
                        }
                        Text(memo.body).foregroundStyle(DeskTheme.label)
                    }
                    .padding(.vertical, 4)
                }
            }
        }
    }

    private func healthSection(_ snapshot: OverviewSnapshot) -> some View {
        DeskPanel(title: "SYSTEM HEALTH") {
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: 12) {
                MetricTile(label: "HOLDINGS", value: "\(snapshot.health.holdingCount)", tone: .neutral)
                MetricTile(label: "INDICATORS", value: "\(snapshot.health.indicatorCount)", tone: .neutral)
                MetricTile(label: "CATEGORIES", value: "\(snapshot.health.categoryCount)", tone: .neutral)
                MetricTile(label: "DATA AGE", value: "\(snapshot.health.dataAgeMinutes)m", tone: .caution)
            }
        }
    }

    private func formatUSD(_ value: Decimal) -> String {
        Money(amount: value, currencyCode: "USD").formatted(maximumFractionDigits: 0)
    }

    private func formattedNow() -> String {
        Date.now.formatted(date: .numeric, time: .standard)
    }

    private func refreshRuntimeStatus() async {
        let status = await dependencies.runtimeStatus()
        operatorMode = status.mode.rawValue
        dataSource = status.source
    }
}
