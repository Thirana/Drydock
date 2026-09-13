"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ArchitectureDiagram } from "@/components/architecture/architecture-diagram";
import { SeverityBadge } from "@/components/architecture/severity-badge";
import { ButtonLink } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/controls";
import {
  ICONS,
  IconArrow,
  IconArrowRight,
  IconList,
} from "@/components/ui/icons";
import { failingHopCount, journeyHighlight } from "@/lib/architecture/journeys";
import { closedDefects } from "@/lib/architecture/state";
import { toneColor } from "@/lib/architecture/tone";
import type { MapModel } from "@/lib/architecture/types";
import type { FeaturedTrack } from "@/lib/content/featured";
import { cn } from "@/lib/utils";

const EYEBROW =
  "text-gl-text-muted text-[11px] font-bold tracking-[0.12em] uppercase";

type TrackTourProps = Pick<
  FeaturedTrack,
  | "views"
  | "map"
  | "journey"
  | "components"
  | "chain"
  | "spotlight"
  | "addressPlan"
>;

/** Every view of the featured track as a tab, each with a live preview. */
export function TrackTour(props: TrackTourProps) {
  const { views } = props;
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const view = views[active];
  if (!view) return null;

  const onKeyDown = (event: KeyboardEvent) => {
    const target = {
      ArrowDown: active + 1,
      ArrowRight: active + 1,
      ArrowUp: active - 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: views.length - 1,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    const next = (target + views.length) % views.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-5">
      <div className="relative min-w-0">
        <div
          role="tablist"
          aria-label="Views of the track"
          onKeyDown={onKeyDown}
          className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-0"
        >
          {views.map((v, i) => {
            const Icon = v.icon ? ICONS[v.icon] : IconList;
            const selected = i === active;
            return (
              <button
                key={v.slug}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${i}`}
                aria-selected={selected}
                aria-controls={`${id}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors duration-[120ms] lg:items-start lg:px-4 lg:py-3.5",
                  selected
                    ? "border-gl-border bg-gl-surface shadow-gl"
                    : "hover:bg-gl-surface/60 border-transparent",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-[120ms]",
                    selected
                      ? "bg-gl-primary-soft text-gl-primary"
                      : "bg-gl-surface-2 text-gl-text-muted",
                  )}
                >
                  <Icon size={16} />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-[14px] font-semibold whitespace-nowrap",
                      selected ? "text-gl-text" : "text-gl-text-muted",
                    )}
                  >
                    {v.title}
                  </span>
                  <span
                    className={cn(
                      "text-gl-text-muted mt-1 hidden text-[12.5px] leading-[1.5] text-pretty",
                      selected && "lg:block",
                    )}
                  >
                    {v.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {/* More tabs sit off-screen on narrow layouts; fade the edge to say so. */}
        <div
          aria-hidden="true"
          className="from-gl-bg pointer-events-none absolute inset-y-0 -right-5 w-12 bg-gradient-to-l to-transparent sm:-right-8 lg:hidden"
        />
      </div>

      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${active}`}
        className="border-gl-border bg-gl-surface shadow-gl flex min-w-0 flex-col overflow-hidden rounded-2xl border lg:min-h-[540px]"
      >
        <div className="border-gl-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div className="min-w-0">
            <h3 className="text-gl-text text-[18px] leading-snug font-bold tracking-[-0.018em]">
              {view.title}
            </h3>
            <p className="text-gl-text-muted mt-0.5 text-[13.5px] leading-[1.5] text-pretty lg:hidden">
              {view.description}
            </p>
          </div>
          <ButtonLink
            href={view.href}
            size="sm"
            trailing={<IconArrow size={12} />}
          >
            Open<span className="sr-only"> {view.title}</span>
          </ButtonLink>
        </div>
        <div key={view.slug} className="animate-fade-in flex flex-1 flex-col">
          <Preview slug={view.slug} {...props} />
        </div>
      </div>
    </div>
  );
}

function Preview({ slug, ...data }: TrackTourProps & { slug: string }) {
  switch (slug) {
    case "map":
      return <MapPreview map={data.map} />;
    case "journeys":
      if (data.journey)
        return <JourneyPreview map={data.map} journey={data.journey} />;
      break;
    case "components":
      if (data.components.length)
        return <ComponentsPreview components={data.components} />;
      break;
    case "load-balancing":
      if (data.chain.length) return <ChainPreview chain={data.chain} />;
      break;
    case "ip-plan":
      if (data.addressPlan.length)
        return <AddressPlanPreview ranges={data.addressPlan} />;
      break;
    case "defects":
      return <RegisterPreview defects={data.spotlight} />;
  }
  return <ProsePreview />;
}

function Toolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-gl-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
      {children}
    </div>
  );
}

function DiagramWell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gl-bg flex flex-1 items-center overflow-x-auto">
      {children}
    </div>
  );
}

function MapPreview({ map }: { map: MapModel }) {
  const [layer, setLayer] = useState<"defects" | "all">("defects");
  return (
    <>
      <Toolbar>
        <SegmentedControl
          label="Overlay"
          options={[
            { value: "defects", label: "Defects" },
            { value: "all", label: "Everything" },
          ]}
          value={layer}
          onChange={setLayer}
        />
        <span className="text-gl-text-muted font-mono text-[11px]">
          phase 0 · as found
        </span>
      </Toolbar>
      <DiagramWell>
        <ArchitectureDiagram
          model={map}
          phase={0}
          layer={layer}
          className="min-w-[640px] lg:min-w-0"
        />
      </DiagramWell>
    </>
  );
}

function JourneyPreview({
  map,
  journey,
}: {
  map: MapModel;
  journey: NonNullable<FeaturedTrack["journey"]>;
}) {
  const [phase, setPhase] = useState(0);
  const closed = closedDefects(map, phase);
  const failing = failingHopCount(journey.journey, closed);

  return (
    <>
      <Toolbar>
        <SegmentedControl
          label="Phase"
          options={[
            { value: "0", label: "As found" },
            {
              value: String(journey.fixedAt),
              label: `After phase ${journey.fixedAt}`,
            },
          ]}
          value={String(phase)}
          onChange={(v) => setPhase(Number(v))}
        />
        <span className="text-gl-text-muted min-w-0 text-[13px]">
          {journey.journey.title} ·{" "}
          <span
            className={cn(
              "font-mono text-[11.5px] font-semibold",
              failing ? "text-gl-danger" : "text-gl-success",
            )}
          >
            {failing
              ? `${failing} failing hop${failing === 1 ? "" : "s"}`
              : "every hop passes"}
          </span>
        </span>
      </Toolbar>
      <DiagramWell>
        <ArchitectureDiagram
          model={map}
          phase={phase}
          highlight={journeyHighlight(map, journey.journey, closed)}
          className="min-w-[640px] lg:min-w-0"
        />
      </DiagramWell>
    </>
  );
}

function ComponentsPreview({
  components,
}: {
  components: FeaturedTrack["components"];
}) {
  return (
    <ul className="grid flex-1 content-center gap-3 p-5 sm:grid-cols-3">
      {components.map((c) => (
        <li
          key={c.id}
          className="border-gl-border bg-gl-bg flex flex-col rounded-[10px] border p-4"
        >
          <p className={EYEBROW}>{c.section}</p>
          <p className="text-gl-text mt-1.5 text-[15px] font-bold tracking-[-0.01em]">
            {c.label}
          </p>
          <p className="text-gl-text-muted mt-1.5 line-clamp-4 text-[12.5px] leading-[1.55]">
            {c.purpose}
          </p>
          <dl className="border-gl-border mt-4 grid gap-2 border-t pt-3">
            {c.facts.map((f) => (
              <div key={f.label}>
                <dt className="text-gl-text-muted font-mono text-[11px] tracking-[0.08em] uppercase">
                  {f.label}
                </dt>
                <dd className="text-gl-text line-clamp-2 text-[12px] leading-[1.45]">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
  );
}

function ChainPreview({ chain }: { chain: FeaturedTrack["chain"] }) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-7 p-5 sm:p-6">
      {chain.map((lane) => (
        <div key={lane.label}>
          <p className={EYEBROW}>{lane.label}</p>
          <ol className="mt-3 flex flex-wrap items-center gap-y-2">
            {lane.links.map((link, i) => (
              <li key={`${link.label}-${i}`} className="flex items-center">
                {i > 0 && (
                  <IconArrowRight
                    size={12}
                    className="text-gl-text-faint mx-1.5"
                  />
                )}
                <span
                  className={cn(
                    "bg-gl-bg flex flex-col rounded-lg border px-3 py-2",
                    link.defects.length
                      ? "border-gl-danger/45"
                      : "border-gl-border",
                  )}
                >
                  <span className="text-gl-text flex items-center gap-2 text-[12.5px] font-semibold whitespace-nowrap">
                    {link.label}
                    {link.defects.length > 0 && (
                      <span className="text-gl-danger font-mono text-[11px]">
                        {link.defects.join(" ")}
                      </span>
                    )}
                  </span>
                  <span className="text-gl-text-muted font-mono text-[11px] whitespace-nowrap">
                    {link.sub}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

function AddressPlanPreview({
  ranges,
}: {
  ranges: FeaturedTrack["addressPlan"];
}) {
  return (
    <ul className="grid flex-1 content-center gap-3 p-5 sm:grid-cols-2">
      {ranges.map((r) => (
        <li
          key={r.cidr}
          className="border-gl-border bg-gl-bg rounded-[10px] border p-4"
        >
          <span className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
              style={{ background: toneColor(r.tone) }}
            />
            <span className="text-gl-text font-mono text-[15px] font-bold tracking-[-0.01em]">
              {r.cidr}
            </span>
          </span>
          <span className="text-gl-text-muted mt-1.5 block text-[12.5px] leading-[1.5]">
            {r.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

function RegisterPreview({ defects }: { defects: FeaturedTrack["spotlight"] }) {
  return (
    <ol className="divide-gl-border flex-1 divide-y">
      {defects.map((d) => (
        <li
          key={d.id}
          className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 px-5 py-4"
        >
          <span className="text-gl-text-muted font-mono text-[11.5px] font-semibold">
            {d.id}
          </span>
          <span className="min-w-0">
            <span className="text-gl-text block truncate text-[14px] font-semibold">
              {d.title}
            </span>
            <span className="text-gl-text-muted block truncate text-[12px]">
              Closes in phase {d.phase} · {d.phaseName}
            </span>
          </span>
          <SeverityBadge severity={d.severity} />
        </li>
      ))}
    </ol>
  );
}

function ProsePreview() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center">
      <p className="text-gl-text text-[15px] font-semibold">
        A written reference
      </p>
      <p className="text-gl-text-muted max-w-[42ch] text-[13.5px] leading-[1.55] text-pretty">
        This view is prose and tables rather than a diagram. Open it to read it
        in full.
      </p>
    </div>
  );
}
