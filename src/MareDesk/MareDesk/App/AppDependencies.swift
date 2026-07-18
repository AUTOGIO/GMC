import Foundation
import SwiftData
import Observation

@Observable
@MainActor
final class AppDependencies {
    let modelContainer: ModelContainer
    let overviewUseCase: LoadOverviewUseCase
    let filterHoldingsUseCase: FilterHoldingsUseCase
    let importCaptureUseCase: ImportCaptureUseCase
    let loadCaptureHistoryUseCase: LoadCaptureHistoryUseCase
    let restoreCaptureUseCase: RestoreCaptureUseCase
    let aiCoordinator: AIProviderCoordinator
    let brokerageCoordinator: BrokerageDataCoordinator
    private let captureRepository: CaptureRepository

    init(
        modelContainer: ModelContainer,
        overviewUseCase: LoadOverviewUseCase,
        filterHoldingsUseCase: FilterHoldingsUseCase,
        importCaptureUseCase: ImportCaptureUseCase,
        loadCaptureHistoryUseCase: LoadCaptureHistoryUseCase,
        restoreCaptureUseCase: RestoreCaptureUseCase,
        captureRepository: CaptureRepository,
        aiCoordinator: AIProviderCoordinator,
        brokerageCoordinator: BrokerageDataCoordinator
    ) {
        self.modelContainer = modelContainer
        self.overviewUseCase = overviewUseCase
        self.filterHoldingsUseCase = filterHoldingsUseCase
        self.importCaptureUseCase = importCaptureUseCase
        self.loadCaptureHistoryUseCase = loadCaptureHistoryUseCase
        self.restoreCaptureUseCase = restoreCaptureUseCase
        self.captureRepository = captureRepository
        self.aiCoordinator = aiCoordinator
        self.brokerageCoordinator = brokerageCoordinator
    }

    static func live() -> AppDependencies {
        do {
            let container = try ModelContainerFactory.makeContainer()
            let context = ModelContext(container)
            let holdingRepo = SwiftDataHoldingRepository(context: context)
            let captureRepo = SwiftDataCaptureRepository(context: context)
            let overviewAssembler = OverviewAssembler()
            let metricsEngine = PortfolioMetricsEngine()
            let importUseCase = ImportCaptureUseCase(
                importer: GMCJSONImporter(),
                captureRepository: captureRepo,
                holdingRepository: holdingRepo
            )

            let dependencies = AppDependencies(
                modelContainer: container,
                overviewUseCase: LoadOverviewUseCase(
                    holdingRepository: holdingRepo,
                    captureRepository: captureRepo,
                    assembler: overviewAssembler
                ),
                filterHoldingsUseCase: FilterHoldingsUseCase(
                    holdingRepository: holdingRepo,
                    metricsEngine: metricsEngine
                ),
                importCaptureUseCase: importUseCase,
                loadCaptureHistoryUseCase: LoadCaptureHistoryUseCase(captureRepository: captureRepo),
                restoreCaptureUseCase: RestoreCaptureUseCase(
                    captureRepository: captureRepo,
                    importCaptureUseCase: importUseCase
                ),
                captureRepository: captureRepo,
                aiCoordinator: AIProviderCoordinator(providers: [
                    ClaudeProvider(),
                    OpenAIProvider(),
                    OllamaProvider(),
                    LMStudioProvider()
                ]),
                brokerageCoordinator: BrokerageDataCoordinator()
            )

            Task { await dependencies.bootstrapIfNeeded() }
            return dependencies
        } catch {
            fatalError("Failed to initialize Mare Desk persistence: \(error.localizedDescription)")
        }
    }

    func bootstrapIfNeeded() async {
        await brokerageCoordinator.refreshAvailability()
        await importPrimaryBundleIfNeeded(force: false)
    }

    func importPrimaryBundleIfNeeded(force: Bool = false) async {
        do {
            let env = ProcessInfo.processInfo.environment
            let forceImport = force || env["MARE_DESK_FORCE_IMPORT"] == "1"
            let bundleURL = env["MARE_DESK_CAPTURE_BUNDLE"]
                .map { URL(fileURLWithPath: $0, isDirectory: true) }
                .flatMap { CaptureBundleLocator.isValidBundle(at: $0) ? $0 : nil }
                ?? CaptureBundleLocator.defaultBundleURL()

            guard let bundleURL else {
                AppLogger.importing.error("No valid GMC capture bundle found on this Mac.")
                return
            }

            let hasData = try await captureRepository.hasAnyHoldings()
            guard forceImport || !hasData else { return }

            _ = try await importCaptureUseCase.execute(from: bundleURL)
            CaptureBundleLocator.remember(bundleURL)
            AppLogger.importing.info("Imported Mare Desk data from \(bundleURL.path, privacy: .public)")
            NotificationCenter.default.post(name: .mareDeskDataDidRefresh, object: nil)
        } catch {
            AppLogger.importing.error("Capture import failed: \(error.localizedDescription, privacy: .public)")
        }
    }

    func runtimeStatus() async -> (mode: OperatorDataMode, source: String) {
        await brokerageCoordinator.refreshAvailability()
        let status = OperatorRuntimeStatus.resolve(
            brokerageAvailable: brokerageCoordinator.isIBKRAuthenticated
        )
        return (status.mode, status.source)
    }
}
