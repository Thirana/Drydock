import { cn } from "@/lib/utils";
import { WidgetFrame } from "./widget-frame";

/*
 * Chapter 1's two drawings of one request: the whole trip from browser to
 * Node app, and the request being wrapped layer by layer before it leaves.
 */

const STOPS: [string, string][] = [
  ["Browser", "app"],
  ["OS stack", "kernel"],
  ["NIC", "hardware"],
  ["Home router", "first hop"],
  ["ISP + internet", "many hops"],
  ["Google network", "edge + VPC"],
  ["VM", "OS + NIC"],
  ["Node app", "your code"],
];

/** The whole trip, with the part this chapter covers drawn in ink. */
export function Journey({ mode, wide }: { mode?: "end"; wide?: boolean }) {
  const end = mode === "end";
  return (
    <WidgetFrame wide={wide} label="The trip from browser to Node app">
      <ol className="flex min-w-[720px] items-stretch">
        {STOPS.map(([name, sub], i) => {
          const covered = i < 3;
          return (
            <li key={name} className="flex flex-1 items-center">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={cn("h-[1.5px] w-4 shrink-0", i < 3 ? "bg-ink" : "bg-rule-strong")}
                />
              )}
              <span
                className={cn(
                  "relative grid min-h-16 flex-1 content-center justify-items-center rounded-[2px] border px-1.5 py-2 text-center",
                  covered ? "border-ink border-[1.5px]" : "border-rule",
                )}
              >
                {end && i === 2 && (
                  <span className="text-accent absolute -top-6 text-[12.5px] font-semibold whitespace-nowrap">
                    you are here
                  </span>
                )}
                <span className={cn("text-[13.5px] leading-[1.25]", covered ? "text-ink font-semibold" : "text-ink-muted")}>
                  {name}
                </span>
                <span className="text-ink-faint mt-0.5 font-mono text-[11px]">{sub}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <p className="text-ink-muted mt-4 flex min-w-[720px] justify-between gap-6 text-[14px]">
        <span className="text-ink font-semibold">
          {end
            ? "Chapter 1: browser → NIC → first frame toward the router"
            : "This chapter covers the first three stops"}
        </span>
        <span>
          {end
            ? "still ahead: routing, the GCP side, the server, the response"
            : "later chapters cover the rest of the trip"}
        </span>
      </p>
    </WidgetFrame>
  );
}

const LAYERS = [
  { min: 3, x: 20, w: 178, hue: "teal", t: "Ethernet header", l: ["dst 3c:84:6a:10:ee:01", "src a4:83:e7:2b:91:0c"] },
  { min: 2, x: 200, w: 168, hue: "green", t: "IP header", l: ["src 192.168.1.23", "dst 34.87.120.15"] },
  { min: 1, x: 370, w: 168, hue: "amber", t: "TCP header", l: ["src port 52814", "dst port 443", "seq 1"] },
  { min: 0, x: 540, w: 268, hue: "plum", t: "Data (the chunk)", l: ["HTTP bytes, TLS-encrypted", "up to 1,460 bytes"] },
  { min: 3, x: 810, w: 90, hue: "teal", t: "FCS", l: ["error", "check"] },
] as const;

const BRACKETS = [
  { min: 1, x1: 370, x2: 808, y: 126, hue: "amber", t: "TCP segment" },
  { min: 2, x1: 200, x2: 808, y: 98, hue: "green", t: "IP packet" },
  { min: 3, x1: 20, x2: 900, y: 70, hue: "teal", t: "Frame" },
] as const;

const SAYS = [
  "",
  "TCP adds ports and a sequence number.",
  "IP adds the source and destination addresses.",
  "The frame adds MAC addresses and an error check.",
];

/** The request wrapped once, twice, three times: segment, packet, frame. */
export function Envelope({ level, wide }: { level: string; wide?: boolean }) {
  const L = Number(level);
  const y = 150;
  const h = 92;
  const top = [110, 104, 76, 48][L];
  return (
    <figure className={cn("not-prose my-10", !wide && "max-w-[760px]")}>
      <div className="dd-fig border-rule bg-ground overflow-x-auto rounded-[2px] border p-4 sm:p-5">
        <svg viewBox={`0 ${top} 920 ${280 - top}`} role="img" aria-label={SAYS[L]}>
          {LAYERS.map((p) => {
            if (p.min > L)
              return <rect key={p.t} className="ghost" x={p.x} y={y} width={p.w} height={h} rx="2" />;
            const isNew = p.min === L;
            return (
              <g key={p.t} opacity={isNew ? 1 : 0.7}>
                <rect
                  className={`n ${p.hue}`}
                  x={p.x}
                  y={y}
                  width={p.w}
                  height={h}
                  rx="2"
                  strokeWidth={isNew ? 2.25 : undefined}
                />
                <text className="t" x={p.x + 12} y={y + 24}>
                  {p.t}
                </text>
                {p.l.map((line, i) => (
                  <text key={line} className="s" x={p.x + 12} y={y + 46 + i * 17}>
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
          {BRACKETS.filter((b) => b.min <= L).map((b) => (
            <g key={b.t}>
              <path
                className={`w ${b.hue}${b.min < L ? " dash" : ""}`}
                d={`M${b.x1} ${b.y + 12} V${b.y} H${b.x2} V${b.y + 12}`}
              />
              <text className="l" x={b.x1 + 8} y={b.y - 8}>
                {b.t}
                {b.min === L ? "  (new)" : ""}
              </text>
            </g>
          ))}
          <text className="s" x="20" y={y + h + 26}>
            bytes go out left to right: outer headers first, then the data. Dashed boxes are wraps still to come.
          </text>
        </svg>
      </div>
      <p className="text-ink-muted mt-2 text-[14px] md:hidden">Wide by design - scroll it sideways.</p>
    </figure>
  );
}
