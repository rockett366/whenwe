from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import timedelta
from ..database import get_db
from .. import models, schemas
from ..utils import hash_password, verify_password, create_access_token, decode_token

router = APIRouter(prefix="/auth", tags=["auth"])

# Token lifespan
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# OAuth2 scheme for protected endpoints
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ----------------------------
# SIGNUP
# ----------------------------
@router.post("/signup", response_model=schemas.SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: schemas.SignupRequest, db: Session = Depends(get_db)):
    # Simple password length validation
    if len(payload.password) < schemas.MIN_PASSWORD_LEN:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Password must be at least {schemas.MIN_PASSWORD_LEN} characters."
        )

    # Check if username or email already exists
    username_exists = db.execute(select(models.User).where(models.User.username == payload.username)).scalar_one_or_none()
    email_exists = db.execute(select(models.User).where(models.User.email == payload.email.lower())).scalar_one_or_none()

    if username_exists or email_exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already in use."
        )

    # Create new user
    user = models.User(
        username=payload.username.strip(),
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": f"Welcome, {user.first_name}!",
        "user": schemas.UserOut.model_validate(user)
    }

# ----------------------------
# LOGIN
# ----------------------------
@router.post("/login", response_model=schemas.TokenOut)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    # Look up the user by email only
    user = db.query(models.User).filter(models.User.email == payload.email.lower()).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Token uses username as the subject (since it’s unique in your DB)
    access_token = create_access_token(
        subject=user.username,
        ttl_seconds=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return {"access_token": access_token, "token_type": "bearer"}

# ----------------------------
# CURRENT USER
# ----------------------------
def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    username = decode_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return schemas.UserOut.model_validate(current_user)