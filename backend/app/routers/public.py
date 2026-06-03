from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Distribution, DonationReceived
from app.schemas import PublicDistributionOut, PublicDonationOut, PublicSummary
from app.services import calculate_summary


router = APIRouter(prefix="/public", tags=["public"])


@router.get("/summary", response_model=PublicSummary)
def summary(db: Session = Depends(get_db)) -> PublicSummary:
    return calculate_summary(db)


@router.get("/donations", response_model=list[PublicDonationOut])
def donations(
    sort_by: str = Query("date", pattern="^(date|amount)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
) -> list[PublicDonationOut]:
    sort_column = DonationReceived.amount if sort_by == "amount" else DonationReceived.received_date
    sort_expr = sort_column.asc() if order == "asc" else sort_column.desc()
    rows = (
        db.query(DonationReceived)
        .order_by(sort_expr, DonationReceived.id.desc())
        .all()
    )
    return [
        PublicDonationOut(
            donor_display_name=row.donor_display_name if row.is_public and row.donor_display_name else "Private",
            donor_country=row.donor_country,
            amount=row.amount,
            received_date=row.received_date,
        )
        for row in rows
    ]


@router.get("/distributions", response_model=list[PublicDistributionOut])
def distributions(
    sort_by: str = Query("date", pattern="^(date|amount)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
) -> list[PublicDistributionOut]:
    sort_column = Distribution.amount if sort_by == "amount" else Distribution.distribution_date
    sort_expr = sort_column.asc() if order == "asc" else sort_column.desc()
    rows = (
        db.query(Distribution)
        .join(Distribution.household)
        .order_by(sort_expr, Distribution.id.desc())
        .all()
    )
    return [
        PublicDistributionOut(
            household_code=row.household.household_code,
            location=row.household.location,
            amount=row.amount,
            distribution_date=row.distribution_date,
            assistance_type=row.assistance_type,
        )
        for row in rows
    ]
