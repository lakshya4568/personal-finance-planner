"""Tests for /api/budgets and /api/goals endpoints."""

from __future__ import annotations


class TestBudgetCRUD:
    def test_create_budget(self, client):
        resp = client.post(
            "/api/budgets/",
            json={
                "name": "March 2026",
                "period": "monthly",
                "currency": "INR",
                "lines": [
                    {"category_id": "cat_groceries", "limit_minor": 1500000},
                    {"category_id": "cat_transport", "limit_minor": 500000},
                ],
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "March 2026"
        assert len(data["lines"]) == 2

    def test_list_budgets(self, client):
        client.post(
            "/api/budgets/", json={"name": "B1", "period": "monthly", "currency": "INR"}
        )
        client.post(
            "/api/budgets/", json={"name": "B2", "period": "weekly", "currency": "USD"}
        )
        resp = client.get("/api/budgets/")
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    def test_delete_budget(self, client):
        bid = client.post(
            "/api/budgets/", json={"name": "B", "period": "monthly", "currency": "INR"}
        ).json()["id"]
        assert client.delete(f"/api/budgets/{bid}").status_code == 204
        assert client.get(f"/api/budgets/{bid}").status_code == 404


class TestGoalCRUD:
    def test_create_goal(self, client):
        resp = client.post(
            "/api/goals/",
            json={
                "type": "emergency_fund",
                "name": "6-Month Emergency",
                "target_minor": 30000000,
                "currency": "INR",
                "target_date": "2026-12-31",
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["target_minor"] == 30000000
        assert data["current_minor"] == 0

    def test_update_goal_progress(self, client):
        gid = client.post(
            "/api/goals/",
            json={
                "type": "savings_target",
                "name": "Vacation",
                "target_minor": 5000000,
                "currency": "INR",
            },
        ).json()["id"]
        resp = client.patch(f"/api/goals/{gid}", json={"current_minor": 2000000})
        assert resp.status_code == 200
        assert resp.json()["current_minor"] == 2000000

    def test_delete_goal(self, client):
        gid = client.post(
            "/api/goals/",
            json={
                "type": "debt_paydown",
                "name": "CC Debt",
                "target_minor": 10000000,
                "currency": "INR",
            },
        ).json()["id"]
        assert client.delete(f"/api/goals/{gid}").status_code == 204
