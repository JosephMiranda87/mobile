import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonProgressBar,
  IonTitle,
  IonToolbar,
  IonText,
} from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { monthKey, useExpenses } from "../state/expenses";
import "./Tab3.css";

const BUDGET_KEY = "budget_monthly_v1";

function money(n: number) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(n);
}

const Tab3: React.FC = () => {
  const { expenses } = useExpenses();
  const currentMonth = useMemo(() => monthKey(new Date()), []);
  const monthTotal = useMemo(() => {
    return expenses
      .filter((e) => monthKey(new Date(e.date)) === currentMonth)
      .reduce((a, e) => a + e.amount, 0);
  }, [expenses, currentMonth]);

  const [budget, setBudget] = useState<string>("");

  useEffect(() => {
    const raw = localStorage.getItem(BUDGET_KEY);
    if (raw) setBudget(raw);
  }, []);

  function saveBudget() {
    localStorage.setItem(BUDGET_KEY, budget);
  }

  const budgetN = Number(budget);
  const progress = useMemo(() => {
    if (!Number.isFinite(budgetN) || budgetN <= 0) return 0;
    return Math.min(monthTotal / budgetN, 1);
  }, [monthTotal, budgetN]);

  const remaining = useMemo(() => {
    if (!Number.isFinite(budgetN) || budgetN <= 0) return null;
    return budgetN - monthTotal;
  }, [budgetN, monthTotal]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Presupuesto</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Presupuesto mensual ({currentMonth})</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonInput
              inputMode="decimal"
              value={budget}
              placeholder="Ej: 150"
              onIonInput={(e) => setBudget(String(e.detail.value ?? ""))}
            />
            <div style={{ height: 12 }} />
            <IonButton expand="block" onClick={saveBudget}>
              Guardar presupuesto
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Progreso</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>
              <p style={{ marginTop: 0 }}>
                Gastado: <b>{money(monthTotal)}</b>
              </p>
            </IonText>

            <IonProgressBar value={progress} />

            <div style={{ height: 12 }} />

            {remaining === null ? (
              <IonText color="medium">
                <p>Define un presupuesto para ver el restante.</p>
              </IonText>
            ) : remaining >= 0 ? (
              <IonText color="success">
                <p>Restante: <b>{money(remaining)}</b></p>
              </IonText>
            ) : (
              <IonText color="danger">
                <p>Te excediste por: <b>{money(Math.abs(remaining))}</b></p>
              </IonText>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
