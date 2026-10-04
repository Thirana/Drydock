"use client";

import { useState } from "react";
import { CommandBlock } from "@/components/architecture/command-block";
import { SeverityBadge } from "@/components/architecture/severity-badge";
import { SegmentedControl } from "@/components/ui/controls";
import type { FollowedDefect } from "@/lib/content/featured";
import { cn } from "@/lib/utils";

type State = "now" | "fixed";

/** One register entry, open, with the configuration before and after one click apart. */
export function RegisterEntry({ defect }: { defect: FollowedDefect }) {
  const [state, setState] = useState<State>("now");
  const fixed = state === "fixed";

  return (
    <article className="border-rule border-t">
      <header className="grid grid-cols-[56px_minmax(0,1fr)] items-baseline gap-x-3 py-4">
        <span className="text-fault font-mono text-[16px] font-bold">
          {defect.id}
        </span>
        <div className="min-w-0">
          <h3 className="text-ink text-[19px] leading-[1.35] font-semibold">
            {defect.title}
          </h3>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <SeverityBadge severity={defect.severity} />
            <span className="text-ink-muted text-[14px]">
              closes in move {defect.phase}, {defect.phaseName}
            </span>
          </p>
        </div>
      </header>

      <div className="border-rule grid gap-x-10 gap-y-6 border-t py-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SegmentedControl<State>
            label="Show the configuration"
            value={state}
            onChange={setState}
            options={[
              { value: "now", label: "Now" },
              { value: "fixed", label: "Fixed" },
            ]}
          />
          <div aria-live="polite" className="relative mt-4">
            <p className={cn("dd-label", fixed ? "text-ink" : "text-fault")}>
              {fixed ? `Closed in phase ${defect.phase}` : "Open, as found"}
            </p>
            <p
              key={state}
              className="animate-fade-in text-ink mt-2 font-mono text-[14px] leading-[1.65]"
            >
              {fixed ? defect.after : defect.before}
            </p>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-7">
          <p className="dd-label text-ink-muted mb-2">
            The change that closes it
          </p>
          <CommandBlock label="fix">{defect.remediation}</CommandBlock>
        </div>
      </div>
    </article>
  );
}
