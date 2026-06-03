import enum
from datetime import date, datetime
from decimal import Decimal
from typing import List

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class HouseholdStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), default="admin")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class DonationReceived(Base):
    __tablename__ = "donations_received"

    id: Mapped[int] = mapped_column(primary_key=True)
    donor_name: Mapped[str] = mapped_column(String(255), nullable=True)
    donor_display_name: Mapped[str] = mapped_column(String(255), nullable=True)
    donor_country: Mapped[str] = mapped_column(String(100), nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    received_date: Mapped[date] = mapped_column(Date)
    payment_method: Mapped[str] = mapped_column(String(100), nullable=True)
    reference: Mapped[str] = mapped_column(String(255), nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Household(Base):
    __tablename__ = "households"

    id: Mapped[int] = mapped_column(primary_key=True)
    household_code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    location: Mapped[str] = mapped_column(String(255), nullable=True)
    private_name: Mapped[str] = mapped_column(String(255), nullable=True)
    private_phone: Mapped[str] = mapped_column(String(100), nullable=True)
    private_notes: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[HouseholdStatus] = mapped_column(Enum(HouseholdStatus), default=HouseholdStatus.active)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    distributions: Mapped[List["Distribution"]] = relationship(back_populates="household", cascade="all, delete")


class Distribution(Base):
    __tablename__ = "distributions"

    id: Mapped[int] = mapped_column(primary_key=True)
    distribution_code: Mapped[str] = mapped_column(String(100), unique=True, nullable=True)
    household_id: Mapped[int] = mapped_column(ForeignKey("households.id", ondelete="CASCADE"))
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    distribution_date: Mapped[date] = mapped_column(Date)
    assistance_type: Mapped[str] = mapped_column(String(100), nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    household: Mapped[Household] = relationship(back_populates="distributions")
