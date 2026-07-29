#!/usr/bin/env python3
"""Validate GMC capture bundle layout (portfolio + real_estate JSON)."""
import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
FIXTURE = REPO / "tests" / "fixtures" / "minimal_gmc_source"
DEFAULT = REPO / "data" / "gmc_source"


def validate(bundle: Path) -> list[str]:
    errors: list[str] = []
    portfolio = bundle / "portfolio" / "gmc_portfolio_state.json"
    property_state = bundle / "real_estate" / "imoveis_state.json"
    if not portfolio.is_file():
        errors.append(f"missing {portfolio}")
    if not property_state.is_file():
        errors.append(f"missing {property_state}")
    if portfolio.is_file():
        data = json.loads(portfolio.read_text(encoding="utf-8"))
        if "portfolio_summary" not in data:
            errors.append("portfolio JSON missing portfolio_summary")
        if "asset_allocation" not in data:
            errors.append("portfolio JSON missing asset_allocation")
    if property_state.is_file():
        data = json.loads(property_state.read_text(encoding="utf-8"))
        if "imoveis" not in data:
            errors.append("property JSON missing imoveis")
    return errors


def main() -> int:
    targets = [FIXTURE]
    if DEFAULT.is_dir():
        targets.append(DEFAULT)
    failed = False
    for bundle in targets:
        errors = validate(bundle)
        if errors:
            failed = True
            print(f"FAIL {bundle}:")
            for err in errors:
                print(f"  - {err}")
        else:
            print(f"OK {bundle}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
