from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from api.database import get_db
from api.models.db import Conversation, Message
from api.models.schemas import ChatRequest, ChatResponse, ConversationHistory, MessageOut
from api.services.llm import get_llm_provider

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/send", response_model=ChatResponse, status_code=200)
async def send_message(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    """Send a message and get an AI response."""

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
        await db.flush()  # get the ID without committing

    # ── Step 2: Load conversation history from DB ──────
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at)
        .limit(20)  # last 20 turns = context window
    )
    history = result.scalars().all()

    # Format history for LLM
    llm_messages = [
        {"role": msg.role, "content": msg.content}
        for msg in history
    ]
    llm_messages.append({"role": "user", "content": req.message})

    # ── Step 3: Save user message ──────────────────────
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=req.message,
        created_at=datetime.utcnow(),
    )
    db.add(user_msg)

    # ── Step 4: Call LLM ───────────────────────────────
    llm = get_llm_provider()
    llm_response = await llm.complete(
        messages=llm_messages,
        system_prompt="You are a helpful assistant.",
    )

    # ── Step 5: Save assistant response ───────────────
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
    # db session commits automatically via get_db() dependency

    return ChatResponse(
        conversation_id=conversation.id,
        message_id=assistant_msg.id,
        content=llm_response.content,
        model=llm_response.model,
        provider=llm_response.provider,
        latency_ms=llm_response.latency_ms,
        variant="control",  # will be dynamic in Phase 3
        created_at=assistant_msg.created_at,
    )


@router.get("/{conversation_id}/history", response_model=ConversationHistory)
async def get_history(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Fetch full message history for a conversation."""
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