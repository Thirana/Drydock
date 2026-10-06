"use client";

import type { ReactNode } from "react";
import { IconCheck, IconX } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { Action } from "../ui";

/*
 * Small pieces the GCP widgets share with each other, in the same vocabulary
 * as the fundamentals widgets: example buttons in mono, plain checkboxes,
 * ruled tables.
 */

/** A row of example values that fill an input. */
export function Examples({
  values,
  current,
  onPick,
  label = "Examples",
}: {
  values: string[];
  current: string;
  onPick: (value: string) => void;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {values.map((ex) => (
        <button
          key={ex}
          type="button"
          onClick={() => onPick(ex)}
          className={cn(
            "inline-flex min-h-9 cursor-pointer items-center rounded-[2px] border px-2.5 font-mono text-[13.5px] transition-colors",
            ex === current.trim() ? "border-ink bg-ink text-ground" : "border-rule-strong text-ink hover:border-ink hover:bg-sunk",
          )}
        >
          {ex}
        </button>
      ))}
    </div>
  );
}

/** A checkbox with its words. */
export function Check({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="text-ink-body flex cursor-pointer items-center gap-2.5 text-[15px]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-ink size-4 shrink-0" />
      <span>{children}</span>
    </label>
  );
}

/** The words over a group of controls. */
export function GroupLabel({ children }: { children: ReactNode }) {
  return <p className="text-ink-muted mb-2 text-[14px]">{children}</p>;
}

/**
 * A ruled table. `mono` names the columns set in mono; `marked` rows are the
 * answer (bold, highlighter on the first cell); `faded` rows are set aside.
 */
export function Table({
  head,
  rows,
  mono = [],
  marked,
  faded,
  minWidth = 560,
  className,
}: {
  head: ReactNode[];
  rows: ReactNode[][];
  mono?: number[];
  marked?: (i: number) => boolean;
  faded?: (i: number) => boolean;
  minWidth?: number;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-left" style={{ minWidth }}>
        <thead>
          <tr className="border-ink border-b">
            {head.map((h, i) => (
              <th key={i} className="text-ink py-2 pr-4 text-[14px] font-bold last:pr-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const on = marked?.(i);
            const off = faded?.(i);
            return (
              <tr key={i} className="border-rule border-b align-top">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={cn(
                      "py-2.5 pr-4 leading-[1.45] last:pr-0",
                      mono.includes(j) ? "font-mono text-[13.5px]" : "text-[15px]",
                      off ? "text-ink-faint" : "text-ink",
                      on && "font-semibold",
                    )}
                  >
                    {on && j === 0 ? <span className="dd-mark">{cell}</span> : cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Back and next through a walkthrough, with where you are. */
export function StepNav({
  k,
  count,
  onChange,
  noun = "step",
}: {
  k: number;
  count: number;
  onChange: (k: number) => void;
  noun?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Action onClick={() => onChange(Math.max(0, k - 1))}>← Back</Action>
      <Action primary onClick={() => onChange(Math.min(count - 1, k + 1))}>
        Next {noun} →
      </Action>
      <span className="text-ink-muted ml-2 font-mono text-[13px]">
        {noun} {k + 1} of {count}
      </span>
    </div>
  );
}

export type RunbookStep = [n: string, title: string, detail: string, check: string];

/**
 * A plan in phases: numbered steps down a rule, each with the check that must
 * pass before moving on.
 */
export function Runbook({ phases }: { phases: [name: string, steps: RunbookStep[]][] }) {
  return (
    <div className="space-y-6">
      {phases.map(([name, steps]) => (
        <section key={name}>
          <h4 className="text-ink-muted mb-2 text-[14px] font-semibold">{name}</h4>
          <ol className="border-rule border-t">
            {steps.map(([n, title, detail, check]) => (
              <li key={n} className="border-rule grid gap-x-5 gap-y-1 border-b py-3 sm:grid-cols-[36px_minmax(0,1fr)_minmax(0,240px)]">
                <span className="text-ink-faint font-mono text-[14px] font-semibold">{n}.</span>
                <span>
                  <b className="text-ink block text-[15.5px]">{title}</b>
                  <span className="text-ink-body text-[14.5px] leading-[1.5]">{detail}</span>
                </span>
                <span className="text-[14px] leading-[1.5]">
                  <span className="text-ink-faint block text-[12.5px]">check before moving on</span>
                  <span className="text-ink-body flex gap-2">
                    <span className="text-ink mt-[5px] shrink-0" aria-hidden="true">
                      <IconCheck size={10} />
                    </span>
                    {check}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

/**
 * What something needs, one line each: a drawn tick in ink when it is there,
 * a cross in red when it is missing. `maybe` lines are neither.
 */
export function CheckList({ items }: { items: [state: boolean | "maybe", title: ReactNode, detail?: ReactNode][] }) {
  return (
    <ul className="border-rule border-t">
      {items.map(([state, title, detail], i) => (
        <li key={i} className="border-rule grid gap-x-5 gap-y-0.5 border-b py-2.5 sm:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
          <span className={cn("flex gap-2 text-[15px] font-semibold", state === false ? "text-fault" : "text-ink")}>
            <span className="mt-[5px] w-3 shrink-0" aria-hidden="true">
              {state === true ? <IconCheck size={11} /> : state === false ? <IconX size={10} /> : <span className="font-mono text-[13px] leading-none">?</span>}
            </span>
            {title}
          </span>
          {detail && <span className="text-ink-body text-[14.5px] leading-[1.5]">{detail}</span>}
        </li>
      ))}
    </ul>
  );
}

/** A plan in stages, side by side: when, how long, and what gets done. */
export function Phases({ phases }: { phases: [when: string, effort: string, items: string[]][] }) {
  return (
    <ol className="grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
      {phases.map(([when, effort, items], i) => (
        <li key={when} className="border-ink border-t-2 pt-3">
          <p className="text-ink text-[17px] font-bold">
            <span className="text-ink-faint mr-2 font-mono text-[13px]">{i + 1}.</span>
            {when}
          </p>
          <p className="text-ink-faint text-[13.5px]">{effort}</p>
          <ul className="text-ink-body mt-3 space-y-2 text-[14.5px] leading-[1.5]">
            {items.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="bg-ink-faint mt-[9px] size-1.5 shrink-0 rounded-full" />
                {item}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
