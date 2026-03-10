from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── Cost table (USD per 1M tokens) ──────────────────────────
MODEL_COSTS: dict[str, dict[str, float]] = {
    # Anthropic
    "claude-haiku-4-5-20251001": {"input": 0.80,  "output": 4.00},
    "claude-sonnet-4-5":         {"input": 3.00,  "output": 15.00},
    # Groq (free tier)
    "groq/llama-3.3-70b-versatile": {"input": 0.0, "output": 0.0},
    "groq/llama-3.1-8b-instant":    {"input": 0.0, "output": 0.0},
    "groq/mixtral-8x7b-32768":      {"input": 0.0, "output": 0.0},
    # Google (free tier)
    "gemini-2.0-flash":          {"input": 0.0,  "output": 0.0},
    "gemini-2.0-flash-lite":     {"input": 0.0,  "output": 0.0},
}


def estimate_cost(model: str, prompt_tokens: int, completion_tokens: int) -> float:
    """Estimate USD cost for a single request."""
    costs = MODEL_COSTS.get(model, {"input": 0.0, "output": 0.0})
    return (
        (prompt_tokens / 1_000_000) * costs["input"] +
        (completion_tokens / 1_000_000) * costs["output"]
    )


# ── Request ──────────────────────────────────────────────────
class ArenaRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="The prompt to send to all models")
    models: list[str] = Field(
        default=["claude-haiku-4-5-20251001", "groq/llama-3.3-70b-versatile", "gemini-2.0-flash"],
        description="List of model IDs to compare"
    )
    system_prompt: str = "You are a helpful assistant."
    max_tokens: int = Field(512, ge=1, le=4096)
    temperature: float = Field(0.7, ge=0.0, le=2.0)
    save_results: bool = True


# ── Per-model result ─────────────────────────────────────────
class ModelResult(BaseModel):
    model: str
    provider: str
    content: Optional[str] = None
    latency_ms: Optional[int] = None
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    cost_usd: Optional[float] = None
    status: str = "success"
    error: Optional[str] = None


# ── Full arena response ──────────────────────────────────────
class ArenaResponse(BaseModel):
    prompt: str
    system_prompt: str
    results: list[ModelResult]
    fastest_model: Optional[str] = None
    cheapest_model: Optional[str] = None
    total_duration_ms: int
    created_at: datetime