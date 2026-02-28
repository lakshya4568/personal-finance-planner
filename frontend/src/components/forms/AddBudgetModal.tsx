import { useState, type FormEvent } from "react";
import {
  GlassModal,
  FieldLabel,
  FieldInput,
  FieldSelect,
  SubmitButton,
} from "@/components/ui/GlassModal";
import { budgets as budgetsApi } from "@/lib/api";
import type { Budget, BudgetPeriod, Currency } from "@/types";
import { Plus, Trash2 } from "lucide-react";

interface AddBudgetModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (budget: Budget) => void;
}

const periods: { value: BudgetPeriod; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

const currencies: Currency[] = ["INR", "USD", "EUR", "GBP"];

interface BudgetLineInput {
  category_id: string;
  limit: string; // human input — converted to minor on submit
}

export function AddBudgetModal({
  open,
  onClose,
  onCreated,
}: AddBudgetModalProps) {
  const [name, setName] = useState("");
  const [period, setPeriod] = useState<BudgetPeriod>("monthly");
  const [currency, setCurrency] = useState<Currency>("INR");
  const [lines, setLines] = useState<BudgetLineInput[]>([
    { category_id: "", limit: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setName("");
    setPeriod("monthly");
    setCurrency("INR");
    setLines([{ category_id: "", limit: "" }]);
    setError("");
  }

  function updateLine(idx: number, patch: Partial<BudgetLineInput>) {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)),
    );
  }

  function addLine() {
    setLines((prev) => [...prev, { category_id: "", limit: "" }]);
  }

  function removeLine(idx: number) {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Budget name is required.");

    const parsedLines = lines
      .filter((l) => l.category_id.trim() && l.limit.trim())
      .map((l) => ({
        category_id: l.category_id.trim(),
        limit_minor: Math.round(parseFloat(l.limit) * 100),
      }));

    if (parsedLines.length === 0)
      return setError("Add at least one budget line.");
    if (parsedLines.some((l) => isNaN(l.limit_minor) || l.limit_minor <= 0))
      return setError("All limits must be positive numbers.");

    setSubmitting(true);
    try {
      const budget = await budgetsApi.create({
        name: name.trim(),
        period,
        currency,
        lines: parsedLines,
      });
      onCreated(budget);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create budget.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GlassModal open={open} onClose={onClose} title="New Budget">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel>Budget Name</FieldLabel>
          <FieldInput
            placeholder="e.g. Monthly Household"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Period</FieldLabel>
            <FieldSelect
              value={period}
              onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
            >
              {periods.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </FieldSelect>
          </div>
          <div>
            <FieldLabel>Currency</FieldLabel>
            <FieldSelect
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
            >
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </FieldSelect>
          </div>
        </div>

        {/* Budget lines */}
        <div>
          <FieldLabel>Budget Lines</FieldLabel>
          <div className="space-y-2">
            {lines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <FieldInput
                  placeholder="Category ID"
                  value={line.category_id}
                  onChange={(e) =>
                    updateLine(i, { category_id: e.target.value })
                  }
                  className="flex-1"
                />
                <FieldInput
                  type="number"
                  placeholder="Limit"
                  value={line.limit}
                  onChange={(e) => updateLine(i, { limit: e.target.value })}
                  min="0"
                  step="0.01"
                  className="w-28"
                />
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-zinc-500 hover:bg-rose-500/15 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addLine}
            className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            Add Line
          </button>
        </div>

        {error && <p className="text-xs text-rose-400">{error}</p>}

        <SubmitButton disabled={submitting}>
          {submitting ? "Creating…" : "Create Budget"}
        </SubmitButton>
      </form>
    </GlassModal>
  );
}
