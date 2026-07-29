import Foundation

struct HoldingFilter: Sendable {
    var status: HoldingStatus?
    var categoryCode: String?
    var searchText: String
    var sortKey: HoldingSortKey

    static let `default` = HoldingFilter(status: nil, categoryCode: nil, searchText: "", sortKey: .currentDescending)
}

enum HoldingSortKey: Sendable {
    case nameAscending
    case nameDescending
    case currentAscending
    case currentDescending
    case targetAscending
    case targetDescending
    case refreshedAscending
    case refreshedDescending
}

struct OverviewSnapshot: Sendable {
    let kpis: OverviewKPIs
    let allocationRows: [AllocationRow]
    let topHoldings: [HoldingSummary]
    let macroIndicators: [MacroSummary]
    let recentMemos: [MemoSummary]
    let health: SystemHealth
    let activeRegime: String
}

struct OverviewKPIs: Sendable {
    let totalCurrent: Decimal
    let totalTarget: Decimal
    let driftPercent: Double
    let activeCount: Int
    let watchCount: Int
}

struct AllocationRow: Sendable, Identifiable {
    let id: String
    let categoryName: String
    let accentHex: String
    let current: Decimal
    let target: Decimal
    let driftPercent: Double
    let weightPercent: Double
}

struct HoldingSummary: Sendable, Identifiable {
    let id: String
    let name: String
    let symbol: String
    let current: Decimal
    let target: Decimal
    let status: HoldingStatus
    let categoryName: String
    let bucketLabel: String
}

struct MacroSummary: Sendable, Identifiable {
    let id: String
    let name: String
    let reading: Decimal
    let regime: String
    let emphasisToken: String
    let annotation: String
}

struct MemoSummary: Sendable, Identifiable {
    let id: String
    let title: String
    let body: String
    let scope: MemoScope
    let createdAt: Date
}

struct SystemHealth: Sendable {
    let holdingCount: Int
    let indicatorCount: Int
    let categoryCount: Int
    let dataAgeMinutes: Int
}

struct PortfolioDeskSnapshot: Sendable {
    let holdings: [HoldingSummary]
    let allocationRows: [AllocationRow]
    let metrics: PortfolioMetrics
    let appliedFilter: HoldingFilter
}

struct PortfolioMetrics: Sendable {
    let totalCurrent: Decimal
    let liquidityRatio: Double
    let preservationRatio: Double
    let convexityScore: Double
    let liquidityValue: Decimal
}

struct MacroDeskSnapshot: Sendable {
    let indicators: [MacroSummary]
    let triggerRules: [String]
    let operatorMemos: [MemoSummary]
}

struct PropertyDeskSnapshot: Sendable {
    let properties: [PropertySummary]
    let summary: PropertyBookSummary
    let cityRows: [CityExposureRow]
    let exposureByKind: [KindExposureRow]
    let operatorMemos: [MemoSummary]
}

struct PropertySummary: Sendable, Identifiable {
    let id: String
    let name: String
    let kind: String
    let municipality: String
    let market: Decimal
    let assessed: Decimal
    let footprint: Decimal
    let state: String
}

struct PropertyBookSummary: Sendable {
    let totalMarket: Decimal
    let totalAssessed: Decimal
    let totalFootprint: Decimal
    let unitCount: Int
    let assessmentGapPercent: Double
}

struct CityExposureRow: Sendable, Identifiable {
    let id: String
    let municipality: String
    let units: Int
    let footprint: Decimal
    let market: Decimal
    let assessed: Decimal
}

struct KindExposureRow: Sendable, Identifiable {
    let id: String
    let kind: String
    let market: Decimal
    let weightPercent: Double
}

@MainActor
protocol HoldingRepository {
    func fetchAll() async throws -> [Holding]
    func fetchFiltered(_ filter: HoldingFilter) async throws -> [Holding]
    func replaceAll(_ holdings: [Holding]) async throws
    func fetchCategories() async throws -> [AssetCategory]
    func replaceCategories(_ categories: [AssetCategory]) async throws
}

@MainActor
protocol MacroRepository {
    func fetchAll() async throws -> [MacroIndicator]
    func replaceAll(_ indicators: [MacroIndicator]) async throws
}

@MainActor
protocol PropertyRepository {
    func fetchAll() async throws -> [PropertyRecord]
    func replaceAll(_ records: [PropertyRecord]) async throws
}

@MainActor
protocol CaptureRepository {
    func latestCapture() async throws -> CaptureEvent?
    func fetchHistory(limit: Int) async throws -> [CaptureEvent]
    func recordCapture(_ event: CaptureEvent) async throws
    func storeFrozenPayloads(_ payloads: [FrozenCapturePayload], for capture: CaptureEvent) async throws
    func fetchMemos(scope: MemoScope?, limit: Int) async throws -> [OperatorMemo]
    func replaceMemos(_ memos: [OperatorMemo], for capture: CaptureEvent) async throws
    func fetchFrozenPayloads(for capture: CaptureEvent) async throws -> [FrozenCapturePayload]
    func hasAnyHoldings() async throws -> Bool
    func fetchCapture(id: String) async throws -> CaptureEvent?
}

@MainActor
protocol ExternalCaptureImporter {
    func importBundle(from directory: URL) async throws -> ImportedBundle
    func importFromFrozenPayloads(_ payloads: [FrozenCapturePayload], sourcePath: String) async throws -> ImportedBundle
}

struct ImportedBundle {
    let capture: CaptureEvent
    let categories: [AssetCategory]
    let holdings: [Holding]
    let indicators: [MacroIndicator]
    let properties: [PropertyRecord]
    let memos: [OperatorMemo]
    let frozenPayloads: [FrozenCapturePayload]
}

struct CaptureHistoryEntry: Sendable, Identifiable {
    let id: String
    let capturedAt: Date
    let origin: CaptureOrigin
    let initiatedBy: String
    let note: String
    let holdingCount: Int
    let indicatorCount: Int
    let propertyCount: Int
    let totalCurrentUSD: Decimal
    let totalPropertyMarketBRL: Decimal
    let activeRegime: String
    let portfolioAsOf: Date?
    let propertyAsOf: Date?
    let isLatest: Bool
}

struct CaptureHistorySnapshot: Sendable {
    let entries: [CaptureHistoryEntry]
    let latest: CaptureHistoryEntry?
}
