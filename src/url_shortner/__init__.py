import os
from pathlib import Path

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .database import create_tables, get_db
from . import crud
from .routers import urls_router

# Resolve the frontend/dist directory relative to this file so it works
# regardless of the working directory at runtime.
# __file__ is at <repo>/src/url_shortner/__init__.py
# .parent        → <repo>/src/url_shortner/
# .parent.parent → <repo>/src/
# .parent.parent.parent → <repo>/          (repo root)
_REPO_ROOT = Path(__file__).parent.parent.parent
_DIST = _REPO_ROOT / "frontend" / "dist"


def create_app() -> FastAPI:
    app = FastAPI(
        title="URL Shortener",
        description="A simple URL shortener API",
        version="0.1.0",
    )

    # CORS — only needed when the frontend is served from a different origin
    # (i.e. the Vite dev server).  In production the React app is served by
    # FastAPI itself so both share the same origin and no CORS headers are
    # required.  We keep the dev origins here so `vite dev` still works.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Create DB tables on startup
    @app.on_event("startup")
    def on_startup():
        create_tables()

    # Include API routers  (/api/urls/…)
    app.include_router(urls_router)

    # Short-code redirect — must be registered before the static-file mount
    # so FastAPI's router checks it first.
    @app.get("/{short_code}", include_in_schema=False)
    def redirect_to_url(short_code: str, db: Session = Depends(get_db)):
        from fastapi import HTTPException
        url = crud.get_url_by_code(db, short_code)
        if not url:
            # Unknown path — serve the SPA so React can handle it (or show
            # its own 404 page).  Fall back gracefully when dist isn't built.
            index = _DIST / "index.html"
            if index.exists():
                return FileResponse(str(index))
            raise HTTPException(status_code=404, detail="Not found")
        crud.increment_clicks(db, url)
        return RedirectResponse(url=url.original_url, status_code=302)

    # Serve the built React app (frontend/dist) as static files.
    # Only mount when the dist directory actually exists so the backend still
    # starts cleanly during development when the frontend hasn't been built yet.
    if _DIST.exists():
        # Vite puts JS/CSS/images under dist/assets — mount that sub-directory
        # first for efficient asset serving.
        app.mount(
            "/assets",
            StaticFiles(directory=str(_DIST / "assets")),
            name="assets",
        )
        # Serve index.html at the root ("/").
        @app.get("/", include_in_schema=False)
        def serve_spa_root():
            return FileResponse(str(_DIST / "index.html"))

    return app


app = create_app()


def main() -> None:
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    # reload=True only in local development; on Render reload is unnecessary.
    reload = os.environ.get("ENV", "local") == "local"
    uvicorn.run("url_shortner:app", host="0.0.0.0", port=port, reload=reload)
