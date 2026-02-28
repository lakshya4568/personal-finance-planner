"""Goal CRUD router."""

from __future__ import annotations

import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..models.database import get_db
from ..models.domain import GoalCreate, GoalRead, GoalUpdate
from ..models.tables import GoalRow

router = APIRouter(prefix="/api/goals", tags=["goals"])


def _new_id() -> str:
    return uuid.uuid4().hex[:24]


@router.post("/", response_model=GoalRead, status_code=201)
def create_goal(payload: GoalCreate, db: Session = Depends(get_db)):
    row = GoalRow(
        id=_new_id(),
        type=payload.type.value,
        name=payload.name,
        target_minor=payload.target_minor,
        currency=payload.currency.value,
        current_minor=0,
        target_date=payload.target_date,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/", response_model=List[GoalRead])
def list_goals(db: Session = Depends(get_db)):
    return db.query(GoalRow).all()


@router.get("/{goal_id}", response_model=GoalRead)
def get_goal(goal_id: str, db: Session = Depends(get_db)):
    row = db.get(GoalRow, goal_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return row


@router.patch("/{goal_id}", response_model=GoalRead)
def update_goal(goal_id: str, payload: GoalUpdate, db: Session = Depends(get_db)):
    row = db.get(GoalRow, goal_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{goal_id}", status_code=204)
def delete_goal(goal_id: str, db: Session = Depends(get_db)):
    row = db.get(GoalRow, goal_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(row)
    db.commit()
