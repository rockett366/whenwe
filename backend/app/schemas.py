from pydantic import BaseModel, EmailStr
from typing import Optional

# -------------------
# USER SCHEMAS
# -------------------

MIN_PASSWORD_LEN = 8  # or 6, but keep it consistent

class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    username: str
    phone: str | None = None


class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True  # modern replacement for orm_mode=True


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