import Foundation

enum HoldingStatus: String, Codable, CaseIterable, Sendable {
    case active = "ACTIVE"
    case hold = "HOLD"
    case pending = "PENDING"
    case watch = "WATCH"

    var label: String {
        switch self {
        case .active: "Active"
        case .hold: "Hold"
        case .pending: "Pending"
        case .watch: "Watch"
        }
    }

    var tone: DeskTone {
        switch self {
        case .active: .positive
        case .hold: .neutral
        case .pending: .caution
        case .watch: .alert
        }
    }

    static func fromGMCExecutionStatus(_ raw: String?) -> HoldingStatus {
        let normalized = (raw ?? "").trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        switch normalized {
        case "executed", "active", "held", "deployed":
            return .active
        case "hold", "paused", "deferred":
            return .hold
        case "watch", "monitoring", "review":
            return .watch
        case "planned", "pending", "queued", "":
            return .pending
        default:
            return .pending
        }
    }
}
