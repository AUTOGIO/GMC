import Foundation

enum CaptureBundleLocator {
    static let userDefaultsKey = "MareDesk.preferredCaptureBundlePath"

    /// Canonical Giovannini Mare Capital repository (iCloud-synced AUTOGIO/GMC).
    static var primaryGMCRepositoryRoot: URL {
        FileManager.default.homeDirectoryForCurrentUser
            .appendingPathComponent("Library/Mobile Documents/com~apple~CloudDocs/Projects (Essential)/GitHub/AUTOGIO/GMC", isDirectory: true)
    }

    static var primaryCaptureBundleURL: URL {
        primaryGMCRepositoryRoot.appendingPathComponent("data/gmc_source", isDirectory: true)
    }

    static var legacyCaptureBundleURL: URL {
        primaryGMCRepositoryRoot
            .appendingPathComponent(".GMC_TUI_DJANGO/data/gmc_source", isDirectory: true)
    }

    static var sandboxedCaptureBundleURL: URL? {
        guard let support = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first else {
            return nil
        }
        let bundled = support.appendingPathComponent("gmc_capture", isDirectory: true)
        return isValidBundle(at: bundled) ? bundled : nil
    }

    static func candidateURLs() -> [URL] {
        var candidates: [URL] = []

        let env = ProcessInfo.processInfo.environment
        if let envPath = env["MARE_DESK_CAPTURE_BUNDLE"], !envPath.isEmpty {
            candidates.append(URL(fileURLWithPath: envPath, isDirectory: true))
        }

        if let sandboxed = sandboxedCaptureBundleURL {
            candidates.append(sandboxed)
        }

        candidates.append(primaryCaptureBundleURL)
        candidates.append(legacyCaptureBundleURL)

        if let saved = UserDefaults.standard.string(forKey: userDefaultsKey) {
            candidates.append(URL(fileURLWithPath: saved, isDirectory: true))
        }

        if let gmcRoot = env["GMC_WEBAPP_ROOT"], !gmcRoot.isEmpty {
            let root = URL(fileURLWithPath: gmcRoot, isDirectory: true)
            candidates.append(root.appendingPathComponent("data/gmc_source", isDirectory: true))
            candidates.append(root.appendingPathComponent(".GMC_TUI_DJANGO/data/gmc_source", isDirectory: true))
        }

        let home = FileManager.default.homeDirectoryForCurrentUser
        candidates.append(home.appendingPathComponent("Documents/GitHub/AUTOGIO/GMC/data/gmc_source", isDirectory: true))
        candidates.append(home.appendingPathComponent("Documents/GitHub/AUTOGIO/GMC/.GMC_TUI_DJANGO/data/gmc_source", isDirectory: true))

        if let devRoot = developerProjectRoot() {
            candidates.append(devRoot.appendingPathComponent("data/gmc_source", isDirectory: true))
        }

        var seen = Set<String>()
        return candidates.filter { url in
            let path = url.standardizedFileURL.path
            guard !seen.contains(path) else { return false }
            seen.insert(path)
            return isValidBundle(at: url)
        }
    }

    static func defaultBundleURL() -> URL? {
        candidateURLs().first
    }

    static func dataSourceLabel(for url: URL?) -> String {
        guard let url else { return "—" }
        let path = url.standardizedFileURL.path
        if path.contains("/data/gmc_source") { return "GMC/data/gmc_source" }
        if path.contains("gmc_capture") { return "App Support/gmc_capture" }
        return url.lastPathComponent
    }

    static func remember(_ url: URL) {
        UserDefaults.standard.set(url.standardizedFileURL.path, forKey: userDefaultsKey)
    }

    static func isValidBundle(at url: URL) -> Bool {
        let portfolio = url.appendingPathComponent("portfolio/gmc_portfolio_state.json")
        let property = url.appendingPathComponent("real_estate/imoveis_state.json")
        return FileManager.default.fileExists(atPath: portfolio.path)
            && FileManager.default.fileExists(atPath: property.path)
    }

    private static func developerProjectRoot() -> URL? {
        let sourceFile = URL(fileURLWithPath: #filePath)
        var directory = sourceFile.deletingLastPathComponent()
        for _ in 0..<8 {
            if directory.lastPathComponent == "MareDesk" {
                return directory.deletingLastPathComponent()
            }
            directory.deleteLastPathComponent()
        }
        return nil
    }
}
