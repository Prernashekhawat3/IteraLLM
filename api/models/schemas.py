from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# ── Incoming Requests ─────────────────────────────────────

class ChatRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=128,
                         description="Unique identifier for the user")
    message: str = Field(..., min_length=1, max_length=8000,
                         description="User's chat message")
    conversation_id: Optional[str] = Field(None,
                         description="Omit to start a new conversation")

    class Config:
        json_schema_extra = {"example": {
            "user_id": "user_abc123",
            "message": "What is the capital of France?"
        }}


# ── Outgoing Responses ────────────────────────────────────

class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    content: str
    model: str
    provider: str
    latency_ms: int
    variant: str = "control"    # A/B variant (used in Phase 3)
    created_at: datetime


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    model: Optional[str]
    latency_ms: Optional[int]
    created_at: datetime


class ConversationHistory(BaseModel):
    conversation_id: str
    user_id: str
    messages: list[MessageOut]
    total_messages: int


class HealthResponse(BaseModel):
    status: str
    db: str
    version: str = "1.0.0"
