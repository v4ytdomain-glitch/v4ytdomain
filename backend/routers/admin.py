from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import models, schemas, auth, database

# Protected by get_current_admin!
router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(auth.get_current_admin)])

@router.post("/tournaments", response_model=schemas.TournamentResponse)
async def create_tournament(tournament: schemas.TournamentCreate, db: AsyncSession = Depends(database.get_db)):
    new_tourney = models.Tournament(**tournament.model_dump())
    db.add(new_tourney)
    await db.commit()
    await db.refresh(new_tourney)
    return new_tourney
    
@router.get("/players", response_model=list[schemas.UserResponse])
async def get_all_players(db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(select(models.User))
    return result.scalars().all()

# ... existing admin routes above ...

@router.post("/results")
async def submit_tournament_results(
    result_data: schemas.ResultCreate, 
    db: AsyncSession = Depends(database.get_db)
):



    # 1. Verify the tournament exists and isn't already completed
    t_res = await db.execute(select(models.Tournament).filter(models.Tournament.id == result_data.tournament_id))
    tournament = t_res.scalars().first()
    
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    if tournament.status == "completed":
        raise HTTPException(status_code=400, detail="Tournament already completed")

    # 2. Mark tournament as completed
    tournament.status = "completed"

    # 3. Save the official result record
    new_result = models.TournamentResult(
        tournament_id=result_data.tournament_id,
        first_place_id=result_data.first_place_id,
        second_place_id=result_data.second_place_id,
        third_place_id=result_data.third_place_id
    )
    db.add(new_result)

    # 4. Fetch the three winning users
    user_ids = [result_data.first_place_id, result_data.second_place_id, result_data.third_place_id]
    u_res = await db.execute(select(models.User).filter(models.User.id.in_(user_ids)))
    
    # Create a dictionary of users for easy access
    users_dict = {u.id: u for u in u_res.scalars().all()}
    

    # 5. Award Points, Stats, and Create Notifications!
    
    # 1st Place (+500 pts, +1000 xp, +1 win)
    if result_data.first_place_id in users_dict:
        u1 = users_dict[result_data.first_place_id]
        u1.points += 500
        u1.xp += 1000
        u1.wins += 1
        u1.level = (u1.xp // 10000) + 1
        db.add(models.Notification(
            user_id=u1.id, icon="🏆", 
            text=f"You won {tournament.name}!", sub="+500 V4YT Points earned"
        ))

    # 2nd Place (+300 pts, +500 xp)
    if result_data.second_place_id in users_dict:
        u2 = users_dict[result_data.second_place_id]
        u2.points += 300
        u2.xp += 500
        u2.level = (u2.xp // 10000) + 1
        db.add(models.Notification(
            user_id=u2.id, icon="🥈", 
            text=f"Runner-up in {tournament.name}!", sub="+300 V4YT Points earned"
        ))

    # 3rd Place (+200 pts, +250 xp)
    if result_data.third_place_id in users_dict:
        u3 = users_dict[result_data.third_place_id]
        u3.points += 200
        u3.xp += 250
        u3.level = (u3.xp // 10000) + 1
        db.add(models.Notification(
            user_id=u3.id, icon="🥉", 
            text=f"3rd Place in {tournament.name}!", sub="+200 V4YT Points earned"
        ))

    # Save everything to the database at once
    await db.commit()
    
    return {"message": "Results recorded and notifications sent successfully!"}

# ... [existing admin routes above] ...

@router.post("/announcements", response_model=schemas.AnnouncementResponse)
async def create_announcement(
    announcement: schemas.AnnouncementCreate,
    db: AsyncSession = Depends(database.get_db)
):
    """Publish a new announcement to the platform."""
    new_ann = models.Announcement(**announcement.model_dump())
    db.add(new_ann)
    await db.commit()
    await db.refresh(new_ann)
    return new_ann


# ... [existing admin routes above] ...

@router.post("/adjust-points")
async def adjust_player_points(
    adjustment: schemas.PointAdjustment,
    db: AsyncSession = Depends(database.get_db)
):
    """Manually add or deduct points/XP for a specific player."""
    # 1. Find the user
    result = await db.execute(select(models.User).filter(models.User.id == adjustment.user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Apply changes
    user.points += adjustment.points_change
    user.xp += adjustment.xp_change

    # 3. Prevent stats from dropping below zero
    if user.points < 0: 
        user.points = 0
    if user.xp < 0: 
        user.xp = 0

    # 4. Recalculate Level (10,000 XP per level)
    user.level = (user.xp // 10000) + 1

    # 5. Send an automated notification to the player!
    action = "awarded" if adjustment.points_change >= 0 else "deducted"
    icon = "⚡" if adjustment.points_change >= 0 else "⚠️"
    sign = "+" if adjustment.points_change >= 0 else ""
    
    db.add(models.Notification(
        user_id=user.id,
        icon=icon,
        text=f"Admin {action} points: {adjustment.reason}",
        sub=f"{sign}{adjustment.points_change} PTS | {sign}{adjustment.xp_change} XP"
    ))

    await db.commit()
    
    return {
        "message": "Points adjusted successfully", 
        "new_points": user.points, 
        "new_xp": user.xp, 
        "new_level": user.level
    }