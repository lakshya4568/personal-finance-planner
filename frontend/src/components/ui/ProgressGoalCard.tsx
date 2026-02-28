import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassCard } from "./GlassCard";
import { formatMoney, clamp } from "@/lib/utils";
import type { Goal } from "@/types";
import { Target, Home, Plane, Shield, TrendingUp } from "lucide-react";

interface ProgressGoalCardProps {
  goal: Goal;
  delay?: number;
}

const goalIcons: Record<string, React.ElementType> = {
  savings_target: Home,
  emergency_fund: Shield,
  investment_target: TrendingUp,
  debt_paydown: Target,
};

const goalTints: Record<string, "purple" | "cyan" | "emerald"> = {
  savings_target: "cyan",
  emergency_fund: "emerald",
  investment_target: "purple",
  debt_paydown: "purple",
};

const gradientMap: Record<string, string> = {
  purple: "from-purple-500 to-violet-600",
  cyan: "from-cyan-400 to-teal-500",
  emerald: "from-emerald-400 to-green-500",
};

const glowColorMap: Record<string, string> = {
  purple: "rgba(168, 85, 247, 0.5)",
  cyan: "rgba(34, 211, 238, 0.5)",
  emerald: "rgba(52, 211, 153, 0.5)",
};

export function ProgressGoalCard({ goal, delay = 0 }: ProgressGoalCardProps) {
  const tint = goalTints[goal.type] ?? "purple";
  const Icon = goalIcons[goal.type] ?? Plane;
  const pct = clamp(
    goal.target_minor > 0 ? (goal.current_minor / goal.target_minor) * 100 : 0,
    0,
    100,
  );
  const gradient = gradientMap[tint];
  const glowColor = glowColorMap[tint];

  const remaining = goal.target_minor - goal.current_minor;
  const daysLeft = goal.target_date
    ? Math.max(
        0,
        Math.ceil(
          (new Date(goal.target_date).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  return (
    <GlassCard tint={tint} delay={delay}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              `bg-linear-to-br ${gradient}`,
              "shadow-lg",
            )}
            style={{ boxShadow: `0 4px 16px ${glowColor}` }}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">{goal.name}</h3>
            <p className="text-xs text-zinc-500 capitalize">
              {goal.type.replace(/_/g, " ")}
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-zinc-400">
          {pct.toFixed(0)}%
        </span>
      </div>

      {/* 3D Progress bar */}
      <div className="progress-bar-3d h-3 w-full bg-zinc-800/80">
        <motion.div
          className={cn("progress-fill-3d h-full bg-linear-to-r", gradient)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeOut" }}
          style={{ boxShadow: `0 0 12px ${glowColor}` }}
        />
      </div>

      {/* Numbers */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-zinc-400">
          {formatMoney(goal.current_minor, goal.currency)}
          <span className="text-zinc-600"> / </span>
          {formatMoney(goal.target_minor, goal.currency)}
        </span>
        {daysLeft !== null && (
          <span className="text-zinc-500">{daysLeft}d left</span>
        )}
      </div>

      {remaining > 0 && (
        <p className="mt-1 text-[11px] text-zinc-500">
          {formatMoney(remaining, goal.currency)} remaining
        </p>
      )}
    </GlassCard>
  );
}

/* ── Mock data for demo ───────────────────────────────────────── */

export const MOCK_GOALS: Goal[] = [
  {
    id: "goal_house_001",
    type: "savings_target",
    name: "House Down Payment",
    target_minor: 5_000_000,
    currency: "INR",
    current_minor: 3_250_000,
    target_date: "2027-06-01",
  },
  {
    id: "goal_vacation_002",
    type: "savings_target",
    name: "Vacation Fund",
    target_minor: 200_000,
    currency: "INR",
    current_minor: 145_000,
    target_date: "2026-12-15",
  },
  {
    id: "goal_emergency_003",
    type: "emergency_fund",
    name: "Emergency Fund",
    target_minor: 600_000,
    currency: "INR",
    current_minor: 480_000,
    target_date: null,
  },
  {
    id: "goal_invest_004",
    type: "investment_target",
    name: "Index Fund Portfolio",
    target_minor: 1_000_000,
    currency: "INR",
    current_minor: 320_000,
    target_date: "2028-01-01",
  },
];
