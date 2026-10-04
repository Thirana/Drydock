"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ArchitectureDiagram } from "@/components/architecture/architecture-diagram";
import { DiagramLegend } from "@/components/architecture/diagram-frame";
import { PhaseRail } from "@/components/architecture/phase-rail";
import { ButtonLink } from "@/components/ui/button";
import { IconArrow, IconPause, IconPlay } from "@/components/ui/icons";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { FeaturedCallout, FeaturedTrack } from "@/lib/content/featured";
import { cn } from "@/lib/utils";

/** Time on each phase while the reel runs. */
const STEP_MS = 2600;
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
  | "trims"
  | "callouts"
  | "focus"
  | "revealAt"
>;

/**
 * The featured track run through the bench: the rail steps from as found to
 * healthy, crossing off defects, and the map beneath it changes in step.
 */
export function HeroMap({
  lab,
  track,
  mapHref,
  map,
  phases,
  trims,
  callouts,
  focus,
  revealAt,
}: HeroMapProps) {
  const reduced = usePrefersReducedMotion();
  // Open mid-reel, so the first thing seen is defects already crossed off.
  const [index, setIndex] = useState(Math.min(2, phases.length - 1));
  const [playing, setPlaying] = useState(true);
  const running = playing && !reduced;
  const lastIndex = phases.length - 1;
  const current = phases[index];
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

  return (
    <div className="space-y-12">
      <PhaseRail
        model={{ phases, defects: trims }}
        phase={current.number}
        onChange={(n) => {
          setPlaying(false);
          setIndex(phases.findIndex((p) => p.number === n));
        }}
        label={`${lab} · ${track}`}
        controls={
          reduced ? undefined : (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={
                playing ? "Pause the walkthrough" : "Play the walkthrough"
              }
              className="text-ink-muted hover:text-ink inline-flex min-h-9 items-center gap-1.5 text-[14px] transition-colors"
            >
              {playing ? <IconPause size={10} /> : <IconPlay size={10} />}
              {playing ? "Pause" : "Play"}
            </button>
          )
        }
      />

      <figure>
        <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pb-3">
          <span
            aria-live={running ? "off" : "polite"}
            className="flex min-w-0 flex-wrap items-baseline gap-x-4"
          >
            <span className="text-ink text-[16px] font-bold">
              {lab} after move {current.number}
            </span>
            <span className="text-ink-muted text-[15px]">
              {current.number === 0 ? "As found" : current.name}
            </span>
          </span>
          <span className="hidden sm:block">
            <DiagramLegend />
          </span>
        </figcaption>
        <div className="border-rule relative rounded-[2px] border lg:mx-[calc(50%-min(50vw,720px)+24px)]">
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
      </figure>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <ButtonLink href={mapHref} size="lg" trailing={<IconArrow size={14} />}>
          Explore the full map
        </ButtonLink>
        <p className="text-ink-muted text-[15px]">
          Overlays, component sheets and every phase, one click each.
        </p>
      </div>
    </div>
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
        className={cn(
          "absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors duration-500",
          closed ? "border-ink-faint bg-ground" : "border-fault bg-fault",
        )}
        style={position}
      />
      <span
        className={cn(
          "bg-ground absolute inline-flex items-center gap-2 rounded-[2px] border px-2 py-1 text-[13px] whitespace-nowrap transition-colors duration-500",
          closed ? "border-rule text-ink-muted" : "border-rule-strong text-ink",
        )}
        style={{ ...position, transform: CHIP_OFFSET[callout.placement] }}
      >
        <span
          className={cn(
            "font-mono text-[13.5px] font-bold",
            closed ? "text-ink-faint line-through" : "text-fault",
          )}
        >
          {callout.defect}
        </span>
        {closed ? `closed in phase ${callout.phase}` : callout.label}
      </span>
    </>
  );
}
