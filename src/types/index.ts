export type Screen =
  | "WELCOME"
  | "SHOW_SEED"
  | "IMPORT_SEED"
  | "SET_PIN"
  | "ENTER_PIN"
  | "DASHBOARD"
  | "IDLE_LOCKED";

export interface BalanceData {
  ton: number | null;
  trx: number | null;
  usdt: number | null;
}

export interface CryptoActivity {
  id: number;
  type: "send" | "receive" | "swap" | "approve";
  asset: string;
  amount: number;
  usdValue: number;
  date: string;
  status: "completed" | "pending" | "failed";
}

/** Approximate reference prices for portfolio valuation */
export const PRICES = { TON: 2.5, TRX: 0.12, USDT: 1.0 };