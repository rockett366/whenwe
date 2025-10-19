import datetime

import requests
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

def get_friend_required(db: Session, friend_id: int) -> models.User:
    friend = db.query(models.User).get(friend_id)
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    return friend
def get_user_required(db: Session, user_id: int) -> models.User:
    user = db.query(models.User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
def fetch_events_for_user(token):
    base = 'https://www.googleapis.com/calendar/v3'
    params = URLSearchParams({
        timeMin: opts.timeMin,
        timeMax: opts.timeMax,
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '2500',
    })

# PUT /users/me/request
@router.put("/me/request")
def change_my_password(    
    payload: schemas.RequestMeetingBody,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(...),
    ):
    me = get_user_required(db, current_user.id)
    friend = get_friend_required(db, payload.user_name)
    try:
        family_rank_me = int(getattr(me, "family_rank", 3))
        friend_rank_me = int(getattr(me, "friend_rank", 3))
        school_rank_me = int(getattr(me, "school_rank", 5))
        work_rank_me = int(getattr(me, "work_rank", 4))
        self_rank_me = int(getattr(me, "self_rank", 2))
        preferences_me = getattr(me, "preferences", "") or ""

        family_rank_friend = int(getattr(friend, "family_rank", 3))
        friend_rank_friend = int(getattr(friend, "friend_rank", 3))
        school_rank_friend = int(getattr(friend, "school_rank", 5))
        work_rank_friend = int(getattr(friend, "work_rank", 4))
        self_rank_friend = int(getattr(friend, "self_rank", 2))
        preferences_friend = getattr(friend, "preferences", "") or ""
    except ValueError:
        raise HTTPException(status_code=422, detail="Rank fields must be integers")
    
    earliest = payload.earliest_start or datetime.utcnow()
    latest = payload.latest_end or (earliest + datetime.timedelta(days=14))
    combined_preferences = "; ".join(p for p in [preferences_me, preferences_friend] if p.strip())

    my_rows = fetch_events_for_user(db, me.id, earliest, latest)
    friend_rows = fetch_events_for_user(db, friend.id, earliest, latest)
    result = suggest_meeting_time(
            user_name=getattr(me, "display_name", None) or me.name,
            friend_name=getattr(friend, "display_name", None) or friend.name,
            preferences=combined_preferences,
            _events_to_compact_json=_events_to_compact_json,
            family_rank_me=family_rank_me,
            family_rank_friend=family_rank_friend,
            friend_rank_me=friend_rank_me,
            friend_rank_friend=friend_rank_friend,
            school_rank_me=school_rank_me,
            school_rank_friend=school_rank_friend,
            work_rank_me=work_rank_me,
            work_rank_friend=work_rank_friend,
            self_rank_me=self_rank_me,
            self_rank_friend=self_rank_friend,
            time=str(payload.duration_minutes) if hasattr(payload, "duration_minutes") else "60",
            desired_title=getattr(payload, "desired_title", "WhenWe Connect"),
            earliest_start=earliest,
            latest_end=latest,
        )
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

#------ Google ------#
#Store Token
@router.post("/me/google-token")
def save_google_token(
    token_data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    token = token_data.get("access_token")
    if not token:
        raise HTTPException(status_code=400, detail="Missing access_token")

    current_user.google_token = token
    db.commit()
    return {"message": "✅ Google token saved!"}


# Fetch live events from Google Calendar
@router.get("/me/google-events")
def get_google_events(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.google_token:
        raise HTTPException(status_code=400, detail="Google account not connected")

    headers = {"Authorization": f"Bearer {current_user.google_token}"}
    params = {"singleEvents": True, "orderBy": "startTime", "maxResults": 20}

    response = requests.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        headers=headers,
        params=params,
    )

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch events from Google")

    return response.json().get("items", [])