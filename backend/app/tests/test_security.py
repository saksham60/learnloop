from __future__ import annotations

from types import SimpleNamespace

import jwt
import pytest
from jwt import PyJWKClientConnectionError

from app.core.config import get_settings
from app.core.exceptions import AuthenticationError
from app.core.security import JWTValidator, TokenSubject


def test_hs256_supabase_token_is_accepted() -> None:
    settings = get_settings()
    validator = JWTValidator(settings)

    token = jwt.encode(
        {
            "sub": "student-123",
            "email": "student@example.com",
            "iss": settings.supabase_issuer,
        },
        settings.supabase_jwt_secret,
        algorithm="HS256",
    )

    subject = validator.decode_token(token)

    assert subject.subject == "student-123"
    assert subject.email == "student@example.com"


def test_asymmetric_supabase_token_uses_jwks(monkeypatch: pytest.MonkeyPatch) -> None:
    settings = get_settings()
    validator = JWTValidator(settings)

    monkeypatch.setattr(jwt, "get_unverified_header", lambda token: {"alg": "ES256", "kid": "kid-1"})
    validator._jwks_client = SimpleNamespace(  # type: ignore[assignment]
        get_signing_key_from_jwt=lambda token: SimpleNamespace(key="public-key"),
    )

    decode_calls: list[tuple[object, list[str], str | None]] = []

    def fake_decode(
        token: str,
        key: object,
        *,
        algorithms: list[str],
        issuer: str,
        options: dict[str, object],
    ) -> dict[str, str]:
        decode_calls.append((key, algorithms, issuer))
        assert options == {"verify_aud": False}
        return {
            "sub": "student-456",
            "email": "student2@example.com",
            "iss": issuer,
        }

    monkeypatch.setattr(jwt, "decode", fake_decode)

    subject = validator.decode_token("asymmetric-token")

    assert subject.subject == "student-456"
    assert subject.email == "student2@example.com"
    assert decode_calls == [("public-key", ["ES256"], settings.supabase_issuer)]


def test_jwks_connection_error_falls_back_to_supabase_user_lookup(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    settings = get_settings()
    validator = JWTValidator(settings)

    monkeypatch.setattr(jwt, "get_unverified_header", lambda token: {"alg": "ES256", "kid": "kid-1"})
    validator._jwks_client = SimpleNamespace(  # type: ignore[assignment]
        get_signing_key_from_jwt=lambda token: (_ for _ in ()).throw(
            PyJWKClientConnectionError("jwks unavailable"),
        ),
    )
    monkeypatch.setattr(
        validator,
        "_decode_with_supabase_user_lookup",
        lambda token: TokenSubject(
            subject="student-789",
            email="student3@example.com",
            full_name="Student Three",
            avatar_url=None,
            raw_claims={"id": "student-789"},
        ),
    )

    subject = validator.decode_token("asymmetric-token")

    assert subject.subject == "student-789"
    assert subject.email == "student3@example.com"


def test_remote_lookup_failure_is_reported_as_authentication_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    settings = get_settings()
    validator = JWTValidator(settings)

    monkeypatch.setattr(jwt, "get_unverified_header", lambda token: {"alg": "ES256", "kid": "kid-1"})
    validator._jwks_client = SimpleNamespace(  # type: ignore[assignment]
        get_signing_key_from_jwt=lambda token: (_ for _ in ()).throw(
            PyJWKClientConnectionError("jwks unavailable"),
        ),
    )
    monkeypatch.setattr(
        validator,
        "_decode_with_supabase_user_lookup",
        lambda token: (_ for _ in ()).throw(
            AuthenticationError("Unable to verify Supabase bearer token right now."),
        ),
    )

    with pytest.raises(AuthenticationError, match="Unable to verify Supabase bearer token right now."):
        validator.decode_token("asymmetric-token")
