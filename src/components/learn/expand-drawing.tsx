"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SegmentedControl } from "@/components/ui/controls";
import { IconExpand, IconX } from "@/components/ui/icons";

/**
 * "Expand" for a course drawing. The figure it sits in is opened in place,
 * filling the screen over the page - the same element, so an interactive
 * widget keeps its state and stays usable. "Fit to screen" sizes the drawing
 * to the window (up to 1.6x); "Actual size" draws it 1:1 and pans, the
 * default on a phone. Esc or Close returns to the page where the reader was.
 *
 * Renders the Expand control (only when its figure holds a drawing) and, while
 * open, the bar with the size switch and Close.
 */

type Mode = "fit" | "actual";

const MAX_SCALE = 1.6;
const GUTTER = 24;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function ExpandDrawing() {
  const ref = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("fit");

  const figure = () => ref.current?.closest("figure") ?? null;

  useEffect(() => {
    // Whether there is a drawing is only known once the figure has rendered.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasDrawing(!!figure()?.querySelector(".dd-fig svg"));
  }, []);

  /** Size the expanded figure for the window and the chosen mode. */
  const layout = useCallback(() => {
    const fig = figure();
    const svg = fig?.querySelector<SVGSVGElement>(".dd-fig svg");
    if (!fig || !svg) return;
    const vb = svg.viewBox.baseVal;
    if (!vb?.width) return;
    // Everything the figure's frame adds around the drawing (padding,
    // border), measured before resizing so it stays as it is.
    const frame = [...fig.children].find((el) => el.contains(svg)) as
      HTMLElement | undefined;
    if (!frame) return;
    const pad = Math.max(
      0,
      frame.offsetWidth - svg.getBoundingClientRect().width,
    );
    const availW = window.innerWidth - GUTTER * 2;
    const availH =
      window.innerHeight -
      (barRef.current?.offsetHeight ?? 56) -
      (fig.querySelector("figcaption")?.offsetHeight ?? 0) -
      GUTTER * 2;
    // A figure that is only a drawing fits the window both ways; a widget,
    // with its controls and text, fits the width and scrolls.
    const onlyDrawing = ![
      ...fig.querySelectorAll("button, input, select"),
    ].some((el) => !el.closest(".dd-x-bar, .dd-x-open"));
    const fit = Math.min(
      (availW - pad) / vb.width,
      onlyDrawing ? (availH - pad) / vb.height : Infinity,
      MAX_SCALE,
    );
    const scale = mode === "fit" ? Math.max(fit, 0.2) : 1;
    fig.style.setProperty(
      "--dd-x-width",
      `${Math.min(availW, Math.round(vb.width * scale + pad))}px`,
    );
    fig.style.setProperty("--dd-x-svg", `${Math.round(vb.width * scale)}px`);
  }, [mode]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const fig = figure();
    if (!open || !fig) return;
    const { scrollX, scrollY } = window;
    // Hold the figure's place in the page so nothing below it moves.
    const holder = document.createElement("div");
    holder.style.height = `${fig.offsetHeight}px`;
    holder.setAttribute("aria-hidden", "true");
    fig.after(holder);
    fig.classList.add("dd-expanded");
    fig.setAttribute("role", "dialog");
    fig.setAttribute("aria-modal", "true");
    fig.setAttribute(
      "aria-label",
      fig.getAttribute("aria-label") ??
        fig.querySelector("svg")?.getAttribute("aria-label") ??
        "Drawing",
    );
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    barRef.current?.querySelector<HTMLButtonElement>("[data-close]")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "Tab") {
        // Keep focus inside the open figure.
        const items = [...fig.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
          (el) => el.offsetParent !== null,
        );
        const first = items[0];
        const last = items.at(-1);
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      fig.classList.remove("dd-expanded", "dd-actual");
      fig.removeAttribute("role");
      fig.removeAttribute("aria-modal");
      fig.style.removeProperty("--dd-x-width");
      fig.style.removeProperty("--dd-x-svg");
      holder.remove();
      root.style.overflow = overflow;
      window.scrollTo(scrollX, scrollY);
      // The Expand button rendered after closing, not the one from before.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      openerRef.current?.focus();
    };
  }, [open, close]);

  useEffect(() => {
    const fig = figure();
    if (!open || !fig) return;
    fig.classList.toggle("dd-actual", mode === "actual");
    layout();
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, [open, mode, layout]);

  if (!hasDrawing) return <div ref={ref} hidden />;

  return (
    <div ref={ref} className="contents">
      {open ? (
        <div
          ref={barRef}
          className="dd-x-bar border-rule bg-ground sticky top-0 z-10 -mx-6 mb-6 flex min-h-14 items-center justify-between gap-4 border-b px-6"
        >
          <SegmentedControl<Mode>
            label="Drawing size"
            value={mode}
            onChange={setMode}
            options={[
              { value: "fit", label: "Fit to screen" },
              { value: "actual", label: "Actual size" },
            ]}
          />
          <button
            type="button"
            data-close
            data-expand
            onClick={close}
            className="text-ink-muted hover:text-ink -mr-2 inline-flex min-h-11 items-center gap-2 px-2 text-[15px] transition-colors"
          >
            Close
            <IconX size={12} />
          </button>
        </div>
      ) : (
        <div className="dd-x-open -mb-2 flex justify-end">
          <button
            ref={openerRef}
            type="button"
            data-expand
            onClick={() => {
              // A phone starts at actual size: fitted, the text is too small.
              setMode(window.innerWidth < 640 ? "actual" : "fit");
              setOpen(true);
            }}
            aria-haspopup="dialog"
            className="text-ink-muted hover:text-ink -mr-1 inline-flex min-h-10 items-center gap-1.5 px-1 text-[14px] transition-colors"
          >
            <IconExpand size={13} />
            Expand
          </button>
        </div>
      )}
    </div>
  );
}
