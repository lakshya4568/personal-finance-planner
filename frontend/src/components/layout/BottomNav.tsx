import {
  LayoutDashboard,
  Landmark,
  PieChart,
  Target,
  FileBarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavTab } from "@/types";

interface BottomNavProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

const tabs: { id: NavTab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "accounts", label: "Accounts", icon: Landmark },
  { id: "budget", label: "Budget", icon: PieChart },
  { id: "goals", label: "Goals", icon: Target },
  { id: "reports", label: "Reports", icon: FileBarChart2 },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-3 backdrop-blur-xl bg-zinc-900/80 border-t border-white/5">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer",
              isActive
                ? "pill-btn-active text-white"
                : "pill-btn text-zinc-400 hover:text-zinc-200",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className={cn(!isActive && "hidden sm:inline")}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
