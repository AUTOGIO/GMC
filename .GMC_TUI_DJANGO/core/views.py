from django.http import HttpRequest, HttpResponse
from django.shortcuts import render

from .context_processors import app_shell_context
from .models import SystemNote
from .services import get_dashboard_data, get_macro_data, get_notes, get_portfolio_data, get_real_estate_data


def dashboard_view(request: HttpRequest) -> HttpResponse:
    data = get_dashboard_data()
    return render(request, "core/dashboard.html", data)


def portfolio_view(request: HttpRequest) -> HttpResponse:
    data = get_portfolio_data(request.GET)
    return render(request, "core/portfolio.html", data)


def macro_view(request: HttpRequest) -> HttpResponse:
    data = get_macro_data()
    return render(request, "core/macro.html", data)


def real_estate_view(request: HttpRequest) -> HttpResponse:
    data = get_real_estate_data()
    return render(request, "core/real_estate.html", data)


def kpi_grid_partial(request: HttpRequest) -> HttpResponse:
    data = get_dashboard_data()
    return render(request, "core/partials/kpi_grid.html", {"kpis": data["kpis"]})


def notes_feed_partial(request: HttpRequest) -> HttpResponse:
    notes = get_notes(panel=SystemNote.Panel.OVERVIEW, limit=6)
    return render(request, "core/partials/notes_feed.html", {"recent_notes": notes})


def status_bar_partial(request: HttpRequest) -> HttpResponse:
    context = app_shell_context(request)
    return render(request, "core/partials/status_bar.html", context)
