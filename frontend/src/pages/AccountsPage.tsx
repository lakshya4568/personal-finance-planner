import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Landmark,
  CreditCard,
  PiggyBank,
  Wallet,
  TrendingUp,
  Plus,
  Archive,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AddAccountModal } from "@/components/forms/AddAccountModal";
import { accounts as accountsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Account, AccountType } from "@/types";

const typeIcons: Record<AccountType, React.ElementType> = {
  checking: Landmark,
  savings: PiggyBank,
  credit_card: CreditCard,
  investment: TrendingUp,
  loan: Archive,
  cash: Wallet,
};

const typeTints: Record<
  AccountType,
  "purple" | "cyan" | "emerald" | "rose" | "amber"
> = {
  checking: "cyan",
  savings: "emerald",
  credit_card: "rose",
  investment: "purple",
  loan: "amber",
  cash: "cyan",
};

const MOCK_ACCOUNTS: Account[] = [
  {
    id: "acc_001",
    name: "HDFC Savings",
    type: "savings",
    currency: "INR",
    institution: "HDFC Bank",
    is_archived: false,
  },
  {
    id: "acc_002",
    name: "SBI Checking",
    type: "checking",
    currency: "INR",
    institution: "State Bank of India",
    is_archived: false,
  },
  {
    id: "acc_003",
    name: "ICICI Credit Card",
    type: "credit_card",
    currency: "INR",
    institution: "ICICI Bank",
    is_archived: false,
  },
  {
    id: "acc_004",
    name: "Zerodha Investments",
    type: "investment",
    currency: "INR",
    institution: "Zerodha",
    is_archived: false,
  },
];

export function AccountsPage() {
  const [accountsList, setAccountsList] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    accountsApi
      .list()
      .then(setAccountsList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const items = accountsList.length > 0 ? accountsList : MOCK_ACCOUNTS;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Accounts
        </h2>
        <button
          onClick={() => setShowAdd(true)}
          className="pill-btn flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-zinc-300 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Account
        </button>
      </div>

      <AddAccountModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={(account) => setAccountsList((prev) => [...prev, account])}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <GlassCard key={i} delay={i * 0.1} tint="none">
              <div className="h-20 animate-pulse rounded-lg bg-white/5" />
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((account, i) => {
            const Icon = typeIcons[account.type] ?? Wallet;
            const tint = typeTints[account.type] ?? "cyan";
            return (
              <GlassCard key={account.id} tint={tint} delay={i * 0.08}>
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg",
                      tint === "cyan" &&
                        "bg-linear-to-br from-cyan-400 to-teal-500",
                      tint === "emerald" &&
                        "bg-linear-to-br from-emerald-400 to-green-500",
                      tint === "purple" &&
                        "bg-linear-to-br from-purple-500 to-violet-600",
                      tint === "rose" &&
                        "bg-linear-to-br from-rose-400 to-pink-500",
                      tint === "amber" &&
                        "bg-linear-to-br from-amber-400 to-orange-500",
                    )}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-zinc-100 truncate">
                      {account.name}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {account.institution ?? account.type.replace("_", " ")}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-600">
                        {account.type.replace("_", " ")}
                      </span>
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                        {account.currency}
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
