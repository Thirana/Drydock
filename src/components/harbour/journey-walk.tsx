"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { DefectLink } from "@/components/architecture/defect-link";
import { Swatch } from "@/components/learn/swatch";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconChevronDown,
  IconX,
} from "@/components/ui/icons";
import { useHarbourState } from "@/hooks/use-harbour-state";
import {
  hasSwitched,
  journeyPath,
  visibleHops,
} from "@/lib/architecture/journeys";
import type { Journey, JourneyHop, Packet } from "@/lib/architecture/types";
import { cn } from "@/lib/utils";
import type { Walk } from "./journey-drawing-kit";
import { JourneyDrawing } from "./journey-drawings";
import { StateSwitch } from "./state-switch";

const NONE: ReadonlySet<string> = new Set();

/** The drawing's key: the GCP course's hues, then the red this case study adds. */
const KEY = [
  { hue: "teal", label: "Your VPC" },
  { hue: "plum", label: "Run by Google" },
  { hue: "amber", label: "Firewall rules" },
  { hue: "green", label: "Allowed traffic" },
  { hue: "fault", label: "Where it breaks" },
] as const;

/** A hop's identity across the two states: its stop and its place there. */
const hopKey = (hop: JourneyHop) => `${hop.at ?? ""}|${hop.where}`;

/**
 * The open hop. After the switch flips state the same hop may not exist, so
 * the first hop at the same stop stands in for it.
 */
function findOpen(hops: JourneyHop[], key: string | null) {
  if (!key) return -1;
  const exact = hops.findIndex((h) => hopKey(h) === key);
  if (exact >= 0) return exact;
  const at = key.split("|")[0];
  return at ? hops.findIndex((h) => h.at === at) : -1;
}

const motion = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";

/**
 * One journey, walked hop by hop. The switch reads it as found or fixed: the
 * drawing, the hops, the route and the packet all follow. The hops are an
 * accordion, one open at a time, so the list stays short enough to read
 * beside the drawing; the open hop is outlined in the drawing, marked on the
 * route, and its packet shown under it. Once the drawing scrolls away, a
 * small copy of it joins the route.
 */
export function JourneyWalk({
  journey,
  defectIds,
  labels,
  defects,
}: {
  journey: Journey;
  /** Every defect in the case study: the fixed state closes them all. */
  defectIds: string[];
  /** Stop id → its name, for the route. */
  labels: Record<string, string>;
  defects: Record<string, { title: string; phase: number }>;
}) {
  const [state, setState] = useHarbourState();
  const fixed = state === "fixed";
  const all = useMemo(() => new Set(defectIds), [defectIds]);
  const closed = (fixed ? all : NONE) as Set<string>;

  const hops = visibleHops(journey, closed);
  const path = journeyPath(journey, closed);
  const failing = new Set(hops.flatMap((h) => (h.fails && h.at ? [h.at] : [])));
  const order = new Map(path.map((id, i) => [id, i + 1]));
  const failures = hops.filter((h) => h.fails).length;
  const switched = hasSwitched(journey, closed);

  const [openKey, setOpenKey] = useState<string | null>(null);
  const open = findOpen(hops, openKey);
  const listRef = useRef<HTMLOListElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const reveal = useRef<"scroll" | "focus" | null>(null);
  const [figureInView, setFigureInView] = useState(true);
  const ids = useId();

  /** Opens hop i. `focus` moves focus to its heading: the button that asked is about to go. */
  const show = (i: number, focus = false) => {
    reveal.current = focus ? "focus" : "scroll";
    setOpenKey(hopKey(hops[i]));
  };
  const toggle = (i: number) => {
    if (i === open) return setOpenKey(null);
    show(i);
  };
  // A stop can hold several hops: clicking it again moves to the next one there.
  const pickStop = (id: string) => {
    const here = hops.flatMap((h, i) => (h.at === id ? [i] : []));
    if (!here.length) return;
    const k = here.indexOf(open);
    show(here[k < 0 ? 0 : (k + 1) % here.length]);
  };

  // Keep the hop just opened in view, scrolling no further than it takes.
  useEffect(() => {
    const how = reveal.current;
    if (!how || open < 0) return;
    reveal.current = null;
    const item = listRef.current?.querySelector(`[data-hop="${open}"]`);
    item?.scrollIntoView({ block: "nearest", behavior: motion() });
    if (how === "focus")
      item
        ?.querySelector<HTMLButtonElement>("[data-hop-head]")
        ?.focus({ preventScroll: true });
  }, [open]);

  // When most of the drawing has scrolled away, the aside carries a small copy.
  useEffect(() => {
    const el = figureRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFigureInView(entry.intersectionRatio >= 0.6),
      { threshold: [0, 0.6, 1], rootMargin: "-49px 0px 0px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Arrow keys move between hop headings, as in any accordion.
  const onHeadKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const heads =
      listRef.current?.querySelectorAll<HTMLButtonElement>("[data-hop-head]");
    if (!heads?.length) return;
    const to =
      e.key === "ArrowDown"
        ? Math.min(i + 1, heads.length - 1)
        : e.key === "ArrowUp"
          ? Math.max(i - 1, 0)
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? heads.length - 1
              : -1;
    if (to < 0) return;
    e.preventDefault();
    heads[to].focus();
  };

  const walk: Walk = {
    fixed,
    closed,
    failing,
    order,
    current: open >= 0 ? hops[open].at : undefined,
    onPick: pickStop,
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
      <section
        aria-label="As found or fixed"
        className="border-rule mt-10 border-t pt-6"
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <StateSwitch value={state} onChange={setState} />
          <p
            aria-live="polite"
            className={cn(
              "inline-flex items-center gap-1.5 text-[16px] font-semibold",
              failures ? "text-fault" : "text-ink",
            )}
          >
            {failures ? (
              <>
                <IconX size={10} />
                {failures} {failures === 1 ? "step fails" : "steps fail"}
              </>
            ) : (
              <>
                <IconCheck size={12} className="text-green" />
                Every step succeeds
              </>
            )}
          </p>
        </div>
        <div key={state} className="animate-fade-in mt-4 max-w-[68ch]">
          <p className="text-ink text-[18px] leading-[1.6] text-pretty">
            {fixed ? journey.outcome.fixed : journey.outcome.found}
          </p>
          {switched && journey.noteAfter && (
            <p className="text-ink-body mt-3 grid grid-cols-[28px_minmax(0,1fr)] gap-x-2 text-[16px] leading-[1.6]">
              <span
                aria-hidden="true"
                className="text-accent font-mono text-[15px] font-bold"
              >
                !?
              </span>
              {journey.noteAfter}
            </p>
          )}
        </div>
      </section>

      <figure data-pagefind-ignore className="mt-10">
        <figcaption className="flex flex-wrap items-baseline gap-x-3 pb-3">
          <span className="text-ink text-[16px] font-bold">The path</span>
          <span className="text-ink-muted font-mono text-[14px]">
            {switched && journey.summaryAfter
              ? journey.summaryAfter
              : journey.summary}
          </span>
        </figcaption>
        <div
          ref={figureRef}
          className="dd-fig border-rule bg-ground overflow-x-auto rounded-[2px] border p-4 sm:p-5"
        >
          <JourneyDrawing slug={journey.slug} walk={walk} />
        </div>
        <div className="mt-3 space-y-2">
          <ul className="text-ink-muted flex flex-wrap gap-x-5 gap-y-1.5 text-[14px]">
            {KEY.map(({ hue, label }) => (
              <li key={hue} className="inline-flex items-center gap-2">
                <Swatch hue={hue} />
                {label}
              </li>
            ))}
          </ul>
          <p className="text-ink-muted max-w-[72ch] text-[15px] leading-[1.55] text-pretty">
            Only what this journey touches. Numbers follow the route - click a
            numbered box to open its hop below. Red dashed lines are paths that
            should not exist or do not work, the open hop is outlined in blue,
            and struck defect IDs are closed.
          </p>
          <p className="text-ink-muted text-[14px] md:hidden">
            Wide by design - scroll it sideways.
          </p>
        </div>
      </figure>

      <div className="mt-12 grid gap-x-14 pb-16 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 className="dd-head text-ink text-[26px] sm:text-[30px]">
              Hop by hop
            </h2>
            <p className="text-ink-muted text-[15px]">
              {hops.length} hops · open one at a time
            </p>
          </div>
          <ol ref={listRef} className="border-rule mt-5 border-t">
            {hops.map((hop, i) => (
              <Hop
                key={hopKey(hop)}
                id={`${ids}-${i}`}
                index={i}
                hop={hop}
                number={hop.at ? order.get(hop.at) : undefined}
                open={i === open}
                fixed={fixed}
                defects={defects}
                prev={hops[i - 1]}
                next={hops[i + 1]}
                onToggle={() => toggle(i)}
                onGo={(d) => show(i + d, true)}
                onKey={(e) => onHeadKey(e, i)}
              />
            ))}
          </ol>
        </div>
        <aside aria-label="Where the packet is" className="hidden lg:block">
          <div className="sticky top-16 max-h-[calc(100dvh-80px)] overflow-y-auto pt-1 pb-2">
            {!figureInView && (
              <div className="animate-fade-in mb-6" aria-hidden="true">
                <p className="dd-label text-ink-muted">The path</p>
                <div className="dd-fig dd-mini border-rule bg-ground mt-2 rounded-[2px] border p-2.5">
                  <JourneyDrawing
                    slug={journey.slug}
                    walk={{ ...walk, mini: true }}
                  />
                </div>
              </div>
            )}
            <Route
              path={path}
              labels={labels}
              failing={failing}
              current={walk.current}
              hasHops={(id) => hops.some((h) => h.at === id)}
              onPick={pickStop}
            />
            <PacketCard hops={hops} at={open} />
          </div>
        </aside>
      </div>
    </div>
  );
}

/** One hop: a heading that opens it, and what it does, why, and the packet. */
function Hop({
  id,
  index,
  hop,
  number,
  open,
  fixed,
  defects,
  prev,
  next,
  onToggle,
  onGo,
  onKey,
}: {
  id: string;
  index: number;
  hop: JourneyHop;
  number?: number;
  open: boolean;
  fixed: boolean;
  defects: Record<string, { title: string; phase: number }>;
  prev?: JourneyHop;
  next?: JourneyHop;
  onToggle: () => void;
  onGo: (step: -1 | 1) => void;
  onKey: (e: KeyboardEvent<HTMLButtonElement>) => void;
}) {
  const changedBy = fixed ? hop.afterClosed : undefined;
  return (
    <li
      data-hop={index}
      className={cn(
        "border-rule scroll-mt-16 scroll-mb-6 border-b border-l-2 transition-colors duration-300",
        open ? "border-l-accent" : "border-l-transparent",
      )}
    >
      <h3>
        <button
          type="button"
          id={`${id}-head`}
          data-hop-head
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          onKeyDown={onKey}
          className="group hover:bg-sunk/60 grid w-full grid-cols-[30px_minmax(0,1fr)_auto] items-start gap-x-3 py-3.5 pr-2 pl-4 text-left transition-colors duration-150"
        >
          <span
            className={cn(
              "pt-[1px] font-mono text-[16px] font-bold",
              number === undefined
                ? "text-ink-faint"
                : hop.fails
                  ? "text-fault"
                  : open
                    ? "text-accent"
                    : "text-ink",
            )}
          >
            {number !== undefined ? `${number}.` : "·"}
          </span>
          <span className="min-w-0">
            <span
              className={cn(
                "block font-mono text-[14.5px] font-semibold",
                hop.fails ? "text-fault" : "text-ink",
              )}
            >
              {hop.where}
            </span>
            <span
              className={cn(
                "mt-0.5 block text-[16.5px] leading-[1.45]",
                open ? "text-ink" : "text-ink-body line-clamp-1",
              )}
            >
              {hop.what}
            </span>
          </span>
          <span className="flex items-center gap-2.5 pt-[3px]">
            {hop.fails ? (
              <>
                <IconX size={10} className="text-fault" />
                <span className="sr-only">Fails here</span>
              </>
            ) : changedBy ? (
              <>
                <IconCheck size={12} className="text-green" />
                <span className="sr-only">Fixed by {changedBy}</span>
              </>
            ) : null}
            <IconChevronDown
              size={14}
              className={cn(
                "text-ink-muted group-hover:text-ink transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </span>
        </button>
      </h3>
      {open && (
        <div
          id={`${id}-panel`}
          role="region"
          aria-labelledby={`${id}-head`}
          // Lines up with the heading text: 16px padding, 30px number, 12px gap.
          className="animate-fade-in pr-2 pb-5 pl-[58px]"
        >
          <p className="text-ink-body text-[16px] leading-[1.6]">{hop.why}</p>
          {(hop.fails || changedBy) && (
            <div className="mt-2.5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              {hop.fails && (
                <span className="text-fault inline-flex items-center gap-1.5 text-[15px] font-bold">
                  <IconX size={9} /> Fails here
                </span>
              )}
              {hop.fixedBy && (
                <span className="text-ink-muted text-[15px]">
                  <DefectLink id={hop.fixedBy} /> {defects[hop.fixedBy]?.title}
                </span>
              )}
              {changedBy && (
                <span className="text-green inline-flex items-baseline gap-1.5 text-[15px] font-semibold">
                  <IconCheck size={11} className="self-center" />
                  Fixed by
                  <DefectLink id={changedBy} />
                </span>
              )}
            </div>
          )}
          {hop.packet && (
            <PacketLines
              packet={hop.packet}
              className="border-rule mt-3 border-t pt-3 lg:hidden"
            />
          )}
          {(prev || next) && (
            <div className="mt-4 flex flex-wrap justify-between gap-x-6 gap-y-2">
              {prev ? (
                <button
                  type="button"
                  onClick={() => onGo(-1)}
                  className="text-ink-muted hover:text-ink inline-flex items-center gap-1.5 text-[15px] transition-colors"
                >
                  <IconArrowLeft size={13} />
                  <span>
                    Previous <span className="sr-only">hop</span>
                  </span>
                </button>
              ) : (
                <span />
              )}
              {next && (
                <button
                  type="button"
                  onClick={() => onGo(1)}
                  className="text-accent inline-flex items-center gap-1.5 text-[15px] font-semibold hover:underline hover:underline-offset-4"
                >
                  Next: <span className="font-mono">{next.where}</span>
                  <IconArrowRight size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  );
}

/** The journey's stops as a line down the page, the packet's place on it in blue. Each stop opens its hop. */
function Route({
  path,
  labels,
  failing,
  current,
  hasHops,
  onPick,
}: {
  path: string[];
  labels: Record<string, string>;
  failing: ReadonlySet<string>;
  current?: string;
  hasHops: (id: string) => boolean;
  onPick: (id: string) => void;
}) {
  const here = current ? path.indexOf(current) : -1;
  return (
    <div>
      <p className="dd-label text-ink-muted">Where the packet is</p>
      <ol className="mt-3">
        {path.map((id, i) => {
          const last = i === path.length - 1;
          const isHere = i === here;
          const broken = failing.has(id);
          const label = (
            <span
              className={cn(
                "pt-[1px] pb-3.5 text-left text-[15px] leading-[1.35] transition-colors duration-300",
                isHere
                  ? "text-accent font-bold"
                  : broken
                    ? "text-fault font-semibold"
                    : "text-ink-body",
              )}
            >
              {labels[id] ?? id}
            </span>
          );
          return (
            <li
              key={id}
              aria-current={isHere ? "step" : undefined}
              className="relative grid grid-cols-[22px_minmax(0,1fr)] items-start gap-x-3"
            >
              {!last && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-[22px] bottom-0 left-[10.5px] w-px transition-colors duration-300",
                    i < here ? "bg-accent" : "bg-rule-strong",
                  )}
                />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  "relative grid size-[22px] place-items-center rounded-full border font-mono text-[11.5px] font-bold transition-colors duration-300",
                  isHere
                    ? "border-accent bg-accent text-ground"
                    : broken
                      ? "border-fault text-fault bg-ground"
                      : i < here
                        ? "border-accent text-accent bg-ground"
                        : "border-rule-strong text-ink-muted bg-ground",
                )}
              >
                {i + 1}
              </span>
              {hasHops(id) ? (
                <button
                  type="button"
                  onClick={() => onPick(id)}
                  className="hover:[&>span]:text-ink flex hover:[&>span]:underline hover:[&>span]:underline-offset-4"
                >
                  {label}
                </button>
              ) : (
                label
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** The packet as the open hop leaves it: the last one any hop up to there described. */
function PacketCard({ hops, at }: { hops: JourneyHop[]; at: number }) {
  let i = at;
  while (i >= 0 && !hops[i].packet) i--;
  const packet = i >= 0 ? hops[i].packet : undefined;
  let j = i - 1;
  while (j >= 0 && !hops[j].packet) j--;
  const before = j >= 0 ? hops[j].packet : undefined;

  return (
    <div className="border-ink mt-6 border-t-2 pt-3">
      <p className="dd-label text-ink-muted">The packet</p>
      {packet ? (
        <div key={i} className="animate-fade-in">
          <p className="text-ink-muted mt-1 text-[14px]">
            as it leaves <span className="text-ink">{hops[i].where}</span>
          </p>
          <PacketLines packet={packet} before={before} className="mt-3" />
        </div>
      ) : (
        <p className="text-ink-muted mt-2 text-[15px] leading-[1.5]">
          {at < 0
            ? "Open a hop, and the packet as it leaves that hop appears here."
            : "No packet has left a hop yet. Open the next one."}
        </p>
      )}
    </div>
  );
}

const FIELDS: { key: keyof Packet; label: string }[] = [
  { key: "from", label: "From" },
  { key: "to", label: "To" },
  { key: "carries", label: "Carrying" },
];

/** A packet as three short lines; any line that changed since the last packet is blue. */
function PacketLines({
  packet,
  before,
  className,
}: {
  packet: Packet;
  before?: Packet;
  className?: string;
}) {
  return (
    <dl
      className={cn("grid grid-cols-[72px_minmax(0,1fr)] gap-y-2", className)}
    >
      {FIELDS.map(({ key, label }) => {
        const value = packet[key];
        if (!value) return null;
        const changed = before && before[key] !== value;
        return (
          <div key={key} className="contents">
            <dt className="text-ink-muted pt-[1px] text-[13.5px]">{label}</dt>
            <dd
              className={cn(
                "font-mono text-[13.5px] leading-[1.45] break-words",
                changed ? "text-accent font-semibold" : "text-ink",
              )}
            >
              {value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
