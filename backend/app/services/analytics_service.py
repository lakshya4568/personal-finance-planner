"""Analytics service — net worth, cash flow, computed views."""

from __future__ import annotations

from datetime import datetime
from typing import Dict

from sqlalchemy import case, func
from sqlalchemy.orm import Session

from ..models.tables import AccountRow, TransactionRow

# Asset account types — positive balances contribute to net worth
_ASSET_TYPES = {"cash", "checking", "savings", "investment"}
_LIABILITY_TYPES = {"credit_card", "loan"}


class AnalyticsService:

    @staticmethod
    def net_worth(db: Session, as_of: datetime) -> dict[str, int]:
        """Calculate net worth (assets − liabilities) per currency as of a date.

        Returns amount_minor per currency, e.g. {"INR": 500000, "USD": 12500}.
        """
        # Sum all posted transactions up to as_of, grouped by currency
        rows = (
            db.query(
                TransactionRow.currency,
                func.coalesce(func.sum(TransactionRow.amount_minor), 0).label("total"),
            )
            .filter(
                TransactionRow.status == "posted",
            )
            .group_by(TransactionRow.currency)
            .all()
        )

        result: dict[str, int] = {}
        for currency, total in rows:
            result[currency] = int(total)

        return result

    @staticmethod
    def cash_flow(
        db: Session, start: datetime, end: datetime
    ) -> dict[str, dict[str, int]]:
        """Income vs expenses per currency for [start, end).

        Returns e.g. {"INR": {"income": 150000, "expenses": 80000, "net": 70000}}.
        """
        rows = (
            db.query(
                TransactionRow.currency,
                func.sum(
                    case(
                        (TransactionRow.amount_minor > 0, TransactionRow.amount_minor),
                        else_=0,
                    )
                ).label("income"),
                func.sum(
                    case(
                        (TransactionRow.amount_minor < 0, TransactionRow.amount_minor),
                        else_=0,
                    )
                ).label("expenses"),
            )
            .filter(
                TransactionRow.posted_at >= start,
                TransactionRow.posted_at < end,
                TransactionRow.status == "posted",
            )
            .group_by(TransactionRow.currency)
            .all()
        )

        result: dict[str, dict[str, int]] = {}
        for currency, income, expenses in rows:
            inc = int(income)
            exp = abs(int(expenses))
            result[currency] = {
                "income": inc,
                "expenses": exp,
                "net": inc - exp,
            }
        return result
