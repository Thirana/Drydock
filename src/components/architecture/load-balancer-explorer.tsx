"use client";

import { useState } from "react";
import type { LoadBalancerChain } from "@/lib/architecture/types";
import { DiagramFrame } from "./diagram-frame";
import { FactList } from "./fact-list";
import { LoadBalancerDiagram } from "./load-balancer-diagram";

export function LoadBalancerExplorer({ chain }: { chain: LoadBalancerChain }) {
  const [selected, setSelected] = useState(chain.initialSelection);
  const detail = chain.details[selected];

  return (
    <div className="not-prose my-6 space-y-4">
      <DiagramFrame title="Load balancer chain" meta={detail?.title}>
        <LoadBalancerDiagram
          chain={chain}
          selectedId={selected}
          onSelect={setSelected}
        />
      </DiagramFrame>

      <section
        aria-live="polite"
        className="border-gl-border bg-gl-surface shadow-gl overflow-hidden rounded-xl border"
      >
        {detail ? (
          <>
            <div className="border-gl-border flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-gl-text-faint text-[10px] font-bold tracking-[0.12em] uppercase">
                  {detail.subtitle}
                </p>
                <h3 className="text-gl-text mt-1 text-[18px] leading-snug font-bold tracking-[-0.018em]">
                  {detail.title}
                </h3>
              </div>
              <span className="border-gl-border bg-gl-surface-2 text-gl-text-muted rounded-full border px-2.5 py-1 font-mono text-[11px]">
                {detail.position}
              </span>
            </div>
            <div className="p-5 sm:p-6">
              <FactList facts={detail.rows} />
              {detail.note && (
                <p className="border-gl-primary text-gl-text-muted mt-5 max-w-[80ch] border-l-2 pl-4 text-[14px] leading-[1.7]">
                  {detail.note}
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="text-gl-text-muted px-6 py-10 text-center text-[13px]">
            Select any link in the chain to see what lives there.
          </p>
        )}
      </section>
    </div>
  );
}
