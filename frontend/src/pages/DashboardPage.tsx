import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, ArrowRightLeft } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CumulativeGrowthChart } from "@/components/ui/CumulativeGrowthChart";
import { ProgressGoalCard, MOCK_GOALS } from "@/components/ui/ProgressGoalCard";
import { PaperReceipt } from "@/components/ui/PaperReceipt";
import { formatMoney } from "@/lib/utils";
import { analytics, goals as goalsApi, transactions as txApi } from "@/lib/api";
import type {
  Goal,
  Transaction,
  NetWorthResponse,
  CashFlowResponse,
} from "@/types";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  tint: "purple" | "cyan" | "emerald" | "rose";
  delay: number;
}

function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  tint,
  delay,
}: StatCardProps) {
  return (
    <GlassCard tint={tint} delay={delay}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            {label}
          </p>
          <p className="mt-1 text-xl font-bold text-zinc-100">{value}</p>
          {subValue && (
            <p className="mt-0.5 text-xs text-zinc-500">{subValue}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
          <Icon className="h-5 w-5 text-zinc-400" />
        </div>
      </div>
    </GlassCard>
  );
}

export function DashboardPage() {
  const [netWorth, setNetWorth] = useState<NetWorthResponse | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowResponse | null>(null);
  const [goalsList, setGoalsList] = useState<Goal[]>([]);
  const [txList, setTxList] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [nw, cf, g, t] = await Promise.allSettled([
          analytics.netWorth(),
          analytics.cashFlow("2026-01-01T00:00:00Z", "2026-03-01T00:00:00Z"),
          goalsApi.list(),
          txApi.list({ limit: 5 }),
        ]);
        if (nw.status === "fulfilled") setNetWorth(nw.value);
        if (cf.status === "fulfilled") setCashFlow(cf.value);
        if (g.status === "fulfilled") setGoalsList(g.value);
        if (t.status === "fulfilled") setTxList(t.value);
      } catch {
        // fallback to mock data
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Derive stats from API or use mocks
  const primaryCurrency = "INR";
  const nwTotal = netWorth?.by_currency[primaryCurrency] ?? 0;
  const income = cashFlow?.by_currency[primaryCurrency]?.income ?? 0;
  const expenses = cashFlow?.by_currency[primaryCurrency]?.expenses ?? 0;
  const displayGoals = goalsList.length > 0 ? goalsList : MOCK_GOALS;
  const displayTx = txList;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 pb-4"
    >
      {/* Left — main content */}
      <div className="space-y-6">
        {/* Stat row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Net Worth"
            value={loading ? "..." : formatMoney(nwTotal, primaryCurrency)}
            icon={Wallet}
            tint="purple"
            delay={0}
          />
          <StatCard
            label="Income"
            value={loading ? "..." : formatMoney(income, primaryCurrency)}
            subValue="Jan — Feb 2026"
            icon={TrendingUp}
            tint="emerald"
            delay={0.08}
          />
          <StatCard
            label="Expenses"
            value={
              loading ? "..." : formatMoney(Math.abs(expenses), primaryCurrency)
            }
            subValue="Jan — Feb 2026"
            icon={TrendingDown}
            tint="rose"
            delay={0.16}
          />
          <StatCard
            label="Transactions"
            value={loading ? "..." : String(txList.length || "—")}
            icon={ArrowRightLeft}
            tint="cyan"
            delay={0.24}
          />
        </div>

        {/* Chart */}
        <CumulativeGrowthChart
          delay={0.3}
          title="Portfolio Growth (last 8 months)"
        />

        {/* Goals */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Financial Goals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayGoals.slice(0, 4).map((goal, i) => (
              <ProgressGoalCard
                key={goal.id}
                goal={goal}
                delay={0.4 + i * 0.08}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right — paper receipt sidebar */}
      <div className="hidden lg:block pt-2">
        <PaperReceipt transactions={displayTx} />
      </div>
    </motion.div>
  );
}
