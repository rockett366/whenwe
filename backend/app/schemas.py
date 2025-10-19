from dataclasses import Field
import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional

# -------------------
# USER SCHEMAS
# -------------------

MIN_PASSWORD_LEN = 8

class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    username: str
    phone: str | None = None


class UserOut(UserBase):
    id: int

class Config:
    from_attributes = True


class UserUpdate(UserBase):
    pass


class PasswordVerify(BaseModel):
    current_password: str


class PasswordChange(PasswordVerify):
    new_password: str


# -------------------
# AUTH SCHEMAS
# -------------------

class SignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    username: str
    phone: str | None = None
    password: str


class SignupResponse(BaseModel):
    message: str
    user: UserOut
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


# -------------------
# REVIEW SCHEMAS (placeholder)
# -------------------

class ReviewCreate(BaseModel):
    username: str
    content: str


class ReviewOut(ReviewCreate):
    id: int

class UserPrefUpdate(BaseModel):
    friends_rating: Optional[int] = None
    family_rating: Optional[int] = None
    school_rating: Optional[int] = None
    work_rating: Optional[int] = None
    self_rating: Optional[int] = None

class UserTokenUpdate(BaseModel):
    google_token: Optional[str] = None

class UserPrefAppend(BaseModel):
    preference: Optional[str] = None

class RequestMeetingBody(BaseModel):
    user_name: str
    friend_user_name: str
    desired_title: str = "WhenWe Connect"
    # Either pass 'duration_minutes' or keep your legacy 'time' string.
    duration: Optional[str] = None
    earliest_start: Optional[str] = None
    latest_end: Optional[str] = None
