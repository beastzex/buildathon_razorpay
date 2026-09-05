"""
Database Configuration & Async Session Management (Part 4)
Supports dual-mode execution:
1. PostgreSQL 16 + pgvector (Production / Docker Compose)
2. SQLite (async via aiosqlite) fallback for zero-dependency local testing
"""

import os
import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

logger = logging.getLogger("ledgr.api.db")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./ledgr.db")

# Fix Render / Supabase 'postgres://' URI convention to 'postgresql+asyncpg://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

logger.info(f"Configuring Database Engine: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")

# SQLite specific connect args for async compatibility
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    connect_args=connect_args
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Create tables on startup if not already created."""
    import api.models  # ensure all models are registered on Base.metadata
    async with engine.begin() as conn:
        if "postgresql" in DATABASE_URL:
            # Enable pgvector extension if PostgreSQL
            try:
                from sqlalchemy import text
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            except Exception as e:
                logger.warning(f"Could not initialize pgvector extension: {e}")
        await conn.run_sync(Base.metadata.create_all)
        # Migrate new columns on existing SQLite/Postgres DBs if missing
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE exceptions ADD COLUMN debate_transcript TEXT;"))
        except Exception:
            pass  # Already exists or not applicable
    logger.info("Database tables initialized successfully.")
