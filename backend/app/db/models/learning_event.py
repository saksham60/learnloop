from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import EventType, SyncStatus
from app.db.base import Base, UUIDPrimaryKeyMixin


class LearningEvent(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "learning_events"

    school_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("schools.id"), nullable=True)
    student_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("user_profiles.id"), nullable=False)
    session_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("learning_sessions.id"),
        nullable=True,
    )
    event_type: Mapped[EventType] = mapped_column(SQLEnum(EventType, name="event_type_enum"), nullable=False)
    subject_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("subjects.id"), nullable=True)
    topic_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("topics.id"), nullable=True)
    homework_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("homework.id"), nullable=True)
    payload: Mapped[dict[str, Any]] = mapped_column(nullable=False, default=dict)
    device_id: Mapped[str | None] = mapped_column(nullable=True)
    sync_status: Mapped[SyncStatus] = mapped_column(
        SQLEnum(SyncStatus, name="sync_status_enum"),
        nullable=False,
        default=SyncStatus.SYNCED,
    )
    created_at: Mapped[datetime] = mapped_column(nullable=False)

    student = relationship("UserProfile", back_populates="learning_events")
    session = relationship("LearningSession", back_populates="learning_events")
    topic = relationship("Topic", back_populates="learning_events")
    homework = relationship("Homework", back_populates="learning_events")

