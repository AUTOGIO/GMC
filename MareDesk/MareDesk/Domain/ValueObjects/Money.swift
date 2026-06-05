import Foundation

struct Money: Hashable, Codable, Sendable {
    let amount: Decimal
    let currencyCode: String

    static let zeroUSD = Money(amount: 0, currencyCode: "USD")

    func formatted(maximumFractionDigits: Int = 2) -> String {
        let number = amount as NSDecimalNumber
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = currencyCode
        formatter.maximumFractionDigits = maximumFractionDigits
        return formatter.string(from: number) ?? "\(currencyCode) \(amount)"
    }
}

struct AllocationDrift: Hashable, Sendable {
    let current: Money
    let target: Money

    var delta: Decimal { current.amount - target.amount }

    var driftPercent: Double {
        guard target.amount != 0 else { return 0 }
        let ratio = (delta as NSDecimalNumber).doubleValue / (target.amount as NSDecimalNumber).doubleValue
        return (ratio * 100).rounded(toPlaces: 2)
    }

    var weightPercent: Double {
        // Caller supplies total; this is a helper for single-category weight when total known externally.
        0
    }
}

extension Double {
    func rounded(toPlaces places: Int) -> Double {
        let divisor = pow(10.0, Double(places))
        return (self * divisor).rounded() / divisor
    }
}
