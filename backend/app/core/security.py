from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import jwt
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError

from app.core.config import Settings
from app.core.exceptions import AuthenticationError


bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(slots=True)
class TokenSubject:
    subject: str
    email: str | None
    raw_claims: dict[str, Any]


class JWTValidator:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def decode_token(self, token: str) -> TokenSubject:
        try:
            claims = jwt.decode(
                token,
                self._settings.supabase_jwt_secret,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
        except InvalidTokenError as exc:
            raise AuthenticationError("Invalid Supabase bearer token.") from exc

        subject = claims.get("sub")
        if not subject:
            raise AuthenticationError("Bearer token does not contain a subject.")

        return TokenSubject(
            subject=subject,
            email=claims.get("email"),
            raw_claims=claims,
        )

    def extract_subject(self, credentials: HTTPAuthorizationCredentials | None) -> TokenSubject:
        if credentials is None or not credentials.credentials:
            raise AuthenticationError("Missing bearer token.")
        return self.decode_token(credentials.credentials)

