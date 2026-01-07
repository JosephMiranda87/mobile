import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useMemo, useState } from "react";
import { BankId, useFinance } from "../state/finance";

export default function AccountFormModal({
  isOpen,
  onDidDismiss,
}: {
  isOpen: boolean;
  onDidDismiss: () => void;
}) {
  const { banks, addAccount } = useFinance();

  const [bankId, setBankId] = useState<BankId>("pichincha");
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");

  const bankName = useMemo(() => banks.find((b) => b.id === bankId)?.name ?? "Banco", [banks, bankId]);

  function save() {
    const n = Number(balance);
    if (!Number.isFinite(n)) return;

    addAccount({
      bankId,
      name: name.trim() ? name.trim() : bankName,
      balance: n,
    });

    setName("");
    setBalance("");
    setBankId("pichincha");
    onDidDismiss();
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Nueva cuenta</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Banco / Tipo</IonLabel>
          <IonSelect value={bankId} onIonChange={(e) => setBankId(e.detail.value)}>
            {banks.map((b) => (
              <IonSelectOption key={b.id} value={b.id}>
                {b.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Nombre (opcional)</IonLabel>
          <IonInput value={name} placeholder={bankName} onIonInput={(e) => setName(String(e.detail.value ?? ""))} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Monto inicial (USD)</IonLabel>
          <IonInput inputMode="decimal" value={balance} placeholder="Ej: 250" onIonInput={(e) => setBalance(String(e.detail.value ?? ""))} />
        </IonItem>
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonButton expand="block" onClick={save}>
            Guardar
          </IonButton>
          <IonButton expand="block" fill="clear" onClick={onDidDismiss}>
            Cancelar
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
}
