import { useEffect, useRef, useState } from "react";

/**
 * Licznik 0 → value, 1600 ms, easing 1-(1-t)^3.
 * Startuje raz, gdy element wejdzie w viewport (IntersectionObserver).
 */
export function useCountUp(value: number, duration = 1600) {
  const ref = useRef<HTMLElement | null>(null);
  const [t, setT] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const run = () => {
      if (started.current) return;
      started.current = true;
      if (reduce) {
        setT(1);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        setT(1 - Math.pow(1 - p, 3));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [duration]);

  return { ref, current: Math.round(value * t) };
}
