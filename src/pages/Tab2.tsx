import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonText,
} from "@ionic/react";
import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { monthKey, useExpenses } from "../state/expenses";
import "./Tab2.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function money(n: number) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(n);
}

const Tab2: React.FC = () => {
  const { expenses, categories } = useExpenses();

  const currentMonth = useMemo(() => monthKey(new Date()), []);

  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => monthKey(new Date(e.date)) === currentMonth);
  }, [expenses, currentMonth]);

  const total = useMemo(() => monthExpenses.reduce((a, e) => a + e.amount, 0), [monthExpenses]);

  const byCat = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of monthExpenses) map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amount);

    const rows = categories
      .map((c) => ({ id: c.id, name: c.name, value: map.get(c.id) ?? 0 }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value);

    return rows;
  }, [monthExpenses, categories]);

  const chartData = useMemo(
    () => ({
      labels: byCat.map((x) => x.name),
      datasets: [
        {
          data: byCat.map((x) => x.value),
        },
      ],
    }),
    [byCat]
  );

  return (
    <IonPage>
      <IonHeader className="sum-header" translucent>
        <IonToolbar className="sum-toolbar">
          <IonTitle>Resumen</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {/* HERO */}
        <div className="sum-hero">
          <IonText>
            <h2 style={{ margin: 0, fontWeight: 900 }}>Resumen del mes</h2>
          </IonText>
          <IonText color="medium">
            <p style={{ marginTop: 6, marginBottom: 0 }}>
              Mes: <b>{currentMonth}</b> • Categorías con mayor gasto
            </p>
          </IonText>
        </div>

        {/* TOTAL */}
        <div className="ion-padding">
          <IonCard className="sum-card-gradient">
            <IonCardHeader>
              <IonCardTitle style={{ color: "white" }}>Total gastado</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="sum-total">{money(total)}</div>
              <IonText color="light">
                <p style={{ marginTop: 8, opacity: 0.9 }}>
                  {byCat.length > 0
                    ? `Top: ${byCat[0].name} (${money(byCat[0].value)})`
                    : "Registra gastos para ver tu resumen."}
                </p>
              </IonText>
            </IonCardContent>
          </IonCard>
        </div>

        {/* GRAFICO */}
        <div className="ion-padding" style={{ paddingTop: 0 }}>
          <IonCard className="sum-card">
            <IonCardHeader>
              <IonCardTitle>Gasto por categoría</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {byCat.length === 0 ? (
                <IonText color="medium">
                  <p style={{ margin: 0 }}>No hay datos para graficar.</p>
                </IonText>
              ) : (
                <Doughnut data={chartData} />
              )}
            </IonCardContent>
          </IonCard>
        </div>

        {/* LISTA RESUMEN */}
        <div className="ion-padding" style={{ paddingTop: 0, paddingBottom: 24 }}>
          <IonCard className="sum-card">
            <IonCardHeader>
              <IonCardTitle>Detalle por categoría</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {byCat.length === 0 ? (
                <IonText color="medium">
                  <p style={{ margin: 0 }}>Aún no hay categorías con gasto.</p>
                </IonText>
              ) : (
                <div className="sum-list">
                  {byCat.map((c) => {
                    const pct = total > 0 ? Math.round((c.value / total) * 100) : 0;
                    return (
                      <div key={c.id} className="sum-row">
                        <div className="sum-row-left">
                          <div className="sum-dot" />
                          <div>
                            <div className="sum-name">{c.name}</div>
                            <div className="sum-meta">{pct}% del total</div>
                          </div>
                        </div>
                        <div className="sum-value">{money(c.value)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
