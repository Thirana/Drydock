"use client";

import { useState, type ReactNode } from "react";
import { IconCheck, IconX } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { Choices, Rich } from "../ui";
import { WidgetFrame } from "../widget-frame";
import { Box, Drawing, Mark, T, Wire } from "./draw";

/*
 * Most GCP widgets are the same tool: pick a case, optionally ask "what if",
 * and read the drawing, the takeaway and the config behind it. This is that
 * tool; each widget brings its cases and draws them.
 */

export type Case = {
  k: string;
  t?: string;
  /** "What if" variants: [key, label]. The first is the normal case. */
  what?: [string, string][];
  whatLabel?: string;
  /** One takeaway, or one per "what if" key. */
  take: string | Record<string, string>;
  cfg?: string;
};

export function CaseExplorer<C extends Case>({
  cases,
  render,
  label,
}: {
  cases: C[];
  render: (c: C, what: string) => ReactNode;
  label: string;
}) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState("normal");
  const c = cases[index];
  const what = c.what && !c.what.some(([k]) => k === picked) ? c.what[0][0] : picked;
  const take = typeof c.take === "string" ? c.take : (c.take[what] ?? c.take.normal);
  return (
    // Case drawings are drawn 960 wide: they get the full column, like tables.
    <WidgetFrame wide label={label}>
      {cases.length > 1 && (
        <Choices
          label="Case"
          value={index}
          onChange={(i) => {
            setIndex(i);
            setPicked("normal");
          }}
          options={cases.map((x, i) => ({ value: i, label: x.t ? `${x.k} · ${x.t}` : x.k }))}
        />
      )}
      {c.what && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-ink-muted text-[14px]">{c.whatLabel ?? "What if"}</span>
          <Choices label={c.whatLabel ?? "What if"} value={what} onChange={setPicked} options={c.what.map(([value, l]) => ({ value, label: l }))} />
        </div>
      )}
      <div className="mt-4" aria-live="polite">
        {render(c, what)}
        {take && (
          <p className="text-ink-body mt-4 max-w-[72ch] text-[16px] leading-[1.6] text-pretty">
            <Rich text={take} />
          </p>
        )}
      </div>
      {c.cfg && <Config text={c.cfg} />}
    </WidgetFrame>
  );
}

/** The case written out as config, folded away until asked for. */
export function Config({ text, summary = "Show as config" }: { text: string; summary?: string }) {
  return (
    <details className="group mt-4">
      <summary className="text-ink-muted hover:text-ink inline-flex cursor-pointer list-none items-center gap-2 text-[14.5px] transition-colors [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="font-mono text-[12px] transition-transform group-open:rotate-90">
          ›
        </span>
        {summary}
      </summary>
      <pre className="bg-code text-ink mt-3 overflow-x-auto rounded-[2px] px-4 py-3 font-mono text-[13px] leading-[1.6]">{text}</pre>
    </details>
  );
}

export type Tone = "ok" | "warn" | "fault" | "plain";

/**
 * How a check turned out, in words. Passing and warnings stay in ink (green
 * never means "good"); only something stopped or lost is red.
 */
export function Result({ tone = "ok", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <p
      className={cn(
        "border-t pt-3 text-[16px] leading-[1.5] text-pretty",
        tone === "fault" ? "border-fault text-fault" : "border-ink text-ink",
      )}
    >
      {tone !== "plain" && (
        <span className="mr-2 inline-block w-3 align-[1px] font-semibold" aria-hidden="true">
          {tone === "fault" ? <IconX size={11} /> : tone === "warn" ? <span className="font-mono">!</span> : <IconCheck size={12} />}
        </span>
      )}
      {children}
    </p>
  );
}

export type ChainNode = { t: string; s?: string[]; c?: string };

/**
 * A request through a chain of boxes. Labels sit over each link; `block` is
 * the link where it is stopped, and everything after it fades.
 */
export function Chain({
  nodes,
  links,
  block,
  reply,
  replyBlock,
  notes,
  ok,
  warn,
  result,
}: {
  nodes: ChainNode[];
  links: (string | string[])[];
  block?: number;
  /** Words under the return arrows; with it, replies are drawn back along the chain. */
  reply?: string;
  /** The link where the reply is lost. */
  replyBlock?: number;
  notes?: string[];
  ok?: boolean;
  warn?: boolean;
  result: string;
}) {
  const n = nodes.length;
  const w = n > 4 ? 150 : 180;
  const gap = (928 - n * w) / (n - 1);
  const left = (i: number) => 16 + i * (w + gap);
  const rows = Math.max(1, ...nodes.map((x) => x.s?.length ?? 0));
  const boxH = Math.max(128, 44 + rows * 18);
  const replies = reply !== undefined && block === undefined;
  const h = 64 + boxH + (replies ? 44 : 12);
  return (
    <div className="space-y-3">
      <Drawing h={h} label={nodes.map((x) => x.t).join(", then ")}>
        {nodes.map((x, i) => (
          <g key={i} className={block !== undefined && i > block ? "off" : undefined}>
            <Box x={left(i)} y={64} w={w} h={boxH} c={x.c} />
            <T x={left(i) + 12} y={90} k="t" size={12.5}>
              {x.t}
            </T>
            {(x.s ?? []).map((line, j) => (
              <T key={j} x={left(i) + 12} y={112 + 18 * j} size={11}>
                {line}
              </T>
            ))}
          </g>
        ))}
        {links.map((l, i) => {
          if (block !== undefined && i > block) return null;
          const x1 = left(i) + w;
          const x2 = left(i + 1);
          const stopped = block === i;
          const lines = ([] as string[]).concat(l);
          return (
            <g key={i}>
              <Wire x1={x1} y1={104} x2={x2 - 4} y2={104} c={stopped ? "red" : "blue"} />
              {stopped && <Mark cx={(x1 + x2) / 2} cy={104} ok={false} r={10} />}
              {lines.map((line, j) => (
                <T key={j} x={(x1 + x2) / 2} y={52 - 14 * (lines.length - 1 - j)} k="s mid" size={10.5}>
                  {line}
                </T>
              ))}
            </g>
          );
        })}
        {replies &&
          links.map((_, i) => {
            // Replies run right to left; stop drawing past the link where one is lost.
            if (replyBlock !== undefined && i < replyBlock) return null;
            const x1 = left(i + 1);
            const x2 = left(i) + w;
            const lost = replyBlock === i;
            return (
              <g key={`r${i}`}>
                <Wire x1={x1} y1={170} x2={x2 + 4} y2={170} c={lost ? "red" : "green"} />
                {lost && <Mark cx={x2 + 14} cy={170} ok={false} r={10} />}
              </g>
            );
          })}
        {replies && (
          <T x={472} y={64 + boxH + 30} k={replyBlock !== undefined ? "s mid c-red" : "s mid"} size={11.5}>
            {replyBlock !== undefined ? "the reply never makes it back over the VPN" : reply}
          </T>
        )}
      </Drawing>
      {notes && notes.length > 0 && (
        <ul className="text-ink-muted space-y-1 font-mono text-[13px] leading-[1.5]">
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
      <Result tone={ok ? "ok" : warn ? "warn" : "fault"}>
        <b>{result}</b>
      </Result>
    </div>
  );
}
