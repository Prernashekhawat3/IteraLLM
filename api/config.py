from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database
    database_url: str
    redis_url: str = "redis://localhost:6379/0"

    # Kafka
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_feedback_topic: str = "feedback-events"
    kafka_chat_events_topic: str = "chat-events"

    # LLM
    llm_provider: str = "openai"
    llm_api_key: str
    default_model: str = "gpt-4o-mini"

    # Add to Settings class in api/config.py
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    xai_api_key: str = ""
    google_api_key: str = ""
    groq_api_key: str = ""

    # App
    app_env: str = "development"
    app_port: int = 8000
    log_level: str = "INFO"
    max_history_turns: int = 20
    session_ttl_seconds: int = 3600

    # Observability
    enable_metrics: bool = True
    metrics_port: int = 9090

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache
def get_settings() -> Settings:
    return Settings()

# Usage anywhere in the codebase:
# from api.config import get_settings
# settings = get_settings()