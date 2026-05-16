from __future__ import annotations

from uuid import UUID

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ClassRoom(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "classes"

    school_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("schools.id"), nullable=False)
    subject_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("subjects.id"), nullable=True)
    teacher_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("user_profiles.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    grade_level: Mapped[str | None] = mapped_column(String(32), nullable=True)

    school = relationship("School", back_populates="classes")
    subject = relationship("Subject", back_populates="classes")
    teacher = relationship("UserProfile", back_populates="teaching_classes")
    students = relationship("ClassStudent", back_populates="classroom")
    homework_items = relationship("Homework", back_populates="classroom")
    content_uploads = relationship("ContentUpload", back_populates="classroom")


class ClassStudent(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "class_students"

    class_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("classes.id"), nullable=False)
    student_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("user_profiles.id"), nullable=False)

    classroom = relationship("ClassRoom", back_populates="students")
    student = relationship("UserProfile", back_populates="class_memberships")

