import Foundation
import SwiftData

@Model
final class PropertyRecord {
    var propertyName: String
    var propertyKind: String
    var municipality: String
    var marketAmount: Decimal
    var assessedAmount: Decimal
    var footprintSquareMeters: Decimal
    var operationalState: String
    var refreshedAt: Date

    init(
        propertyName: String,
        propertyKind: String,
        municipality: String,
        marketAmount: Decimal,
        assessedAmount: Decimal,
        footprintSquareMeters: Decimal,
        operationalState: String = "OPERATIVE",
        refreshedAt: Date = .now
    ) {
        self.propertyName = propertyName
        self.propertyKind = propertyKind
        self.municipality = municipality
        self.marketAmount = marketAmount
        self.assessedAmount = assessedAmount
        self.footprintSquareMeters = footprintSquareMeters
        self.operationalState = operationalState
        self.refreshedAt = refreshedAt
    }

    var marketMoney: Money { Money(amount: marketAmount, currencyCode: "BRL") }
    var assessedMoney: Money { Money(amount: assessedAmount, currencyCode: "BRL") }
}
