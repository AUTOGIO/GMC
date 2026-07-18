import Foundation
import SwiftData

@MainActor
struct OverviewAssembler {
    func assemble(
        holdings: [Holding],
        categories: [AssetCategory],
        indicators: [MacroIndicator],
        memos: [OperatorMemo]
    ) -> OverviewSnapshot {
        let totalCurrent = holdings.reduce(Decimal.zero) { $0 + $1.currentAmount }
        let totalTarget = holdings.reduce(Decimal.zero) { $0 + $1.targetAmount }

        let allocationRows = categories.map { category in
            let scoped = holdings.filter { $0.category?.persistentModelID == category.persistentModelID }
            let current = scoped.reduce(Decimal.zero) { $0 + $1.currentAmount }
            let target = scoped.reduce(Decimal.zero) { $0 + $1.targetAmount }
            return AllocationRow(
                id: category.code,
                categoryName: category.displayName,
                accentHex: category.accentHex,
                current: current,
                target: target,
                driftPercent: percentDelta(current - target, of: target),
                weightPercent: percentPart(current, of: totalCurrent)
            )
        }

        let topHoldings = holdings
            .sorted { $0.currentAmount > $1.currentAmount }
            .prefix(8)
            .map(holdingSummary)

        let macroSummaries = indicators.map(macroSummary)
        let memoSummaries = memos.prefix(8).map(memoSummary)

        let latestRefresh = holdings.map(\.refreshedAt).max()
            ?? indicators.map(\.refreshedAt).max()
            ?? .distantPast
        let ageMinutes = max(Int(Date().timeIntervalSince(latestRefresh) / 60), 0)

        let regime = indicators.first(where: { $0.indicatorName.lowercased() == "current macro regime" })?.regimeLabel
            ?? indicators.first?.regimeLabel
            ?? "UNSET"

        return OverviewSnapshot(
            kpis: OverviewKPIs(
                totalCurrent: totalCurrent,
                totalTarget: totalTarget,
                driftPercent: percentDelta(totalCurrent - totalTarget, of: totalTarget),
                activeCount: holdings.filter { $0.status == .active }.count,
                watchCount: holdings.filter { $0.status == .watch }.count
            ),
            allocationRows: allocationRows,
            topHoldings: Array(topHoldings),
            macroIndicators: macroSummaries,
            recentMemos: Array(memoSummaries),
            health: SystemHealth(
                holdingCount: holdings.count,
                indicatorCount: indicators.count,
                categoryCount: categories.count,
                dataAgeMinutes: ageMinutes
            ),
            activeRegime: regime
        )
    }

    private func holdingSummary(_ holding: Holding) -> HoldingSummary {
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

    private func macroSummary(_ indicator: MacroIndicator) -> MacroSummary {
        MacroSummary(
            id: String(describing: indicator.persistentModelID),
            name: indicator.indicatorName,
            reading: indicator.reading,
            regime: indicator.regimeLabel,
            emphasisToken: indicator.emphasisToken,
            annotation: indicator.annotation
        )
    }

    private func memoSummary(_ memo: OperatorMemo) -> MemoSummary {
        MemoSummary(
            id: String(describing: memo.persistentModelID),
            title: memo.title,
            body: memo.bodyText,
            scope: memo.scope,
            createdAt: memo.createdAt
        )
    }

    private func percentDelta(_ delta: Decimal, of base: Decimal) -> Double {
        guard base != 0 else { return 0 }
        let ratio = (delta as NSDecimalNumber).doubleValue / (base as NSDecimalNumber).doubleValue
        return (ratio * 100).rounded(toPlaces: 2)
    }

    private func percentPart(_ part: Decimal, of total: Decimal) -> Double {
        guard total != 0 else { return 0 }
        let ratio = (part as NSDecimalNumber).doubleValue / (total as NSDecimalNumber).doubleValue
        return (ratio * 100).rounded(toPlaces: 2)
    }
}
