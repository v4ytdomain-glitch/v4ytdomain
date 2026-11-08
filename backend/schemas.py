from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ----- USERS -----
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    level: int
    points: int
    xp: int
    tier: str
    avatar: str

    class Config:
        from_attributes = True

# ... (UserResponse is above this) ...

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar: Optional[str] = None

# ... (TournamentBase is below this) ...

# ----- TOURNAMENTS -----
class TournamentBase(BaseModel):
    name: str
    game: str
    date: str
    time: str
    max_players: int
    prize: str
    status: str
    image: Optional[str] = None
    description: Optional[str] = None

class TournamentCreate(TournamentBase):
    pass

class TournamentResponse(TournamentBase):
    id: int
    players_registered: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str



# ... existing code above ...

# --- REGISTRATION SCHEMAS ---
class RegistrationCreate(BaseModel):
    player_id: str
    game_uid: str
    in_game_name: str
    team_name: Optional[str] = None
    team_members: Optional[str] = None

class RegistrationResponse(RegistrationCreate):
    id: int
    user_id: int
    tournament_id: int

    class Config:
        from_attributes = True


# ... existing schemas above ...

class ResultCreate(BaseModel):
    tournament_id: int
    first_place_id: int
    second_place_id: int
    third_place_id: int

# ... existing schemas above ...

class TournamentResultResponse(BaseModel):
    id: int
    tournament_id: int
    first_place_id: int
    second_place_id: int
    third_place_id: int

    class Config:
        from_attributes = True


class NotificationResponse(BaseModel):
    id: int
    icon: str
    text: str
    sub: Optional[str] = None
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ... [existing schemas above] ...

# --- ANNOUNCEMENT SCHEMAS ---
class AnnouncementBase(BaseModel):
    title: str
    category: str
    desc: str
    image: Optional[str] = None
    date: str

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementResponse(AnnouncementBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ... [existing schemas above] ...

# --- TEAM SCHEMAS ---

class TeamCreate(BaseModel):
    name: str
    logo: str

class TeamResponse(BaseModel):
    id: int
    name: str
    logo: str
    captain_id: int
    captain_name: str
    wins: int
    points: int
    members: list[str]

    class Config:
        from_attributes = True


# ... [existing schemas above] ...

# --- ADMIN POINT ADJUSTMENT ---
class PointAdjustment(BaseModel):
    user_id: int
    points_change: int
    xp_change: int
    reason: str = "Manual Admin Adjustment"

# ... [existing schemas above] ...

# --- ACHIEVEMENT SCHEMAS ---
class AchievementCreate(BaseModel):
    name: str
    description: str
    icon: str

class AchievementResponse(AchievementCreate):
    id: int
    class Config:
        from_attributes = True