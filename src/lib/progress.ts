"use client";

import { useSyncExternalStore } from "react";

/**
 * What this reader has opened, per course: the last chapter and every chapter
 * seen. Kept in this browser only, as a convenience - the site works the same
 * without it, so every read and write tolerates blocked storage.
 */
export type Progress = Record<string, { last?: string; opened: string[] }>;

const KEY = "dd-progress";
const EVENT = "dd-progress";

function readRaw(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): Progress {
  if (!raw) return {};
  try {
    const value: unknown = JSON.parse(raw);
    return value && typeof value === "object" ? (value as Progress) : {};
  } catch {
    return {};
  }
}

// useSyncExternalStore needs the same object back while nothing changed.
let cached: { raw: string | null; value: Progress } | undefined;

function snapshot(): Progress {
  const raw = readRaw();
  if (!cached || cached.raw !== raw) cached = { raw, value: parse(raw) };
  return cached.value;
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The reader's progress, or null while rendering on the server. */
export function useProgress(): Progress | null {
  return useSyncExternalStore<Progress | null>(subscribe, snapshot, () => null);
}

/** Note that a chapter was opened. */
export function recordVisit(course: string, chapter: string) {
  const progress = { ...snapshot() };
  const seen = progress[course]?.opened;
  const opened = Array.isArray(seen) ? seen : [];
  progress[course] = {
    last: chapter,
    opened: opened.includes(chapter) ? opened : [...opened, chapter],
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    return;
  }
  window.dispatchEvent(new Event(EVENT));
}
