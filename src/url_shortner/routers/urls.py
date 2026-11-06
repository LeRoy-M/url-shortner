from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import crud
from ..database import get_db
from ..schemas import URLCreate, URLResponse, URLListResponse

router = APIRouter(prefix="/api/urls", tags=["urls"])


@router.post("", response_model=URLResponse, status_code=status.HTTP_201_CREATED)
def shorten_url(payload: URLCreate, db: Session = Depends(get_db)):
    """Create a new short URL."""
    db_url = crud.create_short_url(db, payload.original_url)
    return URLResponse(
        id=db_url.id,
        original_url=db_url.original_url,
        short_code=db_url.short_code,
        short_url=crud.build_short_url(db_url.short_code),
        clicks=db_url.clicks,
        created_at=db_url.created_at,
    )


@router.get("", response_model=URLListResponse)
def list_urls(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Return all shortened URLs."""
    urls = crud.get_all_urls(db, skip=skip, limit=limit)
    total = crud.count_urls(db)
    return URLListResponse(
        urls=[
            URLResponse(
                id=u.id,
                original_url=u.original_url,
                short_code=u.short_code,
                short_url=crud.build_short_url(u.short_code),
                clicks=u.clicks,
                created_at=u.created_at,
            )
            for u in urls
        ],
        total=total,
    )


@router.get("/{short_code}", response_model=URLResponse)
def get_url(short_code: str, db: Session = Depends(get_db)):
    """Get info about a specific short URL."""
    url = crud.get_url_by_code(db, short_code)
    if not url:
        raise HTTPException(status_code=404, detail="Short URL not found")
    return URLResponse(
        id=url.id,
        original_url=url.original_url,
        short_code=url.short_code,
        short_url=crud.build_short_url(url.short_code),
        clicks=url.clicks,
        created_at=url.created_at,
    )


@router.delete("/{short_code}", status_code=status.HTTP_204_NO_CONTENT)
def delete_url(short_code: str, db: Session = Depends(get_db)):
    """Delete a short URL."""
    deleted = crud.delete_url(db, short_code)
    if not deleted:
        raise HTTPException(status_code=404, detail="Short URL not found")
