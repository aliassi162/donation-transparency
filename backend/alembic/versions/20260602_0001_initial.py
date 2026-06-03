"""initial schema

Revision ID: 20260602_0001
Revises:
Create Date: 2026-06-02
"""

from alembic import op
import sqlalchemy as sa


revision = "20260602_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_table(
        "donations_received",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("donor_name", sa.String(length=255), nullable=True),
        sa.Column("donor_display_name", sa.String(length=255), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("received_date", sa.Date(), nullable=False),
        sa.Column("payment_method", sa.String(length=100), nullable=True),
        sa.Column("reference", sa.String(length=255), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "households",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("household_code", sa.String(length=50), nullable=False),
        sa.Column("private_name", sa.String(length=255), nullable=True),
        sa.Column("private_phone", sa.String(length=100), nullable=True),
        sa.Column("private_notes", sa.Text(), nullable=True),
        sa.Column("status", sa.Enum("active", "inactive", name="householdstatus"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("household_code"),
    )
    op.create_index("ix_households_household_code", "households", ["household_code"])
    op.create_table(
        "distributions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("household_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("distribution_date", sa.Date(), nullable=False),
        sa.Column("assistance_type", sa.String(length=100), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["household_id"], ["households.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("distributions")
    op.drop_index("ix_households_household_code", table_name="households")
    op.drop_table("households")
    op.drop_table("donations_received")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
