import Foundation

/// Imports Giovannini Mare Capital JSON bundles using the real GMC export schema.
struct GMCJSONImporter: ExternalCaptureImporter {
    private struct CategorySpec {
        let code: String
        let name: String
        let accent: String
        let order: Int
    }

    private struct SourceBundle {
        let portfolioState: [String: Any]
        let currentSnapshot: [String: Any]
        let optimizedGavetas: [String: Any]
        let detailedEquities: [String: Any]
        let detailedCrypto: [String: Any]
        let propertyState: [String: Any]
        let propertyMeta: [String: Any]
        let sourcePath: String
    }

    private let categoryMap: [String: CategorySpec] = [
        "cash": .init(code: "CASH", name: "Cash", accent: "#FFB703", order: 1),
        "bonds": .init(code: "BONDS", name: "Bonds", accent: "#7AE582", order: 2),
        "gold": .init(code: "GOLD", name: "Gold", accent: "#F4D35E", order: 3),
        "equities": .init(code: "EQ", name: "Equities", accent: "#4CC9F0", order: 4),
        "bitcoin": .init(code: "CRYPTO", name: "Digital Assets", accent: "#4895EF", order: 5)
    ]

    func importBundle(from directory: URL) async throws -> ImportedBundle {
        let bundle = try loadSourceBundle(from: directory)
        let portfolioAsOf = parseAsOf(bundle.portfolioState["last_update"])
        let propertyAsOf = parseAsOf(bundle.propertyState["last_update"])
        let regime = titleize(nestedString(bundle.portfolioState, keys: ["regime_engine", "current_regime"])) ?? "Unspecified"

        let categories = buildCategories(from: bundle.portfolioState)
        let categoryByClassId = categoryLookup(categories)
        let bucketByAsset = buildBucketMap(from: bundle.portfolioState)
        let holdings = buildHoldings(
            from: bundle.portfolioState,
            snapshot: bundle.currentSnapshot,
            categories: categoryByClassId,
            bucketByAsset: bucketByAsset
        )
        let indicators = buildIndicators(from: bundle.portfolioState)
        let properties = buildProperties(
            from: bundle.propertyState,
            propertyMeta: bundle.propertyMeta
        )
        let totalCurrent = holdings.reduce(Decimal.zero) { $0 + $1.currentAmount }
        let totalPropertyMarket = properties.reduce(Decimal.zero) { $0 + $1.marketAmount }

        let capture = CaptureEvent(
            origin: .externalImport,
            initiatedBy: "GMCJSONImporter",
            note: "Imported Giovannini Mare Capital capture bundle.",
            metadata: [
                "source": bundle.sourcePath,
                "portfolio_updated": stringValue(bundle.portfolioState["last_update"]),
                "real_estate_updated": stringValue(bundle.propertyState["last_update"])
            ],
            capturedAt: .now,
            holdingCount: holdings.count,
            indicatorCount: indicators.count,
            propertyCount: properties.count,
            totalCurrentUSD: totalCurrent,
            totalPropertyMarketBRL: totalPropertyMarket,
            activeRegime: regime,
            portfolioAsOf: portfolioAsOf,
            propertyAsOf: propertyAsOf
        )

        let memos = buildMemos(from: bundle, capture: capture)
        let frozenPayloads = buildFrozenPayloads(from: bundle, capture: capture, portfolioAsOf: portfolioAsOf, propertyAsOf: propertyAsOf)

        return ImportedBundle(
            capture: capture,
            categories: categories,
            holdings: holdings,
            indicators: indicators,
            properties: properties,
            memos: memos,
            frozenPayloads: frozenPayloads
        )
    }

    private func loadSourceBundle(from directory: URL) throws -> SourceBundle {
        let portfolioDir = directory.appendingPathComponent("portfolio", isDirectory: true)
        let propertyDir = directory.appendingPathComponent("real_estate", isDirectory: true)

        let required: [(URL, String)] = [
            (portfolioDir.appendingPathComponent("gmc_portfolio_state.json"), "gmc_portfolio_state.json"),
            (portfolioDir.appendingPathComponent("current_portfolio_snapshot.json"), "current_portfolio_snapshot.json"),
            (portfolioDir.appendingPathComponent("optimized_allocation_gavetas.json"), "optimized_allocation_gavetas.json"),
            (portfolioDir.appendingPathComponent("detailed_equities_visa.json"), "detailed_equities_visa.json"),
            (portfolioDir.appendingPathComponent("detailed_crypto_cfm.json"), "detailed_crypto_cfm.json"),
            (propertyDir.appendingPathComponent("imoveis_state.json"), "imoveis_state.json"),
            (propertyDir.appendingPathComponent("property_meta.json"), "property_meta.json")
        ]

        let missing = required.filter { !FileManager.default.fileExists(atPath: $0.0.path) }.map(\.1)
        guard missing.isEmpty else {
            throw ImportCaptureError.validationFailed("Missing files: \(missing.joined(separator: ", "))")
        }

        return SourceBundle(
            portfolioState: try readJSON(required[0].0),
            currentSnapshot: try readJSON(required[1].0),
            optimizedGavetas: try readJSON(required[2].0),
            detailedEquities: try readJSON(required[3].0),
            detailedCrypto: try readJSON(required[4].0),
            propertyState: try readJSON(required[5].0),
            propertyMeta: try readJSON(required[6].0),
            sourcePath: directory.path
        )
    }

    private func buildCategories(from state: [String: Any]) -> [AssetCategory] {
        guard let allocation = state["asset_allocation"] as? [[String: Any]] else {
            return AssetCategory.canonical.map {
                AssetCategory(code: $0.0, displayName: $0.1, accentHex: $0.2, sortIndex: $0.3)
            }
        }

        return allocation.compactMap { item in
            guard let key = item["asset_class_id"] as? String, let spec = categoryMap[key] else { return nil }
            return AssetCategory(code: spec.code, displayName: spec.name, accentHex: spec.accent, sortIndex: spec.order)
        }
    }

    private func categoryLookup(_ categories: [AssetCategory]) -> [String: AssetCategory] {
        var lookup: [String: AssetCategory] = [:]
        for (classId, spec) in categoryMap {
            if let category = categories.first(where: { $0.code == spec.code }) {
                lookup[classId] = category
            }
        }
        return lookup
    }

    private func buildBucketMap(from state: [String: Any]) -> [String: String] {
        var buckets: [String: String] = [:]
        for gaveta in state["gavetas"] as? [[String: Any]] ?? [] {
            let bucketName = gaveta["name"] as? String ?? "Core"
            for component in gaveta["components"] as? [[String: Any]] ?? [] {
                if let assetClass = component["asset_class"] as? String {
                    buckets[assetClass.lowercased()] = bucketName
                }
            }
        }
        return buckets
    }

    private func buildHoldings(
        from state: [String: Any],
        snapshot: [String: Any],
        categories: [String: AssetCategory],
        bucketByAsset: [String: String]
    ) -> [Holding] {
        var holdings: [Holding] = []
        let currentByClass = buildCurrentAmountsByClass(from: snapshot)

        for asset in state["asset_allocation"] as? [[String: Any]] ?? [] {
            let classId = asset["asset_class_id"] as? String ?? ""
            guard let category = categories[classId] else { continue }

            let assetClass = (asset["asset_class"] as? String ?? "Core").lowercased()
            let bucketName = bucketByAsset[assetClass] ?? (asset["asset_class"] as? String ?? "Core")
            let instruments = asset["instruments"] as? [[String: Any]] ?? []
            let classTargetTotal = instruments.reduce(Decimal.zero) { $0 + decimal($1["amount_usd"]) }
            let classCurrentTotal = currentByClass[classId] ?? 0

            for instrument in instruments {
                let notes = [
                    asset["role"] as? String,
                    "Instrument type: \(instrument["instrument_type"] as? String ?? "n/a")",
                    "Custodian: \(instrument["custodian"] as? String ?? "n/a")",
                    "Source execution status: \(titleize(instrument["execution_status"] as? String) ?? "Unspecified")",
                    instrument["notes"] as? String
                ]
                .compactMap { $0?.trimmingCharacters(in: .whitespacesAndNewlines) }
                .filter { !$0.isEmpty }
                .joined(separator: " ")

                let targetAmount = decimal(instrument["amount_usd"])
                let executionStatus = instrument["execution_status"] as? String
                let currentAmount = resolveCurrentAmount(
                    targetAmount: targetAmount,
                    classTargetTotal: classTargetTotal,
                    classCurrentTotal: classCurrentTotal,
                    executionStatus: executionStatus
                )

                holdings.append(
                    Holding(
                        instrumentName: instrument["name"] as? String
                            ?? instrument["ticker"] as? String
                            ?? asset["asset_class"] as? String
                            ?? "Instrument",
                        symbol: instrument["ticker"] as? String ?? "",
                        bucketLabel: bucketName,
                        currentAmount: currentAmount,
                        targetAmount: targetAmount,
                        status: HoldingStatus.fromGMCExecutionStatus(executionStatus),
                        annotation: notes,
                        category: category
                    )
                )
            }
        }

        return holdings
    }

    private func buildCurrentAmountsByClass(from snapshot: [String: Any]) -> [String: Decimal] {
        var amounts: [String: Decimal] = [:]

        for asset in snapshot["assets"] as? [[String: Any]] ?? [] {
            let name = (asset["asset"] as? String ?? "").lowercased()
            let value = decimal(asset["value_usd"])
            guard value > 0 else { continue }

            if name.contains("cash") {
                amounts["cash", default: 0] += value
            } else if name.contains("gold") {
                amounts["gold", default: 0] += value
            } else if name.contains("bond") {
                amounts["bonds", default: 0] += value
            } else if name.contains("equit") || name.contains("visa") || name.contains("stock") {
                amounts["equities", default: 0] += value
            } else if name.contains("bitcoin") || name.contains("crypto") || name.contains("btc") {
                amounts["bitcoin", default: 0] += value
            }
        }

        return amounts
    }

    private func resolveCurrentAmount(
        targetAmount: Decimal,
        classTargetTotal: Decimal,
        classCurrentTotal: Decimal,
        executionStatus: String?
    ) -> Decimal {
        if HoldingStatus.fromGMCExecutionStatus(executionStatus) == .active {
            return targetAmount
        }
        guard classTargetTotal > 0, classCurrentTotal > 0 else { return 0 }
        return classCurrentTotal * (targetAmount / classTargetTotal)
    }

    private func buildIndicators(from state: [String: Any]) -> [MacroIndicator] {
        let summary = state["portfolio_summary"] as? [String: Any] ?? [:]
        let risk = state["risk_framework"] as? [String: Any] ?? [:]
        let constraints = risk["portfolio_constraints"] as? [String: Any] ?? [:]
        let sourceContext = state["source_context"] as? [String: Any] ?? [:]
        let regime = titleize(nestedString(state, keys: ["regime_engine", "current_regime"])) ?? "Unspecified"

        let specs: [(String, Decimal, String, String, String)] = [
            ("Current Macro Regime", percentDecimal(summary["defensive_weight"]), regime, "amber", titleize(sourceContext["strategy_style"] as? String) ?? ""),
            ("Cash-Like Reserve", percentDecimal(summary["cash_like_weight"]), "Immediate Liquidity", "cyan", "Liquid reserve inside the target book."),
            ("Defensive Sleeve", percentDecimal(summary["defensive_weight"]), "Survival & Optionality", "amber", "Cash, bonds, and gold combined."),
            ("Growth Sleeve", percentDecimal(summary["growth_weight"]), "Selective Growth", "green", "Global equities sleeve sized for asymmetric upside."),
            ("Convex Sleeve", percentDecimal(summary["convex_weight"]), "Optionality", "blue", "Bitcoin and related convex exposure."),
            ("Min Liquid Assets", percentDecimal(constraints["min_liquid_assets_weight"]), "Risk Constraint", "cyan", "Minimum liquid assets floor from risk framework."),
            ("Max High Volatility Bucket", percentDecimal(constraints["max_high_volatility_bucket_weight"]), "Risk Constraint", "magenta", "Maximum high-volatility sleeve from risk framework."),
            ("Brazil Tactical Max", percentDecimal(summary["brazil_tactical_weight_max"]), "Underweight", "red", "No new tactical Brazil exposure in allocation plan.")
        ]

        return specs.map { spec in
            MacroIndicator(
                indicatorName: spec.0,
                reading: spec.1,
                regimeLabel: spec.2,
                emphasisToken: spec.3,
                annotation: spec.4
            )
        }
    }

    private func buildProperties(from state: [String: Any], propertyMeta: [String: Any]) -> [PropertyRecord] {
        let tenantStatus = Dictionary(
            uniqueKeysWithValues: (state["inquilinos"] as? [[String: Any]] ?? []).compactMap { item -> (String, String)? in
                guard let id = item["idImovel"] else { return nil }
                return (String(describing: id), item["status"] as? String ?? "")
            }
        )

        return (state["imoveis"] as? [[String: Any]] ?? []).map { item in
            let itemId = String(describing: item["id"] ?? "")
            let meta = propertyMeta[itemId] as? [String: Any] ?? [:]
            let market = decimal(item["valorVenda"] ?? meta["market_value"])
            let assessed = decimal(meta["tax_value"], fallback: market)
            let footprint = decimal(item["metragem"] ?? meta["area"])
            let rentalStatus = (tenantStatus[itemId] ?? "").trimmingCharacters(in: .whitespaces).lowercased()
            let monthlyRent = decimal(item["aluguelMensal"])

            let operationalState: String
            if monthlyRent <= 0 {
                operationalState = "VACANT"
            } else if rentalStatus == "ativo" {
                operationalState = "LEASED"
            } else if rentalStatus == "vencido" {
                operationalState = "LEASED-EXP"
            } else if !rentalStatus.isEmpty {
                operationalState = rentalStatus.uppercased()
            } else {
                operationalState = "LEASED"
            }

            return PropertyRecord(
                propertyName: buildPropertyName(item: item, meta: meta),
                propertyKind: item["tipo"] as? String ?? "Property",
                municipality: extractMunicipality(from: item["endereco"] as? String),
                marketAmount: market,
                assessedAmount: assessed,
                footprintSquareMeters: footprint,
                operationalState: operationalState
            )
        }
    }

    private func buildMemos(from bundle: SourceBundle, capture: CaptureEvent) -> [OperatorMemo] {
        var memos: [OperatorMemo] = []
        let portfolio = bundle.portfolioState
        let property = bundle.propertyState
        let sourceContext = portfolio["source_context"] as? [String: Any] ?? [:]
        let summary = portfolio["portfolio_summary"] as? [String: Any] ?? [:]
        let risk = portfolio["risk_framework"] as? [String: Any] ?? [:]
        let kpis = property["dashboard_kpis"] as? [String: Any] ?? [:]
        let monthly = property["relatorio_mensal"] as? [String: Any] ?? [:]

        func add(_ title: String, _ body: String, _ scope: MemoScope) {
            memos.append(OperatorMemo(title: title, bodyText: body, scope: scope, captureEvent: capture))
        }

        add(
            "GMC Source Import",
            "Imported Giovannini Mare Capital portfolio and property data. Portfolio update: \(stringValue(portfolio["last_update"])). Property update: \(stringValue(property["last_update"])).",
            .overview
        )
        add(
            "Portfolio Doctrine",
            titleize(sourceContext["investment_doctrine"] as? String) ?? "Doctrine unavailable in source data.",
            .overview
        )

        let structural = (bundle.currentSnapshot["assets"] as? [[String: Any]] ?? [])
            .map { "\($0["asset"] as? String ?? "Asset"): \(formatUSD($0["value_usd"]))" }
            .joined(separator: "; ")
        if !structural.isEmpty {
            add("Structural Snapshot", "Current structural holdings: \(structural).", .overview)
        }

        add(
            "Deployable Capital",
            "Liquid capital available for the convex portfolio: \(formatUSD(sourceContext["capital_available_usd"])). Target mix: cash \(Int(percentDouble(summary["cash_like_weight"])))%, bonds 15%, gold 20%, equities \(Int(percentDouble(summary["growth_weight"])))%, bitcoin \(Int(percentDouble(summary["convex_weight"])))%.",
            .portfolio
        )

        let implied = bundle.currentSnapshot["implied_allocation"] as? [String: Any] ?? [:]
        add(
            "Current Implied Allocation",
            "Preservation \(implied["preservation_percent"] ?? 0)%, tactical \(implied["tactical_percent"] ?? 0)%, convex growth \(implied["convex_growth_percent"] ?? 0)%.",
            .portfolio
        )

        for gaveta in bundle.optimizedGavetas["gavetas"] as? [[String: Any]] ?? [] {
            add(
                "Gaveta: \(gaveta["gaveta"] as? String ?? "Bucket")",
                "Target allocation \(formatUSD(gaveta["allocation_usd"])) (\(gaveta["percent"] ?? 0)%). \(gaveta["rationale"] as? String ?? "")",
                .portfolio
            )
        }

        if let notes = bundle.detailedEquities["notes"] as? [String], !notes.isEmpty {
            add("Equities Sleeve Notes", notes.joined(separator: " "), .portfolio)
        }
        if let notes = bundle.detailedCrypto["notes"] as? [String], !notes.isEmpty {
            add("Crypto Sleeve Notes", notes.joined(separator: " "), .portfolio)
        }

        for scenario in risk["stress_scenarios"] as? [[String: Any]] ?? [] {
            let winners = (scenario["expected_winners"] as? [String] ?? []).map { titleize($0) ?? $0 }.joined(separator: ", ")
            let losers = (scenario["expected_losers"] as? [String] ?? []).map { titleize($0) ?? $0 }.joined(separator: ", ")
            add(
                "Trigger: \(titleize(scenario["scenario_id"] as? String) ?? "Scenario")",
                "\(scenario["description"] as? String ?? "") Winners: \(winners.isEmpty ? "n/a" : winners). Losers: \(losers.isEmpty ? "n/a" : losers).",
                .macro
            )
        }

        let riskDefinition = (risk["risk_definition"] as? [String] ?? []).map { titleize($0) ?? $0 }.joined(separator: ", ")
        if !riskDefinition.isEmpty {
            add("Risk Definition", riskDefinition, .macro)
        }

        let contextNotes = (sourceContext["notes"] as? [String] ?? []).joined(separator: " ")
        if !contextNotes.isEmpty {
            add("Source Context", contextNotes, .macro)
        }

        add(
            "Monthly Property Summary",
            "\(monthly["periodo"] as? String ?? "Period unavailable"): expected rent \(formatBRL(monthly["rendaEsperada"])), received \(formatBRL(monthly["rendaRecebida"])), default \(formatBRL(monthly["inadimplencia"])), net income \(formatBRL(monthly["lucroLiquido"])).",
            .realEstate
        )
        add(
            "Occupancy and Revenue",
            "\(kpis["totalImoveis"] ?? 0) properties with occupancy at \(kpis["taxaOcupacao"] ?? 0)% and estimated monthly rent of \(formatBRL(kpis["rendaMensalEstimada"])).",
            .realEstate
        )

        if let top = (kpis["top5Rentabilidade"] as? [[String: Any]])?.first, top["id"] != nil {
            add(
                "Top ROI Property",
                "Property \(top["id"] ?? "") (\(top["tipo"] as? String ?? "")) leads ROI at \(top["rentabilidadeAnualPct"] ?? 0)% annual rentability.",
                .realEstate
            )
        }

        return memos
    }

    private func buildFrozenPayloads(
        from bundle: SourceBundle,
        capture: CaptureEvent,
        portfolioAsOf: Date,
        propertyAsOf: Date
    ) -> [FrozenCapturePayload] {
        let portfolioSummary = bundle.portfolioState["portfolio_summary"] as? [String: Any] ?? [:]
        let financialSummary: [String: Any] = [
            "portfolio_name": bundle.portfolioState["portfolio_name"] as? String ?? "GMC Portfolio",
            "total_capital_usd": (decimal(portfolioSummary["total_capital_usd"]) as NSDecimalNumber).doubleValue,
            "regime": capture.activeRegime,
            "holding_count": capture.holdingCount,
            "as_of": ISO8601DateFormatter().string(from: portfolioAsOf)
        ]

        let propertySummary: [String: Any] = [
            "property_count": capture.propertyCount,
            "total_market_brl": (capture.totalPropertyMarketBRL as NSDecimalNumber).doubleValue,
            "as_of": ISO8601DateFormatter().string(from: propertyAsOf)
        ]

        return [
            makeFrozenPayload(domain: .financial, objects: [bundle.portfolioState, bundle.currentSnapshot, financialSummary], capture: capture, asOf: portfolioAsOf),
            makeFrozenPayload(domain: .property, objects: [bundle.propertyState, bundle.propertyMeta, propertySummary], capture: capture, asOf: propertyAsOf)
        ]
    }

    private func makeFrozenPayload(
        domain: CaptureDomain,
        objects: [Any],
        capture: CaptureEvent,
        asOf: Date
    ) -> FrozenCapturePayload {
        let payload = (try? JSONSerialization.data(withJSONObject: objects, options: [.prettyPrinted]))
            .flatMap { String(data: $0, encoding: .utf8) } ?? "[]"
        return FrozenCapturePayload(domain: domain, payloadJSON: payload, capturedAt: asOf, captureEvent: capture)
    }

    private func readJSON(_ url: URL) throws -> [String: Any] {
        let data = try Data(contentsOf: url)
        let object = try JSONSerialization.jsonObject(with: data)
        guard let dict = object as? [String: Any] else {
            throw ImportCaptureError.validationFailed("Invalid JSON at \(url.lastPathComponent)")
        }
        return dict
    }

    private func decimal(_ value: Any?, fallback: Decimal = 0) -> Decimal {
        if value is NSNull || value == nil { return fallback }
        if let number = value as? NSNumber { return Decimal(string: number.stringValue) ?? fallback }
        if let string = value as? String, !string.isEmpty { return Decimal(string: string) ?? fallback }
        return fallback
    }

    private func percentDecimal(_ value: Any?) -> Decimal {
        decimal(value) * 100
    }

    private func percentDouble(_ value: Any?) -> Double {
        (percentDecimal(value) as NSDecimalNumber).doubleValue
    }

    private func stringValue(_ value: Any?) -> String {
        value.map { String(describing: $0) } ?? ""
    }

    private func nestedString(_ dict: [String: Any], keys: [String]) -> String? {
        var current: Any? = dict
        for key in keys {
            current = (current as? [String: Any])?[key]
        }
        return current as? String
    }

    private func titleize(_ value: String?) -> String? {
        guard let value, !value.isEmpty else { return nil }
        return value
            .replacingOccurrences(of: "_", with: " ")
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .split(separator: " ")
            .map { $0.prefix(1).uppercased() + $0.dropFirst().lowercased() }
            .joined(separator: " ")
    }

    private func parseAsOf(_ value: Any?) -> Date {
        guard let raw = value as? String, !raw.isEmpty else { return .now }
        let iso = ISO8601DateFormatter()
        if let date = iso.date(from: raw) { return date }
        let formats = ["yyyy-MM-dd", "yyyy-MM-dd'T'HH:mm:ssZ", "yyyy-MM-dd HH:mm:ss"]
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        for format in formats {
            formatter.dateFormat = format
            if let date = formatter.date(from: raw) { return date }
        }
        return .now
    }

    private func buildPropertyName(item: [String: Any], meta: [String: Any]) -> String {
        let address = (item["endereco"] as? String ?? "").split(separator: ",").first.map(String.init) ?? ""
        if let building = meta["building"] as? String, !building.isEmpty, !address.isEmpty {
            return "\(building) - \(address)"
        }
        if !address.isEmpty {
            return "\(item["tipo"] as? String ?? "Property") - \(address)"
        }
        return "\(item["tipo"] as? String ?? "Property") #\(item["id"] ?? "")"
    }

    private func extractMunicipality(from address: String?) -> String {
        guard let address, !address.isEmpty else { return "Unknown" }
        let parts = address.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }
        return parts.last.map { String($0) } ?? "Unknown"
    }

    private func formatUSD(_ value: Any?) -> String {
        let amount = decimal(value)
        return Money(amount: amount, currencyCode: "USD").formatted(maximumFractionDigits: 0)
    }

    private func formatBRL(_ value: Any?) -> String {
        let amount = decimal(value)
        return Money(amount: amount, currencyCode: "BRL").formatted(maximumFractionDigits: 0)
    }
}
