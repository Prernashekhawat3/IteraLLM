import time
from dataclasses import dataclass
from typing import Optional
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
from functools import lru_cache


# ── 3A: Unified response schema ───────────────────────────
@dataclass
class LLMResponse:
    """Unified response from any LLM provider."""
    content: str
    model: str
    provider: str
    latency_ms: int
    prompt_tokens: int = 0
    completion_tokens: int = 0

    @property
    def total_tokens(self) -> int:
        return self.prompt_tokens + self.completion_tokens


# ── 3B: OpenAI Provider ───────────────────────────────────
class OpenAIProvider:
    def __init__(self, api_key: str, base_url: Optional[str] = None):
        self.client = AsyncOpenAI(api_key=api_key, base_url=base_url)

    async def complete(
        self,
        messages: list[dict],
        model: str = "gpt-4o-mini",
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> LLMResponse:
        start = time.monotonic()

        full_messages = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        resp = await self.client.chat.completions.create(
            model=model,
            messages=full_messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        latency_ms = int((time.monotonic() - start) * 1000)

        return LLMResponse(
            content=resp.choices[0].message.content,
            model=model,
            provider="openai",
            latency_ms=latency_ms,
            prompt_tokens=resp.usage.prompt_tokens,
            completion_tokens=resp.usage.completion_tokens,
        )


# ── 3C: Anthropic Provider ────────────────────────────────
class AnthropicProvider:
    def __init__(self, api_key: str):
        self.client = AsyncAnthropic(api_key=api_key)

    async def complete(
        self,
        messages: list[dict],
        model: str = "claude-haiku-4-5-20251001",
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> LLMResponse:
        start = time.monotonic()

        resp = await self.client.messages.create(
            model=model,
            system=system_prompt or "You are a helpful assistant.",
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        latency_ms = int((time.monotonic() - start) * 1000)

        return LLMResponse(
            content=resp.content[0].text,
            model=model,
            provider="anthropic",
            latency_ms=latency_ms,
            prompt_tokens=resp.usage.input_tokens,
            completion_tokens=resp.usage.output_tokens,
        )


# ── 3D: Factory — picks provider from .env ────────────────
@lru_cache
def get_llm_provider():
    """Returns the right provider based on LLM_PROVIDER env var."""
    from api.config import get_settings
    settings = get_settings()
    provider = settings.llm_provider.lower()

    if provider == "openai":
        return OpenAIProvider(api_key=settings.llm_api_key)
    elif provider == "anthropic":
        return AnthropicProvider(api_key=settings.llm_api_key)
    elif provider == "groq":
        return OpenAIProvider(api_key=settings.llm_api_key, base_url="https://api.groq.com/openai/v1")
    else:
        raise ValueError(f"Unknown provider: {provider}")