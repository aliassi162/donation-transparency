from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import HouseholdStatus


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class DonationBase(BaseModel):
    donor_name: str | None = None
    donor_display_name: str | None = None
    donor_country: str | None = None
    is_public: bool = False
    amount: Decimal = Field(gt=0)
    received_date: date
    notes: str | None = None


class DonationCreate(DonationBase):
    pass


class DonationUpdate(DonationBase):
    pass


class DonationOut(DonationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class PublicDonationOut(BaseModel):
    donor_display_name: str
    donor_country: str | None = None
    amount: Decimal
    received_date: date


class HouseholdBase(BaseModel):
    household_code: str
    location: str | None = None
    private_name: str | None = None
    private_phone: str | None = None
    private_notes: str | None = None
    status: HouseholdStatus = HouseholdStatus.active


class HouseholdCreate(HouseholdBase):
    pass


class HouseholdUpdate(HouseholdBase):
    pass


class HouseholdOut(HouseholdBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class DistributionBase(BaseModel):
    household_id: int | None = None
    household_code: str | None = None
    amount: Decimal = Field(gt=0)
    distribution_date: date
    assistance_type: str | None = None
    notes: str | None = None


class DistributionCreate(DistributionBase):
    pass


class DistributionUpdate(DistributionBase):
    pass


class DistributionOut(BaseModel):
    id: int
    household_id: int
    household_code: str
    location: str | None = None
    amount: Decimal
    distribution_date: date
    assistance_type: str | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime


class PublicDistributionOut(BaseModel):
    household_code: str
    location: str | None = None
    amount: Decimal
    distribution_date: date
    assistance_type: str | None = None


class PublicSummary(BaseModel):
    total_received: Decimal
    total_distributed: Decimal
    remaining_balance: Decimal
    families_assisted_count: int
    donations_count: int
    distributions_count: int


class ImportErrorRow(BaseModel):
    row: int
    errors: list[str]


class ImportPreview(BaseModel):
    valid: bool
    rows_valid: int
    errors: list[ImportErrorRow]
