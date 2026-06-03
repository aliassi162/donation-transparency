from decimal import Decimal

from sqlalchemy import distinct, func
from sqlalchemy.orm import Session

from app.models import Distribution, DonationReceived
from app.schemas import PublicSummary


def calculate_summary(db: Session) -> PublicSummary:
    total_received = db.query(func.coalesce(func.sum(DonationReceived.amount), 0)).scalar()
    total_distributed = db.query(func.coalesce(func.sum(Distribution.amount), 0)).scalar()
    families_assisted = db.query(func.count(distinct(Distribution.household_id))).scalar() or 0
    donations_count = db.query(func.count(DonationReceived.id)).scalar() or 0
    distributions_count = db.query(func.count(Distribution.id)).scalar() or 0

    received = Decimal(total_received)
    distributed = Decimal(total_distributed)
    return PublicSummary(
        total_received=received,
        total_distributed=distributed,
        remaining_balance=received - distributed,
        families_assisted_count=families_assisted,
        donations_count=donations_count,
        distributions_count=distributions_count,
    )
