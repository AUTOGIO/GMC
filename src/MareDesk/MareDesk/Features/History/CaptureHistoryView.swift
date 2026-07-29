import SwiftUI

struct CaptureHistoryView: View {
    @Environment(AppDependencies.self) private var dependencies
    @State private var snapshot: CaptureHistorySnapshot?
    @State private var selectedEntryID: String?
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var bundlePath = CaptureBundleLocator.defaultBundleURL()?.path ?? "Not configured"
    @State private var restoreMessage: String?

    var body: some View {
        HSplitView {
            captureList
            captureDetail
        }
        .navigationTitle("Capture History")
        .task { await refresh() }
        .refreshable { await refresh() }
    }

    private var captureList: some View {
        VStack(alignment: .leading, spacing: 12) {
            DeskPanel(title: "BUNDLE SOURCE") {
                Text(bundlePath)
                    .font(.system(.caption, design: .monospaced))
                    .foregroundStyle(DeskTheme.label)
                    .textSelection(.enabled)
                HStack {
                    Button("Import Default Bundle") {
                        Task { await importDefaultBundle() }
                    }
                    Button("Choose Folder…") {
                        Task { await importFromPanel() }
                    }
                }
            }

            if let snapshot, !snapshot.entries.isEmpty {
                List(selection: $selectedEntryID) {
                    ForEach(snapshot.entries) { entry in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(entry.capturedAt.formatted(date: .abbreviated, time: .shortened))
                                    .font(.headline)
                                if entry.isLatest {
                                    Text("LATEST")
                                        .font(.caption2.weight(.bold))
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(DeskTheme.accent.opacity(0.2))
                                        .clipShape(Capsule())
                                }
                            }
                            Text(entry.activeRegime)
                                .font(.caption)
                                .foregroundStyle(DeskTheme.label)
                            Text("\(entry.holdingCount) holdings · \(entry.propertyCount) properties")
                                .font(.caption2)
                                .foregroundStyle(DeskTheme.label)
                        }
                        .tag(entry.id)
                    }
                }
                .frame(minWidth: 320)
            } else if isLoading {
                ProgressView("Loading capture timeline…")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                ContentUnavailableView(
                    "No captures yet",
                    systemImage: "tray",
                    description: Text(errorMessage ?? "Import a GMC bundle to begin building history.")
                )
            }
        }
        .padding(16)
    }

    @ViewBuilder
    private var captureDetail: some View {
        if let entry = selectedEntry ?? snapshot?.latest {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    summaryStrip(entry)
                    restorePanel(entry)
                    comparisonPanel(entry)
                    metadataPanel(entry)
                }
                .padding(20)
            }
        } else {
            ContentUnavailableView("Select a capture", systemImage: "clock.arrow.circlepath")
        }
    }

    private var selectedEntry: CaptureHistoryEntry? {
        guard let selectedEntryID else { return nil }
        return snapshot?.entries.first { $0.id == selectedEntryID }
    }

    private func summaryStrip(_ entry: CaptureHistoryEntry) -> some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 4), spacing: 12) {
            MetricTile(label: "HOLDINGS", value: "\(entry.holdingCount)", tone: .neutral)
            MetricTile(label: "INDICATORS", value: "\(entry.indicatorCount)", tone: .neutral)
            MetricTile(label: "PROPERTIES", value: "\(entry.propertyCount)", tone: .neutral)
            MetricTile(label: "REGIME", value: entry.activeRegime, tone: .caution)
            MetricTile(label: "PORTFOLIO USD", value: Money(amount: entry.totalCurrentUSD, currencyCode: "USD").formatted(maximumFractionDigits: 0), tone: .positive)
            MetricTile(label: "PROPERTY BRL", value: Money(amount: entry.totalPropertyMarketBRL, currencyCode: "BRL").formatted(maximumFractionDigits: 0), tone: .info)
            MetricTile(label: "ORIGIN", value: entry.origin.rawValue, tone: .neutral)
            MetricTile(label: "INITIATED BY", value: entry.initiatedBy, tone: .neutral)
        }
    }

    private func restorePanel(_ entry: CaptureHistoryEntry) -> some View {
        DeskPanel(title: "RESTORE CAPTURE") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Restore portfolio and property data from this capture's archived frozen snapshot.")
                    .foregroundStyle(DeskTheme.label)
                Button("Restore This Capture") {
                    Task { await restoreCapture(entry) }
                }
                if let restoreMessage {
                    Text(restoreMessage)
                        .font(.caption)
                        .foregroundStyle(DeskTheme.accent)
                }
            }
        }
    }

    private func comparisonPanel(_ entry: CaptureHistoryEntry) -> some View {
        DeskPanel(title: "DELTA VS PRIOR CAPTURE") {
            if let prior = priorEntry(before: entry) {
                VStack(alignment: .leading, spacing: 8) {
                    deltaRow("Holdings", current: entry.holdingCount, prior: prior.holdingCount)
                    deltaRow("Portfolio USD", current: entry.totalCurrentUSD, prior: prior.totalCurrentUSD, isMoney: true)
                    deltaRow("Properties", current: entry.propertyCount, prior: prior.propertyCount)
                    deltaRow("Property BRL", current: entry.totalPropertyMarketBRL, prior: prior.totalPropertyMarketBRL, isMoney: true, currency: "BRL")
                    Text("Regime: \(prior.activeRegime) → \(entry.activeRegime)")
                        .foregroundStyle(DeskTheme.label)
                }
            } else {
                Text("This is the earliest archived capture in local history.")
                    .foregroundStyle(DeskTheme.label)
            }
        }
    }

    private func metadataPanel(_ entry: CaptureHistoryEntry) -> some View {
        DeskPanel(title: "CAPTURE METADATA") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Captured: \(entry.capturedAt.formatted(date: .complete, time: .standard))")
                if let portfolioAsOf = entry.portfolioAsOf {
                    Text("Portfolio as-of: \(portfolioAsOf.formatted(date: .abbreviated, time: .omitted))")
                }
                if let propertyAsOf = entry.propertyAsOf {
                    Text("Property as-of: \(propertyAsOf.formatted(date: .abbreviated, time: .omitted))")
                }
                Text(entry.note)
                    .foregroundStyle(DeskTheme.label)
            }
            .font(.system(.body, design: .monospaced))
        }
    }

    private func priorEntry(before entry: CaptureHistoryEntry) -> CaptureHistoryEntry? {
        guard let snapshot else { return nil }
        guard let index = snapshot.entries.firstIndex(where: { $0.id == entry.id }), index + 1 < snapshot.entries.count else {
            return nil
        }
        return snapshot.entries[index + 1]
    }

    private func deltaRow(
        _ label: String,
        current: some Any,
        prior: some Any,
        isMoney: Bool = false,
        currency: String = "USD"
    ) -> some View {
        let currentText: String
        let priorText: String
        let deltaText: String

        if isMoney, let currentAmount = current as? Decimal, let priorAmount = prior as? Decimal {
            currentText = Money(amount: currentAmount, currencyCode: currency).formatted(maximumFractionDigits: 0)
            priorText = Money(amount: priorAmount, currencyCode: currency).formatted(maximumFractionDigits: 0)
            let delta = currentAmount - priorAmount
            deltaText = Money(amount: delta, currencyCode: currency).formatted(maximumFractionDigits: 0)
        } else if let currentInt = current as? Int, let priorInt = prior as? Int {
            currentText = "\(currentInt)"
            priorText = "\(priorInt)"
            deltaText = "\(currentInt - priorInt)"
        } else {
            currentText = "\(current)"
            priorText = "\(prior)"
            deltaText = "—"
        }

        return HStack {
            Text(label).frame(width: 140, alignment: .leading)
            Text("\(priorText) → \(currentText)")
            Spacer()
            Text("Δ \(deltaText)")
                .foregroundStyle(DeskTheme.accent)
        }
    }

    private func refresh() async {
        isLoading = true
        defer { isLoading = false }
        bundlePath = CaptureBundleLocator.defaultBundleURL()?.path ?? "Not configured"

        do {
            snapshot = try await dependencies.loadCaptureHistoryUseCase.execute()
            if selectedEntryID == nil {
                selectedEntryID = snapshot?.latest?.id
            }
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func importDefaultBundle() async {
        guard let url = CaptureBundleLocator.defaultBundleURL() else {
            errorMessage = "No default GMC bundle found on this Mac."
            return
        }
        await importBundle(at: url)
    }

    private func importFromPanel() async {
        let panel = NSOpenPanel()
        panel.canChooseDirectories = true
        panel.canChooseFiles = false
        panel.prompt = "Import"
        panel.message = "Select a GMC capture bundle folder."

        guard panel.runModal() == .OK, let url = panel.url else { return }
        CaptureBundleLocator.remember(url)
        await importBundle(at: url)
    }

    private func restoreCapture(_ entry: CaptureHistoryEntry) async {
        do {
            _ = try await dependencies.restoreCaptureUseCase.execute(captureID: entry.id)
            restoreMessage = "Restored capture from archived frozen snapshot."
            await refresh()
            NotificationCenter.default.post(name: .mareDeskDataDidRefresh, object: nil)
        } catch {
            restoreMessage = error.localizedDescription
        }
    }

    private func importBundle(at url: URL) async {
        do {
            try await SecurityScopedAccess.withAccess(to: url) {
                _ = try await dependencies.importCaptureUseCase.execute(from: url)
                CaptureBundleLocator.remember(url)
                bundlePath = url.path
                await refresh()
                NotificationCenter.default.post(name: .mareDeskDataDidRefresh, object: nil)
            }
        } catch {
            errorMessage = error.localizedDescription
            AppLogger.importing.error("History import failed: \(error.localizedDescription, privacy: .public)")
        }
    }
}

extension Notification.Name {
    static let mareDeskDataDidRefresh = Notification.Name("MareDesk.dataDidRefresh")
}
