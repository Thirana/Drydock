"use client";

import { useState } from "react";
import { CommandBlock } from "@/components/architecture/command-block";
import { DEFECT_CHIP } from "@/components/architecture/defect-link";
import { SeverityBadge } from "@/components/architecture/severity-badge";
import { SegmentedControl } from "@/components/ui/controls";
import type { FollowedDefect } from "@/lib/content/featured";
import { cn } from "@/lib/utils";

type State = "now" | "fixed";

const SUBLABEL =
  "text-gl-text-muted text-[11px] font-bold tracking-[0.12em] uppercase";

/** One register entry, open, with the configuration before and after one click apart. */
export function RegisterEntry({ defect }: { defect: FollowedDefect }) {
  const [state, setState] = useState<State>("now");
  const fixed = state === "fixed";

  return (
    <article className="border-gl-border bg-gl-surface shadow-gl-lg overflow-hidden rounded-2xl border">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-4 sm:px-6">
        <span className={DEFECT_CHIP}>{defect.id}</span>
        <SeverityBadge severity={defect.severity} />
        <h3 className="text-gl-text min-w-0 flex-1 basis-[220px] text-[17px] font-semibold tracking-[-0.01em]">
          {defect.title}
        </h3>
        <span className="border-gl-border bg-gl-surface-2 text-gl-text-muted rounded-full border px-2.5 py-1 font-mono text-[11px] leading-none">
          phase {defect.phase} · {defect.phaseName}
        </span>
      </header>

      <div className="border-gl-border space-y-5 border-t px-5 py-5 sm:px-6">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SegmentedControl<State>
              label="Show the configuration"
              value={state}
              onChange={setState}
              options={[
                { value: "now", label: "Now" },
                { value: "fixed", label: "Fixed" },
              ]}
            />
            <span
              className={cn(
                "font-mono text-[11px] font-bold tracking-[0.12em] uppercase",
                fixed ? "text-gl-success" : "text-gl-danger",
              )}
            >
              {fixed ? `closed in phase ${defect.phase}` : "open, as found"}
            </span>
          </div>
          <p
            aria-live="polite"
            className="border-gl-border bg-gl-bg text-gl-text mt-3 rounded-[10px] border px-4 py-3.5 font-mono text-[13px] leading-[1.6]"
          >
            {fixed ? defect.after : defect.before}
          </p>
        </div>

        <div>
          <p className={cn(SUBLABEL, "mb-2")}>The change that closes it</p>
          <CommandBlock label="fix">{defect.remediation}</CommandBlock>
        </div>
      </div>
    </article>
  );
}
