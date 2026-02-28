/**
 * API client for the Personal Finance Planner backend.
 * All money values are integer minor units.
 */

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

/* ── Accounts ─────────────────────────────────────────────────── */
import type {
  Account,
  AccountCreate,
  Transaction,
  TransactionCreate,
  Budget,
  Goal,
  GoalCreate,
  NetWorthResponse,
  CashFlowResponse,
} from "@/types";

export const accounts = {
  list: () => request<Account[]>("/accounts/"),
  get: (id: string) => request<Account>(`/accounts/${id}`),
  create: (data: AccountCreate) =>
    request<Account>("/accounts/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Account>) =>
    request<Account>(`/accounts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    request<void>(`/accounts/${id}`, { method: "DELETE" }),
};

/* ── Transactions ─────────────────────────────────────────────── */

export const transactions = {
  list: (params?: { account_id?: string; skip?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.account_id) qs.set("account_id", params.account_id);
    if (params?.skip != null) qs.set("skip", String(params.skip));
    if (params?.limit != null) qs.set("limit", String(params.limit));
    const q = qs.toString();
    return request<Transaction[]>(`/transactions/${q ? `?${q}` : ""}`);
  },
  create: (data: TransactionCreate) =>
    request<Transaction>("/transactions/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Transaction>) =>
    request<Transaction>(`/transactions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    request<void>(`/transactions/${id}`, { method: "DELETE" }),
};

/* ── Budgets ──────────────────────────────────────────────────── */

export const budgets = {
  list: () => request<Budget[]>("/budgets/"),
  create: (data: Omit<Budget, "id">) =>
    request<Budget>("/budgets/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  remove: (id: string) => request<void>(`/budgets/${id}`, { method: "DELETE" }),
};

/* ── Goals ────────────────────────────────────────────────────── */

export const goals = {
  list: () => request<Goal[]>("/goals/"),
  create: (data: GoalCreate) =>
    request<Goal>("/goals/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Goal>) =>
    request<Goal>(`/goals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) => request<void>(`/goals/${id}`, { method: "DELETE" }),
};

/* ── Analytics ────────────────────────────────────────────────── */

export const analytics = {
  netWorth: (asOf?: string) => {
    const qs = asOf ? `?as_of=${asOf}` : "";
    return request<NetWorthResponse>(`/analytics/net-worth${qs}`);
  },
  cashFlow: (startDate: string, endDate: string) =>
    request<CashFlowResponse>(
      `/analytics/cash-flow?start_date=${startDate}&end_date=${endDate}`,
    ),
};
