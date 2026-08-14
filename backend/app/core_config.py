from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://cybersecops:changeme_local_dev@localhost:5432/cybersecops"
    redis_url: str = "redis://localhost:6379/0"
    jwt_secret: str = "change-me-dev-only-not-for-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    class Config:
        env_file = ".env"


settings = Settings()
