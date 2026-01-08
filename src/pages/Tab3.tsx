import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonDatetime,
  IonHeader,
  IonIcon,
  IonInput,
  IonModal,
  IonProgressBar,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
  IonPage,
} from "@ionic/react";
import {
  calendarOutline,
  chevronBackOutline,
  chevronForwardOutline,
  repeatOutline,
  closeOutline,
} from "ionicons/icons";
import { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { CATEGORY_COLORS } from "../theme/chartColors";
import {
  inPeriod,
  money,
  Period,
  startOfWeek,
  startOfMonth,
  useFinance,
} from "../state/finance";
import "./Tab3.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type BudgetScope = "all" | string; 

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function periodKey(period: Period, base: Date) {
  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, "0");
  const d = String(base.getDate()).padStart(2, "0");

  if (period === "day") return `${y}-${m}-${d}`;
  if (period === "month") return `${y}-${m}`;
  // week -> usamos la fecha de inicio de semana (lunes)
  const s = startOfWeek(base);
  const ys = s.getFullYear();
  const ms = String(s.getMonth() + 1).padStart(2, "0");
  const ds = String(s.getDate()).padStart(2, "0");
  return `${ys}-${ms}-${ds}`;
}

function formatMonthLabel(d: Date) {
  return d.toLocaleDateString("es-EC", { month: "long", year: "numeric" });
}
function formatDayLabel(d: Date) {
  return d.toLocaleDateString("es-EC", { weekday: "long", day: "2-digit", month: "long" });
}
function formatWeekLabel(d: Date) {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  const sTxt = s.toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
  const eTxt = e.toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
  return `${sTxt} – ${eTxt}`;
}

const Tab3: React.FC = () => {
  const { expenses, categories, accounts } = useFinance();

  // Periodo + fecha base seleccionable
  const [period, setPeriod] = useState<Period>("week");
  const [baseISO, setBaseISO] = useState<string>(new Date().toISOString());
  const baseDate = useMemo(() => new Date(baseISO), [baseISO]);
  const [dateModal, setDateModal] = useState(false);

  // Filtro principal por cuenta
  const [accountId, setAccountId] = useState<string>("all");

  // Comparación (solo cuando accountId != "all")
  const [compareOn, setCompareOn] = useState(false);
  const [compareAccountId, setCompareAccountId] = useState<string>("");

  // Presupuesto (por periodo + cuenta o all)
  const [budget, setBudget] = useState<string>("");
  const budgetScope: BudgetScope = accountId === "all" ? "all" : accountId;

  const pKey = useMemo(() => periodKey(period, baseDate), [period, baseDate]);
  const budgetStorageKey = useMemo(
    () => `budget_v1:${budgetScope}:${period}:${pKey}`,
    [budgetScope, period, pKey]
  );

  // Carga presupuesto cuando cambias periodo/base/cuenta
  useEffect(() => {
    const raw = localStorage.getItem(budgetStorageKey);
    setBudget(raw ?? "");
  }, [budgetStorageKey]);

  function saveBudget() {
    // permite vacío para “borrar”
    const n = Number(budget);
    if (budget.trim() === "") {
      localStorage.removeItem(budgetStorageKey);
      return;
    }
    if (!Number.isFinite(n) || n <= 0) return;
    localStorage.setItem(budgetStorageKey, String(n));
  }

  function movePeriod(step: -1 | 1) {
    const d = new Date(baseDate);
    if (period === "day") d.setDate(d.getDate() + step);
    else if (period === "week") d.setDate(d.getDate() + step * 7);
    else d.setMonth(d.getMonth() + step);
    setBaseISO(d.toISOString());
  }

  const periodLabel = useMemo(() => {
    if (period === "day") return formatDayLabel(baseDate);
    if (period === "week") return `Semana: ${formatWeekLabel(baseDate)}`;
    return `Mes: ${formatMonthLabel(baseDate)}`;
  }, [period, baseDate]);

  const accName = (id: string) =>
    accounts.find((a) => a.id === id)?.name ?? "Cuenta";

  // Asegurar compareAccountId válido cuando habilitas comparación
  useEffect(() => {
    if (accountId === "all") {
      setCompareOn(false);
      setCompareAccountId("");
      return;
    }
    if (!compareOn) return;

    // Si no hay compareAccountId o coincide con la principal, elige la primera distinta
    if (!compareAccountId || compareAccountId === accountId) {
      const firstOther = accounts.find((a) => a.id !== accountId)?.id ?? "";
      setCompareAccountId(firstOther);
    }
  }, [accountId, compareOn, compareAccountId, accounts]);

  // Filtrado por periodo
  const periodExpenses = useMemo(
    () => expenses.filter((e) => inPeriod(e.date, period, baseDate)),
    [expenses, period, baseDate]
  );

  // Principal: todas o una cuenta
  const primaryExpenses = useMemo(() => {
    if (accountId === "all") return periodExpenses;
    return periodExpenses.filter((e) => e.accountId === accountId);
  }, [periodExpenses, accountId]);

  // Comparación: otra cuenta
  const compExpenses = useMemo(() => {
    if (!compareOn || accountId === "all" || !compareAccountId) return [];
    return periodExpenses.filter((e) => e.accountId === compareAccountId);
  }, [periodExpenses, compareOn, accountId, compareAccountId]);

  const totalPrimary = useMemo(
    () => primaryExpenses.reduce((a, x) => a + x.amount, 0),
    [primaryExpenses]
  );

  // Presupuesto y progreso
  const budgetN = Number(budget);
  const hasBudget = Number.isFinite(budgetN) && budgetN > 0;

  const budgetProgress = useMemo(() => {
    if (!hasBudget) return 0;
    return Math.min(totalPrimary / budgetN, 1);
  }, [hasBudget, totalPrimary, budgetN]);

  const budgetRemaining = useMemo(() => {
    if (!hasBudget) return null;
    return budgetN - totalPrimary;
  }, [hasBudget, budgetN, totalPrimary]);

  // Sumatoria por categoría 
  const byCategory = (arr: typeof expenses) => {
    const map = new Map<string, number>();
    for (const e of arr) map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amount);
    const labels = categories.map((c) => c.name);
    const data = categories.map((c) => map.get(c.id) ?? 0);
    return { labels, data };
  };

  const primaryByCat = useMemo(() => byCategory(primaryExpenses), [primaryExpenses, categories]);
  const compByCat = useMemo(() => byCategory(compExpenses), [compExpenses, categories]);

  // Colores por categoría 
  const colors1 = useMemo(
    () => categories.map((c) => CATEGORY_COLORS[c.id]),
    [categories]
  );
  const colors2 = useMemo(
    () => categories.map((c) => hexToRgba(CATEGORY_COLORS[c.id], 0.35)),
    [categories]
  );

  const chartData = useMemo(() => {
    const datasets: any[] = [
      {
        label: accountId === "all" ? "Todas las cuentas" : accName(accountId),
        data: primaryByCat.data,
        backgroundColor: colors1,
        borderColor: "#ffffff",
        borderWidth: 1,
        borderRadius: 10,
      },
    ];

    if (compareOn && accountId !== "all" && compareAccountId) {
      datasets.push({
        label: accName(compareAccountId),
        data: compByCat.data,
        backgroundColor: colors2,
        borderColor: "#ffffff",
        borderWidth: 1,
        borderRadius: 10,
      });
    }

    return {
      labels: primaryByCat.labels,
      datasets,
    };
  }, [
    accountId,
    compareOn,
    compareAccountId,
    primaryByCat,
    compByCat,
    colors1,
    colors2,
    categories,
    accounts,
  ]);

  const options = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { position: "bottom" as const },
        tooltip: { mode: "index" as const, intersect: false },
      },
      scales: {
        x: { stacked: false },
        y: { beginAtZero: true },
      },
    }),
    []
  );

  return (
    <IonPage>
      <IonHeader className="ana-header" translucent>
        <IonToolbar className="ana-toolbar">
          <IonTitle>Analítica</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="ana-hero">
          <IonText>
            <h2 style={{ margin: 0, fontWeight: 900 }}>
              Gasto total: {money(totalPrimary)}
            </h2>
          </IonText>

          <div className="ana-controls">
            {/*Período */}
            <IonSegment value={period} onIonChange={(e) => setPeriod(e.detail.value as Period)}>
              <IonSegmentButton value="day"><IonText>Día</IonText></IonSegmentButton>
              <IonSegmentButton value="week"><IonText>Semana</IonText></IonSegmentButton>
              <IonSegmentButton value="month"><IonText>Mes</IonText></IonSegmentButton>
            </IonSegment>

            {/*Navegación de fecha */}
            <div className="ana-range-row">
              <IonButton fill="clear" onClick={() => movePeriod(-1)}>
                <IonIcon icon={chevronBackOutline} />
              </IonButton>

              <IonButton className="ana-range-btn" onClick={() => setDateModal(true)}>
                <IonIcon icon={calendarOutline} style={{ marginRight: 8 }} />
                {periodLabel}
              </IonButton>

              <IonButton fill="clear" onClick={() => movePeriod(1)}>
                <IonIcon icon={chevronForwardOutline} />
              </IonButton>
            </div>

            {/*Cuenta principal */}
            <IonSelect
              value={accountId}
              onIonChange={(e) => setAccountId(e.detail.value)}
              interface="popover"
            >
              <IonSelectOption value="all">Todas las cuentas</IonSelectOption>
              {accounts.map((a) => (
                <IonSelectOption key={a.id} value={a.id}>
                  {a.name}
                </IonSelectOption>
              ))}
            </IonSelect>

            {/* Comparar: solo aparece si eliges una cuenta */}
            {accountId !== "all" && (
              <div className="ana-compare">
                <IonButton
                  size="small"
                  color={compareOn ? "secondary" : "medium"}
                  onClick={() => setCompareOn((v) => !v)}
                >
                  <IonIcon icon={compareOn ? closeOutline : repeatOutline} style={{ marginRight: 8 }} />
                  {compareOn ? "Quitar comparación" : "Comparar con otra cuenta"}
                </IonButton>

                {compareOn && (
                  <IonSelect
                    value={compareAccountId}
                    onIonChange={(e) => setCompareAccountId(e.detail.value)}
                    interface="popover"
                  >
                    {accounts
                      .filter((a) => a.id !== accountId)
                      .map((a) => (
                        <IonSelectOption key={a.id} value={a.id}>
                          {a.name}
                        </IonSelectOption>
                      ))}
                  </IonSelect>
                )}
              </div>
            )}
          </div>
        </div>

        {/* GRAFICO */}
        <div className="ion-padding" style={{ paddingBottom: 24 }}>
          <IonCard className="ana-card">
            <IonCardContent>
              <IonText>
                <h3 style={{ marginTop: 0 }}>Gastos por categoría</h3>
              </IonText>

              {primaryExpenses.length === 0 ? (
                <IonText color="medium">
                  <p style={{ margin: 0 }}>No hay gastos en este período.</p>
                </IonText>
              ) : (
                <Bar data={chartData} options={options} />
              )}
            </IonCardContent>
          </IonCard>
        </div>

        {/* Modal selector de fecha */}
        <IonModal isOpen={dateModal} onDidDismiss={() => setDateModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Elegir fecha</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonDatetime
              presentation="date"
              value={baseISO}
              onIonChange={(e) => setBaseISO(String(e.detail.value))}
            />
            <div style={{ height: 12 }} />
            <IonButton expand="block" onClick={() => setDateModal(false)}>
              Listo
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
