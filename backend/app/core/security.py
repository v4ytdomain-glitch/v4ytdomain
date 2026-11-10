import hashlib, secrets, time
from uuid import UUID
from datetime import datetime, timedelta, timezone
import jwt
from pwdlib import PasswordHash
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import get_settings
from app.db import get_db
from app.models.entities import User

password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token", auto_error=False)
_attempts: dict[str, list[float]] = {}

def hash_password(password: str) -> str:
    return password_hash.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    try:
        return password_hash.verify(password, hashed)
    except Exception:
        return False

def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def make_access_token(user: User) -> str:
    cfg = get_settings()
    now = datetime.now(timezone.utc)
    return jwt.encode({"sub": str(user.id), "role": user.role, "iat": now, "exp": now + timedelta(minutes=cfg.access_token_minutes)}, cfg.jwt_secret, algorithm="HS256")

def make_refresh_token() -> str:
    return secrets.token_urlsafe(48)

def auth_rate_limit(request: Request):
    key = request.client.host if request.client else "unknown"
    now = time.time()
    recent = [stamp for stamp in _attempts.get(key, []) if now - stamp < 60]
    if len(recent) >= 20:
        raise HTTPException(429, detail={"code":"rate_limited", "message":"Too many authentication attempts"})
    recent.append(now); _attempts[key] = recent

async def current_user(token: str | None = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    if not token:
        raise HTTPException(401, "Authentication required", headers={"WWW-Authenticate":"Bearer"})
    try:
        claims = jwt.decode(token, get_settings().jwt_secret, algorithms=["HS256"])
        user_id = claims.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid or expired access token", headers={"WWW-Authenticate":"Bearer"})
    try:
        parsed_user_id = UUID(user_id)
    except (ValueError, TypeError, AttributeError):
        raise HTTPException(401, "Invalid access token")
    user = await db.scalar(select(User).where(User.id == parsed_user_id, User.status == "active"))
    if user is None:
        raise HTTPException(401, "Invalid user")
    return user

def require_roles(*roles: str):
    async def dependency(user: User = Depends(current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(403, "Insufficient permissions")
        return user
    return dependency

