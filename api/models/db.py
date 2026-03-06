import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, DateTime,
    Integer, JSON, ForeignKey, Index
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class Conversation(Base):
    """One conversation = one chat session per user."""
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True,
                default=lambda: str(uuid.uuid4()))
    user_id      = Column(String(128), nullable=False)
    title        = Column(String(255), nullable=True)
    created_at   = Column(DateTime, default=datetime.utcnow())
    updated_at   = Column(DateTime, default=datetime.utcnow(),
                          onupdate=datetime.utcnow())
    meta         = Column(JSON, default=dict)  # flexible extra data

    messages = relationship("Message", back_populates="conversation",
                            order_by="Message.created_at")

    __table_args__ = (
        Index("idx_conv_user_id", "user_id"),  # fast user lookup
        Index("idx_conv_created", "created_at"),
    )


class Message(Base):
    """One row per message turn (user or assistant)."""
    __tablename__ = "messages"

    id              = Column(String(36), primary_key=True,
                             default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id",
                             ondelete="CASCADE"), nullable=False)
    role            = Column(String(16), nullable=False)   # user|assistant|system
    content         = Column(Text, nullable=False)
    model           = Column(String(64), nullable=True)    # which model answered
    provider        = Column(String(32), nullable=True)    # openai|anthropic|xai
    experiment_variant = Column(String(64), nullable=True) # A/B variant (Phase 3)
    latency_ms      = Column(Integer, nullable=True)       # LLM response time
    prompt_tokens   = Column(Integer, nullable=True)
    completion_tokens = Column(Integer, nullable=True)
    created_at      = Column(DateTime,
                             default=datetime.utcnow())

    conversation = relationship("Conversation", back_populates="messages")

    __table_args__ = (
        Index("idx_msg_conv_id", "conversation_id"),
        Index("idx_msg_created", "created_at"),
    )