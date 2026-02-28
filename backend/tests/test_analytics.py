"""Tests for /api/analytics endpoints."""

from __future__ import annotations


def _create_account(client, **overrides):
    payload = {"name": "Test Account", "type": "savings", "currency": "INR"} | overrides
    return client.post("/api/accounts/", json=payload).json()["id"]


def _create_tx(client, account_id, amount_minor, posted_at="2026-03-01T10:00:00+05:30"):
    return client.post(
        "/api/transactions/",
        json={
            "account_id": account_id,
            "posted_at": posted_at,
            "amount_minor": amount_minor,
            "currency": "INR",
            "status": "posted",
        },
    )


class TestNetWorth:
    def test_net_worth_empty(self, client):
        resp = client.get("/api/analytics/net-worth")
        assert resp.status_code == 200
        assert resp.json()["by_currency"] == {}

    def test_net_worth_with_transactions(self, client):
        aid = _create_account(client)
        _create_tx(client, aid, 5000000)  # +₹50,000
        _create_tx(client, aid, -1500000)  # −₹15,000
        resp = client.get("/api/analytics/net-worth")
        assert resp.status_code == 200
        assert resp.json()["by_currency"]["INR"] == 3500000


class TestCashFlow:
    def test_cash_flow(self, client):
        aid = _create_account(client)
        _create_tx(client, aid, 10000000, "2026-03-05T10:00:00+05:30")  # income
        _create_tx(client, aid, -3000000, "2026-03-10T10:00:00+05:30")  # expense
        resp = client.get(
            "/api/analytics/cash-flow",
            params={
                "start_date": "2026-03-01T00:00:00+05:30",
                "end_date": "2026-04-01T00:00:00+05:30",
            },
        )
        assert resp.status_code == 200
        inr = resp.json()["by_currency"]["INR"]
        assert inr["income"] == 10000000
        assert inr["expenses"] == 3000000
        assert inr["net"] == 7000000
