import json
from pathlib import Path

from django.core.management.base import BaseCommand

from core.models import AssetCategory, MacroSignal, Position, PropertyAsset, SystemNote


class Command(BaseCommand):
    help = "Load sample portfolio, macro, real estate, and notes data from JSON file."

    def handle(self, *args, **options):
        base_dir = Path(__file__).resolve().parents[3]
        sample_path = base_dir / "data" / "sample_portfolio.json"

        if not sample_path.exists():
            self.stderr.write(self.style.ERROR(f"Sample file not found: {sample_path}"))
            return

        with sample_path.open("r", encoding="utf-8") as stream:
            payload = json.load(stream)

        self.stdout.write("Resetting previous sample data...")
        Position.objects.all().delete()
        MacroSignal.objects.all().delete()
        PropertyAsset.objects.all().delete()
        SystemNote.objects.all().delete()
        AssetCategory.objects.all().delete()

        category_map = {}
        for item in payload.get("asset_categories", []):
            category = AssetCategory.objects.create(
                name=item["name"],
                code=item["code"],
                color=item.get("color", "#4CC9F0"),
                sort_order=item.get("sort_order", 0),
            )
            category_map[category.code] = category

        for item in payload.get("positions", []):
            category = category_map.get(item["category_code"])
            if not category:
                self.stderr.write(self.style.WARNING(f"Skipping position with unknown category: {item['name']}"))
                continue

            Position.objects.create(
                name=item["name"],
                ticker=item.get("ticker", ""),
                category=category,
                bucket_name=item["bucket_name"],
                current_value=item["current_value"],
                target_value=item["target_value"],
                status=item["status"],
                notes=item.get("notes", ""),
            )

        for item in payload.get("macro_signals", []):
            MacroSignal.objects.create(
                name=item["name"],
                signal_value=item["signal_value"],
                regime=item["regime"],
                status_color=item.get("status_color", "cyan"),
                notes=item.get("notes", ""),
            )

        for item in payload.get("property_assets", []):
            PropertyAsset.objects.create(
                name=item["name"],
                asset_type=item["asset_type"],
                city=item["city"],
                market_value=item["market_value"],
                tax_value=item["tax_value"],
                area_m2=item["area_m2"],
                status=item["status"],
            )

        for item in payload.get("system_notes", []):
            SystemNote.objects.create(
                title=item["title"],
                body=item["body"],
                panel=item["panel"],
            )

        self.stdout.write(self.style.SUCCESS("Sample data loaded successfully."))
