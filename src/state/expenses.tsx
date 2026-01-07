import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CategoryId = "food" | "transport" | "leisure" | "bills" | "health" | "other";

export type Category = {
  id: CategoryId;
  name: string;
};

export type Expense = {
  id: string;
  amount: number;
  categoryId: CategoryId;
  date: string; // ISO string
  note?: string;
};

const CATEGORIES: Category[] = [
  { id: "food", name: "Comida" },
  { id: "transport", name: "Transporte" },
  { id: "leisure", name: "Ocio" },
  { id: "bills", name: "Servicios" },
  { id: "health", name: "Salud" },
  { id: "other", name: "Otros" },
];

const STORAGE_KEY = "expenses_v1";

type ExpensesCtx = {
  categories: Category[];
  expenses: Expense[];
  addExpense: (e: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;
};

const ExpensesContext = createContext<ExpensesCtx | null>(null);

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setExpenses(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const addExpense: ExpensesCtx["addExpense"] = (e) => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    setExpenses((prev) => [{ id, ...e }, ...prev]);
  };

  const deleteExpense: ExpensesCtx["deleteExpense"] = (id) => {
    setExpenses((prev) => prev.filter((x) => x.id !== id));
  };

  const value = useMemo(
    () => ({ categories: CATEGORIES, expenses, addExpense, deleteExpense }),
    [expenses]
  );

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpenses must be used inside ExpensesProvider");
  return ctx;
}

export function monthKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
