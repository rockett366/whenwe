from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    google_token = Column(String, nullable=True)
    friends_rating = Column(Integer, nullable=True)
    family_rating = Column(Integer, nullable=True)
    school_rating = Column(Integer, nullable=True)
    work_rating = Column(Integer, nullable=True)
    self_rating = Column(Integer, nullable=True)
    preferences = Column(String, nullable=True)
    friends = Column(String, nullable=True)