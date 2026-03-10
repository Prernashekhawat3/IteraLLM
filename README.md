# IteraLLM

> A production-grade AI chat backend with multi-provider LLM support, A/B experimentation, model arena, async feedback pipeline, and full observability.

![Stack](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Postgres](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis)
![Kafka](https://img.shields.io/badge/Kafka-3-231F20?style=flat-square&logo=apachekafka)

---

## What Is This?

IteraLLM is a scalable AI chat backend built to demonstrate production ML engineering patterns:

- **Multi-provider LLM routing** — Anthropic, Groq, Google Gemini
- **Model Arena** — send the same prompt to multiple models simultaneously, compare latency, tokens, and cost
- **A/B Experimentation** — deterministic hash-based variant assignment, tracked per message
- **Kafka Feedback Pipeline** — async event streaming, consumer writes to PostgreSQL
- **Redis Session Cache** — cache-first conversation history
- **Prometheus + Grafana** — full infrastructure observability
- **React Frontend** — dark terminal-style UI with Chat, Arena, and Dashboard tabs

---

## Architecture

```
User → React Frontend (Vite :5173)
         ↓
       FastAPI (:8000)
         ├── Redis  → session cache (conversation history)
         ├── PostgreSQL → persist messages, conversations, feedback
         ├── Experimenter → A/B variant assignment (hash-based)
         ├── LLM Service → Anthropic / Groq / Gemini
         ├── Kafka Producer → publishes feedback events
         └── /metrics → Prometheus scrapes every 15s → Grafana dashboards

Kafka Consumer (separate process)
  → reads feedback-events topic
  → writes to PostgreSQL feedback table
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| API | FastAPI + Python 3.11 |
| Database | PostgreSQL 15 + SQLAlchemy (async) |
| Cache | Redis 7 |
| Message Queue | Apache Kafka |
| LLM Providers | Anthropic, Groq, Google Gemini |
| Migrations | Alembic |
| Metrics | Prometheus + Grafana |
| Frontend | React 18 + Vite + Tailwind CSS |
| Charts | Recharts |
| Data Fetching | TanStack Query |
| Infrastructure | Docker Compose |

---

## Prerequisites

- Python 3.11
- Node.js 18+
- Docker Desktop (running)
- API keys for at least one LLM provider

---

## Directory Structure

```
IteraLLM/
├── api/                        # FastAPI backend
│   ├── main.py                 # App entry point, lifespan, middleware
│   ├── config.py               # Settings via pydantic-settings + .env
│   ├── database.py             # Async SQLAlchemy engine
│   ├── metrics.py              # Prometheus metrics definitions
│   ├── models/
│   │   ├── db.py               # ORM models (Conversation, Message, Feedback)
│   │   ├── schemas.py          # Pydantic request/response schemas
│   │   ├── arena.py            # Arena models + MODEL_COSTS table
│   │   └── feedback.py         # Feedback schemas + Kafka event models
│   ├── routers/
│   │   ├── chat.py             # POST /chat/send, GET /{id}/history
│   │   ├── health.py           # GET /health
│   │   ├── arena.py            # POST /arena/compare, GET /arena/models
│   │   ├── feedback.py         # POST /feedback/submit, GET /feedback/stats
│   │   └── experiments.py      # GET /experiments/, GET /{id}/assign/{user_id}
│   └── services/
│       ├── llm.py              # Multi-provider LLM service
│       ├── arena.py            # Parallel model comparison logic
│       ├── cache.py            # Redis session cache
│       └── kafka_producer.py   # Kafka async producer
│
├── experimenter/               # A/B experimentation framework
│   ├── models/
│   │   └── experiment.py       # Experiment, Variant, Assignment models
│   ├── assigner.py             # Deterministic hash-based variant assignment
│   └── store.py                # Loads experiment configs from JSON files
│
├── experiments/                # Experiment config files (JSON)
│   ├── prompt_v1_test.json     # control vs treatment_concise (50/50)
│   └── model_comparison.json   # paused model comparison experiment
│
├── feedback/
│   └── consumer.py             # Kafka consumer (run as separate process)
│
├── observability/
│   ├── prometheus/
│   │   └── prometheus.yml      # Scrape config (scrapes :8000/metrics)
│   └── grafana/
│       └── provisioning/
│           ├── datasources/
│           │   └── prometheus.yml   # Auto-configures Prometheus datasource
│           └── dashboards/
│               └── dashboards.yml   # Dashboard provisioning config
│
├── frontend/                   # React frontend
│   └── src/
│       ├── App.jsx             # 3-tab navigation shell
│       ├── api.js              # Axios API client
│       ├── index.css           # Tailwind + fonts
│       └── pages/
│           ├── ChatPage.jsx    # Chat interface with feedback
│           ├── ArenaPage.jsx   # Model comparison UI
│           └── DashboardPage.jsx # Live stats + health dashboard
│
├── alembic/                    # Database migrations
│   └── versions/               # Migration files
│
├── docker-compose.yml          # PostgreSQL, Redis, Kafka, Prometheus, Grafana
├── alembic.ini
├── requirements.txt
└── .env                        # API keys and config (never commit this)
```

---

## Quick Start

### 1 — Clone and set up Python environment

```bash
git clone https://github.com/YOUR_USERNAME/IteraLLM.git
cd IteraLLM

python3.11 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
```

### 2 — Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database
DATABASE_URL=postgresql+asyncpg://iterallm:secret@localhost:5432/iterallm

# Redis
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# LLM Providers (add the ones you have)
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...
GOOGLE_API_KEY=AIza...

# Default provider for /chat/send endpoint
LLM_PROVIDER=anthropic
LLM_MODEL=claude-haiku-4-5-20251001
```

**Free API keys:**
- Anthropic: [console.anthropic.com](https://console.anthropic.com) ($5 free credits)
- Groq: [console.groq.com](https://console.groq.com) (completely free)
- Google Gemini: [aistudio.google.com](https://aistudio.google.com) (free tier, no card)

### 3 — Start infrastructure with Docker

```bash
docker compose up -d
```

This starts: PostgreSQL (5432), Redis (6379), Kafka + Zookeeper (9092), Prometheus (9090), Grafana (3000).

Verify everything is running:

```bash
docker compose ps
```

### 4 — Run database migrations

```bash
alembic upgrade head
```

### 5 — Start the API server

```bash
uvicorn api.main:app --reload --port 8000
```

### 6 — Start the Kafka feedback consumer (separate terminal)

```bash
source .venv/bin/activate
python -m feedback.consumer
```

### 7 — Start the frontend (separate terminal)

```bash
cd frontend
npm install
npm run dev
```

---

## Access Points

| Service | URL | Credentials |
|---|---|---|
| React Frontend | http://localhost:5173 | — |
| FastAPI Docs | http://localhost:8000/docs | — |
| Prometheus | http://localhost:9090 | — |
| Grafana | http://localhost:3000 | admin / iterallm |

---

## API Endpoints

### Chat
```
POST /chat/send              Send a message, get LLM response
GET  /chat/{id}/history      Get conversation history
```

### Arena
```
POST /arena/compare          Compare multiple models on same prompt
GET  /arena/models           List all supported models with pricing
POST /arena/quick            Quick compare with just a prompt string
```

### Feedback
```
POST /feedback/submit        Submit thumbs up/down on a message
GET  /feedback/stats         Get win rates per experiment variant
```

### Experiments
```
GET  /experiments/                    List all experiments
GET  /experiments/{id}/assign/{user}  Get variant assignment for a user
GET  /experiments/{id}/distribution   Simulate traffic distribution
```

### System
```
GET  /health                 API, database, and Redis health check
GET  /metrics                Prometheus metrics endpoint
```

---

## Supported Models (Arena)

| Model | Provider | Cost |
|---|---|---|
| `claude-haiku-4-5-20251001` | Anthropic | $0.80 / $4.00 per 1M tokens |
| `claude-sonnet-4-5` | Anthropic | $3.00 / $15.00 per 1M tokens |
| `groq/llama-3.3-70b-versatile` | Groq | Free |
| `groq/llama-3.1-8b-instant` | Groq | Free |
| `groq/mixtral-8x7b-32768` | Groq | Free |
| `gemini-2.0-flash` | Google | Free |
| `gemini-2.0-flash-lite` | Google | Free |

---

## Example curl Commands

**Send a chat message:**
```bash
curl -s -X POST http://localhost:8000/chat/send \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_001", "message": "What is Redis?"}' \
  | python3 -m json.tool
```

**Compare 3 models in the arena:**
```bash
curl -s -X POST http://localhost:8000/arena/compare \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain what an API is in one sentence.",
    "models": ["claude-haiku-4-5-20251001", "groq/llama-3.3-70b-versatile", "gemini-2.0-flash"],
    "max_tokens": 100
  }' | python3 -m json.tool
```

**Submit feedback:**
```bash
curl -s -X POST http://localhost:8000/feedback/submit \
  -H "Content-Type: application/json" \
  -d '{
    "message_id": "YOUR_MESSAGE_ID",
    "user_id": "user_001",
    "rating": "thumbs_up"
  }' | python3 -m json.tool
```

**Check health:**
```bash
curl -s http://localhost:8000/health | python3 -m json.tool
```

---

## Observability

### Prometheus Metrics

The app exposes these metrics at `GET /metrics`:

| Metric | Type | Description |
|---|---|---|
| `llm_request_latency_ms` | Histogram | LLM response time by model + provider |
| `llm_tokens_total` | Counter | Tokens consumed by type + model |
| `http_requests_total` | Counter | HTTP requests by method + endpoint + status |
| `http_request_duration_ms` | Histogram | End-to-end request duration |
| `arena_comparisons_total` | Counter | Arena compare calls by model count |
| `feedback_events_total` | Counter | Feedback submissions by rating + variant |
| `cache_hits_total` | Counter | Redis cache hits vs misses |
| `active_experiments` | Gauge | Currently running experiments |

### Grafana Dashboard

Open http://localhost:3000 (admin / iterallm).

Key PromQL queries:

```promql
# P95 LLM latency by model
histogram_quantile(0.95, sum by (model, le) (rate(llm_request_latency_ms_bucket[5m])))

# Request rate
rate(http_requests_total[5m])

# Cache hit rate %
sum(rate(cache_hits_total{result="hit"}[5m])) / sum(rate(cache_hits_total[5m])) * 100

# Error rate
sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100
```

---

## Running Tests

```bash
# Verify all three free LLM providers are working
curl -s -X POST http://localhost:8000/arena/compare \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Say hello in one sentence.",
    "models": ["claude-haiku-4-5-20251001", "groq/llama-3.3-70b-versatile", "gemini-2.0-flash"],
    "max_tokens": 30
  }' | python3 -m json.tool
```

All three should show `"status": "success"`.

---

## Key Engineering Decisions

**Why asyncpg over psycopg2?** Full async support — no thread blocking during DB queries.

**Why `datetime.utcnow()` instead of `datetime.now(timezone.utc)`?** asyncpg requires naive datetimes with `TIMESTAMP WITHOUT TIME ZONE` columns.

**Why Kafka for feedback instead of direct DB writes?** Fire-and-forget — feedback submission returns immediately without waiting for DB write. Consumer handles retries independently.

**Why hash-based A/B assignment?** Deterministic — same user always gets the same variant. No assignment table needed.

**Why Groq instead of OpenAI for free tier?** Groq's free tier has no credit limit and typically delivers responses 3-5x faster than OpenAI on equivalent models.

---

## Environment Variables Reference

```env
# Required
DATABASE_URL=postgresql+asyncpg://iterallm:secret@localhost:5432/iterallm
REDIS_URL=redis://localhost:6379
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
LLM_PROVIDER=anthropic
LLM_MODEL=claude-haiku-4-5-20251001

# LLM API Keys (add whichever you have)
ANTHROPIC_API_KEY=
GROQ_API_KEY=
GOOGLE_API_KEY=
OPENAI_API_KEY=        # optional, paid
XAI_API_KEY=           # optional, paid
```

---

## Stopping Everything

```bash
# Stop Docker services
docker compose down

# Stop with data wipe (fresh start)
docker compose down -v
```

---

## License

MIT