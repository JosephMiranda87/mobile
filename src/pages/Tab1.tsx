import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
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
import { add, trash, sparklesOutline } from "ionicons/icons";
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

  // Top 3 categorías del mes (para chips)
  const topCats = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of monthExpenses) map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amount);

    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, val]) => ({ id, name: catName(id), val }));
  }, [monthExpenses, categories]);

  return (
    <IonPage>
      <IonHeader className="home-header" translucent>
        <IonToolbar className="home-toolbar">
          <IonTitle>Mis gastos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {/* HERO */}
        <div className="home-hero">
          <div className="home-hero-row">
            <div>
              <IonText className="home-hero-sub">
                <p style={{ margin: 0 }}>Mes actual</p>
              </IonText>
              <IonText className="home-hero-title">
                <h2 style={{ margin: "6px 0" }}>{currentMonth}</h2>
              </IonText>
            </div>

            <IonBadge className="home-badge" color="secondary">
              <IonIcon icon={sparklesOutline} style={{ marginRight: 6 }} />
              {monthExpenses.length} registros
            </IonBadge>
          </div>

          <IonCard className="home-total-card">
            <IonCardContent className="home-total-content">
              <IonText color="medium">
                <p style={{ margin: 0 }}>Total gastado</p>
              </IonText>
              <div className="home-total-row">
                <IonText className="home-total">{money(total)}</IonText>
                <IonButton color="secondary" className="home-add-btn" onClick={() => setOpen(true)}>
                  + Agregar
                </IonButton>
              </div>

              <div className="home-chip-row">
                {topCats.length === 0 ? (
                  <IonText color="light">
                    <p style={{ margin: 0, opacity: 0.85 }}>Registra tu primer gasto para ver el resumen.</p>
                  </IonText>
                ) : (
                  topCats.map((c) => (
                    <IonChip key={c.id} className="home-chip">
                      <IonLabel>
                        {c.name}: <b>{money(c.val)}</b>
                      </IonLabel>
                    </IonChip>
                  ))
                )}
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        {/* LISTA */}
        <div className="home-section">
          <IonText>
            <h3 className="home-section-title">Últimos gastos</h3>
          </IonText>

          <IonCard className="home-list-card">
            <IonCardContent>
              <IonList lines="none">
                {monthExpenses.length === 0 ? (
                  <IonItem>
                    <IonLabel>No hay gastos registrados este mes.</IonLabel>
                  </IonItem>
                ) : (
                  monthExpenses.slice(0, 10).map((e) => (
                    <IonItemSliding key={e.id}>
                      <IonItem className="home-item">
                        <IonLabel>
                          <h3 style={{ marginBottom: 6 }}>{catName(e.categoryId)}</h3>
                          <p style={{ margin: 0, opacity: 0.8 }}>
                            {new Date(e.date).toLocaleDateString("es-EC")}
                            {e.note ? ` • ${e.note}` : ""}
                          </p>
                        </IonLabel>
                        <IonLabel slot="end" className="home-amount">
                          {money(e.amount)}
                        </IonLabel>
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
            </IonCardContent>
          </IonCard>
        </div>

        {/* FAB (por si quieres mantenerlo también) */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton color="primary" onClick={() => setOpen(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <ExpenseFormModal isOpen={open} onDidDismiss={() => setOpen(false)} />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
