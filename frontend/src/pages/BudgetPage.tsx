import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { AddBudgetModal } from "@/components/forms/AddBudgetModal";
import { formatMoney } from "@/lib/utils";
import { budgets as budgetsApi } from "@/lib/api";
import type { Budget } from "@/types";
import { PieChart as PieIcon, Plus } from "lucide-react";

const MOCK_BUDGETS: Budget[] = [
  {
    id: "bud_001",
    name: "Monthly Household",
    period: "monthly",
    currency: "INR",
    lines: [
      { category_id: "cat_food", limit_minor: 1500000 },
      { category_id: "cat_transport", limit_minor: 500000 },
      { category_id: "cat_entertainment", limit_minor: 300000 },
      { category_id: "cat_utility", limit_minor: 800000 },
    ],
  },
];

const categoryNames: Record<string, string> = {
  cat_food: "Food & Dining",
  cat_transport: "Transport",
  cat_entertainment: "Entertainment",
  cat_utility: "Utilities",
  cat_shopping: "Shopping",
  cat_health: "Health",
};

const barColors = [
  "from-purple-500 to-violet-600",
  "from-cyan-400 to-teal-500",
  "from-emerald-400 to-green-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
];

export function BudgetPage() {
  const [budgetsList, setBudgetsList] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    budgetsApi
      .list()
      .then(setBudgetsList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const items = budgetsList.length > 0 ? budgetsList : MOCK_BUDGETS;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Budget Overview
        </h2>
        <button
          onClick={() => setShowAdd(true)}
          className="pill-btn flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-zinc-300 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          New Budget
        </button>
      </div>

      <AddBudgetModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={(budget) => setBudgetsList((prev) => [...prev, budget])}
      />

      {loading ? (
        <GlassCard delay={0}>
          <div className="h-40 animate-pulse rounded-lg bg-white/5" />
        </GlassCard>
      ) : (
        items.map((budget, bi) => {
          const totalLimit = budget.lines.reduce(
            (s, l) => s + l.limit_minor,
            0,
          );
          return (
            <GlassCard
              key={budget.id}
              tint="purple"
              delay={bi * 0.1}
              hover={false}
            >
              <div className="mb-4 flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-zinc-100">
                  {budget.name}
                </h3>
                <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400 capitalize">
                  {budget.period} · {budget.currency}
                </span>
              </div>

              <div className="space-y-3">
                {budget.lines.map((line, li) => {
                  const pct =
                    totalLimit > 0 ? (line.limit_minor / totalLimit) * 100 : 0;
                  return (
                    <div key={line.category_id}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-zinc-300">
                          {categoryNames[line.category_id] ?? line.category_id}
                        </span>
                        <span className="text-xs font-mono text-zinc-500">
                          {formatMoney(line.limit_minor, budget.currency)}
                        </span>
                      </div>
                      <div className="progress-bar-3d h-2.5 w-full bg-zinc-800/80">
                        <motion.div
                          className={`progress-fill-3d h-full bg-linear-to-r ${barColors[li % barColors.length]}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{
                            duration: 0.9,
                            delay: 0.3 + li * 0.1,
                            ease: "easeOut",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-white/5 pt-3 text-right">
                <span className="text-xs text-zinc-500">Total: </span>
                <span className="text-sm font-bold text-zinc-200">
                  {formatMoney(totalLimit, budget.currency)}
                </span>
              </div>
            </GlassCard>
          );
        })
      )}
    </motion.div>
  );
}
