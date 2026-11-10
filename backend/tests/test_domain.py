import os
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost/test")
os.environ.setdefault("DIRECT_URL", "postgresql+asyncpg://test:test@localhost/test")
os.environ.setdefault("JWT_SECRET", "unit-test-secret-with-more-than-thirty-two-characters")
from app.routers.api import tier, TOURNAMENT_PLACEMENT_POINTS
from app.core.security import hash_password, verify_password

def test_rank_thresholds():
    assert tier(0)=="bronze"
    assert tier(1000)=="silver"
    assert tier(2500)=="gold"
    assert tier(13000)=="legend"

def test_tie_placements_use_same_award_amount():
    assert TOURNAMENT_PLACEMENT_POINTS[1]+50==550
    assert TOURNAMENT_PLACEMENT_POINTS[2]+50==350
    assert TOURNAMENT_PLACEMENT_POINTS[3]+50==250
    assert TOURNAMENT_PLACEMENT_POINTS.get(4,100)+50==150

def test_password_hash_uses_verifiable_hash_not_plaintext():
    secret="Safe-Test-Password-483"
    hashed=hash_password(secret)
    assert hashed != secret
    assert verify_password(secret,hashed)
    assert not verify_password("wrong",hashed)
