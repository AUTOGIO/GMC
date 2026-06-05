import Foundation
import SwiftData

enum CaptureDomain: String, Codable, CaseIterable, Sendable {
    case financial
    case property

    var label: String {
        switch self {
        case .financial: "Financial"
        case .property: "Property"
        }
    }
}

@Model
final class FrozenCapturePayload {
    var domainRaw: String
    var payloadJSON: String
    var capturedAt: Date
    var captureEvent: CaptureEvent?

    init(domain: CaptureDomain, payloadJSON: String, capturedAt: Date = .now, captureEvent: CaptureEvent? = nil) {
        self.domainRaw = domain.rawValue
        self.payloadJSON = payloadJSON
        self.capturedAt = capturedAt
        self.captureEvent = captureEvent
    }

    var domain: CaptureDomain {
        CaptureDomain(rawValue: domainRaw) ?? .financial
    }
}
