import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonPage,
  IonProgressBar,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { checkmarkCircleOutline, warningOutline } from "ionicons/icons";
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
  const hasBudget = Number.isFinite(budgetN) && budgetN > 0;

  const progress = useMemo(() => {
    if (!hasBudget) return 0;
    return Math.min(monthTotal / budgetN, 1);
  }, [monthTotal, budgetN, hasBudget]);

  const remaining = useMemo(() => {
    if (!hasBudget) return null;
    return budgetN - monthTotal;
  }, [budgetN, monthTotal, hasBudget]);

  const status = useMemo(() => {
    if (!hasBudget) return "none";
    if (remaining !== null && remaining < 0) return "over";
    if (progress >= 0.85) return "warn";
    return "ok";
  }, [hasBudget, remaining, progress]);

  return (
    <IonPage>
      <IonHeader className="bud-header" translucent>
        <IonToolbar className="bud-toolbar">
          <IonTitle>Presupuesto</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {/* HERO */}
        <div className="bud-hero">
          <IonText>
            <h2 style={{ margin: 0, fontWeight: 900 }}>Control mensual</h2>
          </IonText>
          <IonText color="medium">
            <p style={{ marginTop: 6, marginBottom: 0 }}>
              Mes: <b>{currentMonth}</b> • Define tu límite y revisa tu progreso
            </p>
          </IonText>
        </div>

        {/* CARD: DEFINIR PRESUPUESTO */}
        <div className="ion-padding">
          <IonCard className="bud-card">
            <IonCardHeader>
              <IonCardTitle>Definir presupuesto mensual</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText color="medium">
                <p style={{ marginTop: 0 }}>
                  Ingresa el presupuesto para este mes (USD). Ejemplo: <b>150</b>
                </p>
              </IonText>

              <IonInput
                className="bud-input"
                inputMode="decimal"
                value={budget}
                placeholder="Ej: 150"
                onIonInput={(e) => setBudget(String(e.detail.value ?? ""))}
              />

              <div style={{ height: 12 }} />

              <IonButton expand="block" color="primary" onClick={saveBudget}>
                Guardar presupuesto
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>

        {/* CARD: PROGRESO */}
        <div className="ion-padding" style={{ paddingTop: 0, paddingBottom: 24 }}>
          <IonCard className="bud-card-gradient">
            <IonCardHeader>
              <IonCardTitle style={{ color: "white" }}>Progreso del mes</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <div className="bud-kpis">
                <div className="bud-kpi">
                  <div className="bud-kpi-label">Gastado</div>
                  <div className="bud-kpi-value">{money(monthTotal)}</div>
                </div>

                <div className="bud-kpi">
                  <div className="bud-kpi-label">Presupuesto</div>
                  <div className="bud-kpi-value">
                    {hasBudget ? money(budgetN) : "—"}
                  </div>
                </div>
              </div>

              <div style={{ height: 10 }} />

              <IonProgressBar className="bud-progress" value={progress} />

              <div style={{ height: 12 }} />

              {/* Mensaje de estado */}
              {status === "none" && (
                <IonText color="light">
                  <p style={{ margin: 0, opacity: 0.9 }}>
                    Define un presupuesto para calcular el restante.
                  </p>
                </IonText>
              )}

              {status === "ok" && remaining !== null && (
                <div className="bud-status ok">
                  <IonIcon icon={checkmarkCircleOutline} />
                  <span>
                    Vas bien. Restante: <b>{money(remaining)}</b>
                  </span>
                </div>
              )}

              {status === "warn" && remaining !== null && remaining >= 0 && (
                <div className="bud-status warn">
                  <IonIcon icon={warningOutline} />
                  <span>
                    Estás cerca del límite. Restante: <b>{money(remaining)}</b>
                  </span>
                </div>
              )}

              {status === "over" && remaining !== null && (
                <div className="bud-status over">
                  <IonIcon icon={warningOutline} />
                  <span>
                    Te excediste por: <b>{money(Math.abs(remaining))}</b>
                  </span>
                </div>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
