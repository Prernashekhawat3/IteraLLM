from fastapi import APIRouter
from api.models.arena import ArenaRequest, ArenaResponse, MODEL_COSTS, ValidationRequest, ValidationResponse
from api.services.arena import run_arena, validate_config
from api.metrics import ARENA_COMPARISONS, LLM_LATENCY, LLM_TOKENS

router = APIRouter(prefix="/arena", tags=["arena"])


@router.post("/validate", response_model=ValidationResponse)
async def validate_model_config(req: ValidationRequest):
    """
    Validate a model configuration by making a test call.
    """
    return await validate_config(req)


@router.post("/compare", response_model=ArenaResponse)
async def compare_models(req: ArenaRequest):
    """
    Send the same prompt to multiple LLMs simultaneously.
    Returns all responses with latency, tokens, and cost.
    """
    result = await run_arena(req)

    # Record arena comparison count
    ARENA_COMPARISONS.labels(model_count=str(len(req.models))).inc()

    # Record per-model latency + tokens from arena results
    for r in result.results:
        if r.status == "success" and r.latency_ms:
            LLM_LATENCY.labels(model=r.model, provider=r.provider).observe(r.latency_ms)
        if r.prompt_tokens:
            LLM_TOKENS.labels(model=r.model, token_type="prompt").inc(r.prompt_tokens)
        if r.completion_tokens:
            LLM_TOKENS.labels(model=r.model, token_type="completion").inc(r.completion_tokens)

    return result


@router.get("/models")
async def list_models():
    """List all supported models with their pricing."""
    return {
        "models": [
            {
                "id": model_id,
                "provider": (
                    "openai" if model_id.startswith("gpt") else
                    "anthropic" if model_id.startswith("claude") else
                    "xai" if model_id.startswith("grok") else
                    "google"
                ),
                "cost_per_1m_input": costs["input"],
                "cost_per_1m_output": costs["output"],
            }
            for model_id, costs in MODEL_COSTS.items()
        ]
    }


@router.post("/quick")
async def quick_compare(prompt: str):
    """
    Quick shorthand — compare default models with just a prompt string.
    Useful for fast testing from the docs UI.
    """
    req = ArenaRequest(prompt=prompt)
    return await run_arena(req)