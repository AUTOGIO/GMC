import Foundation

enum OperatorDataMode: String, Sendable {
    case ibkrLive = "IBKR-LIVE"
    case localImport = "LOCAL-IMPORT"
    case offline = "OFFLINE"
}

@MainActor
enum OperatorRuntimeStatus {
    static func resolve(brokerageAvailable: Bool) -> (mode: OperatorDataMode, source: String) {
        if brokerageAvailable {
            return (.localImport, "IBKR gateway detected — book still from local import")
        }
        if let bundle = CaptureBundleLocator.defaultBundleURL() {
            return (.localImport, CaptureBundleLocator.dataSourceLabel(for: bundle))
        }
        return (.offline, "—")
    }
}
