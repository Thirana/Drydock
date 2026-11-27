"use client";

import { Fold, Folds } from "@/components/mdx/fold";
import { IconArrow } from "@/components/ui/icons";
import type { LoadBalancerChain } from "@/lib/architecture/types";
import { SHOW_LINK } from "./load-balancer-explorer";

/** `code` in backticks, set as inline code. */
function withCode(text: string) {
  return text
    .split("`")
    .map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));
}

/**
 * Where to look when something breaks: a toggle row per symptom, the place to
 * look always up, the usual cause folded. A row that names a link selects it
 * in the chain above.
 */
export function LoadBalancerSymptoms({ chain }: { chain: LoadBalancerChain }) {
  if (!chain.symptoms?.length) return null;
  return (
    <Folds>
      {chain.symptoms.map((s, i) => (
        <Fold
          key={s.symptom}
          name="lb-symptoms"
          mark={i + 1}
          title={s.symptom}
          meta={
            <span className="text-ink-muted text-[15px]">
              Look at <span className="text-ink font-semibold">{s.where}</span>
            </span>
          }
        >
          <p>{withCode(s.cause)}</p>
          {s.link && (
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent(SHOW_LINK, { detail: s.link }),
                )
              }
              className="text-accent mt-3 inline-flex items-center gap-2 text-[15px] font-semibold hover:underline"
            >
              Show it on the chain
              <IconArrow size={13} className="-rotate-90" />
            </button>
          )}
        </Fold>
      ))}
    </Folds>
  );
}
