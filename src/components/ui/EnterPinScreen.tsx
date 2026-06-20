"use client";
import { useState } from "react";
import { tt } from "@/translations";
import type { Lang } from "@/translations";

export function EnterPinScreen({
  lang,
  error,
  onUnlock,
  onBack,
}: {
  lang: Lang;
  error: string;
  onUnlock: (pin: string) => void;
  onBack: () => void;
}) {
  const [digits, setDig] = useState("");

  const handleDigit = (d: string) => {
    if (digits.length >= 4) return;
    const next = digits + d;
    setDig(next);
    if (next.length === 4) onUnlock(next);
  };

  const handleDelete = () => setDig((d) => d.slice(0, -1));

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      {/* Logo */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ backgroundColor: "var(--tg-theme-button-color, #DCA842)" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
          <path d="M11.584 2.376a.75.75 0 0 1 .832 0l9 6a.75.75 0 1 1-.832 1.248L12 4.013 3.416 9.624a.75.75 0 0 1-.832-1.248l9-6Z" />
          <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1 0-1.5h.75v-9.918a.75.75 0 0 1 .634-.74 49.29 49.29 0 0 1 5.866-.284 49.3 49.3 0 0 1 5.746.284.75.75 0 0 1 .634.74Z" clipRule="evenodd" />
        </svg>
      </div>

      <h1 className="text-lg font-bold mb-1" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
        {tt(lang, 'enterPinTitle')}
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
        {tt(lang, 'enterPinSubtitle')}
      </p>

      {/* 4-dot indicator */}
      <div className="flex gap-3 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full transition-all duration-150"
            style={{
              backgroundColor:
                i < digits.length
                  ? "var(--tg-theme-button-color, #DCA842)"
                  : "var(--tg-theme-hint-color, #A0A0AA)",
              opacity: i < digits.length ? 1 : 0.3,
            }}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs mb-4" style={{ color: "var(--tg-theme-destructive-text-color, #e53935)" }}>
          {error}
        </p>
      )}

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

      {/* Reset wallet link */}
      <button
        onClick={onBack}
        className="mt-8 text-xs font-medium"
        style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}
      >
        {tt(lang, 'enterPinReset')}
      </button>
    </div>
  );
}