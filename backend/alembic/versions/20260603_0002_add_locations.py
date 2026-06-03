"""add donor and household locations

Revision ID: 20260603_0002
Revises: 20260602_0001
Create Date: 2026-06-03
"""

from alembic import op
import sqlalchemy as sa


revision = "20260603_0002"
down_revision = "20260602_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("donations_received", sa.Column("donor_country", sa.String(length=100), nullable=True))
    op.add_column("households", sa.Column("location", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("households", "location")
    op.drop_column("donations_received", "donor_country")
