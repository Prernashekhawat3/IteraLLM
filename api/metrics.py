from prometheus_client import (
    Counter, Histogram, Gauge, REGISTRY
)

# ── LLM Metrics ───────────────────────────────────────────
LLM_LATENCY = Histogram(
    "llm_request_latency_ms",
    "LLM response latency in milliseconds",
    labelnames=["model", "provider"],
    buckets=[100, 250, 500, 750, 1000, 1500, 2000, 3000, 5000],
)

LLM_TOKENS = Counter(
    "llm_tokens_total",
    "Total tokens consumed",
    labelnames=["model", "token_type"],  # token_type: prompt | completion
)

# ── HTTP Metrics ───────────────────────────────────────────
HTTP_REQUESTS = Counter(
    "http_requests_total",
    "Total HTTP requests",
    labelnames=["method", "endpoint", "status_code"],
)

HTTP_DURATION = Histogram(
    "http_request_duration_ms",
    "HTTP request duration in milliseconds",
    labelnames=["method", "endpoint"],
    buckets=[10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
)

# ── Feature Metrics ────────────────────────────────────────
ARENA_COMPARISONS = Counter(
    "arena_comparisons_total",
    "Arena compare calls",
    labelnames=["model_count"],
)

FEEDBACK_EVENTS = Counter(
    "feedback_events_total",
    "Feedback submissions",
    labelnames=["rating", "variant"],
)

CACHE_HITS = Counter(
    "cache_hits_total",
    "Redis cache hits and misses",
    labelnames=["result"],  # result: hit | miss
)

ACTIVE_EXPERIMENTS = Gauge(
    "active_experiments",
    "Number of currently running experiments",
)