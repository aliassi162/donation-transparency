from datetime import date
from decimal import Decimal

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import Distribution, DonationReceived, Household
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
