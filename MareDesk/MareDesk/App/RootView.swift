import SwiftUI

struct RootView: View {
    @Environment(AppDependencies.self) private var dependencies
    @State private var selection: DeskKind = .overview
    @State private var showSettings = false

    var body: some View {
        NavigationSplitView {
            DeskSidebar(selection: $selection, showSettings: $showSettings)
        } detail: {
            deskContent
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(DeskTheme.canvas)
        }
        .navigationSplitViewStyle(.balanced)
        .sheet(isPresented: $showSettings) {
            SettingsView()
                .environment(dependencies)
        }
    }

    @ViewBuilder
    private var deskContent: some View {
        switch selection {
        case .overview:
            OverviewView()
        case .portfolio:
            PortfolioDeskView()
        case .macro:
            MacroDeskView()
        case .realEstate:
            PropertyDeskView()
        case .history:
            CaptureHistoryView()
        }
    }
}

struct DeskCommands: Commands {
    var body: some Commands {
        CommandGroup(replacing: .sidebar) {
            Button("Overview") { NotificationCenter.default.post(name: .navigateDesk, object: DeskKind.overview) }
                .keyboardShortcut("1", modifiers: .command)
            Button("Portfolio") { NotificationCenter.default.post(name: .navigateDesk, object: DeskKind.portfolio) }
                .keyboardShortcut("2", modifiers: .command)
            Button("Macro") { NotificationCenter.default.post(name: .navigateDesk, object: DeskKind.macro) }
                .keyboardShortcut("3", modifiers: .command)
            Button("Real Estate") { NotificationCenter.default.post(name: .navigateDesk, object: DeskKind.realEstate) }
                .keyboardShortcut("4", modifiers: .command)
            Button("History") { NotificationCenter.default.post(name: .navigateDesk, object: DeskKind.history) }
                .keyboardShortcut("5", modifiers: .command)
        }
    }
}

extension Notification.Name {
    static let navigateDesk = Notification.Name("MareDesk.navigateDesk")
}
