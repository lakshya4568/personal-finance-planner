"""Budget CRUD + variance router."""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..models.database import get_db
from ..models.domain import (
    BudgetCreate,
    BudgetRead,
    BudgetUpdate,
    BudgetVarianceItem,
    BudgetVarianceResponse,
    Currency,
)
from ..services.budget_service import BudgetService

router = APIRouter(prefix="/api/budgets", tags=["budgets"])


@router.post("/", response_model=BudgetRead, status_code=201)
def create_budget(payload: BudgetCreate, db: Session = Depends(get_db)):
    return BudgetService.create(db, payload)


@router.get("/", response_model=List[BudgetRead])
def list_budgets(db: Session = Depends(get_db)):
    return BudgetService.list(db)


@router.get("/{budget_id}", response_model=BudgetRead)
def get_budget(budget_id: str, db: Session = Depends(get_db)):
    return BudgetService.get(db, budget_id)


@router.patch("/{budget_id}", response_model=BudgetRead)
def update_budget(budget_id: str, payload: BudgetUpdate, db: Session = Depends(get_db)):
    return BudgetService.update(db, budget_id, payload)


@router.delete("/{budget_id}", status_code=204)
def delete_budget(budget_id: str, db: Session = Depends(get_db)):
    BudgetService.delete(db, budget_id)


@router.get("/{budget_id}/variance", response_model=BudgetVarianceResponse)
def budget_variance(
    budget_id: str,
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100),
    db: Session = Depends(get_db),
):
    budget = BudgetService.get(db, budget_id)
    items = BudgetService.variance(db, budget_id, month, year)
    return BudgetVarianceResponse(
        budget_id=budget_id,
        month=month,
        year=year,
        currency=Currency(budget.currency),
        items=items,
    )
