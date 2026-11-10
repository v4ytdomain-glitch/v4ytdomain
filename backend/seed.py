"""Idempotently seed content adapted from src/data/mock.ts and one env-configured admin."""
import asyncio
import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from app.core.config import get_settings
from app.core.security import hash_password
from app.db import SessionLocal
from app.models.entities import (Role, Permission, RolePermission, User, PlayerProfile, Game, Tournament, Achievement, Reward, Announcement, Video, Team, TeamMembership, TournamentRegistration, TournamentResult, PointTransaction, HallOfFameEntry, LevelConfig)

PLAYERS=[("V4YT_KING",12450),("DARK_WARRIOR",11980),("SHADOW_X",10750),("GAMER_777",9830),("V4YT_RIDER",9120),("BLAZE_STORM",8450),("NIGHT_HAWK",7890),("APEX_FORCE",7200),("CYBER_WOLF",6540),("INFERNO_ACE",5980)]
ACHIEVEMENTS=[("Champion","Win your first tournament","🏆","Tournament"),("Unstoppable","Win 3 tournaments in a row","🔥","Performance"),("Veteran","Participate in 10 tournaments","⚡","Milestones"),("Sharpshooter","Achieve 70%+ win rate","🎯","Performance"),("V4YT Legend","Reach Legend rank","👑","Milestones"),("First Win","Win your first match","🥇","Tournament"),("Top 10","Place in top 10 globally","🌟","Community"),("Diamond Climber","Reach Diamond rank","💎","Milestones"),("100 Matches","Play 100 total matches","🎮","Milestones"),("Season Hero","Finish Season 01 in Top 5","🚀","Special Events")]
REWARDS=[("V4YT Special Badge",500,"Exclusive profile badge", "🎖️",100),("Golden Profile Frame",1000,"Rare golden avatar frame","🖼️",50),("Priority Tournament Access",2500,"Priority access","⚡",0),("V4YT Legend Badge",5000,"Exclusive legend badge","👑",0),("Custom Username Color",750,"Custom profile color","🎨",40),("Animated Avatar Border",1500,"Animated avatar border","✨",0)]
ANNOUNCEMENTS=[("V4YT Championship #13 — Registration Now Open!","Tournament","Registration for Championship #13 is officially open."),("V4YT_KING Is Your Championship #12 Champion!","Winner","After three fierce rounds, V4YT_KING claimed the championship."),("Season 01 Has Officially Launched","Community","Season 01 runs August to October 2026."),("New Reward: Golden Profile Frame Now Available","Update","Spend 1,000 V4YT Points to unlock the golden profile frame.")]
VIDEOS=[("V4YT Championship #12 — Grand Final Highlights","https://youtube.com","highlight","18:42"),("How I Won 3 V4YT Tournaments in a Row","https://youtube.com","video","22:15"),("V4YT LIVE — Championship #13 Registration Day","https://youtube.com","live","LIVE"),("Top 10 Plays — Season 01","https://youtube.com","highlight","11:30"),("V4YT Short: Insane 1v4 Clutch #shorts","https://youtube.com","short","0:58")]

async def seed():
    cfg=get_settings()
    async with SessionLocal() as db:
        for role_name,description in (("player","Community player"),("moderator","Community moderator"),("admin","Platform administrator")):
            if not await db.scalar(select(Role.id).where(Role.name==role_name)): db.add(Role(name=role_name,description=description))
        await db.flush()
        for level in range(1,51):
            if not await db.scalar(select(LevelConfig.id).where(LevelConfig.level==level)):
                db.add(LevelConfig(level=level,min_xp=(level-1)*1000,name=f"Level {level}"))
        await db.flush()
        for permission_name in ("players.read","tournaments.manage","results.manage","points.adjust","community.manage","audit.read","rewards.manage"):
            permission=await db.scalar(select(Permission).where(Permission.name==permission_name))
            if not permission:
                permission=Permission(name=permission_name); db.add(permission); await db.flush()
            for role_name in (("admin","moderator") if permission_name=="players.read" else ("admin",)):
                if not await db.scalar(select(RolePermission.id).where(RolePermission.role==role_name,RolePermission.permission_id==permission.id)):
                    db.add(RolePermission(role=role_name,permission_id=permission.id))
        await db.flush()
        game=await db.scalar(select(Game).where(Game.slug=="free-fire"))
        if not game: game=Game(name="Free Fire",slug="free-fire"); db.add(game); await db.flush()
        users={}
        for name,points in PLAYERS:
            user=await db.scalar(select(User).where(User.username==name))
            if not user:
                user=User(username=name,email=f"{name.lower()}@seed.v4yt.invalid",password_hash=hash_password(secrets.token_urlsafe(40))); db.add(user); await db.flush()
            users[name]=user
            profile=await db.scalar(select(PlayerProfile).where(PlayerProfile.user_id==user.id))
            if not profile: db.add(PlayerProfile(user_id=user.id,gamer_tag=name))
            if not await db.scalar(select(PointTransaction.id).where(PointTransaction.user_id==user.id,PointTransaction.source=="seed")):
                db.add(PointTransaction(user_id=user.id,amount=points,type="seed",reason="Initial mock leaderboard balance",source="seed"))
        if cfg.seed_admin_email and cfg.seed_admin_password and not await db.scalar(select(User.id).where(User.email==cfg.seed_admin_email.lower())):
            admin=User(username=cfg.seed_admin_username,email=cfg.seed_admin_email.lower(),password_hash=hash_password(cfg.seed_admin_password),role="admin"); db.add(admin); await db.flush(); db.add(PlayerProfile(user_id=admin.id,gamer_tag=cfg.seed_admin_username))
        for name,description,icon,category in ACHIEVEMENTS:
            if not await db.scalar(select(Achievement.id).where(Achievement.name==name)): db.add(Achievement(name=name,description=description,icon=icon,category=category))
        for name,cost,description,icon,stock in REWARDS:
            if not await db.scalar(select(Reward.id).where(Reward.name==name)): db.add(Reward(name=name,cost=cost,description=description,icon=icon,stock=stock))
        championship=await db.scalar(select(Tournament).where(Tournament.title=="V4YT Championship #12"))
        if not championship:
            stamp=datetime(2026,8,15,14,tzinfo=timezone.utc)
            championship=Tournament(game_id=game.id,title="V4YT Championship #12",description="The twelfth V4YT Championship.",rules=[],prize_pool="₹5,000 + Trophy",capacity=100,starts_at=stamp,ends_at=stamp+timedelta(hours=3),registration_opens_at=stamp-timedelta(days=14),registration_closes_at=stamp-timedelta(hours=1),status="completed",format="battle_royale",team_mode=False,image_url="https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&h=400&fit=crop&auto=format")
            db.add(championship); await db.flush()
            for place,name in enumerate(("V4YT_KING","DARK_WARRIOR","SHADOW_X"),1):
                user=users[name]; db.add(TournamentRegistration(tournament_id=championship.id,user_id=user.id,status="registered")); db.add(TournamentResult(tournament_id=championship.id,user_id=user.id,placement=place,score=0)); db.add(HallOfFameEntry(tournament_id=championship.id,user_id=user.id,placement=place))
        upcoming=await db.scalar(select(Tournament).where(Tournament.title=="V4YT Championship #13"))
        if not upcoming:
            start=datetime.now(timezone.utc)+timedelta(days=7)
            upcoming=Tournament(game_id=game.id,title="V4YT Championship #13",description="The flagship V4YT community tournament.",rules=["Solo mode only","No hacks or cheats","Admin decision is final"],prize_pool="₹5,000 + Trophy",capacity=100,starts_at=start,registration_opens_at=datetime.now(timezone.utc)-timedelta(days=1),registration_closes_at=start-timedelta(hours=1),status="open",format="battle_royale",team_mode=False,image_url="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop&auto=format")
            db.add(upcoming); await db.flush()
            for name in ("V4YT_KING","DARK_WARRIOR","SHADOW_X"): db.add(TournamentRegistration(tournament_id=upcoming.id,user_id=users[name].id,status="registered"))
        for title,category,body in ANNOUNCEMENTS:
            if not await db.scalar(select(Announcement.id).where(Announcement.title==title)): db.add(Announcement(title=title,category=category,body=body,published_at=datetime.now(timezone.utc)))
        for title,url,kind,duration in VIDEOS:
            if not await db.scalar(select(Video.id).where(Video.title==title)): db.add(Video(title=title,url=url,kind=kind,duration=duration,published=True))
        team_specs=[("V4YT ELITES",["V4YT_KING","DARK_WARRIOR","SHADOW_X"]),("DARK SQUAD",["GAMER_777","NIGHT_HAWK","BLAZE_STORM"]),("APEX UNIT",["APEX_FORCE","CYBER_WOLF","V4YT_RIDER"])]
        for team_name,members in team_specs:
            team=await db.scalar(select(Team).where(Team.name==team_name))
            if not team:
                team=Team(name=team_name); db.add(team); await db.flush()
                for i,player in enumerate(members): db.add(TeamMembership(team_id=team.id,user_id=users[player].id,role="captain" if i==0 else "member"))
        await db.commit()
    print("Seed complete")

if __name__=="__main__": asyncio.run(seed())
