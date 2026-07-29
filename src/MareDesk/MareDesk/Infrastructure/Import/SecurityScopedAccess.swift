import Foundation

@MainActor
enum SecurityScopedAccess {
    static func withAccess<T>(to url: URL, _ work: () async throws -> T) async throws -> T {
        let started = url.startAccessingSecurityScopedResource()
        defer {
            if started {
                url.stopAccessingSecurityScopedResource()
            }
        }
        return try await work()
    }
}
