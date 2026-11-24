"use client";

import { useEffect, useRef, useState } from "react";

/** Animates a number from 0 to `value` once it mounts (respects reduced motion). */
export function CountUp({ value, duration = 900, prefix = "", suffix = "", locale }: { value: number; duration?: number; prefix?: string; suffix?: string; locale?: string }) {
  const [shown, setShown] = useState(value);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return setShown(value);
    started.current = true;
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches || value === 0) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      setShown(Math.round(value * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    setShown(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return (
    <span className="tabular-nums">
      {prefix}
      {shown.toLocaleString(locale)}
      {suffix}
    </span>
  );
}
