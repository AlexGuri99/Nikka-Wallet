"use client";
import { useState } from "react";
import { PRICES } from "@/types";
import { isValidTronAddress, isValidTonAddress } from "@/utils/cryptoCore";
import { tt } from "@/translations";
import type { Lang } from "@/translations";

/* ── Shared overlay ── */

function SendModalOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        backgroundColor: "var(--tg-theme-bg-color, #141416)",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {children}
    </div>
  );
}

/* ── Sub-screens ── */

function AssetPickerScreen({
  onPick,
  onCancel,
  lang,
}: {
  onPick: (asset: "SEND_TON" | "SEND_USDT") => void;
  onCancel: () => void;
  lang: Lang;
}) {
  const assets: { id: "SEND_TON" | "SEND_USDT"; label: string; sub: string }[] = [
    { id: "SEND_TON", label: "TON", sub: tt(lang, "nativeToken") },
    { id: "SEND_USDT", label: "USDT", sub: tt(lang, "usdtToken") },
  ];

  return (
    <div className="flex flex-col h-full px-4 pt-3 pb-6">
      <div className="text-center pb-4">
        <h1 className="text-lg font-bold" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
          {tt(lang, "sendTitle")}
        </h1>
        <p className="text-sm" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
          {tt(lang, "sendSubtitle")}
        </p>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        {assets.map((a) => (
          <button
            key={a.id}
            onClick={() => onPick(a.id)}
            className="flex items-center justify-between w-full rounded-xl px-4 py-4 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              color: "var(--tg-theme-text-color, #fff)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                style={{
                  backgroundColor: "var(--tg-theme-button-color, #DCA842)",
                  color: "var(--tg-theme-button-text-color, #fff)",
                }}
              >
                {a.label[0]}
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">{a.label}</p>
                <p className="text-xs" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>{a.sub}</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 opacity-40">
              <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        ))}
      </div>
      <button
        onClick={onCancel}
        className="w-full py-3.5 rounded-xl font-semibold text-sm"
        style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}
      >
        {tt(lang, "cancel")}
      </button>
    </div>
  );
}

function SendFormScreen({
  assetLabel,
  currentBalance,
  isTron,
  onSubmit,
  onCancel,
  lang,
}: {
  assetLabel: string;
  currentBalance: number;
  isTron: boolean;
  onSubmit: (recipient: string, amount: number, pin: string) => Promise<void>;
  onCancel: () => void;
  lang: Lang;
}) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const feeEstimate = assetLabel === "TON" ? 0.01 : 0;
  const maxAmount = Math.max(0, currentBalance - feeEstimate);
  const amountOk = parsedAmount > 0 && parsedAmount <= maxAmount;

  const fiatValue = parsedAmount * (assetLabel === "TON" ? PRICES.TON : PRICES.USDT);

  const addrValid = recipient.length === 0
    ? null
    : isTron
      ? isValidTronAddress(recipient)
      : isValidTonAddress(recipient);

  const pinValid = /^\d{4}$/.test(pin);
  const canSubmit = addrValid === true && amountOk && pinValid && !submitting;

  const handleAction = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await onSubmit(recipient.trim(), parsedAmount, pin);
    setSubmitting(false);
  };

  const handleClear = () => {
    setRecipient("");
    setAmount("");
    setPin("");
  };

  return (
    <div className="flex flex-col h-full px-4 pt-3 pb-6">
      <div className="text-center pb-4">
        <h1 className="text-lg font-bold" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
          {tt(lang, "sendFormTitle", { asset: assetLabel })}
        </h1>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
            {tt(lang, "recipientLabel")}
          </label>
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-2"
            style={{ backgroundColor: "var(--tg-theme-secondary-bg-color, #1E1E22)" }}
          >
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={isTron ? tt(lang, "placeholderTron") : tt(lang, "placeholderTon")}
              className="flex-1 bg-transparent text-sm font-mono outline-none min-w-0"
              style={{ color: "var(--tg-theme-text-color, #fff)" }}
              spellCheck={false}
            />
            <button
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setRecipient(text);
                } catch {}
              }}
              className="shrink-0 p-1.5 rounded-lg transition-all active:scale-90"
              style={{ color: "var(--tg-theme-button-color, #DCA842)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
                <path d="M3 4.5v11A2.5 2.5 0 0 0 5.5 18h5A2.5 2.5 0 0 0 13 15.5v-7.05a2.5 2.5 0 0 0-.732-1.768L9.318 4.232A2.5 2.5 0 0 0 7.55 3.5H5.5A2.5 2.5 0 0 0 3 4.5Z" />
              </svg>
            </button>
          </div>
          {addrValid === false && (
            <p className="text-xs mt-1" style={{ color: "var(--tg-theme-destructive-text-color, #e53935)" }}>
              {isTron ? tt(lang, "invalidTronAddr") : tt(lang, "invalidTonAddr")}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
            {tt(lang, "amountLabel")}
          </label>
          <div
            className="rounded-xl px-4 py-3"
            style={{ backgroundColor: "var(--tg-theme-secondary-bg-color, #1E1E22)" }}
          >
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min={0}
                step="any"
                className="flex-1 bg-transparent text-lg font-semibold tabular-nums outline-none min-w-0"
                style={{ color: "var(--tg-theme-text-color, #fff)" }}
              />
              <button
                onClick={() => setAmount(maxAmount.toFixed(6))}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all active:scale-90"
                style={{
                  color: "var(--tg-theme-button-color, #DCA842)",
                  backgroundColor: "var(--tg-theme-bg-color, #141416)",
                }}
              >
                {tt(lang, "max")}
              </button>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                style={{
                  color: "var(--tg-theme-button-text-color, #fff)",
                  backgroundColor: "var(--tg-theme-button-color, #DCA842)",
                }}
              >
                {assetLabel}
              </span>
            </div>
            {fiatValue > 0 && (
              <p className="text-xs mt-1.5" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
                ≈ ${fiatValue.toFixed(2)}
              </p>
            )}
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-xs" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
              {`${tt(lang, "balancePrefix")}: ${currentBalance.toFixed(2)} ${assetLabel}`}
            </p>
            {parsedAmount > 0 && !amountOk && (
              <p className="text-xs" style={{ color: "var(--tg-theme-destructive-text-color, #e53935)" }}>
                {parsedAmount > currentBalance ? tt(lang, "exceedsBalance") : tt(lang, "minAmount")}
              </p>
            )}
          </div>
        </div>

        {/* PIN */}
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
            {tt(lang, "pinLabelSend")}
          </label>
          <div
            className="rounded-xl px-4 py-3"
            style={{ backgroundColor: "var(--tg-theme-secondary-bg-color, #1E1E22)" }}
          >
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-transparent text-center text-xl tracking-[0.5em] outline-none"
              style={{ color: "var(--tg-theme-text-color, #fff)" }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-auto pt-4">
        <button
          onClick={handleClear}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
          style={{
            backgroundColor: "transparent",
            color: "var(--tg-theme-hint-color, #A0A0AA)",
            border: "1px solid var(--tg-theme-secondary-bg-color, #1E1E22)",
          }}
        >
          {tt(lang, "clear")}
        </button>
        <button
          disabled={!canSubmit}
          onClick={handleAction}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
          style={{
            backgroundColor: "var(--tg-theme-button-color, #DCA842)",
            color: "var(--tg-theme-button-text-color, #fff)",
          }}
        >
          {submitting ? tt(lang, "preparing") : tt(lang, "sendButton", { asset: assetLabel })}
        </button>
      </div>
    </div>
  );
}

function SendingScreen({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
      <div
        className="w-10 h-10 rounded-full border-3 border-t-transparent animate-spin"
        style={{ borderColor: "var(--tg-theme-button-color, #DCA842)", borderTopColor: "transparent" }}
      />
      <p className="text-sm font-medium" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
        {tt(lang, "sendingTitle")}
      </p>
      <p className="text-xs" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
        {tt(lang, "sendingDesc")}
      </p>
    </div>
  );
}

function SuccessScreen({ txid, onDone, lang }: { txid: string; onDone: () => void; lang: Lang }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "var(--tg-theme-accent-text-color, #DCA842)" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
          <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
          {tt(lang, "successTitle")}
        </p>
        <p className="text-xs mt-1 font-mono break-all" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
          {txid}
        </p>
      </div>
      <button
        onClick={onDone}
        className="w-full max-w-xs py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] mt-6"
        style={{
          backgroundColor: "var(--tg-theme-button-color, #DCA842)",
          color: "var(--tg-theme-button-text-color, #fff)",
        }}
      >
        {tt(lang, "done")}
      </button>
    </div>
  );
}

function ErrorScreen({
  error,
  onRetry,
  onCancel,
  lang,
}: {
  error: string;
  onRetry: () => void;
  onCancel: () => void;
  lang: Lang;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "var(--tg-theme-destructive-text-color, #e53935)" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
          {tt(lang, "failedTitle")}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--tg-theme-destructive-text-color, #e53935)" }}>
          {error}
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs mt-6">
        <button
          onClick={onRetry}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
          style={{
            backgroundColor: "var(--tg-theme-button-color, #DCA842)",
            color: "var(--tg-theme-button-text-color, #fff)",
          }}
        >
          {tt(lang, "tryAgain")}
        </button>
        <button
          onClick={onCancel}
          className="w-full py-3 rounded-xl font-semibold text-sm"
          style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}
        >
          {tt(lang, "cancel")}
        </button>
      </div>
    </div>
  );
}

/* ── SendModal orchestrator ── */

export interface SendModalProps {
  sendStep: "NONE" | "PICK" | "FORM" | "SENDING" | "SUCCESS" | "ERROR";
  activeModal: "NONE" | "SEND_TON" | "SEND_USDT";
  sendError: string;
  sendTxId: string;
  currentBalances: { ton: number | null; usdt: number | null };
  onPickAsset: (asset: "SEND_TON" | "SEND_USDT") => void;
  onSubmit: (recipient: string, amount: number, pin: string) => Promise<void>;
  onDone: () => void;
  onCancel: () => void;
  onRetry: () => void;
  lang: Lang;
}

export function SendModal({
  sendStep,
  activeModal,
  sendError,
  sendTxId,
  currentBalances,
  onPickAsset,
  onSubmit,
  onDone,
  onCancel,
  onRetry,
  lang,
}: SendModalProps) {
  if (sendStep === "NONE") return null;

  const assetLabel = activeModal === "SEND_TON" ? "TON" : "USDT";

  const currentBalance =
    activeModal === "SEND_TON" ? currentBalances.ton
    : currentBalances.usdt;

  return (
    <SendModalOverlay>
      {sendStep === "PICK" && (
        <AssetPickerScreen onPick={onPickAsset} onCancel={onCancel} lang={lang} />
      )}
      {sendStep === "FORM" && (
        <SendFormScreen
          assetLabel={assetLabel}
          currentBalance={currentBalance ?? 0}
          isTron={activeModal === "SEND_USDT"}
          onSubmit={onSubmit}
          onCancel={onCancel}
          lang={lang}
        />
      )}
      {sendStep === "SENDING" && <SendingScreen lang={lang} />}
      {sendStep === "SUCCESS" && <SuccessScreen txid={sendTxId} onDone={onDone} lang={lang} />}
      {sendStep === "ERROR" && (
        <ErrorScreen error={sendError} onRetry={onRetry} onCancel={onCancel} lang={lang} />
      )}
    </SendModalOverlay>
  );
}