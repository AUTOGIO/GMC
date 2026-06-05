import SwiftUI

struct PortfolioDeskView: View {
    @Environment(AppDependencies.self) private var dependencies
    @State private var viewModel: PortfolioDeskViewModel?
    @State private var searchText = ""
    @State private var statusFilter = "ALL"
    @State private var categoryFilter = "ALL"

    var body: some View {
        Group {
            if let viewModel {
                portfolioContent(viewModel)
            } else {
                ProgressView("Loading Portfolio Desk…")
            }
        }
        .task {
            if viewModel == nil {
                viewModel = PortfolioDeskViewModel(useCase: dependencies.filterHoldingsUseCase)
            }
            await viewModel?.refresh()
        }
        .navigationTitle("Portfolio")
        .onReceive(NotificationCenter.default.publisher(for: .mareDeskDataDidRefresh)) { _ in
            Task { await viewModel?.refresh() }
        }
    }

    @ViewBuilder
    private func portfolioContent(_ viewModel: PortfolioDeskViewModel) -> some View {
        VStack(spacing: 0) {
            if let snapshot = viewModel.snapshot {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        metricsStrip(snapshot.metrics)
                        filterBar(viewModel)
                        holdingsTable(snapshot.holdings)
                        allocationPanel(snapshot.allocationRows)
                    }
                    .padding(20)
                }
            } else if viewModel.isLoading {
                ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let error = viewModel.errorMessage {
                ContentUnavailableView("Portfolio unavailable", systemImage: "chart.pie", description: Text(error))
            }
        }
    }

    private func metricsStrip(_ metrics: PortfolioMetrics) -> some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 4), spacing: 12) {
            MetricTile(label: "TOTAL CURRENT", value: Money(amount: metrics.totalCurrent, currencyCode: "USD").formatted(), tone: .positive)
            MetricTile(label: "LIQUIDITY", value: String(format: "%.2f%%", metrics.liquidityRatio), tone: .info)
            MetricTile(label: "PRESERVATION", value: String(format: "%.2f%%", metrics.preservationRatio), tone: .positive)
            MetricTile(label: "CONVEXITY", value: String(format: "%.2f", metrics.convexityScore), tone: .caution)
        }
    }

    private func filterBar(_ viewModel: PortfolioDeskViewModel) -> some View {
        DeskPanel(title: "FILTERS") {
            HStack(spacing: 12) {
                TextField("Search holdings", text: $searchText)
                    .textFieldStyle(.roundedBorder)
                Picker("Status", selection: $statusFilter) {
                    Text("ALL").tag("ALL")
                    ForEach(HoldingStatus.allCases, id: \.rawValue) { status in
                        Text(status.label).tag(status.rawValue)
                    }
                }
                .frame(width: 140)
                TextField("Category code", text: $categoryFilter)
                    .textFieldStyle(.roundedBorder)
                    .frame(width: 120)
                Button("Apply") {
                    Task {
                        let status = HoldingStatus(rawValue: statusFilter)
                        await viewModel.apply(
                            search: searchText,
                            status: statusFilter == "ALL" ? nil : status,
                            categoryCode: categoryFilter
                        )
                    }
                }
                .keyboardShortcut(.return, modifiers: .command)
            }
        }
    }

    private func holdingsTable(_ holdings: [HoldingSummary]) -> some View {
        DeskPanel(title: "POSITIONS") {
            Table(holdings) {
                TableColumn("Name") { Text($0.name) }
                TableColumn("Ticker") { Text($0.symbol) }
                TableColumn("Category") { Text($0.categoryName) }
                TableColumn("Current") { Text(Money(amount: $0.current, currencyCode: "USD").formatted()).monospacedDigit() }
                TableColumn("Target") { Text(Money(amount: $0.target, currencyCode: "USD").formatted()).monospacedDigit() }
                TableColumn("Status") { Text($0.status.label).foregroundStyle($0.status.tone.color) }
                TableColumn("Bucket") { Text($0.bucketLabel).foregroundStyle(DeskTheme.label) }
            }
            .frame(minHeight: 280)
        }
    }

    private func allocationPanel(_ rows: [AllocationRow]) -> some View {
        DeskPanel(title: "ALLOCATION SUMMARY") {
            Table(rows) {
                TableColumn("Category") { Text($0.categoryName) }
                TableColumn("Current") { Text(Money(amount: $0.current, currencyCode: "USD").formatted()).monospacedDigit() }
                TableColumn("Target") { Text(Money(amount: $0.target, currencyCode: "USD").formatted()).monospacedDigit() }
                TableColumn("Drift") { Text(String(format: "%.2f%%", $0.driftPercent)).monospacedDigit() }
                TableColumn("Weight") { Text(String(format: "%.2f%%", $0.weightPercent)).monospacedDigit() }
            }
            .frame(minHeight: 180)
        }
    }
}
