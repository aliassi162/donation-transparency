# Donation Transparency

A simple public transparency dashboard for externally received donations and household aid distributions. It does not process payments.

## Stack

- Frontend: Vite, React, TypeScript, Tailwind CSS
- Backend: FastAPI, SQLAlchemy, Alembic
- Database: SQLite locally by default, PostgreSQL via Docker Compose
- Auth: single seeded admin account, bcrypt password hashes, JWT bearer tokens

## Setup

1. Copy `.env.example` to `.env`.
2. Set `SECRET_KEY`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
3. Start the backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

4. Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

This starts PostgreSQL, FastAPI on `http://localhost:8000`, and Vite on `http://localhost:5173`.

## Migrations

The app auto-creates tables for a local MVP. For explicit migrations:

```bash
cd backend
alembic upgrade head
```

## CSV and Excel Import

Admin CSV import validates the full file before saving. Invalid uploads return row numbers and errors, and no rows are imported.

- Households: `household_code, location, private_name, private_phone, private_notes, status`
- Donations: `amount, received_date, donor_name, donor_display_name, donor_country, is_public, notes`
- Distributions: `distribution_code, household_code, amount, distribution_date, assistance_type, notes`

All amounts are tracked and displayed in USD.

Dates use `YYYY-MM-DD`. Distribution imports match households by `household_code`.

Admins can also upload one `.xlsx` workbook through the Excel workbook import. It must contain two sheets named exactly:

- `households`
- `distributions`

The workbook import is accumulative. Existing households are updated by `household_code`, and new household codes are created. Distributions are updated by `distribution_code` when it is provided. If `distribution_code` is missing, the backend tries to avoid duplicates by matching `household_code`, `amount`, `distribution_date`, and `assistance_type`.

Recommended workbook columns:

- `households`: `household_code, location, private_name, private_phone, private_notes, status`
- `distributions`: `distribution_code, household_code, amount, distribution_date, assistance_type, notes`

## Privacy Rules

Public APIs never expose household names, phone numbers, private notes, donor private names, or notes. Public donations show `donor_display_name` only when `is_public` is true; otherwise the donor appears as `Private`.

## Tests

```bash
cd backend
pytest
```
