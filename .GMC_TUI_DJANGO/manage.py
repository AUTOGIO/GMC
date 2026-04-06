#!/usr/bin/env python
import os
import sys

from decouple import config


def main() -> None:
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gmc_tui.settings")
    if len(sys.argv) == 2 and sys.argv[1] == "runserver":
        app_host = config("APP_HOST", default="127.0.0.1")
        app_port = config("APP_PORT", default=8765, cast=int)
        sys.argv.append(f"{app_host}:{app_port}")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
