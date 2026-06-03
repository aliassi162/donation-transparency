from datetime import date, datetime
from decimal import Decimal
from io import BytesIO
import asyncio

from fastapi import UploadFile
from openpyxl import Workbook
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import Distribution, DonationReceived, Household
from app.routers.admin import import_workbook, parse_date
from app.services import calculate_summary


def test_summary_calculation_counts_distinct_households():
    engine = create_engine("sqlite:///:memory:")
    TestingSession = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    with TestingSession() as db:
        h1 = Household(household_code="HH-0001")
        h2 = Household(household_code="HH-0002")
        db.add_all([h1, h2])
        db.flush()
        db.add_all(
            [
                DonationReceived(amount=Decimal("100.00"), currency="USD", received_date=date(2026, 1, 1)),
                DonationReceived(amount=Decimal("50.50"), currency="USD", received_date=date(2026, 1, 2)),
                Distribution(household_id=h1.id, amount=Decimal("25.00"), currency="USD", distribution_date=date(2026, 1, 3)),
                Distribution(household_id=h1.id, amount=Decimal("10.00"), currency="USD", distribution_date=date(2026, 1, 4)),
                Distribution(household_id=h2.id, amount=Decimal("40.00"), currency="USD", distribution_date=date(2026, 1, 5)),
            ]
        )
        db.commit()

        summary = calculate_summary(db)

    assert summary.total_received == Decimal("150.50")
    assert summary.total_distributed == Decimal("75.00")
    assert summary.remaining_balance == Decimal("75.50")
    assert summary.families_assisted_count == 2
    assert summary.donations_count == 2
    assert summary.distributions_count == 3


def workbook_upload(rows: list[tuple[str, str, int, str | datetime, str, str]]) -> UploadFile:
    workbook = Workbook()
    households = workbook.active
    households.title = "households"
    households.append(["household_code", "location", "private_name", "private_phone", "private_notes", "status"])
    households.append(["HH-0001", "Ansar", "Family One", "", "", "active"])
    households.append(["HH-0002", "Ansar", "Family Two", "", "", "active"])

    distributions = workbook.create_sheet("distributions")
    distributions.append(["distribution_code", "household_code", "amount", "distribution_date", "assistance_type", "notes"])
    for row in rows:
        distributions.append(row)

    stream = BytesIO()
    workbook.save(stream)
    stream.seek(0)
    return UploadFile(filename="import.xlsx", file=stream)


def test_workbook_import_updates_existing_rows_without_duplicates():
    engine = create_engine("sqlite:///:memory:")
    TestingSession = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    with TestingSession() as db:
        first = workbook_upload([("DIST-0001", "HH-0001", 50, datetime(2026, 6, 3), "cash_transfer", "First support")])
        result = asyncio.run(import_workbook(file=first, db=db))
        assert result.valid is True

        second = workbook_upload(
            [
                ("DIST-0001", "HH-0001", 75, datetime(2026, 6, 3), "cash_transfer", "Updated support"),
                ("DIST-0002", "HH-0002", 25, datetime(2026, 6, 4), "cash_transfer", "Second support"),
            ]
        )
        result = asyncio.run(import_workbook(file=second, db=db))

        assert result.valid is True
        assert db.query(Household).count() == 2
        assert db.query(Distribution).count() == 2
        updated = db.query(Distribution).filter(Distribution.distribution_code == "DIST-0001").one()
        assert updated.amount == Decimal("75")
        assert updated.notes == "Updated support"


def test_parse_date_accepts_excel_like_date_values():
    for value in ["2026-06-03", "2026-06-03 00:00:00", "2026-06-03T00:00:00", "\ufeff2026\u201106\u201103"]:
        errors: list[str] = []
        assert parse_date(value, "distribution_date", errors) == date(2026, 6, 3)
        assert errors == []
