"""Application configuration loaded from environment variables."""

from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Settings read from .env / environment."""

    database_url: str = (
        "postgresql://finance_user:dev_password_change_in_prod@localhost:5432/finance_planner"
    )
    environment: str = "development"
    api_cors_origins: str = "http://localhost:5173,http://localhost:3000"
    timezone: str = "Asia/Kolkata"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.api_cors_origins.split(",") if o.strip()]


settings = Settings()
