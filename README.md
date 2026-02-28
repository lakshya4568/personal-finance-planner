# Personal Finance Planner

A production-ready personal finance planner with a FastAPI backend and (upcoming) React frontend.

## Architecture

- **Backend:** Python 3.12+ · FastAPI · SQLAlchemy 2.0 · Alembic · Postgres 16
- **Frontend:** _(Phase 2)_ React · Vite · Tailwind CSS
- **Database:** PostgreSQL via Docker Compose

## Quick Start

### 1. Start Postgres

```bash
docker-compose up -d
```

### 2. Install backend dependencies

```bash
cd backend
uv pip install -e ".[dev]"
```

### 3. Run migrations

```bash
cd backend
alembic upgrade head
```

### 4. Start the API

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 5. Open docs

- Swagger UI: <http://localhost:8000/docs>
- pgAdmin: <http://localhost:5050>

## Running Tests

```bash
cd backend
pytest tests/ -v
```

## Domain Rules (non-negotiable)

| Rule                                                 | Enforcement                               |
| ---------------------------------------------------- | ----------------------------------------- |
| Money stored as `amount_minor` (integer minor units) | Pydantic validator + DB Integer column    |
| Transaction currency must match account currency     | Service-layer check                       |
| Imports are idempotent (SHA-256 fingerprint)         | Unique constraint on `import_fingerprint` |
| Report windows use start-inclusive / end-exclusive   | Analytics service queries                 |
