from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import httpx
import jwt
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError, PyJWKClient, PyJWKClientConnectionError, PyJWKClientError

from app.core.config import Settings
from app.core.exceptions import AuthenticationError
from app.demo.auth import resolve_demo_token


bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(slots=True)
class TokenSubject:
    subject: str
    email: str | None
    full_name: str | None
    avatar_url: str | None
    raw_claims: dict[str, Any]


class HttpxPyJWKClient(PyJWKClient):
    def fetch_data(self) -> Any:
        jwk_set: Any = None
        try:
            with httpx.Client(timeout=self.timeout, follow_redirects=True) as client:
                response = client.get(self.uri, headers=self.headers)
                response.raise_for_status()
                jwk_set = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise PyJWKClientConnectionError(
                f'Fail to fetch data from the url, err: "{exc}"',
            ) from exc
        finally:
            if self.jwk_set_cache is not None:
                self.jwk_set_cache.put(jwk_set)

        return jwk_set


class JWTValidator:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._jwks_client = HttpxPyJWKClient(
            settings.supabase_jwks_url,
            cache_keys=True,
            cache_jwk_set=True,
            lifespan=300,
            timeout=5,
        )

    def decode_token(self, token: str) -> TokenSubject:
        try:
            algorithm = self._get_algorithm(token)
            claims = (
                self._decode_with_shared_secret(token)
                if algorithm == "HS256"
                else self._decode_with_jwks(token, algorithm)
            )
        except (InvalidTokenError, PyJWKClientConnectionError, PyJWKClientError):
            return self._decode_with_supabase_user_lookup(token)

        return self._build_subject_from_claims(claims)

    def _build_subject_from_claims(self, claims: dict[str, Any]) -> TokenSubject:
        subject = claims.get("sub")
        if not subject:
            raise AuthenticationError("Bearer token does not contain a subject.")

        user_metadata = claims.get("user_metadata")
        metadata = user_metadata if isinstance(user_metadata, dict) else {}

        return TokenSubject(
            subject=subject,
            email=claims.get("email"),
            full_name=metadata.get("full_name") or metadata.get("name") or claims.get("name"),
            avatar_url=metadata.get("avatar_url") or metadata.get("picture") or claims.get("picture"),
            raw_claims=claims,
        )

    def _build_subject_from_supabase_user(self, user: dict[str, Any]) -> TokenSubject:
        subject = user.get("id")
        if not isinstance(subject, str) or not subject:
            raise AuthenticationError("Supabase user response did not contain a subject.")

        user_metadata = user.get("user_metadata")
        metadata = user_metadata if isinstance(user_metadata, dict) else {}

        return TokenSubject(
            subject=subject,
            email=user.get("email"),
            full_name=metadata.get("full_name") or metadata.get("name"),
            avatar_url=metadata.get("avatar_url") or metadata.get("picture"),
            raw_claims=user,
        )

    def _get_algorithm(self, token: str) -> str:
        algorithm = jwt.get_unverified_header(token).get("alg")
        if not isinstance(algorithm, str) or not algorithm:
            raise AuthenticationError("Bearer token is missing an algorithm header.")
        return algorithm

    def _decode_with_shared_secret(self, token: str) -> dict[str, Any]:
        if not self._settings.supabase_jwt_secret:
            raise InvalidTokenError("SUPABASE_JWT_SECRET is not configured.")
        return jwt.decode(
            token,
            self._settings.supabase_jwt_secret,
            algorithms=["HS256"],
            issuer=self._settings.supabase_issuer,
            options={"verify_aud": False},
        )

    def _decode_with_jwks(self, token: str, algorithm: str) -> dict[str, Any]:
        signing_key = self._jwks_client.get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=[algorithm],
            issuer=self._settings.supabase_issuer,
            options={"verify_aud": False},
        )

    def _decode_with_supabase_user_lookup(self, token: str) -> TokenSubject:
        headers = {
            "Authorization": f"Bearer {token}",
        }
        api_key = self._settings.supabase_service_role_key or self._settings.supabase_anon_key
        if api_key:
            headers["apikey"] = api_key

        try:
            with httpx.Client(timeout=5, follow_redirects=True) as client:
                response = client.get(self._settings.supabase_user_url, headers=headers)
                response.raise_for_status()
                payload = response.json()
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code in {401, 403}:
                raise AuthenticationError("Invalid Supabase bearer token.") from exc
            raise AuthenticationError("Unable to verify Supabase bearer token right now.") from exc
        except (httpx.HTTPError, ValueError) as exc:
            raise AuthenticationError("Unable to verify Supabase bearer token right now.") from exc

        if not isinstance(payload, dict):
            raise AuthenticationError("Supabase user verification returned an invalid payload.")

        return self._build_subject_from_supabase_user(payload)

    def extract_subject(self, credentials: HTTPAuthorizationCredentials | None) -> TokenSubject:
        if credentials is None or not credentials.credentials:
            raise AuthenticationError("Missing bearer token.")
        demo_subject = resolve_demo_token(self._settings, credentials.credentials)
        if demo_subject is not None:
            return demo_subject
        return self.decode_token(credentials.credentials)
