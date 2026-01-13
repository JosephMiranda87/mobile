import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { FinanceProvider } from "./state/finance";

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
    <FinanceProvider>
      <App />
    </FinanceProvider>
);
