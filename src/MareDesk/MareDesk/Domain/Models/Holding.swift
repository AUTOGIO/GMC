import Foundation
import SwiftData

@Model
final class Holding {
    var instrumentName: String
    var symbol: String
    var bucketLabel: String
    var currentAmount: Decimal
    var targetAmount: Decimal
    var statusRaw: String
    var annotation: String
    var refreshedAt: Date
    var category: AssetCategory?

    init(
        instrumentName: String,
        symbol: String = "",
        bucketLabel: String,
        currentAmount: Decimal,
        targetAmount: Decimal,
        status: HoldingStatus = .active,
        annotation: String = "",
        category: AssetCategory? = nil,
        refreshedAt: Date = .now
    ) {
        self.instrumentName = instrumentName
        self.symbol = symbol
        self.bucketLabel = bucketLabel
        self.currentAmount = currentAmount
        self.targetAmount = targetAmount
        self.statusRaw = status.rawValue
        self.annotation = annotation
        self.category = category
        self.refreshedAt = refreshedAt
    }

    var status: HoldingStatus {
        get { HoldingStatus(rawValue: statusRaw) ?? .active }
        set { statusRaw = newValue.rawValue }
    }

    var currentMoney: Money { Money(amount: currentAmount, currencyCode: "USD") }
    var targetMoney: Money { Money(amount: targetAmount, currencyCode: "USD") }
}
