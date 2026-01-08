import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  IonText,
  IonInput,
} from "@ionic/react";
import { add, walletOutline } from "ionicons/icons";
import { useMemo, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import AccountFormModal from "../components/AccountFormModal";
import { money, useFinance } from "../state/finance";
import "./Tab1.css";
import { BANK_COLORS } from "../theme/chartColors";
import BankLogo from "../components/BankLogo";

ChartJS.register(ArcElement, Tooltip, Legend);

const Tab1: React.FC = () => {
  const { accounts, updateAccountBalance } = useFinance();
  const [open, setOpen] = useState(false);

  const totalBalance = useMemo(() => accounts.reduce((a, x) => a + x.balance, 0), [accounts]);

  const chartData = useMemo(() => {
    const labels = accounts.map((a) => a.name);
    const data = accounts.map((a) => Math.max(a.balance, 0));
    const colors = accounts.map((a) => BANK_COLORS[a.bankId]);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };
  }, [accounts]);

  return (
    <IonPage>
      <IonHeader className="dash-header" translucent>
        <IonToolbar className="dash-toolbar">
          <IonTitle>Cuentas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="dash-hero">
          <div className="dash-hero-row">
            <div>
              <IonText>
                <h2 style={{ margin: 0, fontWeight: 900 }}>Balance total</h2>
              </IonText>
              <IonText color="medium">
                <p style={{ marginTop: 6, marginBottom: 0 }}>Suma de todas tus cuentas</p>
              </IonText>
            </div>

            <IonBadge className="dash-badge" color="secondary">
              <IonIcon icon={walletOutline} style={{ marginRight: 6 }} />
              {money(totalBalance)}
            </IonBadge>
          </div>

          <IonCard className="dash-card">
            <IonCardHeader>
              <IonCardTitle style={{ color: "white" }}>Distribución por cuentas</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {accounts.length === 0 ? <p style={{ color: "white" }}>Agrega una cuenta para ver el gráfico.</p> : <Doughnut data={chartData} />}
            </IonCardContent>
          </IonCard>
        </div>

        <div className="ion-padding" style={{ paddingBottom: 90 }}>
          <IonText>
            <h3 className="dash-title">Tus cuentas</h3>
          </IonText>

          <IonCard className="dash-list-card">
            <IonCardContent>
              <IonList lines="none">
                {accounts.map((a) => (
                  <IonItem key={a.id} className="dash-item">
                    <IonLabel>
                      <h3 style={{ marginBottom: 6 }}>{a.name}</h3>
                      <p style={{ margin: 0, opacity: 0.75 }}>
                        Saldo: <b>{money(a.balance)}</b>
                      </p>
                    </IonLabel>
                    <div slot="end">
                      <BankLogo bankId={a.bankId} />
                    </div>
                  </IonItem>
                ))}
              </IonList>

              <IonButton expand="block" color="secondary" onClick={() => setOpen(true)}>
                + Agregar cuenta
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setOpen(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <AccountFormModal isOpen={open} onDidDismiss={() => setOpen(false)} />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
