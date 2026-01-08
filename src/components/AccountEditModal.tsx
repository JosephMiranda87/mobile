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
    const { banks, deleteAccount, updateAccount } = useFinance();

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
