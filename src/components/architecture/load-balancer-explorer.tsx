"use client";

import { useEffect, useRef, useState } from "react";
import { IconArrowLeft, IconArrowRight } from "@/components/ui/icons";
import type { LoadBalancerChain } from "@/lib/architecture/types";
import { DiagramFrame } from "./diagram-frame";
import { FactList } from "./fact-list";
import { LoadBalancerDiagram } from "./load-balancer-diagram";

/** Sent with a link id to select it in the chain and bring the chain into view. */
export const SHOW_LINK = "dd:lb-show-link";

export function LoadBalancerExplorer({ chain }: { chain: LoadBalancerChain }) {
  const [selected, setSelected] = useState(chain.initialSelection);
  const frameRef = useRef<HTMLDivElement>(null);
  const detail = chain.details[selected];

  // Request order: each lane front to back, then the probe path.
  const order = [
    ...chain.lanes.flatMap((l) => l.links.map((k) => k.id)),
    ...chain.extras.map((e) => e.id),
  ];
  const at = order.indexOf(selected);
  const prev = at > 0 ? order[at - 1] : undefined;
  const next = at < order.length - 1 ? order[at + 1] : undefined;

  useEffect(() => {
    const show = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (!chain.details[id]) return;
      setSelected(id);
      frameRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener(SHOW_LINK, show);
    return () => window.removeEventListener(SHOW_LINK, show);
  }, [chain.details]);

  return (
    <div ref={frameRef} className="not-prose my-8 scroll-mt-28 space-y-10">
      <DiagramFrame
        title="Load balancer chain"
        meta={detail?.title}
        keyItems={["teal", "plum", "amber", "green", "fault"]}
      >
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

        <nav
          aria-label="Walk the chain"
          className="border-rule mt-8 flex items-start justify-between gap-6 border-t pt-4"
        >
          {prev ? (
            <StepButton
              direction="back"
              label={chain.details[prev]?.title ?? prev}
              onClick={() => setSelected(prev)}
            />
          ) : (
            <span />
          )}
          {next && (
            <StepButton
              direction="on"
              label={chain.details[next]?.title ?? next}
              onClick={() => setSelected(next)}
            />
          )}
        </nav>
      </section>
    </div>
  );
}

function StepButton({
  direction,
  label,
  onClick,
}: {
  direction: "back" | "on";
  label: string;
  onClick: () => void;
}) {
  const back = direction === "back";
  return (
    <button
      type="button"
      onClick={onClick}
      className={back ? "group text-left" : "group ml-auto text-right"}
    >
      <span className="text-ink-muted block text-[14px]">
        {back ? "Previous link" : "Next link"}
      </span>
      <span className="text-ink group-hover:text-accent inline-flex items-center gap-2 text-[17px] font-bold transition-colors">
        {back && <IconArrowLeft size={14} />}
        {label}
        {!back && <IconArrowRight size={14} />}
      </span>
    </button>
  );
}
