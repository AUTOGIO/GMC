import Foundation

enum ImportCaptureError: LocalizedError {
    case missingSourceDirectory
    case validationFailed(String)

    var errorDescription: String? {
        switch self {
        case .missingSourceDirectory:
            "The selected folder does not contain a valid capture bundle."
        case .validationFailed(let reason):
            "Import validation failed: \(reason)"
        }
    }
}

@MainActor
struct ImportCaptureUseCase {
    let importer: ExternalCaptureImporter
    let captureRepository: CaptureRepository
    let holdingRepository: HoldingRepository

    func execute(from directory: URL) async throws -> CaptureEvent {
        AppLogger.importing.info("Starting capture import from \(directory.path, privacy: .public)")

        let bundle = try await importer.importBundle(from: directory)

        try await holdingRepository.replaceCategories(bundle.categories)
        try await holdingRepository.replaceAll(bundle.holdings)

        if let composite = holdingRepository as? any CompositeDeskRepository {
            try await composite.replaceIndicators(bundle.indicators)
            try await composite.replaceProperties(bundle.properties)
        }

        try await captureRepository.recordCapture(bundle.capture)
        try await captureRepository.storeFrozenPayloads(bundle.frozenPayloads, for: bundle.capture)
        try await captureRepository.replaceMemos(bundle.memos, for: bundle.capture)

        AppLogger.importing.info(
            "Capture import completed: \(bundle.holdings.count) holdings, \(bundle.properties.count) properties, regime \(bundle.capture.activeRegime, privacy: .public)"
        )
        return bundle.capture
    }
}
