from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.services.kafka_producer import get_producer, stop_producer
from contextlib import asynccontextmanager
from api.routers import chat, health, arena, feedback

import time
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from api.metrics import HTTP_REQUESTS, HTTP_DURATION
# from api.metrics import ACTIVE_EXPERIMENTS
# from experimenter.store import get_experiment_store


from api.routers import chat, health, arena
from api.database import engine
from api.models.db import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    # 1. Database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # 2. Kafka Producer (pre-connect)
    try:
        await get_producer()
    except Exception as e:
        print(f"[Lifespan] Kafka connection failed (non-fatal): {e}")

    yield

    # Shutdown
    await stop_producer()
    await engine.dispose()

# ── Metrics middleware ─────────────────────────────────────
class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.monotonic()
        response = await call_next(request)
        duration = (time.monotonic() - start) * 1000

        # Normalize path — replace UUIDs with {id} placeholder
        path = request.url.path
        for segment in path.split("/"):
            if len(segment) == 36 and segment.count("-") == 4:
                path = path.replace(segment, "{id}")

        HTTP_REQUESTS.labels(
            method=request.method,
            endpoint=path,
            status_code=str(response.status_code),
        ).inc()
        HTTP_DURATION.labels(
            method=request.method,
            endpoint=path,
        ).observe(duration)
        return response

app = FastAPI(
    title="IteraLLM",
    description="Scalable AI Chat Backend with Experimentation",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── /metrics endpoint for Prometheus scraping ─────────────
@app.get("/metrics")
async def metrics():
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST,
    )

app.include_router(health.router)
app.include_router(chat.router)
app.include_router(arena.router)
app.include_router(feedback.router)
app.add_middleware(MetricsMiddleware)