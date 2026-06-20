"use client";
import { ScreenFrame } from "@/components/ui/ScreenFrame";

export function WelcomeScreen({
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
          style={{ backgroundColor: "var(--tg-theme-button-color, #DCA842)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
            <path d="M11.584 2.376a.75.75 0 0 1 .832 0l9 6a.75.75 0 1 1-.832 1.248L12 4.013 3.416 9.624a.75.75 0 0 1-.832-1.248l9-6Z" />
            <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1 0-1.5h.75v-9.918a.75.75 0 0 1 .634-.74 49.29 49.29 0 0 1 5.866-.284 49.3 49.3 0 0 1 5.746.284.75.75 0 0 1 .634.74Z" clipRule="evenodd" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
            Nikka Wallet
          </h1>
          <p className="text-sm" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
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