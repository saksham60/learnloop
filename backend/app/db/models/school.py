from __future__ import annotations

from typing import Any

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class School(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "schools"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    metadata_json: Mapped[dict[str, Any]] = mapped_column("metadata", nullable=False, default=dict)

    users = relationship("UserProfile", back_populates="school")
    subjects = relationship("Subject", back_populates="school")
    classes = relationship("ClassRoom", back_populates="school")

