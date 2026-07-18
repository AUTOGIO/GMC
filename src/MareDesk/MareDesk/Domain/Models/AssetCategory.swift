import Foundation
import SwiftData

@Model
final class AssetCategory {
    @Attribute(.unique) var code: String
    var displayName: String
    var accentHex: String
    var sortIndex: Int

    init(code: String, displayName: String, accentHex: String, sortIndex: Int) {
        self.code = code
        self.displayName = displayName
        self.accentHex = accentHex
        self.sortIndex = sortIndex
    }

    static let canonical: [(String, String, String, Int)] = [
        ("CASH", "Cash", "#FFB703", 1),
        ("BONDS", "Bonds", "#7AE582", 2),
        ("GOLD", "Gold", "#F4D35E", 3),
        ("EQ", "Equities", "#4CC9F0", 4),
        ("CRYPTO", "Digital Assets", "#4895EF", 5)
    ]
}
