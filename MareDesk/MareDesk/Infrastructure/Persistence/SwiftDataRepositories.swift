import Foundation
import SwiftData

@MainActor
final class SwiftDataHoldingRepository: CompositeDeskRepository {
    private let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    func fetchAll() async throws -> [Holding] {
        let descriptor = FetchDescriptor<Holding>(sortBy: [SortDescriptor(\.currentAmount, order: .reverse)])
        return try context.fetch(descriptor)
    }

    func fetchFiltered(_ filter: HoldingFilter) async throws -> [Holding] {
        var holdings = try await fetchAll()

        if let status = filter.status {
            holdings = holdings.filter { $0.status == status }
        }

        if let code = filter.categoryCode, !code.isEmpty, code.uppercased() != "ALL" {
            holdings = holdings.filter { $0.category?.code.uppercased() == code.uppercased() }
        }

        if !filter.searchText.isEmpty {
            let needle = filter.searchText.lowercased()
            holdings = holdings.filter { holding in
                holding.instrumentName.lowercased().contains(needle)
                    || holding.symbol.lowercased().contains(needle)
                    || holding.bucketLabel.lowercased().contains(needle)
                    || holding.annotation.lowercased().contains(needle)
            }
        }

        switch filter.sortKey {
        case .nameAscending:
            holdings.sort { $0.instrumentName < $1.instrumentName }
        case .nameDescending:
            holdings.sort { $0.instrumentName > $1.instrumentName }
        case .currentAscending:
            holdings.sort { $0.currentAmount < $1.currentAmount }
        case .currentDescending:
            holdings.sort { $0.currentAmount > $1.currentAmount }
        case .targetAscending:
            holdings.sort { $0.targetAmount < $1.targetAmount }
        case .targetDescending:
            holdings.sort { $0.targetAmount > $1.targetAmount }
        case .refreshedAscending:
            holdings.sort { $0.refreshedAt < $1.refreshedAt }
        case .refreshedDescending:
            holdings.sort { $0.refreshedAt > $1.refreshedAt }
        }

        return holdings
    }

    func replaceAll(_ holdings: [Holding]) async throws {
        let existing = try context.fetch(FetchDescriptor<Holding>())
        existing.forEach { context.delete($0) }
        holdings.forEach { context.insert($0) }
        try context.save()
    }

    func fetchCategories() async throws -> [AssetCategory] {
        let descriptor = FetchDescriptor<AssetCategory>(sortBy: [SortDescriptor(\.sortIndex)])
        return try context.fetch(descriptor)
    }

    func replaceCategories(_ categories: [AssetCategory]) async throws {
        let existing = try context.fetch(FetchDescriptor<AssetCategory>())
        existing.forEach { context.delete($0) }
        categories.forEach { context.insert($0) }
        try context.save()
    }

    func fetchIndicators() async throws -> [MacroIndicator] {
        let descriptor = FetchDescriptor<MacroIndicator>(sortBy: [SortDescriptor(\.indicatorName)])
        return try context.fetch(descriptor)
    }

    func replaceIndicators(_ indicators: [MacroIndicator]) async throws {
        let existing = try context.fetch(FetchDescriptor<MacroIndicator>())
        existing.forEach { context.delete($0) }
        indicators.forEach { context.insert($0) }
        try context.save()
    }

    func fetchProperties() async throws -> [PropertyRecord] {
        let descriptor = FetchDescriptor<PropertyRecord>(sortBy: [SortDescriptor(\.municipality), SortDescriptor(\.propertyName)])
        return try context.fetch(descriptor)
    }

    func replaceProperties(_ records: [PropertyRecord]) async throws {
        let existing = try context.fetch(FetchDescriptor<PropertyRecord>())
        existing.forEach { context.delete($0) }
        records.forEach { context.insert($0) }
        try context.save()
    }
}

@MainActor
final class SwiftDataCaptureRepository: CaptureRepository {
    private let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    func latestCapture() async throws -> CaptureEvent? {
        var descriptor = FetchDescriptor<CaptureEvent>(sortBy: [SortDescriptor(\.capturedAt, order: .reverse)])
        descriptor.fetchLimit = 1
        return try context.fetch(descriptor).first
    }

    func fetchHistory(limit: Int) async throws -> [CaptureEvent] {
        var descriptor = FetchDescriptor<CaptureEvent>(sortBy: [SortDescriptor(\.capturedAt, order: .reverse)])
        descriptor.fetchLimit = max(1, min(limit, 100))
        return try context.fetch(descriptor)
    }

    func recordCapture(_ event: CaptureEvent) async throws {
        context.insert(event)
        try context.save()
    }

    func storeFrozenPayloads(_ payloads: [FrozenCapturePayload], for capture: CaptureEvent) async throws {
        payloads.forEach { payload in
            payload.captureEvent = capture
            context.insert(payload)
        }
        try context.save()
    }

    func hasAnyHoldings() async throws -> Bool {
        var descriptor = FetchDescriptor<Holding>()
        descriptor.fetchLimit = 1
        return try !context.fetch(descriptor).isEmpty
    }

    func fetchCapture(id: String) async throws -> CaptureEvent? {
        let events = try context.fetch(FetchDescriptor<CaptureEvent>())
        return events.first { String(describing: $0.persistentModelID) == id }
    }

    func fetchMemos(scope: MemoScope?, limit: Int) async throws -> [OperatorMemo] {
        var descriptor = FetchDescriptor<OperatorMemo>(sortBy: [SortDescriptor(\.createdAt, order: .reverse)])
        let all = try context.fetch(descriptor)

        let scoped: [OperatorMemo]
        if let scope {
            scoped = all.filter { $0.scope == scope }
        } else {
            scoped = all
        }

        if let latest = try await latestCapture() {
            let filtered = scoped.filter { $0.captureEvent?.persistentModelID == latest.persistentModelID }
            return Array(filtered.prefix(limit))
        }

        return Array(scoped.prefix(limit))
    }

    func replaceMemos(_ memos: [OperatorMemo], for capture: CaptureEvent) async throws {
        memos.forEach { memo in
            memo.captureEvent = capture
            context.insert(memo)
        }
        try context.save()
    }
}
