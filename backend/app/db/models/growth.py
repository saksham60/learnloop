from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import Enum as SQLEnum, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import GrowthActivityStatus
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class GrowthActivity(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "growth_activities"

    school_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("schools.id"), nullable=True)
    student_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("user_profiles.id"), nullable=False)
    activity_type: Mapped[str] = mapped_column(String(64), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[GrowthActivityStatus] = mapped_column(
        SQLEnum(GrowthActivityStatus, name="growth_activity_status_enum"),
        nullable=False,
        default=GrowthActivityStatus.SUGGESTED,
    )
    scheduled_for: Mapped[datetime | None] = mapped_column(nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(nullable=True)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    metadata_json: Mapped[dict[str, Any]] = mapped_column("metadata", nullable=False, default=dict)

    student = relationship("UserProfile", back_populates="growth_activities")

