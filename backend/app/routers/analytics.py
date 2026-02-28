"""Analytics router — read-only computed views."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..models.database import get_db
from ..models.domain import CashFlowResponse, NetWorthResponse
from ..services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/net-worth", response_model=NetWorthResponse)
def net_worth(
    as_of: datetime | None = Query(None, description="ISO datetime; defaults to now"),
    db: Session = Depends(get_db),
):
    if as_of is None:
        as_of = datetime.now(timezone.utc)
    data = AnalyticsService.net_worth(db, as_of)
    return NetWorthResponse(as_of=as_of, by_currency=data)


@router.get("/cash-flow", response_model=CashFlowResponse)
def cash_flow(
    start_date: datetime = Query(..., description="Inclusive start (ISO datetime)"),
    end_date: datetime = Query(..., description="Exclusive end (ISO datetime)"),
    db: Session = Depends(get_db),
):
    data = AnalyticsService.cash_flow(db, start_date, end_date)
    return CashFlowResponse(
        start_date=start_date,
        end_date=end_date,
        by_currency=data,
    )
