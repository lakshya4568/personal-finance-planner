import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ProgressGoalCard, MOCK_GOALS } from "@/components/ui/ProgressGoalCard";
import { goals as goalsApi } from "@/lib/api";
import type { Goal } from "@/types";
import { Plus } from "lucide-react";

export function GoalsPage() {
  const [goalsList, setGoalsList] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    goalsApi
      .list()
      .then(setGoalsList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const items = goalsList.length > 0 ? goalsList : MOCK_GOALS;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Financial Goals
        </h2>
        <button className="pill-btn flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-zinc-300 cursor-pointer">
          <Plus className="h-3.5 w-3.5" />
          New Goal
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass h-36 animate-pulse rounded-2xl bg-white/5"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((goal, i) => (
            <ProgressGoalCard key={goal.id} goal={goal} delay={i * 0.1} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
