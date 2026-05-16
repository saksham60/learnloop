from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import Boolean, Enum as SQLEnum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import HomeworkStatus
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Homework(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "homework"

    school_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("schools.id"), nullable=False)
    class_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("classes.id"), nullable=True)
    subject_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("subjects.id"), nullable=True)
    teacher_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("user_profiles.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    due_at: Mapped[datetime | None] = mapped_column(nullable=True)
    status: Mapped[HomeworkStatus] = mapped_column(
        SQLEnum(HomeworkStatus, name="homework_status_enum"),
        nullable=False,
        default=HomeworkStatus.ASSIGNED,
    )
    metadata_json: Mapped[dict[str, Any]] = mapped_column("metadata", nullable=False, default=dict)

    classroom = relationship("ClassRoom", back_populates="homework_items")
    subject = relationship("Subject", back_populates="homework_items")
    questions = relationship("HomeworkQuestion", back_populates="homework", cascade="all, delete-orphan")
    attempts = relationship("StudentAttempt", back_populates="homework")
    learning_events = relationship("LearningEvent", back_populates="homework")


class HomeworkQuestion(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "homework_questions"

    homework_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("homework.id"), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    expected_answer_key: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict[str, Any]] = mapped_column("metadata", nullable=False, default=dict)

    homework = relationship("Homework", back_populates="questions")
    attempts = relationship("StudentAttempt", back_populates="question")


class StudentAttempt(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "student_attempts"

    homework_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("homework.id"), nullable=False)
    student_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("user_profiles.id"), nullable=False)
    question_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("homework_questions.id"),
        nullable=True,
    )
    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    attempt_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    hints_used: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    score: Mapped[float | None] = mapped_column(nullable=True)
    feedback_payload: Mapped[dict[str, Any]] = mapped_column("feedback", nullable=False, default=dict)
    submitted_at: Mapped[datetime | None] = mapped_column(nullable=True)

    homework = relationship("Homework", back_populates="attempts")
    question = relationship("HomeworkQuestion", back_populates="attempts")
    student = relationship("UserProfile", back_populates="homework_attempts")

