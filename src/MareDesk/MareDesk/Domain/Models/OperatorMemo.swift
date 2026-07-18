import Foundation
import SwiftData

enum MemoScope: String, Codable, CaseIterable, Sendable {
    case overview
    case portfolio
    case macro
    case realEstate
}

@Model
final class OperatorMemo {
    var title: String
    var bodyText: String
    var scopeRaw: String
    var createdAt: Date
    var captureEvent: CaptureEvent?

    init(
        title: String,
        bodyText: String,
        scope: MemoScope,
        captureEvent: CaptureEvent? = nil,
        createdAt: Date = .now
    ) {
        self.title = title
        self.bodyText = bodyText
        self.scopeRaw = scope.rawValue
        self.createdAt = createdAt
        self.captureEvent = captureEvent
    }

    var scope: MemoScope {
        MemoScope(rawValue: scopeRaw) ?? .overview
    }

    var isTriggerRule: Bool {
        title.hasPrefix("Trigger:")
    }
}
