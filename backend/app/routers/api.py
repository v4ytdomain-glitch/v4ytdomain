import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Form, HTTPException, Query, Request
from sqlalchemy import func, select, and_, or_, case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased
from app.db import get_db
from app.models.entities import (User, PlayerProfile, RefreshToken, PasswordResetToken, Game, Team, TeamMembership, TeamInvite, Tournament, TournamentRegistration, TournamentResult, TournamentRound, TournamentBracketMatch, PointTransaction, Achievement, AchievementAward, HallOfFameEntry, Reward, RewardRedemption, Notification, Announcement, Video, AuditLog)
from app.schemas.api import *
from app.core.security import (hash_password, verify_password, make_access_token, make_refresh_token, hash_refresh_token, current_user, require_roles, auth_rate_limit)
from app.core.config import get_settings
from app.services.email import get_email_provider

router = APIRouter()
TOURNAMENT_PLACEMENT_POINTS = {1: 500, 2: 300, 3: 200}
admin_user = require_roles("admin")
moderator_user = require_roles("admin", "moderator")

def uid(value: str):
    try: return uuid.UUID(value)
    except (ValueError, TypeError): raise HTTPException(422, "Invalid identifier")

def page(items, total, limit, offset):
    return {"items": items, "total": total, "limit": limit, "offset": offset}

async def issue_tokens(db: AsyncSession, user: User):
    refresh = make_refresh_token()
    db.add(RefreshToken(user_id=user.id, token_hash=hash_refresh_token(refresh), expires_at=datetime.now(timezone.utc)+timedelta(days=get_settings().refresh_token_days)))
    await db.commit()
    return {"access_token": make_access_token(user), "refresh_token": refresh, "token_type":"bearer"}

async def points_balance(db: AsyncSession, user_id):
    return int(await db.scalar(select(func.coalesce(func.sum(PointTransaction.amount), 0)).where(PointTransaction.user_id == user_id)) or 0)

async def audit(db, actor, action, entity, entity_id, before=None, after=None, request=None):
    db.add(AuditLog(actor_id=actor.id if actor else None, action=action, entity_type=entity, entity_id=entity_id,
                    before_data=before, after_data=after, ip_address=request.client.host if request and request.client else None))

@router.post("/auth/register", status_code=201)
async def register(data: RegisterInput, request: Request, db: AsyncSession = Depends(get_db)):
    auth_rate_limit(request)
    exists = await db.scalar(select(User.id).where(or_(func.lower(User.username)==data.username.lower(), func.lower(User.email)==str(data.email).lower())))
    if exists: raise HTTPException(409, detail={"code":"account_exists", "message":"Email or username is already registered"})
    user = User(username=data.username, email=str(data.email).lower(), password_hash=hash_password(data.password))
    db.add(user); await db.flush()
    db.add(PlayerProfile(user_id=user.id, gamer_tag=data.username))
    await db.commit()
    return {"id":str(user.id), "username":user.username, "email":user.email}

@router.post("/auth/token", response_model=TokenOutput, description="OAuth2 password form login.")
@router.post("/auth/login", response_model=TokenOutput, include_in_schema=False)
async def login(request: Request, username: str = Form(...), password: str = Form(...), db: AsyncSession = Depends(get_db)):
    auth_rate_limit(request)
    user = await db.scalar(select(User).where(func.lower(User.username)==username.lower(), User.status=="active"))
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(401, detail={"code":"invalid_credentials", "message":"Incorrect username or password"})
    return await issue_tokens(db, user)

@router.post("/auth/refresh", response_model=TokenOutput)
async def refresh(data: dict, request:Request, db: AsyncSession = Depends(get_db)):
    auth_rate_limit(request)
    raw = data.get("refresh_token", "")
    record = await db.scalar(select(RefreshToken).where(RefreshToken.token_hash==hash_refresh_token(raw), RefreshToken.revoked_at.is_(None)))
    if not record or record.expires_at <= datetime.now(timezone.utc): raise HTTPException(401, "Invalid refresh token")
    record.revoked_at = datetime.now(timezone.utc)
    user = await db.get(User, record.user_id)
    if not user or user.status != "active": raise HTTPException(401, "Invalid user")
    return await issue_tokens(db, user)

@router.post("/auth/logout")
async def logout(data: dict, request:Request, db: AsyncSession = Depends(get_db)):
    auth_rate_limit(request)
    raw = data.get("refresh_token", "")
    token = await db.scalar(select(RefreshToken).where(RefreshToken.token_hash==hash_refresh_token(raw), RefreshToken.revoked_at.is_(None)))
    if token: token.revoked_at = datetime.now(timezone.utc); await db.commit()
    return {"ok":True}

def private_user(user: User, profile: PlayerProfile | None, points=0):
    return {"id":str(user.id), "username":user.username, "email":user.email, "role":user.role,
            "avatar": (profile.gamer_tag[:2].upper() if profile else user.username[:2].upper()), "avatar_url":profile.avatar_url if profile else None,
            "bio":profile.bio if profile else "", "country":profile.country if profile else None, "points":points}

def public_player(user: User, profile: PlayerProfile | None, points=0):
    return {"id":str(user.id),"username":user.username,"avatar":profile.gamer_tag[:2].upper() if profile else user.username[:2].upper(),
            "avatar_url":profile.avatar_url if profile else None,"bio":profile.bio if profile else "","country":profile.country if profile else None,"points":points}

@router.get("/auth/me")
async def me(user: User=Depends(current_user), db: AsyncSession=Depends(get_db)):
    p=await db.scalar(select(PlayerProfile).where(PlayerProfile.user_id==user.id))
    stats=await player_detail(str(user.id),db)
    return {**private_user(user,p,stats["points"]),**stats,"email":user.email,"role":user.role,"is_admin":user.role=="admin","win_rate":stats["winRate"]}

@router.put("/auth/me")
async def update_me(data: ProfileUpdate, user: User=Depends(current_user), db: AsyncSession=Depends(get_db)):
    p=await db.scalar(select(PlayerProfile).where(PlayerProfile.user_id==user.id))
    if data.username and data.username != user.username:
        if await db.scalar(select(User.id).where(User.username==data.username)): raise HTTPException(409,"Username already taken")
        user.username=data.username; p.gamer_tag=data.username
    for key in ("bio","avatar_url","country","socials"):
        val=getattr(data,key)
        if val is not None: setattr(p,key,val)
    await db.commit()
    return await me(user,db)

@router.post("/auth/password/change")
async def change_password(data: dict,user:User=Depends(current_user),db:AsyncSession=Depends(get_db)):
    if not verify_password(data.get("current_password",""),user.password_hash): raise HTTPException(400,"Current password is incorrect")
    new=data.get("new_password","")
    if len(new)<8: raise HTTPException(422,"Password must be at least 8 characters")
    user.password_hash=hash_password(new)
    tokens=(await db.scalars(select(RefreshToken).where(RefreshToken.user_id==user.id,RefreshToken.revoked_at.is_(None)))).all()
    for token in tokens: token.revoked_at=datetime.now(timezone.utc)
    await db.commit(); return {"ok":True}

@router.post("/auth/password/reset/request")
async def reset_request(data: dict,request:Request,db:AsyncSession=Depends(get_db)):
    auth_rate_limit(request)
    user=await db.scalar(select(User).where(func.lower(User.email)==str(data.get("email","")).lower()))
    if user:
        raw=make_refresh_token()
        db.add(PasswordResetToken(user_id=user.id,token_hash=hash_refresh_token(raw),expires_at=datetime.now(timezone.utc)+timedelta(hours=1)))
        await db.commit()
        await get_email_provider().send_password_reset(user.email,raw)
    return {"message":"If the account exists, reset instructions will be sent."}

@router.post("/auth/password/reset/confirm")
async def reset_confirm(data:dict,request:Request,db:AsyncSession=Depends(get_db)):
    auth_rate_limit(request)
    raw=data.get("token",""); new_password=data.get("new_password","")
    if len(new_password)<8: raise HTTPException(422,"Password must be at least 8 characters")
    record=await db.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash==hash_refresh_token(raw),PasswordResetToken.used_at.is_(None)).with_for_update())
    if not record or record.expires_at<=datetime.now(timezone.utc): raise HTTPException(400,"Reset token is invalid or expired")
    user=await db.get(User,record.user_id)
    if not user: raise HTTPException(400,"Reset token is invalid or expired")
    record.used_at=datetime.now(timezone.utc); user.password_hash=hash_password(new_password)
    refresh=(await db.scalars(select(RefreshToken).where(RefreshToken.user_id==user.id,RefreshToken.revoked_at.is_(None)))).all()
    for token in refresh: token.revoked_at=datetime.now(timezone.utc)
    await db.commit(); return {"ok":True}

@router.get("/players/")
async def players(limit:int=Query(50,ge=1,le=100),offset:int=Query(0,ge=0),q:str|None=None,db:AsyncSession=Depends(get_db)):
    query=select(User,PlayerProfile).join(PlayerProfile,PlayerProfile.user_id==User.id).where(User.status=="active")
    if q: query=query.where(or_(User.username.ilike(f"%{q}%"),PlayerProfile.gamer_tag.ilike(f"%{q}%")))
    total=await db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows=(await db.execute(query.order_by(User.created_at).limit(limit).offset(offset))).all()
    output=[]
    for u,p in rows:
        pts=await points_balance(db,u.id)
        output.append({**public_player(u,p,pts),"level":max(1,pts//1000+1),"xp":pts,"rank":len(output)+offset+1,"wins":await db.scalar(select(func.count()).select_from(TournamentResult).where(TournamentResult.user_id==u.id,TournamentResult.placement==1)) or 0,"tier":tier(pts),"winRate":0,"tournaments":await db.scalar(select(func.count()).select_from(TournamentRegistration).where(TournamentRegistration.user_id==u.id,TournamentRegistration.status=="registered")) or 0,"streak":0})
    return page(output,total,limit,offset)

def tier(points):
    return "legend" if points>=13000 else "master" if points>=11000 else "diamond" if points>=8000 else "platinum" if points>=5000 else "gold" if points>=2500 else "silver" if points>=1000 else "bronze"

@router.get("/players/compare")
async def compare(ids:str,db:AsyncSession=Depends(get_db)):
    return {"items":[await player_detail(x,db) for x in ids.split(",")[:2]]}

@router.get("/players/{player_id}/stats")
async def player_stats(player_id:str,db:AsyncSession=Depends(get_db)):
    data=await player_detail(player_id,db)
    return {"points":data["points"],"wins":data["wins"],"tournaments":data["tournaments"],"winRate":data["winRate"]}

@router.get("/players/{player_id}/points")
async def player_points(player_id:str,db:AsyncSession=Depends(get_db)):
    rows=(await db.scalars(select(PointTransaction).where(PointTransaction.user_id==uid(player_id)).order_by(PointTransaction.created_at.desc()).limit(50))).all()
    return {"items":[{"id":str(x.id),"action":x.reason,"event":x.source,"points":x.amount,"date":x.created_at.isoformat(),"type":"gain" if x.amount>=0 else "loss"} for x in rows]}

@router.get("/players/{player_id}/results")
async def player_results(player_id:str,db:AsyncSession=Depends(get_db)):
    rows=(await db.execute(select(TournamentResult,Tournament).join(Tournament).where(TournamentResult.user_id==uid(player_id),Tournament.status!="cancelled").order_by(Tournament.starts_at.desc()).limit(20))).all()
    return {"items":[{"tournament":t.title,"placement":r.placement,"score":r.score,"date":t.starts_at.isoformat()} for r,t in rows]}

async def player_detail(player_id,db):
    u=await db.get(User,uid(player_id)); p=await db.scalar(select(PlayerProfile).where(PlayerProfile.user_id==uid(player_id)))
    if not u or not p or u.status!="active": raise HTTPException(404,"Player not found")
    pts=await points_balance(db,u.id); wins=await db.scalar(select(func.count()).select_from(TournamentResult).where(TournamentResult.user_id==u.id,TournamentResult.placement==1)) or 0
    total=await db.scalar(select(func.count()).select_from(TournamentRegistration).where(TournamentRegistration.user_id==u.id,TournamentRegistration.status=="registered")) or 0
    return {**public_player(u,p,pts),"level":max(1,pts//1000+1),"xp":pts,"rank":None,"wins":wins,"tier":tier(pts),"winRate":round(wins*100/total) if total else 0,"tournaments":total,"streak":0}

@router.get("/players/{player_id}")
async def player_get(player_id:str,db:AsyncSession=Depends(get_db)): return await player_detail(player_id,db)

@router.get("/tournaments/")
async def tournaments(limit:int=Query(50,ge=1,le=100),offset:int=Query(0,ge=0),status_filter:str|None=Query(None,alias="status"),db:AsyncSession=Depends(get_db)):
    await db.execute(Tournament.__table__.update().where(Tournament.status=="open",Tournament.registration_closes_at<=datetime.now(timezone.utc)).values(status="closed"))
    await db.commit()
    query=select(Tournament,Game).join(Game)
    if status_filter: query=query.where(Tournament.status==status_filter)
    else: query=query.where(Tournament.status!="cancelled")
    total=await db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows=(await db.execute(query.order_by(Tournament.starts_at.desc()).limit(limit).offset(offset))).all()
    items=[]
    for t,g in rows:
        count=await db.scalar(select(func.count()).select_from(TournamentRegistration).where(TournamentRegistration.tournament_id==t.id,TournamentRegistration.status=="registered")) or 0
        items.append({"id":str(t.id),"name":t.title,"game":g.name,"date":t.starts_at.strftime("%b %d, %Y").replace(" 0"," "),"time":t.starts_at.strftime("%I:%M %p UTC").lstrip("0"),"players":count,"maxPlayers":t.capacity,"prize":t.prize_pool,"status":t.status,"image":t.image_url,"description":t.description,"rules":t.rules,"team_mode":t.team_mode,"entry_cost":t.entry_cost,"starts_at":t.starts_at.isoformat(),"registration_closes_at":t.registration_closes_at.isoformat()})
    return page(items,total,limit,offset)

@router.get("/tournaments/results")
async def all_results(db:AsyncSession=Depends(get_db)):
    rows=(await db.execute(select(TournamentResult,Tournament).join(Tournament).where(Tournament.status!="cancelled").order_by(Tournament.starts_at.desc(),TournamentResult.placement))).all()
    grouped={}
    for result,tournament in rows:
        item=grouped.setdefault(str(tournament.id),{"id":str(tournament.id),"tournament_id":str(tournament.id),"first_place_id":None,"second_place_id":None,"third_place_id":None})
        if result.placement==1: item["first_place_id"]=str(result.user_id)
        elif result.placement==2: item["second_place_id"]=str(result.user_id)
        elif result.placement==3: item["third_place_id"]=str(result.user_id)
    return {"items":list(grouped.values())}

@router.get("/tournaments/{tournament_id}")
async def tournament_detail(tournament_id:str,db:AsyncSession=Depends(get_db)):
    t=await db.get(Tournament,uid(tournament_id))
    if not t: raise HTTPException(404,"Tournament not found")
    return next((x for x in (await tournaments(limit=100,offset=0,status_filter=None,db=db))["items"] if x["id"]==str(t.id)),None)

@router.post("/tournaments/{tournament_id}/register",status_code=201)
async def tournament_register(tournament_id:str,data:RegistrationInput,user:User=Depends(current_user),db:AsyncSession=Depends(get_db)):
    t=await db.scalar(select(Tournament).where(Tournament.id==uid(tournament_id)).with_for_update())
    now=datetime.now(timezone.utc)
    if not t: raise HTTPException(404,"Tournament not found")
    if t.status=="open" and now>=t.registration_closes_at:
        t.status="closed"; await db.commit()
        raise HTTPException(409,"Registration is closed")
    if t.status!="open" or now<t.registration_opens_at: raise HTTPException(409,"Registration is closed")
    existing=await db.scalar(select(TournamentRegistration).where(TournamentRegistration.tournament_id==t.id,TournamentRegistration.user_id==user.id).with_for_update())
    if existing and existing.status=="registered": raise HTTPException(409,"Already registered")
    count=await db.scalar(select(func.count()).select_from(TournamentRegistration).where(TournamentRegistration.tournament_id==t.id,TournamentRegistration.status=="registered")) or 0
    if count>=t.capacity: raise HTTPException(409,"Tournament is full")
    team_id=uid(data.team_id) if data.team_id else None
    if t.team_mode and not team_id: raise HTTPException(422,"Select a team")
    if team_id:
        membership=await db.scalar(select(TeamMembership.id).where(TeamMembership.team_id==team_id,TeamMembership.user_id==user.id,TeamMembership.status=="active"))
        if not membership: raise HTTPException(403,"You must belong to the selected team")
    if t.entry_cost:
        bal=await points_balance(db,user.id)
        if bal<t.entry_cost: raise HTTPException(409,"Insufficient points")
        db.add(PointTransaction(user_id=user.id,amount=-t.entry_cost,type="debit",reason=f"Tournament entry: {t.title}",source="tournament",reference_id=t.id))
    if existing:
        reg=existing; reg.status="registered"; reg.cancelled_at=None; reg.team_id=team_id; reg.game_uid=data.game_uid; reg.in_game_name=data.in_game_name
    else:
        reg=TournamentRegistration(tournament_id=t.id,user_id=user.id,team_id=team_id,game_uid=data.game_uid,in_game_name=data.in_game_name); db.add(reg)
    await db.commit(); return {"id":str(reg.id),"status":reg.status}

@router.delete("/tournaments/{tournament_id}/register")
async def withdraw(tournament_id:str,user:User=Depends(current_user),db:AsyncSession=Depends(get_db)):
    t=await db.scalar(select(Tournament).where(Tournament.id==uid(tournament_id)).with_for_update())
    if not t or datetime.now(timezone.utc)>=t.registration_closes_at: raise HTTPException(409,"Withdrawal window is closed")
    reg=await db.scalar(select(TournamentRegistration).where(TournamentRegistration.tournament_id==t.id,TournamentRegistration.user_id==user.id,TournamentRegistration.status=="registered"))
    if not reg: raise HTTPException(404,"Registration not found")
    reg.status="withdrawn"; reg.cancelled_at=datetime.now(timezone.utc)
    if t.entry_cost: db.add(PointTransaction(user_id=user.id,amount=t.entry_cost,type="refund",reason=f"Tournament withdrawal: {t.title}",source="tournament",reference_id=t.id))
    await db.commit(); return {"status":"withdrawn"}

@router.get("/tournaments/{tournament_id}/participants")
async def participants(tournament_id:str,db:AsyncSession=Depends(get_db)):
    rows=(await db.execute(select(User,PlayerProfile).join(TournamentRegistration,TournamentRegistration.user_id==User.id).join(PlayerProfile,PlayerProfile.user_id==User.id).where(TournamentRegistration.tournament_id==uid(tournament_id),TournamentRegistration.status=="registered"))).all()
    return {"items":[{ "id":str(u.id),"username":u.username,"avatar":p.gamer_tag[:2]} for u,p in rows]}

@router.get("/tournaments/{tournament_id}/my-registration")
async def my_tournament_registration(tournament_id:str,user:User=Depends(current_user),db:AsyncSession=Depends(get_db)):
    tournament=await db.get(Tournament,uid(tournament_id))
    if not tournament: raise HTTPException(404,"Tournament not found")
    registration=await db.scalar(select(TournamentRegistration).where(TournamentRegistration.tournament_id==tournament.id,TournamentRegistration.user_id==user.id))
    return {"status":registration.status if registration else None}

@router.get("/tournaments/{tournament_id}/teams/leaderboard")
async def tournament_team_leaderboard(tournament_id:str,limit:int=Query(10,ge=1,le=100),offset:int=Query(0,ge=0),db:AsyncSession=Depends(get_db)):
    tournament=await db.get(Tournament,uid(tournament_id))
    if not tournament: raise HTTPException(404,"Tournament not found")
    user_points=select(PointTransaction.user_id.label("user_id"),func.sum(PointTransaction.amount).label("points")).group_by(PointTransaction.user_id).subquery()
    active_count=func.count(TournamentRegistration.id).filter(TournamentRegistration.status=="registered")
    withdrawn_count=func.count(TournamentRegistration.id).filter(TournamentRegistration.status=="withdrawn")
    team_points=func.coalesce(func.sum(case((TournamentRegistration.status=="registered",func.coalesce(user_points.c.points,0)),else_=0)),0)
    registered_members=func.count(func.distinct(case((TournamentRegistration.status=="registered",TournamentRegistration.user_id),else_=None)))
    status=case((active_count>0,"registered"),(withdrawn_count>0,"withdrawn"),else_="cancelled").label("status")
    summary=select(TournamentRegistration.team_id.label("team_id"),team_points.label("points"),registered_members.label("members"),status).outerjoin(user_points,user_points.c.user_id==TournamentRegistration.user_id).where(TournamentRegistration.tournament_id==tournament.id,TournamentRegistration.team_id.is_not(None)).group_by(TournamentRegistration.team_id).subquery()
    rank=func.rank().over(order_by=(summary.c.points.desc(),Team.name.asc(),Team.id.asc())).label("rank")
    query=select(Team.id,Team.name,summary.c.status,summary.c.points,summary.c.members,rank).join(summary,summary.c.team_id==Team.id)
    total=await db.scalar(select(func.count()).select_from(summary)) or 0
    rows=(await db.execute(query.order_by(rank).limit(limit).offset(offset))).all()
    items=[{"id":str(row.id),"team_name":row.name,"name":row.name,"status":row.status,"points":int(row.points or 0),"members":int(row.members or 0),"rank":int(row.rank)} for row in rows]
    return page(items,total,limit,offset)

@router.get("/tournaments/{tournament_id}/bracket")
async def tournament_bracket(tournament_id:str,db:AsyncSession=Depends(get_db)):
    tournament=await db.get(Tournament,uid(tournament_id))
    if not tournament: raise HTTPException(404,"Tournament not found")
    rounds=(await db.scalars(select(TournamentRound).where(TournamentRound.tournament_id==tournament.id).order_by(TournamentRound.sequence))).all()
    team1=aliased(Team); team2=aliased(Team); winner=aliased(Team)
    output=[]
    for r in rounds:
        rows=(await db.execute(select(TournamentBracketMatch,team1.name,team2.name,winner.name).outerjoin(team1,team1.id==TournamentBracketMatch.team1_id).outerjoin(team2,team2.id==TournamentBracketMatch.team2_id).outerjoin(winner,winner.id==TournamentBracketMatch.winner_team_id).where(TournamentBracketMatch.round_id==r.id).order_by(TournamentBracketMatch.match_number))).all()
        output.append({"id":str(r.id),"name":r.name,"round":r.sequence,"matches":[{"id":str(m.id),"match_number":m.match_number,"team1_id":str(m.team1_id) if m.team1_id else None,"team1_name":n1,"team2_id":str(m.team2_id) if m.team2_id else None,"team2_name":n2,"score1":m.score1,"score2":m.score2,"winner_team_id":str(m.winner_team_id) if m.winner_team_id else None,"winner_name":nw,"status":m.status,"is_bye":m.status=="bye"} for m,n1,n2,nw in rows]})
    return {"tournament_id":str(tournament.id),"rounds":output}

@router.get("/tournaments/{tournament_id}/results")
async def tournament_results(tournament_id:str,db:AsyncSession=Depends(get_db)):
    rows=(await db.execute(select(TournamentResult,User).join(User).where(TournamentResult.tournament_id==uid(tournament_id)).order_by(TournamentResult.placement,User.username))).all()
    return {"items":[{"user_id":str(u.id),"username":u.username,"placement":r.placement,"score":r.score,"tie_break_info":r.tie_break_info} for r,u in rows]}

@router.post("/admin/tournaments/{tournament_id}/bracket/generate",status_code=201)
async def generate_team_bracket(tournament_id:str,data:TeamBracketGenerateInput,request:Request,actor:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    tournament=await db.scalar(select(Tournament).where(Tournament.id==uid(tournament_id)).with_for_update())
    if not tournament: raise HTTPException(404,"Tournament not found")
    if not tournament.team_mode: raise HTTPException(409,"A team bracket requires a team tournament")
    if tournament.status in ("completed","cancelled"): raise HTTPException(409,"Bracket cannot be changed for a completed or cancelled tournament")
    team_ids=[uid(x) for x in data.team_ids]
    if len(set(team_ids))!=len(team_ids): raise HTTPException(422,"Each team can appear only once")
    registered=set((await db.scalars(select(TournamentRegistration.team_id).where(TournamentRegistration.tournament_id==tournament.id,TournamentRegistration.status=="registered",TournamentRegistration.team_id.is_not(None)).distinct())).all())
    if not set(team_ids).issubset(registered): raise HTTPException(422,"Every bracket team must have an active registration in this tournament")
    existing=(await db.scalars(select(TournamentRound).where(TournamentRound.tournament_id==tournament.id))).all()
    if existing:
        completed=await db.scalar(select(TournamentBracketMatch.id).join(TournamentRound,TournamentRound.id==TournamentBracketMatch.round_id).where(TournamentRound.tournament_id==tournament.id,TournamentBracketMatch.status=="completed").limit(1))
        if completed: raise HTTPException(409,"A bracket with completed matches cannot be regenerated")
        for old_round in existing: await db.delete(old_round)
        await db.flush()
    if len(team_ids)<2: raise HTTPException(422,"At least two registered teams are required")
    slots=1
    while slots<len(team_ids): slots*=2
    round_count=slots.bit_length()-1
    rounds=[]
    for sequence in range(1,round_count+1):
        name="Final" if sequence==round_count else f"Round {sequence}"
        bracket_round=TournamentRound(tournament_id=tournament.id,name=name,sequence=sequence)
        db.add(bracket_round); rounds.append(bracket_round)
    await db.flush()
    byes=slots-len(team_ids)
    remaining=team_ids[byes:]
    pairings=[(team_ids[i],None) for i in range(byes)]
    pairings.extend((remaining[i],remaining[i+1]) for i in range(0,len(remaining),2))
    matches={}
    for number,(one,two) in enumerate(pairings,1):
        row=TournamentBracketMatch(round_id=rounds[0].id,match_number=number,team1_id=one,team2_id=two,winner_team_id=one if two is None else None,status="bye" if two is None else "scheduled")
        db.add(row); matches[(1,number)]=row
    for sequence in range(2,round_count+1):
        count=slots//(2**sequence)
        for number in range(1,count+1):
            row=TournamentBracketMatch(round_id=rounds[sequence-1].id,match_number=number)
            db.add(row); matches[(sequence,number)]=row
    await db.flush()
    for number,(one,two) in enumerate(pairings,1):
        if two is None and round_count>1:
            downstream=matches[(2,(number+1)//2)]
            if number%2: downstream.team1_id=one
            else: downstream.team2_id=one
    await audit(db,actor,"generate_team_bracket","tournament",tournament.id,after={"team_ids":[str(x) for x in team_ids],"rounds":round_count},request=request)
    await db.commit()
    return await tournament_bracket(tournament_id,db)

@router.post("/admin/tournaments/{tournament_id}/bracket/matches/{match_id}/result")
async def set_team_bracket_result(tournament_id:str,match_id:str,data:TeamBracketResultInput,request:Request,actor:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    tournament=await db.scalar(select(Tournament).where(Tournament.id==uid(tournament_id)).with_for_update())
    if not tournament: raise HTTPException(404,"Tournament not found")
    if tournament.status in ("completed","cancelled"): raise HTTPException(409,"Tournament is already closed")
    match=await db.scalar(select(TournamentBracketMatch).join(TournamentRound,TournamentRound.id==TournamentBracketMatch.round_id).where(TournamentRound.tournament_id==tournament.id,TournamentBracketMatch.id==uid(match_id)).with_for_update())
    if not match: raise HTTPException(404,"Bracket match not found")
    if match.status=="bye" or not match.team1_id or not match.team2_id: raise HTTPException(409,"This bracket slot is a bye and cannot receive a match result")
    winner_id=uid(data.winner_team_id)
    if winner_id not in (match.team1_id,match.team2_id): raise HTTPException(422,"Winner must be one of the teams in this match")
    if data.score1==data.score2 or (winner_id==match.team1_id and data.score1<data.score2) or (winner_id==match.team2_id and data.score2<data.score1):
        raise HTTPException(422,"The selected winner must have the higher score")
    bracket_round=await db.get(TournamentRound,match.round_id)
    rounds=(await db.scalars(select(TournamentRound).where(TournamentRound.tournament_id==tournament.id).order_by(TournamentRound.sequence))).all()
    previous_winner=match.winner_team_id
    if bracket_round.sequence<len(rounds):
        next_round=rounds[bracket_round.sequence]
        next_number=(match.match_number+1)//2
        next_match=await db.scalar(select(TournamentBracketMatch).where(TournamentBracketMatch.round_id==next_round.id,TournamentBracketMatch.match_number==next_number).with_for_update())
        if next_match and next_match.status=="completed" and previous_winner!=winner_id:
            raise HTTPException(409,"A downstream match is already complete; reset the bracket before correcting this result")
        if next_match:
            if match.match_number%2: next_match.team1_id=winner_id
            else: next_match.team2_id=winner_id
    match.winner_team_id=winner_id; match.score1=data.score1; match.score2=data.score2; match.status="completed"
    await audit(db,actor,"record_team_match_result","bracket_match",match.id,after={"winner_team_id":str(winner_id),"score1":data.score1,"score2":data.score2},request=request)
    if bracket_round.sequence==len(rounds):
        placements={winner_id:1,match.team2_id if winner_id==match.team1_id else match.team1_id:2}
        all_matches=(await db.execute(select(TournamentBracketMatch,TournamentRound.sequence).join(TournamentRound,TournamentRound.id==TournamentBracketMatch.round_id).where(TournamentRound.tournament_id==tournament.id))).all()
        slots=2**len(rounds)
        for prior,sequence in all_matches:
            if prior.status!="completed" or not prior.winner_team_id: continue
            loser=prior.team2_id if prior.winner_team_id==prior.team1_id else prior.team1_id
            if loser and loser not in placements: placements[loser]=slots//(2**sequence)+1
        registrations=(await db.scalars(select(TournamentRegistration).where(TournamentRegistration.tournament_id==tournament.id,TournamentRegistration.status=="registered",TournamentRegistration.team_id.in_(list(placements))))).all()
        previous_status=tournament.status
        for registration in registrations:
            placement=placements[registration.team_id]
            amount=TOURNAMENT_PLACEMENT_POINTS.get(placement,100)+50
            db.add(TournamentResult(tournament_id=tournament.id,user_id=registration.user_id,placement=placement,score=0,tie_break_info={"team_id":str(registration.team_id)}))
            db.add(PointTransaction(user_id=registration.user_id,amount=amount,type="award",reason=f"Team tournament placement {placement}: {tournament.title}",source="tournament",created_by=actor.id,reference_id=tournament.id))
            db.add(Notification(user_id=registration.user_id,type="tournament_result",payload={"text":f"Team results posted for {tournament.title}","sub":f"Team placement {placement} · +{amount} points","icon":"🏆"}))
            if placement<=3:
                if not await db.scalar(select(HallOfFameEntry.id).where(HallOfFameEntry.tournament_id==tournament.id,HallOfFameEntry.user_id==registration.user_id)):
                    db.add(HallOfFameEntry(tournament_id=tournament.id,user_id=registration.user_id,placement=placement))
        tournament.status="completed"
        await audit(db,actor,"complete_team_tournament","tournament",tournament.id,before={"status":previous_status},after={"status":"completed","team_placements":{str(k):v for k,v in placements.items()}},request=request)
    await db.commit()
    return {"status":"completed" if tournament.status=="completed" else match.status,"winner_team_id":str(winner_id)}

@router.get("/leaderboard")
@router.get("/leaderboard/{period}")
async def leaderboard(period:str="all-time",limit:int=50,offset:int=0,game_id:str|None=None,db:AsyncSession=Depends(get_db)):
    if period not in ("all-time","monthly","game","team"): raise HTTPException(422,"Unsupported leaderboard")
    if period=="team":
        member_points=select(PointTransaction.user_id.label("user_id"),func.sum(PointTransaction.amount).label("points"),func.min(PointTransaction.created_at).label("first_point")).group_by(PointTransaction.user_id).subquery()
        member_wins=select(TournamentResult.user_id.label("user_id"),func.count(TournamentResult.id).label("wins")).join(Tournament,Tournament.id==TournamentResult.tournament_id).where(TournamentResult.placement==1,Tournament.status!="cancelled").group_by(TournamentResult.user_id).subquery()
        total_points=func.sum(func.coalesce(member_points.c.points,0)); total_wins=func.sum(func.coalesce(member_wins.c.wins,0))
        rank=func.rank().over(order_by=(total_points.desc(),total_wins.desc(),func.min(member_points.c.first_point).asc().nulls_last(),Team.id.asc())).label("rank")
        query=select(Team.id,Team.name,total_points,total_wins,rank).join(TeamMembership,TeamMembership.team_id==Team.id).join(User,User.id==TeamMembership.user_id).outerjoin(member_points,member_points.c.user_id==User.id).outerjoin(member_wins,member_wins.c.user_id==User.id).where(Team.disbanded_at.is_(None),TeamMembership.status=="active").group_by(Team.id,Team.name)
        rows=(await db.execute(query.order_by(rank).limit(min(limit,100)).offset(offset))).all()
        return page([{"id":str(r.id),"name":r.name,"rank":int(r.rank),"points":int(r[2] or 0),"wins":int(r[3] or 0)} for r in rows],len(rows),limit,offset)
    point_filter=[]
    if period=="monthly":
        current=datetime.now(timezone.utc); month_start=current.replace(day=1,hour=0,minute=0,second=0,microsecond=0)
        point_filter.append(PointTransaction.created_at>=month_start)
    if period=="game" and not game_id:
        first_game=await db.scalar(select(Game.id).where(Game.active.is_(True)).order_by(Game.name).limit(1))
        game_id=str(first_game) if first_game else None
    point_query=select(PointTransaction.user_id.label("user_id"),func.coalesce(func.sum(PointTransaction.amount),0).label("points"),func.min(PointTransaction.created_at).label("first_point"))
    wins_query=select(TournamentResult.user_id.label("user_id"),func.count(TournamentResult.id).label("wins")).join(Tournament,Tournament.id==TournamentResult.tournament_id).where(TournamentResult.placement==1,Tournament.status!="cancelled")
    if period=="game" and game_id:
        point_query=point_query.join(Tournament,Tournament.id==PointTransaction.reference_id).where(Tournament.game_id==uid(game_id),PointTransaction.source=="tournament")
        wins_query=wins_query.where(Tournament.game_id==uid(game_id))
    point_rows=point_query.where(*point_filter).group_by(PointTransaction.user_id).subquery()
    win_rows=wins_query.group_by(TournamentResult.user_id).subquery()
    points=func.coalesce(point_rows.c.points,0); wins=func.coalesce(win_rows.c.wins,0)
    rank=func.rank().over(order_by=(points.desc(),wins.desc(),point_rows.c.first_point.asc().nulls_last(),User.id.asc())).label("rank")
    query=select(User,PlayerProfile,points,wins,rank).join(PlayerProfile,User.id==PlayerProfile.user_id).outerjoin(point_rows,point_rows.c.user_id==User.id).outerjoin(win_rows,win_rows.c.user_id==User.id).where(User.status=="active")
    rows=(await db.execute(query.order_by(rank).limit(min(limit,100)).offset(offset))).all()
    output=[{"rank":int(rnk),"username":u.username,"points":int(pts),"wins":int(w),"avatar":p.gamer_tag[:2].upper(),"tier":tier(int(pts)),"id":str(u.id)} for u,p,pts,w,rnk in rows]
    total=await db.scalar(select(func.count()).select_from(User).where(User.status=="active")) or 0
    return page(output,total,limit,offset)

async def hall_entries(db):
    rows=(await db.execute(select(HallOfFameEntry,Tournament,User).join(Tournament).join(User).where(Tournament.status!="cancelled").order_by(Tournament.starts_at.desc(),HallOfFameEntry.placement))).all()
    return {"items":[{"year":t.starts_at.strftime("%Y"),"tournament":t.title,"champion":u.username,"placement":h.placement,"date":t.starts_at.isoformat(),"avatar":u.username[:2]} for h,t,u in rows]}

@router.get("/hall-of-fame/")
async def hall_of_fame(db:AsyncSession=Depends(get_db)): return await hall_entries(db)

@router.get("/achievements/")
async def achievements(limit:int=Query(100,ge=1,le=100),offset:int=Query(0,ge=0),db:AsyncSession=Depends(get_db)):
    query=select(Achievement).where(Achievement.active.is_(True)).order_by(Achievement.name)
    total=await db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows=(await db.scalars(query.limit(limit).offset(offset))).all()
    return page([{"id":str(a.id),"name":a.name,"icon":a.icon,"desc":a.description,"description":a.description,"category":a.category,"points":a.points} for a in rows],total,limit,offset)

@router.get("/admin/achievements")
async def admin_achievements(user:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    return await achievements(limit=100,offset=0,db=db)

@router.get("/achievements/user/{user_id}")
async def user_achievements(user_id:str,db:AsyncSession=Depends(get_db)):
    rows=(await db.execute(select(Achievement,Award.awarded_at) if False else select(Achievement,AchievementAward.awarded_at).join(AchievementAward,AchievementAward.achievement_id==Achievement.id).where(AchievementAward.user_id==uid(user_id)))).all()
    return {"items":[{"id":str(a.id),"name":a.name,"icon":a.icon,"desc":a.description,"category":a.category,"unlocked":True,"awarded_at":dt.isoformat()} for a,dt in rows]}

@router.post("/achievements/",status_code=201)
@router.post("/admin/achievements",status_code=201,include_in_schema=False)
async def achievement_create(data:AchievementInput,request:Request,user:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    a=Achievement(name=data.name,description=data.description or data.desc or "",icon=data.icon,category=data.category,points=data.points)
    db.add(a); await db.flush(); await audit(db,user,"create","achievement",a.id,after={"name":a.name},request=request); await db.commit()
    return {"id":str(a.id),"name":a.name,"icon":a.icon,"desc":a.description,"category":a.category}

@router.post("/achievements/award")
async def achievement_award(user_id:str,achievement_id:str,request:Request,actor:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    a=await db.get(Achievement,uid(achievement_id)); u=await db.get(User,uid(user_id))
    if not a or not u: raise HTTPException(404,"User or achievement not found")
    existing=await db.scalar(select(AchievementAward.id).where(AchievementAward.user_id==u.id,AchievementAward.achievement_id==a.id))
    if existing: raise HTTPException(409,"Achievement already awarded")
    db.add(AchievementAward(user_id=u.id,achievement_id=a.id))
    if a.points: db.add(PointTransaction(user_id=u.id,amount=a.points,type="award",reason=f"Achievement: {a.name}",source="achievement",created_by=actor.id,reference_id=a.id))
    await audit(db,actor,"award","achievement",a.id,after={"user_id":str(u.id)},request=request); await db.commit(); return {"ok":True}

@router.get("/rewards/")
async def rewards(limit:int=Query(100,ge=1,le=100),offset:int=Query(0,ge=0),db:AsyncSession=Depends(get_db)):
    query=select(Reward).where(Reward.active.is_(True)).order_by(Reward.cost)
    total=await db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows=(await db.scalars(query.limit(limit).offset(offset))).all()
    return page([{"id":str(r.id),"name":r.name,"cost":r.cost,"desc":r.description,"icon":r.icon,"available":r.stock is None or r.stock>0,"stock":r.stock} for r in rows],total,limit,offset)

@router.get("/admin/rewards")
async def admin_rewards(user:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    return await rewards(limit=100,offset=0,db=db)

@router.post("/rewards/{reward_id}/redeem",status_code=201)
async def redeem(reward_id:str,user:User=Depends(current_user),db:AsyncSession=Depends(get_db)):
    reward=await db.scalar(select(Reward).where(Reward.id==uid(reward_id)).with_for_update())
    if not reward or not reward.active: raise HTTPException(404,"Reward unavailable")
    # Lock user row to serialize concurrent spending across rewards.
    await db.scalar(select(User.id).where(User.id==user.id).with_for_update())
    balance=await points_balance(db,user.id)
    if balance<reward.cost: raise HTTPException(409,"Insufficient points")
    if reward.stock is not None and reward.stock<1: raise HTTPException(409,"Reward out of stock")
    if reward.stock is not None: reward.stock-=1
    redemption=RewardRedemption(user_id=user.id,reward_id=reward.id,status="pending"); db.add(redemption); await db.flush()
    if reward.cost: db.add(PointTransaction(user_id=user.id,amount=-reward.cost,type="debit",reason=f"Reward redemption: {reward.name}",source="reward",reference_id=redemption.id))
    await db.commit(); return {"id":str(redemption.id),"status":redemption.status}

@router.get("/rewards/redemptions/mine")
async def my_redemptions(user:User=Depends(current_user),db:AsyncSession=Depends(get_db)):
    rows=(await db.execute(select(RewardRedemption,Reward).join(Reward).where(RewardRedemption.user_id==user.id).order_by(RewardRedemption.created_at.desc()))).all()
    return {"items":[{"id":str(r.id),"reward":w.name,"status":r.status,"created_at":r.created_at.isoformat()} for r,w in rows]}

@router.get("/notifications/")
async def notifications(limit:int=Query(50,ge=1,le=100),offset:int=Query(0,ge=0),user:User=Depends(current_user),db:AsyncSession=Depends(get_db)):
    query=select(Notification).where(Notification.user_id==user.id).order_by(Notification.created_at.desc())
    total=await db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows=(await db.scalars(query.limit(limit).offset(offset))).all()
    return page([{"id":str(n.id),"type":n.type,"text":n.payload.get("text",n.type),"sub":n.payload.get("sub",""),"icon":n.payload.get("icon","📢"),"read":n.read_at is not None,"time":n.created_at.isoformat()} for n in rows],total,limit,offset)

@router.put("/notifications/mark-all-read")
async def mark_all(user:User=Depends(current_user),db:AsyncSession=Depends(get_db)):
    rows=(await db.scalars(select(Notification).where(Notification.user_id==user.id,Notification.read_at.is_(None)))).all()
    for row in rows: row.read_at=datetime.now(timezone.utc)
    await db.commit(); return {"ok":True}

@router.put("/notifications/{notification_id}/read")
async def mark_read(notification_id:str,user:User=Depends(current_user),db:AsyncSession=Depends(get_db)):
    n=await db.scalar(select(Notification).where(Notification.id==uid(notification_id),Notification.user_id==user.id))
    if not n: raise HTTPException(404,"Notification not found")
    n.read_at=datetime.now(timezone.utc); await db.commit(); return {"ok":True}

@router.get("/announcements/")
async def announcements(limit:int=Query(50,ge=1,le=100),offset:int=Query(0,ge=0),db:AsyncSession=Depends(get_db)):
    query=select(Announcement).where(Announcement.published_at.is_not(None)).order_by(Announcement.pinned.desc(),Announcement.published_at.desc())
    total=await db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows=(await db.scalars(query.limit(limit).offset(offset))).all()
    return page([{"id":str(a.id),"title":a.title,"category":a.category,"date":a.published_at.isoformat(),"image":a.image_url,"desc":a.body,"pinned":a.pinned} for a in rows],total,limit,offset)

@router.get("/admin/announcements")
async def admin_announcements(user:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    return await announcements(limit=50,offset=0,db=db)

@router.post("/admin/announcements",status_code=201)
async def announcement_create(data:AnnouncementInput,request:Request,user:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    a=Announcement(title=data.title,category=data.category,body=data.body or data.desc or "",image_url=data.image_url or data.image,pinned=data.pinned,published_at=datetime.now(timezone.utc),author_id=user.id)
    db.add(a); await db.flush(); await audit(db,user,"create","announcement",a.id,after={"title":a.title},request=request); await db.commit()
    return {"id":str(a.id),"title":a.title,"category":a.category,"desc":a.body,"image":a.image_url,"date":a.published_at.isoformat()}

@router.get("/videos/")
async def videos(limit:int=Query(50,ge=1,le=100),offset:int=Query(0,ge=0),db:AsyncSession=Depends(get_db)):
    query=select(Video).where(Video.published.is_(True)).order_by(Video.created_at.desc())
    total=await db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows=(await db.scalars(query.limit(limit).offset(offset))).all()
    return page([{"id":str(v.id),"title":v.title,"url":v.url,"thumb":v.thumbnail_url,"thumbnail":v.thumbnail_url,"game":"Free Fire","views":v.views_label,"duration":v.duration,"type":v.kind,"date":v.created_at.isoformat()} for v in rows],total,limit,offset)

@router.get("/admin/videos")
async def admin_videos(user:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    rows=(await db.scalars(select(Video).order_by(Video.created_at.desc()))).all()
    return {"items":[{"id":str(v.id),"title":v.title,"url":v.url,"thumbnail_url":v.thumbnail_url,"tags":v.tags,"published":v.published,"type":v.kind} for v in rows]}

@router.post("/admin/videos",status_code=201)
async def create_video(data:VideoInput,request:Request,actor:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    v=Video(title=data.title,url=data.url,thumbnail_url=data.thumbnail_url,tags=data.tags,game_id=uid(data.game_id) if data.game_id else None,duration=data.duration,kind=data.kind,published=data.published)
    db.add(v); await db.flush(); await audit(db,actor,"create","video",v.id,after={"title":v.title,"published":v.published},request=request); await db.commit()
    return {"id":str(v.id),"title":v.title,"url":v.url,"published":v.published}

@router.get("/search")
async def search(q:str=Query(min_length=1,max_length=100),db:AsyncSession=Depends(get_db)):
    like=f"%{q}%"
    ps=(await db.scalars(select(User).where(User.username.ilike(like),User.status=="active").limit(10))).all()
    ts=(await db.scalars(select(Tournament).where(Tournament.title.ilike(like),Tournament.status!="cancelled").limit(10))).all()
    vs=(await db.scalars(select(Video).where(Video.title.ilike(like),Video.published.is_(True)).limit(10))).all()
    return {"players":[{"id":str(x.id),"username":x.username} for x in ps],"tournaments":[{"id":str(x.id),"name":x.title} for x in ts],"videos":[{"id":str(x.id),"title":x.title} for x in vs]}

@router.get("/teams/")
async def teams(db:AsyncSession=Depends(get_db)):
    rows=(await db.scalars(select(Team).where(Team.disbanded_at.is_(None)).order_by(Team.created_at))).all(); items=[]
    for t in rows:
        members=(await db.execute(select(User,TeamMembership.role).join(TeamMembership,TeamMembership.user_id==User.id).where(TeamMembership.team_id==t.id,TeamMembership.status=="active"))).all()
        captain=next((u.username for u,r in members if r=="captain"),"")
        items.append({"id":str(t.id),"name":t.name,"logo":t.name[:2],"logo_url":t.logo_url,"captain":captain,"members":[u.username for u,_ in members],"wins":0,"points":0,"rank":len(items)+1})
    return {"items":items}

@router.post("/teams/",status_code=201)
async def team_create(data:TeamInput,user:User=Depends(current_user),db:AsyncSession=Depends(get_db)):
    team=Team(name=data.name,logo_url=data.logo); db.add(team); await db.flush(); db.add(TeamMembership(team_id=team.id,user_id=user.id,role="captain")); await db.commit()
    return {"id":str(team.id),"name":team.name,"captain":user.username,"members":[user.username],"logo":team.name[:2]}

@router.post("/teams/{team_id}/invites")
async def team_invite(team_id:str,data:dict,user:User=Depends(current_user),db:AsyncSession=Depends(get_db)):
    captain=await db.scalar(select(TeamMembership).where(TeamMembership.team_id==uid(team_id),TeamMembership.user_id==user.id,TeamMembership.role=="captain",TeamMembership.status=="active"))
    if not captain: raise HTTPException(403,"Team captain required")
    target=await db.get(User,uid(data.get("user_id")))
    if not target: raise HTTPException(404,"Player not found")
    invite=TeamInvite(team_id=uid(team_id),user_id=target.id,invited_by=user.id); db.add(invite); await db.commit(); return {"id":str(invite.id),"status":invite.status}

@router.post("/teams/invites/{invite_id}/accept")
async def accept_invite(invite_id:str,user:User=Depends(current_user),db:AsyncSession=Depends(get_db)):
    invite=await db.scalar(select(TeamInvite).where(TeamInvite.id==uid(invite_id),TeamInvite.user_id==user.id,TeamInvite.status=="pending").with_for_update())
    if not invite: raise HTTPException(404,"Invite not found")
    invite.status="accepted"; db.add(TeamMembership(team_id=invite.team_id,user_id=user.id,role="member")); await db.commit(); return {"ok":True}

@router.post("/teams/{team_id}/transfer-captain")
async def transfer_captain(team_id:str,data:dict,user:User=Depends(current_user),db:AsyncSession=Depends(get_db)):
    members=(await db.scalars(select(TeamMembership).where(TeamMembership.team_id==uid(team_id),TeamMembership.status=="active").with_for_update())).all()
    current=next((m for m in members if m.user_id==user.id and m.role=="captain"),None); target=next((m for m in members if str(m.user_id)==data.get("user_id")),None)
    if not current or not target: raise HTTPException(403,"Captain and active target membership are required")
    current.role="member"; await db.flush()
    target.role="captain"; await db.commit(); return {"ok":True}

@router.delete("/teams/{team_id}/members/me")
async def leave_team(team_id:str,user:User=Depends(current_user),db:AsyncSession=Depends(get_db)):
    m=await db.scalar(select(TeamMembership).where(TeamMembership.team_id==uid(team_id),TeamMembership.user_id==user.id,TeamMembership.status=="active").with_for_update())
    if not m: raise HTTPException(404,"Membership not found")
    if m.role=="captain": raise HTTPException(409,"Transfer captaincy or disband the team first")
    m.status="left"; await db.commit(); return {"ok":True}

@router.post("/teams/{team_id}/disband")
async def disband_team(team_id:str,user:User=Depends(current_user),db:AsyncSession=Depends(get_db)):
    team=await db.scalar(select(Team).where(Team.id==uid(team_id),Team.disbanded_at.is_(None)).with_for_update())
    captain=await db.scalar(select(TeamMembership).where(TeamMembership.team_id==uid(team_id),TeamMembership.user_id==user.id,TeamMembership.role=="captain",TeamMembership.status=="active").with_for_update())
    if not team or not captain: raise HTTPException(403,"Only the active team captain can disband the team")
    team.disbanded_at=datetime.now(timezone.utc)
    members=(await db.scalars(select(TeamMembership).where(TeamMembership.team_id==team.id,TeamMembership.status=="active"))).all()
    for member in members: member.status="removed"
    await db.commit(); return {"status":"disbanded"}

@router.get("/admin/players")
async def admin_players(limit:int=50,offset:int=0,user:User=Depends(moderator_user),db:AsyncSession=Depends(get_db)):
    return await players(limit=min(limit,100),offset=offset,db=db)

@router.post("/admin/adjust-points")
@router.post("/admin/points",include_in_schema=False)
async def adjust_points(data:PointAdjustment,request:Request,actor:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    target=await db.get(User,uid(data.user_id))
    if not target: raise HTTPException(404,"Player not found")
    await db.scalar(select(User.id).where(User.id==target.id).with_for_update())
    if await points_balance(db,target.id)+data.amount<0: raise HTTPException(409,"Adjustment would make balance negative")
    tx=PointTransaction(user_id=target.id,amount=data.amount,type="admin_adjustment",reason=data.reason,source="admin",created_by=actor.id)
    db.add(tx); await db.flush(); await audit(db,actor,"adjust_points","user",target.id,after={"amount":data.amount,"reason":data.reason},request=request); await db.commit(); return {"id":str(tx.id),"balance":await points_balance(db,target.id)}

@router.post("/admin/results")
async def submit_results(data:ResultsInput,request:Request,actor:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    t=await db.scalar(select(Tournament).where(Tournament.id==uid(data.tournament_id)).with_for_update())
    if not t or t.status=="cancelled": raise HTTPException(404,"Active tournament not found")
    if not data.results: raise HTTPException(422,"Complete result list is required")
    # Complete means every currently registered participant appears exactly once.
    regs=set((await db.scalars(select(TournamentRegistration.user_id).where(TournamentRegistration.tournament_id==t.id,TournamentRegistration.status=="registered"))).all())
    incoming=[uid(x.user_id) for x in data.results]
    if len(set(incoming))!=len(incoming) or set(incoming)!=regs: raise HTTPException(422,"Results must include every registered player exactly once")
    before=(await db.scalars(select(TournamentResult).where(TournamentResult.tournament_id==t.id))).all()
    before_snapshot=[{"user_id":str(row.user_id),"placement":row.placement,"score":row.score,"tie_break_info":row.tie_break_info} for row in before]
    # Corrections compensate all prior award entries before replacing persisted results.
    if before:
        awards=(await db.scalars(select(PointTransaction).where(PointTransaction.reference_id==t.id,PointTransaction.source=="tournament",PointTransaction.type=="award"))).all()
        for old in awards:
            db.add(PointTransaction(user_id=old.user_id,amount=-old.amount,type="correction",reason=f"Result correction reversal: {t.title}",source="tournament",created_by=actor.id,reference_id=t.id))
        for old in before: await db.delete(old)
        old_hof=(await db.scalars(select(HallOfFameEntry).where(HallOfFameEntry.tournament_id==t.id))).all()
        for old in old_hof: await db.delete(old)
    # Equal placements share the same placement award. Gaps follow competition ranking.
    ordered=sorted(data.results,key=lambda r:(r.placement,r.user_id))
    for result in ordered:
        target_id=uid(result.user_id)
        if target_id not in regs: raise HTTPException(422,"Result player is not registered")
        db.add(TournamentResult(tournament_id=t.id,user_id=target_id,placement=result.placement,score=result.score,tie_break_info=result.tie_break_info))
        amount=TOURNAMENT_PLACEMENT_POINTS.get(result.placement,100)+50
        db.add(PointTransaction(user_id=target_id,amount=amount,type="award",reason=f"Tournament placement {result.placement}: {t.title}",source="tournament",created_by=actor.id,reference_id=t.id))
        db.add(Notification(user_id=target_id,type="tournament_result",payload={"text":f"Results posted for {t.title}","sub":f"Placement {result.placement} · +{amount} points","icon":"🏆"}))
        if result.placement==1:
            for achievement_name in ("Champion","First Win"):
                achievement=await db.scalar(select(Achievement).where(Achievement.name==achievement_name,Achievement.active.is_(True)))
                if achievement and not await db.scalar(select(AchievementAward.id).where(AchievementAward.user_id==target_id,AchievementAward.achievement_id==achievement.id)):
                    db.add(AchievementAward(user_id=target_id,achievement_id=achievement.id))
                    if achievement.points: db.add(PointTransaction(user_id=target_id,amount=achievement.points,type="award",reason=f"Achievement: {achievement.name}",source="achievement",created_by=actor.id,reference_id=achievement.id))
                    db.add(Notification(user_id=target_id,type="achievement_unlocked",payload={"text":f"Achievement unlocked: {achievement.name}","sub":achievement.description,"icon":achievement.icon}))
        if result.placement<=3:
            prior=await db.scalar(select(HallOfFameEntry.id).where(HallOfFameEntry.tournament_id==t.id,HallOfFameEntry.user_id==target_id))
            if not prior: db.add(HallOfFameEntry(tournament_id=t.id,user_id=target_id,placement=result.placement))
    previous_status=t.status; t.status="completed"; await audit(db,actor,"submit_results","tournament",t.id, before={"status":previous_status,"results":before_snapshot},after={"status":"completed","results":[{"user_id":r.user_id,"placement":r.placement,"score":r.score,"tie_break_info":r.tie_break_info} for r in data.results]},request=request)
    await db.commit(); return {"status":"completed","result_count":len(data.results)}

@router.post("/admin/tournaments",status_code=201)
async def admin_tournament_create(data:TournamentCreate,request:Request,actor:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    game=await db.scalar(select(Game).where(Game.name==data.game))
    if not game:
        game=Game(name=data.game,slug=data.game.lower().replace(" ","-")); db.add(game); await db.flush()
    opens=data.registration_opens_at or datetime.now(timezone.utc)
    closes=data.registration_closes_at or data.start_at
    if closes>data.start_at: raise HTTPException(422,"Registration must close before tournament start")
    t=Tournament(game_id=game.id,title=data.title or data.name,description=data.description,rules=data.rules,prize_pool=data.prize,capacity=data.capacity,starts_at=data.start_at,registration_opens_at=opens,registration_closes_at=closes,status=data.status,team_mode=data.team_mode,image_url=data.image,entry_cost=data.entry_cost)
    db.add(t); await db.flush(); await audit(db,actor,"create","tournament",t.id,after={"title":t.title},request=request); await db.commit()
    return {"id":str(t.id),"name":t.title,"status":t.status}

@router.get("/admin/tournaments")
async def admin_tournaments(user:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    return await tournaments(limit=100,offset=0,status_filter=None,db=db)

@router.post("/admin/tournaments/{tournament_id}/close")
async def close_tournament(tournament_id:str,request:Request,actor:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    t=await db.scalar(select(Tournament).where(Tournament.id==uid(tournament_id)).with_for_update())
    if not t: raise HTTPException(404,"Tournament not found")
    prior=t.status; t.status="closed"; t.registration_closes_at=min(t.registration_closes_at,datetime.now(timezone.utc)); await audit(db,actor,"close","tournament",t.id,before={"status":prior},after={"status":"closed"},request=request); await db.commit(); return {"status":t.status}

@router.post("/admin/tournaments/{tournament_id}/cancel")
async def cancel_tournament(tournament_id:str,request:Request,actor:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    t=await db.scalar(select(Tournament).where(Tournament.id==uid(tournament_id)).with_for_update())
    if not t: raise HTTPException(404,"Tournament not found")
    if t.status=="cancelled": return {"status":"cancelled","participants_notified":0}
    registrations=(await db.scalars(select(TournamentRegistration).where(TournamentRegistration.tournament_id==t.id,TournamentRegistration.status=="registered").with_for_update())).all()
    for reg in registrations:
        reg.status="cancelled"; reg.cancelled_at=datetime.now(timezone.utc)
        if t.entry_cost: db.add(PointTransaction(user_id=reg.user_id,amount=t.entry_cost,type="refund",reason=f"Cancellation refund: {t.title}",source="tournament",created_by=actor.id,reference_id=t.id))
        db.add(Notification(user_id=reg.user_id,type="tournament_cancelled",payload={"text":f"{t.title} was cancelled","sub":"Any entry points were refunded","icon":"📢"}))
    prior_awards=(await db.scalars(select(PointTransaction).where(PointTransaction.reference_id==t.id,PointTransaction.source=="tournament",PointTransaction.type=="award"))).all()
    for award in prior_awards:
        db.add(PointTransaction(user_id=award.user_id,amount=-award.amount,type="correction",reason=f"Cancelled tournament award reversal: {t.title}",source="tournament",created_by=actor.id,reference_id=t.id))
    prior=t.status; t.status="cancelled"; await audit(db,actor,"cancel","tournament",t.id,before={"status":prior},after={"status":"cancelled"},request=request); await db.commit(); return {"status":"cancelled","participants_notified":len(registrations)}

@router.post("/admin/rewards",status_code=201)
async def admin_reward_create(data:RewardInput,request:Request,actor:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    r=Reward(name=data.name,description=data.description,cost=data.cost,stock=data.stock,icon=data.icon); db.add(r); await db.flush(); await audit(db,actor,"create","reward",r.id,after={"name":r.name,"cost":r.cost},request=request); await db.commit(); return {"id":str(r.id),"name":r.name}

@router.post("/admin/redemptions/{redemption_id}/fulfill")
async def fulfill_redemption(redemption_id:str,request:Request,actor:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    r=await db.scalar(select(RewardRedemption).where(RewardRedemption.id==uid(redemption_id)).with_for_update())
    if not r or r.status!="pending": raise HTTPException(409,"Redemption is not pending")
    r.status="fulfilled"; await audit(db,actor,"fulfill","redemption",r.id,after={"status":r.status},request=request); await db.commit(); return {"status":r.status}

@router.post("/admin/redemptions/{redemption_id}/refund")
async def refund_redemption(redemption_id:str,request:Request,actor:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    r=await db.scalar(select(RewardRedemption).where(RewardRedemption.id==uid(redemption_id)).with_for_update())
    if not r or r.status not in ("pending","fulfilled"): raise HTTPException(409,"Redemption cannot be refunded")
    reward=await db.scalar(select(Reward).where(Reward.id==r.reward_id).with_for_update())
    charge=await db.scalar(select(PointTransaction).where(PointTransaction.reference_id==r.id,PointTransaction.type=="debit"))
    if charge: db.add(PointTransaction(user_id=r.user_id,amount=-charge.amount,type="refund",reason=f"Reward refund: {reward.name}",source="reward",created_by=actor.id,reference_id=r.id))
    if reward.stock is not None: reward.stock+=1
    r.status="refunded"; await audit(db,actor,"refund","redemption",r.id,after={"status":r.status},request=request); await db.commit(); return {"status":r.status}

@router.post("/admin/redemptions/{redemption_id}/cancel")
async def cancel_redemption(redemption_id:str,request:Request,actor:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    r=await db.scalar(select(RewardRedemption).where(RewardRedemption.id==uid(redemption_id)).with_for_update())
    if not r or r.status!="pending": raise HTTPException(409,"Only pending redemptions can be cancelled")
    reward=await db.scalar(select(Reward).where(Reward.id==r.reward_id).with_for_update())
    charge=await db.scalar(select(PointTransaction).where(PointTransaction.reference_id==r.id,PointTransaction.type=="debit"))
    if charge: db.add(PointTransaction(user_id=r.user_id,amount=-charge.amount,type="refund",reason=f"Reward cancellation: {reward.name}",source="reward",created_by=actor.id,reference_id=r.id))
    if reward.stock is not None: reward.stock+=1
    r.status="cancelled"; await audit(db,actor,"cancel","redemption",r.id,after={"status":r.status},request=request); await db.commit(); return {"status":r.status}

@router.get("/admin/audit-log")
async def audit_log(limit:int=Query(50,ge=1,le=100),offset:int=0,user:User=Depends(admin_user),db:AsyncSession=Depends(get_db)):
    rows=(await db.scalars(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).offset(offset))).all()
    return page([{"id":str(a.id),"actor_id":str(a.actor_id) if a.actor_id else None,"action":a.action,"entity_type":a.entity_type,"entity_id":str(a.entity_id) if a.entity_id else None,"before":a.before_data,"after":a.after_data,"created_at":a.created_at.isoformat()} for a in rows],len(rows),limit,offset)
