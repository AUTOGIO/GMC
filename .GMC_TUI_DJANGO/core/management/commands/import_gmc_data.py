from __future__ import annotations

import json
from decimal import Decimal
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import AssetCategory, MacroSignal, Position, PropertyAsset, SystemNote


CATEGORY_CONFIG = {
    "cash": {"name": "Cash", "code": "CASH", "color": "#FFB703", "sort_order": 1},
    "bonds": {"name": "Bonds", "code": "BONDS", "color": "#7AE582", "sort_order": 2},
    "gold": {"name": "Gold", "code": "GOLD", "color": "#F4D35E", "sort_order": 3},
    "equities": {"name": "Equities", "code": "EQ", "color": "#4CC9F0", "sort_order": 4},
    "bitcoin": {"name": "Digital Assets", "code": "CRYPTO", "color": "#4895EF", "sort_order": 5},
}


def dec(value) -> Decimal:
    return Decimal(str(value or 0))


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as stream:
        return json.load(stream)


def titleize(value: str | None) -> str:
    if not value:
        return ""
    return value.replace("_", " ").strip().title()


def format_usd(value: int | float | Decimal) -> str:
    return f"US${float(value):,.0f}"


def format_brl(value: int | float | Decimal) -> str:
    return f"R${float(value):,.0f}"


def extract_city(address: str | None) -> str:
    if not address:
        return "Unknown"
    parts = [part.strip() for part in address.split(",") if part.strip()]
    return parts[-1] if parts else "Unknown"


def build_property_name(item: dict, meta: dict) -> str:
    address = (item.get("endereco") or "").split(",")[0].strip()
    building = meta.get("building")
    if building and address:
        return f"{building} - {address}"
    if address:
        return f"{item.get('tipo', 'Property')} - {address}"
    return f"{item.get('tipo', 'Property')} #{item.get('id')}"


class Command(BaseCommand):
    help = "Import the real GMC source data vendored under data/gmc_source into the Django database."

    def add_arguments(self, parser):
        parser.add_argument(
            "--source-dir",
            default=None,
            help="Optional override for the vendored GMC source directory.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        base_dir = Path(__file__).resolve().parents[3]
        source_dir = Path(options["source_dir"]) if options["source_dir"] else base_dir / "data" / "gmc_source"

        portfolio_dir = source_dir / "portfolio"
        real_estate_dir = source_dir / "real_estate"

        required_paths = [
            portfolio_dir / "gmc_portfolio_state.json",
            portfolio_dir / "current_portfolio_snapshot.json",
            portfolio_dir / "optimized_allocation_gavetas.json",
            portfolio_dir / "detailed_equities_visa.json",
            portfolio_dir / "detailed_crypto_cfm.json",
            real_estate_dir / "imoveis_state.json",
            real_estate_dir / "property_meta.json",
        ]

        missing_paths = [str(path) for path in required_paths if not path.exists()]
        if missing_paths:
            raise CommandError(f"Missing required GMC source files: {', '.join(missing_paths)}")

        portfolio_state = load_json(portfolio_dir / "gmc_portfolio_state.json")
        current_snapshot = load_json(portfolio_dir / "current_portfolio_snapshot.json")
        optimized_gavetas = load_json(portfolio_dir / "optimized_allocation_gavetas.json")
        detailed_equities = load_json(portfolio_dir / "detailed_equities_visa.json")
        detailed_crypto = load_json(portfolio_dir / "detailed_crypto_cfm.json")
        real_estate_state = load_json(real_estate_dir / "imoveis_state.json")
        property_meta = load_json(real_estate_dir / "property_meta.json")

        self.stdout.write("Resetting existing data...")
        Position.objects.all().delete()
        MacroSignal.objects.all().delete()
        PropertyAsset.objects.all().delete()
        SystemNote.objects.all().delete()
        AssetCategory.objects.all().delete()

        category_map = {}
        for asset in portfolio_state.get("asset_allocation", []):
            config = CATEGORY_CONFIG.get(asset.get("asset_class_id"))
            if not config:
                continue
            category = AssetCategory.objects.create(**config)
            category_map[asset["asset_class_id"]] = category

        bucket_by_asset = {}
        for gaveta in portfolio_state.get("gavetas", []):
            for component in gaveta.get("components", []):
                bucket_by_asset[component.get("asset_class", "").lower()] = gaveta.get("name", "Core")

        position_count = 0
        for asset in portfolio_state.get("asset_allocation", []):
            category = category_map.get(asset.get("asset_class_id"))
            if not category:
                continue

            bucket_name = bucket_by_asset.get((asset.get("asset_class") or "").lower(), asset.get("asset_class", "Core"))
            for instrument in asset.get("instruments", []):
                notes = [
                    asset.get("role"),
                    f"Instrument type: {instrument.get('instrument_type', 'n/a')}",
                    f"Custodian: {instrument.get('custodian', 'n/a')}",
                    f"Source execution status: {titleize(instrument.get('execution_status')) or 'Unspecified'}",
                    instrument.get("notes"),
                ]
                Position.objects.create(
                    name=instrument.get("name") or instrument.get("ticker") or asset.get("asset_class", "Instrument"),
                    ticker=instrument.get("ticker") or "",
                    category=category,
                    bucket_name=bucket_name,
                    current_value=dec(instrument.get("amount_usd")),
                    target_value=dec(instrument.get("amount_usd")),
                    status=Position.Status.ACTIVE,
                    notes=" ".join(part.strip() for part in notes if part and str(part).strip()),
                )
                position_count += 1

        macro_signals = [
            {
                "name": "Current Macro Regime",
                "signal_value": portfolio_state.get("portfolio_summary", {}).get("defensive_weight", 0) * 100,
                "regime": titleize(portfolio_state.get("regime_engine", {}).get("current_regime")) or "Unspecified",
                "status_color": "amber",
                "notes": titleize(portfolio_state.get("source_context", {}).get("strategy_style")),
            },
            {
                "name": "Cash-Like Reserve",
                "signal_value": portfolio_state.get("portfolio_summary", {}).get("cash_like_weight", 0) * 100,
                "regime": "Immediate Liquidity",
                "status_color": "cyan",
                "notes": "Liquid reserve inside the 25/15/20/30/10 target book.",
            },
            {
                "name": "Defensive Sleeve",
                "signal_value": portfolio_state.get("portfolio_summary", {}).get("defensive_weight", 0) * 100,
                "regime": "Survival & Optionality",
                "status_color": "amber",
                "notes": "Cash, bonds, and gold combined.",
            },
            {
                "name": "Growth Sleeve",
                "signal_value": portfolio_state.get("portfolio_summary", {}).get("growth_weight", 0) * 100,
                "regime": "Selective Growth",
                "status_color": "green",
                "notes": "Global equities sleeve sized for asymmetric upside.",
            },
            {
                "name": "Convex Sleeve",
                "signal_value": portfolio_state.get("portfolio_summary", {}).get("convex_weight", 0) * 100,
                "regime": "Optionality",
                "status_color": "blue",
                "notes": "Bitcoin and related convex exposure.",
            },
            {
                "name": "Min Liquid Assets",
                "signal_value": portfolio_state.get("risk_framework", {}).get("portfolio_constraints", {}).get("min_liquid_assets_weight", 0) * 100,
                "regime": "Risk Constraint",
                "status_color": "cyan",
                "notes": "Minimum liquid assets floor from the imported risk framework.",
            },
            {
                "name": "Max High Volatility Bucket",
                "signal_value": portfolio_state.get("risk_framework", {}).get("portfolio_constraints", {}).get("max_high_volatility_bucket_weight", 0) * 100,
                "regime": "Risk Constraint",
                "status_color": "magenta",
                "notes": "Maximum high-volatility sleeve from the imported risk framework.",
            },
            {
                "name": "Brazil Tactical Max",
                "signal_value": portfolio_state.get("portfolio_summary", {}).get("brazil_tactical_weight_max", 0) * 100,
                "regime": "Underweight",
                "status_color": "red",
                "notes": "No new tactical Brazil exposure in the imported allocation plan.",
            },
        ]

        for signal in macro_signals:
            MacroSignal.objects.create(
                name=signal["name"],
                signal_value=dec(signal["signal_value"]),
                regime=signal["regime"],
                status_color=signal["status_color"],
                notes=signal["notes"],
            )

        tenant_status_by_property = {str(item.get("idImovel")): item.get("status") for item in real_estate_state.get("inquilinos", [])}
        property_count = 0
        for item in real_estate_state.get("imoveis", []):
            item_id = str(item.get("id"))
            meta = property_meta.get(item_id, {})
            market_value = item.get("valorVenda") or meta.get("market_value") or 0
            tax_value = meta.get("tax_value") or market_value
            area_m2 = item.get("metragem")
            if area_m2 is None:
                area_m2 = meta.get("area") or 0
            rental_status = (tenant_status_by_property.get(item_id) or "").strip().lower()
            if (item.get("aluguelMensal") or 0) <= 0:
                status = "VACANT"
            elif rental_status == "ativo":
                status = "LEASED"
            elif rental_status == "vencido":
                status = "LEASED-EXP"
            elif rental_status:
                status = rental_status.upper()
            else:
                status = "LEASED"

            PropertyAsset.objects.create(
                name=build_property_name(item, meta),
                asset_type=item.get("tipo") or "Property",
                city=extract_city(item.get("endereco")),
                market_value=dec(market_value),
                tax_value=dec(tax_value),
                area_m2=dec(area_m2),
                status=status,
            )
            property_count += 1

        source_context = portfolio_state.get("source_context", {})
        portfolio_summary = portfolio_state.get("portfolio_summary", {})
        risk_framework = portfolio_state.get("risk_framework", {})
        real_estate_kpis = real_estate_state.get("dashboard_kpis", {})
        relatorio_mensal = real_estate_state.get("relatorio_mensal", {})
        relatorio_anual = real_estate_state.get("relatorio_anual", {})

        overview_notes = [
            (
                "GMC Source Import",
                "Imported the vendored GMC source portfolio and real-estate data into the Django app. "
                f"Portfolio update: {portfolio_state.get('last_update', 'n/a')}. "
                f"Real-estate update: {real_estate_state.get('last_update', 'n/a')}.",
                SystemNote.Panel.OVERVIEW,
            ),
            (
                "Portfolio Doctrine",
                titleize(source_context.get("investment_doctrine")) or "Doctrine unavailable in source data.",
                SystemNote.Panel.OVERVIEW,
            ),
            (
                "Structural Snapshot",
                "Current structural holdings from the imported source snapshot: "
                + "; ".join(
                    f"{item.get('asset')}: {format_usd(item.get('value_usd', 0))}"
                    for item in current_snapshot.get("assets", [])
                ),
                SystemNote.Panel.OVERVIEW,
            ),
        ]

        portfolio_notes = [
            (
                "Deployable Capital",
                f"Imported liquid capital available for the convex portfolio: {format_usd(source_context.get('capital_available_usd', 0))}. "
                f"Target mix: cash {int(portfolio_summary.get('cash_like_weight', 0) * 100)}%, "
                f"bonds 15%, gold {int(0.20 * 100)}%, equities {int(portfolio_summary.get('growth_weight', 0) * 100)}%, "
                f"bitcoin {int(portfolio_summary.get('convex_weight', 0) * 100)}%.",
                SystemNote.Panel.PORTFOLIO,
            ),
            (
                "Current Implied Allocation",
                "Imported current snapshot mix: "
                f"preservation {current_snapshot.get('implied_allocation', {}).get('preservation_percent', 0)}%, "
                f"tactical {current_snapshot.get('implied_allocation', {}).get('tactical_percent', 0)}%, "
                f"convex growth {current_snapshot.get('implied_allocation', {}).get('convex_growth_percent', 0)}%.",
                SystemNote.Panel.PORTFOLIO,
            ),
        ]

        for gaveta in optimized_gavetas.get("gavetas", []):
            portfolio_notes.append(
                (
                    f"Gaveta: {gaveta.get('gaveta')}",
                    f"Imported target allocation {format_usd(gaveta.get('allocation_usd', 0))} ({gaveta.get('percent', 0)}%). "
                    f"{gaveta.get('rationale', '')}",
                    SystemNote.Panel.PORTFOLIO,
                )
            )

        if detailed_equities.get("notes"):
            portfolio_notes.append(
                (
                    "Equities Sleeve Notes",
                    " ".join(detailed_equities["notes"]),
                    SystemNote.Panel.PORTFOLIO,
                )
            )
        if detailed_crypto.get("notes"):
            portfolio_notes.append(
                (
                    "Crypto Sleeve Notes",
                    " ".join(detailed_crypto["notes"]),
                    SystemNote.Panel.PORTFOLIO,
                )
            )

        macro_notes = []
        for scenario in risk_framework.get("stress_scenarios", []):
            winners = ", ".join(titleize(item) for item in scenario.get("expected_winners", []))
            losers = ", ".join(titleize(item) for item in scenario.get("expected_losers", []))
            macro_notes.append(
                (
                    f"Trigger: {titleize(scenario.get('scenario_id'))}",
                    f"{scenario.get('description', '')} Winners: {winners or 'n/a'}. Losers: {losers or 'n/a'}.",
                    SystemNote.Panel.MACRO,
                )
            )

        macro_notes.extend(
            [
                (
                    "Risk Definition",
                    "Imported portfolio risk definition: "
                    + ", ".join(titleize(item) for item in risk_framework.get("risk_definition", [])),
                    SystemNote.Panel.MACRO,
                ),
                (
                    "Source Context",
                    " ".join(source_context.get("notes", [])) or "No source context notes were provided.",
                    SystemNote.Panel.MACRO,
                ),
            ]
        )

        real_estate_notes = [
            (
                "Monthly Real-Estate Summary",
                f"{relatorio_mensal.get('periodo', 'Period unavailable')}: expected rent {format_brl(relatorio_mensal.get('rendaEsperada', 0))}, "
                f"received {format_brl(relatorio_mensal.get('rendaRecebida', 0))}, "
                f"default {format_brl(relatorio_mensal.get('inadimplencia', 0))}, "
                f"net income {format_brl(relatorio_mensal.get('lucroLiquido', 0))}.",
                SystemNote.Panel.REAL_ESTATE,
            ),
            (
                "Occupancy and Revenue",
                f"Imported {real_estate_kpis.get('totalImoveis', 0)} properties with occupancy at {real_estate_kpis.get('taxaOcupacao', 0)}% "
                f"and estimated monthly rent of {format_brl(real_estate_kpis.get('rendaMensalEstimada', 0))}.",
                SystemNote.Panel.REAL_ESTATE,
            ),
        ]

        top_roi = (real_estate_kpis.get("top5Rentabilidade") or [{}])[0]
        if top_roi.get("id"):
            real_estate_notes.append(
                (
                    "Top ROI Property",
                    f"Property {top_roi.get('id')} ({top_roi.get('tipo')}) leads the imported ROI ranking at "
                    f"{top_roi.get('rentabilidadeAnualPct', 0)}% annual rentability.",
                    SystemNote.Panel.REAL_ESTATE,
                )
            )

        for title, body, panel in overview_notes + portfolio_notes + macro_notes + real_estate_notes:
            SystemNote.objects.create(title=title, body=body, panel=panel)

        self.stdout.write(
            self.style.SUCCESS(
                "Imported GMC data successfully "
                f"({len(category_map)} categories, {position_count} positions, {len(macro_signals)} macro signals, "
                f"{property_count} properties, {SystemNote.objects.count()} notes)."
            )
        )
