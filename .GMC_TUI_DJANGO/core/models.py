from django.db import models


class AssetCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=32, unique=True)
    color = models.CharField(max_length=16, default="#4CC9F0")
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name_plural = "Asset categories"

    def __str__(self) -> str:
        return f"{self.code} - {self.name}"


class Position(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        HOLD = "HOLD", "Hold"
        PENDING = "PENDING", "Pending"
        WATCH = "WATCH", "Watch"

    name = models.CharField(max_length=120)
    ticker = models.CharField(max_length=24, blank=True)
    category = models.ForeignKey(AssetCategory, on_delete=models.CASCADE, related_name="positions")
    bucket_name = models.CharField(max_length=100)
    current_value = models.DecimalField(max_digits=14, decimal_places=2)
    target_value = models.DecimalField(max_digits=14, decimal_places=2)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.ACTIVE)
    notes = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-current_value", "name"]

    def __str__(self) -> str:
        ticker = f" ({self.ticker})" if self.ticker else ""
        return f"{self.name}{ticker}"


class MacroSignal(models.Model):
    name = models.CharField(max_length=120, unique=True)
    signal_value = models.DecimalField(max_digits=8, decimal_places=2)
    regime = models.CharField(max_length=64)
    status_color = models.CharField(max_length=24, default="cyan")
    notes = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name}: {self.regime}"


class PropertyAsset(models.Model):
    name = models.CharField(max_length=120)
    asset_type = models.CharField(max_length=64)
    city = models.CharField(max_length=80)
    market_value = models.DecimalField(max_digits=14, decimal_places=2)
    tax_value = models.DecimalField(max_digits=14, decimal_places=2)
    area_m2 = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=24, default="OPERATIVE")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["city", "name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.city})"


class SystemNote(models.Model):
    class Panel(models.TextChoices):
        OVERVIEW = "OVERVIEW", "Overview"
        PORTFOLIO = "PORTFOLIO", "Portfolio"
        MACRO = "MACRO", "Macro"
        REAL_ESTATE = "REAL_ESTATE", "Real Estate"

    title = models.CharField(max_length=140)
    body = models.TextField()
    panel = models.CharField(max_length=16, choices=Panel.choices, default=Panel.OVERVIEW)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.panel} - {self.title}"
