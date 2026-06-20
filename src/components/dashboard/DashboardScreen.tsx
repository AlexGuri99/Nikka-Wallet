"use client";
import { useState } from "react";
import type { NikkaWalletState } from "@/utils/cryptoCore";
import type { BalanceData, CryptoActivity } from "@/types";
import { PRICES } from "@/types";
import { ActivityIcon } from "@/components/ui/ActivityIcon";
import { tt } from "@/translations";
import type { Lang } from "@/translations";

const ACTIVITIES: CryptoActivity[] = [
  { id: 1, type: "receive", asset: "TON", amount: 125.5, usdValue: 313.75, date: "Jun 17", status: "completed" },
  { id: 2, type: "send", asset: "USDT", amount: 50, usdValue: 50, date: "Jun 16", status: "completed" },
  { id: 4, type: "swap", asset: "TON", amount: 10, usdValue: 25, date: "Jun 14", status: "completed" },
  { id: 5, type: "receive", asset: "USDT", amount: 200, usdValue: 200, date: "Jun 12", status: "completed" },
];

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-5)}`;
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M5 3.5A1.5 1.5 0 0 1 6.5 2h5A1.5 1.5 0 0 1 13 3.5v5a1.5 1.5 0 0 1-1.5 1.5H9.5v-1.5A1.5 1.5 0 0 0 8 7H5V3.5Z" />
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h3A1.5 1.5 0 0 1 9 6.5v5A1.5 1.5 0 0 1 7.5 13h-3A1.5 1.5 0 0 1 3 11.5v-5Z" />
    </svg>
  );
}

export interface DashboardScreenProps {
  wallet: NikkaWalletState | null;
  balances: BalanceData;
  balanceLoading: boolean;
  balanceError: string | null;
  copiedAddress: string | null;
  lang: Lang;
  onCopyAddress: (address: string) => void;
  onOpenSend: () => void;
  onOpenReceive: () => void;
  onLock: () => void;
}

export function DashboardScreen({
  wallet,
  balances,
  balanceLoading,
  balanceError,
  copiedAddress,
  lang,
  onCopyAddress,
  onOpenSend,
  onOpenReceive,
  onLock,
}: DashboardScreenProps) {
  const [activityTab, setActivityTab] = useState<"activity" | "collectibles">("activity");

  const formatBalance = (v: number | null) =>
    v !== null ? v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

  const tonVal = balances.ton ?? 0;
  const usdtVal = balances.usdt ?? 0;
  const totalUsd = tonVal * PRICES.TON + usdtVal * PRICES.USDT;

  const assets: { symbol: string; name: string; balance: number; price: number; change24h: number }[] = [
    { symbol: "TON", name: "Toncoin", balance: tonVal, price: PRICES.TON, change24h: 3.2 },
    { symbol: "USDT", name: "Tether USD (TRC-20)", balance: usdtVal, price: PRICES.USDT, change24h: 0.01 },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-3 pb-2">
      {/* Top Bar */}
      <header className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
            {tt(lang, 'walletName')}
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
              <span className="text-[10px] font-medium" style={{ color: "var(--tg-theme-accent-text-color)" }}>{tt(lang, 'copiedShort')}</span>
            ) : (
              <CopyIcon />
            )}
          </button>
        )}
      </header>

      {/* Portfolio Card */}
      <section
        className="rounded-2xl px-5 pt-6 pb-5 mb-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #232329, #1A1A1E, #2A2A32)",
          color: "#fff",
          border: "1px solid rgba(220,168,66,0.2)",
        }}
      >
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
              <p className="text-xs font-medium uppercase tracking-widest opacity-60 mb-1">{tt(lang, 'portfolio')}</p>
              <p className="text-3xl font-bold tracking-tight mb-1">
                ${totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs font-medium mb-5" style={{ color: "#DCA842" }}>{tt(lang, 'todayChange')}</p>
              <div className="flex flex-wrap gap-2">
                {wallet && (
                  <button
                    onClick={() => onCopyAddress(wallet.tonAddress)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono"
                    style={{ backgroundColor: "rgba(220,168,66,0.12)", color: "#DCA842" }}
                  >
                    <span>TON {shortenAddress(wallet.tonAddress)}</span>
                    {copiedAddress === wallet.tonAddress ? (
                      <span className="text-[10px]">{tt(lang, 'copiedShort')}</span>
                    ) : (
                      <CopyIcon />
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-5">
        <button
          onClick={onOpenSend}
          className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
          style={{ backgroundColor: "#DCA842", color: "#141416" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.414 4.925A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.9 28.9 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.9 28.9 0 0 0 3.105 2.289Z" />
          </svg>
          {tt(lang, 'send')}
        </button>
        <button
          onClick={onOpenReceive}
          className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
          style={{ backgroundColor: "#DCA842", color: "#141416" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" />
          </svg>
          {tt(lang, 'receive')}
        </button>
      </div>

      {/* Asset Watchlist */}
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
                <p className="text-[11px] tabular-nums"
                  style={{ color: a.change24h >= 0 ? "var(--tg-theme-accent-text-color, #DCA842)" : "var(--tg-theme-destructive-text-color, #e53935)" }}>
                  {a.change24h >= 0 ? "+" : ""}{a.change24h}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Activity / Collectibles */}
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
              {tt(lang, tab === 'activity' ? 'activity' : 'collectibles')}
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
                      color: tx.type === "receive" ? "#22c55e" : tx.type === "send" ? "#ef4444" : "var(--tg-theme-hint-color, #A0A0AA)",
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
                  style={{ color: tx.type === "receive" ? "#22c55e" : "var(--tg-theme-text-color, #fff)" }}
                >
                  {tx.type === "receive" ? "+" : "-"}{tx.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
              {tt(lang, 'noCollectibles')}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}