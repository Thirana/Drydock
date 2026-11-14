"use client";

import { useEffect, useState } from "react";

const KEY = "dd-desktop-hint";
const PHONE = "(max-width: 767px)";

/**
 * A one-time note for a first visit on a phone: everything reads fine, but
 * the figures are drawn wide and made to be clicked. Shown once, ever; the
 * reader can send themselves the link for later.
 */
export function DesktopHint() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<"" | "copied">("");
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(KEY) === "1";
    } catch {
      // No storage: never show it, rather than show it on every page.
    }
    if (seen || !window.matchMedia(PHONE).matches) return;
    const timer = window.setTimeout(() => {
      setWidth(Math.round(window.innerWidth));
      setOpen(true);
      try {
        localStorage.setItem(KEY, "1");
      } catch {}
    }, 1400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  const send = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setSent("copied");
    } catch {
      // Share sheet dismissed, or no clipboard: nothing to undo.
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="dd-hint-title"
      aria-describedby="dd-hint-body"
      className="dd-sheet-in bg-ground border-ink text-ink fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-50 rounded-[3px] border px-5 pt-5 pb-4"
    >
      <span
        aria-hidden="true"
        className="bg-accent absolute -top-px -left-px h-[3px] w-[38%] rounded-tl-[3px]"
      />
      <ScreenDrawing width={width} />
      <p id="dd-hint-title" className="dd-head mt-4 text-[19px]">
        Best on a bigger screen
      </p>
      <p
        id="dd-hint-body"
        className="text-ink-body mt-1.5 text-[15.5px] leading-[1.5] text-pretty"
      >
        Everything here reads fine on a phone. The figures, though, are drawn
        wide and made to be clicked, so they are at their best on a laptop or
        tablet.
      </p>
      <div className="border-rule mt-4 flex items-center gap-x-6 border-t pt-4">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="bg-ink text-ground min-h-11 cursor-pointer rounded-[2px] px-5 text-[15.5px] font-bold"
        >
          Got it
        </button>
        <button
          type="button"
          onClick={send}
          aria-live="polite"
          className="dd-link min-h-11 cursor-pointer text-[15.5px]"
        >
          {sent === "copied" ? "Link copied" : "Send me the link"}
        </button>
      </div>
    </div>
  );
}

/**
 * The notice's figure, in the course's drawing vocabulary: this phone, at its
 * real width, wired to the screen the figures are drawn for.
 */
function ScreenDrawing({ width }: { width: number }) {
  const label =
    "font-mono text-[11.5px] font-medium [font-variant-numeric:tabular-nums]";
  return (
    <svg
      viewBox="0 0 300 96"
      aria-hidden="true"
      className="block h-auto w-full max-w-[340px]"
    >
      <defs>
        <marker
          id="dd-hint-ah"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
        >
          <path d="M0 0 L8 4 L0 8 z" className="fill-accent" />
        </marker>
      </defs>

      {/* This phone */}
      <rect
        x="14"
        y="6"
        width="40"
        height="68"
        rx="6"
        className="fill-sunk stroke-ink-faint"
        strokeWidth="1.5"
      />
      <path d="M28 12 H40" className="stroke-ink-faint" strokeWidth="1.5" />
      <text
        x="34"
        y="92"
        textAnchor="middle"
        className={`fill-ink-muted ${label}`}
      >
        {width ? `${width}px` : "phone"}
      </text>

      {/* The wire, drawn in once the sheet has risen */}
      <path
        d="M62 40 H190"
        pathLength={1}
        className="dd-hop stroke-accent fill-none"
        strokeWidth="1.5"
        markerEnd="url(#dd-hint-ah)"
        style={{ animationDelay: "380ms" }}
      />
      <text
        x="126"
        y="32"
        textAnchor="middle"
        className="fill-accent text-[12px] font-semibold"
      >
        send the link
      </text>

      {/* A laptop */}
      <rect
        x="204"
        y="12"
        width="80"
        height="52"
        rx="3"
        className="fill-accent-soft stroke-accent"
        strokeWidth="1.5"
      />
      <path
        d="M194 70 H294"
        className="stroke-accent"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <text
        x="244"
        y="92"
        textAnchor="middle"
        className={`fill-ink ${label} font-bold`}
      >
        1024px +
      </text>
    </svg>
  );
}
