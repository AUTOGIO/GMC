import Foundation

@MainActor
struct LoadOverviewUseCase {
    let holdingRepository: HoldingRepository
    let captureRepository: CaptureRepository
    let assembler: OverviewAssembler

    func execute() async throws -> OverviewSnapshot {
        let holdings = try await holdingRepository.fetchAll()
        let categories = try await holdingRepository.fetchCategories()
        let memos = try await captureRepository.fetchMemos(scope: nil, limit: 12)

        let indicators: [MacroIndicator]
        if let composite = holdingRepository as? any CompositeDeskRepository {
            indicators = try await composite.fetchIndicators()
        } else {
            indicators = []
        }

        return assembler.assemble(
            holdings: holdings,
            categories: categories,
            indicators: indicators,
            memos: memos
        )
    }
}

protocol CompositeDeskRepository: HoldingRepository {
    func fetchIndicators() async throws -> [MacroIndicator]
    func fetchProperties() async throws -> [PropertyRecord]
    func replaceIndicators(_ indicators: [MacroIndicator]) async throws
    func replaceProperties(_ records: [PropertyRecord]) async throws
}
