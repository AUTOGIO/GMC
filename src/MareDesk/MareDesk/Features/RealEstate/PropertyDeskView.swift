import SwiftUI
import SwiftData
import Charts

struct PropertyDeskView: View {
    @Query(sort: \PropertyRecord.municipality) private var properties: [PropertyRecord]
    @Query(sort: \OperatorMemo.createdAt, order: .reverse) private var memos: [OperatorMemo]

    private var summary: PropertyBookSummary {
        let totalMarket = properties.reduce(Decimal.zero) { $0 + $1.marketAmount }
        let totalAssessed = properties.reduce(Decimal.zero) { $0 + $1.assessedAmount }
        let totalFootprint = properties.reduce(Decimal.zero) { $0 + $1.footprintSquareMeters }
        let gap = totalAssessed == 0 ? 0 : ((totalMarket - totalAssessed) as NSDecimalNumber).doubleValue / (totalAssessed as NSDecimalNumber).doubleValue * 100
        return PropertyBookSummary(
            totalMarket: totalMarket,
            totalAssessed: totalAssessed,
            totalFootprint: totalFootprint,
            unitCount: properties.count,
            assessmentGapPercent: gap.rounded(toPlaces: 2)
        )
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                summaryStrip
                propertyTable
                chartsRow
                cityExposure
                notesPanel
            }
            .padding(20)
        }
        .navigationTitle("Real Estate")
    }

    private var summaryStrip: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 5), spacing: 12) {
            MetricTile(label: "MARKET VALUE", value: Money(amount: summary.totalMarket, currencyCode: "BRL").formatted(), tone: .positive)
            MetricTile(label: "ASSESSED", value: Money(amount: summary.totalAssessed, currencyCode: "BRL").formatted(), tone: .info)
            MetricTile(label: "FOOTPRINT", value: String(format: "%.0f m²", (summary.totalFootprint as NSDecimalNumber).doubleValue), tone: .neutral)
            MetricTile(label: "UNITS", value: "\(summary.unitCount)", tone: .neutral)
            MetricTile(label: "ASSESSMENT GAP", value: String(format: "%.2f%%", summary.assessmentGapPercent), tone: .caution)
        }
    }

    private var propertyTable: some View {
        DeskPanel(title: "PROPERTY BOOK") {
            Table(properties) {
                TableColumn("Name") { property in Text(property.propertyName) }
                TableColumn("Kind") { property in Text(property.propertyKind) }
                TableColumn("City") { property in Text(property.municipality) }
                TableColumn("Market") { property in Text(property.marketMoney.formatted()).monospacedDigit() }
                TableColumn("Assessed") { property in Text(property.assessedMoney.formatted()).monospacedDigit() }
                TableColumn("Area") { property in Text(String(format: "%.0f", (property.footprintSquareMeters as NSDecimalNumber).doubleValue)).monospacedDigit() }
                TableColumn("State") { property in Text(property.operationalState) }
            }
            .frame(minHeight: 260)
        }
    }

    private var chartsRow: some View {
        DeskPanel(title: "MARKET VS ASSESSED") {
            Chart(properties, id: \.persistentModelID) { property in
                BarMark(
                    x: .value("Property", property.propertyName),
                    y: .value("Market", (property.marketAmount as NSDecimalNumber).doubleValue)
                )
                .foregroundStyle(DeskTheme.accent)
                BarMark(
                    x: .value("Property", property.propertyName),
                    y: .value("Assessed", (property.assessedAmount as NSDecimalNumber).doubleValue)
                )
                .foregroundStyle(DeskTheme.label.opacity(0.45))
            }
            .frame(height: 220)
        }
    }

    private var cityExposure: some View {
        DeskPanel(title: "CITY EXPOSURE") {
            let rows = cityExposureRows
            Table(rows) {
                TableColumn("City") { Text($0.municipality) }
                TableColumn("Units") { Text("\($0.units)").monospacedDigit() }
                TableColumn("Area") { Text(String(format: "%.0f", ($0.footprint as NSDecimalNumber).doubleValue)).monospacedDigit() }
                TableColumn("Market") { Text(Money(amount: $0.market, currencyCode: "BRL").formatted()).monospacedDigit() }
                TableColumn("Assessed") { Text(Money(amount: $0.assessed, currencyCode: "BRL").formatted()).monospacedDigit() }
            }
            .frame(minHeight: 180)
        }
    }

    private var cityExposureRows: [CityExposureRow] {
        let grouped = Dictionary(grouping: properties, by: \.municipality)
        return grouped.map { city, items in
            CityExposureRow(
                id: city,
                municipality: city,
                units: items.count,
                footprint: items.reduce(Decimal.zero) { $0 + $1.footprintSquareMeters },
                market: items.reduce(Decimal.zero) { $0 + $1.marketAmount },
                assessed: items.reduce(Decimal.zero) { $0 + $1.assessedAmount }
            )
        }
        .sorted { $0.municipality < $1.municipality }
    }

    private var notesPanel: some View {
        DeskPanel(title: "OPERATOR MEMOS") {
            let notes = memos.filter { $0.scope == .realEstate }.prefix(6)
            if notes.isEmpty {
                Text("No property desk memos for the latest capture.").foregroundStyle(DeskTheme.label)
            } else {
                ForEach(Array(notes), id: \.persistentModelID) { note in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(note.title).font(.headline)
                        Text(note.bodyText).foregroundStyle(DeskTheme.label)
                    }
                }
            }
        }
    }
}
