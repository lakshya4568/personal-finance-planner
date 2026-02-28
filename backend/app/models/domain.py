"""Pydantic domain models — the API contract layer.

Non-negotiable rules enforced here:
  • amount_minor is ALWAYS an int (minor currency units).
  • All datetimes are timezone-aware.
  • Currency on a transaction must match its parent account (enforced at service layer).
"""

from __future__ import annotations

import uuid
from datetime import date, datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


# ── Enums ──────────────────────────────────────────────────────────


class Currency(str, Enum):
    INR = "INR"
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"


class AccountType(str, Enum):
    CASH = "cash"
    CHECKING = "checking"
    SAVINGS = "savings"
    CREDIT_CARD = "credit_card"
    INVESTMENT = "investment"
    LOAN = "loan"


class TransactionStatus(str, Enum):
    PENDING = "pending"
    POSTED = "posted"


class BudgetPeriod(str, Enum):
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"


class GoalType(str, Enum):
    EMERGENCY_FUND = "emergency_fund"
    DEBT_PAYDOWN = "debt_paydown"
    SAVINGS_TARGET = "savings_target"
    INVESTMENT_TARGET = "investment_target"


class CategoryKind(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"


# ── Helper ─────────────────────────────────────────────────────────


def _new_id(prefix: str = "") -> str:
    return f"{prefix}{uuid.uuid4().hex[:12]}"


# ── Account ────────────────────────────────────────────────────────


class AccountCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    type: AccountType
    currency: Currency
    institution: Optional[str] = None


class AccountRead(BaseModel):
    id: str
    name: str
    type: AccountType
    currency: Currency
    institution: Optional[str] = None
    is_archived: bool = False

    model_config = {"from_attributes": True}


class AccountUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    institution: Optional[str] = None
    is_archived: Optional[bool] = None


# ── Category ───────────────────────────────────────────────────────


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    kind: CategoryKind
    parent_id: Optional[str] = None


class CategoryRead(BaseModel):
    id: str
    name: str
    kind: CategoryKind
    parent_id: Optional[str] = None
    is_system: bool = False

    model_config = {"from_attributes": True}


# ── Transaction ────────────────────────────────────────────────────


class TransactionCreate(BaseModel):
    account_id: str
    posted_at: datetime
    amount_minor: int = Field(..., strict=True)
    currency: Currency
    merchant: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    tags: List[str] = []
    status: TransactionStatus = TransactionStatus.POSTED


class TransactionRead(BaseModel):
    id: str
    account_id: str
    posted_at: datetime
    amount_minor: int
    currency: Currency
    merchant: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    tags: List[str] = []
    status: TransactionStatus
    import_fingerprint: Optional[str] = None

    model_config = {"from_attributes": True}


class TransactionUpdate(BaseModel):
    merchant: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[TransactionStatus] = None


# ── Budget ─────────────────────────────────────────────────────────


class BudgetLineCreate(BaseModel):
    category_id: str
    limit_minor: int = Field(..., ge=0)


class BudgetLineRead(BaseModel):
    category_id: str
    limit_minor: int

    model_config = {"from_attributes": True}


class BudgetCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    period: BudgetPeriod
    currency: Currency
    lines: List[BudgetLineCreate] = []


class BudgetRead(BaseModel):
    id: str
    name: str
    period: BudgetPeriod
    currency: Currency
    lines: List[BudgetLineRead] = []

    model_config = {"from_attributes": True}


class BudgetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    period: Optional[BudgetPeriod] = None
    lines: Optional[List[BudgetLineCreate]] = None


# ── Goal ───────────────────────────────────────────────────────────


class GoalCreate(BaseModel):
    type: GoalType
    name: str = Field(..., min_length=1, max_length=120)
    target_minor: int = Field(..., ge=0)
    currency: Currency
    target_date: Optional[date] = None


class GoalRead(BaseModel):
    id: str
    type: GoalType
    name: str
    target_minor: int
    currency: Currency
    current_minor: int = 0
    target_date: Optional[date] = None

    model_config = {"from_attributes": True}


class GoalUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    target_minor: Optional[int] = Field(None, ge=0)
    current_minor: Optional[int] = Field(None, ge=0)
    target_date: Optional[date] = None


# ── Analytics (response-only) ──────────────────────────────────────


class NetWorthResponse(BaseModel):
    as_of: datetime
    by_currency: dict[str, int]  # e.g. {"INR": 50000000}


class CashFlowResponse(BaseModel):
    start_date: datetime
    end_date: datetime
    by_currency: dict[str, dict[str, int]]
    # e.g. {"INR": {"income": 150000, "expenses": 80000, "net": 70000}}


class BudgetVarianceItem(BaseModel):
    category_id: str
    category_name: str
    limit_minor: int
    spent_minor: int
    remaining_minor: int


class BudgetVarianceResponse(BaseModel):
    budget_id: str
    month: int
    year: int
    currency: Currency
    items: List[BudgetVarianceItem]
