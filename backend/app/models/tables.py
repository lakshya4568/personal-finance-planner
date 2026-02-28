"""SQLAlchemy ORM table definitions.

Rules:
  • amount_minor columns are Integer (never Float/Numeric with decimals).
  • All timestamps stored with timezone (UTC).
  • tags stored as JSON array.
"""

from __future__ import annotations

from datetime import date, datetime, timezone

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


# ── Account ────────────────────────────────────────────────────────


class AccountRow(Base):
    __tablename__ = "accounts"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    institution: Mapped[str | None] = mapped_column(String(120), nullable=True)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)

    transactions: Mapped[list["TransactionRow"]] = relationship(
        back_populates="account", cascade="all, delete-orphan"
    )


# ── Category ───────────────────────────────────────────────────────


class CategoryRow(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    kind: Mapped[str] = mapped_column(
        String(10), nullable=False
    )  # income|expense|transfer
    parent_id: Mapped[str | None] = mapped_column(
        String(32), ForeignKey("categories.id"), nullable=True
    )
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)


# ── Transaction ────────────────────────────────────────────────────


class TransactionRow(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    account_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("accounts.id"), nullable=False, index=True
    )
    posted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    amount_minor: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    merchant: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category_id: Mapped[str | None] = mapped_column(
        String(32), ForeignKey("categories.id"), nullable=True
    )
    tags: Mapped[list] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(10), nullable=False, default="posted")
    import_fingerprint: Mapped[str | None] = mapped_column(
        String(64), nullable=True, unique=True, index=True
    )

    account: Mapped["AccountRow"] = relationship(back_populates="transactions")


# ── Budget ─────────────────────────────────────────────────────────


class BudgetRow(Base):
    __tablename__ = "budgets"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    period: Mapped[str] = mapped_column(String(12), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)

    lines: Mapped[list["BudgetLineRow"]] = relationship(
        back_populates="budget", cascade="all, delete-orphan"
    )


class BudgetLineRow(Base):
    __tablename__ = "budget_lines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    budget_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("budgets.id"), nullable=False
    )
    category_id: Mapped[str] = mapped_column(String(32), nullable=False)
    limit_minor: Mapped[int] = mapped_column(Integer, nullable=False)

    budget: Mapped["BudgetRow"] = relationship(back_populates="lines")


# ── Goal ───────────────────────────────────────────────────────────


class GoalRow(Base):
    __tablename__ = "goals"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    type: Mapped[str] = mapped_column(String(24), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    target_minor: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    current_minor: Mapped[int] = mapped_column(Integer, default=0)
    target_date: Mapped[date | None] = mapped_column(Date, nullable=True)
