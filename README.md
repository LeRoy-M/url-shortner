# URL Shortener

A full-stack URL shortener with a FastAPI backend and a React (Vite + TypeScript) frontend backed by SQLite.

## Project structure

```
url-shortner/
├── src/url_shortner/         # Python backend (FastAPI)
│   ├── __init__.py           # App factory & entrypoint
│   ├── config.py             # Settings (pydantic-settings)
│   ├── database.py           # SQLAlchemy engine & session
│   ├── models.py             # ORM model — URL table
│   ├── schemas.py            # Pydantic request/response schemas
│   ├── crud.py               # DB operations
│   └── routers/
│       └── urls.py           # /api/urls routes
├── frontend/                 # React frontend (Vite + TS)
│   └── src/
│       ├── App.tsx
│       ├── App.css
│       ├── api.ts            # Fetch wrappers
│       └── types.ts          # Shared TS types
├── pyproject.toml
└── uv.lock
```

## Running locally

### Backend

```bash
# Install dependencies (uses uv)
uv sync

# Start the API server (reloads on change)
uv run fastapi dev src/url_shortner/__init__.py
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install   # already done if you used npm create vite
npm run dev
```

The React app will be available at `http://localhost:5173`.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/urls` | Create a short URL |
| `GET` | `/api/urls` | List all short URLs |
| `GET` | `/api/urls/{code}` | Get info for a code |
| `DELETE` | `/api/urls/{code}` | Delete a short URL |
| `GET` | `/{code}` | Redirect to original URL |

## Configuration

Override defaults via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `ENV_NAME` | `local` | Environment label |
| `BASE_URL` | `http://localhost:8000` | Public base for short URLs |
| `DB_URL` | `sqlite:///./shortner.db` | SQLAlchemy database URL |
