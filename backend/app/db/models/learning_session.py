from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import Enum as SQLEnum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import LearningSessionState
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class LearningSession(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "learning_sessions"

    school_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("schools.id"), nullable=True)
    student_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("user_profiles.id"), nullable=False)
    session_type: Mapped[str] = mapped_column(String(64), nullable=False, default="learning")
    state: Mapped[LearningSessionState] = mapped_column(
        SQLEnum(LearningSessionState, name="learning_session_state_enum"),
        nullable=False,
        default=LearningSessionState.ACTIVE,
    )
    metadata_json: Mapped[dict[str, Any]] = mapped_column("metadata", nullable=False, default=dict)
    started_at: Mapped[datetime] = mapped_column(nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(nullable=True)

    student = relationship("UserProfile", back_populates="learning_sessions")
    learning_events = relationship("LearningEvent", back_populates="session")

