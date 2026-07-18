import OSLog

enum AppLogger {
    static let persistence = Logger(subsystem: "com.giovanninimare.MareDesk", category: "Persistence")
    static let importing = Logger(subsystem: "com.giovanninimare.MareDesk", category: "Import")
    static let ai = Logger(subsystem: "com.giovanninimare.MareDesk", category: "AI")
    static let ui = Logger(subsystem: "com.giovanninimare.MareDesk", category: "UI")
}
