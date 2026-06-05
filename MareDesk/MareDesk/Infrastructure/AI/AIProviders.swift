import Foundation

enum AIProviderKind: String, CaseIterable, Identifiable, Sendable {
    case claude
    case openAI
    case ollama
    case lmStudio

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .claude: "Claude"
        case .openAI: "OpenAI"
        case .ollama: "Ollama"
        case .lmStudio: "LM Studio"
        }
    }
}

struct AICompletionRequest: Sendable {
    let prompt: String
    let systemInstruction: String
    let maxTokens: Int
}

struct AICompletionResponse: Sendable {
    let text: String
    let provider: AIProviderKind
}

enum AIProviderError: LocalizedError {
    case notConfigured(AIProviderKind)
    case transport(String)
    case emptyResponse

    var errorDescription: String? {
        switch self {
        case .notConfigured(let kind):
            "\(kind.displayName) is not configured. Add credentials in Settings."
        case .transport(let message):
            message
        case .emptyResponse:
            "The model returned an empty response."
        }
    }
}

protocol AIProvider: Sendable {
    var kind: AIProviderKind { get }
    var isConfigured: Bool { get async }
    func complete(_ request: AICompletionRequest) async throws -> AICompletionResponse
}

@MainActor
@Observable
final class AIProviderCoordinator {
    private(set) var activeProvider: AIProviderKind = .claude
    private let providers: [AIProviderKind: any AIProvider]

    init(providers: [any AIProvider]) {
        var map: [AIProviderKind: any AIProvider] = [:]
        providers.forEach { map[$0.kind] = $0 }
        self.providers = map
    }

    func setActive(_ kind: AIProviderKind) {
        activeProvider = kind
    }

    func complete(_ request: AICompletionRequest) async throws -> AICompletionResponse {
        guard let provider = providers[activeProvider] else {
            throw AIProviderError.notConfigured(activeProvider)
        }
        guard await provider.isConfigured else {
            throw AIProviderError.notConfigured(activeProvider)
        }
        return try await provider.complete(request)
    }

    func configuredProviders() async -> [AIProviderKind] {
        var result: [AIProviderKind] = []
        for kind in AIProviderKind.allCases {
            if let provider = providers[kind], await provider.isConfigured {
                result.append(kind)
            }
        }
        return result
    }
}

struct ClaudeProvider: AIProvider {
    let kind: AIProviderKind = .claude

    var isConfigured: Bool {
        get async { ProcessInfo.processInfo.environment["ANTHROPIC_API_KEY"] != nil }
    }

    func complete(_ request: AICompletionRequest) async throws -> AICompletionResponse {
        guard await isConfigured else { throw AIProviderError.notConfigured(.claude) }
        // Transport layer intentionally stubbed — wire URLSession to Anthropic Messages API in production.
        return AICompletionResponse(
            text: "Claude provider ready. Connect API transport to analyze: \(request.prompt.prefix(120))…",
            provider: .claude
        )
    }
}

struct OpenAIProvider: AIProvider {
    let kind: AIProviderKind = .openAI

    var isConfigured: Bool {
        get async { ProcessInfo.processInfo.environment["OPENAI_API_KEY"] != nil }
    }

    func complete(_ request: AICompletionRequest) async throws -> AICompletionResponse {
        guard await isConfigured else { throw AIProviderError.notConfigured(.openAI) }
        return AICompletionResponse(
            text: "OpenAI provider ready. Connect API transport for macro regime commentary.",
            provider: .openAI
        )
    }
}

struct OllamaProvider: AIProvider {
    let kind: AIProviderKind = .ollama

    var isConfigured: Bool {
        get async {
            guard let url = URL(string: "http://127.0.0.1:11434/api/tags") else { return false }
            var request = URLRequest(url: url)
            request.timeoutInterval = 0.5
            do {
                let (_, response) = try await URLSession.shared.data(for: request)
                return (response as? HTTPURLResponse)?.statusCode == 200
            } catch {
                return false
            }
        }
    }

    func complete(_ request: AICompletionRequest) async throws -> AICompletionResponse {
        guard await isConfigured else { throw AIProviderError.notConfigured(.ollama) }
        return AICompletionResponse(
            text: "Ollama detected on localhost. Local inference path available.",
            provider: .ollama
        )
    }
}

struct LMStudioProvider: AIProvider {
    let kind: AIProviderKind = .lmStudio

    var isConfigured: Bool {
        get async {
            guard let url = URL(string: "http://127.0.0.1:1234/v1/models") else { return false }
            var request = URLRequest(url: url)
            request.timeoutInterval = 0.5
            do {
                let (_, response) = try await URLSession.shared.data(for: request)
                return (response as? HTTPURLResponse)?.statusCode == 200
            } catch {
                return false
            }
        }
    }

    func complete(_ request: AICompletionRequest) async throws -> AICompletionResponse {
        guard await isConfigured else { throw AIProviderError.notConfigured(.lmStudio) }
        return AICompletionResponse(
            text: "LM Studio detected on localhost. OpenAI-compatible local endpoint available.",
            provider: .lmStudio
        )
    }
}
