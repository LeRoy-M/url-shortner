import random
import string
from sqlalchemy.orm import Session
from . import models
from .config import get_settings


def generate_short_code(length: int = 6) -> str:
    """Generate a random alphanumeric short code."""
    chars = string.ascii_letters + string.digits
    return "".join(random.choices(chars, k=length))


def get_url_by_code(db: Session, short_code: str) -> models.URL | None:
    return db.query(models.URL).filter(models.URL.short_code == short_code).first()


def get_all_urls(db: Session, skip: int = 0, limit: int = 100) -> list[models.URL]:
    return (
        db.query(models.URL)
        .order_by(models.URL.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def count_urls(db: Session) -> int:
    return db.query(models.URL).count()


def create_short_url(db: Session, original_url: str) -> models.URL:
    # Ensure uniqueness
    while True:
        code = generate_short_code()
        if not get_url_by_code(db, code):
            break

    db_url = models.URL(original_url=original_url, short_code=code)
    db.add(db_url)
    db.commit()
    db.refresh(db_url)
    return db_url


def increment_clicks(db: Session, url: models.URL) -> models.URL:
    url.clicks += 1
    db.commit()
    db.refresh(url)
    return url


def delete_url(db: Session, short_code: str) -> bool:
    url = get_url_by_code(db, short_code)
    if not url:
        return False
    db.delete(url)
    db.commit()
    return True


def build_short_url(short_code: str) -> str:
    settings = get_settings()
    return f"{settings.base_url}/{short_code}"
