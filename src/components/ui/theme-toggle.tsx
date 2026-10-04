"use client";

import { useSyncExternalStore } from "react";
import { IconDark, IconLamp } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const EVENT = "dd-theme";

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

const current = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

/** Flips the bench lamp. The choice is remembered on this device only. */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore<Theme | null>(
    subscribe,
    current,
    () => null,
  );
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => {
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem("dd-theme", next);
        } catch {
          // Storage can be blocked; the switch still applies for this visit.
        }
        window.dispatchEvent(new Event(EVENT));
      }}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={cn(
        "relative inline-flex size-11 items-center justify-center transition-colors duration-150",
        className,
      )}
    >
      {theme === "dark" ? <IconLamp size={18} /> : <IconDark size={18} />}
    </button>
  );
}
