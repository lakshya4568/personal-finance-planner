"""Account CRUD router."""

from __future__ import annotations

import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..models.database import get_db
from ..models.domain import AccountCreate, AccountRead, AccountUpdate
from ..models.tables import AccountRow

router = APIRouter(prefix="/api/accounts", tags=["accounts"])


def _new_id() -> str:
    return uuid.uuid4().hex[:24]


@router.post("/", response_model=AccountRead, status_code=201)
def create_account(payload: AccountCreate, db: Session = Depends(get_db)):
    row = AccountRow(
        id=_new_id(),
        name=payload.name,
        type=payload.type.value,
        currency=payload.currency.value,
        institution=payload.institution,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/", response_model=List[AccountRead])
def list_accounts(
    include_archived: bool = Query(False),
    db: Session = Depends(get_db),
):
    q = db.query(AccountRow)
    if not include_archived:
        q = q.filter(AccountRow.is_archived == False)  # noqa: E712
    return q.order_by(AccountRow.name).all()


@router.get("/{account_id}", response_model=AccountRead)
def get_account(account_id: str, db: Session = Depends(get_db)):
    row = db.get(AccountRow, account_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return row


@router.patch("/{account_id}", response_model=AccountRead)
def update_account(
    account_id: str, payload: AccountUpdate, db: Session = Depends(get_db)
):
    row = db.get(AccountRow, account_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Account not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{account_id}", status_code=204)
def delete_account(account_id: str, db: Session = Depends(get_db)):
    row = db.get(AccountRow, account_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(row)
    db.commit()
