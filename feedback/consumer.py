"""
Feedback consumer — run this as a separate process:
  python -m feedback.consumer

Reads from Kafka topic 'feedback-events' and
persists each event to the feedback table in Postgres.
"""
import asyncio
import json
import os
import uuid
from datetime import datetime

from aiokafka import AIOKafkaConsumer
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from dotenv import load_dotenv

load_dotenv()

# ── Config from env ──────────────────────────────────────────
KAFKA_SERVERS  = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_TOPIC    = os.getenv("KAFKA_FEEDBACK_TOPIC", "feedback-events")
DATABASE_URL   = os.getenv("DATABASE_URL", "")
GROUP_ID       = "feedback-processor-group"


async def process_event(event: dict, session: AsyncSession) -> None:
    """Write a single feedback event to Postgres."""
    from api.models.db import Feedback   # import here to avoid circular deps

    feedback = Feedback(
        id=event.get("event_id", str(uuid.uuid4())),
        message_id=event["message_id"],
        conversation_id=event["conversation_id"],
        user_id=event["user_id"],
        rating=event["rating"],
        experiment_variant=event.get("experiment_variant"),
        comment=event.get("comment"),
        created_at=datetime.utcnow(),
    )
    session.add(feedback)
    await session.commit()


async def run_consumer() -> None:
    """Main consumer loop — runs until interrupted."""
    engine = create_async_engine(DATABASE_URL)
    SessionLocal = async_sessionmaker(engine, class_=AsyncSession,
                                      expire_on_commit=False)

    consumer = AIOKafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_SERVERS,
        group_id=GROUP_ID,
        auto_offset_reset="earliest",   # process from beginning on first run
        enable_auto_commit=False,        # manual commit after successful write
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
    )

    await consumer.start()
    print(f"✓ Consumer started — listening on '{KAFKA_TOPIC}'")

    try:
        async for msg in consumer:
            try:
                print(f"→ Processing event: {msg.value.get('event_id', '?')}"
                      f" | rating={msg.value.get('rating')}"
                      f" | variant={msg.value.get('experiment_variant')}")

                async with SessionLocal() as session:
                    await process_event(msg.value, session)

                # Only commit offset after successful DB write
                await consumer.commit()
                print(f"  ✓ Saved to Postgres")

            except Exception as e:
                # Log but don't commit — event will be reprocessed
                print(f"  ✗ Failed to process event: {e}")

    finally:
        await consumer.stop()
        await engine.dispose()
        print("Consumer stopped.")


if __name__ == "__main__":
    asyncio.run(run_consumer())