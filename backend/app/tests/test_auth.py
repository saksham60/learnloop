from __future__ import annotations

from types import SimpleNamespace

import pytest

from app.core.constants import Role
from app.core.exceptions import AuthorizationError
from app.features.auth.permissions import ensure_not_pending


def test_pending_users_are_blocked() -> None:
    user = SimpleNamespace(role=Role.PENDING)
    with pytest.raises(AuthorizationError):
        ensure_not_pending(user)

