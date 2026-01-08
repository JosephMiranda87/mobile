import {
  IonCard,
  IonCardContent,
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
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
  IonButton,
  IonModal,
  IonDatetime,
} from "@ionic/react";
import { add, trash, chevronBackOutline, chevronForwardOutline, calendarOutline } from "ionicons/icons";
import { useMemo, useState } from "react";
import ExpenseFormModal from "../components/ExpenseFormModal";
import {
  endOfMonth,
  endOfWeek,
  inPeriod,
  money,
  Period,
  startOfMonth,
  startOfWeek,
  useFinance,
} from "../state/finance";
import "./Tab2.css";

type GroupBy = "date" | "category";

function formatMonthLabel(d: Date) {
  return d.toLocaleDateString("es-EC", { month: "long", year: "numeric" });
}
function formatDayLabel(d: Date) {
  return d.toLocaleDateString("es-EC", { weekday: "long", day: "2-digit", month: "long" });
}
function formatWeekLabel(d: Date) {
  const s = startOfWeek(d);
  const e = endOfWeek(d);
  const sTxt = s.toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
  const eTxt = e.toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
  return `${sTxt} – ${eTxt}`;
}

const Tab2: React.FC = () => {
  const { expenses, categories, accounts, deleteExpense } = useFinance();
  const [open, setOpen] = useState(false);

  const [period, setPeriod] = useState<Period>("day");
  const [groupBy, setGroupBy] = useState<GroupBy>("date");

  // Fecha base elegible por el usuario
  const [baseISO, setBaseISO] = useState<string>(new Date().toISOString());
  const baseDate = useMemo(() => new Date(baseISO), [baseISO]);

  // Modal para escoger fecha base
  const [dateModal, setDateModal] = useState(false);

  const filtered = useMemo(
    () => expenses.filter((e) => inPeriod(e.date, period, baseDate)),
    [expenses, period, baseDate]
  );

  const total = useMemo(() => filtered.reduce((a, x) => a + x.amount, 0), [filtered]);

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";
  const accName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "Cuenta";

  // etiqueta del período seleccionado (día/semana/mes)
  const periodLabel = useMemo(() => {
    if (period === "day") return formatDayLabel(baseDate);
    if (period === "week") return `Semana: ${formatWeekLabel(baseDate)}`;
    return `Mes: ${formatMonthLabel(baseDate)}`;
  }, [period, baseDate]);

  // botones anterior/siguiente según período
  function movePeriod(step: -1 | 1) {
    const d = new Date(baseDate);

    if (period === "day") {
      d.setDate(d.getDate() + step);
    } else if (period === "week") {
      d.setDate(d.getDate() + step * 7);
    } else {
      d.setMonth(d.getMonth() + step);
    }
    setBaseISO(d.toISOString());
  }

  // agrupación inteligente: semana/mes agrupa por día si eliges "fecha"
  const grouped = useMemo(() => {
    if (filtered.length === 0) return [];

    const map = new Map<string, typeof filtered>();

    for (const e of filtered) {
      let key: string;

      if (groupBy === "category") {
        key = catName(e.categoryId);
      } else {
        const dt = new Date(e.date);
        key =
          period === "day"
            ? dt.toLocaleDateString("es-EC", { weekday: "long", day: "2-digit", month: "long" })
            : dt.toLocaleDateString("es-EC", { day: "2-digit", month: "long" });
      }

      map.set(key, [...(map.get(key) ?? []), e]);
    }

    // ordenar grupos por fecha si se agrupa por date
    const entries = [...map.entries()];
    if (groupBy === "date") {
      entries.sort((a, b) => a[0].localeCompare(b[0], "es"));
    } else {
      entries.sort((a, b) => a[0].localeCompare(b[0], "es"));
    }

    return entries;
  }, [filtered, groupBy, categories, accounts, period]);

  return (
    <IonPage>
      <IonHeader className="ops-header" translucent>
        <IonToolbar className="ops-toolbar">
          <IonTitle>Gastos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="ops-hero">
          <IonText>
            <h2 style={{ margin: 0, fontWeight: 900 }}>Total: {money(total)}</h2>
          </IonText>

          {/* Selector de período */}
          <div className="ops-controls">
            <IonSegment value={period} onIonChange={(e) => setPeriod(e.detail.value as Period)}>
              <IonSegmentButton value="day">
                <IonLabel>Día</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="week">
                <IonLabel>Semana</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="month">
                <IonLabel>Mes</IonLabel>
              </IonSegmentButton>
            </IonSegment>

            {/* Navegación y selector de fecha */}
            <div className="ops-range-row">
              <IonButton fill="clear" onClick={() => movePeriod(-1)}>
                <IonIcon icon={chevronBackOutline} />
              </IonButton>

              <IonButton className="ops-range-btn" onClick={() => setDateModal(true)}>
                <IonIcon icon={calendarOutline} style={{ marginRight: 8 }} />
                {periodLabel}
              </IonButton>

              <IonButton fill="clear" onClick={() => movePeriod(1)}>
                <IonIcon icon={chevronForwardOutline} />
              </IonButton>
            </div>

            {/* Agrupar */}
            <IonSelect value={groupBy} onIonChange={(e) => setGroupBy(e.detail.value)} interface="popover">
              <IonSelectOption value="date">Agrupar por fecha</IonSelectOption>
              <IonSelectOption value="category">Agrupar por categoría</IonSelectOption>
            </IonSelect>
          </div>
        </div>

        <div className="ion-padding" style={{ paddingBottom: 90 }}>
          <IonCard className="ops-card">
            <IonCardContent>
              <IonList lines="none">
                {filtered.length === 0 ? (
                  <IonItem>
                    <IonLabel>No hay gastos en este período.</IonLabel>
                  </IonItem>
                ) : (
                  grouped.map(([key, items]) => (
                    <div key={key} style={{ marginBottom: 14 }}>
                      <IonText color="medium">
                        <p style={{ margin: "6px 0 10px 0" }}>
                          <b>{key}</b>
                        </p>
                      </IonText>

                      {items.map((e) => (
                        <IonItemSliding key={e.id}>
                          <IonItem className="ops-item">
                            <IonLabel>
                              <h3 style={{ marginBottom: 6 }}>{catName(e.categoryId)}</h3>
                              <p style={{ margin: 0, opacity: 0.75 }}>
                                {accName(e.accountId)}
                                {e.note ? ` • ${e.note}` : ""}
                              </p>
                            </IonLabel>
                            <IonLabel slot="end" className="ops-amount">
                              {money(e.amount)}
                            </IonLabel>
                          </IonItem>

                          <IonItemOptions side="end">
                            <IonItemOption color="danger" onClick={() => deleteExpense(e.id)}>
                              <IonIcon slot="icon-only" icon={trash} />
                            </IonItemOption>
                          </IonItemOptions>
                        </IonItemSliding>
                      ))}
                    </div>
                  ))
                )}
              </IonList>
            </IonCardContent>
          </IonCard>
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setOpen(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <ExpenseFormModal isOpen={open} onDidDismiss={() => setOpen(false)} />

        {/* Modal selector de fecha base */}
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

export default Tab2;
