import Foundation
import Observation

@MainActor
@Observable
final class OverviewViewModel {
    private let useCase: LoadOverviewUseCase

    var snapshot: OverviewSnapshot?
    var isLoading = false
    var errorMessage: String?

    init(useCase: LoadOverviewUseCase) {
        self.useCase = useCase
    }

    func refresh() async {
        isLoading = true
        defer { isLoading = false }

        do {
            snapshot = try await useCase.execute()
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
            AppLogger.ui.error("Overview refresh failed: \(error.localizedDescription, privacy: .public)")
        }
    }
}
