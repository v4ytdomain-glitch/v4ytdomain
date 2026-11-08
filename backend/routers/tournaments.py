from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import models, schemas, database, auth

router = APIRouter(prefix="/tournaments", tags=["Tournaments"])

@router.get("/", response_model=list[schemas.TournamentResponse])
async def get_tournaments(db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(select(models.Tournament).order_by(models.Tournament.id.desc()))
    return result.scalars().all()


# ... inside backend/routers/tournaments.py ...

@router.get("/results", response_model=list[schemas.TournamentResultResponse])
async def get_all_results(db: AsyncSession = Depends(database.get_db)):
    """Fetch all official tournament results for the Hall of Fame."""
    # Order by ID descending so the newest results are first
    result = await db.execute(
        select(models.TournamentResult).order_by(models.TournamentResult.id.desc())
    )
    return result.scalars().all()




# --- NEW REGISTRATION ENDPOINT ---
@router.post("/{tournament_id}/register", response_model=schemas.RegistrationResponse)
async def register_for_tournament(
    tournament_id: int, 
    registration: schemas.RegistrationCreate,
    current_user: models.User = Depends(auth.get_current_user), # Requires user to be logged in
    db: AsyncSession = Depends(database.get_db)
):
    # 1. Find the tournament
    result = await db.execute(select(models.Tournament).filter(models.Tournament.id == tournament_id))
    tournament = result.scalars().first()
    
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
        
    if tournament.status != "open":
        raise HTTPException(status_code=400, detail="Registration is closed for this tournament")

    # 2. Check if the tournament is full
    if tournament.players_registered >= tournament.max_players:
        raise HTTPException(status_code=400, detail="Tournament is full")

    # 3. Check if the user is already registered for this specific tournament
    reg_check = await db.execute(
        select(models.Registration)
        .filter(models.Registration.tournament_id == tournament_id)
        .filter(models.Registration.user_id == current_user.id)
    )
    if reg_check.scalars().first():
        raise HTTPException(status_code=400, detail="You are already registered for this tournament")

    # 4. Create the new registration
    new_reg = models.Registration(
        user_id=current_user.id,
        tournament_id=tournament_id,
        player_id=registration.player_id,
        game_uid=registration.game_uid,
        in_game_name=registration.in_game_name,
        team_name=registration.team_name,
        team_members=registration.team_members
    )
    db.add(new_reg)

    # 5. Increase the tournament player count
    tournament.players_registered += 1

    await db.commit()
    await db.refresh(new_reg)
    
    return new_reg