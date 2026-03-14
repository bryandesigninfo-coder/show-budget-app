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

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

function calculateTotals(data: ShowData) {
  const grossIncome = Number(data.gross_income || 0);
  const totalExpenses = data.expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalLabor = data.labor.reduce((sum, l) => sum + Number(l.pay_rate || 0), 0);
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

export default function Page() {
  const [data, setData] = useState<ShowData>(initialData);
  const [expenseType, setExpenseType] = useState<ExpenseType>("food");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [laborName, setLaborName] = useState("");
  const [laborRate, setLaborRate] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("show-budget-app");
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("show-budget-app", JSON.stringify(data));
  }, [data]);

  const totals = useMemo(() => calculateTotals(data), [data]);

  function addExpense() {
    if (!expenseAmount) return;
    setData({
      ...data,
      expenses: [
        ...data.expenses,
        {
          type: expenseType,
          description: expenseDescription,
          amount: parseFloat(expenseAmount) || 0,
        },
      ],
    });
    setExpenseDescription("");
    setExpenseAmount("");
  }

  function addLabor() {
    if (!laborName || !laborRate) return;
    setData({
      ...data,
      labor: [
        ...data.labor,
        {
          technician_name: laborName,
          pay_rate: parseFloat(laborRate) || 0,
        },
      ],
    });
    setLaborName("");
    setLaborRate("");
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 36, marginBottom: 8 }}>Show Budget App</h1>
      <p style={{ color: "#52525b", marginBottom: 24 }}>
        Simple show budget builder for income, expenses, labor, and commission.
      </p>

      <div style={{ background: "white", padding: 20, borderRadius: 16, marginBottom: 20 }}>
        <h2>Show Info</h2>
        <div style={{ display: "grid", gap: 12 }}>
          <input placeholder="Show name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
          <input type="date" value={data.start_date} onChange={(e) => setData({ ...data, start_date: e.target.value })} />
          <input type="date" value={data.end_date} onChange={(e) => setData({ ...data, end_date: e.target.value })} />
          <input placeholder="Location" value={data.location} onChange={(e) => setData({ ...data, location: e.target.value })} />
          <input
            type="number"
            step="0.01"
            placeholder="Gross income"
            value={data.gross_income || ""}
            onChange={(e) => setData({ ...data, gross_income: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div style={{ background: "white", padding: 20, borderRadius: 16, marginBottom: 20 }}>
        <h2>Expenses</h2>
        <div style={{ display: "grid", gap: 12, marginBottom: 12 }}>
          <select value={expenseType} onChange={(e) => setExpenseType(e.target.value as ExpenseType)}>
            <option value="food">Food</option>
            <option value="perdiem">Per Diem</option>
            <option value="transportation">Transportation</option>
            <option value="rentals">Rentals</option>
          </select>
          <input placeholder="Description" value={expenseDescription} onChange={(e) => setExpenseDescription(e.target.value)} />
          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
          />
          <button onClick={addExpense}>Add Expense</button>
        </div>

        {data.expenses.map((expense, index) => (
          <div key={index} style={{ padding: 8, borderTop: "1px solid #e4e4e7" }}>
            {expense.type} — {expense.description || "No description"} — {currency(expense.amount)}
          </div>
        ))}
      </div>

      <div style={{ background: "white", padding: 20, borderRadius: 16, marginBottom: 20 }}>
        <h2>Labor</h2>
        <div style={{ display: "grid", gap: 12, marginBottom: 12 }}>
          <input placeholder="Technician name" value={laborName} onChange={(e) => setLaborName(e.target.value)} />
          <input
            type="number"
            step="0.01"
            placeholder="Pay rate"
            value={laborRate}
            onChange={(e) => setLaborRate(e.target.value)}
          />
          <button onClick={addLabor}>Add Labor</button>
        </div>

        {data.labor.map((tech, index) => (
          <div key={index} style={{ padding: 8, borderTop: "1px solid #e4e4e7" }}>
            {tech.technician_name} — {currency(tech.pay_rate)}
          </div>
        ))}
      </div>

      <div style={{ background: "white", padding: 20, borderRadius: 16 }}>
        <h2>Summary</h2>
        <p>Gross Income: {currency(totals.grossIncome)}</p>
        <p>Total Expenses: {currency(totals.totalExpenses)}</p>
        <p>Total Labor: {currency(totals.totalLabor)}</p>
        <p>Net Before Commission: {currency(totals.netBeforeCommission)}</p>

        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <label style={{ marginRight: 12 }}>
            <input
              type="checkbox"
              checked={data.commission_enabled}
              onChange={(e) => setData({ ...data, commission_enabled: e.target.checked })}
            />{" "}
            Enable Commission
          </label>

          {data.commission_enabled && (
            <input
              type="number"
              step="0.01"
              placeholder="Commission %"
              value={data.commission_percentage || ""}
              onChange={(e) =>
                setData({ ...data, commission_percentage: parseFloat(e.target.value) || 0 })
              }
            />
          )}
        </div>

        <p>Commission Amount: {currency(totals.commissionAmount)}</p>
        <h3>Final Net Income: {currency(totals.finalNetIncome)}</h3>
      </div>
    </main>
  );
}
