from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import httpx
import jwt
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError, PyJWKClient, PyJWKClientConnectionError, PyJWKClientError

from app.core.config import Settings
from app.core.exceptions import AuthenticationError


bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(slots=True)
class TokenSubject:
    subject: str
    email: str | None
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
        except PyJWKClientConnectionError as exc:
            raise AuthenticationError("Unable to verify Supabase bearer token right now.") from exc
        except (InvalidTokenError, PyJWKClientError) as exc:
            raise AuthenticationError("Invalid Supabase bearer token.") from exc

        subject = claims.get("sub")
        if not subject:
            raise AuthenticationError("Bearer token does not contain a subject.")

        return TokenSubject(
            subject=subject,
            email=claims.get("email"),
            raw_claims=claims,
        )

    def _get_algorithm(self, token: str) -> str:
        algorithm = jwt.get_unverified_header(token).get("alg")
        if not isinstance(algorithm, str) or not algorithm:
            raise AuthenticationError("Bearer token is missing an algorithm header.")
        return algorithm

    def _decode_with_shared_secret(self, token: str) -> dict[str, Any]:
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

    def extract_subject(self, credentials: HTTPAuthorizationCredentials | None) -> TokenSubject:
        if credentials is None or not credentials.credentials:
            raise AuthenticationError("Missing bearer token.")
        return self.decode_token(credentials.credentials)
