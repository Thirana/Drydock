import { Children, type CSSProperties, type ReactNode } from "react";
import type { Hue } from "@/lib/content/types";
import { cn } from "@/lib/utils";

const HUE_FILL: Record<Hue, string> = {
  plum: "border-plum bg-plum-soft",
  teal: "border-teal bg-teal-soft",
  green: "border-green bg-green-soft",
  amber: "border-amber bg-amber-soft",
};

/*
 * Small static layouts the fundamentals notes use between paragraphs:
 * side-by-side notes, packet layouts, hop chains, address ranges, header
 * fields. Drawn with hairlines and ink; the words carry the meaning.
 */

/** Two or three short notes side by side, each under a hairline. */
export function Cols({ n = 2, children }: { n?: 2 | 3; children: ReactNode }) {
  return (
    <div
      className={cn(
        "not-prose my-8 grid max-w-[860px] grid-cols-1 gap-x-10",
        n === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3",
      )}
    >
      {children}
    </div>
  );
}

export function Col({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-rule border-t pt-4 pb-6">
      <h4 className="text-ink text-[17px] font-bold">{title}</h4>
      <div className="text-ink-body mt-1.5 space-y-2 text-[16px] leading-[1.6] text-pretty [&_code]:font-mono [&_code]:text-[0.9em]">
        {children}
      </div>
    </div>
  );
}

/** A few related terms, set as a quiet line rather than chips. */
export function Tags({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  return (
    <p className="text-ink-muted text-[14.5px]">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span aria-hidden="true"> · </span>}
          {item}
        </span>
      ))}
    </p>
  );
}

/** A tiny drawing inside a note: a waveform, a signal. No frame. */
export function Sketch({ children }: { children: ReactNode }) {
  return (
    <div className="text-ink-muted my-2 h-11 [&_path]:fill-none [&_path]:stroke-current [&_path]:[stroke-width:2] [&_svg]:h-11 [&_svg]:w-full">
      {children}
    </div>
  );
}

/** One line that sums a section up: an equation, a rule. */
export function Equation({ children }: { children: ReactNode }) {
  return (
    <p className="not-prose text-ink my-8 max-w-[760px] text-[20px] leading-[1.45] font-semibold text-balance sm:text-[22px]">
      {children}
    </p>
  );
}

/**
 * A group of sections inside a long chapter. A heavy rule and a solid ink
 * letter, so a new part is plain to see while scrolling; ink, not a hue,
 * since hues belong to the drawings.
 */
export function Part({ n, children }: { n: string; children: ReactNode }) {
  return (
    <p className="dd-part not-prose border-ink mt-20 mb-2 flex max-w-[760px] items-start gap-4 border-t-[3px] pt-6">
      <span
        aria-hidden="true"
        className="bg-ink text-ground grid size-12 shrink-0 place-items-center rounded-[2px] font-mono text-[24px] leading-none font-bold"
      >
        {n}
      </span>
      <span className="min-w-0">
        <span className="text-ink-muted block font-mono text-[13.5px] font-bold tracking-[0.08em] uppercase">
          Part {n}
        </span>
        <span className="text-ink mt-0.5 block text-[26px] leading-[1.2] font-bold text-balance">
          {children}
        </span>
      </span>
    </p>
  );
}

/**
 * A row of proportional segments: a packet's layers, a byte stream, a
 * window. Widths are relative weights; labels sit inside; a hue says which
 * layer a segment belongs to, as in the drawings.
 */
export function Segments({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <div data-pagefind-ignore className="not-prose my-8 max-w-[860px] overflow-x-auto">
      {label && <p className="text-ink-muted mb-2 text-[14.5px]">{label}</p>}
      <div className="flex min-w-[560px]">{children}</div>
    </div>
  );
}

export function Seg({
  w = 1,
  gap,
  dashed,
  muted,
  hue,
  children,
}: {
  w?: number;
  hue?: Hue;
  /** Empty space, part of the layout but not a segment. */
  gap?: boolean;
  dashed?: boolean;
  muted?: boolean;
  children?: ReactNode;
}) {
  const style: CSSProperties = { flex: `${w} 1 0` };
  if (gap) return <span aria-hidden="true" style={style} />;
  return (
    <span
      style={style}
      className={cn(
        "text-ink -ml-px flex min-h-11 min-w-0 items-center justify-center border px-2 py-1.5 text-center font-mono text-[12.5px] leading-[1.3] first:ml-0",
        hue ? cn(HUE_FILL[hue], "relative") : "border-ink-faint bg-ground",
        dashed && "border-dashed",
        muted && "text-ink-faint",
      )}
    >
      {children}
    </span>
  );
}

/** A path through routers, hop by hop. */
export function Hops({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  return (
    <ol data-pagefind-ignore className="not-prose my-8 flex max-w-[860px] flex-wrap items-center gap-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-center">
          {i > 0 && (
            <svg
              aria-hidden="true"
              width="28"
              height="10"
              viewBox="0 0 28 10"
              className="text-ink-faint mx-1 shrink-0"
            >
              <path d="M2 5h22M20 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          )}
          {item}
        </li>
      ))}
    </ol>
  );
}

export function Hop({
  sub,
  state,
  children,
}: {
  sub?: string;
  /** "on": the hop being described; "next": the one it hands to. */
  state?: "on" | "next";
  children: ReactNode;
}) {
  return (
    <span
      aria-current={state === "on" ? "step" : undefined}
      className={cn(
        "inline-flex min-h-11 flex-col justify-center rounded-[2px] border px-3 py-1.5 text-[15px] leading-[1.3]",
        state === "on"
          ? "border-accent text-accent font-semibold"
          : state === "next"
            ? "border-ink-faint text-ink border-dashed"
            : "border-ink-faint text-ink",
      )}
    >
      {children}
      {sub && <span className="text-ink-muted font-mono text-[12px]">{sub}</span>}
    </span>
  );
}

/** One network's addresses laid end to end: the special ones, the router, the devices. */
export function Range({ children }: { children: ReactNode }) {
  return (
    <div data-pagefind-ignore className="not-prose my-8 max-w-[860px] overflow-x-auto">
      <div className="flex min-w-[560px]">{children}</div>
    </div>
  );
}

export function RangePart({
  w,
  kind,
  sub,
  children,
}: {
  /** A CSS width such as "13%"; the devices part takes the rest. */
  w?: string;
  kind: "special" | "router" | "devices";
  sub?: string;
  children: ReactNode;
}) {
  return (
    <span
      style={w ? { width: w, flex: "none" } : { flex: "1 1 0" }}
      className={cn(
        "border-ink-faint -ml-px flex min-h-14 flex-col justify-center border px-2.5 py-2 first:ml-0",
        kind === "special" && "bg-sunk",
        kind === "router" && "border-teal bg-teal-soft z-10",
      )}
    >
      <span className="text-ink font-mono text-[14px] font-semibold">{children}</span>
      {sub && <span className="text-ink-muted text-[13px] leading-[1.35]">{sub}</span>}
    </span>
  );
}

/** Header fields as label and value; the ones that changed are said to have changed. */
export function Fields({ children }: { children: ReactNode }) {
  return (
    <dl className="not-prose border-rule my-8 grid max-w-[860px] grid-cols-1 border-t sm:grid-cols-2 sm:gap-x-10">
      {children}
    </dl>
  );
}

export function Field({
  label,
  changed,
  children,
}: {
  label: string;
  changed?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="border-rule border-b py-3">
      <dt className="text-ink-muted text-[14px]">{label}</dt>
      <dd className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
        <span className={cn("text-ink font-mono text-[15px]", changed && "font-bold")}>
          {children}
        </span>
        {changed && <span className="text-ink-muted text-[13px]">changed</span>}
      </dd>
    </div>
  );
}

/** A message written out line by line, each line with what it is for. */
export function Annotated({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose border-rule my-8 max-w-[860px] overflow-x-auto border-t">
      <div className="min-w-[560px]">{children}</div>
    </div>
  );
}

export function Line({
  note,
  blank,
  children,
}: {
  note?: string;
  blank?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="border-rule grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-x-6 border-b py-2.5">
      <span className={cn("font-mono text-[14px] break-all", blank ? "text-ink-faint" : "text-ink")}>
        {blank ? "(empty line)" : children}
      </span>
      <span className="text-ink-muted text-[14.5px] leading-[1.45]">{note}</span>
    </div>
  );
}
