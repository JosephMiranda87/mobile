import {
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { inPeriod, money, Period, useFinance } from "../state/finance";
import "./Tab3.css";
import { CATEGORY_COLORS } from "../theme/chartColors";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Tab3: React.FC = () => {
  const { expenses, categories, accounts } = useFinance();
  const base = useMemo(() => new Date(), []);
  const [period, setPeriod] = useState<Period>("week");
  const [accountId, setAccountId] = useState<string>("all");

  const filtered = useMemo(() => {
    const p = expenses.filter((e) => inPeriod(e.date, period, base));
    if (accountId === "all") return p;
    return p.filter((e) => e.accountId === accountId);
  }, [expenses, period, base, accountId]);

  const total = useMemo(() => filtered.reduce((a, x) => a + x.amount, 0), [filtered]);

  // Bar por categoría
  const byCat = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of filtered) map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amount);

    const labels = categories.map((c) => c.name);
    const data = categories.map((c) => map.get(c.id) ?? 0);

    return { labels, data };
  }, [filtered, categories]);

  const chartData = useMemo(() => {
    const colors = categories.map((c) => CATEGORY_COLORS[c.id]);

    return {
      labels: byCat.labels,
      datasets: [
        {
          label: "Gasto (USD)",
          data: byCat.data,
          backgroundColor: colors,
          borderColor: "#ffffff",
          borderWidth: 1,
          borderRadius: 10,
        },
      ],
    };
  }, [byCat, categories]);


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
            <h2 style={{ margin: 0, fontWeight: 900 }}>Gasto total: {money(total)}</h2>
          </IonText>

          <div className="ana-controls">
            <IonSegment value={period} onIonChange={(e) => setPeriod(e.detail.value as Period)}>
              <IonSegmentButton value="day"><IonText>Día</IonText></IonSegmentButton>
              <IonSegmentButton value="week"><IonText>Semana</IonText></IonSegmentButton>
              <IonSegmentButton value="month"><IonText>Mes</IonText></IonSegmentButton>
            </IonSegment>

            <IonSelect value={accountId} onIonChange={(e) => setAccountId(e.detail.value)} interface="popover">
              <IonSelectOption value="all">Todas las cuentas</IonSelectOption>
              {accounts.map((a) => (
                <IonSelectOption key={a.id} value={a.id}>
                  {a.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>
        </div>

        <div className="ion-padding" style={{ paddingBottom: 24 }}>
          <IonCard className="ana-card">
            <IonCardContent>
              <IonText>
                <h3 style={{ marginTop: 0 }}>Gastos por categoría</h3>
              </IonText>
              {filtered.length === 0 ? (
                <IonText color="medium">
                  <p style={{ margin: 0 }}>No hay gastos en este período.</p>
                </IonText>
              ) : (
                <Bar data={chartData} />
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
