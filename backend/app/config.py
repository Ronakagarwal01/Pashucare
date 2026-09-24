from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    cors_origins: str = "http://localhost:5173"
    database_url: str = f"sqlite:///{Path(__file__).resolve().parent.parent / 'pashucare.db'}"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
