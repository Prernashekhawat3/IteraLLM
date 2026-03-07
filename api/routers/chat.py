from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from api.database import get_db
from api.models.db import Conversation, Message
from api.models.schemas import (
    ChatRequest, ChatResponse, ConversationHistory, MessageOut
)
from api.services.llm import get_llm_provider
from api.services.cache import get_session_cache   # ← NEW

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/send", response_model=ChatResponse)
async def send_message(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    cache = get_session_cache()

    # ── Step 1: Get or create conversation ────────────
    if req.conversation_id:
        result = await db.execute(
            select(Conversation).where(Conversation.id == req.conversation_id)
        )
        conversation = result.scalar_one_or_none()
        if not conversation:
            raise HTTPException(404, "Conversation not found")
    else:
        conversation = Conversation(user_id=req.user_id)
        db.add(conversation)
        await db.flush()

    # ── Step 2: Cache-first history load ──────────────
    cached_history = await cache.get_history(conversation.id)

    if cached_history is not None:
        # ✅ Cache HIT — no DB query needed
        llm_messages = cached_history
    else:
        # ❌ Cache MISS — load from Postgres, warm cache
        result = await db.execute(
            select(Message)
            .where(Message.conversation_id == conversation.id)
            .order_by(Message.created_at)
            .limit(20)
        )
        db_messages = result.scalars().all()
        llm_messages = [
            {"role": m.role, "content": m.content}
            for m in db_messages
        ]
        # Warm the cache so next request is a hit
        await cache.set_history(conversation.id, llm_messages)

    # ── Step 3: Add current user message ──────────────
    user_message = {"role": "user", "content": req.message}
    llm_messages_with_current = llm_messages + [user_message]

    # ── Step 4: Save user message to DB ───────────────
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=req.message,
        created_at=datetime.utcnow(),
    )
    db.add(user_msg)

    # ── Step 5: Call LLM ───────────────────────────────
    llm = get_llm_provider()
    llm_response = await llm.complete(
        messages=llm_messages_with_current,
        system_prompt="You are a helpful assistant.",
    )

    # ── Step 6: Save assistant response to DB ─────────
    assistant_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=llm_response.content,
        model=llm_response.model,
        provider=llm_response.provider,
        latency_ms=llm_response.latency_ms,
        prompt_tokens=llm_response.prompt_tokens,
        completion_tokens=llm_response.completion_tokens,
        created_at=datetime.utcnow(),
    )
    db.add(assistant_msg)
    await db.flush()

    # ── Step 7: Update cache with both new messages ────
    await cache.append_message(conversation.id, user_message)
    await cache.append_message(
        conversation.id,
        {"role": "assistant", "content": llm_response.content}
    )

    return ChatResponse(
        conversation_id=conversation.id,
        message_id=assistant_msg.id,
        content=llm_response.content,
        model=llm_response.model,
        provider=llm_response.provider,
        latency_ms=llm_response.latency_ms,
        variant="control",
        created_at=assistant_msg.created_at,
    )


@router.get("/{conversation_id}/history", response_model=ConversationHistory)
async def get_history(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(404, "Conversation not found")

    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    messages = result.scalars().all()
    return ConversationHistory(
        conversation_id=conv.id,
        user_id=conv.user_id,
        messages=[MessageOut.model_validate(m) for m in messages],
        total_messages=len(messages),
    )