from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    env_name: str = "local"
    # On Render, set BASE_URL to your service URL, e.g.
    # https://your-service-name.onrender.com
    base_url: str = "http://localhost:8000"
    db_url: str = "sqlite:///./shortner.db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    print(f"Loading settings for: {settings.env_name}")
    return settings
