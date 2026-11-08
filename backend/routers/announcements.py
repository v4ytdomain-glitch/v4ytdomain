from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
import models, schemas, database

router = APIRouter(prefix="/announcements", tags=["Announcements"])

@router.get("/", response_model=list[schemas.AnnouncementResponse])
async def get_announcements(db: AsyncSession = Depends(database.get_db)):
    """Fetch all public announcements, newest first."""
    result = await db.execute(
        select(models.Announcement).order_by(desc(models.Announcement.created_at))
    )
    return result.scalars().all()