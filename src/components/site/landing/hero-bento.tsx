"use client";

import { useEffect, useState } from "react";
import { SeverityBadge } from "@/components/architecture/severity-badge";
import { IconCheck } from "@/components/ui/icons";
import { useFadeCycle } from "@/hooks/use-fade-cycle";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { SEVERITIES } from "@/lib/architecture/state";
import type { Severity } from "@/lib/architecture/types";
import type { FeaturedDefect, FeaturedTrack } from "@/lib/content/featured";
import { cn } from "@/lib/utils";

const WIDGET =
  "border-gl-border bg-gl-surface shadow-gl hover:shadow-gl-lg rounded-xl border p-5 transition-all duration-[150ms] hover:-translate-y-0.5";
const EYEBROW =
  "text-gl-text-faint text-[10px] font-bold tracking-[0.12em] uppercase";

const SEVERITY_STYLE: Record<Severity, { text: string; bar: string }> = {
  critical: { text: "text-gl-danger", bar: "bg-gl-danger" },
  high: { text: "text-gl-danger/80", bar: "bg-gl-danger/55" },
  medium: { text: "text-gl-warning", bar: "bg-gl-warning" },
  low: { text: "text-gl-text-muted", bar: "bg-gl-text-faint" },
};

/** Static product previews built from the featured track's real data. */
export function HeroBento({ featured }: { featured: FeaturedTrack }) {
  return (
    <div
      aria-hidden="true"
      className="mx-auto grid max-w-[960px] grid-cols-1 gap-3.5 text-left sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]"
    >
      <div className="sm:col-span-2 lg:col-span-1 lg:row-span-3">
        <SpotlightCard
          items={featured.spotlight}
          label={`${featured.lab} · ${featured.track}`}
        />
      </div>
      <div className={WIDGET}>
        <p className={EYEBROW}>Defects to close</p>
        <p className="text-gl-text mt-3 font-mono text-[52px] leading-none font-bold tracking-[-0.03em]">
          {featured.totals.defects}
        </p>
        <p className="text-gl-text-muted mt-2 text-[12px] leading-snug">
          across {featured.totals.phases} phases, {featured.totals.journeys}{" "}
          traced journeys
        </p>
      </div>
      <PhaseArc phases={featured.phases} total={featured.totals.defects} />
      <SeverityWidget
        className="sm:col-span-2 lg:col-span-2"
        counts={featured.severityCounts}
        total={featured.totals.defects}
      />
      <PhaseBars
        className="sm:col-span-2 lg:col-span-2"
        phases={featured.phases}
      />
    </div>
  );
}

function SpotlightCard({
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
    <div className="border-gl-border bg-gl-surface shadow-gl-lg flex h-full min-h-[280px] flex-col rounded-2xl border p-7 transition-all duration-[150ms] hover:-translate-y-0.5">
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

const ARC = 169.65; // 2π·36 · 270/360

function PhaseArc({
  phases,
  total,
}: {
  phases: FeaturedTrack["phases"];
  total: number;
}) {
  const reduced = usePrefersReducedMotion();
  const { current, visible } = useFadeCycle(phases, 5500, 500, !reduced);
  const fraction = total ? current.closedSoFar / total : 0;

  return (
    <div className={WIDGET}>
      <p className={EYEBROW}>Remediation</p>
      <div className="relative mx-auto mt-2 size-[108px]">
        <svg width="108" height="108" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="var(--gl-bg-subtle)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${ARC} 226.19`}
            transform="rotate(135 50 50)"
          />
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="var(--gl-primary)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${ARC} 226.19`}
            strokeDashoffset={ARC * (1 - fraction)}
            transform="rotate(135 50 50)"
            style={{
              transition:
                "stroke-dashoffset 1.8s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-gl-text font-mono text-[24px] leading-none font-bold transition-opacity duration-500"
            style={{ opacity: visible ? 1 : 0 }}
          >
            {current.closedSoFar}
          </span>
          <span className="text-gl-text-faint mt-1 font-mono text-[10px]">
            / {total}
          </span>
        </div>
      </div>
      <p
        className="text-gl-text-muted mt-1 truncate text-center text-[12px] transition-opacity duration-500"
        style={{ opacity: visible ? 1 : 0 }}
      >
        Phase {current.number} · {current.name}
      </p>
    </div>
  );
}

function SeverityWidget({
  counts,
  total,
  className,
}: {
  counts: Record<Severity, number>;
  total: number;
  className?: string;
}) {
  return (
    <div className={cn(WIDGET, className)}>
      <p className={EYEBROW}>By severity</p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {SEVERITIES.map((s) => (
          <div key={s}>
            <p
              className={cn(
                "font-mono text-[24px] leading-none font-bold",
                SEVERITY_STYLE[s].text,
              )}
            >
              {counts[s]}
            </p>
            <p className="text-gl-text-muted mt-1 text-[11px] capitalize">
              {s}
            </p>
          </div>
        ))}
      </div>
      <div className="bg-gl-bg-subtle mt-4 flex h-2.5 gap-px overflow-hidden rounded-full">
        {SEVERITIES.map((s) => (
          <div
            key={s}
            className={cn("animate-expand-x h-full", SEVERITY_STYLE[s].bar)}
            style={{ width: `${total ? (counts[s] / total) * 100 : 0}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function PhaseBars({
  phases,
  className,
}: {
  phases: FeaturedTrack["phases"];
  className?: string;
}) {
  const steps = phases.filter((p) => p.number > 0);
  const max = Math.max(1, ...steps.map((p) => p.closes));

  return (
    <div className={cn(WIDGET, className)}>
      <div className="flex items-baseline justify-between">
        <p className={EYEBROW}>Closed per phase</p>
        <p className="text-gl-text-faint font-mono text-[10px]">
          {steps.length} phases
        </p>
      </div>
      <ul className="mt-3 flex flex-col gap-2.5">
        {steps.map((p) => (
          <li
            key={p.number}
            className="grid grid-cols-[14px_minmax(0,150px)_1fr_18px] items-center gap-3"
          >
            <span className="text-gl-text-faint text-right font-mono text-[11px]">
              {p.number}
            </span>
            <span className="text-gl-text truncate text-[12.5px] font-semibold">
              {p.name}
            </span>
            <span className="bg-gl-bg-subtle h-2 overflow-hidden rounded-full">
              <span
                className="bg-gl-primary animate-expand-x block h-full rounded-full"
                style={{ width: `${(p.closes / max) * 100}%` }}
              />
            </span>
            <span className="text-gl-text text-right font-mono text-[12px] font-semibold">
              {p.closes}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
