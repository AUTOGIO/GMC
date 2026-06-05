import SwiftUI

enum DeskTone {
    case positive, neutral, caution, alert, info

    var color: Color {
        switch self {
        case .positive: Color(red: 0.48, green: 0.90, blue: 0.51)
        case .neutral: Color(red: 0.30, green: 0.79, blue: 0.94)
        case .caution: Color(red: 1.0, green: 0.72, blue: 0.01)
        case .alert: Color(red: 0.98, green: 0.15, blue: 0.52)
        case .info: Color(red: 0.28, green: 0.58, blue: 0.94)
        }
    }
}

enum DeskTheme {
    static let canvas = Color(red: 0.06, green: 0.07, blue: 0.09)
    static let panel = Color(red: 0.10, green: 0.11, blue: 0.14)
    static let panelBorder = Color.white.opacity(0.08)
    static let label = Color.white.opacity(0.55)
    static let headline = Color.white.opacity(0.92)
    static let accent = Color(red: 0.30, green: 0.79, blue: 0.94)

    static func hex(_ value: String) -> Color {
        var sanitized = value.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
        if sanitized.hasPrefix("#") { sanitized.removeFirst() }
        guard sanitized.count == 6, let rgb = Int(sanitized, radix: 16) else { return accent }
        let red = Double((rgb >> 16) & 0xFF) / 255
        let green = Double((rgb >> 8) & 0xFF) / 255
        let blue = Double(rgb & 0xFF) / 255
        return Color(red: red, green: green, blue: blue)
    }
}

struct DeskPanel<Content: View>: View {
    let title: String
    @ViewBuilder var content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.system(.caption, design: .monospaced))
                .foregroundStyle(DeskTheme.label)
            content
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(DeskTheme.panel)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(DeskTheme.panelBorder, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

struct MetricTile: View {
    let label: String
    let value: String
    let tone: DeskTone

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.system(.caption2, design: .monospaced))
                .foregroundStyle(DeskTheme.label)
            Text(value)
                .font(.system(.title3, design: .monospaced).weight(.semibold))
                .foregroundStyle(tone.color)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(DeskTheme.panel)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

struct StatusRail: View {
    let mode: String
    let regime: String
    let dataSource: String
    let refreshedAt: String

    var body: some View {
        HStack(spacing: 18) {
            Label("MODE: \(mode)", systemImage: "dot.radiowaves.left.and.right")
            Label("REGIME: \(regime)", systemImage: "waveform")
            Label("SOURCE: \(dataSource)", systemImage: "externaldrive")
            Spacer()
            Text("UPDATED \(refreshedAt)")
                .font(.system(.caption, design: .monospaced))
                .foregroundStyle(DeskTheme.label)
        }
        .font(.system(.caption, design: .monospaced))
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Color.black.opacity(0.35))
    }
}
