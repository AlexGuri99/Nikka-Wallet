"use client";

import { useEffect, useState, useRef } from "react";
import { validateMnemonic } from "bip39";
import { QRCodeSVG } from "qrcode.react";
import {
  type NikkaWalletState,
  generateNikkaWallet,
  restoreNikkaWallet,
  encryptMnemonic,
  decryptMnemonic,
  isValidTronAddress,
  isValidTonAddress,
  createAndSendTonTransfer,
  createAndSignTronTransfer,
  createAndSignUsdtTransfer,
  broadcastTronTransaction,
} from "@/utils/cryptoCore";

/* ── Types ── */

type Screen = "WELCOME" | "SHOW_SEED" | "IMPORT_SEED" | "SET_PIN" | "DASHBOARD" | "IDLE_LOCKED";

interface CryptoActivity {
  id: number;
  type: "send" | "receive" | "swap" | "approve";
  asset: string;
  amount: number;
  usdValue: number;
  date: string;
  status: "completed" | "pending" | "failed";
}

/* ── Mock data ── */

// Approximate reference prices for portfolio valuation
const PRICES = { TON: 2.5, TRX: 0.12, USDT: 1.0 };

const ACTIVITIES: CryptoActivity[] = [
  { id: 1, type: "receive", asset: "TON", amount: 125.5, usdValue: 313.75, date: "Jun 17", status: "completed" },
  { id: 2, type: "send", asset: "USDT", amount: 50, usdValue: 50, date: "Jun 16", status: "completed" },
  { id: 3, type: "receive", asset: "TRX", amount: 850, usdValue: 102, date: "Jun 15", status: "completed" },
  { id: 4, type: "swap", asset: "TON", amount: 10, usdValue: 25, date: "Jun 14", status: "completed" },
  { id: 5, type: "receive", asset: "USDT", amount: 200, usdValue: 200, date: "Jun 12", status: "completed" },
  { id: 6, type: "send", asset: "TRX", amount: 50, usdValue: 6, date: "Jun 10", status: "failed" },
];

/* ── Activity type icon ── */

function ActivityIcon({ type }: { type: CryptoActivity["type"] }) {
  const icons: Record<string, React.ReactNode> = {
    send: (
      <path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.414 4.925A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.9 28.9 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.9 28.9 0 0 0 3.105 2.289Z" />
    ),
    receive: (
      <path d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" />
    ),
    swap: (
      <path d="M4 4.5a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5A.75.75 0 0 1 4 4.5Zm12 0a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5A.75.75 0 0 1 16 4.5Zm-8.97-2.28a.75.75 0 0 1 .022 1.06L4.81 5.5H13.5a.75.75 0 0 1 0 1.5H4.81l2.242 2.22a.75.75 0 1 1-1.06 1.06l-3.5-3.47a.75.75 0 0 1 0-1.06l3.5-3.47a.75.75 0 0 1 1.06.022Zm5.94 9.28a.75.75 0 0 1-.022 1.06L15.19 18.5H6.5a.75.75 0 0 1 0-1.5h8.69l-2.242-2.22a.75.75 0 1 1 1.06-1.06l3.5 3.47a.75.75 0 0 1 0 1.06l-3.5 3.47a.75.75 0 1 1-1.06-1.06l2.242-2.22H6.5a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 1.5 0v.75h8.69l-2.242-2.22a.75.75 0 0 1-.228-1.06Z" />
    ),
    approve: (
      <path d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.235a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 1 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6Zm0 3.75a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5Z" />
    ),
  };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      {icons[type]}
    </svg>
  );
}

/* ── Shared layout wrapper ── */

function ScreenFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-dvh px-4 pt-3 pb-6"
      style={{ backgroundColor: "#141416", color: "var(--tg-theme-text-color, #fff)" }}>
      {children}
    </div>
  );
}

/* ── WELCOME screen ── */

function WelcomeScreen({
  onNewWallet,
  onImport,
}: {
  onNewWallet: () => void;
  onImport: () => void;
}) {
  return (
    <ScreenFrame>
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
        {/* Brand */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
          style={{
            backgroundColor: "var(--tg-theme-button-color, #DCA842)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-8 h-8 text-white"
          >
            <path d="M11.584 2.376a.75.75 0 0 1 .832 0l9 6a.75.75 0 1 1-.832 1.248L12 4.013 3.416 9.624a.75.75 0 0 1-.832-1.248l9-6Z" />
            <path
              fillRule="evenodd"
              d="M20.25 10.332v9.918H21a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1 0-1.5h.75v-9.918a.75.75 0 0 1 .634-.74 49.29 49.29 0 0 1 5.866-.284 49.3 49.3 0 0 1 5.746.284.75.75 0 0 1 .634.74Z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: "var(--tg-theme-text-color, #fff)" }}
          >
            Nikka Wallet
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}
          >
            Your self-custodial crypto wallet
          </p>
        </div>

        {/* Actions */}
        <div className="w-full max-w-xs flex flex-col gap-3 mt-4">
          <button
            onClick={onNewWallet}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
            style={{
              backgroundColor: "var(--tg-theme-button-color, #DCA842)",
              color: "var(--tg-theme-button-text-color, #fff)",
            }}
          >
            Create New Wallet
          </button>

          <button
            onClick={onImport}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              color: "var(--tg-theme-button-color, #DCA842)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Import Mnemonic
          </button>
        </div>
      </div>
    </ScreenFrame>
  );
}

/* ── SHOW_SEED screen ── */

function ShowSeedScreen({
  wallet,
  onConfirm,
}: {
  wallet: NikkaWalletState;
  onConfirm: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const words = wallet.mnemonic.split(" ");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(wallet.mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available — silently fail
    }
  };

  return (
    <ScreenFrame>
      <div className="flex-1 flex flex-col">
        {/* Heading */}
        <div className="text-center mb-5">
          <h1
            className="text-lg font-bold mb-1"
            style={{ color: "var(--tg-theme-text-color, #fff)" }}
          >
            Your Recovery Phrase
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}
          >
            Write these 24 words down in order. Never share them with anyone.
          </p>
        </div>

        {/* 2×12 word grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {words.map((word, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              <span
                className="text-[10px] font-semibold w-3.5 shrink-0 text-center"
                style={{ color: "#DCA842" }}
              >
                {i + 1}
              </span>
              <span
                className="text-sm font-semibold truncate"
                style={{ color: "var(--tg-theme-text-color, #fff)" }}
              >
                {word}
              </span>
            </div>
          ))}
        </div>

        {/* Non-custodial notice */}
        <div
          className="rounded-xl px-4 py-3 mb-5 text-xs leading-relaxed"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.5)",
            borderLeft: "3px solid var(--tg-theme-destructive-text-color, #e53935)",
          }}
        >
          Nikka Wallet is a non-custodial wallet. We do not store or have access
          to your recovery phrase. If you lose it, your funds cannot be
          recovered.{" "}
          <strong style={{ color: "rgba(255,255,255,0.85)" }}>
            Write it down and keep it safe.
          </strong>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-auto">
          <button
            onClick={handleCopy}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              color: copied ? "var(--tg-theme-accent-text-color, #DCA842)" : "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>

          <button
            onClick={onConfirm}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
            style={{
              backgroundColor: "var(--tg-theme-button-color, #DCA842)",
              color: "var(--tg-theme-button-text-color, #fff)",
            }}
          >
            I Have Written It Down
          </button>
        </div>
      </div>
    </ScreenFrame>
  );
}

/* ── IMPORT_SEED screen ── */

function ImportSeedScreen({
  onImport,
  onBack,
}: {
  onImport: (mnemonic: string) => void;
  onBack: () => void;
}) {
  const [input, setInput] = useState("");
  const trimmed = input.trim().replace(/\s+/g, " ");
  const isValid = trimmed.split(" ").length === 24 && validateMnemonic(trimmed);
  const showWarning = input.length > 0 && !isValid;

  return (
    <ScreenFrame>
      <div className="flex-1 flex flex-col">
        {/* Heading */}
        <div className="text-center mb-5">
          <h1
            className="text-lg font-bold mb-1"
            style={{ color: "var(--tg-theme-text-color, #fff)" }}
          >
            Import Wallet
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}
          >
            Paste or type your 24-word recovery phrase
          </p>
        </div>

        {/* Text area */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="arena aim clap fog noodle ski pole local curious goose fat attack ..."
          rows={4}
          className="w-full resize-none rounded-2xl p-4 text-sm font-mono outline-none transition-shadow"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            color: "var(--tg-theme-text-color, #fff)",
            boxShadow: isValid
              ? "inset 0 0 0 2px var(--tg-theme-accent-text-color, #DCA842)"
              : showWarning
                ? "inset 0 0 0 2px var(--tg-theme-destructive-text-color, #e53935)"
                : "none",
          }}
          spellCheck={false}
        />

        {/* Validation feedback */}
        <div className="h-6 mt-2 mb-3 flex items-center gap-1.5">
          {isValid && (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
                style={{ color: "var(--tg-theme-accent-text-color, #DCA842)" }}
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                  clipRule="evenodd"
                />
              </svg>
              <span
                className="text-xs font-medium"
                style={{ color: "var(--tg-theme-accent-text-color, #DCA842)" }}
              >
                Valid phrase
              </span>
            </>
          )}
          {showWarning && (
            <span
              className="text-xs"
              style={{ color: "var(--tg-theme-destructive-text-color, #e53935)" }}
            >
              Invalid recovery phrase — check each word is spelled correctly
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-auto">
          <button
            disabled={!isValid}
            onClick={() => onImport(trimmed)}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
            style={{
              backgroundColor: "var(--tg-theme-button-color, #DCA842)",
              color: "var(--tg-theme-button-text-color, #fff)",
            }}
          >
            Import
          </button>

          <button
            onClick={onBack}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              color: "var(--tg-theme-hint-color, #A0A0AA)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Back
          </button>
        </div>
      </div>
    </ScreenFrame>
  );
}

/* ── SET_PIN screen ── */

function SetPinScreen({ onConfirm }: { onConfirm: (pin: string) => void }) {
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);

  const isComplete = /^\d{4}$/.test(pin) && pin === confirm;
  const showMismatch = touched && confirm.length > 0 && pin !== confirm;

  return (
    <ScreenFrame>
      <div className="flex-1 flex flex-col">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1
            className="text-lg font-bold mb-1"
            style={{ color: "var(--tg-theme-text-color, #fff)" }}
          >
            Set Your PIN
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}
          >
            Choose a 4-digit code to secure your wallet
          </p>
        </div>

        {/* PIN fields */}
        <div className="flex flex-col gap-4 max-w-[220px] mx-auto w-full">
          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}
            >
              Enter PIN
            </label>
            <div className="rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  setPin(v);
                }}
                className="w-full text-center text-2xl tracking-[0.5em] py-3 bg-transparent outline-none"
                style={{ color: "var(--tg-theme-text-color, #fff)" }}
                autoFocus
              />
            </div>
          </div>

          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}
            >
              Confirm PIN
            </label>
            <div className="rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirm}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  setConfirm(v);
                  setTouched(true);
                }}
                className="w-full text-center text-2xl tracking-[0.5em] py-3 bg-transparent outline-none"
                style={{ color: "var(--tg-theme-text-color, #fff)" }}
              />
            </div>
          </div>

          {/* Error / hint */}
          <div className="h-5 text-center">
            {showMismatch && (
              <span
                className="text-xs"
                style={{ color: "var(--tg-theme-destructive-text-color, #e53935)" }}
              >
                PINs do not match
              </span>
            )}
          </div>
        </div>

        {/* Confirm button */}
        <button
          disabled={!isComplete}
          onClick={() => onConfirm(pin)}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 mt-auto"
          style={{
            backgroundColor: "var(--tg-theme-button-color, #DCA842)",
            color: "var(--tg-theme-button-text-color, #fff)",
          }}
        >
          Confirm PIN
        </button>
      </div>
    </ScreenFrame>
  );
}

/* ── Idle Lock Screen ── */

function IdleLockScreen({
  onUnlock,
}: {
  onUnlock: (pin: string) => boolean;
}) {
  const [digits, setDigits] = useState("");
  const [shaking, setShaking] = useState(false);

  const handleDigit = (d: string) => {
    if (digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    if (next.length === 4) {
      const ok = onUnlock(next);
      if (!ok) {
        setShaking(true);
        try { (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("error"); } catch {}
        setTimeout(() => { setShaking(false); setDigits(""); }, 500);
      }
    }
  };

  const handleDelete = () => {
    setDigits((d) => d.slice(0, -1));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8"
      style={{
        backgroundColor: "var(--tg-theme-bg-color, #141416)",
        color: "var(--tg-theme-text-color, #fff)",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Logo placeholder */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-8"
        style={{ backgroundColor: "var(--tg-theme-button-color, #DCA842)" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
          <path d="M11.584 2.376a.75.75 0 0 1 .832 0l9 6a.75.75 0 1 1-.832 1.248L12 4.013 3.416 9.624a.75.75 0 0 1-.832-1.248l9-6Z" />
          <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1 0-1.5h.75v-9.918a.75.75 0 0 1 .634-.74 49.29 49.29 0 0 1 5.866-.284 49.3 49.3 0 0 1 5.746.284.75.75 0 0 1 .634.74Z" clipRule="evenodd" />
        </svg>
      </div>

      {/* 4-dot indicator */}
      <div className={`flex gap-3 mb-10 transition-transform ${shaking ? "animate-shake" : ""}`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full transition-all duration-150"
            style={{
              backgroundColor: i < digits.length
                ? "var(--tg-theme-button-color, #DCA842)"
                : "var(--tg-theme-hint-color, #A0A0AA)",
              opacity: i < digits.length ? 1 : 0.3,
            }}
          />
        ))}
      </div>

      {/* 3×4 numeric keypad */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-[260px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => handleDigit(String(n))}
            className="aspect-square rounded-full text-xl font-semibold transition-all active:scale-90"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              color: "var(--tg-theme-text-color, #fff)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {n}
          </button>
        ))}

        {/* Row 4: empty spacer, 0, backspace */}
        <div />
        <button
          onClick={() => handleDigit("0")}
          className="aspect-square rounded-full text-xl font-semibold transition-all active:scale-90"
          style={{
            backgroundColor: "var(--tg-theme-secondary-bg-color, #1E1E22)",
            color: "var(--tg-theme-text-color, #fff)",
          }}
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="aspect-square rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M7.22 3.22A.75.75 0 0 1 7.75 3h9A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17h-9a.75.75 0 0 1-.53-.22L2.72 12.28a2.25 2.25 0 0 1 0-3.06l4.5-4.5Zm3.06 4.06a.75.75 0 1 0-1.06 1.06L10.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L12 8.94l-1.72-1.72Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Balance fetching ── */

interface BalanceData {
  ton: number | null;
  trx: number | null;
  usdt: number | null;
}

async function fetchTonBalance(address: string): Promise<number> {
  const res = await fetch(
    `https://toncenter.com/api/v2/getAddressBalance?address=${encodeURIComponent(address)}`
  );
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "TON fetch failed");
  return parseInt(data.result, 10) / 1e9;
}

async function fetchTronBalance(address: string): Promise<number> {
  const res = await fetch(
    `https://api.trongrid.io/v1/accounts/${encodeURIComponent(address)}`
  );
  const data = await res.json();
  if (!data.success || !data.data?.length) throw new Error("TRX fetch failed");
  return data.data[0].balance / 1_000_000;
}

async function fetchUsdtBalance(address: string): Promise<number> {
  const res = await fetch(
    `https://api.trongrid.io/v1/accounts/${encodeURIComponent(address)}/trc20?contract_address=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`
  );
  const data = await res.json();
  if (!data.success || !data.data?.length) return 0;
  const entry = data.data[0];
  const key = Object.keys(entry).find((k) => k.startsWith("TR7"));
  return key ? parseInt(entry[key], 10) / 1_000_000 : 0;
}

/* ── Send modal components ── */

function SendModalOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col"
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

function AssetPickerScreen({
  onPick,
  onCancel,
}: {
  onPick: (asset: "SEND_TON" | "SEND_TRX" | "SEND_USDT") => void;
  onCancel: () => void;
}) {
  const assets: { id: "SEND_TON" | "SEND_TRX" | "SEND_USDT"; label: string; sub: string }[] = [
    { id: "SEND_TON", label: "TON", sub: "Native token" },
    { id: "SEND_TRX", label: "TRX", sub: "Tron native token" },
    { id: "SEND_USDT", label: "USDT", sub: "TRC-20 stablecoin" },
  ];

  return (
    <div className="flex flex-col h-full px-4 pt-3 pb-6">
      <div className="text-center pb-4">
        <h1 className="text-lg font-bold" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
          Send
        </h1>
        <p className="text-sm" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
          Select an asset
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
        Cancel
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
}: {
  assetLabel: string;
  currentBalance: number;
  isTron: boolean;
  onSubmit: (recipient: string, amount: number, pin: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const feeEstimate = assetLabel === "TON" ? 0.01 : assetLabel === "TRX" ? 5 : 0;
  const maxAmount = Math.max(0, currentBalance - feeEstimate);
  const amountOk = parsedAmount > 0 && parsedAmount <= maxAmount;

  const fiatValue = parsedAmount * (assetLabel === "TON" ? PRICES.TON : assetLabel === "TRX" ? PRICES.TRX : PRICES.USDT);

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
      {/* Header */}
      <div className="text-center pb-4">
        <h1 className="text-lg font-bold" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
          Send {assetLabel}
        </h1>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* Recipient */}
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
            Recipient Address
          </label>
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-2"
            style={{ backgroundColor: "var(--tg-theme-secondary-bg-color, #1E1E22)" }}
          >
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={isTron ? "TXYZ..." : "EQD..."}
              className="flex-1 bg-transparent text-sm font-mono outline-none min-w-0"
              style={{
                color: "var(--tg-theme-text-color, #fff)",
              }}
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
              Invalid {isTron ? "TRON" : "TON"} address
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
            Amount
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
                MAX
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
              Balance: {currentBalance.toFixed(2)} {assetLabel}
            </p>
            {parsedAmount > 0 && !amountOk && (
              <p className="text-xs" style={{ color: "var(--tg-theme-destructive-text-color, #e53935)" }}>
                {parsedAmount > currentBalance ? "Exceeds balance" : "Min 0.01"}
              </p>
            )}
          </div>
        </div>

        {/* PIN */}
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
            Enter 4-Digit PIN
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

      {/* Sticky bottom actions */}
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
          Clear
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
          {submitting ? "Preparing..." : `Send ${assetLabel}`}
        </button>
      </div>
    </div>
  );
}

function SendingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
      <div className="w-10 h-10 rounded-full border-3 border-t-transparent animate-spin"
        style={{
          borderColor: "var(--tg-theme-button-color, #DCA842)",
          borderTopColor: "transparent",
        }}
      />
      <p className="text-sm font-medium" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
        Signing & broadcasting...
      </p>
      <p className="text-xs" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
        Please wait while the transaction is processed
      </p>
    </div>
  );
}

function SuccessScreen({ txid, onDone }: { txid: string; onDone: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
      <div className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "var(--tg-theme-accent-text-color, #DCA842)" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
          <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
          Sent!
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
        Done
      </button>
    </div>
  );
}

function ErrorScreen({
  error,
  onRetry,
  onCancel,
}: {
  error: string;
  onRetry: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
      <div className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "var(--tg-theme-destructive-text-color, #e53935)" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
          Failed
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
          Try Again
        </button>
        <button
          onClick={onCancel}
          className="w-full py-3 rounded-xl font-semibold text-sm"
          style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ── Bottom Tab Bar ── */

function BottomTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: "MAIN" | "SETTINGS";
  onTabChange: (tab: "MAIN" | "SETTINGS") => void;
}) {
  return (
    <nav
      className="flex items-center justify-around px-8 py-2.5"
      style={{
        backgroundColor: "var(--tg-theme-bg-color, #141416)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {[
        {
          key: "MAIN" as const,
          label: "Main",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M11.584 2.376a.75.75 0 0 1 .832 0l9 6a.75.75 0 1 1-.832 1.248L12 4.013 3.416 9.624a.75.75 0 0 1-.832-1.248l9-6Z" />
              <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1 0-1.5h.75v-9.918a.75.75 0 0 1 .634-.74 49.29 49.29 0 0 1 5.866-.284 49.3 49.3 0 0 1 5.746.284.75.75 0 0 1 .634.74Z" clipRule="evenodd" />
            </svg>
          ),
        },
        {
          key: "SETTINGS" as const,
          label: "Settings",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              <path fillRule="evenodd" d="M14.694 2.765a2.25 2.25 0 0 0-3.388 0l-.744.844a2.25 2.25 0 0 1-2.12.718l-1.099-.22a2.25 2.25 0 0 0-2.687 1.582l-.289 1.078a2.25 2.25 0 0 1-1.04 1.38l-.97.592a2.25 2.25 0 0 0-.472 3.347l.662.72a2.25 2.25 0 0 1 0 3.06l-.662.72a2.25 2.25 0 0 0 .472 3.347l.97.592a2.25 2.25 0 0 1 1.04 1.38l.289 1.078a2.25 2.25 0 0 0 2.687 1.582l1.099-.22a2.25 2.25 0 0 1 2.12.718l.744.844a2.25 2.25 0 0 0 3.388 0l.744-.844a2.25 2.25 0 0 1 2.12-.718l1.099.22a2.25 2.25 0 0 0 2.687-1.582l.289-1.078a2.25 2.25 0 0 1 1.04-1.38l.97-.592a2.25 2.25 0 0 0 .472-3.347l-.662-.72a2.25 2.25 0 0 1 0-3.06l.662-.72a2.25 2.25 0 0 0-.472-3.347l-.97-.592a2.25 2.25 0 0 1-1.04-1.38l-.289-1.078a2.25 2.25 0 0 0-2.687-1.582l-1.099.22a2.25 2.25 0 0 1-2.12-.718l-.744-.844ZM12 9.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" clipRule="evenodd" />
            </svg>
          ),
        },
      ].map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className="flex flex-col items-center gap-0.5 transition-all active:scale-90"
        >
          <span
            style={{
              color: activeTab === tab.key
                ? "var(--tg-theme-button-color, #DCA842)"
                : "var(--tg-theme-hint-color, #A0A0AA)",
            }}
          >
            {tab.icon}
          </span>
          <span
            className="text-[10px] font-semibold"
            style={{
              color: activeTab === tab.key
                ? "var(--tg-theme-button-color, #DCA842)"
                : "var(--tg-theme-hint-color, #A0A0AA)",
            }}
          >
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
}

/* ── Settings placeholder screen ── */

function SettingsScreen({ wallet }: { wallet: NikkaWalletState | null }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 mb-4"
        style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path fillRule="evenodd" d="M14.694 2.765a2.25 2.25 0 0 0-3.388 0l-.744.844a2.25 2.25 0 0 1-2.12.718l-1.099-.22a2.25 2.25 0 0 0-2.687 1.582l-.289 1.078a2.25 2.25 0 0 1-1.04 1.38l-.97.592a2.25 2.25 0 0 0-.472 3.347l.662.72a2.25 2.25 0 0 1 0 3.06l-.662.72a2.25 2.25 0 0 0 .472 3.347l.97.592a2.25 2.25 0 0 1 1.04 1.38l.289 1.078a2.25 2.25 0 0 0 2.687 1.582l1.099-.22a2.25 2.25 0 0 1 2.12.718l.744.844a2.25 2.25 0 0 0 3.388 0l.744-.844a2.25 2.25 0 0 1 2.12-.718l1.099.22a2.25 2.25 0 0 0 2.687-1.582l.289-1.078a2.25 2.25 0 0 1 1.04-1.38l.97-.592a2.25 2.25 0 0 0 .472-3.347l-.662-.72a2.25 2.25 0 0 1 0-3.06l.662-.72a2.25 2.25 0 0 0-.472-3.347l-.97-.592a2.25 2.25 0 0 1-1.04-1.38l-.289-1.078a2.25 2.25 0 0 0-2.687-1.582l-1.099.22a2.25 2.25 0 0 1-2.12-.718l-.744-.844ZM12 9.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" clipRule="evenodd" />
      </svg>
      <p className="text-sm font-medium" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
        Settings
      </p>
      <p className="text-xs mt-1" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
        Security & developer options coming soon
      </p>
      {wallet && (
        <p className="text-xs mt-4 font-mono opacity-50" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
          {wallet.tonAddress.slice(0, 6)}...{wallet.tonAddress.slice(-4)}
        </p>
      )}
    </div>
  );
}

/* ── DASHBOARD screen ── */

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-5)}`;
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="w-3.5 h-3.5"
    >
      <path d="M5 3.5A1.5 1.5 0 0 1 6.5 2h5A1.5 1.5 0 0 1 13 3.5v5a1.5 1.5 0 0 1-1.5 1.5H9.5v-1.5A1.5 1.5 0 0 0 8 7H5V3.5Z" />
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h3A1.5 1.5 0 0 1 9 6.5v5A1.5 1.5 0 0 1 7.5 13h-3A1.5 1.5 0 0 1 3 11.5v-5Z" />
    </svg>
  );
}

interface DashboardScreenProps {
  wallet: NikkaWalletState | null;
  balances: BalanceData;
  balanceLoading: boolean;
  balanceError: string | null;
  copiedAddress: string | null;
  onCopyAddress: (address: string) => void;
  onOpenSend: () => void;
  onOpenReceive: () => void;
  onLock: () => void;
}

function DashboardScreen({
  wallet,
  balances,
  balanceLoading,
  balanceError,
  copiedAddress,
  onCopyAddress,
  onOpenSend,
  onOpenReceive,
  onLock,
}: DashboardScreenProps) {
  const [activityTab, setActivityTab] = useState<"activity" | "collectibles">("activity");

  const formatBalance = (v: number | null) =>
    v !== null ? v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

  const tonVal = balances.ton ?? 0;
  const trxVal = balances.trx ?? 0;
  const usdtVal = balances.usdt ?? 0;
  const totalUsd = tonVal * PRICES.TON + trxVal * PRICES.TRX + usdtVal * PRICES.USDT;

  const assets: { symbol: string; name: string; balance: number; price: number; change24h: number }[] = [
    { symbol: "TON", name: "Toncoin", balance: tonVal, price: PRICES.TON, change24h: 3.2 },
    { symbol: "TRX", name: "Tron", balance: trxVal, price: PRICES.TRX, change24h: -1.1 },
    { symbol: "USDT", name: "Tether USD", balance: usdtVal, price: PRICES.USDT, change24h: 0.01 },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-3 pb-2">
      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
            Nikka Wallet
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"
            style={{ color: "var(--tg-theme-accent-text-color, #DCA842)" }}>
            <path fillRule="evenodd" d="M8 1a4 4 0 0 1 4 4v2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2V5a4 4 0 0 1 4-4ZM4 7h8V5a3 3 0 1 0-6 0v2Z" clipRule="evenodd" />
          </svg>
        </div>
        {wallet && (
          <button
            onClick={() => onCopyAddress(wallet.tonAddress)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all active:scale-95"
            style={{
              backgroundColor: "var(--tg-theme-secondary-bg-color, #1E1E22)",
              color: "var(--tg-theme-hint-color, #A0A0AA)",
            }}
          >
            <span>{shortenAddress(wallet.tonAddress)}</span>
            {copiedAddress === wallet.tonAddress ? (
              <span className="text-[10px] font-medium" style={{ color: "var(--tg-theme-accent-text-color)" }}>Copied</span>
            ) : (
              <CopyIcon />
            )}
          </button>
        )}
      </header>

      {/* ── Portfolio Card ── */}
      <section
        className="rounded-2xl px-5 pt-6 pb-5 mb-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #232329, #1A1A1E, #2A2A32)",
          color: "#fff",
          border: "1px solid rgba(220,168,66,0.2)",
        }}
      >
        {/* Subtle decorative dot pattern */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 12px 12px, #fff 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative">
          {balanceError && (
            <p className="text-[11px] text-center opacity-70 mb-2">{balanceError}</p>
          )}

          {balanceLoading && totalUsd === 0 ? (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            </div>
          ) : (
            <>
              {/* Aggregate balance */}
              <p className="text-xs font-medium uppercase tracking-widest opacity-60 mb-1">Portfolio</p>
              <p className="text-3xl font-bold tracking-tight mb-1">
                ${totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs font-medium mb-5" style={{ color: "#DCA842" }}>+2.4% today</p>

              {/* Address chips */}
              <div className="flex flex-wrap gap-2">
                {wallet && (
                  <>
                    <button
                      onClick={() => onCopyAddress(wallet.tonAddress)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono"
                      style={{ backgroundColor: "rgba(220,168,66,0.12)", color: "#DCA842" }}
                    >
                      <span>TON {shortenAddress(wallet.tonAddress)}</span>
                      {copiedAddress === wallet.tonAddress ? (
                        <span className="text-[10px]">Copied</span>
                      ) : (
                        <CopyIcon />
                      )}
                    </button>
                    <button
                      onClick={() => onCopyAddress(wallet.tronAddress)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono"
                      style={{ backgroundColor: "rgba(220,168,66,0.12)", color: "#DCA842" }}
                    >
                      <span>TRX {shortenAddress(wallet.tronAddress)}</span>
                      {copiedAddress === wallet.tronAddress ? (
                        <span className="text-[10px]">Copied</span>
                      ) : (
                        <CopyIcon />
                      )}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Quick Actions: Send & Receive ── */}
      <div className="flex gap-3 mb-5">
        <button
          onClick={onOpenSend}
          className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
          style={{
            backgroundColor: "#DCA842",
            color: "#141416",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.414 4.925A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.9 28.9 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.9 28.9 0 0 0 3.105 2.289Z" />
          </svg>
          Send
        </button>
        <button
          onClick={onOpenReceive}
          className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
          style={{
            backgroundColor: "#DCA842",
            color: "#141416",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" />
          </svg>
          Receive
        </button>
      </div>

      {/* ── Asset Watchlist ── */}
      <section className="mb-5">
        <div className="rounded-xl overflow-hidden">
          {assets.map((a, i) => (
            <div
              key={a.symbol}
              className="flex items-center justify-between px-4 py-3.5"
              style={{
                backgroundColor: "var(--tg-theme-secondary-bg-color, #1E1E22)",
                borderBottom: i < assets.length - 1 ? "1px solid var(--tg-theme-bg-color, #141416)" : "none",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: a.symbol === "TON"
                      ? "linear-gradient(135deg, #0098EA, #0077B6)"
                      : a.symbol === "TRX"
                        ? "linear-gradient(135deg, #EF0027, #CC0020)"
                        : "linear-gradient(135deg, #26A17B, #1A7A5C)",
                    color: "#fff",
                  }}
                >
                  {a.symbol[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
                    {a.symbol}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
                    {a.name} &middot; ${a.price.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
                  {formatBalance(a.balance)}
                </p>
                <p
                  className="text-[11px] tabular-nums"
                  style={{ color: a.change24h >= 0 ? "var(--tg-theme-accent-text-color, #DCA842)" : "var(--tg-theme-destructive-text-color, #e53935)" }}
                >
                  {a.change24h >= 0 ? "+" : ""}{a.change24h}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Activity / Collectibles Tabs ── */}
      <section className="flex-1">
        <div className="flex gap-4 mb-3 px-1">
          {(["activity", "collectibles"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActivityTab(tab)}
              className="text-xs font-semibold uppercase tracking-widest pb-1 transition-all"
              style={{
                color: activityTab === tab
                  ? "var(--tg-theme-button-color, #DCA842)"
                  : "var(--tg-theme-hint-color, #A0A0AA)",
                borderBottom: activityTab === tab ? "2px solid var(--tg-theme-button-color, #DCA842)" : "2px solid transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activityTab === "activity" ? (
          <div className="space-y-[1px] rounded-xl overflow-hidden">
            {ACTIVITIES.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-4 py-3.5"
                style={{ backgroundColor: "var(--tg-theme-secondary-bg-color, #1E1E22)" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: tx.type === "receive"
                        ? "rgba(34,197,94,0.15)"
                        : tx.type === "send"
                          ? "rgba(239,68,68,0.12)"
                          : "var(--tg-theme-bg-color, #141416)",
                    }}
                  >
                    <span style={{
                      color: tx.type === "receive"
                        ? "#22c55e"
                        : tx.type === "send"
                          ? "#ef4444"
                          : "var(--tg-theme-hint-color, #A0A0AA)",
                    }}>
                      <ActivityIcon type={tx.type} />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium capitalize" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
                      {tx.type} {tx.asset}
                    </p>
                    <p className="text-[11px] flex items-center gap-1" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
                      {tx.date}
                      {tx.status === "pending" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(234,179,8,0.15)", color: "#ca8a04" }}>
                          pending
                        </span>
                      )}
                      {tx.status === "failed" && (
                        <span className="text-[10px]" style={{ color: "var(--tg-theme-destructive-text-color)" }}>
                          &middot; failed
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <span
                  className="text-sm font-semibold tabular-nums shrink-0 ml-3"
                  style={{
                    color: tx.type === "receive"
                      ? "#22c55e"
                      : "var(--tg-theme-text-color, #fff)",
                  }}
                >
                  {tx.type === "receive" ? "+" : "-"}{tx.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
              No collectibles yet
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Root component ── */

export default function Home() {
  const [screen, setScreen] = useState<Screen>("WELCOME");
  const [wallet, setWallet] = useState<NikkaWalletState | null>(null);
  const [activeTab, setActiveTab] = useState<"MAIN" | "SETTINGS">("MAIN");
  const [balances, setBalances] = useState<BalanceData>({
    ton: null,
    trx: null,
    usdt: null,
  });
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  /* ── Receive modal state ── */
  const [receiveAsset, setReceiveAsset] = useState<"NONE" | "TON" | "TRX" | "USDT">("NONE");
  const [receiveCopied, setReceiveCopied] = useState<string | null>(null);

  /* ── Send modal state ── */
  const [activeModal, setActiveModal] = useState<"NONE" | "SEND_TON" | "SEND_TRX" | "SEND_USDT">("NONE");
  const [sendStep, setSendStep] = useState<"NONE" | "PICK" | "FORM" | "SENDING" | "SUCCESS" | "ERROR">("NONE");
  const [sendError, setSendError] = useState("");
  const [sendTxId, setSendTxId] = useState("");
  const webAppRef = useRef<Awaited<typeof import("@twa-dev/sdk").default> | null>(null);
  const pinRef = useRef<string>("");
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    import("@twa-dev/sdk").then(({ default: WebApp }) => {
      webAppRef.current = WebApp;
      WebApp.ready();
      WebApp.expand();
    });
  }, []);

  /* ── Idle lock timer: 3 min of inactivity → IDLE_LOCKED ── */
  useEffect(() => {
    if (screen !== "DASHBOARD") return;

    const updateActivity = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener("touchstart", updateActivity);
    window.addEventListener("mousedown", updateActivity);
    window.addEventListener("keydown", updateActivity);

    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > 180_000) {
        setScreen("IDLE_LOCKED");
      }
    }, 10_000);

    return () => {
      window.removeEventListener("touchstart", updateActivity);
      window.removeEventListener("mousedown", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      clearInterval(interval);
    };
  }, [screen]);

  /* Fetch live balances when the dashboard mounts */
  useEffect(() => {
    if (screen !== "DASHBOARD" || !wallet) return;

    let cancelled = false;

    const run = async () => {
      setBalanceLoading(true);
      setBalanceError(null);
      try {
        const [ton, trx, usdt] = await Promise.all([
          fetchTonBalance(wallet.tonAddress),
          fetchTronBalance(wallet.tronAddress),
          fetchUsdtBalance(wallet.tronAddress),
        ]);
        if (cancelled) return;
        setBalances({ ton, trx, usdt });
      } catch {
        if (!cancelled) setBalanceError("Could not fetch balances");
      } finally {
        if (!cancelled) setBalanceLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [screen, wallet]);

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  const handleNewWallet = () => {
    const w = generateNikkaWallet();
    setWallet(w);
    setScreen("SHOW_SEED");
  };

  const handleImportClick = () => {
    setScreen("IMPORT_SEED");
  };

  const handleImport = (mnemonic: string) => {
    const w = restoreNikkaWallet(mnemonic);
    setWallet(w);
    setScreen("SET_PIN");
  };

  const handleSeedConfirmed = () => {
    setScreen("SET_PIN");
  };

  const handlePinConfirmed = async (pin: string) => {
    if (!wallet) return;
    pinRef.current = pin;
    lastActivityRef.current = Date.now();
    try {
      const encrypted = await encryptMnemonic(wallet.mnemonic, pin);
      const webApp = webAppRef.current;
      if (webApp?.isVersionAtLeast?.("6.9") && webApp?.CloudStorage?.setItem) {
        webApp.CloudStorage.setItem("nikka_encrypted", encrypted, (err: string | null) => {
          if (err) localStorage.setItem("nikka_encrypted", encrypted);
        });
      } else {
        localStorage.setItem("nikka_encrypted", encrypted);
      }
    } catch {
      localStorage.setItem("nikka_encrypted", await encryptMnemonic(wallet.mnemonic, pin));
    }
    setScreen("DASHBOARD");
  };

  /* ── Receive flow handlers ── */

  const handleOpenReceive = () => {
    setReceiveAsset("TON"); // default to TON picker
    setReceiveCopied(null);
  };

  const handlePickReceiveAsset = (asset: "TON" | "TRX" | "USDT") => {
    setReceiveAsset(asset);
    setReceiveCopied(null);
  };

  const handleCopyReceiveAddress = async (addr: string) => {
    try {
      await navigator.clipboard.writeText(addr);
      setReceiveCopied(addr);
      try { webAppRef.current?.HapticFeedback?.notificationOccurred?.("success"); } catch { /* no-op */ }
      setTimeout(() => setReceiveCopied(null), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const handleCloseReceive = () => {
    setReceiveAsset("NONE");
    setReceiveCopied(null);
  };

  /* ── Send flow handlers ── */

  const handleOpenSend = () => {
    setSendStep("PICK");
    setSendError("");
    setSendTxId("");
  };

  const handlePickAsset = (asset: "SEND_TON" | "SEND_TRX" | "SEND_USDT") => {
    setActiveModal(asset);
    setSendStep("FORM");
    setSendError("");
    setSendTxId("");
  };

  const handleSendCancel = () => {
    setActiveModal("NONE");
    setSendStep("NONE");
    setSendError("");
    setSendTxId("");
  };

  const handleSendSubmit = async (recipient: string, amount: number, pin: string) => {
    if (!wallet) return;
    setSendStep("SENDING");
    setSendError("");

    try {
      // Retrieve encrypted mnemonic
      const encrypted = await new Promise<string>((resolve, reject) => {
        const webApp = webAppRef.current;
        if (webApp?.isVersionAtLeast?.("6.9") && webApp?.CloudStorage?.getItem) {
          webApp.CloudStorage.getItem("nikka_encrypted", (err: string | null, val?: string) => {
            if (err || !val) { reject(new Error("Could not retrieve wallet from secure storage")); return; }
            else resolve(val);
          });
        } else {
          const val = localStorage.getItem("nikka_encrypted");
          if (!val) reject(new Error("Could not retrieve wallet from local storage"));
          else resolve(val);
        }
      });
      const mnemonic = await decryptMnemonic(encrypted, pin);

      // Build, sign, and broadcast based on asset type
      let txid = "";
      if (activeModal === "SEND_TON") {
        txid = await createAndSendTonTransfer(mnemonic, recipient, amount);
      } else if (activeModal === "SEND_TRX") {
        const amountSun = Math.round(amount * 1_000_000);
        const signed = await createAndSignTronTransfer(
          wallet.tronPrivateKey, wallet.tronAddress, recipient, amountSun,
        );
        txid = await broadcastTronTransaction(signed);
      } else if (activeModal === "SEND_USDT") {
        const amountUnits = Math.round(amount * 1_000_000);
        const signed = await createAndSignUsdtTransfer(
          wallet.tronPrivateKey, wallet.tronAddress, recipient, amountUnits,
        );
        txid = await broadcastTronTransaction(signed);
      }

      setSendTxId(txid);
      setSendStep("SUCCESS");

      // Haptic feedback if available
      try {
        webAppRef.current?.HapticFeedback?.notificationOccurred?.("success");
      } catch { /* ignore */ }
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Transaction failed");
      setSendStep("ERROR");
    }
  };

  const handleSendDone = () => {
    // Refresh balances
    if (wallet) {
      Promise.all([
        fetchTonBalance(wallet.tonAddress).then((v) => setBalances((p) => ({ ...p, ton: v }))),
        fetchTronBalance(wallet.tronAddress).then((v) => setBalances((p) => ({ ...p, trx: v }))),
        fetchUsdtBalance(wallet.tronAddress).then((v) => setBalances((p) => ({ ...p, usdt: v }))),
      ]).catch(() => {});
    }
    setActiveModal("NONE");
    setSendStep("NONE");
    setSendError("");
    setSendTxId("");
  };

  const renderSendModal = () => {
    if (sendStep === "PICK") {
      return (
        <SendModalOverlay>
          <AssetPickerScreen
            onPick={handlePickAsset}
            onCancel={handleSendCancel}
          />
        </SendModalOverlay>
      );
    }
    if (sendStep === "FORM") {
      const assetLabel = activeModal === "SEND_TON" ? "TON"
        : activeModal === "SEND_TRX" ? "TRX" : "USDT";
      const currentBalance = activeModal === "SEND_TON" ? balances.ton
        : activeModal === "SEND_TRX" ? balances.trx : balances.usdt;
      return (
        <SendModalOverlay>
          <SendFormScreen
            assetLabel={assetLabel}
            currentBalance={currentBalance ?? 0}
            isTron={activeModal === "SEND_TRX" || activeModal === "SEND_USDT"}
            onSubmit={handleSendSubmit}
            onCancel={handleSendCancel}
          />
        </SendModalOverlay>
      );
    }
    if (sendStep === "SENDING") {
      return (
        <SendModalOverlay>
          <SendingScreen />
        </SendModalOverlay>
      );
    }
    if (sendStep === "SUCCESS") {
      return (
        <SendModalOverlay>
          <SuccessScreen
            txid={sendTxId}
            onDone={handleSendDone}
          />
        </SendModalOverlay>
      );
    }
    if (sendStep === "ERROR") {
      return (
        <SendModalOverlay>
          <ErrorScreen
            error={sendError}
            onRetry={() => setSendStep("FORM")}
            onCancel={handleSendDone}
          />
        </SendModalOverlay>
      );
    }
    return null;
  };

  /* ── Receive modal renderer ── */

  const renderReceiveModal = () => {
    if (receiveAsset === "NONE" || !wallet) return null;

    const address =
      receiveAsset === "TON" ? wallet.tonAddress
      : receiveAsset === "TRX" ? wallet.tronAddress
      : wallet.tronAddress;

    const networkLabel =
      receiveAsset === "TON" ? "TON Network"
      : receiveAsset === "TRX" ? "TRON Network"
      : "TRON Network (TRC-20)";

    const shortLabel =
      receiveAsset === "TON" ? "TON"
      : receiveAsset === "TRX" ? "TRX"
      : "USDT";

    const isUsdt = receiveAsset === "USDT";

    return (
      <SendModalOverlay>
        <div className="flex flex-col h-full px-4 pt-3 pb-6">
          {/* Header */}
          <div className="text-center pb-3">
            <h1 className="text-lg font-bold" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
              Receive {shortLabel}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
              {networkLabel}
            </p>
          </div>

          {/* Cross-chain warning */}
          <div
            className="rounded-xl px-4 py-3 mb-5 flex items-start gap-2 text-xs font-medium"
            style={{ backgroundColor: "var(--tg-theme-secondary-bg-color, #1E1E22)" }}
          >
            <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ backgroundColor: "var(--tg-theme-destructive-text-color, #e53935)" }}>
              !
            </span>
            <span style={{ color: "var(--tg-theme-hint-color, #A0A0AA)", lineHeight: 1.4 }}>
              {isUsdt
                ? "Send only USDT on TRON (TRC-20). Other networks will result in permanent loss."
                : receiveAsset === "TRX"
                  ? "Send only TRX on TRON network. Other networks will result in permanent loss."
                  : "Send only TON on TON network. Other networks will result in permanent loss."}
            </span>
          </div>

          {/* Centered QR + address — symmetric to send layout */}
          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            {/* White QR wrapper */}
            <div
              className="rounded-2xl p-5 shadow-sm"
              style={{ backgroundColor: "var(--tg-theme-section-bg-color, #fff)" }}
            >
              <QRCodeSVG
                value={address}
                size={180}
                bgColor="transparent"
                fgColor="#000"
                level="M"
              />
            </div>

            {/* Full address */}
            <div
              className="w-full rounded-xl px-4 py-3.5 text-center"
              style={{ backgroundColor: "var(--tg-theme-secondary-bg-color, #1E1E22)" }}
            >
              <p
                className="text-xs font-mono leading-relaxed break-all select-all"
                style={{ color: "var(--tg-theme-text-color, #fff)" }}
              >
                {address}
              </p>
            </div>

            {/* Copy Address block */}
            <button
              onClick={() => handleCopyReceiveAddress(address)}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              style={{
                backgroundColor: receiveCopied === address
                  ? "var(--tgme-accent-text-color, #DCA842)"
                  : "var(--tg-theme-secondary-bg-color, #1E1E22)",
                color: receiveCopied === address
                  ? "#fff"
                  : "var(--tg-theme-button-color, #DCA842)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
                <path d="M3 4.5v11A2.5 2.5 0 0 0 5.5 18h5A2.5 2.5 0 0 0 13 15.5v-7.05a2.5 2.5 0 0 0-.732-1.768L9.318 4.232A2.5 2.5 0 0 0 7.55 3.5H5.5A2.5 2.5 0 0 0 3 4.5Z" />
              </svg>
              {receiveCopied === address ? "Copied!" : "Copy Address"}
            </button>
          </div>

          {/* Switch asset row + close */}
          <div className="flex flex-col gap-3 mt-auto pt-4">
            <div className="flex gap-2">
              {(["TON", "TRX", "USDT"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => handlePickReceiveAsset(a)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.97]"
                  style={{
                    backgroundColor:
                      receiveAsset === a
                        ? "var(--tg-theme-button-color, #DCA842)"
                        : "var(--tg-theme-secondary-bg-color, #1E1E22)",
                    color:
                      receiveAsset === a
                        ? "var(--tg-theme-button-text-color, #fff)"
                        : "var(--tg-theme-text-color, #fff)",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>

            <button
              onClick={handleCloseReceive}
              className="w-full py-3 rounded-xl font-semibold text-sm"
              style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}
            >
              Close
            </button>
          </div>
        </div>
      </SendModalOverlay>
    );
  };

  /* ── Idle lock handlers ── */

  const handleLock = () => {
    if (screen === "DASHBOARD") {
      // Close any open modals first
      setReceiveAsset("NONE");
      setActiveModal("NONE");
      setSendStep("NONE");
      setScreen("IDLE_LOCKED");
    }
  };

  const handleUnlock = (enteredPin: string): boolean => {
    if (enteredPin === pinRef.current) {
      lastActivityRef.current = Date.now();
      setScreen("DASHBOARD");
      return true;
    }
    return false;
  };

  switch (screen) {
    case "WELCOME":
      return (
        <WelcomeScreen
          onNewWallet={handleNewWallet}
          onImport={handleImportClick}
        />
      );

    case "SHOW_SEED":
      return (
        <ShowSeedScreen
          wallet={wallet!}
          onConfirm={handleSeedConfirmed}
        />
      );

    case "IMPORT_SEED":
      return (
        <ImportSeedScreen
          onImport={handleImport}
          onBack={() => setScreen("WELCOME")}
        />
      );

    case "SET_PIN":
      return <SetPinScreen onConfirm={handlePinConfirmed} />;

    case "DASHBOARD":
      return (
        <>
          <div className="flex flex-col h-[100dvh]">
            {activeTab === "MAIN" ? (
              <DashboardScreen
                wallet={wallet}
                balances={balances}
                balanceLoading={balanceLoading}
                balanceError={balanceError}
                copiedAddress={copiedAddress}
                onCopyAddress={handleCopyAddress}
                onOpenSend={handleOpenSend}
                onOpenReceive={handleOpenReceive}
                onLock={handleLock}
              />
            ) : (
              <SettingsScreen wallet={wallet} />
            )}
            <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          {renderSendModal()}
          {renderReceiveModal()}
        </>
      );

    case "IDLE_LOCKED":
      return <IdleLockScreen onUnlock={handleUnlock} />;
  }
}