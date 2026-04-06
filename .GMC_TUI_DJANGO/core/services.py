from __future__ import annotations

from decimal import Decimal
from typing import Any

from django.db.models import Q
from django.utils import timezone

from .models import AssetCategory, MacroSignal, Position, PropertyAsset, SystemNote

STATUS_TONE = {
    Position.Status.ACTIVE: "ok",
    Position.Status.HOLD: "info",
    Position.Status.PENDING: "warn",
    Position.Status.WATCH: "alert",
}


def _to_float(value: Decimal | float | int | None) -> float:
    if value is None:
        return 0.0
    return float(value)


def _percent(part: float, total: float) -> float:
    if total == 0:
        return 0.0
    return round((part / total) * 100, 2)


def get_dashboard_data() -> dict[str, Any]:
    categories = list(AssetCategory.objects.order_by("sort_order", "name"))
    positions = list(Position.objects.select_related("category"))
    macro_signals = list(MacroSignal.objects.order_by("name"))
    notes = list(SystemNote.objects.order_by("-created_at")[:8])

    total_current = sum(_to_float(item.current_value) for item in positions)
    total_target = sum(_to_float(item.target_value) for item in positions)

    allocation_summary = []
    for category in categories:
        cat_positions = [p for p in positions if p.category_id == category.id]
        cat_current = sum(_to_float(p.current_value) for p in cat_positions)
        cat_target = sum(_to_float(p.target_value) for p in cat_positions)
        allocation_summary.append(
            {
                "category": category,
                "current": cat_current,
                "target": cat_target,
                "drift_pct": round(_percent(cat_current - cat_target, cat_target), 2),
                "weight_pct": round(_percent(cat_current, total_current), 2),
            }
        )

    top_positions = sorted(positions, key=lambda p: p.current_value, reverse=True)[:8]

    latest_marks = [
        Position.objects.order_by("-updated_at").values_list("updated_at", flat=True).first(),
        MacroSignal.objects.order_by("-updated_at").values_list("updated_at", flat=True).first(),
        PropertyAsset.objects.order_by("-updated_at").values_list("updated_at", flat=True).first(),
    ]
    latest_update = max([mark for mark in latest_marks if mark], default=None)
    data_age_minutes = 0
    if latest_update:
        delta = timezone.now() - latest_update
        data_age_minutes = max(int(delta.total_seconds() // 60), 0)

    kpis = {
        "total_current": round(total_current, 2),
        "total_target": round(total_target, 2),
        "drift_pct": round(_percent(total_current - total_target, total_target), 2),
        "active_positions": len([p for p in positions if p.status == Position.Status.ACTIVE]),
        "watch_positions": len([p for p in positions if p.status == Position.Status.WATCH]),
    }

    chart_palette = [
        "#4CC9F0",
        "#7AE582",
        "#FFB703",
        "#F72585",
        "#4895EF",
        "#F94144",
        "#80FFDB",
        "#B5179E",
    ]

    composition_chart = {
        "labels": [entry["category"].name for entry in allocation_summary],
        "values": [round(entry["current"], 2) for entry in allocation_summary],
        "colors": [entry["category"].color or chart_palette[idx % len(chart_palette)] for idx, entry in enumerate(allocation_summary)],
    }

    target_chart = {
        "labels": [item.ticker or item.name[:10] for item in top_positions],
        "current": [round(_to_float(item.current_value), 2) for item in top_positions],
        "target": [round(_to_float(item.target_value), 2) for item in top_positions],
    }

    regime_signal = next((signal for signal in macro_signals if signal.name.lower() == "current macro regime"), None)
    active_regime = regime_signal.regime if regime_signal else (macro_signals[0].regime if macro_signals else "UNSET")

    return {
        "kpis": kpis,
        "allocation_summary": allocation_summary,
        "composition_chart": composition_chart,
        "target_chart": target_chart,
        "macro_signals": macro_signals,
        "recent_notes": notes,
        "system_health": {
            "positions": len(positions),
            "signals": len(macro_signals),
            "properties": PropertyAsset.objects.count(),
            "data_age_minutes": data_age_minutes,
            "active_regime": active_regime,
        },
        "market_block": [
            {"label": "SPX", "value": "+0.42%", "tone": "ok"},
            {"label": "DXY", "value": "-0.18%", "tone": "info"},
            {"label": "UST10Y", "value": "4.08%", "tone": "warn"},
            {"label": "Weather", "value": "Fortaleza 29°C", "tone": "ok"},
        ],
    }


def get_portfolio_data(params) -> dict[str, Any]:
    status = (params.get("status") or "ALL").upper()
    category_code = (params.get("category") or "ALL").upper()
    search_term = (params.get("q") or "").strip()
    sort = params.get("sort") or "-current_value"

    allowed_sorts = {
        "name": "name",
        "-name": "-name",
        "current_value": "current_value",
        "-current_value": "-current_value",
        "target_value": "target_value",
        "-target_value": "-target_value",
        "updated_at": "updated_at",
        "-updated_at": "-updated_at",
        "status": "status",
        "-status": "-status",
    }

    queryset = Position.objects.select_related("category")

    if status in {choice for choice, _ in Position.Status.choices}:
        queryset = queryset.filter(status=status)

    if category_code != "ALL":
        queryset = queryset.filter(category__code__iexact=category_code)

    if search_term:
        queryset = queryset.filter(
            Q(name__icontains=search_term)
            | Q(ticker__icontains=search_term)
            | Q(bucket_name__icontains=search_term)
            | Q(notes__icontains=search_term)
        )

    queryset = queryset.order_by(allowed_sorts.get(sort, "-current_value"), "name")
    positions = list(queryset)

    categories = list(AssetCategory.objects.order_by("sort_order", "name"))
    total_current = sum(_to_float(item.current_value) for item in positions)

    summary = []
    for category in categories:
        cat_positions = [p for p in positions if p.category_id == category.id]
        if not cat_positions:
            continue
        cat_current = sum(_to_float(item.current_value) for item in cat_positions)
        cat_target = sum(_to_float(item.target_value) for item in cat_positions)
        summary.append(
            {
                "category": category,
                "current": cat_current,
                "target": cat_target,
                "drift_pct": round(_percent(cat_current - cat_target, cat_target), 2),
                "weight_pct": round(_percent(cat_current, total_current), 2),
            }
        )

    liquidity_value = sum(
        _to_float(item.current_value)
        for item in positions
        if any(key in item.bucket_name.lower() for key in ["cash", "liquid", "treasury", "reserve"])
    )
    preservation_value = sum(
        _to_float(item.current_value)
        for item in positions
        if item.status in {Position.Status.HOLD, Position.Status.ACTIVE}
    )
    convexity_value = _percent(
        len([item for item in positions if item.status in {Position.Status.WATCH, Position.Status.PENDING}]),
        len(positions),
    )

    return {
        "positions": positions,
        "categories": categories,
        "allocation_summary": summary,
        "drift_chart": {
            "labels": [item["category"].code for item in summary],
            "values": [round(item["drift_pct"], 2) for item in summary],
        },
        "filters": {
            "status": status,
            "category": category_code,
            "q": search_term,
            "sort": sort,
        },
        "metrics": {
            "liquidity_ratio": round(_percent(liquidity_value, total_current), 2),
            "preservation_ratio": round(_percent(preservation_value, total_current), 2),
            "convexity_score": round(convexity_value, 2),
            "liquidity_value": round(liquidity_value, 2),
            "total_current": round(total_current, 2),
        },
        "status_tone": STATUS_TONE,
    }


def get_macro_data() -> dict[str, Any]:
    signals = list(MacroSignal.objects.order_by("name"))
    all_macro_notes = list(SystemNote.objects.filter(panel=SystemNote.Panel.MACRO).order_by("-created_at"))
    trigger_rules = [note.body for note in all_macro_notes if note.title.startswith("Trigger:")][:4]
    macro_notes = [note for note in all_macro_notes if not note.title.startswith("Trigger:")][:6]

    periods = ["T-7", "T-6", "T-5", "T-4", "T-3", "T-2", "T-1", "NOW"]
    palette = ["#4CC9F0", "#7AE582", "#FFB703", "#F72585", "#4895EF", "#F94144"]
    datasets = []

    for idx, signal in enumerate(signals[:6]):
        base = _to_float(signal.signal_value)
        trend = [round(base * (0.90 + (step * 0.015) + (idx * 0.004)), 2) for step in range(len(periods))]
        datasets.append(
            {
                "label": signal.name,
                "data": trend,
                "borderColor": palette[idx % len(palette)],
                "backgroundColor": palette[idx % len(palette)],
            }
        )

    heat_rows = []
    for signal in signals:
        value = _to_float(signal.signal_value)
        intensity = min(max(int(abs(value) * 8), 5), 95)
        heat_rows.append({"signal": signal, "intensity": intensity})

    return {
        "signals": signals,
        "heat_rows": heat_rows,
        "trend_chart": {
            "labels": periods,
            "datasets": datasets,
        },
        "rules": trigger_rules
        or [
            "If liquidity_ratio < 12% => shift 5% from cyclical to cash-like instruments.",
            "If DXY acceleration > 1.5 sigma => reduce EM exposure by 2 tactical units.",
            "If inflation impulse cools for 3 prints => add duration in core fixed income.",
            "If credit stress index > 70 => freeze new high-beta entries for 15 sessions.",
        ],
        "operator_notes": macro_notes,
    }


def get_real_estate_data() -> dict[str, Any]:
    properties = list(PropertyAsset.objects.order_by("city", "name"))
    total_market = sum(_to_float(item.market_value) for item in properties)
    total_tax = sum(_to_float(item.tax_value) for item in properties)
    total_area = sum(_to_float(item.area_m2) for item in properties)

    by_city: dict[str, dict[str, float]] = {}
    by_type: dict[str, float] = {}
    for item in properties:
        city_metrics = by_city.setdefault(item.city, {"units": 0, "area": 0.0, "market": 0.0, "tax": 0.0})
        city_metrics["units"] += 1
        city_metrics["area"] += _to_float(item.area_m2)
        city_metrics["market"] += _to_float(item.market_value)
        city_metrics["tax"] += _to_float(item.tax_value)
        by_type[item.asset_type] = by_type.get(item.asset_type, 0.0) + _to_float(item.market_value)

    city_rows = [
        {
            "city": city,
            "units": values["units"],
            "area": round(values["area"], 2),
            "market": round(values["market"], 2),
            "tax": round(values["tax"], 2),
        }
        for city, values in sorted(by_city.items())
    ]

    exposure = [
        {"type": key, "market": round(value, 2), "weight": round(_percent(value, total_market), 2)}
        for key, value in sorted(by_type.items())
    ]

    return {
        "properties": properties,
        "summary": {
            "total_market": round(total_market, 2),
            "total_tax": round(total_tax, 2),
            "total_area": round(total_area, 2),
            "units": len(properties),
            "tax_gap_pct": round(_percent(total_market - total_tax, total_tax), 2),
        },
        "value_chart": {
            "labels": [item.name for item in properties],
            "market": [round(_to_float(item.market_value), 2) for item in properties],
            "tax": [round(_to_float(item.tax_value), 2) for item in properties],
        },
        "city_rows": city_rows,
        "exposure": exposure,
    }


def get_notes(panel: str | None = None, limit: int = 6):
    queryset = SystemNote.objects.order_by("-created_at")
    if panel:
        queryset = queryset.filter(panel=panel)
    return list(queryset[:limit])
