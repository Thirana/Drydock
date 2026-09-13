import type { ReactNode } from "react";
import { toneColor } from "@/lib/architecture/tone";
import type { Tone } from "@/lib/architecture/types";
import { cn } from "@/lib/utils";

/**
 * Content building blocks available in every MDX file (see src/mdx-components.tsx).
 * Wrappers render <div>, not <p>: MDX turns multi-line children into paragraphs.
 */

export function Hero({ children }: { children: ReactNode }) {
  return (
    <div className="border-gl-border bg-gl-surface shadow-gl-lg relative overflow-hidden rounded-2xl border p-6 sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(46,184,160,0.09) 0%, transparent 65%)",
        }}
      />
      <div className="[&>p:first-of-type]:text-gl-text relative z-10 [&>p:first-of-type]:text-[16.5px] sm:[&>p:first-of-type]:text-[17px]">
        {children}
      </div>
    </div>
  );
}

export function Lede({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose text-gl-text-muted mb-8 max-w-[680px] text-[16px] leading-[1.6] text-pretty sm:text-[17px] [&>p+p]:mt-3">
      {children}
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose border-gl-primary text-gl-text-muted [&_code]:text-gl-text my-6 max-w-[80ch] border-l-2 pl-4 text-[14px] leading-[1.7] [&_code]:font-mono [&_code]:text-[0.9em]">
      {children}
    </div>
  );
}

export function Caption({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose text-gl-text-muted mt-4 max-w-[80ch] text-[12.5px] leading-relaxed">
      {children}
    </div>
  );
}

export function Columns({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
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
    <div className="border-gl-border bg-gl-surface shadow-gl rounded-xl border p-5">
      <h3 className="text-gl-text flex items-center gap-2 text-[15px] font-bold tracking-[-0.015em]">
        <span
          aria-hidden="true"
          className="bg-gl-primary h-3.5 w-[3px] rounded-full"
        />
        {title}
      </h3>
      <div className="text-gl-text-muted mt-2 text-[13.5px] leading-[1.6] text-pretty">
        {children}
      </div>
    </div>
  );
}

export function AddressBlocks({ children }: { children: ReactNode }) {
  return (
    <ul className="not-prose my-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
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
    <li className="border-gl-border bg-gl-surface shadow-gl rounded-xl border p-5">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="size-2.5 shrink-0 rounded-full"
          style={{ background: toneColor(tone) }}
        />
        <span className="text-gl-text font-mono text-[20px] leading-none font-bold tracking-[-0.02em]">
          {cidr}
        </span>
      </div>
      <div className="text-gl-text-muted mt-2.5 text-[13px] leading-snug">
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
        "inline-flex items-center rounded-full px-2 py-1 text-[11px] leading-none font-semibold",
        tone === "good"
          ? "bg-gl-success-soft text-gl-success"
          : "bg-gl-danger-soft text-gl-danger",
      )}
    >
      {children}
    </span>
  );
}

export function PhaseTag({ children }: { children: ReactNode }) {
  return (
    <span className="border-gl-border bg-gl-surface-2 text-gl-text-muted inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] leading-none font-medium whitespace-nowrap">
      {children}
    </span>
  );
}
