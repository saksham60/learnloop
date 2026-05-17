"""role onboarding and admin management

Revision ID: 20260517_0002
Revises: 20260516_0001
Create Date: 2026-05-17 00:00:00
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20260517_0002"
down_revision = "20260516_0001"
branch_labels = None
depends_on = None


approval_status_enum = sa.Enum(
    "ACTIVE",
    "PENDING_APPROVAL",
    "REJECTED",
    "SUSPENDED",
    name="approval_status_enum",
)
school_status_enum = sa.Enum("ACTIVE", "INACTIVE", name="school_status_enum")


def upgrade() -> None:
    bind = op.get_bind()
    approval_status_enum.create(bind, checkfirst=True)
    school_status_enum.create(bind, checkfirst=True)

    op.add_column(
        "user_profiles",
        sa.Column("approval_status", approval_status_enum, nullable=False, server_default="ACTIVE"),
    )
    op.add_column("user_profiles", sa.Column("approval_reason", sa.String(length=512), nullable=True))
    op.add_column(
        "user_profiles",
        sa.Column(
            "approval_metadata",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
    )

    op.add_column("schools", sa.Column("code", sa.String(length=64), nullable=True))
    op.add_column("schools", sa.Column("city", sa.String(length=128), nullable=True))
    op.add_column("schools", sa.Column("state", sa.String(length=128), nullable=True))
    op.add_column("schools", sa.Column("country", sa.String(length=128), nullable=True))
    op.add_column("schools", sa.Column("contact_email", sa.String(length=255), nullable=True))
    op.add_column(
        "schools",
        sa.Column("status", school_status_enum, nullable=False, server_default="ACTIVE"),
    )
    op.create_unique_constraint("uq_schools_code", "schools", ["code"])

    op.create_table(
        "teacher_student_relations",
        sa.Column("school_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("teacher_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("class_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("subject_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["class_id"], ["classes.id"], name=op.f("fk_teacher_student_relations_class_id_classes")),
        sa.ForeignKeyConstraint(["school_id"], ["schools.id"], name=op.f("fk_teacher_student_relations_school_id_schools")),
        sa.ForeignKeyConstraint(["student_id"], ["user_profiles.id"], name=op.f("fk_teacher_student_relations_student_id_user_profiles")),
        sa.ForeignKeyConstraint(["subject_id"], ["subjects.id"], name=op.f("fk_teacher_student_relations_subject_id_subjects")),
        sa.ForeignKeyConstraint(["teacher_id"], ["user_profiles.id"], name=op.f("fk_teacher_student_relations_teacher_id_user_profiles")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_teacher_student_relations")),
    )

    op.create_table(
        "parent_student_relations",
        sa.Column("school_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("parent_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("relationship_type", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["parent_id"], ["user_profiles.id"], name=op.f("fk_parent_student_relations_parent_id_user_profiles")),
        sa.ForeignKeyConstraint(["school_id"], ["schools.id"], name=op.f("fk_parent_student_relations_school_id_schools")),
        sa.ForeignKeyConstraint(["student_id"], ["user_profiles.id"], name=op.f("fk_parent_student_relations_student_id_user_profiles")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_parent_student_relations")),
    )


def downgrade() -> None:
    op.drop_table("parent_student_relations")
    op.drop_table("teacher_student_relations")
    op.drop_constraint("uq_schools_code", "schools", type_="unique")
    op.drop_column("schools", "status")
    op.drop_column("schools", "contact_email")
    op.drop_column("schools", "country")
    op.drop_column("schools", "state")
    op.drop_column("schools", "city")
    op.drop_column("schools", "code")
    op.drop_column("user_profiles", "approval_metadata")
    op.drop_column("user_profiles", "approval_reason")
    op.drop_column("user_profiles", "approval_status")

    bind = op.get_bind()
    school_status_enum.drop(bind, checkfirst=True)
    approval_status_enum.drop(bind, checkfirst=True)
