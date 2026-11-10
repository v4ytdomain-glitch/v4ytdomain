import asyncio
from alembic import context
from sqlalchemy.ext.asyncio import async_engine_from_config
from app.core.config import get_settings
from app.models.base import Base
import app.models.entities  # noqa: F401

config=context.config
target_metadata=Base.metadata

def run_migrations_offline():
    context.configure(url=get_settings().direct_url, target_metadata=target_metadata, literal_binds=True, dialect_opts={"paramstyle":"named"}, compare_type=True)
    with context.begin_transaction(): context.run_migrations()

def do_run(connection):
    context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)
    with context.begin_transaction(): context.run_migrations()

async def run_async():
    url=get_settings().direct_url
    connectable=async_engine_from_config({"sqlalchemy.url":url},prefix="sqlalchemy.",poolclass=None)
    async with connectable.connect() as connection: await connection.run_sync(do_run)
    await connectable.dispose()

if context.is_offline_mode(): run_migrations_offline()
else: asyncio.run(run_async())
