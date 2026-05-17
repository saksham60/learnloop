from __future__ import annotations

from uuid import UUID

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class SchoolRegistrationRequest(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "school_registration_requests"

    requester_supabase_user_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    requester_email: Mapped[str] = mapped_column(String(255), nullable=False)
    school_name: Mapped[str] = mapped_column(String(255), nullable=False)
    school_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    city: Mapped[str | None] = mapped_column(String(128), nullable=True)
    state: Mapped[str | None] = mapped_column(String(128), nullable=True)
    country: Mapped[str | None] = mapped_column(String(128), nullable=True)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_person_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_phone: Mapped[str | None] = mapped_column(String(64), nullable=True)
    message: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="pending_review")
    review_reason: Mapped[str | None] = mapped_column(String(512), nullable=True)


class ParentChildAccessRequest(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "parent_child_access_requests"

    parent_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("user_profiles.id"), nullable=False)
    school_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("schools.id"), nullable=False)
    approved_student_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("user_profiles.id"),
        nullable=True,
    )
    child_name: Mapped[str] = mapped_column(String(255), nullable=False)
    child_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    child_class: Mapped[str | None] = mapped_column(String(64), nullable=True)
    child_section: Mapped[str | None] = mapped_column(String(64), nullable=True)
    relationship_type: Mapped[str] = mapped_column(String(32), nullable=False)
    message: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="pending_approval")
    rejection_reason: Mapped[str | None] = mapped_column(String(512), nullable=True)

    parent = relationship("UserProfile", foreign_keys=[parent_id])
    approved_student = relationship("UserProfile", foreign_keys=[approved_student_id])
    school = relationship("School")
