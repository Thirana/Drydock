"use client";

import { useId, type ReactNode } from "react";
import { ToggleChip } from "@/components/ui/controls";
import { cn } from "@/lib/utils";

/*
 * Small controls and read-outs shared by the course widgets, so every widget
 * speaks the same vocabulary: outlined choices filled in ink, plain selects,
 * label/value lists, numbered steps and a one-sentence outcome.
 */

/** Label and value pairs, values in mono. */
export function KeyValues({
  items,
  className,
}: {
  items: [label: ReactNode, value: ReactNode, sans?: boolean][];
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid grid-cols-1 gap-x-6 gap-y-1.5 text-[15px] sm:grid-cols-[minmax(0,210px)_minmax(0,1fr)]",
        className,
      )}
    >
      {items.map(([label, value, sans], i) => (
        <div key={i} className="contents">
          <dt className="text-ink-muted max-sm:mt-2">{label}</dt>
          <dd className={cn("text-ink", sans ? "text-pretty" : "font-mono text-[14.5px] break-words")}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** What happens, in order. */
export function Steps({ children }: { children: ReactNode[] }) {
  return (
    <ol className="text-ink-body ml-5 list-decimal space-y-1.5 text-[15.5px] leading-[1.55] marker:font-mono marker:text-[13px] marker:text-ink-faint [&_code]:bg-code [&_code]:text-ink [&_code]:rounded-[2px] [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.88em]">
      {children.map((step, i) => (
        <li key={i} className="pl-1 text-pretty">
          {step}
        </li>
      ))}
    </ol>
  );
}

/** One sentence that says how it turned out. Ink, never green or red. */
export function Outcome({ children }: { children: ReactNode }) {
  return (
    <p className="text-ink text-[16.5px] leading-[1.55] font-semibold text-pretty">
      {children}
    </p>
  );
}

/** A row of exclusive choices: outlined, the chosen one filled in ink. */
export function Choices<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: ReactNode }[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <ToggleChip
          key={String(o.value)}
          active={o.value === value}
          onClick={() => onChange(o.value)}
          className="text-[14px]"
        >
          {o.label}
        </ToggleChip>
      ))}
    </div>
  );
}

/** A native select, labelled, styled like the text fields. */
export function Select<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  const id = useId();
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-ink-muted text-[14px]">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="border-rule-strong bg-ground text-ink hover:border-ink-faint h-11 min-w-[220px] rounded-[2px] border px-3 text-[15px] transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** A plain action: outlined, or filled in ink for the main one. */
export function Action({
  children,
  onClick,
  primary,
}: {
  children: ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 cursor-pointer items-center rounded-[2px] border px-3.5 text-[15px] transition-colors",
        primary
          ? "border-ink bg-ink text-ground hover:border-accent hover:bg-accent hover:text-accent-ink font-semibold"
          : "border-rule-strong text-ink hover:border-ink hover:bg-sunk",
      )}
    >
      {children}
    </button>
  );
}

/** The small print under a widget. */
export function WidgetNote({ children }: { children: ReactNode }) {
  return (
    <p className="text-ink-muted mt-4 max-w-[72ch] text-[14.5px] leading-[1.55] text-pretty [&_code]:font-mono [&_code]:text-[0.9em]">
      {children}
    </p>
  );
}
