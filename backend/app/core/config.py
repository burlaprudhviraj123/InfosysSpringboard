import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey_textile_waste_intelligence_platform_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    PROJECT_NAME: str = "AI Textile Waste Intelligence Platform"
    GOOGLE_CLIENT_ID: str | None = os.getenv("GOOGLE_CLIENT_ID", None)

    # SMTP Configuration (Loaded from environment variables)
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")

    # Database configuration (Defaults to SQLite for local development, overridden by Docker environment)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./textile_waste.db")

    class Config:
        case_sensitive = True
        extra = "ignore"
        env_file = [
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
            ".env"
        ]

settings = Settings()
