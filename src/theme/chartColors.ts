import type { BankId, CategoryId } from "../state/finance";

export const BANK_COLORS: Record<BankId, string> = {
  pichincha: "#F59E0B",      // ámbar
  guayaquil: "#3B82F6",      // azul
  produbanco: "#10B981",     // verde
  pacifico: "#06B6D4",       // cian
  bolivariano: "#8B5CF6",    // morado
  internacional: "#EF4444",  // rojo
  austro: "#14B8A6",         // teal
  coop: "#A3E635",           // lima
  cash: "#64748B",           // gris
  other: "#F43F5E",          // rosa
};

export const CATEGORY_COLORS: Record<CategoryId, string> = {
  food: "#22C55E",       // verde
  transport: "#3B82F6",  // azul
  leisure: "#A855F7",    // violeta
  bills: "#F97316",      // naranja
  health: "#EF4444",     // rojo
  shopping: "#06B6D4",   // cian
  home: "#F59E0B",       // ámbar
  other: "#64748B",      // gris
};
