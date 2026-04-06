from django.contrib import admin

from .models import AssetCategory, MacroSignal, Position, PropertyAsset, SystemNote


@admin.register(AssetCategory)
class AssetCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "color", "sort_order")
    list_filter = ("sort_order",)
    search_fields = ("name", "code")
    ordering = ("sort_order", "name")


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "ticker",
        "category",
        "bucket_name",
        "current_value",
        "target_value",
        "status",
        "updated_at",
    )
    list_filter = ("status", "category", "bucket_name")
    search_fields = ("name", "ticker", "notes", "bucket_name")
    ordering = ("-current_value",)


@admin.register(MacroSignal)
class MacroSignalAdmin(admin.ModelAdmin):
    list_display = ("name", "signal_value", "regime", "status_color", "updated_at")
    list_filter = ("regime", "status_color")
    search_fields = ("name", "regime", "notes")


@admin.register(PropertyAsset)
class PropertyAssetAdmin(admin.ModelAdmin):
    list_display = ("name", "asset_type", "city", "market_value", "tax_value", "area_m2", "status", "updated_at")
    list_filter = ("asset_type", "city", "status")
    search_fields = ("name", "city", "asset_type")


@admin.register(SystemNote)
class SystemNoteAdmin(admin.ModelAdmin):
    list_display = ("title", "panel", "created_at")
    list_filter = ("panel", "created_at")
    search_fields = ("title", "body")
