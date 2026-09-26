"use client";

import { useCallback, useSyncExternalStore } from "react";

const EVENT = "dd-phase";

/** Fallback for browsers that refuse storage, so the rail still moves. */
const memory = new Map<string, number>();

function read(storageKey: string, max: number) {
  const held = memory.get(storageKey);
  if (held !== undefined) return held;
  try {
    const stored = Number(localStorage.getItem(storageKey));
    return Number.isInteger(stored) && stored > 0 && stored <= max ? stored : 0;
  } catch {
    // Storage blocked: every rail starts at phase 0.
    return 0;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * The phase a reader stopped at, shared by every rail for the same model and
 * remembered on this device, so the map and the journeys agree. Phase 0 on
 * the server and wherever storage is unavailable.
 */
export function useSharedPhase(key: string, max: number) {
  const storageKey = `dd-phase:${key}`;
  const phase = useSyncExternalStore(
    subscribe,
    () => read(storageKey, max),
    () => 0,
  );

  const setPhase = useCallback(
    (next: number) => {
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {
        // Not remembered across visits; hold it for this one.
        memory.set(storageKey, next);
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [storageKey],
  );

  return [phase, setPhase] as const;
}
