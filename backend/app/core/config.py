from functools import lru_cache
from typing import Annotated
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict, NoDecode


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
    database_url: str
    direct_url: str
    jwt_secret: str
    access_token_minutes: int = 15
    refresh_token_days: int = 30
    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:5173"]
    seed_admin_email: str = ""
    seed_admin_username: str = "V4YT_ADMIN"
    seed_admin_password: str = ""
    supabase_url: str = ""
    supabase_service_role_key: str = ""

    @field_validator("jwt_secret")
    @classmethod
    def validate_secret(cls, value: str) -> str:
        if len(value) < 32 or value.lower().startswith("replace"):
            raise ValueError("JWT_SECRET must be at least 32 characters and non-placeholder")
        return value

    @field_validator("database_url", "direct_url", mode="before")
    @classmethod
    def ensure_async_postgres_driver(cls, value: str) -> str:
        if isinstance(value, str) and value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+asyncpg://", 1)
        if isinstance(value, str) and value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+asyncpg://", 1)
        return value

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_origins(cls, value):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
