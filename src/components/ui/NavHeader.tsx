import { tt } from "@/translations";
import type { Lang } from "@/translations";

export function NavHeader({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  return (
    <div
      className="sticky top-0 z-30 flex items-center px-1 py-2 shrink-0"
      style={{ backgroundColor: "var(--tg-theme-bg-color, #141416)" }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-medium transition-all active:scale-90"
        style={{ color: "var(--tg-theme-button-color, #DCA842)" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
        </svg>
        {tt(lang, "back")}
      </button>
    </div>
  );
}