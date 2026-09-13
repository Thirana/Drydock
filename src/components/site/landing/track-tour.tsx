"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ArchitectureDiagram } from "@/components/architecture/architecture-diagram";
import { DEFECT_CHIP } from "@/components/architecture/defect-link";
import { SeverityBadge } from "@/components/architecture/severity-badge";
import { ButtonLink } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/controls";
import { ICONS, IconArrow, IconList } from "@/components/ui/icons";
import { toneColor } from "@/lib/architecture/tone";
import type { MapModel } from "@/lib/architecture/types";
import type { FeaturedTrack } from "@/lib/content/featured";
import { cn } from "@/lib/utils";
import { ChainWalk } from "./chain-walk";
import { JourneyLine } from "./journey-line";

type TrackTourProps = Pick<
  FeaturedTrack,
  | "views"
  | "map"
  | "journey"
  | "componentMap"
  | "chain"
  | "bypass"
  | "spotlight"
  | "severityCounts"
  | "totals"
  | "addressPlan"
  | "addressMap"
>;

/** Every view of the featured track as a tab, each with a live preview. */
export function TrackTour(props: TrackTourProps) {
  const { views } = props;
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const last = views.length - 1;
  const view = views[active];
  if (!view) return null;

  const onKeyDown = (event: KeyboardEvent) => {
    const target = {
      ArrowDown: active + 1,
      ArrowRight: active + 1,
      ArrowUp: active - 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    const next = (target + views.length) % views.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div>
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
                    "flex shrink-0 items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors duration-[120ms] lg:px-4 lg:py-3",
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
                  <span
                    className={cn(
                      "text-[14px] font-semibold whitespace-nowrap",
                      selected ? "text-gl-text" : "text-gl-text-muted",
                    )}
                  >
                    {v.title}
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
          <div
            key={view.slug}
            className="animate-fade-in flex min-h-0 flex-1 flex-col"
          >
            <Preview slug={view.slug} href={view.href} {...props} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Preview({
  slug,
  href,
  ...data
}: TrackTourProps & { slug: string; href: string }) {
  switch (slug) {
    case "map":
      return <MapPreview map={data.map} />;
    case "journeys":
      if (data.journey)
        return <JourneyLine map={data.map} journey={data.journey} />;
      break;
    case "components":
      if (data.componentMap)
        return (
          <ComponentMapPreview
            map={data.map}
            componentMap={data.componentMap}
          />
        );
      break;
    case "load-balancing":
      if (data.chain.length)
        return (
          <ChainWalk chain={data.chain} bypassDefect={data.bypass?.defect.id} />
        );
      break;
    case "ip-plan":
      if (data.addressMap)
        return (
          <AddressMapPreview map={data.map} addressMap={data.addressMap} />
        );
      if (data.addressPlan.length)
        return <AddressPlanPreview ranges={data.addressPlan} />;
      break;
    case "defects":
      return (
        <RegisterPreview
          defects={data.spotlight}
          counts={data.severityCounts}
          total={data.totals.defects}
          href={href}
        />
      );
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

function ComponentMapPreview({
  map,
  componentMap,
}: {
  map: MapModel;
  componentMap: NonNullable<FeaturedTrack["componentMap"]>;
}) {
  const { crop, items, initial } = componentMap;
  const [selected, setSelected] = useState(initial);
  const ids = new Set(items.map((i) => i.id));
  const item = items.find((i) => i.id === selected) ?? items[0];

  return (
    <>
      <Toolbar>
        <span className="text-gl-text-muted text-[12.5px]">
          Select a component on the map to inspect it
        </span>
        <span className="text-gl-text-muted font-mono text-[11px]">
          {items.length} components
        </span>
      </Toolbar>
      <DiagramWell>
        <ArchitectureDiagram
          model={map}
          phase={0}
          crop={crop}
          selectedId={item.id}
          selectableIds={ids}
          onSelect={setSelected}
          className="min-w-[640px] lg:min-w-0"
        />
      </DiagramWell>
      {/* Fixed minimum height, so switching components does not shift the panel. */}
      <div
        aria-live="polite"
        className="border-gl-border min-h-[184px] border-t px-5 py-4 sm:px-6"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h4 className="text-gl-text text-[15px] font-bold tracking-[-0.01em]">
            {item.label}
          </h4>
          {item.sub && (
            <span className="text-gl-text-muted font-mono text-[11.5px]">
              {item.sub}
            </span>
          )}
          {item.defects.length > 0 && (
            <span className="flex flex-wrap items-center gap-2 sm:ml-auto">
              {item.defects.map((d) => (
                <span key={d.id} className="flex items-center gap-1.5">
                  <span className={DEFECT_CHIP}>{d.id}</span>
                  <SeverityBadge severity={d.severity} />
                </span>
              ))}
            </span>
          )}
        </div>
        <p className="text-gl-text-muted mt-1.5 line-clamp-2 text-[13.5px] leading-[1.55]">
          {item.purpose}
        </p>
        <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
          {item.facts.slice(0, 4).map((fact) => (
            <div key={fact.label} className="min-w-0">
              <dt className="text-gl-text-muted text-[11.5px] font-semibold">
                {fact.label}
              </dt>
              <dd className="text-gl-text mt-0.5 line-clamp-2 text-[13px] leading-[1.45]">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}

function AddressMapPreview({
  map,
  addressMap,
}: {
  map: MapModel;
  addressMap: NonNullable<FeaturedTrack["addressMap"]>;
}) {
  const { crop, pins, parent, others } = addressMap;
  return (
    <>
      {parent && (
        <Toolbar>
          <span className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
              style={{ background: toneColor(parent.tone) }}
            />
            <span className="text-gl-text font-mono text-[13px] font-semibold">
              {parent.cidr}
            </span>
            <span className="text-gl-text-muted truncate text-[12.5px]">
              {parent.label}
            </span>
          </span>
          <span className="text-gl-text-muted font-mono text-[11px]">
            {pins.length} subnets
          </span>
        </Toolbar>
      )}
      <DiagramWell>
        <div className="relative w-full min-w-[640px] lg:min-w-0">
          <ArchitectureDiagram
            model={map}
            phase={0}
            crop={crop}
            className="min-w-0"
          />
          {/* Each subnet's range, pinned inside its box's bottom-right corner. */}
          <ul
            aria-label="Subnet ranges"
            className="pointer-events-none absolute inset-0"
          >
            {pins.map((pin) => (
              <li
                key={pin.id}
                className="border-gl-border-input bg-gl-bg/90 text-gl-text shadow-gl absolute inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold whitespace-nowrap backdrop-blur-sm"
                style={{
                  left: `${((pin.x - crop.x) / crop.width) * 100}%`,
                  top: `${((pin.y - crop.y) / crop.height) * 100}%`,
                  transform: "translate(calc(-100% - 14px), -50%)",
                }}
              >
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: toneColor(pin.tone) }}
                />
                {pin.cidr}
              </li>
            ))}
          </ul>
        </div>
      </DiagramWell>
      {others.length > 0 && (
        <ul className="border-gl-border flex flex-wrap gap-x-5 gap-y-2 border-t px-5 py-3">
          {others.map((range) => (
            <li key={range.cidr} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: toneColor(range.tone) }}
              />
              <span className="text-gl-text font-mono text-[11.5px] font-semibold">
                {range.cidr}
              </span>
              <span className="text-gl-text-muted text-[12px]">
                {range.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
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

/** Rows shown in full; the rest of `defects` fades out underneath the summary. */
const REGISTER_ROWS = 5;

const SEVERITY_FILL: Record<string, string> = {
  critical: "bg-gl-danger",
  high: "bg-gl-danger/55",
  medium: "bg-gl-warning",
  low: "bg-gl-text-muted",
};

function RegisterPreview({
  defects,
  counts,
  total,
  href,
}: {
  defects: FeaturedTrack["spotlight"];
  counts: FeaturedTrack["severityCounts"];
  total: number;
  href: string;
}) {
  const shown = Math.min(REGISTER_ROWS, defects.length);
  const more = total - shown;
  return (
    <div className="flex flex-1 flex-col">
      <div className="border-gl-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
        <span className="text-gl-text-muted text-[12.5px]">
          Most severe first
        </span>
        <span className="text-gl-text-muted font-mono text-[11px] tabular-nums">
          {shown} of {total} shown
        </span>
      </div>

      {/* The list keeps going: the rows past the first five dissolve under the summary. */}
      <ol className="divide-gl-border flex-1 divide-y [mask-image:linear-gradient(to_bottom,#000_58%,transparent_96%)]">
        {defects.map((d, i) => (
          <li
            key={d.id}
            aria-hidden={i >= shown ? true : undefined}
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

      {more > 0 && (
        <div className="relative z-10 -mt-16 px-5 pb-5">
          <div className="border-gl-border bg-gl-surface shadow-gl-lg flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[10px] border px-4 py-3.5">
            <div className="min-w-[200px] flex-1">
              <p className="text-gl-text text-[13.5px] font-semibold">
                {more} more below, {total} in the register
              </p>
              <div
                aria-hidden="true"
                className="bg-gl-bg-subtle mt-2.5 flex h-1.5 gap-px overflow-hidden rounded-full"
              >
                {counts
                  .filter((c) => c.count > 0)
                  .map((c) => (
                    <span
                      key={c.severity}
                      className={SEVERITY_FILL[c.severity]}
                      style={{ width: `${(c.count / total) * 100}%` }}
                    />
                  ))}
              </div>
              <ul className="text-gl-text-muted mt-2 flex flex-wrap gap-x-3.5 gap-y-1 font-mono text-[11px]">
                {counts
                  .filter((c) => c.count > 0)
                  .map((c) => (
                    <li key={c.severity} className="inline-flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className={cn("size-1.5 rounded-full", SEVERITY_FILL[c.severity])}
                      />
                      <span className="text-gl-text tabular-nums">{c.count}</span>
                      {c.severity}
                    </li>
                  ))}
              </ul>
            </div>
            <ButtonLink href={href} size="sm" trailing={<IconArrow size={12} />}>
              All {total} defects
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
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
