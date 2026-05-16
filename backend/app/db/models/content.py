from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import Enum as SQLEnum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import ContentProcessingStatus
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.db.vector import VectorType


class ContentUpload(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "content_uploads"

    school_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("schools.id"), nullable=True)
    uploaded_by: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("user_profiles.id"), nullable=True)
    subject_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("subjects.id"), nullable=True)
    class_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("classes.id"), nullable=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(512), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(128), nullable=False)
    status: Mapped[ContentProcessingStatus] = mapped_column(
        SQLEnum(ContentProcessingStatus, name="content_processing_status_enum"),
        nullable=False,
        default=ContentProcessingStatus.UPLOADED,
    )
    metadata_json: Mapped[dict[str, Any]] = mapped_column("metadata", nullable=False, default=dict)

    uploaded_by_user = relationship("UserProfile", back_populates="content_uploads")
    classroom = relationship("ClassRoom", back_populates="content_uploads")
    chunks = relationship("ContentChunk", back_populates="content_upload", cascade="all, delete-orphan")


class ContentChunk(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "content_chunks"

    content_upload_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("content_uploads.id"),
        nullable=False,
    )
    topic_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("topics.id"), nullable=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_json: Mapped[dict[str, Any]] = mapped_column("metadata", nullable=False, default=dict)
    embedding = mapped_column(VectorType(dimensions=1536), nullable=True)

    content_upload = relationship("ContentUpload", back_populates="chunks")
    topic = relationship("Topic", back_populates="content_chunks")

