from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # LLM
    openrouter_api_key: str = ""
    llm_model: str = "openai/gpt-oss-120b:free"

    # CORS - one URL, or several separated by commas
    frontend_url: str = "http://localhost:5173"

    # Research logs (Supabase). Leave empty to save JSON files in backend/logs/ instead.
    supabase_url: str = ""
    supabase_key: str = ""

    # Code execution
    code_execution_timeout: int = 10  # seconds
    # Off by default: /api/run executes arbitrary Python on the server.
    # The current frontend does not use it. Set CODE_EXECUTION_ENABLED=true only for local testing.
    code_execution_enabled: bool = False

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
