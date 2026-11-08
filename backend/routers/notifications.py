from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, desc
import models, schemas, database, auth

router = APIRouter(prefix="/notifications", tags=["Notifications"], dependencies=[Depends(auth.get_current_user)])

@router.get("/", response_model=list[schemas.NotificationResponse])
async def get_my_notifications(current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(database.get_db)):
    """Fetch notifications for the logged-in user, newest first."""
    result = await db.execute(
        select(models.Notification)
        .filter(models.Notification.user_id == current_user.id)
        .order_by(desc(models.Notification.created_at))
    )
    return result.scalars().all()

@router.put("/{notif_id}/read")
async def mark_one_as_read(notif_id: int, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(database.get_db)):
    """Mark a specific notification as read."""
    result = await db.execute(
        select(models.Notification)
        .filter(models.Notification.id == notif_id)
        .filter(models.Notification.user_id == current_user.id)
    )
    notif = result.scalars().first()
    if notif:
        notif.read = True
        await db.commit()
    return {"success": True}

@router.put("/mark-all-read")
async def mark_all_as_read(current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(database.get_db)):
    """Mark all unread notifications as read for the user."""
    await db.execute(
        update(models.Notification)
        .where(models.Notification.user_id == current_user.id)
        .values(read=True)
    )
    await db.commit()
    return {"success": True}