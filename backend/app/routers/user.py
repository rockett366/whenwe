from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from .. import models, schemas
from .auth import get_current_user
from ..utils import hash_password, verify_password

router = APIRouter(prefix="/users", tags=["users"])

# --- existing /users/{user_id} routes stay as-is ---

# GET /users/me
@router.get("/me", response_model=schemas.UserOut)
def get_me(current: models.User = Depends(get_current_user)):
    return current

# PUT /users/me
@router.put("/me", response_model=schemas.UserOut)
def update_me(
    payload: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current: models.User = Depends(get_current_user),
):
    # enforce unique phone (if present on another account)
    conflict = db.query(models.User).filter(
        (models.User.phone == payload.phone) & (models.User.id != current.id)
    ).first()
    if conflict:
        raise HTTPException(status_code=409, detail="Phone already in use")

    current.first_name = payload.first_name
    current.last_name = payload.last_name
    current.phone = payload.phone
    db.commit()
    db.refresh(current)
    return current

# POST /users/me/verify-password
@router.post("/me/verify-password")
def verify_my_password(
    payload: schemas.PasswordVerify,
    current: models.User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    return {"ok": True}

# PUT /users/me/password
@router.put("/me/password")
def change_my_password(
    payload: schemas.PasswordChange,
    db: Session = Depends(get_db),
    current: models.User = Depends(get_current_user),
):
    # verify current password again
    if not verify_password(payload.current_password, current.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    # enforce minimum length
    if len(payload.new_password) < schemas.MIN_PASSWORD_LEN:
        raise HTTPException(
            status_code=422,
            detail=f"Password must be at least {schemas.MIN_PASSWORD_LEN} characters.",
        )
    # update password hash
    current.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated"}