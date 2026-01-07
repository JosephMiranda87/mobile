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
import { CategoryId, useExpenses } from "../state/expenses";

type Props = {
  isOpen: boolean;
  onDidDismiss: () => void;
};

export default function ExpenseFormModal({ isOpen, onDidDismiss }: Props) {
  const { categories, addExpense } = useExpenses();

  const todayISO = useMemo(() => new Date().toISOString(), []);
  const [amount, setAmount] = useState<string>("");
  const [categoryId, setCategoryId] = useState<CategoryId>("food");
  const [date, setDate] = useState<string>(todayISO);
  const [note, setNote] = useState<string>("");

  function reset() {
    setAmount("");
    setCategoryId("food");
    setDate(todayISO);
    setNote("");
  }

  function save() {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return;

    addExpense({
      amount: n,
      categoryId,
      date,
      note: note.trim() ? note.trim() : undefined,
    });

    reset();
    onDidDismiss();
  }

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
          <IonInput
            inputMode="decimal"
            value={amount}
            placeholder="Ej: 3.50"
            onIonInput={(e) => setAmount(String(e.detail.value ?? ""))}
          />
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
          <IonDatetime
            presentation="date"
            value={date}
            onIonChange={(e) => setDate(String(e.detail.value))}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Nota (opcional)</IonLabel>
          <IonInput
            value={note}
            placeholder="Ej: desayuno, taxi, etc."
            onIonInput={(e) => setNote(String(e.detail.value ?? ""))}
          />
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
