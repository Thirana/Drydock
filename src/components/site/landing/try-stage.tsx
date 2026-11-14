"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { SameNet } from "@/components/learn/widgets/lazy";
import { IconArrowRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { DnsStep, FwStep, LbStep, NatStep } from "./steps";

export type TryKey = "dns" | "nat" | "lb" | "firewall" | "same-net";

export interface TryMove {
  key: TryKey;
  /** The short name on the line of moves. */
  name: string;
  /** The question this move answers, as the panel's title. */
  title: string;
  /** What to do with the figure. */
  prompt: string;
  /** Where the figure comes from. */
  source: { label: string; cta: string; href: string };
}

const HASH = /^#try-(\d)$/;

/**
 * The home page's bench: five numbered moves along one request, each a
 * small figure drawn for this page from the chapter that teaches it.
 */
export function TryStage({ moves }: { moves: TryMove[] }) {
  const [at, setAt] = useState(0);
  const move = moves[at];

  // A move can be linked to: /#try-3 opens on the third.
  useEffect(() => {
    const read = () => {
      const n = Number(HASH.exec(window.location.hash)?.[1]);
      if (n >= 1 && n <= moves.length) setAt(n - 1);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [moves.length]);

  const go = (next: number) => {
    setAt(next);
    window.history.replaceState(null, "", `#try-${next + 1}`);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = Math.min(moves.length - 1, Math.max(0, at + step));
    go(next);
    requestAnimationFrame(() =>
      document.getElementById(`try-tab-${next}`)?.focus(),
    );
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Five things to try"
        onKeyDown={onKeyDown}
        style={{ "--moves": moves.length, "--at": at } as CSSProperties}
        className="border-rule relative grid grid-cols-[repeat(var(--moves),minmax(0,1fr))] border-t"
      >
        <span
          aria-hidden="true"
          className="bg-accent absolute -top-px left-0 h-[3px] w-[calc(100%/var(--moves))] translate-x-[calc(100%*var(--at))] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
        />
        {moves.map((m, i) => {
          const current = i === at;
          return (
            <button
              key={m.key}
              id={`try-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={current}
              aria-controls="try-panel"
              aria-label={`${i + 1}. ${m.name}`}
              tabIndex={current ? 0 : -1}
              onClick={() => go(i)}
              className="group hover:bg-sunk flex min-h-12 cursor-pointer flex-col items-start gap-0.5 rounded-[2px] px-2 pt-2.5 pb-2 text-left transition-colors sm:pr-4"
            >
              <span
                className={cn(
                  "font-mono text-[14px] font-bold",
                  current ? "text-accent" : "text-ink-faint",
                )}
              >
                {i + 1}.
              </span>
              <span
                className={cn(
                  "hidden text-[15.5px] leading-[1.3] text-balance transition-colors sm:block",
                  current
                    ? "text-accent font-bold"
                    : "text-ink-muted group-hover:text-ink",
                )}
              >
                {m.name}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="try-panel"
        role="tabpanel"
        aria-labelledby={`try-tab-${at}`}
        className="pt-6 sm:pt-8"
      >
        <div
          key={move.key}
          className="dd-stage-in grid items-start gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]"
        >
          <div>
            <h3 className="dd-head text-ink text-[24px] sm:text-[30px]">
              {move.title}
            </h3>
            <p className="text-ink-body mt-3 max-w-[62ch] text-[17px] leading-[1.55] text-pretty">
              {move.prompt}
            </p>
            <p className="text-ink-muted mt-5 text-[15px]">
              {move.source.label}
            </p>
            <Link
              href={move.source.href}
              className="dd-link mt-1 inline-flex items-center gap-1.5 text-[16px]"
            >
              {move.source.cta}
              <IconArrowRight size={12} />
            </Link>
          </div>
          <div className="min-w-0 [&>figure]:my-0">
            <Figure move={move.key} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Figure({ move }: { move: TryKey }): ReactNode {
  switch (move) {
    case "dns":
      return <DnsStep />;
    case "nat":
      return <NatStep />;
    case "lb":
      return <LbStep />;
    case "firewall":
      return <FwStep />;
    case "same-net":
      return <SameNet a="10.10.1.10" b="10.10.2.5" prefix="24" wide />;
  }
}
