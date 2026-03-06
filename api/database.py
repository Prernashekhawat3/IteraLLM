from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker
)
from api.config import get_settings

settings = get_settings()

# Create the async engine with connection pool
engine = create_async_engine(
    settings.database_url,
    pool_size=10,          # keep 10 connections alive
    max_overflow=20,       # allow up to 20 extra under load
    pool_pre_ping=True,    # test connection before using it
    echo=settings.app_env == "development",  # log SQL in dev
)

# Session factory — creates new AsyncSession instances
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # keep objects usable after commit
    autocommit=False,
    autoflush=False,
)


# FastAPI dependency — inject into any endpoint
async def get_db() -> AsyncSession:
    """Yields a DB session, auto-closes after request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise