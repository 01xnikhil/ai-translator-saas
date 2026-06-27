"""
User data access — backed by PostgreSQL via SQLAlchemy.
"""

from sqlalchemy.orm import Session
from models import User


def get_user(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, email: str, hashed_password: str) -> User:
    user = User(email=email, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def user_exists(db: Session, email: str) -> bool:
    return get_user(db, email) is not None