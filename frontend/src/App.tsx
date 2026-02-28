import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { DashboardPage } from "@/pages/DashboardPage";
import { AccountsPage } from "@/pages/AccountsPage";
import { BudgetPage } from "@/pages/BudgetPage";
import { GoalsPage } from "@/pages/GoalsPage";
import { ReportsPage } from "@/pages/ReportsPage";
import type { NavTab } from "@/types";

function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");

  return (
    <>
      <TopBar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && <DashboardPage key="dashboard" />}
          {activeTab === "accounts" && <AccountsPage key="accounts" />}
          {activeTab === "budget" && <BudgetPage key="budget" />}
          {activeTab === "goals" && <GoalsPage key="goals" />}
          {activeTab === "reports" && <ReportsPage key="reports" />}
        </AnimatePresence>
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </>
  );
}

export default App;
