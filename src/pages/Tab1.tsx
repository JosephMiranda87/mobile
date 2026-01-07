import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  IonText,
} from "@ionic/react";
import { add, trash } from "ionicons/icons";
import { useMemo, useState } from "react";
import ExpenseFormModal from "../components/ExpenseFormModal";
import { monthKey, useExpenses } from "../state/expenses";
import "./Tab1.css";

function money(n: number) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(n);
}

const Tab1: React.FC = () => {
  const { expenses, categories, deleteExpense } = useExpenses();
  const [open, setOpen] = useState(false);

  const currentMonth = useMemo(() => monthKey(new Date()), []);
  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => monthKey(new Date(e.date)) === currentMonth);
  }, [expenses, currentMonth]);

  const total = useMemo(
    () => monthExpenses.reduce((acc, e) => acc + e.amount, 0),
    [monthExpenses]
  );

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Gastos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="ion-padding">
          <IonText>
            <h2 style={{ marginTop: 0 }}>Total del mes: {money(total)}</h2>
          </IonText>
          <IonText color="medium">
            <p style={{ marginTop: 0 }}>Mes: {currentMonth}</p>
          </IonText>
        </div>

        <IonList>
          {monthExpenses.length === 0 ? (
            <IonItem>
              <IonLabel>No hay gastos registrados este mes.</IonLabel>
            </IonItem>
          ) : (
            monthExpenses.map((e) => (
              <IonItemSliding key={e.id}>
                <IonItem>
                  <IonLabel>
                    <h3>{catName(e.categoryId)}</h3>
                    <p>{new Date(e.date).toLocaleDateString("es-EC")} {e.note ? `• ${e.note}` : ""}</p>
                  </IonLabel>
                  <IonLabel slot="end">{money(e.amount)}</IonLabel>
                </IonItem>

                <IonItemOptions side="end">
                  <IonItemOption color="danger" onClick={() => deleteExpense(e.id)}>
                    <IonIcon slot="icon-only" icon={trash} />
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))
          )}
        </IonList>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setOpen(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <ExpenseFormModal isOpen={open} onDidDismiss={() => setOpen(false)} />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
