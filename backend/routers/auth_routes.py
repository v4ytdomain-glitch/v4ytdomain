from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import models, schemas, auth, database

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserResponse)
async def register(user: schemas.UserCreate, db: AsyncSession = Depends(database.get_db)):
    # Check if email exists
    result = await db.execute(select(models.User).filter(models.User.email == user.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username exists
    result_user = await db.execute(select(models.User).filter(models.User.username == user.username))
    if result_user.scalars().first():
        raise HTTPException(status_code=400, detail="Username already taken")
        
    hashed_pw = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_pw,
        avatar=user.username[:2].upper()
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(select(models.User).filter(models.User.username == form_data.username))
    user = result.scalars().first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
        
    access_token = auth.create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

# ... existing auth routes above ...

@router.put("/me", response_model=schemas.UserResponse)
async def update_me(
    update_data: schemas.UserUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(database.get_db)
):
    """Updates the currently logged-in user's profile."""
    
    # 1. Update Username (Check if taken by someone else first)
    if update_data.username and update_data.username != current_user.username:
        check = await db.execute(select(models.User).filter(models.User.username == update_data.username))
        if check.scalars().first():
            raise HTTPException(status_code=400, detail="Username is already taken")
        current_user.username = update_data.username

    # 2. Update Email (Check if taken)
    if update_data.email and update_data.email != current_user.email:
        check = await db.execute(select(models.User).filter(models.User.email == update_data.email))
        if check.scalars().first():
            raise HTTPException(status_code=400, detail="Email is already registered")
        current_user.email = update_data.email

    # 3. Update Avatar (e.g., 2-letter initials or emojis)
    if update_data.avatar:
        # Keep it short so it fits nicely in the UI circles
        current_user.avatar = update_data.avatar[:3] 

    await db.commit()
    await db.refresh(current_user)
    
    return current_user

# --- NEW ENDPOINT ---
@router.get("/me", response_model=schemas.UserResponse)
async def get_me(current_user: models.User = Depends(auth.get_current_user)):
    """Returns the profile of the currently logged-in user."""
    return current_user