from __future__ import annotations

from app.core.config import Settings
from app.demo.catalog import DEMO_TOKENS


def resolve_demo_token(settings: Settings, token: str):
    if not settings.demo_mode:
        return None

    demo_token = DEMO_TOKENS.get(token)
    if demo_token is None:
        return None

    from app.core.security import TokenSubject

    return TokenSubject(
        subject=demo_token.subject,
        email=demo_token.email,
        full_name=demo_token.full_name,
        avatar_url=None,
        raw_claims={
            "sub": demo_token.subject,
            "email": demo_token.email,
            "demo_mode": True,
        },
    )
