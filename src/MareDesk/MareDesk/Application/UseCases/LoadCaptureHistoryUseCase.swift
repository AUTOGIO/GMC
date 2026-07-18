import Foundation

@MainActor
struct LoadCaptureHistoryUseCase {
    let captureRepository: CaptureRepository

    func execute(limit: Int = 25) async throws -> CaptureHistorySnapshot {
        let events = try await captureRepository.fetchHistory(limit: limit)
        let latestID = events.first.map { String(describing: $0.persistentModelID) }

        let entries = events.map { event in
            CaptureHistoryEntry(
                id: String(describing: event.persistentModelID),
                capturedAt: event.capturedAt,
                origin: event.origin,
                initiatedBy: event.initiatedBy,
                note: event.note,
                holdingCount: event.holdingCount,
                indicatorCount: event.indicatorCount,
                propertyCount: event.propertyCount,
                totalCurrentUSD: event.totalCurrentUSD,
                totalPropertyMarketBRL: event.totalPropertyMarketBRL,
                activeRegime: event.activeRegime,
                portfolioAsOf: event.portfolioAsOf,
                propertyAsOf: event.propertyAsOf,
                isLatest: String(describing: event.persistentModelID) == latestID
            )
        }

        return CaptureHistorySnapshot(entries: entries, latest: entries.first)
    }
}
