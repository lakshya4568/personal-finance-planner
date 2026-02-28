"""Budget service — CRUD + variance calculations."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException
from sqlalchemy import and_, func, extract
from sqlalchemy.orm import Session

from ..models.domain import BudgetCreate, BudgetUpdate, BudgetVarianceItem
from ..models.tables import BudgetLineRow, BudgetRow, CategoryRow, TransactionRow


def _new_id() -> str:
    return uuid.uuid4().hex[:24]


class BudgetService:

    @staticmethod
    def create(db: Session, payload: BudgetCreate) -> BudgetRow:
        budget = BudgetRow(
            id=_new_id(),
            name=payload.name,
            period=payload.period.value,
            currency=payload.currency.value,
        )
        db.add(budget)
        db.flush()

        for line in payload.lines:
            db.add(
                BudgetLineRow(
                    budget_id=budget.id,
                    category_id=line.category_id,
                    limit_minor=line.limit_minor,
                )
            )
        db.commit()
        db.refresh(budget)
        return budget

    @staticmethod
    def get(db: Session, budget_id: str) -> BudgetRow:
        row = db.get(BudgetRow, budget_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Budget not found")
        return row

    @staticmethod
    def list(db: Session) -> list[BudgetRow]:
        return db.query(BudgetRow).all()

    @staticmethod
    def update(db: Session, budget_id: str, payload: BudgetUpdate) -> BudgetRow:
        row = db.get(BudgetRow, budget_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Budget not found")

        update_data = payload.model_dump(exclude_unset=True)
        lines_data = update_data.pop("lines", None)

        for key, value in update_data.items():
            if value is not None:
                if hasattr(value, "value"):
                    value = value.value
                setattr(row, key, value)

        if lines_data is not None:
            # Replace all lines
            db.query(BudgetLineRow).filter(
                BudgetLineRow.budget_id == budget_id
            ).delete()
            for line in lines_data:
                db.add(
                    BudgetLineRow(
                        budget_id=budget_id,
                        category_id=line["category_id"],
                        limit_minor=line["limit_minor"],
                    )
                )

        db.commit()
        db.refresh(row)
        return row

    @staticmethod
    def delete(db: Session, budget_id: str) -> None:
        row = db.get(BudgetRow, budget_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Budget not found")
        db.delete(row)
        db.commit()

    @staticmethod
    def variance(
        db: Session, budget_id: str, month: int, year: int
    ) -> list[BudgetVarianceItem]:
        """Calculate spent vs limit for each budget line in the given month."""
        budget = db.get(BudgetRow, budget_id)
        if budget is None:
            raise HTTPException(status_code=404, detail="Budget not found")

        items: list[BudgetVarianceItem] = []
        for line in budget.lines:
            # Sum actual spending (negative amounts = expenses)
            spent_q = (
                db.query(func.coalesce(func.sum(TransactionRow.amount_minor), 0))
                .filter(
                    TransactionRow.category_id == line.category_id,
                    TransactionRow.currency == budget.currency,
                    TransactionRow.status == "posted",
                    extract("month", TransactionRow.posted_at) == month,
                    extract("year", TransactionRow.posted_at) == year,
                )
                .scalar()
            )
            # spent is negative (expenses); invert for display
            spent_abs = abs(int(spent_q))

            cat = db.get(CategoryRow, line.category_id)
            cat_name = cat.name if cat else line.category_id

            items.append(
                BudgetVarianceItem(
                    category_id=line.category_id,
                    category_name=cat_name,
                    limit_minor=line.limit_minor,
                    spent_minor=spent_abs,
                    remaining_minor=line.limit_minor - spent_abs,
                )
            )
        return items
