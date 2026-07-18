import SwiftUI
import SwiftData

@main
struct MareDeskApp: App {
    @State private var dependencies = AppDependencies.live()

    var body: some Scene {
        WindowGroup("Mare Desk") {
            RootView()
                .environment(dependencies)
                .modelContainer(dependencies.modelContainer)
        }
        .commands {
            DeskCommands()
        }
        .defaultSize(width: 1440, height: 900)

        MenuBarExtra("Mare Desk", systemImage: "chart.line.uptrend.xyaxis") {
            MenuBarStatusView()
                .environment(dependencies)
                .modelContainer(dependencies.modelContainer)
        }
        .menuBarExtraStyle(.window)
    }
}
