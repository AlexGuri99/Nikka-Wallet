"use client";
import type { NikkaWalletState } from "@/utils/cryptoCore";

export function SettingsScreen({ wallet }: { wallet: NikkaWalletState | null }) {
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