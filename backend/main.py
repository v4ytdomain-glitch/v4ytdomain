import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import create_db_and_tables, use_sqlite_fallback
from routers import achievements, admin, announcements, auth_routes, notifications, players, teams, tournaments

logger = logging.getLogger("v4yt.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await create_db_and_tables()
    except Exception as exc:
        logger.warning("Primary database connection failed, falling back to local SQLite database. Error: %s", exc)
        use_sqlite_fallback()
        await create_db_and_tables()
    yield


app = FastAPI(title="V4YT Official API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(tournaments.router)
app.include_router(admin.router)
app.include_router(players.router)
app.include_router(notifications.router)
app.include_router(announcements.router)
app.include_router(teams.router)
app.include_router(achievements.router)


@app.get("/")
def root():
    return {"message": "V4YT API is online and secure. ⚡"}