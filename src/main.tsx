import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ExpensesProvider } from "./state/expenses";

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ExpensesProvider>
      <App />
    </ExpensesProvider>
  </React.StrictMode>
);
