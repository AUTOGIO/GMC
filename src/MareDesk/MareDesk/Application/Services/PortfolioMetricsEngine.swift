import Foundation

@MainActor
struct PortfolioMetricsEngine {
    func compute(for holdings: [Holding]) -> PortfolioMetrics {
        let totalCurrent = holdings.reduce(Decimal.zero) { $0 + $1.currentAmount }

        let liquidityValue = holdings
            .filter { holding in
                let bucket = holding.bucketLabel.lowercased()
                return ["cash", "liquid", "treasury", "reserve"].contains { bucket.contains($0) }
            }
            .reduce(Decimal.zero) { $0 + $1.currentAmount }

        let preservationValue = holdings
            .filter { $0.status == .active || $0.status == .hold }
            .reduce(Decimal.zero) { $0 + $1.currentAmount }

        let convexityScore: Double = {
            guard !holdings.isEmpty else { return 0 }
            let count = holdings.filter { $0.status == .watch || $0.status == .pending }.count
            return (Double(count) / Double(holdings.count) * 100).rounded(toPlaces: 2)
        }()

        return PortfolioMetrics(
            totalCurrent: totalCurrent,
            liquidityRatio: percent(liquidityValue, of: totalCurrent),
            preservationRatio: percent(preservationValue, of: totalCurrent),
            convexityScore: convexityScore,
            liquidityValue: liquidityValue
        )
    }

    func allocationRows(holdings: [Holding], categories: [AssetCategory]) -> [AllocationRow] {
        let totalCurrent = holdings.reduce(Decimal.zero) { $0 + $1.currentAmount }
        return categories.compactMap { category in
            let scoped = holdings.filter { $0.category?.persistentModelID == category.persistentModelID }
            guard !scoped.isEmpty else { return nil }
            let current = scoped.reduce(Decimal.zero) { $0 + $1.currentAmount }
            let target = scoped.reduce(Decimal.zero) { $0 + $1.targetAmount }
            return AllocationRow(
                id: category.code,
                categoryName: category.displayName,
                accentHex: category.accentHex,
                current: current,
                target: target,
                driftPercent: percent(current - target, of: target),
                weightPercent: percent(current, of: totalCurrent)
            )
        }
    }

    private func percent(_ part: Decimal, of total: Decimal) -> Double {
        guard total != 0 else { return 0 }
        let ratio = (part as NSDecimalNumber).doubleValue / (total as NSDecimalNumber).doubleValue
        return (ratio * 100).rounded(toPlaces: 2)
    }
}
