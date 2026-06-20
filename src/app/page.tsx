"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  type NikkaWalletState,
  generateNikkaWallet,
  restoreNikkaWallet,
  encryptMnemonic,
  decryptMnemonic,
  createAndSendTonTransfer,
  createAndSignUsdtTransfer,
  broadcastTronTransaction,
} from "@/utils/cryptoCore";
import { fetchTonBalance, fetchUsdtBalance } from "@/utils/networkCore";
import type { Screen, BalanceData } from "@/types";
import type { Lang } from "@/translations";

import { ScreenFrame } from "@/components/ui/ScreenFrame";
import { NavHeader } from "@/components/ui/NavHeader";
import { BottomTabBar } from "@/components/ui/BottomTabBar";
import { IdleLockScreen } from "@/components/ui/IdleLockScreen";
import { EnterPinScreen } from "@/components/ui/EnterPinScreen";

import { WelcomeScreen } from "@/components/onboarding/WelcomeScreen";
import { ShowSeedScreen } from "@/components/onboarding/ShowSeedScreen";
import { ImportSeedScreen } from "@/components/onboarding/ImportSeedScreen";
import { SetPinScreen } from "@/components/onboarding/SetPinScreen";

import { DashboardScreen } from "@/components/dashboard/DashboardScreen";
import { SettingsScreen } from "@/components/dashboard/SettingsScreen";

import { SendModal } from "@/components/modals/SendModal";
import { ReceiveModal } from "@/components/modals/ReceiveModal";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("WELCOME");
  const [wallet, setWallet] = useState<NikkaWalletState | null>(null);
  const [activeTab, setActiveTab] = useState<"MAIN" | "SETTINGS">("MAIN");
  const [lang, setLang] = useState<Lang>("EN");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [balances, setBalances] = useState<BalanceData>({
    ton: null,
    usdt: null,
  });
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [enterPinError, setEnterPinError] = useState("");
  const [onboardingSource, setOnboardingSource] = useState<"CREATE" | "IMPORT">("CREATE");

  /* ── Receive modal state ── */
  const [receiveAsset, setReceiveAsset] = useState<"NONE" | "TON" | "USDT">("NONE");
  const [receiveCopied, setReceiveCopied] = useState<string | null>(null);

  /* ── Send modal state ── */
  const [activeModal, setActiveModal] = useState<"NONE" | "SEND_TON" | "SEND_USDT">("NONE");
  const [sendStep, setSendStep] = useState<"NONE" | "PICK" | "FORM" | "SENDING" | "SUCCESS" | "ERROR">("NONE");
  const [sendError, setSendError] = useState("");
  const [sendTxId, setSendTxId] = useState("");
  const webAppRef = useRef<Awaited<typeof import("@twa-dev/sdk").default> | null>(null);
  const pinRef = useRef<string>("");
  const lastActivityRef = useRef<number>(Date.now());
  const idleTimeoutMsRef = useRef<number>(300_000);

  useEffect(() => {
    import("@twa-dev/sdk").then(({ default: WebApp }) => {
      webAppRef.current = WebApp;
      WebApp.ready();
      WebApp.expand();
    });
  }, []);

  /* ── Check for existing wallet on mount ── */
  useEffect(() => {
    const checkExisting = async () => {
      // Check localStorage first (instant, synchronous)
      const localEncrypted =
        localStorage.getItem("nikka_encrypted") ||
        localStorage.getItem("nikka_vault");
      if (localEncrypted) {
        setScreen("ENTER_PIN");
        return;
      }

      // Also probe Telegram CloudStorage for wallets saved there
      try {
        const { default: WebApp } = await import("@twa-dev/sdk");
        if (WebApp?.isVersionAtLeast?.("6.9") && WebApp?.CloudStorage?.getItem) {
          const tgEncrypted = await new Promise<string | null>((resolve) => {
            WebApp.CloudStorage.getItem(
              "nikka_encrypted",
              (err: string | null, val?: string) => {
                resolve(err || !val ? null : val);
              },
            );
          });
          if (tgEncrypted) {
            // Backup to localStorage so it survives Telegram session loss
            localStorage.setItem("nikka_encrypted", tgEncrypted);
            setScreen("ENTER_PIN");
          }
        }
      } catch {
        // CloudStorage unavailable — localStorage was already checked
      }
    };

    checkExisting();
  }, []);

  /* ── Idle lock timer: configurable timeout → IDLE_LOCKED ── */
  useEffect(() => {
    if (screen !== "DASHBOARD") return;

    const updateActivity = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener("touchstart", updateActivity);
    window.addEventListener("mousedown", updateActivity);
    window.addEventListener("keydown", updateActivity);

    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > idleTimeoutMsRef.current) {
        setScreen("IDLE_LOCKED");
      }
    }, 10_000);

    return () => {
      window.removeEventListener("touchstart", updateActivity);
      window.removeEventListener("mousedown", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      clearInterval(interval);
    };
  }, [screen]);

  /* ── Sync theme to document ── */
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
  }, [theme]);

  /* Fetch live balances when the dashboard mounts */
  useEffect(() => {
    if (screen !== "DASHBOARD" || !wallet) return;

    let cancelled = false;

    const run = async () => {
      setBalanceLoading(true);
      setBalanceError(null);
      try {
        const [ton, usdt] = await Promise.all([
          fetchTonBalance(wallet.tonAddress),
          fetchUsdtBalance(wallet.tronAddress),
        ]);
        if (cancelled) return;
        setBalances({ ton, usdt });
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
    setOnboardingSource("CREATE");
    setScreen("SHOW_SEED");
  };

  const handleImportClick = () => {
    setScreen("IMPORT_SEED");
  };

  const handleImport = (mnemonic: string) => {
    const w = restoreNikkaWallet(mnemonic);
    setWallet(w);
    setOnboardingSource("IMPORT");
    setScreen("SET_PIN");
  };

  const handleSeedConfirmed = () => {
    setScreen("SET_PIN");
  };

  const handlePinConfirmed = async (pin: string) => {
    if (!wallet) return;
    pinRef.current = pin;
    lastActivityRef.current = Date.now();
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
    setReceiveAsset("TON");
    setReceiveCopied(null);
  };

  const handlePickReceiveAsset = (asset: "TON" | "USDT") => {
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

  /* ── Send flow handlers ── */

  const handleOpenSend = () => {
    setSendStep("PICK");
    setSendError("");
    setSendTxId("");
  };

  const handlePickAsset = (asset: "SEND_TON" | "SEND_USDT") => {
    setActiveModal(asset);
    setSendStep("FORM");
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
      } else if (activeModal === "SEND_USDT") {
        const amountUnits = Math.round(amount * 1_000_000);
        const signed = await createAndSignUsdtTransfer(
          wallet.tronPrivateKey, wallet.tronAddress, recipient, amountUnits,
        );
        txid = await broadcastTronTransaction(signed);
      }

      setSendTxId(txid);
      setSendStep("SUCCESS");

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
        fetchUsdtBalance(wallet.tronAddress).then((v) => setBalances((p) => ({ ...p, usdt: v }))),
      ]).catch(() => {});
    }
    setActiveModal("NONE");
    setSendStep("NONE");
    setSendError("");
    setSendTxId("");
  };

  /* ── Settings callbacks ── */

  const handleAutoLockChange = (minutes: number) => {
    idleTimeoutMsRef.current = minutes * 60_000;
  };

  const handleChangePin = () => {
    // Trigger re-encryption flow: go back to SET_PIN to create a new PIN
    // The user will enter the new PIN which re-encrypts the mnemonic
    setScreen("SET_PIN");
  };

  /* ── Idle lock handlers ── */

  const handleLock = () => {
    if (screen === "DASHBOARD") {
      setReceiveAsset("NONE");
      setActiveModal("NONE");
      setSendStep("NONE");
      setScreen("IDLE_LOCKED");
    }
  };

  const handleEnterPin = async (pin: string) => {
    setEnterPinError("");
    try {
      let encrypted: string | null = null;

      const webApp = webAppRef.current;
      if (webApp?.isVersionAtLeast?.("6.9") && webApp?.CloudStorage?.getItem) {
        encrypted = await new Promise<string | null>((resolve) => {
          webApp.CloudStorage.getItem("nikka_encrypted", (err: string | null, val?: string) => {
            resolve(err || !val ? null : val);
          });
        });
      }

      if (!encrypted) {
        encrypted = localStorage.getItem("nikka_encrypted") || localStorage.getItem("nikka_vault");
      }

      if (!encrypted) {
        setScreen("WELCOME");
        return;
      }

      const mnemonic = await decryptMnemonic(encrypted, pin);
      const w = restoreNikkaWallet(mnemonic);
      setWallet(w);
      pinRef.current = pin;
      lastActivityRef.current = Date.now();
      setScreen("DASHBOARD");
    } catch {
      setEnterPinError("Invalid PIN. Try again.");
      try { webAppRef.current?.HapticFeedback?.notificationOccurred?.("error"); } catch { /* no-op */ }
    }
  };

  const handleUnlock = (enteredPin: string): boolean => {
    if (enteredPin === pinRef.current) {
      lastActivityRef.current = Date.now();
      setScreen("DASHBOARD");
      return true;
    }
    return false;
  };

  const handleGoBack = () => {
    switch (screen) {
      case "SHOW_SEED":
        setScreen("WELCOME");
        break;
      case "IMPORT_SEED":
        setScreen("WELCOME");
        break;
      case "SET_PIN":
        setScreen(onboardingSource === "CREATE" ? "SHOW_SEED" : "IMPORT_SEED");
        break;
      case "ENTER_PIN":
        setEnterPinError("");
        setScreen("WELCOME");
        break;
      case "DASHBOARD":
        if (sendStep !== "NONE") {
          setActiveModal("NONE");
          setSendStep("NONE");
          setSendError("");
          setSendTxId("");
        } else if (receiveAsset !== "NONE") {
          setReceiveAsset("NONE");
          setReceiveCopied(null);
        }
        break;
    }
  };

  switch (screen) {
    case "ENTER_PIN":
      return (
        <ScreenFrame>
          <NavHeader lang={lang} onBack={handleGoBack} />
          <EnterPinScreen
            lang={lang}
            error={enterPinError}
            onUnlock={handleEnterPin}
            onBack={() => {
              localStorage.removeItem("nikka_encrypted");
              localStorage.removeItem("nikka_vault");
              setEnterPinError("");
              setScreen("WELCOME");
            }}
          />
        </ScreenFrame>
      );

    case "WELCOME":
      return (
        <WelcomeScreen
            lang={lang}
            onNewWallet={handleNewWallet}
            onImport={handleImportClick}
          />
      );

    case "SHOW_SEED":
      return (
        <ScreenFrame>
          <NavHeader lang={lang} onBack={handleGoBack} />
          <ShowSeedScreen
            lang={lang}
            wallet={wallet!}
            onConfirm={handleSeedConfirmed}
          />
        </ScreenFrame>
      );

    case "IMPORT_SEED":
      return (
        <ScreenFrame>
          <NavHeader lang={lang} onBack={handleGoBack} />
          <ImportSeedScreen lang={lang} onImport={handleImport} />
        </ScreenFrame>
      );

    case "SET_PIN":
      return (
        <ScreenFrame>
          <NavHeader lang={lang} onBack={handleGoBack} />
          <SetPinScreen lang={lang} onConfirm={handlePinConfirmed} />
        </ScreenFrame>
      );

    case "DASHBOARD":
      const showModalBack = sendStep !== "NONE" || receiveAsset !== "NONE";
      return (
        <>
          <div className="flex flex-col h-dvh w-full overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/assets/background_dark_long.png')" }}>
            {showModalBack && <NavHeader lang={lang} onBack={handleGoBack} />}
            {activeTab === "MAIN" ? (
              <DashboardScreen
                lang={lang}
                wallet={wallet}
                balances={balances}
                balanceLoading={balanceLoading}
                balanceError={balanceError}
                copiedAddress={copiedAddress}
                onCopyAddress={handleCopyAddress}
                onOpenSend={handleOpenSend}
                onOpenReceive={handleOpenReceive}
                onLock={handleLock}
              />
            ) : (
              <SettingsScreen
                lang={lang}
                setLang={setLang}
                theme={theme}
                setTheme={setTheme}
                wallet={wallet}
                onAutoLockChange={handleAutoLockChange}
                onChangePin={handleChangePin}
                currentAutoLockMinutes={idleTimeoutMsRef.current / 60_000}
              />
            )}
            <BottomTabBar lang={lang} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <SendModal
            lang={lang}
            sendStep={sendStep}
            activeModal={activeModal}
            sendError={sendError}
            sendTxId={sendTxId}
            currentBalances={balances}
            onPickAsset={handlePickAsset}
            onSubmit={handleSendSubmit}
            onDone={handleSendDone}
            onCancel={handleGoBack}
            onRetry={() => setSendStep("FORM")}
          />

          {wallet && (
            <ReceiveModal
              lang={lang}
              receiveAsset={receiveAsset}
              receiveCopied={receiveCopied}
              wallet={wallet}
              onPickAsset={handlePickReceiveAsset}
              onCopyAddress={handleCopyReceiveAddress}
              onCancel={handleGoBack}
            />
          )}
        </>
      );

    case "IDLE_LOCKED":
      return <IdleLockScreen onUnlock={handleUnlock} />;
  }
}