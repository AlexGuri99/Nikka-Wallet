export type Lang = "EN" | "RU";

export const T: Record<Lang, Record<string, string>> = {
  EN: {
    // Global
    back: "Back",
    cancel: "Cancel",
    done: "Done",
    copied: "Copied!",
    copy: "Copy",
    close: "Close",

    // Bottom tab bar
    tabMain: "Main",
    tabSettings: "Settings",

    // Welcome
    welcomeTitle: "Nikka Wallet",
    welcomeSubtitle: "Your self-custodial crypto wallet",
    welcomeCreate: "Create New Wallet",
    welcomeImport: "Import Mnemonic",

    // Show Seed
    seedTitle: "Your Recovery Phrase",
    seedSubtitle: "Write these 24 words down in order. Never share them with anyone.",
    seedNotice: "Nikka Wallet is a non-custodial wallet. We do not store or have access to your recovery phrase. If you lose it, your funds cannot be recovered.",
    seedNoticeBold: "Write it down and keep it safe.",
    seedCopy: "Copy to Clipboard",
    seedConfirm: "I Have Written It Down",

    // Import Seed
    importTitle: "Import Wallet",
    importSubtitle: "Paste or type your 24-word recovery phrase",
    importPlaceholder: "arena aim clap fog noodle ski pole local curious goose fat attack …",
    importValid: "Valid phrase",
    importInvalid: "Invalid recovery phrase — check each word is spelled correctly",
    importButton: "Import",

    // Set PIN
    pinTitle: "Set Your PIN",
    pinSubtitle: "Choose a 4-digit code to secure your wallet",
    pinLabel: "Enter PIN",
    pinConfirmLabel: "Confirm PIN",
    pinMismatch: "PINs do not match",
    pinButton: "Confirm PIN",

    // Enter PIN (lock screen)
    enterPinTitle: "Enter PIN",
    enterPinSubtitle: "Unlock your wallet",
    enterPinReset: "Start over (delete wallet)",
    enterPinError: "Invalid PIN. Try again.",

    // Dashboard
    portfolio: "Portfolio",
    todayChange: "+2.4% today",
    send: "Send",
    receive: "Receive",
    activity: "Activity",
    collectibles: "Collectibles",
    noCollectibles: "No collectibles yet",
    balanceError: "Could not fetch balances",
    copiedShort: "Copied",

    // Send Modal
    sendTitle: "Send",
    sendSubtitle: "Select an asset",
    nativeToken: "Native token",
    usdtToken: "TRC-20 stablecoin",
    sendFormTitle: "Send {asset}",
    recipientLabel: "Recipient Address",
    placeholderTon: "EQD…",
    placeholderTron: "TXYZ…",
    invalidTonAddr: "Invalid TON address",
    invalidTronAddr: "Invalid TRON address",
    amountLabel: "Amount",
    max: "MAX",
    balancePrefix: "Balance:",
    exceedsBalance: "Exceeds balance",
    minAmount: "Min 0.01",
    pinLabelSend: "Enter 4-Digit PIN",
    clear: "Clear",
    sendButton: "Send {asset}",
    preparing: "Preparing…",
    sendingTitle: "Signing & broadcasting…",
    sendingDesc: "Please wait while the transaction is processed",
    successTitle: "Sent!",
    failedTitle: "Failed",
    tryAgain: "Try Again",
    txFailed: "Transaction failed",

    // Receive Modal
    receiveTitle: "Receive {asset}",
    tonNetwork: "TON Network",
    trc20Network: "TRON Network (TRC-20)",
    warningTon: "Send only TON on TON network. Other networks will result in permanent loss.",
    warningUsdt: "Send only USDT on TRON (TRC-20). Other networks will result in permanent loss.",
    copyAddress: "Copy Address",

    // Settings
    settings: "Settings",
    about: "About",
    darkLight: "Dark / Light Mode",
    dark: "Dark",
    light: "Light",
    security: "Security",
    language: "Language",
    aboutNikka: "About Nikka",
    helpCenter: "Help Center",
    ourWebsite: "Our Website",
    contact: "Contact",
    contactDetail: "@nikkawallet",
    walletName: "Nikka Wallet",
    walletVersion: "v0.1.0 — Self-custodial multi-chain wallet",
    aboutDesc: "Nikka Wallet is a Telegram-native wallet supporting TON and USDT (TRC-20). Named after the Nikka Whisky Distillery — crafted with precision, aged with patience. Your keys, your coins. Built for the TON ecosystem.",
    changePin: "Change PIN",
    changePinDesc: "Set a new 4-digit PIN to secure your wallet.",
    currentPin: "Current PIN",
    newPin: "New PIN",
    confirmNewPin: "Confirm New PIN",
    changePinButton: "Change PIN",
    autoLock: "Auto-Lock",
    autoLock5: "5 minutes",
    autoLock10: "10 minutes",
    autoLock15: "15 minutes",
    biometrics: "Biometrics",
    biometricsLabel: "Use Biometrics / FaceID",
    biometricsSub: "Replace PIN with biometric auth",
    biometricsUnavailable: "Biometrics not available on this device",
    biometricsEnabled: "Biometrics enabled",
    pinChanged: "PIN changed successfully",
    autoLockToast: "Auto-lock set to {min} min",
    themeToast: "Switched to {mode} mode",
    createWalletFirst: "Create a wallet first",
  },

  RU: {
    // Global
    back: "Назад",
    cancel: "Отмена",
    done: "Готово",
    copied: "Скопировано!",
    copy: "Копировать",
    close: "Закрыть",

    // Bottom tab bar
    tabMain: "Главная",
    tabSettings: "Настройки",

    // Welcome
    welcomeTitle: "Nikka Wallet",
    welcomeSubtitle: "Ваш некастодиальный криптокошелёк",
    welcomeCreate: "Создать новый кошелёк",
    welcomeImport: "Импортировать фразу",

    // Show Seed
    seedTitle: "Ваша секретная фраза",
    seedSubtitle: "Запишите эти 24 слова по порядку. Никому их не сообщайте.",
    seedNotice: "Nikka Wallet — некастодиальный кошелёк. Мы не храним и не имеем доступа к вашей секретной фразе. Если вы её потеряете, средства будет невозможно восстановить.",
    seedNoticeBold: "Запишите её и храните в безопасности.",
    seedCopy: "Копировать в буфер",
    seedConfirm: "Я записал(а)",

    // Import Seed
    importTitle: "Импорт кошелька",
    importSubtitle: "Вставьте или введите вашу фразу из 24 слов",
    importPlaceholder: "арена цель туман лапша лыжи шест локальный любопытный гусь жир атака …",
    importValid: "Действительная фраза",
    importInvalid: "Недействительная фраза — проверьте каждое слово",
    importButton: "Импортировать",

    // Set PIN
    pinTitle: "Установите PIN-код",
    pinSubtitle: "Выберите 4-значный код для защиты кошелька",
    pinLabel: "Введите PIN",
    pinConfirmLabel: "Подтвердите PIN",
    pinMismatch: "PIN-коды не совпадают",
    pinButton: "Подтвердить PIN",

    // Enter PIN (lock screen)
    enterPinTitle: "Введите PIN",
    enterPinSubtitle: "Разблокируйте кошелёк",
    enterPinReset: "Начать заново (удалить кошелёк)",
    enterPinError: "Неверный PIN. Попробуйте снова.",

    // Dashboard
    portfolio: "Портфель",
    todayChange: "+2,4% сегодня",
    send: "Отправить",
    receive: "Получить",
    activity: "Активность",
    collectibles: "Коллекции",
    noCollectibles: "Коллекций пока нет",
    balanceError: "Не удалось загрузить балансы",
    copiedShort: "Скопировано",

    // Send Modal
    sendTitle: "Отправить",
    sendSubtitle: "Выберите актив",
    nativeToken: "Нативный токен",
    usdtToken: "TRC-20 стейблкоин",
    sendFormTitle: "Отправить {asset}",
    recipientLabel: "Адрес получателя",
    placeholderTon: "EQD…",
    placeholderTron: "TXYZ…",
    invalidTonAddr: "Неверный TON адрес",
    invalidTronAddr: "Неверный TRON адрес",
    amountLabel: "Сумма",
    max: "МАКС",
    balancePrefix: "Баланс:",
    exceedsBalance: "Превышает баланс",
    minAmount: "Мин. 0.01",
    pinLabelSend: "Введите 4-значный PIN",
    clear: "Очистить",
    sendButton: "Отправить {asset}",
    preparing: "Подготовка…",
    sendingTitle: "Подписание и отправка…",
    sendingDesc: "Пожалуйста, подождите, транзакция обрабатывается",
    successTitle: "Отправлено!",
    failedTitle: "Ошибка",
    tryAgain: "Повторить",
    txFailed: "Транзакция не удалась",

    // Receive Modal
    receiveTitle: "Получить {asset}",
    tonNetwork: "Сеть TON",
    trc20Network: "Сеть TRON (TRC-20)",
    warningTon: "Отправляйте только TON в сети TON. Другие сети приведут к безвозвратной потере.",
    warningUsdt: "Отправляйте только USDT в сети TRON (TRC-20). Другие сети приведут к безвозвратной потере.",
    copyAddress: "Копировать адрес",

    // Settings
    settings: "Настройки",
    about: "О приложении",
    darkLight: "Тёмный / Светлый режим",
    dark: "Тёмный",
    light: "Светлый",
    security: "Безопасность",
    language: "Язык",
    aboutNikka: "О Nikka",
    helpCenter: "Центр помощи",
    ourWebsite: "Наш сайт",
    contact: "Контакты",
    contactDetail: "@nikkawallet",
    walletName: "Nikka Wallet",
    walletVersion: "v0.1.0 — Самостоятельный мультичейн кошелёк",
    aboutDesc: "Nikka Wallet — это Telegram-кошелёк с поддержкой TON и USDT (TRC-20). Назван в честь винокурни Nikka Whisky — создан с точностью, выдержан с терпением. Ваши ключи, ваши монеты. Создан для экосистемы TON.",
    changePin: "Изменить PIN",
    changePinDesc: "Установите новый 4-значный PIN для защиты кошелька.",
    currentPin: "Текущий PIN",
    newPin: "Новый PIN",
    confirmNewPin: "Подтвердите новый PIN",
    changePinButton: "Изменить PIN",
    autoLock: "Автоблокировка",
    autoLock5: "5 минут",
    autoLock10: "10 минут",
    autoLock15: "15 минут",
    biometrics: "Биометрия",
    biometricsLabel: "Использовать FaceID / биометрию",
    biometricsSub: "Заменить PIN на биометрическую аутентификацию",
    biometricsUnavailable: "Биометрия недоступна на этом устройстве",
    biometricsEnabled: "Биометрия включена",
    pinChanged: "PIN успешно изменён",
    autoLockToast: "Автоблокировка: {min} мин",
    themeToast: "Режим: {mode}",
    createWalletFirst: "Сначала создайте кошелёк",
  },
};

export function tt(lang: Lang, key: string, vars?: Record<string, string>): string {
  let val = T[lang][key] ?? T.EN[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      val = val.replace(`{${k}}`, v);
    }
  }
  return val;
}