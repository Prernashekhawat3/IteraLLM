import asyncio
import time
from datetime import datetime

from openai import AsyncOpenAI
from anthropic import AsyncAnthropic

from api.config import get_settings
from api.models.arena import (
    ArenaRequest, ArenaResponse, ModelResult, estimate_cost
)


def _get_provider(model: str) -> str:
    """Infer provider from model name prefix."""
    if model.startswith("gpt"):    return "openai"
    if model.startswith("claude"): return "anthropic"
    if model.startswith("gemini"): return "google"
    if model.startswith("groq/"):  return "groq"
    return "unknown"


async def _call_openai(
    model: str, messages: list, max_tokens: int, temperature: float
) -> ModelResult:
    """Call OpenAI models."""
    settings = get_settings()
    start = time.monotonic()
    try:
        client = AsyncOpenAI(api_key=settings.openai_api_key)
        resp = await client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        latency = int((time.monotonic() - start) * 1000)
        pt = resp.usage.prompt_tokens
        ct = resp.usage.completion_tokens
        return ModelResult(
            model=model,
            provider="openai",
            content=resp.choices[0].message.content,
            latency_ms=latency,
            prompt_tokens=pt,
            completion_tokens=ct,
            cost_usd=round(estimate_cost(model, pt, ct), 8),
            status="success",
        )
    except Exception as e:
        return ModelResult(
            model=model,
            provider="openai",
            status="error",
            error=str(e)[:200],
        )


async def _call_anthropic(
    model: str, messages: list, system: str, max_tokens: int, temperature: float
) -> ModelResult:
    """Call Anthropic Claude models."""
    settings = get_settings()
    start = time.monotonic()
    try:
        client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        resp = await client.messages.create(
            model=model,
            system=system,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        latency = int((time.monotonic() - start) * 1000)
        pt = resp.usage.input_tokens
        ct = resp.usage.output_tokens
        return ModelResult(
            model=model,
            provider="anthropic",
            content=resp.content[0].text,
            latency_ms=latency,
            prompt_tokens=pt,
            completion_tokens=ct,
            cost_usd=round(estimate_cost(model, pt, ct), 8),
            status="success",
        )
    except Exception as e:
        return ModelResult(
            model=model,
            provider="anthropic",
            status="error",
            error=str(e)[:200],
        )


async def _call_groq(
    model: str, messages: list, max_tokens: int, temperature: float
) -> ModelResult:
    """Call Groq inference API (OpenAI-compatible, ultra-fast LLaMA/Mixtral)."""
    settings = get_settings()
    model_name = model.replace("groq/", "")  # strip prefix for API call
    start = time.monotonic()
    try:
        client = AsyncOpenAI(
            api_key=settings.groq_api_key,
            base_url="https://api.groq.com/openai/v1",
        )
        resp = await client.chat.completions.create(
            model=model_name,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        latency = int((time.monotonic() - start) * 1000)
        pt = resp.usage.prompt_tokens
        ct = resp.usage.completion_tokens
        return ModelResult(
            model=model,
            provider="groq",
            content=resp.choices[0].message.content,
            latency_ms=latency,
            prompt_tokens=pt,
            completion_tokens=ct,
            cost_usd=0.0,
            status="success",
        )
    except Exception as e:
        return ModelResult(
            model=model,
            provider="groq",
            status="error",
            error=str(e)[:200],
        )


async def _call_gemini(
    model: str, prompt: str, system_prompt: str, max_tokens: int
) -> ModelResult:
    """Call Google Gemini via google-generativeai SDK."""
    import google.generativeai as genai
    settings = get_settings()
    genai.configure(api_key=settings.google_api_key)
    model_name = model.replace("models/", "")  
    start = time.monotonic()
    try:
        gemini = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=system_prompt,
        )
        resp = await asyncio.to_thread(
            gemini.generate_content,
            prompt,
            generation_config={"max_output_tokens": max_tokens},
        )
        latency = int((time.monotonic() - start) * 1000)
        pt = resp.usage_metadata.prompt_token_count
        ct = resp.usage_metadata.candidates_token_count
        return ModelResult(
            model=model,
            provider="google",
            content=resp.text,
            latency_ms=latency,
            prompt_tokens=pt,
            completion_tokens=ct,
            cost_usd=0.0,
            status="success",
        )
    except Exception as e:
        err = str(e)[:200]
        if "429" in err:
            err = "Rate limit — Gemini free tier: 15 req/min. Wait 60s."
        return ModelResult(
            model=model,
            provider="google",
            status="error",
            error=err,
        )


async def run_arena(req: ArenaRequest) -> ArenaResponse:
    """
    Fire all model calls in parallel using asyncio.gather().
    Total latency = slowest model, not sum of all models.
    """
    wall_start = time.monotonic()

    messages = [{"role": "user", "content": req.prompt}]
    messages_with_system = [
        {"role": "system", "content": req.system_prompt},
        *messages,
    ]

    tasks = []
    for model in req.models:
        provider = _get_provider(model)
        if provider == "anthropic":
            tasks.append(_call_anthropic(
                model, messages, req.system_prompt,
                req.max_tokens, req.temperature,
            ))
        elif provider == "groq":
            tasks.append(_call_groq(
                model, messages_with_system,
                req.max_tokens, req.temperature,
            ))
        elif provider == "google":
            tasks.append(_call_gemini(
                model, req.prompt, req.system_prompt,
                req.max_tokens,
            ))
        else:
            # openai fallback
            tasks.append(_call_openai(
                model, messages_with_system,
                req.max_tokens, req.temperature,
            ))

    results: list[ModelResult] = await asyncio.gather(*tasks)

    total_ms = int((time.monotonic() - wall_start) * 1000)

    successful = [r for r in results if r.status == "success"]
    fastest  = min(successful, key=lambda r: r.latency_ms or 999999, default=None)
    cheapest = min(successful, key=lambda r: r.cost_usd  or 999999, default=None)

    return ArenaResponse(
        prompt=req.prompt,
        system_prompt=req.system_prompt,
        results=results,
        fastest_model=fastest.model  if fastest  else None,
        cheapest_model=cheapest.model if cheapest else None,
        total_duration_ms=total_ms,
        created_at=datetime.utcnow(),
    )