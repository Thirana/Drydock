"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ArchitectureDiagram } from "@/components/architecture/architecture-diagram";
import { DiagramLegend } from "@/components/architecture/diagram-frame";
import { ButtonLink } from "@/components/ui/button";
import {
  IconArrow,
  IconCheck,
  IconPause,
  IconPlay,
} from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { FeaturedCallout, FeaturedTrack } from "@/lib/content/featured";
import { cn } from "@/lib/utils";

/** Time on each phase while the walkthrough plays. */
const STEP_MS = 2800;
/** Added to the first and last phase, so both ends of the story get read. */
const HOLD_MS = 2200;

const CHIP_OFFSET: Record<FeaturedCallout["placement"], string> = {
  top: "translate(-50%, calc(-100% - 12px))",
  bottom: "translate(-50%, 12px)",
  left: "translate(calc(-100% - 12px), -50%)",
  right: "translate(12px, -50%)",
};

type HeroMapProps = Pick<
  FeaturedTrack,
  | "lab"
  | "track"
  | "mapHref"
  | "map"
  | "phases"
  | "callouts"
  | "focus"
  | "revealAt"
>;

/**
 * The featured map walking itself from "as found" to fixed, phase by phase.
 * This is the page's one showcase frame (chalk-line border and hard shadow).
 */
export function HeroMap({
  lab,
  track,
  mapHref,
  map,
  phases,
  callouts,
  focus,
  revealAt,
}: HeroMapProps) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const running = playing && !reduced;
  const lastIndex = phases.length - 1;
  const current = phases[index];
  const open = map.defects.filter((d) => d.phase > current.number).length;
  const delay = STEP_MS + (index === 0 || index === lastIndex ? HOLD_MS : 0);
  const hidden = useMemo(
    () =>
      new Set(
        Object.keys(revealAt).filter((id) => revealAt[id] > current.number),
      ),
    [revealAt, current.number],
  );

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(
      () => setIndex((i) => (i >= lastIndex ? 0 : i + 1)),
      delay,
    );
    return () => clearTimeout(timer);
  }, [running, index, delay, lastIndex]);

  // One diagram for every width. Below sm it is scaled and shifted so the
  // focus region fills the frame, rather than rendering a second, cropped copy.
  const focusStyle = {
    "--focus-ratio": `${focus.width} / ${focus.height}`,
    "--focus-w": `${(map.viewBox.width / focus.width) * 100}%`,
    "--focus-x": `${(-focus.x / focus.width) * 100}%`,
    "--focus-y": `${(-focus.y / focus.width) * 100}%`,
  } as CSSProperties;

  const choose = (i: number) => {
    setPlaying(false);
    setIndex(i);
  };

  return (
    <div className="relative mx-auto max-w-[1104px] text-left">
      <figure className="border-gl-border-strong bg-gl-bg shadow-gl-hard relative overflow-hidden rounded-2xl border">
        <figcaption className="border-gl-border bg-gl-bg-subtle border-b">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 pt-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-2.5">
              <Logo size={16} />
              <span className="text-gl-text text-[13px] font-bold whitespace-nowrap">
                {lab} · {track}
              </span>
              {/* Polite only while paused, so autoplay is not read out every step. */}
              <span
                aria-live={running ? "off" : "polite"}
                className="flex min-w-0"
              >
                <span
                  // A new key replays the highlight on every phase change.
                  key={current.number}
                  className="animate-phase-swap inline-flex min-w-0 items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[11px]"
                >
                  <span className="text-gl-primary shrink-0 font-semibold tabular-nums">
                    Phase {current.number}
                  </span>
                  <span className="text-gl-text truncate">{current.name}</span>
                </span>
              </span>
            </div>
            <OpenCount open={open} total={map.defects.length} />
          </div>

          {/* Same side padding as the row above, so the last bar ends under the count. */}
          <div className="flex items-center gap-2 px-4 pt-0.5 pb-1 sm:gap-3 sm:px-5">
            {!reduced && (
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={
                  playing ? "Pause the walkthrough" : "Play the walkthrough"
                }
                className="text-gl-text-muted hover:bg-gl-text/[0.06] hover:text-gl-text relative -ml-2 inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-[120ms] after:absolute after:-inset-1.5"
              >
                {playing ? <IconPause /> : <IconPlay />}
              </button>
            )}
            <ol
              aria-label="Remediation phase"
              className="flex flex-1 items-center gap-1.5"
            >
              {phases.map((p, i) => {
                const active = i === index;
                const timing = active && running;
                return (
                  <li key={p.number} className="min-w-0 flex-1">
                    <button
                      type="button"
                      aria-pressed={active}
                      aria-label={`Phase ${p.number}: ${p.name}`}
                      onClick={() => choose(i)}
                      className="group flex h-11 w-full items-center rounded-md"
                    >
                      <span className="bg-gl-border group-hover:bg-gl-border-input relative block h-1 w-full overflow-hidden rounded-full transition-colors">
                        <span
                          // A new key restarts the fill for every step.
                          key={timing ? `timing-${index}` : "idle"}
                          className={cn(
                            "bg-gl-primary absolute inset-0 origin-left rounded-full transition-transform duration-300",
                            i > index && "scale-x-0",
                            timing && "animate-phase-progress",
                          )}
                          style={
                            timing
                              ? { animationDuration: `${delay}ms` }
                              : undefined
                          }
                        />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </figcaption>

        <div className="relative">
          <div
            className="aspect-(--focus-ratio) overflow-hidden sm:aspect-auto"
            style={focusStyle}
          >
            <ArchitectureDiagram
              model={map}
              phase={current.number}
              hidden={hidden}
              className="mt-(--focus-y) ml-(--focus-x) w-(--focus-w) max-w-none min-w-0 sm:mt-0 sm:ml-0 sm:w-full"
            />
          </div>
          {/* Labels are sized in pixels, so they only show where the map is
              large enough to leave room for them. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden lg:block"
          >
            {callouts.map((c) => (
              <Callout
                key={c.defect}
                callout={c}
                closed={c.phase <= current.number}
                viewBox={map.viewBox}
              />
            ))}
          </div>
        </div>
        <div className="border-gl-border bg-gl-bg-subtle hidden border-t px-5 py-2.5 sm:block">
          <DiagramLegend />
        </div>
      </figure>

      <div className="mt-8 flex flex-col items-center gap-2.5 text-center">
        <ButtonLink href={mapHref} size="lg" trailing={<IconArrow size={14} />}>
          Explore the full map
        </ButtonLink>
        <p className="text-gl-text-muted text-[12.5px]">
          Overlays, component sheets and every phase, one click each
        </p>
      </div>
    </div>
  );
}

function OpenCount({ open, total }: { open: number; total: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold whitespace-nowrap tabular-nums transition-colors duration-500",
        open
          ? "border-gl-danger/30 bg-gl-danger-soft text-gl-danger"
          : "border-gl-success/30 bg-gl-success-soft text-gl-success",
      )}
    >
      {open ? (
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      ) : (
        <IconCheck size={11} />
      )}
      {open
        ? `${open} of ${total} defects open`
        : `all ${total} defects closed`}
    </span>
  );
}

function Callout({
  callout,
  closed,
  viewBox,
}: {
  callout: FeaturedCallout;
  closed: boolean;
  viewBox: { width: number; height: number };
}) {
  const position = {
    left: `${(callout.x / viewBox.width) * 100}%`,
    top: `${(callout.y / viewBox.height) * 100}%`,
  };
  return (
    <>
      <span
        className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2"
        style={position}
      >
        {!closed && (
          <span className="bg-gl-danger absolute inset-0 animate-ping rounded-full opacity-70" />
        )}
        <span
          className={cn(
            "border-gl-bg absolute inset-0 rounded-full border-2 transition-colors duration-500",
            closed ? "bg-gl-success" : "bg-gl-danger",
          )}
        />
      </span>
      <span
        className={cn(
          "shadow-gl bg-gl-bg/90 absolute inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11.5px] font-medium whitespace-nowrap backdrop-blur-sm transition-colors duration-500",
          closed
            ? "border-gl-success/35 text-gl-success"
            : "border-gl-danger/45 text-gl-text",
        )}
        style={{ ...position, transform: CHIP_OFFSET[callout.placement] }}
      >
        {closed ? (
          <>
            <IconCheck size={11} />
            <span className="font-mono text-[11px] font-bold">
              {callout.defect}
            </span>
            closed in phase
            <span className="-ml-1 font-mono text-[11px] font-bold tabular-nums">
              {callout.phase}
            </span>
          </>
        ) : (
          <>
            <span className="text-gl-danger font-mono text-[11px] font-bold">
              {callout.defect}
            </span>
            {callout.label}
          </>
        )}
      </span>
    </>
  );
}
