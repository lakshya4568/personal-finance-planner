"""Tests for /api/accounts endpoints."""

from __future__ import annotations


def _create_account(client, **overrides):
    payload = {
        "name": "HDFC Savings",
        "type": "savings",
        "currency": "INR",
        "institution": "HDFC Bank",
    } | overrides
    return client.post("/api/accounts/", json=payload)


class TestAccountCRUD:
    def test_create_account(self, client):
        resp = _create_account(client)
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "HDFC Savings"
        assert data["type"] == "savings"
        assert data["currency"] == "INR"
        assert data["is_archived"] is False

    def test_list_accounts(self, client):
        _create_account(client, name="Savings 1")
        _create_account(client, name="Savings 2")
        resp = client.get("/api/accounts/")
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    def test_get_account(self, client):
        create_resp = _create_account(client)
        aid = create_resp.json()["id"]
        resp = client.get(f"/api/accounts/{aid}")
        assert resp.status_code == 200
        assert resp.json()["id"] == aid

    def test_get_account_not_found(self, client):
        resp = client.get("/api/accounts/nonexistent")
        assert resp.status_code == 404

    def test_update_account(self, client):
        aid = _create_account(client).json()["id"]
        resp = client.patch(f"/api/accounts/{aid}", json={"name": "Renamed"})
        assert resp.status_code == 200
        assert resp.json()["name"] == "Renamed"

    def test_delete_account(self, client):
        aid = _create_account(client).json()["id"]
        resp = client.delete(f"/api/accounts/{aid}")
        assert resp.status_code == 204
        assert client.get(f"/api/accounts/{aid}").status_code == 404
