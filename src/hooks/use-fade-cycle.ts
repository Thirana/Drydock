import { useEffect, useRef, useState } from "react";

/** Rotates through items, swapping the value only while it is faded out. */
export function useFadeCycle<T>(
  items: readonly T[],
  displayMs: number,
  fadeMs: number,
  enabled = true,
) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || items.length < 2) return;
    const interval = setInterval(() => {
      setVisible(false);
      fadeTimer.current = setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setVisible(true);
      }, fadeMs);
    }, displayMs);
    return () => {
      clearInterval(interval);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, [items.length, displayMs, fadeMs, enabled]);

  return { current: items[index], visible };
}
