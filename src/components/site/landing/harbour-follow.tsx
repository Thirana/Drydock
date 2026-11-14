"use client";

import { useState } from "react";
import { CommandBlock } from "@/components/architecture/command-block";
import { cn } from "@/lib/utils";
import { Box, Step } from "./steps";

type Stage = "find" | "order" | "fix";

const LINE = "url(#dd-ah-muted)";
const GREEN = "url(#dd-ah-green)";
const FAULT = "url(#dd-ah-fault)";

/** Defect IDs on a box's top-right edge, as the lab draws them. */
function Tag({
  x,
  y,
  ids,
  struck,
}: {
  x: number;
  y: number;
  ids: string[];
  /** An ID that has closed. */
  struck?: string;
}) {
  return (
    <text
      x={x}
      y={y}
      style={{
        fontFamily: "var(--font-atkinson-mono), ui-monospace, monospace",
        fontSize: "13px",
        fontWeight: 700,
        textAnchor: "end",
      }}
    >
      {ids.map((id, i) => (
        <tspan
          key={id}
          dx={i ? 8 : 0}
          style={{
            fill: id === struck ? "var(--dd-ink-faint)" : "var(--dd-fault)",
            textDecoration: id === struck ? "line-through" : undefined,
          }}
        >
          {id}
        </tspan>
      ))}
    </text>
  );
}

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
      {/* Outside Google Cloud */}
      <Box
        x={16}
        y={16}
        w={176}
        h={62}
        title="Shoppers"
        lines={["browser · mobile app"]}
      />
      <Box
        x={16}
        y={128}
        w={176}
        h={62}
        title="Cloudflare"
        lines={["CDN + WAF"]}
      />
      <Tag x={192} y={122} ids={["D8"]} />
      <path className="w green" d="M104 78 V125" markerEnd={GREEN} />

      {/* The front door */}
      <Box
        x={232}
        y={112}
        w={190}
        h={98}
        title="Global external ALB"
        hue="plum"
        lines={["34.120.95.195:443", "+ Cloud Armor", "→ serverless NEG"]}
      />
      <Tag x={422} y={106} ids={["D8", "D15"]} />
      <path className="w green" d="M192 159 H229" markerEnd={GREEN} />

      {/* Cloud Run */}
      <rect
        className="zone plum"
        x="456"
        y="96"
        width="228"
        height="140"
        rx="2"
      />
      <text className="s" x="470" y="116">
        Cloud Run · asia-southeast1
      </text>
      <Box
        x={470}
        y={142}
        w={200}
        h={82}
        title="harbour-api"
        hue="plum"
        lines={[
          fixed ? "ingress: LB only" : "ingress: all",
          "egress: private ranges",
        ]}
      />
      <Tag
        x={670}
        y={136}
        ids={[defect.id, "D7"]}
        struck={fixed ? defect.id : undefined}
      />
      <path className="w green" d="M422 161 H467" markerEnd={GREEN} />

      {/* The database it calls */}
      <Box
        x={456}
        y={300}
        w={228}
        h={62}
        title="harbour-pg"
        hue="plum"
        lines={["Cloud SQL · public IP"]}
      />
      <Tag x={684} y={294} ids={["D5"]} />
      <path className="w green" d="M570 224 V297" markerEnd={GREEN} />

      {/* The second front door */}
      <g
        style={{ opacity: fixed ? 0.4 : 1 }}
        className="transition-opacity duration-300"
      >
        <Box
          x={16}
          y={300}
          w={176}
          h={62}
          title="Anyone"
          lines={["knows the URL"]}
        />
        <Box
          x={232}
          y={300}
          w={190}
          h={62}
          title="Direct run.app URL"
          lines={[fixed ? "closed" : "skips CDN, LB and WAF"]}
        />
        <path
          className={fixed ? "w dash" : "w fault dash"}
          d="M192 331 H229"
          markerEnd={fixed ? LINE : FAULT}
        />
        <path
          className={fixed ? "w dash" : "w fault dash"}
          d="M422 331 H440 V196 H467"
          markerEnd={fixed ? LINE : FAULT}
        />
        {fixed && (
          <text className="x" x="434" y="270" style={{ fill: "var(--dd-ink)" }}>
            ✕
          </text>
        )}
      </g>
      <text className="l" x="16" y="398" style={{ fontSize: "14px" }}>
        {fixed
          ? "Only the load balancer and the VPC can reach harbour-api now."
          : "The red path skips Cloudflare's WAF, the load balancer and Cloud Armor."}
      </text>
    </Step>
  );
}
