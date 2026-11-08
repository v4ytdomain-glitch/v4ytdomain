from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    
    # Player Stats
    level = Column(Integer, default=1)
    points = Column(Integer, default=0)
    xp = Column(Integer, default=0)
    wins = Column(Integer, default=0)
    tier = Column(String, default="bronze")
    avatar = Column(String, default="V4")
    win_rate = Column(Integer, default=0)
    streak = Column(Integer, default=0)

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    game = Column(String)
    date = Column(String)
    time = Column(String)
    players_registered = Column(Integer, default=0)
    max_players = Column(Integer, default=100)
    prize = Column(String)
    status = Column(String, default="open") 
    image = Column(String, nullable=True)
    description = Column(String, nullable=True)

# --- NEW REGISTRATION TABLE ---
class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=False)
    
    # Game Info
    player_id = Column(String, nullable=False)
    game_uid = Column(String, nullable=False)
    in_game_name = Column(String, nullable=False)
    
    # Team Info (Optional)
    team_name = Column(String, nullable=True)
    team_members = Column(String, nullable=True)


# ... existing models above ...

# --- NEW TOURNAMENT RESULTS TABLE ---
class TournamentResult(Base):
    __tablename__ = "tournament_results"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), unique=True, nullable=False)
    first_place_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    second_place_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    third_place_id = Column(Integer, ForeignKey("users.id"), nullable=False)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    icon = Column(String, default="🔔")
    text = Column(String, nullable=False)
    sub = Column(String, nullable=True)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# ... [existing models above] ...

# --- NEW ANNOUNCEMENTS TABLE ---
class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False) # e.g., Tournament, Winner, Update, Community
    desc = Column(String, nullable=False)
    image = Column(String, nullable=True)
    date = Column(String, nullable=False) # e.g., "Aug 22, 2026"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# ... [existing models above] ...

# --- NEW TEAMS TABLES ---
class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    logo = Column(String, nullable=False)
    captain_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    wins = Column(Integer, default=0)
    points = Column(Integer, default=0)

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)


# ... [existing models above] ...

# --- NEW ACHIEVEMENTS TABLES ---
class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=False)
    icon = Column(String, nullable=False) # e.g., "🏆", "🎯", "🔥"

class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    unlocked_at = Column(DateTime(timezone=True), server_default=func.now())