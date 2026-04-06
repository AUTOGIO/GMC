from django.utils import timezone

from .models import MacroSignal


def app_shell_context(request):
    active_regime = "UNSET"
    try:
        leading_signal = MacroSignal.objects.order_by("name").first()
        if leading_signal:
            active_regime = leading_signal.regime
    except Exception:
        active_regime = "UNAVAILABLE"

    return {
        "app_meta": {
            "title": "GMC TUI",
            "build": "v0.1",
            "operator_mode": "LIVE-SIM",
        },
        "footer_status": {
            "mode": "LIVE-SIM",
            "last_update": timezone.localtime().strftime("%Y-%m-%d %H:%M:%S"),
            "active_regime": active_regime,
            "data_source": "seed_sample_data",
            "hints": "[F1] Dash [F2] Portfolio [F3] Macro [F4] Real Estate",
        },
    }
