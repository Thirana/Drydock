"use client";

import { useEffect, useState } from "react";
import { SeverityBadge } from "@/components/architecture/severity-badge";
import { IconCheck } from "@/components/ui/icons";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { FeaturedDefect } from "@/lib/content/featured";

/** One register card at a time, its symptom typed out, cycling by severity. */
export function SpotlightCard({
  items,
  label,
}: {
  items: FeaturedDefect[];
  label: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const [fading, setFading] = useState(false);

  // typing → reading (3.5s) → fading (600ms) → next defect
  useEffect(() => {
    if (reduced || !items.length) return;
    const text = items[index].symptom;
    let chars = 0;
    let hold: ReturnType<typeof setTimeout> | undefined;
    let fade: ReturnType<typeof setTimeout> | undefined;
    const typer = setInterval(() => {
      chars += 1;
      setTyped(chars);
      if (chars < text.length) return;
      clearInterval(typer);
      hold = setTimeout(() => {
        setFading(true);
        fade = setTimeout(() => {
          setTyped(0);
          setFading(false);
          setIndex((i) => (i + 1) % items.length);
        }, 600);
      }, 3500);
    }, 24);
    return () => {
      clearInterval(typer);
      clearTimeout(hold);
      clearTimeout(fade);
    };
  }, [index, items, reduced]);

  const item = items[index];
  if (!item) return null;
  const body = reduced ? item.symptom : item.symptom.slice(0, typed);

  return (
    <div className="border-gl-border bg-gl-surface shadow-gl-lg flex h-full min-h-[280px] flex-col rounded-2xl border p-7">
      <div
        className="flex flex-1 flex-col transition-opacity duration-[600ms]"
        style={{ opacity: fading ? 0 : 1 }}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-gl-text-faint font-mono text-[11px] font-semibold tracking-[0.06em] uppercase">
            {item.id} · Phase {item.phase}
          </span>
          <SeverityBadge severity={item.severity} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="border-gl-border bg-gl-surface-2 text-gl-text inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium">
            <span className="bg-gl-primary size-[7px] rounded-full" />
            {item.phaseName}
          </span>
        </div>
        <h3 className="text-gl-text mt-4 min-h-[58px] text-[22px] leading-[1.32] font-bold tracking-[-0.018em] text-balance">
          {item.title}
        </h3>
        <p className="text-gl-text-muted mt-2 min-h-[72px] text-[14.5px] leading-[1.65] italic">
          {body}
          {!reduced && (
            <span className="bg-gl-primary animate-cursor-blink ml-0.5 inline-block h-[13px] w-px translate-y-[2px]" />
          )}
        </p>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <div className="border-gl-border bg-gl-surface-2 rounded-xl border p-3">
            <p className="text-gl-danger font-mono text-[9.5px] font-bold tracking-[0.12em] uppercase">
              Now
            </p>
            <p className="text-gl-text mt-1 line-clamp-3 text-[12px] leading-[1.5]">
              {item.before}
            </p>
          </div>
          <div className="border-gl-border bg-gl-surface-2 rounded-xl border p-3">
            <p className="text-gl-success font-mono text-[9.5px] font-bold tracking-[0.12em] uppercase">
              Fixed
            </p>
            <p className="text-gl-text mt-1 line-clamp-3 text-[12px] leading-[1.5]">
              {item.after}
            </p>
          </div>
        </div>
      </div>
      <div className="border-gl-border mt-5 flex items-center justify-between border-t pt-3">
        <span className="text-gl-primary inline-flex items-center gap-1.5 text-[12px] font-semibold">
          <IconCheck size={12} /> Closes in phase {item.phase}
        </span>
        <span className="text-gl-text-faint font-mono text-[11px]">
          {label}
        </span>
      </div>
    </div>
  );
}
