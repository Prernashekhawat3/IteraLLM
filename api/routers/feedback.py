from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from collections import defaultdict

from api.database import get_db
from api.models.db import Message, Feedback
from api.models.feedback import (
    FeedbackRequest, FeedbackEvent, FeedbackStats, VariantStats
)
from api.services.kafka_producer import publish_feedback

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("/submit")
async def submit_feedback(
    req: FeedbackRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Accept feedback from user, publish to Kafka.
    Returns immediately — DB write happens asynchronously.
    """
    # Verify message exists + get its metadata
    result = await db.execute(
        select(Message).where(Message.id == req.message_id)
    )
    message = result.scalar_one_or_none()
    if not message:
        raise HTTPException(404, "Message not found")

    # Build Kafka event — include variant from the original message
    event = FeedbackEvent(
        message_id=req.message_id,
        conversation_id=message.conversation_id,
        user_id=req.user_id,
        rating=req.rating,
        experiment_variant=message.experiment_variant,
        comment=req.comment,
    )

    # Publish to Kafka (fire-and-forget)
    published = await publish_feedback(
        event.model_dump(),
        key=req.message_id,   # use message_id as partition key
    )
    
    from api.metrics import FEEDBACK_EVENTS
    FEEDBACK_EVENTS.labels(
        rating=req.rating,
        variant=message.experiment_variant or "unknown",
    ).inc()

    return {
        "status": "accepted",
        "event_id": event.event_id,
        "kafka_published": published,
    }


@router.get("/stats", response_model=FeedbackStats)
async def get_feedback_stats(db: AsyncSession = Depends(get_db)):
    """
    Returns thumbs up/down counts grouped by experiment variant.
    This is how you determine which variant is winning.
    """
    result = await db.execute(select(Feedback))
    all_feedback = result.scalars().all()

    # Group by variant
    by_variant: dict[str, dict] = defaultdict(lambda: {
        "thumbs_up": 0, "thumbs_down": 0
    })

    for fb in all_feedback:
        variant = fb.experiment_variant or "unknown"
        if fb.rating == "thumbs_up":
            by_variant[variant]["thumbs_up"] += 1
        else:
            by_variant[variant]["thumbs_down"] += 1

    stats = []
    for variant, counts in by_variant.items():
        total = counts["thumbs_up"] + counts["thumbs_down"]
        stats.append(VariantStats(
            variant=variant,
            thumbs_up=counts["thumbs_up"],
            thumbs_down=counts["thumbs_down"],
            total=total,
            win_rate=counts["thumbs_up"] / total if total > 0 else 0.0,
        ))

    return FeedbackStats(
        total_feedback=len(all_feedback),
        by_variant=sorted(stats, key=lambda s: s.win_rate, reverse=True),
    )