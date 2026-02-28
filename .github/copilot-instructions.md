# Personal Finance Planner — Copilot Instructions

## Project overview
This is a headless personal finance planner:
- Backend: Python FastAPI + SQLAlchemy + Alembic
- DB: Postgres in dev/prod (SQLite may exist from scaffolding; prefer Postgres going forward)
- Frontend: React + Vite + Tailwind (Fintech Modern design tokens)

## Non-negotiable domain rules
- Store money as integer minor units (amount_minor). Never use float for persisted currency.
- All report windows must define timezone and use start-inclusive / end-exclusive semantics.
- Transactions are immutable source of truth; derived metrics are computed views.
- Imports must be idempotent; re-importing the same file must not duplicate transactions.

## Coding conventions
- Python: type hints everywhere, Pydantic for request/response models, small modules, explicit errors (HTTPException).
- DB: Alembic migrations for every schema change, no “manual SQL in prod” without migration.
- API: versioned routes under /api, CORS configured for localhost:5173 in dev.
- Frontend: Tailwind utility classes (no inline styles unless unavoidable), components split into ui/ primitives and features/ domain components.
- Animations: subtle; prefer framer-motion for list transitions; avoid “bouncy” motion on financial numbers.

## What Copilot should do before changing code
- Inspect existing files (do not assume structure).
- Propose a plan, then implement the smallest safe change.
- Add/adjust tests for invariants (money/time/idempotency) when touching those areas.

## Dev commands (suggest, don’t invent)
Backend:
- Run: `uvicorn app.main:app --reload --port 8000`
- Migrate: `alembic upgrade head`

Frontend:
- Run: `npm run dev`
- Typecheck/lint if configured in package.json.

## Output format preferences
- When asked to implement a feature: return (1) plan, (2) files to change, (3) code diffs, (4) how to run/verify.
