import { useState, type FormEvent } from "react";
import {
  GlassModal,
  FieldLabel,
  FieldInput,
  FieldSelect,
  SubmitButton,
} from "@/components/ui/GlassModal";
import { goals as goalsApi } from "@/lib/api";
import type { Goal, GoalType, Currency } from "@/types";

interface AddGoalModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (goal: Goal) => void;
}

const goalTypes: { value: GoalType; label: string }[] = [
  { value: "savings_target", label: "Savings Target" },
  { value: "emergency_fund", label: "Emergency Fund" },
  { value: "investment_target", label: "Investment Target" },
  { value: "debt_paydown", label: "Debt Paydown" },
];

const currencies: Currency[] = ["INR", "USD", "EUR", "GBP"];

export function AddGoalModal({ open, onClose, onCreated }: AddGoalModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<GoalType>("savings_target");
  const [targetAmount, setTargetAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("INR");
  const [targetDate, setTargetDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setName("");
    setType("savings_target");
    setTargetAmount("");
    setCurrency("INR");
    setTargetDate("");
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const amountNum = parseFloat(targetAmount);
    if (!name.trim()) return setError("Name is required.");
    if (isNaN(amountNum) || amountNum <= 0)
      return setError("Enter a valid target amount.");

    // Convert to minor units (multiply by 100) — must be integer
    const targetMinor = Math.round(amountNum * 100);

    setSubmitting(true);
    try {
      const goal = await goalsApi.create({
        type,
        name: name.trim(),
        target_minor: targetMinor,
        currency,
        target_date: targetDate || undefined,
      });
      onCreated(goal);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create goal.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GlassModal open={open} onClose={onClose} title="New Financial Goal">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel>Goal Name</FieldLabel>
          <FieldInput
            placeholder="e.g. House Down Payment"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Type</FieldLabel>
            <FieldSelect
              value={type}
              onChange={(e) => setType(e.target.value as GoalType)}
            >
              {goalTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
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

        <div>
          <FieldLabel>Target Amount (major units)</FieldLabel>
          <FieldInput
            type="number"
            placeholder="e.g. 50000"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <FieldLabel>Target Date (optional)</FieldLabel>
          <FieldInput
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>

        {error && <p className="text-xs text-rose-400">{error}</p>}

        <SubmitButton disabled={submitting}>
          {submitting ? "Creating…" : "Create Goal"}
        </SubmitButton>
      </form>
    </GlassModal>
  );
}
