import * as React from "react";
import { cn } from "@/lib/utils";

const POLE =
  "w-full rounded-[14px] border-[1.5px] border-navy/15 bg-white px-[16px] py-[13px] text-[15px] font-sans text-ink placeholder:text-faint focus-visible:border-navy focus-visible:outline-none aria-[invalid=true]:border-red-600";

/** Etykieta + podpowiedź + komunikat błędu wokół dowolnego pola. */
export function Pole({
  etykieta,
  wymagane,
  podpowiedz,
  blad,
  children,
  className,
}: {
  etykieta: string;
  wymagane?: boolean;
  podpowiedz?: string;
  blad?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-[6px] block text-[14px] font-bold text-ink">
        {etykieta}
        {wymagane && <span className="ml-1 text-olive">*</span>}
      </span>
      {children}
      {blad ? (
        <span className="mt-[6px] block text-[13px] font-semibold text-red-700">{blad}</span>
      ) : (
        podpowiedz && <span className="mt-[6px] block text-[13px] leading-[1.45] text-muted">{podpowiedz}</span>
      )}
    </label>
  );
}

export function Tekst({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(POLE, className)} {...props} />;
}

export function Obszar({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea rows={4} className={cn(POLE, "resize-y leading-[1.55]", className)} {...props} />;
}

export function Lista({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select className={cn(POLE, "cursor-pointer appearance-none bg-white pr-10", className)} {...props}>
      {children}
    </select>
  );
}

/** Pojedyncza zgoda lub opcja. Duże pole kliknięcia, czytelne na telefonie. */
export function Zgoda({
  zaznaczone,
  zmien,
  children,
  wyrozniona,
}: {
  zaznaczone: boolean;
  zmien: (v: boolean) => void;
  children: React.ReactNode;
  wyrozniona?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-[14px] border-[1.5px] p-4 transition-colors",
        zaznaczone ? "border-navy bg-white" : "border-navy/12 bg-white/60 hover:border-navy/30",
        wyrozniona && "bg-lime-tint/40",
      )}
    >
      <input
        type="checkbox"
        checked={zaznaczone}
        onChange={(e) => zmien(e.target.checked)}
        className="mt-[2px] size-5 flex-none cursor-pointer accent-navy"
      />
      <span className="text-[14px] leading-[1.55] text-ink-2">{children}</span>
    </label>
  );
}

/** Wielokrotny wybór w formie pigułek — do udogodnień i języków. */
export function Pigulki<T extends string>({
  opcje,
  wybrane,
  zmien,
}: {
  opcje: { wartosc: T; etykieta: string }[];
  wybrane: T[];
  zmien: (v: T[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opcje.map((o) => {
        const akt = wybrane.includes(o.wartosc);
        return (
          <button
            key={o.wartosc}
            type="button"
            aria-pressed={akt}
            onClick={() => zmien(akt ? wybrane.filter((w) => w !== o.wartosc) : [...wybrane, o.wartosc])}
            className={cn(
              "cursor-pointer rounded-full border-[1.5px] px-4 py-2 text-[13px] font-bold transition-colors",
              akt ? "border-navy bg-navy text-ground" : "border-navy/18 text-navy hover:border-navy",
            )}
          >
            {o.etykieta}
          </button>
        );
      })}
    </div>
  );
}

/** Pasek kroków w kreatorze. */
export function Kroki({ ile, aktualny, nazwy }: { ile: number; aktualny: number; nazwy: string[] }) {
  return (
    <div className="mb-7">
      <div className="flex gap-[6px]">
        {Array.from({ length: ile }, (_, i) => (
          <span
            key={i}
            className={cn("h-[5px] flex-1 rounded-full transition-colors", i <= aktualny ? "bg-lime" : "bg-navy/12")}
          />
        ))}
      </div>
      <p className="mt-[10px] text-[13px] font-bold text-muted">
        Krok {aktualny + 1} z {ile} · {nazwy[aktualny]}
      </p>
    </div>
  );
}
