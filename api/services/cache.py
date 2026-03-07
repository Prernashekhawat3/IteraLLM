import json
import redis.asyncio as redis
from functools import lru_cache
from typing import Optional
from api.config import get_settings


class SessionCache:
    """
    Redis-backed conversation history cache.
    Stores the last N turns per conversation for
    fast retrieval without hitting Postgres every time.
    """

    HISTORY_KEY_PREFIX = "conv:history:"   # conv:history:{conversation_id}
    LOCK_KEY_PREFIX    = "conv:lock:"       # prevent duplicate DB reads

    def __init__(self, redis_url: str, max_turns: int = 20, ttl: int = 3600):
        self.client = redis.from_url(
            redis_url,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,   # connection pool size
        )
        self.max_turns = max_turns   # sliding window size
        self.ttl = ttl               # seconds before cache expires

    def _key(self, conversation_id: str) -> str:
        return f"{self.HISTORY_KEY_PREFIX}{conversation_id}"
    
    async def get_history(self, conversation_id: str) -> Optional[list[dict]]:
        """
        Returns cached history or None on cache miss.
        Caller must handle None by loading from Postgres.
        """
        try:
            data = await self.client.get(self._key(conversation_id))
            if data is None:
                return None   # cache miss — caller loads from DB
            return json.loads(data)
        except Exception:
            return None   # on Redis error, fall back to DB silently
        
    async def set_history(self, conversation_id: str, messages: list[dict]) -> None:
        """
        Overwrites cache with a fresh message list.
        Used when loading from DB to warm the cache.
        """
        try:
            # Keep only last N turns (sliding window)
            trimmed = messages[-self.max_turns:]
            await self.client.set(
                self._key(conversation_id),
                json.dumps(trimmed),
                ex=self.ttl,   # auto-expire after 1 hour of inactivity
            )
        except Exception:
            pass   # cache write failure is non-fatal

    async def append_message(self, conversation_id: str, message: dict) -> None:
        """
        Appends one message to existing cache.
        More efficient than rewriting the whole history.
        Resets the TTL on every append (active convs stay alive).
        """
        try:
            history = await self.get_history(conversation_id) or []
            history.append(message)
            # Enforce sliding window
            history = history[-self.max_turns:]
            await self.client.set(
                self._key(conversation_id),
                json.dumps(history),
                ex=self.ttl,   # reset TTL — active conv stays warm
            )
        except Exception:
            pass
        
    async def invalidate(self, conversation_id: str) -> None:
        """
        Deletes cached history for a conversation.
        Use when you need to force a fresh DB load
        (e.g. after a bulk import or data correction).
        """
        try:
            await self.client.delete(self._key(conversation_id))
        except Exception:
            pass

    async def ping(self) -> bool:
        """Health check — returns True if Redis is reachable."""
        try:
            return await self.client.ping()
        except Exception:
            return False


# ── Singleton factory ─────────────────────────────────────
@lru_cache
def get_session_cache() -> SessionCache:
    """Returns a single shared SessionCache instance."""
    settings = get_settings()
    return SessionCache(
        redis_url=settings.redis_url,
        max_turns=settings.max_history_turns,
        ttl=settings.session_ttl_seconds,
    )