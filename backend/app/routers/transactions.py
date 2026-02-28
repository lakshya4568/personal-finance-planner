"""Transaction CRUD router."""

from __future__ import annotations

from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..models.database import get_db
from ..models.domain import TransactionCreate, TransactionRead, TransactionUpdate
from ..services.transaction_service import TransactionService

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.post("/", response_model=TransactionRead, status_code=201)
def create_transaction(payload: TransactionCreate, db: Session = Depends(get_db)):
    """Create a new transaction with invariant validation."""
    row = TransactionService.create(db, payload)
    return row


@router.get("/", response_model=List[TransactionRead])
def list_transactions(
    account_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List transactions with pagination and filters."""
    return TransactionService.list(
        db,
        account_id=account_id,
        start_date=start_date,
        end_date=end_date,
        status=status,
        page=page,
        per_page=per_page,
    )


@router.get("/{transaction_id}", response_model=TransactionRead)
def get_transaction(transaction_id: str, db: Session = Depends(get_db)):
    return TransactionService.get(db, transaction_id)


@router.patch("/{transaction_id}", response_model=TransactionRead)
def update_transaction(
    transaction_id: str,
    payload: TransactionUpdate,
    db: Session = Depends(get_db),
):
    return TransactionService.update(db, transaction_id, payload)


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: str, db: Session = Depends(get_db)):
    TransactionService.delete(db, transaction_id)
