import Foundation
import SwiftData

enum ModelContainerFactory {
    static func makeContainer(inMemory: Bool = false) throws -> ModelContainer {
        let schema = Schema([
            AssetCategory.self,
            Holding.self,
            MacroIndicator.self,
            PropertyRecord.self,
            CaptureEvent.self,
            OperatorMemo.self,
            FrozenCapturePayload.self
        ])

        let configuration = ModelConfiguration(
            "MareDeskStore",
            isStoredInMemoryOnly: inMemory
        )

        return try ModelContainer(for: schema, configurations: [configuration])
    }
}
