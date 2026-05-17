from __future__ import annotations

from datetime import datetime, timezone


def utcnow_naive() -> datetime:
    """Return UTC time without tzinfo for compatibility with current DB timestamp columns."""
    return datetime.now(timezone.utc).replace(tzinfo=None)
