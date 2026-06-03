"""add distribution code

Revision ID: 20260603_0003
Revises: 20260603_0002
Create Date: 2026-06-03
"""

from alembic import op
import sqlalchemy as sa


revision = "20260603_0003"
down_revision = "20260603_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("distributions", sa.Column("distribution_code", sa.String(length=100), nullable=True))
    op.create_unique_constraint("uq_distributions_distribution_code", "distributions", ["distribution_code"])


def downgrade() -> None:
    op.drop_constraint("uq_distributions_distribution_code", "distributions", type_="unique")
    op.drop_column("distributions", "distribution_code")
