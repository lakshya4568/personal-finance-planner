"""Cross-cutting validators used by routers / services."""

from __future__ import annotations

import hashlib


def transaction_fingerprint(
    account_id: str,
    currency: str,
    amount_minor: int,
    posted_at_date: str,
    merchant: str | None,
    description: str | None,
) -> str:
    """Compute import de-duplication fingerprint (SHA-256).

    Inputs are normalised to lowercase, stripped of whitespace.
    """
    parts = [
        account_id.strip().lower(),
        currency.strip().upper(),
        str(amount_minor),
        posted_at_date,  # YYYY-MM-DD
        (merchant or "").strip().lower(),
        (description or "").strip().lower(),
    ]
    raw = "|".join(parts)
    return hashlib.sha256(raw.encode()).hexdigest()
