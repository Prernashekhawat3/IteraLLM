from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid


# ── What the user POSTs ──────────────────────────────────────
class FeedbackRequest(BaseModel):
    message_id: str      = Field(..., description="ID of the assistant message being rated")
    user_id: str         = Field(..., description="User who is giving feedback")
    rating: Literal["thumbs_up", "thumbs_down"]
    comment: Optional[str] = Field(None, max_length=1000)


# ── What gets published to Kafka ─────────────────────────────
class FeedbackEvent(BaseModel):
    event_id: str            = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: str          = "feedback.submitted"
    message_id: str
    conversation_id: str
    user_id: str
    rating: str
    experiment_variant: Optional[str] = None
    comment: Optional[str]   = None
    created_at: str          = Field(
        default_factory=lambda: datetime.utcnow().isoformat()
    )


# ── Stats response ───────────────────────────────────────────
class VariantStats(BaseModel):
    variant: str
    thumbs_up: int
    thumbs_down: int
    total: int
    win_rate: float   # thumbs_up / total

class FeedbackStats(BaseModel):
    total_feedback: int
    by_variant: list[VariantStats]
