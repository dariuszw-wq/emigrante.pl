import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "w-full rounded-[14px] border-[1.5px] border-navy/15 bg-ground px-[18px] py-4 text-[15px] font-sans text-ink placeholder:text-muted focus-visible:outline-none focus-visible:border-navy aria-invalid:border-red-600",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
