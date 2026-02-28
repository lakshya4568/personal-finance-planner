import { Wallet2 } from "lucide-react";

export function TopBar() {
  return (
    <header className="metallic-bar sticky top-0 z-50 flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 shadow-inner">
          <Wallet2 className="h-4.5 w-4.5 text-purple-400" />
        </div>
        <h1 className="text-sm font-bold tracking-tight text-zinc-900">
          Personal Finance Planner
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-zinc-800/30 px-3 py-1 text-[11px] font-medium text-zinc-800">
          v0.1.0
        </span>
      </div>
    </header>
  );
}
