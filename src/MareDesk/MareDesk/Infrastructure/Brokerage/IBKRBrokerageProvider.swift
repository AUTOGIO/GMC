import Foundation

struct BrokeragePosition: Sendable {
    let symbol: String
    let description: String
    let quantity: Decimal
    let marketValueUSD: Decimal
    let currency: String
}

enum BrokerageProviderError: LocalizedError {
    case gatewayUnavailable
    case notAuthenticated
    case transport(String)

    var errorDescription: String? {
        switch self {
        case .gatewayUnavailable:
            "IBKR Client Portal Gateway is not running on localhost:5001."
        case .notAuthenticated:
            "IBKR Gateway is running but not authenticated. Log in via the Gateway web UI."
        case .transport(let message):
            message
        }
    }
}

protocol BrokerageDataProvider: Sendable {
    var displayName: String { get }
    func isAvailable() async -> Bool
    func isAuthenticated() async -> Bool
    func fetchPositions() async throws -> [BrokeragePosition]
}

struct IBKRBrokerageProvider: BrokerageDataProvider {
    let displayName = "Interactive Brokers"
    private let baseURL: URL
    private let session: URLSession

    init(
        baseURL: URL = URL(string: "https://localhost:5001/v1/api")!,
        session: URLSession = .shared
    ) {
        self.baseURL = baseURL
        self.session = session
    }

    func isAvailable() async -> Bool {
        await probe(endpoint: "iserver/auth/status")
    }

    func isAuthenticated() async -> Bool {
        guard let url = URL(string: "iserver/auth/status", relativeTo: baseURL) else { return false }
        var request = URLRequest(url: url)
        request.timeoutInterval = 1.5
        do {
            let (data, response) = try await session.data(for: request)
            guard (response as? HTTPURLResponse)?.statusCode == 200 else { return false }
            guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else { return false }
            return (json["authenticated"] as? Bool) == true
        } catch {
            return false
        }
    }

    func fetchPositions() async throws -> [BrokeragePosition] {
        guard await isAvailable() else { throw BrokerageProviderError.gatewayUnavailable }
        guard await isAuthenticated() else { throw BrokerageProviderError.notAuthenticated }

        guard let url = URL(string: "portfolio/accounts", relativeTo: baseURL) else {
            throw BrokerageProviderError.transport("Invalid portfolio endpoint.")
        }

        var request = URLRequest(url: url)
        request.timeoutInterval = 5
        let (data, response) = try await session.data(for: request)
        guard (response as? HTTPURLResponse)?.statusCode == 200 else {
            throw BrokerageProviderError.transport("IBKR portfolio request failed.")
        }

        guard let accounts = try JSONSerialization.jsonObject(with: data) as? [[String: Any]],
              let accountID = accounts.first?["accountId"] as? String else {
            return []
        }

        guard let positionsURL = URL(string: "portfolio/\(accountID)/positions/0", relativeTo: baseURL) else {
            throw BrokerageProviderError.transport("Invalid positions endpoint.")
        }

        let (positionsData, positionsResponse) = try await session.data(from: positionsURL)
        guard (positionsResponse as? HTTPURLResponse)?.statusCode == 200 else {
            throw BrokerageProviderError.transport("IBKR positions request failed.")
        }

        guard let rows = try JSONSerialization.jsonObject(with: positionsData) as? [[String: Any]] else {
            return []
        }

        return rows.compactMap { row in
            let symbol = row["ticker"] as? String ?? row["contractDesc"] as? String ?? ""
            guard !symbol.isEmpty else { return nil }
            let quantity = Decimal(string: String(describing: row["position"] ?? 0)) ?? 0
            let marketValue = Decimal(string: String(describing: row["mktValue"] ?? 0)) ?? 0
            return BrokeragePosition(
                symbol: symbol,
                description: row["contractDesc"] as? String ?? symbol,
                quantity: quantity,
                marketValueUSD: marketValue,
                currency: row["currency"] as? String ?? "USD"
            )
        }
    }

    private func probe(endpoint: String) async -> Bool {
        guard let url = URL(string: endpoint, relativeTo: baseURL) else { return false }
        var request = URLRequest(url: url)
        request.timeoutInterval = 1.5
        do {
            let (_, response) = try await session.data(for: request)
            return (response as? HTTPURLResponse)?.statusCode == 200
        } catch {
            return false
        }
    }
}

@MainActor
@Observable
final class BrokerageDataCoordinator {
    private(set) var isIBKRAvailable = false
    private(set) var isIBKRAuthenticated = false
    private let provider: any BrokerageDataProvider

    init(provider: any BrokerageDataProvider = IBKRBrokerageProvider()) {
        self.provider = provider
    }

    func refreshAvailability() async {
        let available = await provider.isAvailable()
        isIBKRAvailable = available
        isIBKRAuthenticated = available ? await provider.isAuthenticated() : false
    }

    func fetchLivePositions() async throws -> [BrokeragePosition] {
        try await provider.fetchPositions()
    }
}
