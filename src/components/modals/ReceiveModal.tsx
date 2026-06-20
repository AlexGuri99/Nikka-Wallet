"use client";
import { QRCodeSVG } from "qrcode.react";
import type { NikkaWalletState } from "@/utils/cryptoCore";

export interface ReceiveModalProps {
  receiveAsset: "NONE" | "TON" | "TRX" | "USDT";
  receiveCopied: string | null;
  wallet: NikkaWalletState;
  onPickAsset: (asset: "TON" | "TRX" | "USDT") => void;
  onCopyAddress: (address: string) => void;
  onCancel: () => void;
}

export function ReceiveModal({
  receiveAsset,
  receiveCopied,
  wallet,
  onPickAsset,
  onCopyAddress,
  onCancel,
}: ReceiveModalProps) {
  if (receiveAsset === "NONE") return null;

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
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        backgroundColor: "var(--tg-theme-bg-color, #141416)",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
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
          <span
            className="shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ backgroundColor: "var(--tg-theme-destructive-text-color, #e53935)" }}
          >
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

        {/* QR + address */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--tg-theme-section-bg-color, #fff)" }}>
            <QRCodeSVG value={address} size={180} bgColor="transparent" fgColor="#000" level="M" />
          </div>

          <div
            className="w-full rounded-xl px-4 py-3.5 text-center"
            style={{ backgroundColor: "var(--tg-theme-secondary-bg-color, #1E1E22)" }}
          >
            <p className="text-xs font-mono leading-relaxed break-all select-all" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
              {address}
            </p>
          </div>

          <button
            onClick={() => onCopyAddress(address)}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            style={{
              backgroundColor:
                receiveCopied === address
                  ? "var(--tgme-accent-text-color, #DCA842)"
                  : "var(--tg-theme-secondary-bg-color, #1E1E22)",
              color: receiveCopied === address ? "#fff" : "var(--tg-theme-button-color, #DCA842)",
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
                onClick={() => onPickAsset(a)}
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
            onClick={onCancel}
            className="w-full py-3 rounded-xl font-semibold text-sm"
            style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}