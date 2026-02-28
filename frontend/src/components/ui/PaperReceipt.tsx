import { motion } from "framer-motion";
import { Receipt, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import type { Transaction } from "@/types";

interface PaperReceiptProps {
  transactions: Transaction[];
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx_001",
    account_id: "acc_001",
    posted_at: "2026-02-28T14:30:00Z",
    amount_minor: -259900,
    currency: "INR",
    merchant: "Amazon",
    description: "Electronics order #9821",
    category_id: "cat_shopping",
    tags: [],
    status: "posted",
    import_fingerprint: null,
  },
  {
    id: "tx_002",
    account_id: "acc_001",
    posted_at: "2026-02-27T10:15:00Z",
    amount_minor: 15000000,
    currency: "INR",
    merchant: "TechCorp Pvt Ltd",
    description: "Salary — February",
    category_id: "cat_income",
    tags: ["salary"],
    status: "posted",
    import_fingerprint: null,
  },
  {
    id: "tx_003",
    account_id: "acc_001",
    posted_at: "2026-02-26T19:45:00Z",
    amount_minor: -48500,
    currency: "INR",
    merchant: "Swiggy",
    description: "Dinner delivery",
    category_id: "cat_food",
    tags: [],
    status: "posted",
    import_fingerprint: null,
  },
  {
    id: "tx_004",
    account_id: "acc_001",
    posted_at: "2026-02-25T08:00:00Z",
    amount_minor: -120000,
    currency: "INR",
    merchant: "Netflix",
    description: "Monthly subscription",
    category_id: "cat_entertainment",
    tags: ["recurring"],
    status: "posted",
    import_fingerprint: null,
  },
  {
    id: "tx_005",
    account_id: "acc_001",
    posted_at: "2026-02-24T12:00:00Z",
    amount_minor: -350000,
    currency: "INR",
    merchant: "Apollo Pharmacy",
    description: "Health supplements",
    category_id: "cat_health",
    tags: [],
    status: "posted",
    import_fingerprint: null,
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function PaperReceipt({ transactions }: PaperReceiptProps) {
  const items = transactions.length > 0 ? transactions : MOCK_TRANSACTIONS;

  return (
    <motion.div
      initial={{ x: 60, opacity: 0, rotateZ: 1.5 }}
      animate={{ x: 0, opacity: 1, rotateZ: 1.5 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
      className="relative"
    >
      {/* Paper container */}
      <div
        className="relative rounded-lg bg-linear-to-b from-zinc-50 to-zinc-100 px-5 py-6 text-zinc-800"
        style={{
          transform: "rotate(-1.5deg)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.50), 0 2px 8px rgba(0,0,0,0.30), -2px 0 0 rgba(0,0,0,0.05) inset",
        }}
      >
        {/* Torn edge top */}
        <div
          className="absolute -top-1 left-2 right-2 h-2"
          style={{
            background:
              "repeating-linear-gradient(90deg, transparent, transparent 6px, #f4f4f5 6px, #f4f4f5 12px)",
            borderRadius: "0 0 2px 2px",
          }}
        />

        {/* Header */}
        <div className="mb-4 flex items-center gap-2 border-b border-dashed border-zinc-300 pb-3">
          <Receipt className="h-4 w-4 text-zinc-500" />
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-600">
            Recent Transactions
          </span>
        </div>

        {/* Items */}
        <div className="space-y-0">
          {items.slice(0, 5).map((tx, i) => (
            <div key={tx.id} className="relative">
              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${
                      tx.amount_minor >= 0
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-500"
                    }`}
                  >
                    {tx.amount_minor >= 0 ? (
                      <ArrowDownLeft className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-700 leading-tight">
                      {tx.merchant ?? "Unknown"}
                    </p>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      {formatDate(tx.posted_at)}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-mono text-xs font-bold ${
                    tx.amount_minor >= 0 ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {tx.amount_minor >= 0 ? "+" : ""}
                  {formatMoney(tx.amount_minor, tx.currency)}
                </span>
              </div>
              {/* Fold line separator */}
              {i < items.length - 1 && (
                <div
                  className="h-px w-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(0,0,0,0.08) 20%, rgba(0,0,0,0.08) 80%, transparent)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Bottom fold gradient */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 rounded-b-lg"
          style={{
            background:
              "linear-gradient(to top, rgba(228,228,231,0.9), transparent)",
          }}
        />

        {/* Paper shadow / fold */}
        <div className="mt-3 border-t border-dashed border-zinc-300 pt-2 text-center">
          <span className="font-mono text-[10px] text-zinc-400">
            ● ● ● END OF RECEIPT ● ● ●
          </span>
        </div>
      </div>
    </motion.div>
  );
}
