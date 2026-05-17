"""public parent child requests and school registration requests

Revision ID: 20260518_0003
Revises: 20260517_0002
Create Date: 2026-05-18 00:00:00
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20260518_0003"
down_revision = "20260517_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "school_registration_requests",
        sa.Column("requester_supabase_user_id", sa.String(length=255), nullable=False),
        sa.Column("requester_email", sa.String(length=255), nullable=False),
        sa.Column("school_name", sa.String(length=255), nullable=False),
        sa.Column("school_code", sa.String(length=64), nullable=True),
        sa.Column("city", sa.String(length=128), nullable=True),
        sa.Column("state", sa.String(length=128), nullable=True),
        sa.Column("country", sa.String(length=128), nullable=True),
        sa.Column("contact_email", sa.String(length=255), nullable=False),
        sa.Column("contact_person_name", sa.String(length=255), nullable=False),
        sa.Column("contact_phone", sa.String(length=64), nullable=True),
        sa.Column("message", sa.String(length=1024), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="pending_review"),
        sa.Column("review_reason", sa.String(length=512), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_school_registration_requests")),
    )
    op.create_index(
        op.f("ix_school_registration_requests_requester_supabase_user_id"),
        "school_registration_requests",
        ["requester_supabase_user_id"],
        unique=False,
    )

    op.create_table(
        "parent_child_access_requests",
        sa.Column("parent_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("school_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("approved_student_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("child_name", sa.String(length=255), nullable=False),
        sa.Column("child_email", sa.String(length=255), nullable=True),
        sa.Column("child_class", sa.String(length=64), nullable=True),
        sa.Column("child_section", sa.String(length=64), nullable=True),
        sa.Column("relationship_type", sa.String(length=32), nullable=False),
        sa.Column("message", sa.String(length=1024), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="pending_approval"),
        sa.Column("rejection_reason", sa.String(length=512), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["approved_student_id"], ["user_profiles.id"], name=op.f("fk_parent_child_access_requests_approved_student_id_user_profiles")),
        sa.ForeignKeyConstraint(["parent_id"], ["user_profiles.id"], name=op.f("fk_parent_child_access_requests_parent_id_user_profiles")),
        sa.ForeignKeyConstraint(["school_id"], ["schools.id"], name=op.f("fk_parent_child_access_requests_school_id_schools")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_parent_child_access_requests")),
    )


def downgrade() -> None:
    op.drop_table("parent_child_access_requests")
    op.drop_index(op.f("ix_school_registration_requests_requester_supabase_user_id"), table_name="school_registration_requests")
    op.drop_table("school_registration_requests")
