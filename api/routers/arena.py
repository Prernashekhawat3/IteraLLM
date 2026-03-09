from fastapi import APIRouter
from api.models.arena import ArenaRequest, ArenaResponse, MODEL_COSTS
from api.services.arena import run_arena

router = APIRouter(prefix="/arena", tags=["arena"])


@router.post("/compare", response_model=ArenaResponse)
async def compare_models(req: ArenaRequest):
    """
    Send the same prompt to multiple LLMs simultaneously.
    Returns all responses with latency, tokens, and cost.
    """
    return await run_arena(req)


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