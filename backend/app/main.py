"""FastAPI application entry point."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .models.database import engine
from .models.tables import Base
from .routers import accounts, analytics, budgets, goals, transactions


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup (SQLite dev) / no-op when using Alembic + Postgres."""
    if settings.database_url.startswith("sqlite"):
        Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Personal Finance Planner API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(budgets.router)
app.include_router(goals.router)
app.include_router(analytics.router)


# ── Health ─────────────────────────────────────────────────────────
@app.get("/api/health", tags=["health"])
def health_check():
    return {"status": "ok", "environment": settings.environment}
