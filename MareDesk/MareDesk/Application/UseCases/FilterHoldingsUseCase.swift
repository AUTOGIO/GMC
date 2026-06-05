import Foundation

@MainActor
struct FilterHoldingsUseCase {
    let holdingRepository: HoldingRepository
    let metricsEngine: PortfolioMetricsEngine

    func execute(filter: HoldingFilter) async throws -> PortfolioDeskSnapshot {
        let holdings = try await holdingRepository.fetchFiltered(filter)
        let categories = try await holdingRepository.fetchCategories()

        let summaries = holdings.map { holding in
            HoldingSummary(
                id: String(describing: holding.persistentModelID),
                name: holding.instrumentName,
                symbol: holding.symbol,
                current: holding.currentAmount,
                target: holding.targetAmount,
                status: holding.status,
                categoryName: holding.category?.displayName ?? "—",
                bucketLabel: holding.bucketLabel
            )
        }

        return PortfolioDeskSnapshot(
            holdings: summaries,
            allocationRows: metricsEngine.allocationRows(holdings: holdings, categories: categories),
            metrics: metricsEngine.compute(for: holdings),
            appliedFilter: filter
        )
    }
}
