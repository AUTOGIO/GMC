import Foundation
import Observation

@MainActor
@Observable
final class PortfolioDeskViewModel {
    private let useCase: FilterHoldingsUseCase

    var snapshot: PortfolioDeskSnapshot?
    var filter = HoldingFilter.default
    var isLoading = false
    var errorMessage: String?

    init(useCase: FilterHoldingsUseCase) {
        self.useCase = useCase
    }

    func refresh() async {
        isLoading = true
        defer { isLoading = false }

        do {
            snapshot = try await useCase.execute(filter: filter)
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func apply(search: String, status: HoldingStatus?, categoryCode: String?) async {
        filter.searchText = search
        filter.status = status
        filter.categoryCode = categoryCode
        await refresh()
    }
}
