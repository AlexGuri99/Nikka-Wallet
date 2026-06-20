"use client";
import { useState } from "react";
import { validateMnemonic } from "bip39";
import { tt } from "@/translations";
import type { Lang } from "@/translations";

export function ImportSeedScreen({
  lang,
  onImport,
}: {
  lang: Lang;
  onImport: (mnemonic: string) => void;
}) {
  const [input, setInput] = useState("");
  const trimmed = input.trim().replace(/\s+/g, " ");
  const isValid = trimmed.split(" ").length === 24 && validateMnemonic(trimmed);
  const showWarning = input.length > 0 && !isValid;

  return (
    <div className="flex-1 flex flex-col">
      {/* Heading */}
      <div className="text-center mb-5">
        <h1 className="text-lg font-bold mb-1" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
          {tt(lang, 'importTitle')}
        </h1>
        <p className="text-sm" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
          {tt(lang, 'importSubtitle')}
        </p>
      </div>

      {/* Text area */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={tt(lang, 'importPlaceholder')}
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"
              style={{ color: "var(--tg-theme-accent-text-color, #DCA842)" }}>
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium" style={{ color: "var(--tg-theme-accent-text-color, #DCA842)" }}>
              {tt(lang, 'importValid')}
            </span>
          </>
        )}
        {showWarning && (
          <span className="text-xs" style={{ color: "var(--tg-theme-destructive-text-color, #e53935)" }}>
            {tt(lang, 'importInvalid')}
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
          {tt(lang, 'importButton')}
        </button>
      </div>
    </div>
  );
}