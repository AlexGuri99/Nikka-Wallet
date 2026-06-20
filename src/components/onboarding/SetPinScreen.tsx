"use client";
import { useState } from "react";

export function SetPinScreen({ onConfirm }: { onConfirm: (pin: string) => void }) {
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);

  const isComplete = /^\d{4}$/.test(pin) && pin === confirm;
  const showMismatch = touched && confirm.length > 0 && pin !== confirm;

  return (
    <div className="flex-1 flex flex-col">
      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-lg font-bold mb-1" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
          Set Your PIN
        </h1>
        <p className="text-sm" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
          Choose a 4-digit code to secure your wallet
        </p>
      </div>

      {/* PIN fields */}
      <div className="flex flex-col gap-4 max-w-[220px] mx-auto w-full">
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
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
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
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
            <span className="text-xs" style={{ color: "var(--tg-theme-destructive-text-color, #e53935)" }}>
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
  );
}