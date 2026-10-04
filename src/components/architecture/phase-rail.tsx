"use client";

import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { byPhaseThenSeverity } from "@/lib/architecture/state";
import type { Defect, Phase } from "@/lib/architecture/types";
import { cn } from "@/lib/utils";
import { SEVERITY_MARK } from "./severity-badge";

/** Just what the score draws: the phases and the defects each one closes. */
export interface RailModel {
  phases: Pick<Phase, "number" | "name">[];
  defects: Pick<Defect, "id" | "title" | "severity" | "phase" | "blockedBy">[];
}

/**
 * The remediation sequence written as a game score: each phase is a numbered
 * move, the defects it closes are noted beneath it with their marks, and a
 * blue marker slides to the move being read. Played moves strike their
 * defects through. Shared by the map, the journeys and the landing page.
 */
export function PhaseRail({
  model,
  phase,
  onChange,
  controls,
  label = "Remediation sequence",
}: {
  model: RailModel;
  phase: number;
  onChange: (phase: number) => void;
  /** Replaces the keyboard hint, e.g. a play button on the landing page. */
  controls?: ReactNode;
  label?: string;
}) {
  const last = model.phases.at(-1)?.number ?? 0;
  const open = model.defects.filter((d) => d.phase > phase).length;
  const sorted = [...model.defects].sort(byPhaseThenSeverity);
  const index = Math.max(
    0,
    model.phases.findIndex((p) => p.number === phase),
  );

  const onKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!step) return;
    event.preventDefault();
    const next = Math.min(last, Math.max(0, phase + step));
    onChange(next);
    requestAnimationFrame(() =>
      event.currentTarget
        .querySelector<HTMLButtonElement>(`[data-phase="${next}"]`)
        ?.focus(),
    );
  };

  return (
    <div className="not-prose">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pb-4">
        <div className="flex items-center gap-4">
          <p className="text-ink text-[16px] font-bold">{label}</p>
          {controls ?? (
            <span className="text-ink-muted hidden text-[14px] sm:inline">
              Pick a move, or use ← →
            </span>
          )}
        </div>
        <p aria-live="polite" className="text-[15px] tabular-nums">
          {open ? (
            <>
              <span className="text-fault font-bold">{open}</span>
              <span className="text-ink-muted">
                {" "}
                of {model.defects.length} defects open
              </span>
            </>
          ) : (
            <span className="text-ink font-bold">
              All {model.defects.length} defects closed
            </span>
          )}
        </p>
      </div>

      <ol
        role="group"
        aria-label="Remediation phase"
        onKeyDown={onKeyDown}
        style={
          {
            "--moves": model.phases.length,
            "--at": index,
          } as CSSProperties
        }
        className="border-rule relative border-t sm:grid sm:grid-cols-[repeat(var(--moves),minmax(0,1fr))]"
      >
        {/* The marker: slides along the top rule to the move being read. */}
        <span
          aria-hidden="true"
          className="bg-accent absolute -top-px left-0 hidden h-[3px] w-[calc(100%/var(--moves))] translate-x-[calc(100%*var(--at))] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:block"
        />
        {model.phases.map((p) => {
          const current = p.number === phase;
          const played = p.number <= phase;
          const closes = sorted.filter((d) => d.phase === p.number);
          return (
            <li
              key={p.number}
              className="border-rule relative border-b py-3 sm:border-b-0 sm:py-0 sm:pr-4"
            >
              {current && (
                <span
                  aria-hidden="true"
                  className="bg-accent absolute top-3 bottom-3 -left-3 w-[3px] sm:hidden"
                />
              )}
              <button
                type="button"
                data-phase={p.number}
                aria-pressed={current}
                tabIndex={current ? 0 : -1}
                onClick={() => onChange(p.number)}
                className="group -mx-2 flex w-[calc(100%+1rem)] cursor-pointer items-baseline gap-2 rounded-[2px] px-2 py-1 text-left transition-colors hover:bg-sunk sm:mt-2 sm:flex-col sm:gap-0.5 sm:py-1.5"
              >
                <span
                  className={cn(
                    "font-mono text-[14px] font-bold",
                    current ? "text-accent" : "text-ink-faint",
                  )}
                >
                  {p.number}.
                </span>
                <span
                  className={cn(
                    "text-[16px] leading-[1.3] text-balance transition-colors",
                    current
                      ? "text-accent font-bold"
                      : played
                        ? "text-ink group-hover:text-accent"
                        : "text-ink-muted group-hover:text-ink",
                  )}
                >
                  {p.number === 0 ? "As found" : p.name}
                </span>
              </button>

              {closes.length > 0 && (
                <ul
                  aria-label={`Closes ${closes.map((d) => d.id).join(", ")}`}
                  className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 pl-6 sm:mt-2 sm:pl-0"
                >
                  {closes.map((d) => {
                    const done = d.phase <= phase;
                    const mark = SEVERITY_MARK[d.severity];
                    return (
                      <li
                        key={d.id}
                        title={`${d.id} · ${d.title}`}
                        className={cn(
                          "font-mono text-[13.5px] whitespace-nowrap",
                          done
                            ? "text-ink-faint"
                            : d.severity === "critical" || d.severity === "high"
                              ? "text-fault font-bold"
                              : "text-ink font-bold",
                        )}
                      >
                        <span className={cn(done && "dd-struck")}>
                          {d.id}
                          {mark !== "·" && (
                            <span aria-hidden="true">{mark}</span>
                          )}
                        </span>
                        <span className="sr-only">
                          {done ? " closed" : ` open, ${d.severity}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
