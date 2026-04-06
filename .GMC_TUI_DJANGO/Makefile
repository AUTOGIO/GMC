VENV := .venv
PYTHON := $(VENV)/bin/python
PIP := $(VENV)/bin/pip

.PHONY: install migrate seed import_gmc run

install:
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt

migrate:
	$(PYTHON) manage.py makemigrations core
	$(PYTHON) manage.py migrate

seed:
	$(PYTHON) manage.py seed_sample_data

import_gmc:
	$(PYTHON) manage.py import_gmc_data

run:
	$(PYTHON) manage.py runserver
