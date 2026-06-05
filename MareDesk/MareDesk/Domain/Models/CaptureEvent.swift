import Foundation
import SwiftData

enum CaptureOrigin: String, Codable, CaseIterable, Sendable {
    case externalImport = "EXTERNAL_IMPORT"
    case manual = "MANUAL"
    case automation = "AUTOMATION"
}

@Model
final class CaptureEvent {
    var originRaw: String
    var initiatedBy: String
    var note: String
    var metadataJSON: String
    var capturedAt: Date
    var holdingCount: Int
    var indicatorCount: Int
    var propertyCount: Int
    var totalCurrentUSD: Decimal
    var totalPropertyMarketBRL: Decimal
    var activeRegime: String
    var portfolioAsOf: Date?
    var propertyAsOf: Date?

    @Relationship(deleteRule: .cascade, inverse: \OperatorMemo.captureEvent)
    var memos: [OperatorMemo] = []

    @Relationship(deleteRule: .cascade, inverse: \FrozenCapturePayload.captureEvent)
    var frozenPayloads: [FrozenCapturePayload] = []

    init(
        origin: CaptureOrigin,
        initiatedBy: String,
        note: String = "",
        metadata: [String: String] = [:],
        capturedAt: Date = .now,
        holdingCount: Int = 0,
        indicatorCount: Int = 0,
        propertyCount: Int = 0,
        totalCurrentUSD: Decimal = 0,
        totalPropertyMarketBRL: Decimal = 0,
        activeRegime: String = "UNSET",
        portfolioAsOf: Date? = nil,
        propertyAsOf: Date? = nil
    ) {
        self.originRaw = origin.rawValue
        self.initiatedBy = initiatedBy
        self.note = note
        self.metadataJSON = (try? String(data: JSONEncoder().encode(metadata), encoding: .utf8)) ?? "{}"
        self.capturedAt = capturedAt
        self.holdingCount = holdingCount
        self.indicatorCount = indicatorCount
        self.propertyCount = propertyCount
        self.totalCurrentUSD = totalCurrentUSD
        self.totalPropertyMarketBRL = totalPropertyMarketBRL
        self.activeRegime = activeRegime
        self.portfolioAsOf = portfolioAsOf
        self.propertyAsOf = propertyAsOf
    }

    var origin: CaptureOrigin {
        CaptureOrigin(rawValue: originRaw) ?? .manual
    }
}
