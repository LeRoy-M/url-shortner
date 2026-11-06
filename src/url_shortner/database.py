from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from functools import lru_cache
from .config import get_settings


class Base(DeclarativeBase):
    pass


@lru_cache
def get_engine():
    settings = get_settings()
    return create_engine(
        settings.db_url,
        connect_args={"check_same_thread": False},  # needed for SQLite
    )


def get_session_factory():
    engine = get_engine()
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency that yields a database session."""
    SessionLocal = get_session_factory()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables defined in Base metadata."""
    from . import models  # noqa: F401 — import models so they register with Base
    Base.metadata.create_all(bind=get_engine())
