"use client";

import { useEffect, useState } from "react";
import { DEFECT_CHIP } from "@/components/architecture/defect-link";
import { GlButton } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/controls";
import {
  IconArrowLeft,
  IconArrowRight,
  IconPause,
  IconPlay,
} from "@/components/ui/icons";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { FeaturedTrack } from "@/lib/content/featured";
import { cn } from "@/lib/utils";

/** Time the request spends on each link while it travels. */
const STEP_MS = 1400;

type Route = "chain" | "around";

const STEP_BUTTON =
  "text-gl-text-muted hover:bg-gl-text/[0.06] hover:text-gl-text relative inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-[120ms] after:absolute after:-inset-1.5 disabled:pointer-events-none disabled:opacity-40";

/**
 * A request walked down the load balancer chain, one link at a time. Where the
 * lane's backend carries the bypass defect, a second route sends the request
 * around every link instead.
 */
export function ChainWalk({
  chain,
  bypassDefect,
}: {
  chain: FeaturedTrack["chain"];
  bypassDefect?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [laneIndex, setLaneIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [route, setRoute] = useState<Route>("chain");

  const lane = chain[laneIndex] ?? chain[0];
  const last = lane.links.length - 1;
  const canBypass =
    !!bypassDefect && !!lane.links[last]?.defects.includes(bypassDefect);
  const around = canBypass && route === "around";
  const current = around ? last : Math.min(step, last);
  const link = lane.links[current];
  const detail = link?.detail;
  const running = playing && !around && !reduced;

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => {
      if (step >= last) setPlaying(false);
      else setStep(step + 1);
    }, STEP_MS);
    return () => clearTimeout(timer);
  }, [running, step, last]);

  const goTo = (i: number) => {
    setPlaying(false);
    setRoute("chain");
    setStep(Math.max(0, Math.min(i, last)));
  };
  const send = () => {
    if (running) return setPlaying(false);
    if (step >= last) setStep(0);
    setPlaying(true);
  };
  const chooseLane = (value: string) => {
    setLaneIndex(Number(value));
    setStep(0);
    setPlaying(false);
    setRoute("chain");
  };

  if (!link) return null;

  return (
    <>
      <div className="border-gl-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
        <SegmentedControl
          label="Load balancer"
          value={String(laneIndex)}
          onChange={chooseLane}
          options={chain.map((l, i) => ({
            value: String(i),
            label: l.label.split(" · ").at(-1) ?? l.label,
          }))}
        />
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            disabled={around || current === 0}
            aria-label="Previous link"
            className={STEP_BUTTON}
          >
            <IconArrowLeft />
          </button>
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            disabled={around || current === last}
            aria-label="Next link"
            className={STEP_BUTTON}
          >
            <IconArrowRight />
          </button>
          {!reduced && (
            <GlButton
              size="sm"
              variant="secondary"
              onClick={send}
              disabled={around}
              leading={running ? <IconPause /> : <IconPlay />}
            >
              {running
                ? "Pause"
                : step >= last
                  ? "Send it again"
                  : "Send a request"}
            </GlButton>
          )}
        </div>
      </div>

      <div className="grid flex-1 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="border-gl-border bg-gl-bg border-b p-5 lg:border-r lg:border-b-0">
          <p className="text-gl-text-muted font-mono text-[11px]">
            {lane.label}
          </p>
          {canBypass && (
            <SegmentedControl<Route>
              label="Route"
              className="mt-3"
              value={route}
              onChange={(value) => {
                setPlaying(false);
                setRoute(value);
              }}
              options={[
                { value: "chain", label: "Through the chain" },
                { value: "around", label: "Around it" },
              ]}
            />
          )}

          <ol aria-label="Links in the chain" className="mt-4">
            {lane.links.map((l, i) => {
              const here = i === current;
              const skipped = around && i < last;
              const passed = !around && i < current;
              return (
                <li key={l.id} className="relative">
                  {i < last && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute top-[calc(50%+6px)] left-[5.5px] h-[calc(100%-12px)] border-l transition-colors duration-300",
                        around
                          ? "border-gl-danger/60 border-dashed"
                          : i < current
                            ? "border-gl-primary"
                            : "border-gl-border",
                      )}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={here ? "step" : undefined}
                    className="group flex min-h-11 w-full items-center gap-3 rounded-md py-1.5 text-left"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "relative z-10 size-3 shrink-0 rounded-full border-2 transition-colors duration-300",
                        here &&
                          (around
                            ? "border-gl-danger bg-gl-danger ring-gl-danger/20 ring-4"
                            : "border-gl-primary bg-gl-primary ring-gl-primary/20 ring-4"),
                        !here &&
                          (passed
                            ? "border-gl-primary bg-gl-primary"
                            : skipped
                              ? "border-gl-danger/50 bg-gl-bg"
                              : "border-gl-border-input bg-gl-bg"),
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-[13px] leading-snug font-semibold transition-colors duration-300",
                          skipped
                            ? "text-gl-text-muted decoration-gl-danger/70 line-through"
                            : here
                              ? "text-gl-text"
                              : "text-gl-text-muted group-hover:text-gl-text",
                        )}
                      >
                        {l.label}
                      </span>
                      <span className="text-gl-text-muted block truncate font-mono text-[11px]">
                        {l.sub}
                      </span>
                    </span>
                    {l.defects.length > 0 && (
                      <span className="flex shrink-0 gap-1">
                        {l.defects.map((d) => (
                          <span key={d} className={DEFECT_CHIP}>
                            {d}
                          </span>
                        ))}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Fixed minimum height, so moving between links does not shift the panel. */}
        <div aria-live="polite" className="min-h-[260px] px-5 py-4 sm:px-6">
          {around && (
            <p className="border-gl-danger/30 bg-gl-danger-soft text-gl-danger mb-4 rounded-[10px] border px-3.5 py-2.5 text-[13px] font-medium">
              The run.app URL reaches {link.label} directly, skipping every link
              above it. {bypassDefect} is this door.
            </p>
          )}
          {detail ? (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h4 className="text-gl-text text-[15px] font-bold tracking-[-0.01em]">
                  {detail.title}
                </h4>
                <span className="text-gl-text-muted font-mono text-[11px]">
                  {detail.position}
                </span>
              </div>
              <p className="text-gl-text-muted mt-0.5 text-[12.5px]">
                {detail.subtitle}
              </p>
              <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                {detail.rows.slice(0, 4).map((row) => (
                  <div key={row.label} className="min-w-0">
                    <dt className="text-gl-text-muted text-[11.5px] font-semibold">
                      {row.label}
                    </dt>
                    <dd className="text-gl-text mt-0.5 line-clamp-2 text-[13px] leading-[1.45]">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
              {detail.note && (
                <p className="text-gl-text-muted mt-4 line-clamp-4 text-[13px] leading-[1.6] text-pretty">
                  {detail.note}
                </p>
              )}
            </>
          ) : (
            <p className="text-gl-text-muted text-[13px]">{link.sub}</p>
          )}
        </div>
      </div>
    </>
  );
}
