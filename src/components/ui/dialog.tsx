import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Okno modalne bez dodatkowych zależności.
 * Zamyka się klawiszem Escape i kliknięciem w tło, blokuje przewijanie strony
 * i przenosi uwagę czytnika ekranu na zawartość (role="dialog" + aria-modal).
 */
export function Dialog({
  otwarte,
  zamknij,
  tytul,
  opis,
  children,
  szerokosc = "md",
}: {
  otwarte: boolean;
  zamknij: () => void;
  tytul: string;
  opis?: string;
  children: ReactNode;
  szerokosc?: "sm" | "md" | "lg";
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!otwarte) return;
    const naKlawisz = (e: KeyboardEvent) => {
      if (e.key === "Escape") zamknij();
    };
    document.addEventListener("keydown", naKlawisz);
    const poprzedni = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", naKlawisz);
      document.body.style.overflow = poprzedni;
    };
  }, [otwarte, zamknij]);

  if (!otwarte) return null;

  const szer = { sm: "max-w-[480px]", md: "max-w-[680px]", lg: "max-w-[920px]" }[szerokosc];

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-navy/55 px-4 py-8 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) zamknij();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={tytul}
        tabIndex={-1}
        className={cn(
          "relative w-full rounded-[24px] bg-ground p-7 shadow-float outline-none sm:p-9",
          szer,
        )}
      >
        <button
          type="button"
          onClick={zamknij}
          aria-label="Zamknij"
          className="absolute right-5 top-5 grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-navy/8 hover:text-navy"
        >
          <X size={18} />
        </button>

        <h2 className="max-w-[90%] font-display text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em]">
          {tytul}
        </h2>
        {opis && <p className="mt-3 text-[15px] leading-[1.6] text-ink-2">{opis}</p>}

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
