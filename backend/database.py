import os
from typing import AsyncGenerator

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import StaticPool

load_dotenv()

DEFAULT_SQLITE_URL = "sqlite+aiosqlite:///./v4yt.db"


def _create_engine(database_url: str):
    engine_kwargs = {"echo": False, "future": True}

    if database_url.startswith("sqlite"):
        engine_kwargs["connect_args"] = {"check_same_thread": False}
        engine_kwargs["poolclass"] = StaticPool

    return create_async_engine(database_url, **engine_kwargs)


def _resolve_database_url() -> str:
    database_url = os.getenv("DATABASE_URL", "").strip()
    return database_url or DEFAULT_SQLITE_URL


DATABASE_URL = _resolve_database_url()
engine = _create_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, autoflush=False)
Base = declarative_base()


async def create_db_and_tables() -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


def use_sqlite_fallback() -> None:
    global DATABASE_URL, engine, AsyncSessionLocal

    DATABASE_URL = DEFAULT_SQLITE_URL
    engine = _create_engine(DATABASE_URL)
    AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, autoflush=False)