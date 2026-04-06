from django.urls import path

from . import views

app_name = "core"

urlpatterns = [
    path("", views.dashboard_view, name="dashboard"),
    path("portfolio/", views.portfolio_view, name="portfolio"),
    path("macro/", views.macro_view, name="macro"),
    path("real-estate/", views.real_estate_view, name="real_estate"),
    path("htmx/kpis/", views.kpi_grid_partial, name="kpi_grid_partial"),
    path("htmx/notes/", views.notes_feed_partial, name="notes_feed_partial"),
    path("htmx/status/", views.status_bar_partial, name="status_bar_partial"),
]
