import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  src?: string;
  alt?: string;
  label?: string;
  className?: string;
}

/**
 * Slot na zdjęcie. Gdy `src` nie jest podane albo plik nie istnieje,
 * renderuje placeholder `#DFE3EA` z delikatnym opisem — do podmiany na docelowe fotografie.
 */
export function ImageSlot({ src, alt = "", label, className }: Props) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn("size-full object-cover", className)}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={label ?? alt}
      className={cn(
        "size-full bg-photo grid place-items-center text-[12px] font-semibold text-faint text-center px-4",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(11,31,58,0.04) 25%, transparent 25%, transparent 50%, rgba(11,31,58,0.04) 50%, rgba(11,31,58,0.04) 75%, transparent 75%)",
        backgroundSize: "24px 24px",
      }}
    >
      {label}
    </div>
  );
}
