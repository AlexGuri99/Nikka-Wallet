"use client";
import { useState } from "react";
import type { NikkaWalletState } from "@/utils/cryptoCore";

export function ShowSeedScreen({
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
      // clipboard not available
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Heading */}
      <div className="text-center mb-5">
        <h1 className="text-lg font-bold mb-1" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
          Your Recovery Phrase
        </h1>
        <p className="text-sm" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
          Write these 24 words down in order. Never share them with anyone.
        </p>
      </div>

      {/* 2×12 word grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {words.map((word, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            <span className="text-[10px] font-semibold w-3.5 shrink-0 text-center" style={{ color: "#DCA842" }}>
              {i + 1}
            </span>
            <span className="text-sm font-semibold truncate" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
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
  );
}