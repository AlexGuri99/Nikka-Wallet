"use client";

import { useEffect, useState } from "react";
import { validateMnemonic } from "bip39";
import {
  type NikkaWalletState,
  generateNikkaWallet,
  restoreNikkaWallet,
} from "@/utils/cryptoCore";

/* ── Types ── */

type Screen = "WELCOME" | "SHOW_SEED" | "IMPORT_SEED" | "SET_PIN" | "DASHBOARD";

interface Transaction {
  id: number;
  title: string;
  date: string;
  amount: number;
  category: "food" | "shopping" | "income" | "entertainment" | "transfer";
}

/* ── Mock data ── */

const TRANSACTIONS: Transaction[] = [
  { id: 1, title: "Starbucks Coffee", date: "Jun 18", amount: -4.5, category: "food" },
  { id: 2, title: "Salary Deposit", date: "Jun 15", amount: 3200, category: "income" },
  { id: 3, title: "Amazon.com", date: "Jun 14", amount: -29.99, category: "shopping" },
  { id: 4, title: "Netflix", date: "Jun 12", amount: -15.99, category: "entertainment" },
  { id: 5, title: "Wire Transfer", date: "Jun 10", amount: 500, category: "transfer" },
];

/* ── Category icon (SVG) ── */

function CategoryIcon({ category }: { category: Transaction["category"] }) {
  const paths: Record<string, React.ReactNode> = {
    food: <path d="M3 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a3 3 0 0 1-2 2.83V15a1 1 0 0 1-2 0V7.83A3 3 0 0 1 3 5V2Z" />,
    income: <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm1 11H9v-2H7V9h2V7h2v2h2v2h-2v2Z" />,
    shopping: <path d="M6 2h8l1.5 4H4.5L6 2ZM3.5 6h13l-.9 11.2A2 2 0 0 1 13.6 19H6.4a2 2 0 0 1-2-1.8L3.5 6Z" />,
    entertainment: <path d="M6.5 2.5a1 1 0 0 1 1 0l7 4a1 1 0 0 1 0 1.73l-7 4a1 1 0 0 1-1.5-.87v-8a1 1 0 0 1 .5-.86Z" />,
    transfer: <path d="M4 8a1 1 0 0 1 1-1h6.59l-1.3-1.3a1 1 0 0 1 1.42-1.4l3 3a1 1 0 0 1 0 1.4l-3 3a1 1 0 0 1-1.42-1.4L11.6 9H5a1 1 0 0 1-1-1Zm12 8H9.41l1.3 1.3a1 1 0 0 1-1.42 1.4l-3-3a1 1 0 0 1 0-1.4l3-3a1 1 0 0 1 1.42 1.4L9.4 14H16a1 1 0 0 1 0 2Z" />,
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5"
      style={{ color: "var(--tg-theme-hint-color, #999)" }}
    >
      {paths[category]}
    </svg>
  );
}

/* ── Shared layout wrapper ── */

function ScreenFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-[100dvh] min-h-dvh px-4 pt-3 pb-6">
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
            backgroundColor: "var(--tg-theme-button-color, #2481cc)",
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
            style={{ color: "var(--tg-theme-text-color, #000)" }}
          >
            Nikka Wallet
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--tg-theme-hint-color, #999)" }}
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
              backgroundColor: "var(--tg-theme-button-color, #2481cc)",
              color: "var(--tg-theme-button-text-color, #fff)",
            }}
          >
            Create New Wallet
          </button>

          <button
            onClick={onImport}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
            style={{
              backgroundColor: "var(--tg-theme-secondary-bg-color, #f4f4f5)",
              color: "var(--tg-theme-button-color, #2481cc)",
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
            style={{ color: "var(--tg-theme-text-color, #000)" }}
          >
            Your Recovery Phrase
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--tg-theme-hint-color, #999)" }}
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
                backgroundColor: "var(--tg-theme-secondary-bg-color, #f4f4f5)",
              }}
            >
              <span
                className="text-[10px] font-semibold w-3.5 shrink-0 text-center"
                style={{ color: "var(--tg-theme-hint-color, #999)" }}
              >
                {i + 1}
              </span>
              <span
                className="text-sm font-semibold truncate"
                style={{ color: "var(--tg-theme-text-color, #000)" }}
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
            backgroundColor: "var(--tg-theme-secondary-bg-color, #f4f4f5)",
            color: "var(--tg-theme-subtitle-text-color, #666)",
            borderLeft: "3px solid var(--tg-theme-destructive-text-color, #e53935)",
          }}
        >
          Nikka Wallet is a non-custodial wallet. We do not store or have access
          to your recovery phrase. If you lose it, your funds cannot be
          recovered.{" "}
          <strong
            style={{ color: "var(--tg-theme-text-color, #000)" }}
          >
            Write it down and keep it safe.
          </strong>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-auto">
          <button
            onClick={handleCopy}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
            style={{
              backgroundColor: "var(--tg-theme-secondary-bg-color, #f4f4f5)",
              color: copied
                ? "var(--tg-theme-accent-text-color, #2481cc)"
                : "var(--tg-theme-text-color, #000)",
            }}
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>

          <button
            onClick={onConfirm}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
            style={{
              backgroundColor: "var(--tg-theme-button-color, #2481cc)",
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
            style={{ color: "var(--tg-theme-text-color, #000)" }}
          >
            Import Wallet
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--tg-theme-hint-color, #999)" }}
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
          className="w-full resize-none rounded-xl p-4 text-sm font-mono outline-none transition-shadow focus:ring-2"
          style={{
            backgroundColor: "var(--tg-theme-secondary-bg-color, #f4f4f5)",
            color: "var(--tg-theme-text-color, #000)",
            boxShadow: isValid
              ? "inset 0 0 0 2px var(--tg-theme-accent-text-color, #2481cc)"
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
                style={{ color: "var(--tg-theme-accent-text-color, #2481cc)" }}
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                  clipRule="evenodd"
                />
              </svg>
              <span
                className="text-xs font-medium"
                style={{ color: "var(--tg-theme-accent-text-color, #2481cc)" }}
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
              backgroundColor: "var(--tg-theme-button-color, #2481cc)",
              color: "var(--tg-theme-button-text-color, #fff)",
            }}
          >
            Import
          </button>

          <button
            onClick={onBack}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
            style={{
              backgroundColor: "transparent",
              color: "var(--tg-theme-hint-color, #999)",
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

function SetPinScreen({ onConfirm }: { onConfirm: () => void }) {
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
            style={{ color: "var(--tg-theme-text-color, #000)" }}
          >
            Set Your PIN
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--tg-theme-hint-color, #999)" }}
          >
            Choose a 4-digit code to secure your wallet
          </p>
        </div>

        {/* PIN fields */}
        <div className="flex flex-col gap-4 max-w-[220px] mx-auto w-full">
          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--tg-theme-hint-color, #999)" }}
            >
              Enter PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                setPin(v);
              }}
              className="w-full text-center text-2xl tracking-[0.5em] rounded-xl py-3 outline-none transition-shadow focus:ring-2"
              style={{
                backgroundColor: "var(--tg-theme-secondary-bg-color, #f4f4f5)",
                color: "var(--tg-theme-text-color, #000)",
              }}
              autoFocus
            />
          </div>

          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--tg-theme-hint-color, #999)" }}
            >
              Confirm PIN
            </label>
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
              className="w-full text-center text-2xl tracking-[0.5em] rounded-xl py-3 outline-none transition-shadow focus:ring-2"
              style={{
                backgroundColor: "var(--tg-theme-secondary-bg-color, #f4f4f5)",
                color: "var(--tg-theme-text-color, #000)",
              }}
            />
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
          onClick={onConfirm}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 mt-auto"
          style={{
            backgroundColor: "var(--tg-theme-button-color, #2481cc)",
            color: "var(--tg-theme-button-text-color, #fff)",
          }}
        >
          Confirm PIN
        </button>
      </div>
    </ScreenFrame>
  );
}

/* ── DASHBOARD screen ── */

function DashboardScreen({ wallet }: { wallet: NikkaWalletState | null }) {
  return (
    <div className="flex flex-col min-h-[100dvh] min-h-dvh px-4 pt-3">
      {/* Header */}
      <header className="pb-4 text-center">
        <h1
          className="text-sm font-semibold tracking-wide uppercase"
          style={{ color: "var(--tg-theme-hint-color, #999)" }}
        >
          Nikka Wallet
        </h1>
      </header>

      {/* Balance card */}
      <section
        className="rounded-2xl px-6 pt-8 pb-7 mb-6 text-center"
        style={{
          backgroundColor: "var(--tg-theme-button-color, #2481cc)",
          color: "var(--tg-theme-button-text-color, #ffffff)",
        }}
      >
        <p className="text-xs font-medium uppercase tracking-widest opacity-75 mb-3">
          Total Balance
        </p>
        <p className="text-[2.75rem] font-bold leading-tight tracking-tight mb-1">
          $12,485.60
        </p>
        <p className="text-sm font-medium opacity-70">≈ €11,452.00</p>

        <div className="relative mt-5 flex justify-center gap-2">
          {["Sent", "Received"].map((label) => (
            <div
              key={label}
              className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider opacity-70"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/60" />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* Action buttons */}
      <div className="flex gap-3 mb-6">
        <button
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
          style={{
            backgroundColor: "var(--tg-theme-button-color, #2481cc)",
            color: "var(--tg-theme-button-text-color, #ffffff)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.414 4.925A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.9 28.9 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.9 28.9 0 0 0 3.105 2.289Z" />
          </svg>
          Send
        </button>

        <button
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
          style={{
            backgroundColor: "var(--tg-theme-secondary-bg-color, #f4f4f5)",
            color: "var(--tg-theme-button-color, #2481cc)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" />
          </svg>
          Receive
        </button>
      </div>

      {/* Transaction list */}
      <section className="flex-1">
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-3 px-1"
          style={{ color: "var(--tg-theme-hint-color, #999)" }}
        >
          Transactions
        </h2>

        <div className="space-y-[1px] rounded-xl overflow-hidden">
          {TRANSACTIONS.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between px-4 py-3.5"
              style={{
                backgroundColor: "var(--tg-theme-secondary-bg-color, #f4f4f5)",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "var(--tg-theme-bg-color, #fff)",
                  }}
                >
                  <CategoryIcon category={tx.category} />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--tg-theme-text-color, #000)" }}
                  >
                    {tx.title}
                  </p>
                  <p
                    className="text-[11px] mt-px"
                    style={{ color: "var(--tg-theme-hint-color, #999)" }}
                  >
                    {tx.date}
                  </p>
                </div>
              </div>

              <span
                className="text-sm font-semibold tabular-nums shrink-0 ml-3"
                style={{
                  color:
                    tx.amount > 0
                      ? "var(--tg-theme-accent-text-color, #2481cc)"
                      : "var(--tg-theme-text-color, #000)",
                }}
              >
                {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── Root component ── */

export default function Home() {
  const [screen, setScreen] = useState<Screen>("WELCOME");
  const [wallet, setWallet] = useState<NikkaWalletState | null>(null);

  useEffect(() => {
    import("@twa-dev/sdk").then(({ default: WebApp }) => {
      WebApp.ready();
      WebApp.expand();
    });
  }, []);

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

  const handlePinConfirmed = () => {
    setScreen("DASHBOARD");
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
      return <DashboardScreen wallet={wallet} />;
  }
}