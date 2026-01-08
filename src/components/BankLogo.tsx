import { IonIcon } from "@ionic/react";
import {
  cashOutline,
  businessOutline,
  walletOutline,
  cardOutline,
} from "ionicons/icons";
import type { BankId } from "../state/finance";
import "./BankLogo.css";

export default function BankLogo({ bankId }: { bankId: BankId }) {
  const icon =
    bankId === "cash"
      ? cashOutline
      : bankId === "coop"
      ? businessOutline
      : bankId === "other"
      ? walletOutline
      : cardOutline;

  const label =
    bankId === "pichincha"
      ? "Pichincha"
      : bankId === "guayaquil"
      ? "Guayaquil"
      : bankId === "produbanco"
      ? "Produbanco"
      : bankId === "pacifico"
      ? "Pacífico"
      : bankId === "bolivariano"
      ? "Bolivariano"
      : bankId === "internacional"
      ? "Internacional"
      : bankId === "austro"
      ? "Austro"
      : bankId === "coop"
      ? "Coop"
      : bankId === "cash"
      ? "Efectivo"
      : "Otro";

  return (
    <div className={`bank-logo bank-${bankId}`} aria-label={label} title={label}>
      <IonIcon icon={icon} />
    </div>
  );
}
