from __future__ import annotations

from typing import Any

from sqlalchemy import Enum as SQLEnum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import SchoolStatus
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class School(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "schools"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    code: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True)
    city: Mapped[str | None] = mapped_column(String(128), nullable=True)
    state: Mapped[str | None] = mapped_column(String(128), nullable=True)
    country: Mapped[str | None] = mapped_column(String(128), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[SchoolStatus] = mapped_column(
        SQLEnum(SchoolStatus, name="school_status_enum"),
        nullable=False,
        default=SchoolStatus.ACTIVE,
    )
    metadata_json: Mapped[dict[str, Any]] = mapped_column("metadata", nullable=False, default=dict)

    users = relationship("UserProfile", back_populates="school")
    subjects = relationship("Subject", back_populates="school")
    classes = relationship("ClassRoom", back_populates="school")
