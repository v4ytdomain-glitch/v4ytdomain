from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
import models, schemas, database, auth

router = APIRouter(prefix="/achievements", tags=["Achievements"])

@router.get("/", response_model=list[schemas.AchievementResponse])
async def get_all_achievements(db: AsyncSession = Depends(database.get_db)):
    """Fetch the master list of all available achievements."""
    result = await db.execute(select(models.Achievement))
    return result.scalars().all()

@router.post("/", response_model=schemas.AchievementResponse)
async def create_achievement(
    achievement: schemas.AchievementCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(database.get_db)
):
    """Admin only: Create a new badge/achievement type."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    new_badge = models.Achievement(**achievement.model_dump())
    db.add(new_badge)
    await db.commit()
    await db.refresh(new_badge)
    return new_badge

@router.post("/award")
async def award_achievement(
    user_id: int, 
    achievement_id: int, 
    current_user: models.User = Depends(auth.get_current_user), 
    db: AsyncSession = Depends(database.get_db)
):
    """Admin only: Award an achievement to a player."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Check if user already has this achievement
    check = await db.execute(
        select(models.UserAchievement)
        .filter(models.UserAchievement.user_id == user_id)
        .filter(models.UserAchievement.achievement_id == achievement_id)
    )
    if check.scalars().first():
        raise HTTPException(status_code=400, detail="Player already has this badge")

    # Award the badge
    ua = models.UserAchievement(user_id=user_id, achievement_id=achievement_id)
    db.add(ua)
    
    # Automate a notification for the player
    db.add(models.Notification(
        user_id=user_id,
        icon="🎖️",
        text="Achievement Unlocked!",
        sub="Check your profile to see your new badge."
    ))
    
    await db.commit()
    return {"message": "Achievement awarded successfully!"}

# ... [existing achievement routes above] ...

@router.get("/user/{user_id}", response_model=list[schemas.AchievementResponse])
async def get_user_achievements(user_id: int, db: AsyncSession = Depends(database.get_db)):
    """Fetch all achievements unlocked by a specific user."""
    # Join the tables to return the actual Badge details, not just the IDs
    result = await db.execute(
        select(models.Achievement)
        .join(models.UserAchievement, models.UserAchievement.achievement_id == models.Achievement.id)
        .filter(models.UserAchievement.user_id == user_id)
        .order_by(desc(models.UserAchievement.unlocked_at))
    )
    return result.scalars().all()