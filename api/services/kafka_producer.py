import json
from aiokafka import AIOKafkaProducer
from api.config import get_settings


# Module-level producer — shared across all requests
_producer: AIOKafkaProducer | None = None


async def get_producer() -> AIOKafkaProducer:
    """Returns the shared producer, starting it if needed."""
    global _producer
    if _producer is None:
        settings = get_settings()
        _producer = AIOKafkaProducer(
            bootstrap_servers=settings.kafka_bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            key_serializer=lambda k: k.encode("utf-8") if k else None,
            acks="all",           # wait for all replicas — durability
            compression_type="gzip",
        )
        await _producer.start()
    return _producer


async def stop_producer() -> None:
    """Gracefully flush + close producer on shutdown."""
    global _producer
    if _producer is not None:
        await _producer.stop()
        _producer = None


async def publish_feedback(event: dict, key: str = None) -> bool:
    """
    Publishes a feedback event to Kafka.
    Returns True on success, False on failure (non-fatal).
    The API should not crash if Kafka is temporarily down.
    """
    settings = get_settings()
    try:
        producer = await get_producer()
        await producer.send_and_wait(
            topic=settings.kafka_feedback_topic,
            value=event,
            key=key,
        )
        return True
    except Exception as e:
        print(f"[Kafka] Failed to publish feedback: {e}")
        return False