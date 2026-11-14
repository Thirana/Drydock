"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Harbour as found, or with its defects closed. */
export type HarbourState = "found" | "fixed";

const KEY = "dd-harbour-state";
const EVENT = "dd-harbour-state";

/** Fallback for browsers that refuse storage, so the switch still works. */
let memory: HarbourState | null = null;

function read(): HarbourState {
  // A link with ?state=fixed opens on the fixed design.
  const param = new URLSearchParams(window.location.search).get("state");
  if (param === "fixed" || param === "found") return param;
  if (memory) return memory;
  try {
    return localStorage.getItem(KEY) === "fixed" ? "fixed" : "found";
  } catch {
    return "found";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("popstate", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * The case study's one switch, shared by every journey and defect page: the
 * choice is remembered from page to page and written into the URL, so a link
 * opens on what the reader was looking at.
 */
export function useHarbourState(): [
  HarbourState,
  (next: HarbourState) => void,
] {
  const state = useSyncExternalStore(subscribe, read, () => "found" as const);
  const set = useCallback((next: HarbourState) => {
    memory = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Storage blocked: the URL and memory still carry it.
    }
    const url = new URL(window.location.href);
    if (next === "fixed") url.searchParams.set("state", "fixed");
    else url.searchParams.delete("state");
    window.history.replaceState(window.history.state, "", url);
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [state, set];
}
