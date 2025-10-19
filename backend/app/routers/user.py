from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from .auth import get_current_user
from ..utils import hash_password, verify_password
from ..ai_scheduler import suggest_meeting_time

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

    current.first_name = payload.first_name
    current.last_name = payload.last_name
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

# PUT /users/me/request
@router.put("/me/request")
def change_my_password():
    return suggest_meeting_time()


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

# PUT /users/me/ratings
@router.put("/me/ratings")
def update_ratings(
    payload: schemas.UserPrefUpdate,
    db: Session = Depends(get_db),
    current: models.User = Depends(get_current_user)
):
    # Update each rating if it was provided
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current, field, value)

    db.commit()
    db.refresh(current)
    return {"message": "Ratings updated", "user": current}

#------- Friend --------#
# Add friend
@router.post("/me/add_friend/{friend_username}")
def add_friend(
    friend_username: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check that the friend exists
    friend = db.query(models.User).filter(models.User.username == friend_username).first()
    if not friend:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if already added
    exists = db.query(models.Friendship).filter_by(
        user_id=current_user.id, friend_username=friend_username
    ).first()
    if exists:
        raise HTTPException(status_code=400, detail="Already friends")

    # Add friendship
    new_friend = models.Friendship(user_id=current_user.id, friend_username=friend_username)
    db.add(new_friend)
    db.commit()
    db.refresh(new_friend)

    return {"message": f"{friend_username} added as a friend!"}

# Fetch Friends
@router.get("/me/friends")
def get_friends(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    friends = db.query(models.Friendship).filter(models.Friendship.user_id == current_user.id).all()
    return [f.friend_username for f in friends]

#Delete Friend
@router.delete("/me/friends/{friend_username}")
def remove_friend(
    friend_username: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    friendship = db.query(models.Friendship).filter_by(
        user_id=current_user.id, friend_username=friend_username
    ).first()
    if not friendship:
        raise HTTPException(status_code=404, detail="Friend not found")
    db.delete(friendship)
    db.commit()
    return {"message": f"{friend_username} removed."}
