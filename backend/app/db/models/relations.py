from __future__ import annotations

from uuid import UUID

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class TeacherStudentRelation(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "teacher_student_relations"

    school_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("schools.id"), nullable=False)
    teacher_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("user_profiles.id"), nullable=False)
    student_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("user_profiles.id"), nullable=False)
    class_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("classes.id"), nullable=True)
    subject_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("subjects.id"), nullable=True)

    teacher = relationship("UserProfile", foreign_keys=[teacher_id], back_populates="teacher_student_links")
    student = relationship("UserProfile", foreign_keys=[student_id], back_populates="student_teacher_links")
    school = relationship("School")
    classroom = relationship("ClassRoom")
    subject = relationship("Subject")


class ParentStudentRelation(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "parent_student_relations"

    school_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("schools.id"), nullable=False)
    parent_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("user_profiles.id"), nullable=False)
    student_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("user_profiles.id"), nullable=False)
    relationship_type: Mapped[str | None] = mapped_column(String(64), nullable=True)

    parent = relationship("UserProfile", foreign_keys=[parent_id], back_populates="parent_links")
    student = relationship("UserProfile", foreign_keys=[student_id], back_populates="student_parent_links")
    school = relationship("School")
