import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { CumulativeGrowthChart } from "@/components/ui/CumulativeGrowthChart";
import { formatMoney } from "@/lib/utils";
import { analytics } from "@/lib/api";
import type { CashFlowResponse, NetWorthResponse } from "@/types";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";

export function ReportsPage() {
  const [netWorth, setNetWorth] = useState<NetWorthResponse | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [nw, cf] = await Promise.allSettled([
          analytics.netWorth(),
          analytics.cashFlow("2025-07-01T00:00:00Z", "2026-03-01T00:00:00Z"),
        ]);
        if (nw.status === "fulfilled") setNetWorth(nw.value);
        if (cf.status === "fulfilled") setCashFlow(cf.value);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const currencies = netWorth ? Object.keys(netWorth.by_currency) : ["INR"];

  const cfData = cashFlow?.by_currency ?? {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
        <BarChart3 className="h-4 w-4" />
        Reports &amp; Analytics
      </h2>

      {/* Net Worth breakdown */}
      <GlassCard tint="purple" delay={0}>
        <h3 className="mb-3 text-sm font-semibold text-zinc-200">
          Net Worth by Currency
        </h3>
        {loading ? (
          <div className="h-12 animate-pulse rounded bg-white/5" />
        ) : currencies.length > 0 ? (
          <div className="space-y-2">
            {currencies.map((cur) => (
              <div
                key={cur}
                className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2.5"
              >
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  {cur}
                </span>
                <span className="text-sm font-bold text-zinc-100">
                  {formatMoney(netWorth!.by_currency[cur], cur)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500">
            No data — create accounts and transactions first.
          </p>
        )}
      </GlassCard>

      {/* Cash flow */}
      <GlassCard tint="cyan" delay={0.1}>
        <h3 className="mb-3 text-sm font-semibold text-zinc-200">
          Cash Flow (Jul 2025 — Feb 2026)
        </h3>
        {loading ? (
          <div className="h-12 animate-pulse rounded bg-white/5" />
        ) : Object.keys(cfData).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(cfData).map(([cur, data]) => (
              <div key={cur} className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                  {cur}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-center">
                    <TrendingUp className="mx-auto h-3.5 w-3.5 text-emerald-400 mb-0.5" />
                    <p className="text-[10px] text-emerald-400/70">Income</p>
                    <p className="text-xs font-bold text-emerald-300">
                      {formatMoney(data.income, cur)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-rose-500/10 px-3 py-2 text-center">
                    <TrendingDown className="mx-auto h-3.5 w-3.5 text-rose-400 mb-0.5" />
                    <p className="text-[10px] text-rose-400/70">Expenses</p>
                    <p className="text-xs font-bold text-rose-300">
                      {formatMoney(Math.abs(data.expenses), cur)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-500/10 px-3 py-2 text-center">
                    <Minus className="mx-auto h-3.5 w-3.5 text-purple-400 mb-0.5" />
                    <p className="text-[10px] text-purple-400/70">Net</p>
                    <p className="text-xs font-bold text-purple-300">
                      {formatMoney(data.net, cur)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500">No cash flow data yet.</p>
        )}
      </GlassCard>

      {/* Growth chart */}
      <CumulativeGrowthChart delay={0.2} title="Cumulative Growth Trend" />
    </motion.div>
  );
}
