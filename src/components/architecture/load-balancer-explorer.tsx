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
    <div className="not-prose my-8 space-y-10">
      <DiagramFrame title="Load balancer chain" meta={detail?.title}>
        <LoadBalancerDiagram
          chain={chain}
          selectedId={selected}
          onSelect={setSelected}
        />
      </DiagramFrame>

      <section aria-live="polite" className="border-rule border-t">
        {detail ? (
          <div key={selected} className="animate-fade-in">
            <div className="flex flex-wrap items-start justify-between gap-3 pt-4 pb-4">
              <div className="min-w-0">
                <h3 className="dd-head text-ink text-[26px]">{detail.title}</h3>
                <p className="text-ink-muted mt-2 font-mono text-[13px]">
                  {detail.subtitle}
                </p>
              </div>
              <span className="border-rule-strong text-ink border px-2 py-1 font-mono text-[13.5px] font-semibold">
                {detail.position}
              </span>
            </div>
            <div className="border-rule border-t">
              <FactList facts={detail.rows} />
            </div>
            {detail.note && (
              <div className="mt-6 grid max-w-[68ch] grid-cols-[28px_minmax(0,1fr)] gap-x-2">
                <span
                  aria-hidden="true"
                  className="text-accent pt-[2px] font-mono text-[15px] font-bold"
                >
                  !?
                </span>
                <p className="text-ink-body text-[16px] leading-[1.6]">
                  {detail.note}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-ink-body py-10 text-[16px]">
            Select any link in the chain to see what lives there.
          </p>
        )}
      </section>
    </div>
  );
}
