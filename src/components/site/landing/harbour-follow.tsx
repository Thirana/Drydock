"use client";

import { useState } from "react";
import { CommandBlock } from "@/components/architecture/command-block";
import { cn } from "@/lib/utils";
import { HarbourDrawing } from "./harbour-drawing";
import { Step } from "./steps";

type Stage = "find" | "order" | "fix";

const NONE: ReadonlySet<string> = new Set();

/**
 * The lab's bypass defect followed from finding to fix, in the same frame as
 * the five steps above it. The drawing is the lab's own: monochrome, with the
 * defective path in red. It is drawn for D6, the run.app front door.
 */
export function HarbourFollow({
  defect,
  order,
  phases,
}: {
  defect: {
    id: string;
    symptom: string;
    detection: string;
    remediation: string;
    before: string;
    after: string;
    phase: number;
  };
  /** One sentence: where it closes, and what closes with it. */
  order: string;
  phases: { number: number; name: string }[];
}) {
  const [stage, setStage] = useState<Stage>("find");
  const fixed = stage === "fix";
  const shut = new Set([defect.id]);
  const [flag, ...rest] = defect.after.split(" ");

  return (
    <Step
      label={`${defect.id}, followed from finding to fix`}
      value={stage}
      onChange={setStage}
      options={[
        { value: "find", label: "1. Find it" },
        { value: "order", label: "2. Put it in order" },
        { value: "fix", label: "3. Fix it" },
      ]}
      viewBox="0 0 700 410"
      broken={stage === "find"}
      verdict={
        {
          find: defect.symptom,
          order,
          fix: (
            <>
              <span className="font-mono text-[15px]">{defect.before}</span>{" "}
              becomes <span className="font-mono text-[15px]">{flag}</span>{" "}
              {rest.join(" ")}
            </>
          ),
        }[stage]
      }
      extra={
        stage === "order" ? (
          <ol className="flex flex-wrap gap-x-5 gap-y-1.5 text-[15px]">
            {phases.map((p) => {
              const current = p.number === defect.phase;
              return (
                <li
                  key={p.number}
                  className={cn(
                    current ? "text-accent font-bold" : "text-ink-muted",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[14px] font-bold",
                      !current && "text-ink-faint",
                    )}
                  >
                    {p.number}.
                  </span>{" "}
                  {p.number === 0 ? "As found" : p.name}
                </li>
              );
            })}
          </ol>
        ) : (
          <CommandBlock
            label={fixed ? "Fix" : "Detect"}
            marks={fixed ? [flag] : []}
          >
            {fixed ? defect.remediation : defect.detection}
          </CommandBlock>
        )
      }
    >
      <HarbourDrawing
        closed={fixed ? shut : NONE}
        note={
          fixed
            ? "Only the load balancer and the VPC can reach harbour-api now."
            : "The red path skips Cloudflare's WAF, the load balancer and Cloud Armor."
        }
      />
    </Step>
  );
}
