export function BottomTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: "MAIN" | "SETTINGS";
  onTabChange: (tab: "MAIN" | "SETTINGS") => void;
}) {
  return (
    <nav
      className="flex items-center justify-around px-8 py-2.5"
      style={{
        backgroundColor: "var(--tg-theme-bg-color, #141416)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {[
        {
          key: "MAIN" as const,
          label: "Main",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M11.584 2.376a.75.75 0 0 1 .832 0l9 6a.75.75 0 1 1-.832 1.248L12 4.013 3.416 9.624a.75.75 0 0 1-.832-1.248l9-6Z" />
              <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1 0-1.5h.75v-9.918a.75.75 0 0 1 .634-.74 49.29 49.29 0 0 1 5.866-.284 49.3 49.3 0 0 1 5.746.284.75.75 0 0 1 .634.74Z" clipRule="evenodd" />
            </svg>
          ),
        },
        {
          key: "SETTINGS" as const,
          label: "Settings",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              <path fillRule="evenodd" d="M14.694 2.765a2.25 2.25 0 0 0-3.388 0l-.744.844a2.25 2.25 0 0 1-2.12.718l-1.099-.22a2.25 2.25 0 0 0-2.687 1.582l-.289 1.078a2.25 2.25 0 0 1-1.04 1.38l-.97.592a2.25 2.25 0 0 0-.472 3.347l.662.72a2.25 2.25 0 0 1 0 3.06l-.662.72a2.25 2.25 0 0 0 .472 3.347l.97.592a2.25 2.25 0 0 1 1.04 1.38l.289 1.078a2.25 2.25 0 0 0 2.687 1.582l1.099-.22a2.25 2.25 0 0 1 2.12.718l.744.844a2.25 2.25 0 0 0 3.388 0l.744-.844a2.25 2.25 0 0 1 2.12-.718l1.099.22a2.25 2.25 0 0 0 2.687-1.582l.289-1.078a2.25 2.25 0 0 1 1.04-1.38l.97-.592a2.25 2.25 0 0 0 .472-3.347l-.662-.72a2.25 2.25 0 0 1 0-3.06l.662-.72a2.25 2.25 0 0 0-.472-3.347l-.97-.592a2.25 2.25 0 0 1-1.04-1.38l-.289-1.078a2.25 2.25 0 0 0-2.687-1.582l-1.099.22a2.25 2.25 0 0 1-2.12-.718l-.744-.844ZM12 9.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" clipRule="evenodd" />
            </svg>
          ),
        },
      ].map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className="flex flex-col items-center gap-0.5 transition-all active:scale-90"
        >
          <span
            style={{
              color:
                activeTab === tab.key
                  ? "var(--tg-theme-button-color, #DCA842)"
                  : "var(--tg-theme-hint-color, #A0A0AA)",
            }}
          >
            {tab.icon}
          </span>
          <span
            className="text-[10px] font-semibold"
            style={{
              color:
                activeTab === tab.key
                  ? "var(--tg-theme-button-color, #DCA842)"
                  : "var(--tg-theme-hint-color, #A0A0AA)",
            }}
          >
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
}