import { Box } from "./steps";

const LINE = "url(#dd-ah-muted)";
const GREEN = "url(#dd-ah-green)";
const FAULT = "url(#dd-ah-fault)";

/** Defect IDs on a box's top-right edge, as the lab draws them; closed ones struck. */
export function Tag({
  x,
  y,
  ids,
  closed,
}: {
  x: number;
  y: number;
  ids: string[];
  closed: ReadonlySet<string>;
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
      {ids.map((id, i) => {
        const shut = closed.has(id);
        return (
          <tspan
            key={id}
            dx={i ? 8 : 0}
            style={{
              fill: shut ? "var(--dd-ink-faint)" : "var(--dd-fault)",
              textDecoration: shut ? "line-through" : undefined,
              transition: "fill 300ms ease",
            }}
          >
            {id}
          </tspan>
        );
      })}
    </text>
  );
}

/**
 * Harbour's front door, drawn in the course's vocabulary: shoppers through
 * Cloudflare and the load balancer to harbour-api on Cloud Run, its database,
 * and the run.app URL that skips all of it. Defect IDs sit on the boxes they
 * belong to and are struck once `closed` holds them. Children of a 700 x 410
 * viewBox.
 */
export function HarbourDrawing({
  closed,
  note,
}: {
  closed: ReadonlySet<string>;
  /** The line under the drawing. */
  note: string;
}) {
  const bypassShut = closed.has("D6");
  return (
    <>
      {/* Outside Google Cloud */}
      <Box
        x={16}
        y={16}
        w={176}
        h={62}
        title="Shoppers"
        lines={["browser + app"]}
      />
      <Box
        x={16}
        y={128}
        w={176}
        h={62}
        title="Cloudflare"
        lines={["CDN + WAF"]}
      />
      <Tag x={192} y={122} ids={["D8"]} closed={closed} />
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
      <Tag x={422} y={106} ids={["D8", "D15"]} closed={closed} />
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
        Cloud Run
      </text>
      <Box
        x={470}
        y={142}
        w={200}
        h={82}
        title="harbour-api"
        hue="plum"
        lines={[
          bypassShut ? "ingress: LB only" : "ingress: all",
          closed.has("D7") ? "egress: all traffic" : "egress: private only",
        ]}
      />
      <Tag x={670} y={136} ids={["D6", "D7"]} closed={closed} />
      <path className="w green" d="M422 161 H467" markerEnd={GREEN} />

      {/* The database it calls */}
      <Box
        x={456}
        y={300}
        w={228}
        h={62}
        title="harbour-pg"
        hue="plum"
        lines={[
          closed.has("D5") ? "Cloud SQL · private IP" : "Cloud SQL · public IP",
        ]}
      />
      <Tag x={684} y={294} ids={["D5"]} closed={closed} />
      <path className="w green" d="M570 224 V297" markerEnd={GREEN} />

      {/* The second front door */}
      <g
        style={{ opacity: bypassShut ? 0.4 : 1 }}
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
          lines={[bypassShut ? "closed" : "skips CDN, LB, WAF"]}
        />
        <path
          className={bypassShut ? "w dash" : "w fault dash"}
          d="M192 331 H229"
          markerEnd={bypassShut ? LINE : FAULT}
        />
        <path
          className={bypassShut ? "w dash" : "w fault dash"}
          d="M422 331 H440 V196 H467"
          markerEnd={bypassShut ? LINE : FAULT}
        />
        {bypassShut && (
          <text className="x" x="434" y="270" style={{ fill: "var(--dd-ink)" }}>
            ✕
          </text>
        )}
      </g>
      <text className="l" x="16" y="398" style={{ fontSize: "14px" }}>
        {note}
      </text>
    </>
  );
}
