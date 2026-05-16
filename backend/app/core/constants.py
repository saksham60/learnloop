from __future__ import annotations

from enum import Enum


class Role(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    SCHOOL_ADMIN = "school_admin"
    PARENT = "parent"
    PLATFORM_ADMIN = "platform_admin"
    PENDING = "pending"


class EventType(str, Enum):
    CHAT_MESSAGE = "chat_message"
    ATTEMPT_SUBMITTED = "attempt_submitted"
    HINT_REQUESTED = "hint_requested"
    EXPLANATION_REVEALED = "explanation_revealed"
    HOMEWORK_CREATED = "homework_created"
    HOMEWORK_SUBMITTED = "homework_submitted"
    FOCUS_REFRESHED = "focus_refreshed"
    PROGRESS_ASKED = "progress_asked"
    CONTENT_UPLOADED = "content_uploaded"
    CONTENT_PROCESSED = "content_processed"
    GROWTH_ACTIVITY_COMPLETED = "growth_activity_completed"
    AGENT_REFLECTION = "agent_reflection"


class AgentStage(str, Enum):
    PLAN = "PLAN"
    ACT = "ACT"
    OBSERVE = "OBSERVE"
    REFLECT = "REFLECT"
    UPDATE_EVENTS = "UPDATE_EVENTS"
    NEXT_STEP = "NEXT_STEP"


class AgentRunStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class HomeworkStatus(str, Enum):
    DRAFT = "draft"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    GRADED = "graded"


class LearningSessionState(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"


class FocusAreaStatus(str, Enum):
    ACTIVE = "active"
    RESOLVED = "resolved"
    SNOOZED = "snoozed"


class GrowthActivityStatus(str, Enum):
    SUGGESTED = "suggested"
    COMPLETED = "completed"
    MISSED = "missed"


class SyncStatus(str, Enum):
    PENDING = "pending"
    SYNCED = "synced"
    FAILED = "failed"
    CONFLICT = "conflict"


class ContentProcessingStatus(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class RequestType(str, Enum):
    LEARNING_CHAT = "learning_chat"
    HOMEWORK_HELP = "homework_help"
    PROGRESS_QUESTION = "progress_question"
    FOCUS_REFRESH = "focus_refresh"
    CONTENT_PROCESS = "content_process"
    TEACHER_INSIGHT = "teacher_insight"
    GROWTH_ACTIVITY = "growth_activity"

