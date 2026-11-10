from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

class RegisterInput(BaseModel):
    model_config = ConfigDict(json_schema_extra={"examples":[{"username":"V4YT_PLAYER","email":"player@example.com","password":"correct-horse-battery-staple"}]})
    username: str = Field(min_length=3, max_length=32, pattern=r"^[A-Za-z0-9_]+$")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class TokenOutput(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class ProfileUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=3, max_length=32)
    bio: str | None = Field(default=None, max_length=2000)
    avatar_url: str | None = None
    country: str | None = Field(default=None, min_length=2, max_length=2)
    socials: dict | None = None

class TournamentCreate(BaseModel):
    model_config = ConfigDict(json_schema_extra={"examples":[{"game":"Free Fire","name":"V4YT Weekly Showdown","description":"Community tournament","rules":["No cheats"],"prize":"₹5,000","capacity":100,"start_at":"2026-12-20T14:30:00Z","status":"open","team_mode":False}]})
    game: str = "Free Fire"
    name: str = Field(min_length=2, max_length=160)
    title: str | None = None
    description: str = ""
    rules: list[str] = []
    prize: str = ""
    capacity: int = Field(default=100, gt=0, le=100000)
    start_at: datetime
    registration_opens_at: datetime | None = None
    registration_closes_at: datetime | None = None
    status: str = "open"
    team_mode: bool = False
    entry_cost: int = Field(default=0, ge=0)
    image: str | None = None

class RegistrationInput(BaseModel):
    team_id: str | None = None
    game_uid: str | None = Field(default=None, max_length=100)
    in_game_name: str | None = Field(default=None, max_length=80)

class ResultRow(BaseModel):
    user_id: str
    placement: int = Field(gt=0)
    score: int = Field(default=0, ge=0)
    tie_break_info: dict = {}

class ResultsInput(BaseModel):
    model_config = ConfigDict(json_schema_extra={"examples":[{"tournament_id":"00000000-0000-0000-0000-000000000001","results":[{"user_id":"00000000-0000-0000-0000-000000000002","placement":1,"score":100}]}]})
    tournament_id: str
    results: list[ResultRow]

class TeamBracketGenerateInput(BaseModel):
    team_ids: list[str] = Field(min_length=2, max_length=64)

class TeamBracketResultInput(BaseModel):
    winner_team_id: str
    score1: int = Field(default=1, ge=0)
    score2: int = Field(default=0, ge=0)

class PointAdjustment(BaseModel):
    user_id: str
    amount: int = Field(ge=-1000000, le=1000000)
    reason: str = Field(min_length=3, max_length=500)

    @field_validator("amount")
    @classmethod
    def non_zero_adjustment(cls, value: int) -> int:
        if value == 0:
            raise ValueError("Point adjustment must be non-zero")
        return value

class RewardInput(BaseModel):
    name: str
    description: str = ""
    cost: int = Field(ge=0)
    stock: int | None = Field(default=None, ge=0)
    icon: str = "🎁"

class AnnouncementInput(BaseModel):
    title: str
    category: str = "Community"
    body: str = ""
    desc: str | None = None
    image_url: str | None = None
    image: str | None = None
    pinned: bool = False

class AchievementInput(BaseModel):
    name: str
    description: str = ""
    desc: str | None = None
    icon: str = "🏆"
    category: str = "Community"
    points: int = 0

class TeamInput(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    logo: str | None = None

class VideoInput(BaseModel):
    title: str = Field(min_length=2, max_length=180)
    url: str
    thumbnail_url: str | None = None
    tags: list[str] = []
    game_id: str | None = None
    duration: str = ""
    kind: str = "video"
    published: bool = True

class Page(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    items: list
    total: int
    limit: int
    offset: int

