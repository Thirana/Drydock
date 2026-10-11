import type { ReactNode } from "react";
import type { Tone } from "@/lib/architecture/types";
import { IconCheck, IconX } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * Content building blocks available in every MDX file (see src/mdx-components.tsx).
 * Wrappers render <div>, not <p>: MDX turns multi-line children into paragraphs.
 */

/** The opening of a long-form view: a large first paragraph, then plain prose. */
export function Hero({ children }: { children: ReactNode }) {
  return (
    <div className="[&>p:first-of-type]:text-ink mb-4 [&>p:first-of-type]:mb-6 [&>p:first-of-type]:max-w-[34em] [&>p:first-of-type]:text-[21px] [&>p:first-of-type]:leading-[1.5]">
      {children}
    </div>
  );
}

export function Lede({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose text-ink-body mb-8 max-w-[62ch] text-[19px] leading-[1.55] text-pretty [&>p+p]:mt-3">
      {children}
    </div>
  );
}

/** An annotator's aside: set small, marked, and indented from the text. */
export function Note({ children }: { children: ReactNode }) {
  return (
    <aside className="not-prose my-8 grid max-w-[68ch] grid-cols-[28px_minmax(0,1fr)] gap-x-2">
      <span
        aria-hidden="true"
        className="text-ink pt-[3px] font-mono text-[15px] font-bold"
      >
        !?
      </span>
      <div className="dd-note text-ink-body [&_code]:bg-code [&_code]:text-ink text-[16.5px] leading-[1.6] [&_code]:rounded-[2px] [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.88em]">
        <span className="sr-only">Note: </span>
        {children}
      </div>
    </aside>
  );
}

export function Caption({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose text-ink-muted mt-3 max-w-[80ch] text-[15px] leading-relaxed">
      {children}
    </div>
  );
}

/** Short topics in a ruled grid: no boxes, a hairline over each. */
export function Columns({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-8 grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}

export function Column({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-rule border-t pt-4 pb-7">
      <h3 className="text-ink text-[18px] font-bold">{title}</h3>
      <div className="text-ink-body mt-1.5 text-[16px] leading-[1.6] text-pretty">
        {children}
      </div>
    </div>
  );
}

/** Positions argued at length: the claim, then the reasoning, marked as the author's. */
export function Arguments({ children }: { children: ReactNode }) {
  return <dl className="not-prose my-8 max-w-[860px]">{children}</dl>;
}

export function Argument({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-rule grid grid-cols-[28px_minmax(0,1fr)] gap-x-2 border-t py-6">
      <span
        aria-hidden="true"
        className="text-ink pt-[2px] font-mono text-[16px] font-bold"
      >
        !?
      </span>
      <div>
        <dt className="text-ink text-[20px] leading-[1.3] font-bold text-balance">
          {title}
        </dt>
        <dd className="text-ink-body mt-2 max-w-[66ch] text-[17px] leading-[1.62] text-pretty">
          {children}
        </dd>
      </div>
    </div>
  );
}

export function AddressBlocks({ children }: { children: ReactNode }) {
  return (
    <ul className="not-prose my-8 grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </ul>
  );
}

export function AddressBlock({
  cidr,
  tone,
  children,
}: {
  cidr: string;
  tone: Tone;
  children: ReactNode;
}) {
  return (
    <li className="border-rule border-t pt-4 pb-7">
      <span
        className={cn(
          "block font-mono text-[22px] leading-none font-bold",
          tone === "danger" ? "text-fault" : "text-ink",
        )}
      >
        {cidr}
      </span>
      <div className="text-ink-body mt-2 text-[16px] leading-[1.55]">
        {children}
      </div>
    </li>
  );
}

export function Status({
  tone,
  children,
}: {
  tone: "good" | "bad";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[15px] font-semibold whitespace-nowrap",
        tone === "good" ? "text-ink" : "text-fault",
      )}
    >
      {tone === "good" ? <IconCheck size={11} /> : <IconX size={10} />}
      {children}
    </span>
  );
}

export function PhaseTag({ children }: { children: ReactNode }) {
  return (
    <span className="text-ink font-mono text-[15px] font-semibold whitespace-nowrap">
      {children}
    </span>
  );
}
