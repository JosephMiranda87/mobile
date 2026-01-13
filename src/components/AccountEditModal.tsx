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
import { useEffect, useMemo, useState } from "react";
import type { BankId, Account } from "../state/finance";
import { useFinance } from "../state/finance";

export default function AccountEditModal({
    isOpen,
    onDidDismiss,
    account,
}: {
    isOpen: boolean;
    onDidDismiss: () => void;
    account: Account | null;
}) {
    const { banks, deleteAccount, updateAccount, addToAccountBalance } = useFinance();
    const [topUp, setTopUp] = useState("");
    const [bankId, setBankId] = useState<BankId>("pichincha");
    const [name, setName] = useState("");
    const [balance, setBalance] = useState("");
    const bankName = useMemo(
        () => banks.find((b) => b.id === bankId)?.name ?? "Banco",
        [banks, bankId]
    );

    useEffect(() => {
        if (!account) return;
        setBankId(account.bankId);
        setName(account.name);
        setBalance(String(account.balance));
        setTopUp("");
    }, [account]);

    function save() {
        if (!account) return;

        const n = Number(balance);
        if (!Number.isFinite(n) || n < 0) return;
        updateAccount(account.id, {
            bankId,
            name: name.trim() ? name.trim() : bankName,
            balance: n,
        });


        onDidDismiss();
    }

    function applyTopUp() {
        if (!account) return;
        const n = Number(topUp);
        if (!Number.isFinite(n) || n <= 0) return;
        addToAccountBalance(account.id, n);
        setTopUp("");
        onDidDismiss();
    }



    function remove() {
        if (!account) return;
        deleteAccount(account.id);
        onDidDismiss();
    }

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Editar cuenta</IonTitle>
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
                    <IonLabel position="stacked">Nombre</IonLabel>
                    <IonInput value={name} onIonInput={(e) => setName(String(e.detail.value ?? ""))} />
                </IonItem>

                <IonItem>
                    <IonLabel position="stacked">Saldo</IonLabel>
                    <IonInput
                        inputMode="decimal"
                        value={balance}
                        onIonInput={(e) => setBalance(String(e.detail.value ?? ""))}
                    />
                </IonItem>
                <div style={{ marginTop: 14 }}>
                    <IonItem>
                        <IonLabel position="stacked">Ingreso / Abono (suma al saldo)</IonLabel>
                        <IonInput
                            inputMode="decimal"
                            value={topUp}
                            placeholder="Ej: 50"
                            onIonInput={(e) => setTopUp(String(e.detail.value ?? ""))} />
                    </IonItem>
                    <div style={{ height: 10 }} />
                    <IonButton expand="block" color="secondary" onClick={applyTopUp}>
                        Aplicar abono
                    </IonButton>
                </div>
            </IonContent>

            <IonFooter>
                <IonToolbar>
                    <IonButton expand="block" onClick={save}>
                        Guardar cambios
                    </IonButton>

                    <IonButton expand="block" color="danger" onClick={remove}>
                        Eliminar cuenta
                    </IonButton>

                    <IonButton expand="block" fill="clear" onClick={onDidDismiss}>
                        Cancelar
                    </IonButton>
                </IonToolbar>
            </IonFooter>
        </IonModal>
    );
}
