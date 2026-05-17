from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import Enum as SQLEnum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import ApprovalStatus, Role
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class UserProfile(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "user_profiles"

    supabase_user_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[Role] = mapped_column(SQLEnum(Role, name="role_enum"), nullable=False, default=Role.PENDING)
    approval_status: Mapped[ApprovalStatus] = mapped_column(
        SQLEnum(ApprovalStatus, name="approval_status_enum"),
        nullable=False,
        default=ApprovalStatus.ACTIVE,
    )
    school_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("schools.id"), nullable=True)
    grade_level: Mapped[str | None] = mapped_column(String(32), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    approval_reason: Mapped[str | None] = mapped_column(String(512), nullable=True)
    approval_metadata: Mapped[dict[str, Any]] = mapped_column(nullable=False, default=dict)
    preferences: Mapped[dict[str, Any]] = mapped_column(nullable=False, default=dict)

    school = relationship("School", back_populates="users")
    teaching_classes = relationship("ClassRoom", back_populates="teacher")
    class_memberships = relationship("ClassStudent", back_populates="student")
    homework_attempts = relationship("StudentAttempt", back_populates="student")
    learning_sessions = relationship("LearningSession", back_populates="student")
    learning_events = relationship("LearningEvent", back_populates="student")
    focus_areas = relationship("FocusArea", back_populates="student")
    content_uploads = relationship("ContentUpload", back_populates="uploaded_by_user")
    growth_activities = relationship("GrowthActivity", back_populates="student")
    agent_runs = relationship("AgentRun", back_populates="user")
    teacher_student_links = relationship(
        "TeacherStudentRelation",
        foreign_keys="TeacherStudentRelation.teacher_id",
        back_populates="teacher",
    )
    student_teacher_links = relationship(
        "TeacherStudentRelation",
        foreign_keys="TeacherStudentRelation.student_id",
        back_populates="student",
    )
    parent_links = relationship(
        "ParentStudentRelation",
        foreign_keys="ParentStudentRelation.parent_id",
        back_populates="parent",
    )
    student_parent_links = relationship(
        "ParentStudentRelation",
        foreign_keys="ParentStudentRelation.student_id",
        back_populates="student",
    )
