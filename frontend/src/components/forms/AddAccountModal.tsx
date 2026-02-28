import { useState, type FormEvent } from "react";
import {
  GlassModal,
  FieldLabel,
  FieldInput,
  FieldSelect,
  SubmitButton,
} from "@/components/ui/GlassModal";
import { accounts as accountsApi } from "@/lib/api";
import type { Account, AccountType, Currency } from "@/types";

interface AddAccountModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (account: Account) => void;
}

const accountTypes: { value: AccountType; label: string }[] = [
  { value: "savings", label: "Savings" },
  { value: "checking", label: "Checking" },
  { value: "credit_card", label: "Credit Card" },
  { value: "investment", label: "Investment" },
  { value: "loan", label: "Loan" },
  { value: "cash", label: "Cash / Wallet" },
];

const currencies: Currency[] = ["INR", "USD", "EUR", "GBP"];

export function AddAccountModal({
  open,
  onClose,
  onCreated,
}: AddAccountModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("savings");
  const [currency, setCurrency] = useState<Currency>("INR");
  const [institution, setInstitution] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setName("");
    setType("savings");
    setCurrency("INR");
    setInstitution("");
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Account name is required.");

    setSubmitting(true);
    try {
      const account = await accountsApi.create({
        name: name.trim(),
        type,
        currency,
        institution: institution.trim() || undefined,
      });
      onCreated(account);
      reset();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create account.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GlassModal open={open} onClose={onClose} title="Add Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel>Account Name</FieldLabel>
          <FieldInput
            placeholder="e.g. HDFC Savings"
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
              onChange={(e) => setType(e.target.value as AccountType)}
            >
              {accountTypes.map((t) => (
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
          <FieldLabel>Institution (optional)</FieldLabel>
          <FieldInput
            placeholder="e.g. HDFC Bank"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
          />
        </div>

        {error && <p className="text-xs text-rose-400">{error}</p>}

        <SubmitButton disabled={submitting}>
          {submitting ? "Creating…" : "Create Account"}
        </SubmitButton>
      </form>
    </GlassModal>
  );
}
