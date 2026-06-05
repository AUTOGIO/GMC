import Foundation
import SwiftData

@Model
final class MacroIndicator {
    var indicatorName: String
    var reading: Decimal
    var regimeLabel: String
    var emphasisToken: String
    var annotation: String
    var refreshedAt: Date

    init(
        indicatorName: String,
        reading: Decimal,
        regimeLabel: String,
        emphasisToken: String = "cyan",
        annotation: String = "",
        refreshedAt: Date = .now
    ) {
        self.indicatorName = indicatorName
        self.reading = reading
        self.regimeLabel = regimeLabel
        self.emphasisToken = emphasisToken
        self.annotation = annotation
        self.refreshedAt = refreshedAt
    }
}
