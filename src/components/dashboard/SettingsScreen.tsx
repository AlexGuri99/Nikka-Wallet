"use client";
import { useState } from "react";
import type { NikkaWalletState } from "@/utils/cryptoCore";
import { tt } from "@/translations";
import type { Lang } from "@/translations";

/* ── Types ── */

export interface SettingsScreenProps {
  wallet: NikkaWalletState | null;
  onAutoLockChange?: (minutes: number) => void;
  onChangePin?: () => void;
  currentAutoLockMinutes?: number;
  lang: Lang;
  setLang: (lang: Lang) => void;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
}

type View = "MAIN" | "SECURITY";

/* ── Row components ── */

function NavBack({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="flex items-center gap-2 px-1 py-3 transition-all active:scale-[0.97]"
      style={{ color: "var(--tg-theme-text-color, #fff)" }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
      </svg>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p
      className="text-xs font-semibold tracking-widest uppercase px-1 pb-2 pt-5"
      style={{ color: "var(--tg-theme-button-color, #DCA842)" }}
    >
      {title}
    </p>
  );
}

function SettingsRow({
  label,
  detail,
  chevron,
  onClick,
}: {
  label: string;
  detail?: string;
  chevron?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-4 py-3.5 transition-all active:scale-[0.98]"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        color: "var(--tg-theme-text-color, #fff)",
      }}
    >
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        {detail && (
          <span className="text-xs" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
            {detail}
          </span>
        )}
        {chevron && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-40">
            <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </button>
  );
}

/* ── Toggle Switch ── */

function ToggleSwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(!on); }}
      className="relative w-11 h-6 rounded-full transition-all duration-200 shrink-0"
      style={{
        backgroundColor: on ? "var(--tg-theme-button-color, #DCA842)" : "rgba(255,255,255,0.12)",
      }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ left: on ? "22px" : "2px" }}
      />
    </button>
  );
}

/* ── Radio picker ── */

function RadioGroup<T extends string | number>({
  options,
  selected,
  onChange,
}: {
  options: { value: T; label: string }[];
  selected: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col">
      {options.map((o, i) => {
        const isLast = i === options.length - 1;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="flex items-center justify-between w-full px-4 py-3.5 transition-all active:scale-[0.98]"
            style={{
              borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.05)",
              color: "var(--tg-theme-text-color, #fff)",
            }}
          >
            <span className="text-sm">{o.label}</span>
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
              style={{
                borderColor:
                  selected === o.value
                    ? "var(--tg-theme-button-color, #DCA842)"
                    : "rgba(255,255,255,0.2)",
              }}
            >
              {selected === o.value && (
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: "var(--tg-theme-button-color, #DCA842)" }}
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ── About Modal ── */

function AboutModal({ onClose, lang }: { onClose: () => void; lang: Lang }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl px-5 py-6"
        style={{ backgroundColor: "var(--tg-theme-secondary-bg-color, #1E1E22)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center pb-4">
          <div
            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: "var(--tg-theme-button-color, #DCA842)", color: "#fff" }}
          >
            N
          </div>
          <h2 className="text-base font-bold" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
            {tt(lang, 'walletName')}
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
            {tt(lang, 'walletVersion')}
          </p>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
          {tt(lang, 'aboutDesc')}
        </p>
        <button
          onClick={onClose}
          className="w-full mt-5 py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
          style={{
            backgroundColor: "var(--tg-theme-button-color, #DCA842)",
            color: "var(--tg-theme-button-text-color, #fff)",
          }}
        >
          {tt(lang, 'close')}
        </button>
      </div>
    </div>
  );
}

/* ── Toast ── */

function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-xl shadow-lg transition-all duration-300"
      style={{
        backgroundColor: "var(--tg-theme-button-color, #DCA842)",
        color: "var(--tg-theme-button-text-color, #fff)",
      }}
    >
      <p className="text-xs font-medium whitespace-nowrap">{message}</p>
    </div>
  );
}

/* ── Change PIN inline screen ── */

function ChangePinScreen({
  wallet,
  onComplete,
  onCancel,
  lang,
}: {
  wallet: NikkaWalletState;
  onComplete: (newPin: string) => void;
  onCancel: () => void;
  lang: Lang;
}) {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (newPin !== confirmPin) {
      setError(tt(lang, 'pinMismatch'));
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      setError("PIN must be 4 digits");
      return;
    }
    setError("");
    onComplete(newPin);
  };

  return (
    <div className="flex flex-col h-full px-4 pt-2 pb-6">
      <NavBack label={tt(lang, 'changePin')} onBack={onCancel} />

      <div className="flex-1 flex flex-col gap-4 mt-6">
        <p className="text-xs" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
          {tt(lang, 'changePinDesc')}
        </p>

        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
            {tt(lang, 'currentPin')}
          </label>
          <div className="rounded-xl px-4 py-3" style={{ backgroundColor: "var(--tg-theme-secondary-bg-color, #1E1E22)" }}>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-transparent text-center text-xl tracking-[0.5em] outline-none"
              style={{ color: "var(--tg-theme-text-color, #fff)" }}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
            {tt(lang, 'newPin')}
          </label>
          <div className="rounded-xl px-4 py-3" style={{ backgroundColor: "var(--tg-theme-secondary-bg-color, #1E1E22)" }}>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-transparent text-center text-xl tracking-[0.5em] outline-none"
              style={{ color: "var(--tg-theme-text-color, #fff)" }}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
            {tt(lang, 'confirmNewPin')}
          </label>
          <div className="rounded-xl px-4 py-3" style={{ backgroundColor: "var(--tg-theme-secondary-bg-color, #1E1E22)" }}>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-transparent text-center text-xl tracking-[0.5em] outline-none"
              style={{ color: "var(--tg-theme-text-color, #fff)" }}
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-center" style={{ color: "var(--tg-theme-destructive-text-color, #e53935)" }}>
            {error}
          </p>
        )}
      </div>

      <div className="flex gap-3 mt-auto pt-4">
        <button
          onClick={onCancel}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
          style={{
            color: "var(--tg-theme-hint-color, #A0A0AA)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {tt(lang, 'cancel')}
        </button>
        <button
          onClick={handleConfirm}
          disabled={!currentPin || !newPin || !confirmPin}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-40"
          style={{
            backgroundColor: "var(--tg-theme-button-color, #DCA842)",
            color: "var(--tg-theme-button-text-color, #fff)",
          }}
        >
          {tt(lang, 'changePinButton')}
        </button>
      </div>
    </div>
  );
}

/* ── SettingsScreen ── */

export function SettingsScreen({
  wallet,
  onAutoLockChange,
  onChangePin,
  currentAutoLockMinutes = 5,
  lang,
  setLang,
  theme,
  setTheme,
}: SettingsScreenProps) {
  const [settingsView, setSettingsView] = useState<View>("MAIN");
  const [subView, setSubView] = useState<"NONE" | "CHANGE_PIN">("NONE");
  const [autoLock, setAutoLock] = useState<number>(currentAutoLockMinutes);
  const [useBiometrics, setUseBiometrics] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const handleAutoLockChange = (minutes: number) => {
    setAutoLock(minutes);
    onAutoLockChange?.(minutes);
    showToast(tt(lang, 'autoLockToast', { min: String(minutes) }));
  };

  const handleThemeToggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    showToast(tt(lang, 'themeToast', { mode: next === 'dark' ? tt(lang, 'dark') : tt(lang, 'light') }));
  };

  const handleBiometricsToggle = () => {
    const next = !useBiometrics;
    // @ts-expect-error — web app API check
    const hasBiometrics = typeof window !== "undefined" && (window?.Telegram?.WebApp?.isVersionAtLeast?.("7.0") || navigator?.credentials);
    if (next && !hasBiometrics) {
      showToast(tt(lang, 'biometricsUnavailable'));
      return;
    }
    setUseBiometrics(next);
    if (next) showToast(tt(lang, 'biometricsEnabled'));
  };

  const handleOpenUrl = (url: string) => {
    try {
      // @ts-expect-error — Telegram WebApp openLink
      if (window?.Telegram?.WebApp?.openLink) {
        // @ts-expect-error
        window.Telegram.WebApp.openLink(url, { try_instant_view: false });
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  /* ── Sub-view: Change PIN ── */
  if (subView === "CHANGE_PIN") {
    return (
      <div className="flex-1 flex flex-col" style={{ backgroundColor: "var(--tg-theme-bg-color, #141416)" }}>
        <ChangePinScreen
          wallet={wallet!}
          lang={lang}
          onComplete={(newPin) => {
            onChangePin?.();
            setSubView("NONE");
            setSettingsView("MAIN");
            showToast(tt(lang, 'pinChanged'));
          }}
          onCancel={() => setSubView("NONE")}
        />
        <Toast message={toast} visible={!!toast} />
      </div>
    );
  }

  /* ── Security sub-menu ── */
  if (settingsView === "SECURITY") {
    return (
      <div className="flex-1 flex flex-col" style={{ backgroundColor: "var(--tg-theme-bg-color, #141416)" }}>
        <div className="px-4 pt-3 pb-1">
          <NavBack label={tt(lang, 'security')} onBack={() => setSettingsView("MAIN")} />
        </div>

        <div className="flex-1 px-3">
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <SettingsRow
              label={tt(lang, 'changePin')}
              chevron
              onClick={() => wallet ? setSubView("CHANGE_PIN") : showToast(tt(lang, 'createWalletFirst'))}
            />
            <RadioGroup
              options={[
                { value: 5, label: tt(lang, 'autoLock5') },
                { value: 10, label: tt(lang, 'autoLock10') },
                { value: 15, label: tt(lang, 'autoLock15') },
              ]}
              selected={autoLock}
              onChange={handleAutoLockChange}
            />
          </div>

          <SectionHeader title={tt(lang, 'biometrics')} />

          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div
              onClick={handleBiometricsToggle}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleBiometricsToggle(); } }}
              className="flex items-center justify-between w-full px-4 py-3.5 transition-all active:scale-[0.98] cursor-pointer"
              style={{ color: "var(--tg-theme-text-color, #fff)" }}
            >
              <div className="text-left">
                <span className="text-sm font-medium block">{tt(lang, 'biometricsLabel')}</span>
                <span className="text-xs mt-0.5 block" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
                  {tt(lang, 'biometricsSub')}
                </span>
              </div>
              <ToggleSwitch on={useBiometrics} onChange={handleBiometricsToggle} />
            </div>
          </div>
        </div>

        <Toast message={toast} visible={!!toast} />
      </div>
    );
  }

  /* ── MAIN settings view ── */
  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: "var(--tg-theme-bg-color, #141416)" }}>
      {/* Wallet identity chip */}
      {wallet && (
        <div className="px-4 pt-4 pb-1 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: "var(--tg-theme-button-color, #DCA842)", color: "#fff" }}
          >
            NW
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--tg-theme-text-color, #fff)" }}>
              Nikka Wallet
            </p>
            <p className="text-xs font-mono truncate" style={{ color: "var(--tg-theme-hint-color, #A0A0AA)" }}>
              {wallet.tonAddress.slice(0, 6)}...{wallet.tonAddress.slice(-4)}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {/* ── Settings section ── */}
        <SectionHeader title={tt(lang, 'settings')} />

        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <SettingsRow
            label={tt(lang, 'darkLight')}
            detail={tt(lang, theme === "dark" ? "dark" : "light")}
            chevron
            onClick={handleThemeToggle}
          />
          <SettingsRow
            label={tt(lang, 'security')}
            chevron
            onClick={() => setSettingsView("SECURITY")}
          />
          <SettingsRow
            label={tt(lang, 'language')}
            detail={lang === 'EN' ? 'English' : 'Russian'}
            onClick={() => setLang(lang === 'EN' ? 'RU' : 'EN')}
          />
        </div>

        {/* ── About section ── */}
        <SectionHeader title={tt(lang, 'about')} />

        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <SettingsRow
            label={tt(lang, 'aboutNikka')}
            chevron
            onClick={() => setShowAbout(true)}
          />
          <SettingsRow
            label={tt(lang, 'helpCenter')}
            chevron
            onClick={() => handleOpenUrl("https://t.me/nikkawallet")}
          />
          <SettingsRow
            label={tt(lang, 'ourWebsite')}
            chevron
            onClick={() => handleOpenUrl("https://nikkawallet.io")}
          />
          <SettingsRow
            label={tt(lang, 'contact')}
            detail={tt(lang, 'contactDetail')}
            chevron
            onClick={() => handleOpenUrl("https://t.me/nikkawallet_support")}
          />
        </div>
      </div>

      {/* About modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} lang={lang} />}

      <Toast message={toast} visible={!!toast} />
    </div>
  );
}