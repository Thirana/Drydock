"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { ScrollX } from "@/components/learn/scroll-x";
import { cn } from "@/lib/utils";
import { withTransition } from "@/lib/view-transition";
import { HarbourDrawing } from "./harbour-drawing";

interface Phase {
  number: number;
  name: string;
}

interface Trim {
  id: string;
  phase: number;
}

/**
 * Harbour stepped through its phases: a numbered stop per phase, and the
 * front door drawn beneath with each defect struck once its phase closes it.
 */
export function HarbourPhases({
  phases,
  trims,
  className,
}: {
  phases: Phase[];
  trims: Trim[];
  className?: string;
}) {
  const [at, setAt] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const phase = phases[at];
  const closed = new Set(
    trims
      .filter((t) => t.phase > 0 && t.phase <= phase.number)
      .map((t) => t.id),
  );
  const closing = trims.filter((t) => t.phase === phase.number && t.phase > 0);
  const open = trims.length - closed.size;

  const go = (next: number) => {
    if (next === at || next < 0 || next >= phases.length) return;
    withTransition(() => setAt(next), { kind: "step", scope: root.current });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = Math.min(phases.length - 1, Math.max(0, at + step));
    go(next);
    requestAnimationFrame(() =>
      document.getElementById(`harbour-phase-${next}`)?.focus(),
    );
  };

  const note =
    phase.number === 0
      ? `As found: all ${trims.length} defects open. The red path skips Cloudflare, the load balancer and Cloud Armor.`
      : `${closing.map((t) => t.id).join(", ")} ${closing.length === 1 ? "closes" : "close"} here. ${open ? `${open} still open.` : "Nothing left open."}`;

  return (
    <div ref={root} className={className}>
      <div
        role="tablist"
        aria-label="Harbour's phases"
        onKeyDown={onKeyDown}
        style={{ "--n": phases.length, "--at": at } as CSSProperties}
        className="border-rule relative grid grid-cols-[repeat(var(--n),minmax(0,1fr))] border-t"
      >
        <span
          aria-hidden="true"
          className="bg-accent absolute -top-px left-0 h-[3px] w-[calc(100%/var(--n))] translate-x-[calc(100%*var(--at))] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
        />
        {phases.map((p, i) => {
          const current = i === at;
          return (
            <button
              key={p.number}
              id={`harbour-phase-${i}`}
              type="button"
              role="tab"
              aria-selected={current}
              aria-label={`Phase ${p.number}, ${p.name}`}
              tabIndex={current ? 0 : -1}
              onClick={() => go(i)}
              className={cn(
                "hover:bg-sunk min-h-11 cursor-pointer rounded-[2px] pt-2.5 pb-1.5 text-left font-mono text-[14px] font-bold transition-colors",
                current ? "text-accent" : "text-ink-faint hover:text-ink",
              )}
            >
              <span className="px-2">{p.number}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[16px]">
        <span className="text-ink font-bold">
          {phase.number === 0 ? "As found" : phase.name}
        </span>
        <span className="text-ink-muted">
          {" "}
          · phase {phase.number} of {phases.length - 1}
        </span>
      </p>
      <ScrollX className="dd-fig dd-vt-fig mt-4">
        <svg
          viewBox="0 0 700 410"
          role="img"
          className="min-w-[600px] lg:min-w-0"
          aria-label={`Harbour's front door at phase ${phase.number}. ${note}`}
        >
          <HarbourDrawing closed={closed} note={note} />
        </svg>
      </ScrollX>
    </div>
  );
}
