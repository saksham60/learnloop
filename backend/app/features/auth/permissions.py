from __future__ import annotations

from app.api.dependencies import CurrentUser
from app.core.constants import ApprovalStatus, Role
from app.core.exceptions import AuthorizationError


def ensure_not_pending(user: CurrentUser) -> None:
    if user.role is None or user.role == Role.PENDING:
        raise AuthorizationError("Pending users cannot access this resource.")


def ensure_active_approval(user: CurrentUser) -> None:
    if user.approval_status != ApprovalStatus.ACTIVE:
        raise AuthorizationError("This account is not active for application access yet.")


def ensure_role(user: CurrentUser, *allowed_roles: Role) -> None:
    ensure_not_pending(user)
    ensure_active_approval(user)
    if user.role not in allowed_roles:
        raise AuthorizationError("User role is not allowed to access this resource.")
