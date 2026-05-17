from __future__ import annotations

from functools import lru_cache
from typing import Annotated, Any

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(default="AI Student Companion API", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    app_debug: bool = Field(default=False, alias="APP_DEBUG")
    demo_mode: bool = Field(default=False, alias="DEMO_MODE")
    app_host: str = Field(default="0.0.0.0", alias="APP_HOST")
    app_port: int = Field(default=8000, alias="APP_PORT")
    frontend_url: str = Field(default="http://localhost:3000", alias="FRONTEND_URL")
    cors_allowed_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:3000"],
        alias="CORS_ALLOWED_ORIGINS",
    )

    supabase_url: str = Field(default="https://example.supabase.co", alias="SUPABASE_URL")
    supabase_anon_key: str = Field(default="anon-key", alias="SUPABASE_ANON_KEY")
    supabase_service_role_key: str = Field(
        default="service-role-key",
        alias="SUPABASE_SERVICE_ROLE_KEY",
    )
    database_url: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/student_companion",
        alias="DATABASE_URL",
    )
    supabase_jwt_secret: str | None = Field(default=None, alias="SUPABASE_JWT_SECRET")
    supabase_storage_bucket_teacher_content: str = Field(
        default="teacher-content",
        alias="SUPABASE_STORAGE_BUCKET_TEACHER_CONTENT",
    )
    supabase_storage_bucket_student_submissions: str = Field(
        default="student-submissions",
        alias="SUPABASE_STORAGE_BUCKET_STUDENT_SUBMISSIONS",
    )

    llm_provider: str = Field(default="gemma", alias="LLM_PROVIDER")
    llm_allowed_providers: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["gemma"],
        alias="LLM_ALLOWED_PROVIDERS",
    )
    gemma_api_base_url: str = Field(default="https://example-gateway.local/v1", alias="GEMMA_API_BASE_URL")
    gemma_api_key: str = Field(default="gemma-dev-key", alias="GEMMA_API_KEY")
    gemma_model: str = Field(default="gemma-4", alias="GEMMA_MODEL")
    gemma_temperature: float = Field(default=0.4, alias="GEMMA_TEMPERATURE")
    gemma_max_tokens: int = Field(default=1024, alias="GEMMA_MAX_TOKENS")
    gemma_timeout_seconds: int = Field(default=60, alias="GEMMA_TIMEOUT_SECONDS")

    direct_answer_allowed_by_default: bool = Field(
        default=False,
        alias="DIRECT_ANSWER_ALLOWED_BY_DEFAULT",
    )
    max_hints_per_question: int = Field(default=3, alias="MAX_HINTS_PER_QUESTION")
    explain_after_attempts: int = Field(default=2, alias="EXPLAIN_AFTER_ATTEMPTS")
    socratic_mode_default: bool = Field(default=True, alias="SOCRATIC_MODE_DEFAULT")
    vector_store: str = Field(default="pgvector", alias="VECTOR_STORE")
    vector_table: str = Field(default="content_chunks", alias="VECTOR_TABLE")
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    queue_provider: str = Field(default="none", alias="QUEUE_PROVIDER")
    agent_runtime_enabled: bool = Field(default=True, alias="AGENT_RUNTIME_ENABLED")
    agent_trace_enabled: bool = Field(default=True, alias="AGENT_TRACE_ENABLED")
    rule_engine_enabled: bool = Field(default=True, alias="RULE_ENGINE_ENABLED")
    focus_engine_enabled: bool = Field(default=True, alias="FOCUS_ENGINE_ENABLED")
    homework_attempt_first: bool = Field(default=True, alias="HOMEWORK_ATTEMPT_FIRST")
    anti_answer_dump_enabled: bool = Field(default=True, alias="ANTI_ANSWER_DUMP_ENABLED")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    sentry_dsn: str | None = Field(default=None, alias="SENTRY_DSN")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("cors_allowed_origins", "llm_allowed_providers", mode="before")
    @classmethod
    def split_csv(cls, value: Any) -> Any:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @field_validator("llm_provider")
    @classmethod
    def validate_provider(cls, value: str) -> str:
        if value != "gemma":
            raise ValueError("Only the gemma provider is allowed.")
        return value

    @field_validator("llm_allowed_providers")
    @classmethod
    def validate_allowed_providers(cls, value: list[str]) -> list[str]:
        normalized = [item.strip().lower() for item in value if item.strip()]
        if normalized != ["gemma"]:
            raise ValueError("LLM_ALLOWED_PROVIDERS must only contain gemma.")
        return normalized

    @field_validator("gemma_model")
    @classmethod
    def validate_gemma_model(cls, value: str) -> str:
        if not value.startswith("gemma-4"):
            raise ValueError("Only Gemma 4 models are allowed.")
        return value

    @model_validator(mode="after")
    def ensure_frontend_origin_in_cors(self) -> "Settings":
        origins = [origin.strip() for origin in self.cors_allowed_origins if origin.strip()]
        frontend_origin = self.frontend_url.strip().rstrip("/")
        if frontend_origin and frontend_origin not in origins:
            origins.append(frontend_origin)
        self.cors_allowed_origins = origins
        return self

    @property
    def database_url_sync(self) -> str:
        return (
            self.database_url.replace("+asyncpg", "")
            .replace("+psycopg", "")
            .replace("+psycopg2", "")
        )

    @property
    def database_url_async(self) -> str:
        if self.database_url.startswith("postgresql+asyncpg://"):
            return self.database_url
        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self.database_url

    @property
    def supabase_issuer(self) -> str:
        return f"{self.supabase_url.rstrip('/')}/auth/v1"

    @property
    def supabase_jwks_url(self) -> str:
        return f"{self.supabase_issuer}/.well-known/jwks.json"

    @property
    def supabase_user_url(self) -> str:
        return f"{self.supabase_issuer}/user"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
