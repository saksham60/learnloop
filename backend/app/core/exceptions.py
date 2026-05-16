from __future__ import annotations

from http import HTTPStatus
from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    status_code = HTTPStatus.BAD_REQUEST
    error_code = "application_error"

    def __init__(self, detail: str, meta: dict[str, Any] | None = None) -> None:
        self.detail = detail
        self.meta = meta or {}
        super().__init__(detail)


class AuthorizationError(AppException):
    status_code = HTTPStatus.FORBIDDEN
    error_code = "authorization_error"


class AuthenticationError(AppException):
    status_code = HTTPStatus.UNAUTHORIZED
    error_code = "authentication_error"


class NotFoundError(AppException):
    status_code = HTTPStatus.NOT_FOUND
    error_code = "not_found"


class RuleViolationError(AppException):
    status_code = HTTPStatus.UNPROCESSABLE_ENTITY
    error_code = "rule_violation"


def build_error_response(exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=int(exc.status_code),
        content={
            "error": {
                "code": exc.error_code,
                "detail": exc.detail,
                "meta": exc.meta,
            }
        },
    )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(_: Request, exc: AppException) -> JSONResponse:
        return build_error_response(exc)

    @app.exception_handler(Exception)
    async def unexpected_exception_handler(_: Request, exc: Exception) -> JSONResponse:
        unexpected = AppException(detail=str(exc), meta={"type": exc.__class__.__name__})
        unexpected.status_code = HTTPStatus.INTERNAL_SERVER_ERROR
        unexpected.error_code = "internal_server_error"
        return build_error_response(unexpected)

