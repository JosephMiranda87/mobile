import {
  IonButton,
  IonContent,
  IonDatetime,
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
import { CategoryId, money, useFinance } from "../state/finance";

export default function ExpenseFormModal({
  isOpen,
  onDidDismiss,
}: {
  isOpen: boolean;
  onDidDismiss: () => void;
}) {
  const { categories, accounts, addExpense } = useFinance();

  const todayISO = useMemo(() => new Date().toISOString(), []);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<CategoryId>("food");
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id ?? "");
  const [date, setDate] = useState<string>(todayISO);
  const [note, setNote] = useState("");

  // si cambian las cuentas, asegúrate de tener una seleccionada
  useMemo(() => {
    if (!accountId && accounts.length > 0) setAccountId(accounts[0].id);
  }, [accounts, accountId]);

  function save() {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return;
    if (!accountId) return;

    addExpense({
      amount: n,
      categoryId,
      accountId,
      date,
      note: note.trim() ? note.trim() : undefined,
    });

    setAmount("");
    setCategoryId("food");
    setDate(todayISO);
    setNote("");
    onDidDismiss();
  }

  const selectedAcc = accounts.find((a) => a.id === accountId);

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Registrar gasto</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Monto</IonLabel>
          <IonInput inputMode="decimal" value={amount} placeholder="Ej: 3.50" onIonInput={(e) => setAmount(String(e.detail.value ?? ""))} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Cuenta</IonLabel>
          <IonSelect value={accountId} onIonChange={(e) => setAccountId(e.detail.value)}>
            {accounts.map((a) => (
              <IonSelectOption key={a.id} value={a.id}>
                {a.name} ({money(a.balance)})
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Categoría</IonLabel>
          <IonSelect value={categoryId} onIonChange={(e) => setCategoryId(e.detail.value)}>
            {categories.map((c) => (
              <IonSelectOption key={c.id} value={c.id}>
                {c.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Fecha</IonLabel>
          <IonDatetime presentation="date" value={date} onIonChange={(e) => setDate(String(e.detail.value))} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Nota (opcional)</IonLabel>
          <IonInput value={note} placeholder="Ej: supermercado, taxi..." onIonInput={(e) => setNote(String(e.detail.value ?? ""))} />
        </IonItem>

        {selectedAcc && (
          <p style={{ marginTop: 12, opacity: 0.75 }}>
            Saldo actual de la cuenta: <b>{money(selectedAcc.balance)}</b>
          </p>
        )}
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonButton expand="block" onClick={save}>
            Guardar gasto
          </IonButton>
          <IonButton expand="block" fill="clear" onClick={onDidDismiss}>
            Cancelar
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
}
