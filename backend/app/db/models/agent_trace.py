from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import Enum as SQLEnum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import AgentRunStatus, Role, SyncStatus
from app.db.base import Base, UUIDPrimaryKeyMixin


class AgentRun(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "agent_runs"

    user_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("user_profiles.id"), nullable=True)
    role: Mapped[Role | None] = mapped_column(SQLEnum(Role, name="agent_role_enum"), nullable=True)
    session_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), nullable=True)
    request_type: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[AgentRunStatus] = mapped_column(
        SQLEnum(AgentRunStatus, name="agent_run_status_enum"),
        nullable=False,
        default=AgentRunStatus.PENDING,
    )
    final_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict[str, Any]] = mapped_column("metadata", nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(nullable=True)

    user = relationship("UserProfile", back_populates="agent_runs")
    steps = relationship("AgentStep", back_populates="agent_run", cascade="all, delete-orphan")
    tool_calls = relationship("AgentToolCall", back_populates="agent_run", cascade="all, delete-orphan")


class AgentStep(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "agent_steps"

    agent_run_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("agent_runs.id"), nullable=False)
    step_name: Mapped[str] = mapped_column(String(64), nullable=False)
    agent_name: Mapped[str] = mapped_column(String(128), nullable=False)
    input_json: Mapped[dict[str, Any]] = mapped_column("input", nullable=False, default=dict)
    output_json: Mapped[dict[str, Any]] = mapped_column("output", nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(nullable=False)

    agent_run = relationship("AgentRun", back_populates="steps")


class AgentToolCall(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "agent_tool_calls"

    agent_run_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("agent_runs.id"), nullable=False)
    tool_name: Mapped[str] = mapped_column(String(128), nullable=False)
    input_json: Mapped[dict[str, Any]] = mapped_column("input", nullable=False, default=dict)
    output_json: Mapped[dict[str, Any]] = mapped_column("output", nullable=False, default=dict)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="completed")
    created_at: Mapped[datetime] = mapped_column(nullable=False)

    agent_run = relationship("AgentRun", back_populates="tool_calls")


class SyncEvent(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "sync_events"

    school_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("schools.id"), nullable=True)
    entity_type: Mapped[str] = mapped_column(String(64), nullable=False)
    entity_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), nullable=True)
    payload: Mapped[dict[str, Any]] = mapped_column(nullable=False, default=dict)
    device_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sync_status: Mapped[SyncStatus] = mapped_column(
        SQLEnum(SyncStatus, name="sync_event_status_enum"),
        nullable=False,
        default=SyncStatus.PENDING,
    )
    created_at: Mapped[datetime] = mapped_column(nullable=False)

