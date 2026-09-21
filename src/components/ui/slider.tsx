import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

function Slider({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      className={cn("relative flex w-full touch-none select-none items-center py-2", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-navy/12">
        <SliderPrimitive.Range className="absolute h-full bg-navy" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block size-5 rounded-full border-2 border-navy bg-ground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 cursor-grab" />
    </SliderPrimitive.Root>
  );
}

export { Slider };
