import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from "@ionic/react";
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
  const monthExpenses = useMemo(
    () => expenses.filter((e) => monthKey(new Date(e.date)) === currentMonth),
    [expenses, currentMonth]
  );

  const total = useMemo(() => monthExpenses.reduce((a, e) => a + e.amount, 0), [monthExpenses]);

  const byCat = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of monthExpenses) map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amount);
    return categories
      .map((c) => ({ name: c.name, value: map.get(c.id) ?? 0 }))
      .filter((x) => x.value > 0);
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
      <IonHeader>
        <IonToolbar>
          <IonTitle>Resumen</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Total del mes ({currentMonth})</IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ fontSize: 22, fontWeight: 700 }}>
            {money(total)}
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Gasto por categoría</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {byCat.length === 0 ? (
              <p>No hay datos para graficar.</p>
            ) : (
              <Doughnut data={chartData} />
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
