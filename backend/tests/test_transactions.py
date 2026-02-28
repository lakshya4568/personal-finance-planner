"""Tests for /api/transactions endpoints.

Covers:
  • Happy-path CRUD
  • amount_minor integer invariant (reject floats)
  • Currency consistency invariant
  • Pagination / filtering
"""

from __future__ import annotations


def _create_account(client, **overrides):
    payload = {
        "name": "Test Account",
        "type": "savings",
        "currency": "INR",
    } | overrides
    resp = client.post("/api/accounts/", json=payload)
    return resp.json()["id"]


def _create_tx(client, account_id: str, **overrides):
    payload = {
        "account_id": account_id,
        "posted_at": "2026-03-01T10:00:00+05:30",
        "amount_minor": -259900,
        "currency": "INR",
        "merchant": "Amazon",
        "description": "Order #123",
        "status": "posted",
    } | overrides
    return client.post("/api/transactions/", json=payload)


class TestTransactionCreate:
    def test_create_valid(self, client):
        aid = _create_account(client)
        resp = _create_tx(client, aid)
        assert resp.status_code == 201
        data = resp.json()
        assert data["amount_minor"] == -259900
        assert data["currency"] == "INR"
        assert data["merchant"] == "Amazon"

    def test_reject_float_amount(self, client):
        """amount_minor MUST be an integer — floats are forbidden."""
        aid = _create_account(client)
        resp = _create_tx(client, aid, amount_minor=2599.00)
        assert resp.status_code == 422

    def test_reject_currency_mismatch(self, client):
        """Transaction currency must match account currency."""
        aid = _create_account(client, currency="INR")
        resp = _create_tx(client, aid, currency="USD")
        assert resp.status_code == 422

    def test_account_not_found(self, client):
        resp = _create_tx(client, "nonexistent_account")
        assert resp.status_code == 404


class TestTransactionList:
    def test_list_paginated(self, client):
        aid = _create_account(client)
        for i in range(5):
            _create_tx(client, aid, amount_minor=-(i + 1) * 100)
        resp = client.get("/api/transactions/", params={"per_page": 3})
        assert resp.status_code == 200
        assert len(resp.json()) == 3

    def test_filter_by_account(self, client):
        aid1 = _create_account(client, name="Account 1")
        aid2 = _create_account(client, name="Account 2")
        _create_tx(client, aid1)
        _create_tx(client, aid2)
        resp = client.get("/api/transactions/", params={"account_id": aid1})
        assert len(resp.json()) == 1


class TestTransactionUpdateDelete:
    def test_update_merchant(self, client):
        aid = _create_account(client)
        tid = _create_tx(client, aid).json()["id"]
        resp = client.patch(f"/api/transactions/{tid}", json={"merchant": "Flipkart"})
        assert resp.status_code == 200
        assert resp.json()["merchant"] == "Flipkart"

    def test_delete(self, client):
        aid = _create_account(client)
        tid = _create_tx(client, aid).json()["id"]
        resp = client.delete(f"/api/transactions/{tid}")
        assert resp.status_code == 204
        assert client.get(f"/api/transactions/{tid}").status_code == 404
