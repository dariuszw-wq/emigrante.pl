import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Warianty odwzorowują przyciski z handoffu: navy / limonka / outline (pill).
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40",
  {
    variants: {
      variant: {
        navy: "bg-navy text-ground hover:bg-navy-hover",
        lime: "bg-lime text-navy hover:bg-lime-hover",
        outline: "border-[1.5px] border-navy/18 text-navy hover:border-navy",
        chip: "border-[1.5px] border-navy/18 text-navy bg-transparent",
        chipActive: "border-[1.5px] border-navy bg-navy text-ground",
      },
      size: {
        sm: "px-4 py-2.5 text-[13px]",
        md: "px-5 py-3 text-[14px]",
        lg: "px-[26px] py-4 text-[15px]",
      },
    },
    defaultVariants: { variant: "navy", size: "md" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
