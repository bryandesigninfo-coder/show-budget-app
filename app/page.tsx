"use client";

import React, { useEffect, useMemo, useState } from "react";

type ExpenseType = "food" | "perdiem" | "transportation" | "rentals";

type Expense = {
  type: ExpenseType;
  description: string;
  amount: number;
};

type Labor = {
  technician_name: string;
  pay_rate: number;
};

type ShowData = {
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  gross_income: number;
  expenses: Expense[];
  labor: Labor[];
  commission_enabled: boolean;
  commission_percentage: number;
};

const initialData: ShowData = {
  name: "",
  start_date: "",
  end_date: "",
  location: "",
  gross_income: 0,
  expenses: [],
  labor: [],
  commission_enabled: false,
  commission_percentage: 0,
};

const EXPENSE_OPTIONS: { value: ExpenseType; label: string }[] = [
  { value: "food", label: "Food" },
  { value: "perdiem", label: "Per Diem" },
  { value: "transportation", label: "Transportation" },
  { value: "rentals", label: "Rentals" },
];

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatDateRange(start: string, end: string) {
  if (!start && !end) return "No dates selected";
  const formatOne = (value: string) => {
    if (!value) return "";
    const date = new Date(`${value}T00:00:00`);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  if (start && end) return `${formatOne(start)} – ${formatOne(end)}`;
  return formatOne(start || end);
}

function calculateTotals(data: ShowData) {
  const grossIncome = Number(data.gross_income || 0);
  const totalExpenses = (data.expenses || []).reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );
  const totalLabor = (data.labor || []).reduce(
    (sum, tech) => sum + Number(tech.pay_rate || 0),
    0
  );

  const netBeforeCommission = grossIncome - totalExpenses - totalLabor;
  const commissionBase = Math.max(netBeforeCommission, 0);
  const commissionAmount = data.commission_enabled
    ? (commissionBase * Number(data.commission_percentage || 0)) / 100
    : 0;
  const finalNetIncome = netBeforeCommission - commissionAmount;

  return {
    grossIncome,
    totalExpenses,
    totalLabor,
    netBeforeCommission,
    commissionAmount,
    finalNetIncome,
  };
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-sm font-medium text-zinc-700">{children}</label>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "h-12 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none transition",
        "placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10",
        props.className || "",
      ].join(" ")}
    />
  );
}

function SelectInput(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }
) {
  const { children, className, ...rest } = props;
  return (
    <select
      {...rest}
      className={[
        "h-12 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10",
        className || "",
      ].join(" ")}
    >
      {children}
    </select>
  );
}

function StepIndicator({
  currentStep,
  onStepClick,
}: {
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  const steps = ["Show Info", "Income", "Expenses", "Labor", "Summary"];

  return (
    <div className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isComplete = currentStep > stepNumber;

        return (
          <React.Fragment key={label}>
            <button
              type="button"
              onClick={() => onStepClick(stepNumber)}
              className={[
                "flex items-center gap-3 rounded-full border px-4 py-2 text-sm transition",
                isActive
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : isComplete
                  ? "border-zinc-900 bg-zinc-100 text-zinc-900"
                  : "border-zinc-300 bg-white text-zinc-500 hover:border-zinc-400",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                  isActive
                    ? "bg-white/15 text-white"
                    : isComplete
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600",
                ].join(" ")}
              >
                {isComplete ? "✓" : stepNumber}
              </span>
              <span className="font-medium">{label}</span>
            </button>
            {index < steps.length - 1 ? <div className="hidden h-px w-5 bg-zinc-300 sm:block" /> : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function ActionRow({
  onBack,
  onNext,
  nextLabel,
  backLabel = "Back",
  disableNext,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel: string;
  backLabel?: string;
  disableNext?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="h-12 rounded-2xl border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
        >
          {backLabel}
        </button>
      ) : null}
      {onNext ? (
        <button
          type="button"
          disabled={disableNext}
          onClick={onNext}
          className="h-12 flex-1 rounded-2xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {nextLabel}
        </button>
      ) : null}
    </div>
  );
}

function ShowInfoStep({
  data,
  onChange,
  onNext,
}: {
  data: ShowData;
  onChange: (next: ShowData) => void;
  onNext: () => void;
}) {
  const canProceed = Boolean(data.name && data.start_date && data.end_date && data.location);

  return (
    <SectionCard
      title="Show Details"
      subtitle="Enter the basic information for the show."
    >
      <div className="grid grid-cols-1 gap-5">
        <div>
          <FieldLabel>Show Name</FieldLabel>
          <TextInput
            placeholder="Example: Easter Production 2026"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel>Start Date</FieldLabel>
            <TextInput
              type="date"
              value={data.start_date}
              onChange={(e) => onChange({ ...data, start_date: e.target.value })}
            />
          </div>
          <div>
            <FieldLabel>End Date</FieldLabel>
            <TextInput
              type="date"
              value={data.end_date}
              onChange={(e) => onChange({ ...data, end_date: e.target.value })}
            />
          </div>
        </div>

        <div>
          <FieldLabel>Location / Venue</FieldLabel>
          <TextInput
            placeholder="Example: Orlando, FL"
            value={data.location}
            onChange={(e) => onChange({ ...data, location: e.target.value })}
          />
        </div>
      </div>

      <ActionRow onNext={onNext} nextLabel="Continue to Income" disableNext={!canProceed} />
    </SectionCard>
  );
}

function IncomeStep({
  data,
  onChange,
  onBack,
  onNext,
}: {
  data: ShowData;
  onChange: (next: ShowData) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const canProceed = Number(data.gross_income || 0) > 0;

  return (
    <SectionCard title="Gross Income" subtitle="Enter the total show pay before expenses.">
      <div>
        <FieldLabel>Gross Income</FieldLabel>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-zinc-400">
            $
          </span>
          <TextInput
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={data.gross_income || ""}
            onChange={(e) =>
              onChange({ ...data, gross_income: Number.parseFloat(e.target.value) || 0 })
            }
            className="h-16 pl-10 text-center text-3xl font-bold"
          />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
        <span className="font-medium text-zinc-900">{data.name || "Untitled Show"}</span>
        {data.location ? ` — ${data.location}` : ""}
      </div>

      <ActionRow
        onBack={onBack}
        onNext={onNext}
        nextLabel="Continue to Expenses"
        disableNext={!canProceed}
      />
    </SectionCard>
  );
}

function ExpensesStep({
  data,
  onChange,
  onBack,
  onNext,
}: {
  data: ShowData;
  onChange: (next: ShowData) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [type, setType] = useState<ExpenseType | "">("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const totalExpenses = useMemo(
    () => data.expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [data.expenses]
  );

  function addExpense() {
    if (!type || !amount) return;
    const nextExpense: Expense = {
      type,
      description: description.trim(),
      amount: Number.parseFloat(amount) || 0,
    };
    onChange({ ...data, expenses: [...data.expenses, nextExpense] });
    setType("");
    setDescription("");
    setAmount("");
  }

  function removeExpense(index: number) {
    onChange({
      ...data,
      expenses: data.expenses.filter((_, i) => i !== index),
    });
  }

  return (
    <SectionCard title="Expenses" subtitle="Add all show-related expenses.">
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-3">
        <div>
          <FieldLabel>Expense Type</FieldLabel>
          <SelectInput value={type} onChange={(e) => setType(e.target.value as ExpenseType | "")}> 
            <option value="">Select type</option>
            {EXPENSE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </div>
        <div>
          <FieldLabel>Description</FieldLabel>
          <TextInput
            placeholder="Optional"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Amount</FieldLabel>
          <div className="flex gap-2">
            <TextInput
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              type="button"
              onClick={addExpense}
              className="h-12 rounded-2xl bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {data.expenses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
            No expenses added yet.
          </div>
        ) : (
          data.expenses.map((expense, index) => (
            <div
              key={`${expense.type}-${index}`}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-zinc-900">
                  {EXPENSE_OPTIONS.find((option) => option.value === expense.type)?.label || expense.type}
                </p>
                {expense.description ? (
                  <p className="mt-1 text-sm text-zinc-500">{expense.description}</p>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="text-base font-semibold text-zinc-900">
                  {currency(expense.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => removeExpense(index)}
                  className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <div className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white">
          Total Expenses: {currency(totalExpenses)}
        </div>
      </div>

      <ActionRow onBack={onBack} onNext={onNext} nextLabel="Continue to Labor" />
    </SectionCard>
  );
}

function LaborStep({
  data,
  onChange,
  onBack,
  onNext,
}: {
  data: ShowData;
  onChange: (next: ShowData) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");

  const totalLabor = useMemo(
    () => data.labor.reduce((sum, tech) => sum + Number(tech.pay_rate || 0), 0),
    [data.labor]
  );

  function addLabor() {
    if (!name.trim() || !rate) return;
    onChange({
      ...data,
      labor: [
        ...data.labor,
        {
          technician_name: name.trim(),
          pay_rate: Number.parseFloat(rate) || 0,
        },
      ],
    });
    setName("");
    setRate("");
  }

  function removeLabor(index: number) {
    onChange({
      ...data,
      labor: data.labor.filter((_, i) => i !== index),
    });
  }

  return (
    <SectionCard title="Labor" subtitle="Add technicians and their pay rate for the show.">
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Technician Name</FieldLabel>
          <TextInput
            placeholder="Example: John Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Pay Rate</FieldLabel>
          <div className="flex gap-2">
            <TextInput
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
            <button
              type="button"
              onClick={addLabor}
              className="h-12 rounded-2xl bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {data.labor.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
            No labor entries added yet.
          </div>
        ) : (
          data.labor.map((tech, index) => (
            <div
              key={`${tech.technician_name}-${index}`}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-zinc-900">{tech.technician_name}</p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="text-base font-semibold text-zinc-900">
                  {currency(tech.pay_rate)}
                </span>
                <button
                  type="button"
                  onClick={() => removeLabor(index)}
                  className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <div className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white">
          Total Labor: {currency(totalLabor)}
        </div>
      </div>

      <ActionRow onBack={onBack} onNext={onNext} nextLabel="Continue to Summary" />
    </SectionCard>
  );
}

function SummaryRow({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative" | "purple";
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "negative"
      ? "text-rose-600"
      : tone === "purple"
      ? "text-violet-600"
      : "text-zinc-900";

  return (
    <div className="flex items-center justify-between border-b border-zinc-200 py-4 last:border-b-0">
      <span className="text-sm font-medium text-zinc-600">{label}</span>
      <span className={`text-lg font-bold ${toneClass}`}>{value}</span>
    </div>
  );
}

function SummaryStep({
  data,
  onChange,
  onBack,
  onReset,
}: {
  data: ShowData;
  onChange: (next: ShowData) => void;
  onBack: () => void;
  onReset: () => void;
}) {
  const totals = calculateTotals(data);

  function exportJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(data.name || "show-budget").replace(/\s+/g, "-").toLowerCase()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <SectionCard title="Summary" subtitle="Review the full budget and commission payout.">
      <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
        <h3 className="text-xl font-semibold text-zinc-900">{data.name || "Untitled Show"}</h3>
        <p className="mt-2 text-sm text-zinc-500">{formatDateRange(data.start_date, data.end_date)}</p>
        <p className="mt-1 text-sm text-zinc-500">{data.location || "No location entered"}</p>
      </div>

      <div className="mt-5 rounded-3xl border border-zinc-200 bg-white px-5">
        <SummaryRow label="Gross Income" value={currency(totals.grossIncome)} tone="positive" />
        <SummaryRow label="Total Expenses" value={`-${currency(totals.totalExpenses)}`} tone="negative" />
        <SummaryRow label="Total Labor" value={`-${currency(totals.totalLabor)}`} tone="negative" />
        <SummaryRow label="Net Before Commission" value={currency(totals.netBeforeCommission)} tone={totals.netBeforeCommission >= 0 ? "positive" : "negative"} />
      </div>

      <div className="mt-5 rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-zinc-900">Commission Payout</p>
            <p className="text-sm text-zinc-500">Enable a percentage payout based on net before commission.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...data,
                commission_enabled: !data.commission_enabled,
              })
            }
            className={[
              "relative inline-flex h-7 w-14 items-center rounded-full transition",
              data.commission_enabled ? "bg-zinc-900" : "bg-zinc-300",
            ].join(" ")}
          >
            <span
              className={[
                "inline-block h-5 w-5 transform rounded-full bg-white transition",
                data.commission_enabled ? "translate-x-8" : "translate-x-1",
              ].join(" ")}
            />
          </button>
        </div>

        {data.commission_enabled ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr] sm:items-center">
            <div>
              <FieldLabel>Commission %</FieldLabel>
              <TextInput
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={data.commission_percentage || ""}
                onChange={(e) =>
                  onChange({
                    ...data,
                    commission_percentage: Number.parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700">
              Commission Amount: {currency(totals.commissionAmount)}
            </div>
          </div>
        ) : null}
      </div>

      <div
        className={[
          "mt-5 rounded-3xl border p-6 text-center",
          totals.finalNetIncome >= 0
            ? "border-emerald-200 bg-emerald-50"
            : "border-rose-200 bg-rose-50",
        ].join(" ")}
      >
        <p className="text-sm font-medium text-zinc-500">Final Net Income</p>
        <p
          className={[
            "mt-2 text-4xl font-extrabold tracking-tight",
            totals.finalNetIncome >= 0 ? "text-emerald-600" : "text-rose-600",
          ].join(" ")}
        >
          {currency(totals.finalNetIncome)}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="h-12 rounded-2xl border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={exportJson}
          className="h-12 rounded-2xl border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={onReset}
          className="h-12 flex-1 rounded-2xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Start New Budget
        </button>
      </div>
    </SectionCard>
  );
}

export default function ShowBudgetApp() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<ShowData>(initialData);
  const totals = useMemo(() => calculateTotals(data), [data]);

  useEffect(() => {
    const raw = window.localStorage.getItem("show-budget-app-data");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as ShowData;
      setData({ ...initialData, ...parsed });
    } catch {
      // ignore invalid storage
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("show-budget-app-data", JSON.stringify(data));
  }, [data]);

  function resetAll() {
    setData(initialData);
    setCurrentStep(1);
    window.localStorage.removeItem("show-budget-app-data");
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Show Budget App
          </h1>
          <p className="mt-3 text-base text-zinc-600 sm:text-lg">
            Build a clean show budget, track expenses, labor, and final net income.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Gross</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">{currency(totals.grossIncome)}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Expenses</p>
            <p className="mt-2 text-2xl font-bold text-rose-600">{currency(totals.totalExpenses)}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Labor</p>
            <p className="mt-2 text-2xl font-bold text-amber-600">{currency(totals.totalLabor)}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Net</p>
            <p className={`mt-2 text-2xl font-bold ${totals.finalNetIncome >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {currency(totals.finalNetIncome)}
            </p>
          </div>
        </div>

        <StepIndicator currentStep={currentStep} onStepClick={setCurrentStep} />

        {currentStep === 1 ? (
          <ShowInfoStep data={data} onChange={setData} onNext={() => setCurrentStep(2)} />
        ) : null}

        {currentStep === 2 ? (
          <IncomeStep
            data={data}
            onChange={setData}
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        ) : null}

        {currentStep === 3 ? (
          <ExpensesStep
            data={data}
            onChange={setData}
            onBack={() => setCurrentStep(2)}
            onNext={() => setCurrentStep(4)}
          />
        ) : null}

        {currentStep === 4 ? (
          <LaborStep
            data={data}
            onChange={setData}
            onBack={() => setCurrentStep(3)}
            onNext={() => setCurrentStep(5)}
          />
        ) : null}

        {currentStep === 5 ? (
          <SummaryStep
            data={data}
            onChange={setData}
            onBack={() => setCurrentStep(4)}
            onReset={resetAll}
          />
        ) : null}
      </div>
    </main>
  );
}
