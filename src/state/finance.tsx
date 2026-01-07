import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type BankId =
  | "pichincha"
  | "guayaquil"
  | "produbanco"
  | "pacifico"
  | "bolivariano"
  | "internacional"
  | "austro"
  | "coop"
  | "cash"
  | "other";

export type Account = {
  id: string;
  bankId: BankId;
  name: string; // Ej: "Pichincha - Ahorros"
  balance: number; // saldo actual
};

export type CategoryId =
  | "food"
  | "transport"
  | "leisure"
  | "bills"
  | "health"
  | "shopping"
  | "home"
  | "other";

export type Category = { id: CategoryId; name: string };

export type Expense = {
  id: string;
  amount: number;
  categoryId: CategoryId;
  accountId: string;
  date: string; // ISO
  note?: string;
};

const STORAGE_KEY = "finance_v1";

const BANKS: { id: BankId; name: string }[] = [
  { id: "pichincha", name: "Banco Pichincha" },
  { id: "guayaquil", name: "Banco Guayaquil" },
  { id: "produbanco", name: "Produbanco" },
  { id: "pacifico", name: "Banco del Pacífico" },
  { id: "bolivariano", name: "Banco Bolivariano" },
  { id: "internacional", name: "Banco Internacional" },
  { id: "austro", name: "Banco del Austro" },
  { id: "coop", name: "Cooperativa" },
  { id: "cash", name: "Efectivo" },
  { id: "other", name: "Otro" },
];

const CATEGORIES: Category[] = [
  { id: "food", name: "Alimentación" },
  { id: "transport", name: "Transporte" },
  { id: "leisure", name: "Ocio" },
  { id: "bills", name: "Servicios" },
  { id: "health", name: "Salud" },
  { id: "shopping", name: "Compras" },
  { id: "home", name: "Hogar" },
  { id: "other", name: "Otros" },
];

type FinanceState = {
  banks: typeof BANKS;
  categories: Category[];
  accounts: Account[];
  expenses: Expense[];
  addAccount: (a: Omit<Account, "id">) => void;
  updateAccountBalance: (accountId: string, balance: number) => void;
  deleteAccount: (accountId: string) => void;

  addExpense: (e: Omit<Expense, "id">) => void;
  deleteExpense: (expenseId: string) => void;
};

const FinanceContext = createContext<FinanceState | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setAccounts(parsed.accounts ?? []);
        setExpenses(parsed.expenses ?? []);
      } else {
        setAccounts([
          {
            id: "cash_default",
            bankId: "cash",
            name: "Efectivo",
            balance: 0,
          },
        ]);
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accounts, expenses }));
  }, [accounts, expenses]);

  const addAccount: FinanceState["addAccount"] = (a) => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    setAccounts((prev) => [...prev, { id, ...a }]);
  };

  const updateAccountBalance: FinanceState["updateAccountBalance"] = (accountId, balance) => {
    setAccounts((prev) => prev.map((x) => (x.id === accountId ? { ...x, balance } : x)));
  };

  const deleteAccount: FinanceState["deleteAccount"] = (accountId) => {
    setAccounts((prev) => prev.filter((x) => x.id !== accountId));
  };

  const addExpense: FinanceState["addExpense"] = (e) => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;

    // Descuenta del saldo de la cuenta
    setAccounts((prev) =>
      prev.map((a) => (a.id === e.accountId ? { ...a, balance: a.balance - e.amount } : a))
    );

    setExpenses((prev) => [{ id, ...e }, ...prev]);
  };

  const deleteExpense: FinanceState["deleteExpense"] = (expenseId) => {
    setExpenses((prev) => {
      const found = prev.find((x) => x.id === expenseId);
      if (!found) return prev;

      // Reintegra el monto a la cuenta (undo)
      setAccounts((accs) =>
        accs.map((a) => (a.id === found.accountId ? { ...a, balance: a.balance + found.amount } : a))
      );

      return prev.filter((x) => x.id !== expenseId);
    });
  };

  const value = useMemo(
    () => ({
      banks: BANKS,
      categories: CATEGORIES,
      accounts,
      expenses,
      addAccount,
      updateAccountBalance,
      deleteAccount,
      addExpense,
      deleteExpense,
    }),
    [accounts, expenses]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
}

export function money(n: number) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(n);
}

export type Period = "day" | "week" | "month";

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
export function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

// Semana: Lunes a Domingo
export function startOfWeek(d: Date) {
  const day = d.getDay(); // 0=Dom ... 1=Lun
  const diff = (day === 0 ? -6 : 1 - day);
  const s = new Date(d);
  s.setDate(d.getDate() + diff);
  return startOfDay(s);
}
export function endOfWeek(d: Date) {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  return endOfDay(e);
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
export function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function inPeriod(dateISO: string, period: Period, base: Date) {
  const dt = new Date(dateISO);
  let a: Date, b: Date;
  if (period === "day") {
    a = startOfDay(base);
    b = endOfDay(base);
  } else if (period === "week") {
    a = startOfWeek(base);
    b = endOfWeek(base);
  } else {
    a = startOfMonth(base);
    b = endOfMonth(base);
  }
  return dt >= a && dt <= b;
}
