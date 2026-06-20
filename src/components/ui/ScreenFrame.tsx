export function ScreenFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col h-dvh w-full overflow-hidden bg-cover bg-center bg-no-repeat px-4 pt-3 pb-6"
      style={{
        backgroundImage: "url('/assets/background_dark_long.png')",
        color: "var(--tg-theme-text-color, #fff)",
      }}
    >
      {children}
    </div>
  );
}