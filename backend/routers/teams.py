from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
import models, schemas, database, auth

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.post("/", response_model=schemas.TeamResponse)
async def create_team(
    team: schemas.TeamCreate, 
    current_user: models.User = Depends(auth.get_current_user), 
    db: AsyncSession = Depends(database.get_db)
):
    """Creates a new team and assigns the current user as the captain/member."""
    
    # 1. Check if user is already in a team
    member_check = await db.execute(select(models.TeamMember).filter(models.TeamMember.user_id == current_user.id))
    if member_check.scalars().first():
        raise HTTPException(status_code=400, detail="You are already in a team. Leave it before creating a new one.")

    # 2. Check if team name is taken
    name_check = await db.execute(select(models.Team).filter(models.Team.name == team.name))
    if name_check.scalars().first():
        raise HTTPException(status_code=400, detail="Team name is already taken.")

    # 3. Create the Team
    new_team = models.Team(
        name=team.name, 
        logo=team.logo[:2].upper(), # Ensure logo is max 2 chars
        captain_id=current_user.id
    )
    db.add(new_team)
    await db.commit()
    await db.refresh(new_team)

    # 4. Add the creator as the first team member
    new_member = models.TeamMember(team_id=new_team.id, user_id=current_user.id)
    db.add(new_member)
    await db.commit()

    return {
        "id": new_team.id,
        "name": new_team.name,
        "logo": new_team.logo,
        "captain_id": new_team.captain_id,
        "captain_name": current_user.username,
        "wins": new_team.wins,
        "points": new_team.points,
        "members": [current_user.username]
    }

@router.get("/", response_model=list[schemas.TeamResponse])
async def get_teams(db: AsyncSession = Depends(database.get_db)):
    """Fetches the Team Leaderboard."""
    # Get all teams ordered by points
    teams_res = await db.execute(select(models.Team).order_by(desc(models.Team.points)))
    teams = teams_res.scalars().all()

    if not teams:
        return []

    # Get all team members globally
    members_res = await db.execute(select(models.TeamMember))
    team_members = members_res.scalars().all()

    # Get all users (to easily map IDs to Usernames)
    users_res = await db.execute(select(models.User))
    users = {u.id: u.username for u in users_res.scalars().all()}

    # Assemble the data
    result = []
    for t in teams:
        t_members = [m.user_id for m in team_members if m.team_id == t.id]
        member_usernames = [users.get(uid, "Unknown") for uid in t_members]
        
        result.append({
            "id": t.id,
            "name": t.name,
            "logo": t.logo,
            "captain_id": t.captain_id,
            "captain_name": users.get(t.captain_id, "Unknown"),
            "wins": t.wins,
            "points": t.points,
            "members": member_usernames
        })

    return result