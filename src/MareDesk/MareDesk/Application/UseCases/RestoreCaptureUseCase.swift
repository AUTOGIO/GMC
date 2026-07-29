import Foundation
import SwiftData

enum RestoreCaptureError: LocalizedError {
    case captureNotFound
    case missingFrozenPayload
    case missingSourcePath
    case invalidSourceBundle

    var errorDescription: String? {
        switch self {
        case .captureNotFound:
            "The selected capture could not be found in local history."
        case .missingFrozenPayload:
            "This capture has no archived frozen payload to restore."
        case .missingSourcePath:
            "This capture has no source bundle path in its metadata."
        case .invalidSourceBundle:
            "The archived source bundle is no longer available on disk."
        }
    }
}

@MainActor
struct RestoreCaptureUseCase {
    let captureRepository: CaptureRepository
    let importCaptureUseCase: ImportCaptureUseCase

    func execute(captureID: String) async throws -> CaptureEvent {
        guard let event = try await captureRepository.fetchCapture(id: captureID) else {
            throw RestoreCaptureError.captureNotFound
        }

        let payloads = try await captureRepository.fetchFrozenPayloads(for: event)
        if !payloads.isEmpty {
            return try await importCaptureUseCase.restoreFromFrozen(capture: event, payloads: payloads)
        }

        let metadata = event.metadata
        guard let sourcePath = metadata["source"], !sourcePath.isEmpty else {
            throw RestoreCaptureError.missingFrozenPayload
        }

        let sourceURL = URL(fileURLWithPath: sourcePath, isDirectory: true)
        guard CaptureBundleLocator.isValidBundle(at: sourceURL) else {
            throw RestoreCaptureError.invalidSourceBundle
        }

        return try await importCaptureUseCase.execute(from: sourceURL)
    }
}

extension CaptureEvent {
    var metadata: [String: String] {
        guard let data = metadataJSON.data(using: .utf8),
              let decoded = try? JSONDecoder().decode([String: String].self, from: data) else {
            return [:]
        }
        return decoded
    }
}
