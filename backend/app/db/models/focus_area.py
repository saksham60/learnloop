from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import Enum as SQLEnum, ForeignKey, Float, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import FocusAreaStatus
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class FocusArea(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "focus_areas"

    school_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("schools.id"), nullable=True)
    student_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("user_profiles.id"), nullable=False)
    subject_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("subjects.id"), nullable=True)
    topic_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("topics.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    score: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    status: Mapped[FocusAreaStatus] = mapped_column(
        SQLEnum(FocusAreaStatus, name="focus_area_status_enum"),
        nullable=False,
        default=FocusAreaStatus.ACTIVE,
    )
    recommended_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    rationale: Mapped[dict[str, Any]] = mapped_column(nullable=False, default=dict)
    last_evaluated_at: Mapped[datetime | None] = mapped_column(nullable=True)

    student = relationship("UserProfile", back_populates="focus_areas")
    topic = relationship("Topic", back_populates="focus_areas")

