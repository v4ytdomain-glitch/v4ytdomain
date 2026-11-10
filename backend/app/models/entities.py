import uuid
from datetime import datetime
from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, Integer, JSON, String, Text, UniqueConstraint, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, Timestamps, UUIDPrimaryKey

class Role(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "roles"
    name: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")

class User(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "users"
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(ForeignKey("roles.name", ondelete="RESTRICT"), default="player", index=True)
    status: Mapped[str] = mapped_column(String(20), default="active", index=True)
    __table_args__ = (CheckConstraint("status IN ('active','suspended','deleted')"), Index("uq_users_username_lower", func.lower(username), unique=True), Index("uq_users_email_lower", func.lower(email), unique=True))

class RefreshToken(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "refresh_tokens"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

class PasswordResetToken(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "password_reset_tokens"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)

class PlayerProfile(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "player_profiles"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    gamer_tag: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    avatar_url: Mapped[str | None] = mapped_column(Text)
    bio: Mapped[str] = mapped_column(Text, default="")
    socials: Mapped[dict] = mapped_column(JSON, default=dict)
    country: Mapped[str | None] = mapped_column(String(2), index=True)

class Permission(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "permissions"
    name: Mapped[str] = mapped_column(String(64), unique=True)
    description: Mapped[str] = mapped_column(Text, default="")

class RolePermission(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "role_permissions"
    role: Mapped[str] = mapped_column(ForeignKey("roles.name", ondelete="CASCADE"), index=True)
    permission_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("permissions.id", ondelete="CASCADE"), index=True)
    __table_args__ = (UniqueConstraint("role", "permission_id"),)

class Game(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "games"
    name: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

class Team(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "teams"
    name: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    logo_url: Mapped[str | None] = mapped_column(Text)
    description: Mapped[str] = mapped_column(Text, default="")
    disbanded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)

class TeamMembership(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "team_memberships"
    team_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(12), default="member")
    status: Mapped[str] = mapped_column(String(16), default="active", index=True)
    __table_args__ = (UniqueConstraint("team_id", "user_id"), CheckConstraint("role IN ('captain','member')"), CheckConstraint("status IN ('active','left','removed')"), Index("uq_team_active_captain", "team_id", unique=True, postgresql_where=text("role='captain' AND status='active'")))

class TeamInvite(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "team_invites"
    team_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    invited_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"))
    status: Mapped[str] = mapped_column(String(16), default="pending", index=True)
    __table_args__ = (Index("ix_team_invites_invited_by_status", "invited_by", "status"),)

class Tournament(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "tournaments"
    game_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("games.id", ondelete="RESTRICT"), index=True)
    title: Mapped[str] = mapped_column(String(160), index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    rules: Mapped[list] = mapped_column(JSON, default=list)
    prize_pool: Mapped[str] = mapped_column(String(100), default="")
    capacity: Mapped[int] = mapped_column(Integer)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    registration_opens_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    registration_closes_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    status: Mapped[str] = mapped_column(String(20), default="open", index=True)
    format: Mapped[str] = mapped_column(String(20), default="battle_royale")
    team_mode: Mapped[bool] = mapped_column(Boolean, default=False)
    image_url: Mapped[str | None] = mapped_column(Text)
    entry_cost: Mapped[int] = mapped_column(Integer, default=0)
    __table_args__ = (CheckConstraint("capacity > 0"), CheckConstraint("entry_cost >= 0"), CheckConstraint("status IN ('open','closed','live','completed','cancelled','soon')"), CheckConstraint("format IN ('battle_royale','single_elimination','double_elimination','round_robin','custom')"),)

class TournamentRegistration(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "tournament_registrations"
    tournament_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tournaments.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    team_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("teams.id", ondelete="SET NULL"), index=True)
    game_uid: Mapped[str | None] = mapped_column(String(100))
    in_game_name: Mapped[str | None] = mapped_column(String(80))
    status: Mapped[str] = mapped_column(String(20), default="registered", index=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    __table_args__ = (UniqueConstraint("tournament_id", "user_id"), CheckConstraint("status IN ('registered','withdrawn','cancelled','disqualified')"),)

class TournamentRound(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "tournament_rounds"
    tournament_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tournaments.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(80))
    sequence: Mapped[int] = mapped_column(Integer)
    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    __table_args__ = (UniqueConstraint("tournament_id", "sequence"),)

class TournamentBracketMatch(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "tournament_bracket_matches"
    round_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tournament_rounds.id", ondelete="CASCADE"), index=True)
    match_number: Mapped[int] = mapped_column(Integer)
    team1_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("teams.id", ondelete="SET NULL"), index=True)
    team2_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("teams.id", ondelete="SET NULL"), index=True)
    winner_team_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("teams.id", ondelete="SET NULL"), index=True)
    score1: Mapped[int] = mapped_column(Integer, default=0)
    score2: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(16), default="scheduled", index=True)
    __table_args__ = (UniqueConstraint("round_id", "match_number"), CheckConstraint("match_number > 0"), CheckConstraint("score1 >= 0 AND score2 >= 0"), CheckConstraint("status IN ('scheduled','completed','bye')"),)

class Match(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "matches"
    round_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tournament_rounds.id", ondelete="CASCADE"), index=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    status: Mapped[str] = mapped_column(String(16), default="scheduled", index=True)

class MatchParticipant(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "match_participants"
    match_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("matches.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    score: Mapped[int] = mapped_column(Integer, default=0)
    placement: Mapped[int | None] = mapped_column(Integer, index=True)
    __table_args__ = (UniqueConstraint("match_id", "user_id"), CheckConstraint("score >= 0"),)

class TournamentResult(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "tournament_results"
    tournament_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tournaments.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    placement: Mapped[int] = mapped_column(Integer, index=True)
    score: Mapped[int] = mapped_column(Integer, default=0)
    tie_break_info: Mapped[dict] = mapped_column(JSON, default=dict)
    __table_args__ = (UniqueConstraint("tournament_id", "user_id"), CheckConstraint("placement > 0"), CheckConstraint("score >= 0"),)

class PointTransaction(UUIDPrimaryKey, Base):
    __tablename__ = "point_transactions"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    amount: Mapped[int] = mapped_column(Integer)
    type: Mapped[str] = mapped_column(String(24), index=True)
    reason: Mapped[str] = mapped_column(Text)
    source: Mapped[str] = mapped_column(String(24), index=True)
    created_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    reference_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    __table_args__ = (CheckConstraint("amount <> 0"), CheckConstraint("source IN ('tournament','achievement','reward','admin','seed')"),)

class LevelConfig(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "level_config"
    level: Mapped[int] = mapped_column(Integer, unique=True)
    min_xp: Mapped[int] = mapped_column(Integer, index=True)
    name: Mapped[str] = mapped_column(String(40))

class Achievement(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "achievements"
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text)
    icon: Mapped[str] = mapped_column(String(32), default="🏆")
    category: Mapped[str] = mapped_column(String(50), index=True)
    points: Mapped[int] = mapped_column(Integer, default=0)
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

class AchievementAward(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "achievement_awards"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    achievement_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("achievements.id", ondelete="RESTRICT"), index=True)
    awarded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    __table_args__ = (UniqueConstraint("user_id", "achievement_id"),)

class HallOfFameEntry(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "hall_of_fame_entries"
    tournament_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tournaments.id", ondelete="RESTRICT"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    placement: Mapped[int] = mapped_column(Integer, index=True)

class Reward(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "rewards"
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text)
    icon: Mapped[str] = mapped_column(String(32), default="🎁")
    cost: Mapped[int] = mapped_column(Integer)
    stock: Mapped[int | None] = mapped_column(Integer, index=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    __table_args__ = (CheckConstraint("cost >= 0"), CheckConstraint("stock IS NULL OR stock >= 0"),)

class RewardRedemption(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "reward_redemptions"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    reward_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("rewards.id", ondelete="RESTRICT"), index=True)
    status: Mapped[str] = mapped_column(String(16), default="pending", index=True)
    __table_args__ = (CheckConstraint("status IN ('pending','fulfilled','cancelled','refunded')"),)

class Notification(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "notifications"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    type: Mapped[str] = mapped_column(String(32), index=True)
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)

class Announcement(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "announcements"
    title: Mapped[str] = mapped_column(String(180), index=True)
    category: Mapped[str] = mapped_column(String(50), index=True)
    body: Mapped[str] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(Text)
    pinned: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    author_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)

class Video(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "videos"
    title: Mapped[str] = mapped_column(String(180), index=True)
    url: Mapped[str] = mapped_column(Text)
    thumbnail_url: Mapped[str | None] = mapped_column(Text)
    game_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("games.id", ondelete="SET NULL"), index=True)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    views_label: Mapped[str] = mapped_column(String(24), default="")
    duration: Mapped[str] = mapped_column(String(24), default="")
    kind: Mapped[str] = mapped_column(String(20), default="video")

class AuditLog(UUIDPrimaryKey, Base):
    __tablename__ = "audit_logs"
    actor_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    action: Mapped[str] = mapped_column(String(80), index=True)
    entity_type: Mapped[str] = mapped_column(String(80), index=True)
    entity_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), index=True)
    before_data: Mapped[dict | None] = mapped_column(JSON)
    after_data: Mapped[dict | None] = mapped_column(JSON)
    ip_address: Mapped[str | None] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
