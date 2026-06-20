export function ScreenFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col h-dvh px-4 pt-3 pb-6"
      style={{
        backgroundColor: "#141416",
        color: "var(--tg-theme-text-color, #fff)",
      }}
    >
      {children}
    </div>
  );
}