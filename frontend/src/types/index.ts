/* ── API Types matching backend domain models ─────────────────── */

export type Currency = "USD" | "EUR" | "GBP" | "INR" | "JPY" | "CAD" | "AUD";
export type AccountType =
  | "cash"
  | "checking"
  | "savings"
  | "credit_card"
  | "investment"
  | "loan";
export type TransactionStatus = "pending" | "posted" | "reconciled";
export type BudgetPeriod = "weekly" | "monthly" | "quarterly" | "yearly";
export type GoalType =
  | "emergency_fund"
  | "debt_paydown"
  | "savings_target"
  | "investment_target";

/* ── Account ──────────────────────────────────────────────────── */

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: Currency;
  institution: string | null;
  is_archived: boolean;
}

export interface AccountCreate {
  name: string;
  type: AccountType;
  currency: Currency;
  institution?: string;
}

/* ── Transaction ──────────────────────────────────────────────── */

export interface Transaction {
  id: string;
  account_id: string;
  posted_at: string; // ISO 8601
  amount_minor: number; // integer!
  currency: Currency;
  merchant: string | null;
  description: string | null;
  category_id: string | null;
  tags: string[];
  status: TransactionStatus;
  import_fingerprint: string | null;
}

export interface TransactionCreate {
  account_id: string;
  posted_at: string;
  amount_minor: number; // must be integer
  currency: Currency;
  merchant?: string;
  description?: string;
  category_id?: string;
  tags?: string[];
  status?: TransactionStatus;
}

/* ── Budget ───────────────────────────────────────────────────── */

export interface BudgetLine {
  category_id: string;
  limit_minor: number;
}

export interface Budget {
  id: string;
  name: string;
  period: BudgetPeriod;
  currency: Currency;
  lines: BudgetLine[];
}

/* ── Goal ─────────────────────────────────────────────────────── */

export interface Goal {
  id: string;
  type: GoalType;
  name: string;
  target_minor: number;
  currency: Currency;
  current_minor: number;
  target_date: string | null;
}

export interface GoalCreate {
  type: GoalType;
  name: string;
  target_minor: number;
  currency: Currency;
  target_date?: string;
}

/* ── Analytics ────────────────────────────────────────────────── */

export interface NetWorthResponse {
  as_of: string;
  by_currency: Record<string, number>;
}

export interface CashFlowResponse {
  start_date: string;
  end_date: string;
  by_currency: Record<
    string,
    { income: number; expenses: number; net: number }
  >;
}

/* ── UI ───────────────────────────────────────────────────────── */

export type NavTab = "dashboard" | "accounts" | "budget" | "goals" | "reports";
