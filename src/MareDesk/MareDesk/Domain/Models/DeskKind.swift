import Foundation

enum DeskKind: String, CaseIterable, Identifiable, Sendable {
    case overview
    case portfolio
    case macro
    case realEstate
    case history

    var id: String { rawValue }

    var title: String {
        switch self {
        case .overview: "Overview"
        case .portfolio: "Portfolio"
        case .macro: "Macro"
        case .realEstate: "Real Estate"
        case .history: "History"
        }
    }

    var subtitle: String {
        switch self {
        case .overview: "Mission Control"
        case .portfolio: "Holdings Matrix"
        case .macro: "Regime Signals"
        case .realEstate: "Property Book"
        case .history: "Capture Timeline"
        }
    }

    var shortcutLabel: String {
        switch self {
        case .overview: "⌘1"
        case .portfolio: "⌘2"
        case .macro: "⌘3"
        case .realEstate: "⌘4"
        case .history: "⌘5"
        }
    }

    var systemImage: String {
        switch self {
        case .overview: "gauge.with.dots.needle.67percent"
        case .portfolio: "chart.pie.fill"
        case .macro: "waveform.path.ecg"
        case .realEstate: "building.2.fill"
        case .history: "clock.arrow.circlepath"
        }
    }

    var shellDomain: ShellDomain {
        switch self {
        case .overview, .portfolio, .macro, .history: .financial
        case .realEstate: .property
        }
    }
}

enum ShellDomain: Sendable {
    case financial
    case property
}
