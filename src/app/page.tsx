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
          onClick={() => onConfirm(pin)}
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
        backgroundColor: "var(--tg-theme-bg-color, #fff)",
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
        <h1 className="text-lg font-bold" style={{ color: "var(--tg-theme-text-color, #000)" }}>
          Send
        </h1>
        <p className="text-sm" style={{ color: "var(--tg-theme-hint-color, #999)" }}>
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
              backgroundColor: "var(--tg-theme-secondary-bg-color, #f4f4f5)",
              color: "var(--tg-theme-text-color, #000)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                style={{
                  backgroundColor: "var(--tg-theme-button-color, #2481cc)",
                  color: "var(--tg-theme-button-text-color, #fff)",
                }}
              >
                {a.label[0]}
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">{a.label}</p>
                <p className="text-xs" style={{ color: "var(--tg-theme-hint-color, #999)" }}>{a.sub}</p>
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
        style={{ color: "var(--tg-theme-hint-color, #999)" }}
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

  return (
    <div className="flex flex-col h-full px-4 pt-3 pb-6">
      <div className="text-center pb-4">
        <h1 className="text-lg font-bold" style={{ color: "var(--tg-theme-text-color, #000)" }}>
          Send {assetLabel}
        </h1>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* Recipient */}
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--tg-theme-hint-color, #999)" }}>
            Recipient Address
          </label>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={isTron ? "TXYZ..." : "EQD..."}
            className="w-full rounded-xl px-4 py-3 text-sm font-mono outline-none transition-shadow focus:ring-2"
            style={{
              backgroundColor: "var(--tg-theme-secondary-bg-color, #f4f4f5)",
              color: "var(--tg-theme-text-color, #000)",
              boxShadow: addrValid === true
                ? "inset 0 0 0 2px var(--tg-theme-accent-text-color, #2481cc)"
                : addrValid === false
                  ? "inset 0 0 0 2px var(--tg-theme-destructive-text-color, #e53935)"
                  : "none",
            }}
            spellCheck={false}
          />
          {addrValid === false && (
            <p className="text-xs mt-1" style={{ color: "var(--tg-theme-destructive-text-color, #e53935)" }}>
              Invalid {isTron ? "TRON" : "TON"} address
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--tg-theme-hint-color, #999)" }}>
            Amount ({assetLabel})
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min={0}
              step="any"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 pr-16"
              style={{
                backgroundColor: "var(--tg-theme-secondary-bg-color, #f4f4f5)",
                color: "var(--tg-theme-text-color, #000)",
                boxShadow: !amountOk && amount.length > 0
                  ? "inset 0 0 0 2px var(--tg-theme-destructive-text-color, #e53935)"
                  : "none",
              }}
            />
            <button
              onClick={() => setAmount(maxAmount.toFixed(6))}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold px-2 py-1 rounded-lg"
              style={{
                color: "var(--tg-theme-button-color, #2481cc)",
                backgroundColor: "var(--tg-theme-bg-color, #fff)",
              }}
            >
              MAX
            </button>
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-xs" style={{ color: "var(--tg-theme-hint-color, #999)" }}>
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
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--tg-theme-hint-color, #999)" }}>
            Enter 4-Digit PIN
          </label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="w-full text-center text-xl tracking-[0.5em] rounded-xl py-3 outline-none transition-shadow focus:ring-2"
            style={{
              backgroundColor: "var(--tg-theme-secondary-bg-color, #f4f4f5)",
              color: "var(--tg-theme-text-color, #000)",
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-auto">
        <button
          disabled={!canSubmit}
          onClick={handleAction}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
          style={{
            backgroundColor: "var(--tg-theme-button-color, #2481cc)",
            color: "var(--tg-theme-button-text-color, #fff)",
          }}
        >
          {submitting ? "Preparing..." : "Send"}
        </button>
        <button
          onClick={onCancel}
          className="w-full py-3 rounded-xl font-semibold text-sm"
          style={{ color: "var(--tg-theme-hint-color, #999)" }}
        >
          Cancel
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
          borderColor: "var(--tg-theme-button-color, #2481cc)",
          borderTopColor: "transparent",
        }}
      />
      <p className="text-sm font-medium" style={{ color: "var(--tg-theme-text-color, #000)" }}>
        Signing & broadcasting...
      </p>
      <p className="text-xs" style={{ color: "var(--tg-theme-hint-color, #999)" }}>
        Please wait while the transaction is processed
      </p>
    </div>
  );
}

function SuccessScreen({ txid, onDone }: { txid: string; onDone: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
      <div className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "var(--tg-theme-accent-text-color, #2481cc)" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
          <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold" style={{ color: "var(--tg-theme-text-color, #000)" }}>
          Sent!
        </p>
        <p className="text-xs mt-1 font-mono break-all" style={{ color: "var(--tg-theme-hint-color, #999)" }}>
          {txid}
        </p>
      </div>
      <button
        onClick={onDone}
        className="w-full max-w-xs py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] mt-6"
        style={{
          backgroundColor: "var(--tg-theme-button-color, #2481cc)",
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
        <p className="text-lg font-bold" style={{ color: "var(--tg-theme-text-color, #000)" }}>
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
            backgroundColor: "var(--tg-theme-button-color, #2481cc)",
            color: "var(--tg-theme-button-text-color, #fff)",
          }}
        >
          Try Again
        </button>
        <button
          onClick={onCancel}
          className="w-full py-3 rounded-xl font-semibold text-sm"
          style={{ color: "var(--tg-theme-hint-color, #999)" }}
        >
          Cancel
        </button>
      </div>
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
}: DashboardScreenProps) {
  const formatBalance = (v: number | null) =>
    v !== null ? v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

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
        className="rounded-2xl px-5 pt-5 pb-5 mb-6"
        style={{
          backgroundColor: "var(--tg-theme-button-color, #2481cc)",
          color: "var(--tg-theme-button-text-color, #ffffff)",
        }}
      >
        <p className="text-xs font-medium uppercase tracking-widest text-center opacity-75 mb-4">
          Portfolio
        </p>

        {balanceError && (
          <p className="text-[11px] text-center opacity-70 mb-3">{balanceError}</p>
        )}

        {balanceLoading && balances.ton === null ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* TON */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">TON</span>
                <span className="text-sm font-semibold tabular-nums">
                  {formatBalance(balances.ton)}
                </span>
              </div>
              {wallet && (
                <button
                  onClick={() => onCopyAddress(wallet.tonAddress)}
                  className="flex items-center gap-1 mt-0.5 text-[11px] opacity-65 active:opacity-100"
                >
                  <span className="font-mono">{shortenAddress(wallet.tonAddress)}</span>
                  {copiedAddress === wallet.tonAddress ? (
                    <span className="text-[10px] font-medium">Copied</span>
                  ) : (
                    <CopyIcon />
                  )}
                </button>
              )}
            </div>

            <div className="h-px bg-white/15" />

            {/* TRX */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">TRX</span>
                <span className="text-sm font-semibold tabular-nums">
                  {formatBalance(balances.trx)}
                </span>
              </div>
              {wallet && (
                <button
                  onClick={() => onCopyAddress(wallet.tronAddress)}
                  className="flex items-center gap-1 mt-0.5 text-[11px] opacity-65 active:opacity-100"
                >
                  <span className="font-mono">{shortenAddress(wallet.tronAddress)}</span>
                  {copiedAddress === wallet.tronAddress ? (
                    <span className="text-[10px] font-medium">Copied</span>
                  ) : (
                    <CopyIcon />
                  )}
                </button>
              )}
            </div>

            <div className="h-px bg-white/15" />

            {/* USDT */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">USDT</span>
                <span className="text-sm font-semibold tabular-nums">
                  ${formatBalance(balances.usdt)}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] font-mono opacity-50">TRC-20</p>
            </div>
          </div>
        )}
      </section>

      {/* Action buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={onOpenSend}
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
          onClick={onOpenReceive}
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

  useEffect(() => {
    import("@twa-dev/sdk").then(({ default: WebApp }) => {
      webAppRef.current = WebApp;
      WebApp.ready();
      WebApp.expand();
    });
  }, []);

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

    const canGoBack = receiveAsset !== "TON" && receiveAsset !== "TRX" && receiveAsset !== "USDT";
    // We use an internal step instead for asset picking — default shows QR directly.
    // If we need a picker, show it when receiveAsset is a special "PICK" value.
    // Instead, let's use a clean two-flow: open to TON, then user can switch via a button.

    return (
      <SendModalOverlay>
        <div className="flex flex-col h-full px-4 pt-3 pb-6">
          {/* Header */}
          <div className="text-center pb-3">
            <h1 className="text-lg font-bold" style={{ color: "var(--tg-theme-text-color, #000)" }}>
              Receive {shortLabel}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--tg-theme-hint-color, #999)" }}>
              {networkLabel}
            </p>
          </div>

          {/* Cross-chain warning */}
          <div
            className="rounded-xl px-4 py-2.5 mb-5 flex items-center gap-2 text-xs font-medium"
            style={{
              backgroundColor: isUsdt || receiveAsset === "TRX"
                ? "var(--tg-theme-secondary-bg-color, #f4f4f5)"
                : "var(--tg-theme-secondary-bg-color, #f4f4f5)",
            }}
          >
            <span
              className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                backgroundColor: "var(--tgme-destructive-text-color, #e53935)",
                color: "#fff",
              }}
            >
              !
            </span>
            <span style={{ color: "var(--tg-theme-hint-color, #999)" }}>
              {isUsdt
                ? "Send only USDT on TRON network (TRC-20). Sending other networks will result in permanent loss."
                : receiveAsset === "TRX"
                  ? "Send only TRX on TRON network. Sending other networks will result in permanent loss."
                  : "Send only TON on TON network. Sending other networks will result in permanent loss."}
            </span>
          </div>

          {/* QR code */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div
              className="rounded-2xl p-4"
              style={{ backgroundColor: "var(--tg-theme-section-bg-color, #fff)" }}
            >
              <QRCodeSVG
                value={address}
                size={180}
                bgColor="transparent"
                fgColor={(() => {
                  // approximate dark text colour from theme
                  return "#000";
                })()}
                level="M"
              />
            </div>

            {/* Full address */}
            <div
              className="w-full rounded-xl px-4 py-3 text-center"
              style={{ backgroundColor: "var(--tg-theme-secondary-bg-color, #f4f4f5)" }}
            >
              <p
                className="text-xs font-mono leading-relaxed break-all select-all"
                style={{ color: "var(--tg-theme-text-color, #000)" }}
              >
                {address}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-auto pt-4">
            <button
              onClick={() => handleCopyReceiveAddress(address)}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              style={{
                backgroundColor: "var(--tg-theme-button-color, #2481cc)",
                color: "var(--tg-theme-button-text-color, #fff)",
              }}
            >
              {receiveCopied === address ? "Copied!" : "Copy Address"}
            </button>

            {/* Switch asset row */}
            <div className="flex gap-2">
              {(["TON", "TRX", "USDT"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => handlePickReceiveAsset(a)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.97]"
                  style={{
                    backgroundColor:
                      receiveAsset === a
                        ? "var(--tg-theme-button-color, #2481cc)"
                        : "var(--tg-theme-secondary-bg-color, #f4f4f5)",
                    color:
                      receiveAsset === a
                        ? "var(--tg-theme-button-text-color, #fff)"
                        : "var(--tg-theme-text-color, #000)",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>

            <button
              onClick={handleCloseReceive}
              className="w-full py-3 rounded-xl font-semibold text-sm"
              style={{ color: "var(--tg-theme-hint-color, #999)" }}
            >
              Close
            </button>
          </div>
        </div>
      </SendModalOverlay>
    );
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
          <DashboardScreen
            wallet={wallet}
            balances={balances}
            balanceLoading={balanceLoading}
            balanceError={balanceError}
            copiedAddress={copiedAddress}
            onCopyAddress={handleCopyAddress}
            onOpenSend={handleOpenSend}
            onOpenReceive={handleOpenReceive}
          />
          {renderSendModal()}
          {renderReceiveModal()}
        </>
      );
  }
}