from pydantic import BaseModel

MIN_PASSWORD_LEN = 8

class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: str
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

# ---------- AUTH SCHEMAS ----------

from pydantic import BaseModel, EmailStr

MIN_PASSWORD_LEN = 6  # keep this where it already is if it's defined

class SignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None = None
    password: str

class SignupResponse(BaseModel):
    message: str
    user: "UserOut"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ---------- REVIEW SCHEMAS (placeholders, safe to expand later) ----------

class ReviewCreate(BaseModel):
    username: int
    content: str

class ReviewOut(ReviewCreate):
    id: int