"""Transaction service — business logic for transaction CRUD."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional

from fastapi import HTTPException
from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from ..models.domain import TransactionCreate, TransactionUpdate
from ..models.tables import AccountRow, TransactionRow


def _new_id() -> str:
    return uuid.uuid4().hex[:24]


class TransactionService:
    """Stateless service; receives a DB session per call."""

    @staticmethod
    def create(db: Session, payload: TransactionCreate) -> TransactionRow:
        # ── Validate account exists ──
        account = db.get(AccountRow, payload.account_id)
        if account is None:
            raise HTTPException(status_code=404, detail="Account not found")

        # ── Currency consistency invariant ──
        if payload.currency.value != account.currency:
            raise HTTPException(
                status_code=422,
                detail=f"Transaction currency {payload.currency.value} does not match account currency {account.currency}",
            )

        row = TransactionRow(
            id=_new_id(),
            account_id=payload.account_id,
            posted_at=payload.posted_at,
            amount_minor=payload.amount_minor,
            currency=payload.currency.value,
            merchant=payload.merchant,
            description=payload.description,
            category_id=payload.category_id,
            tags=payload.tags,
            status=payload.status.value,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return row

    @staticmethod
    def get(db: Session, transaction_id: str) -> TransactionRow:
        row = db.get(TransactionRow, transaction_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return row

    @staticmethod
    def list(
        db: Session,
        *,
        account_id: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        status: Optional[str] = None,
        page: int = 1,
        per_page: int = 20,
    ) -> list[TransactionRow]:
        q = db.query(TransactionRow)
        if account_id:
            q = q.filter(TransactionRow.account_id == account_id)
        if start_date:
            q = q.filter(
                TransactionRow.posted_at
                >= datetime.combine(start_date, datetime.min.time())
            )
        if end_date:
            q = q.filter(
                TransactionRow.posted_at
                < datetime.combine(end_date, datetime.min.time())
            )
        if status:
            q = q.filter(TransactionRow.status == status)
        q = q.order_by(TransactionRow.posted_at.desc())
        return q.offset((page - 1) * per_page).limit(per_page).all()

    @staticmethod
    def update(
        db: Session, transaction_id: str, payload: TransactionUpdate
    ) -> TransactionRow:
        row = db.get(TransactionRow, transaction_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Transaction not found")
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if key == "status" and value is not None:
                value = value.value if hasattr(value, "value") else value
            setattr(row, key, value)
        db.commit()
        db.refresh(row)
        return row

    @staticmethod
    def delete(db: Session, transaction_id: str) -> None:
        row = db.get(TransactionRow, transaction_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Transaction not found")
        db.delete(row)
        db.commit()
