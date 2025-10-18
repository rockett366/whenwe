import os, time, jwt

from passlib.context import CryptContext
from typing import Optional

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_ctx.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_ctx.verify(password, hashed)


# --- JWT settings ---
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key")
JWT_ALG = os.getenv("JWT_ALG", "HS256")
JWT_TTL_SECONDS = int(os.getenv("JWT_TTL_SECONDS", "3600"))

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(*, subject: str, ttl_seconds: int = JWT_TTL_SECONDS, extra_claims: Optional[dict] = None) -> str:
    now = int(time.time())
    payload = {"sub": subject, "iat": now, "exp": now + ttl_seconds}
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def decode_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        return payload.get("sub")
    except jwt.PyJWTError:
        return None