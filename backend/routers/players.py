from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
import models, schemas, database

router = APIRouter(prefix="/players", tags=["Players"])

@router.get("/", response_model=list[schemas.UserResponse])
async def get_leaderboard(db: AsyncSession = Depends(database.get_db)):
    """Fetch all players ordered by points (descending) for the Leaderboard."""
    result = await db.execute(
        select(models.User).order_by(desc(models.User.points), desc(models.User.level))
    )
    return result.scalars().all()

@router.get("/{player_id}", response_model=schemas.UserResponse)
async def get_player_profile(player_id: int, db: AsyncSession = Depends(database.get_db)):
    """Fetch a single player for the public Player Profile page."""
    result = await db.execute(select(models.User).filter(models.User.id == player_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Player not found")
        
    return user