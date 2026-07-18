import SwiftUI

struct DeskSidebar: View {
    @Binding var selection: DeskKind
    @Binding var showSettings: Bool
    @Environment(AppDependencies.self) private var dependencies

    var body: some View {
        List(selection: $selection) {
            Section("Giovannini Mare Capital") {
                ForEach(DeskKind.allCases) { desk in
                    Label {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(desk.title)
                            Text(desk.subtitle)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    } icon: {
                        Image(systemName: desk.systemImage)
                    }
                    .tag(desk)
                }
            }

            Section("Actions") {
                Button {
                    Task { await importCapture() }
                } label: {
                    Label("Import Capture Bundle", systemImage: "square.and.arrow.down")
                }

                Button {
                    showSettings = true
                } label: {
                    Label("Settings", systemImage: "gearshape")
                }
            }
        }
        .listStyle(.sidebar)
        .navigationTitle("Mare Desk")
        .onReceive(NotificationCenter.default.publisher(for: .navigateDesk)) { notification in
            if let desk = notification.object as? DeskKind {
                selection = desk
            }
        }
    }

    private func importCapture() async {
        let panel = NSOpenPanel()
        panel.canChooseDirectories = true
        panel.canChooseFiles = false
        panel.prompt = "Import"
        panel.message = "Select a GMC capture bundle folder (portfolio + real_estate subfolders)."

        guard panel.runModal() == .OK, let url = panel.url else { return }
        await importBundle(at: url)
    }

    private func importBundle(at url: URL) async {
        do {
            _ = try await dependencies.importCaptureUseCase.execute(from: url)
            CaptureBundleLocator.remember(url)
            NotificationCenter.default.post(name: .mareDeskDataDidRefresh, object: nil)
        } catch {
            AppLogger.importing.error("Import failed: \(error.localizedDescription, privacy: .public)")
        }
    }
}
