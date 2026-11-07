"use client";

import { cn } from "@/lib/utils";
import { arrowHead } from "../../diagram-defs";
import { CaseExplorer, Result, type Case, type Tone } from "./case-explorer";
import { Drawing, Mark, T } from "./draw";

/* Chapter 7 · Egress and Cloud NAT. */

/*
 * Every NAT scenario is the same trip: the VM, three checks on its host
 * (route, firewall, NAT), then out. The map stays put; each case only changes
 * where the trip stops, or where it turns off before the NAT.
 */

type StepMark = "ok" | "stop" | "some" | "skip" | "off";
type Step = { mark: StepMark; words?: string };
type Dest = "paygate" | "other" | "google";

type State = {
  sender: [name: string, ...lines: string[]];
  steps: [Step, Step, Step];
  /** How it leaves the host: through the NAT, around it, or to Google. */
  exit?: "nat" | "bypass" | "google";
  dest?: Dest;
  /** What the destination sees, written under it. */
  sees?: string;
  /** False when the destination refuses it. */
  accepted?: boolean;
  strip?: "pool" | "burst" | "scale";
  result: string;
  tone: Tone;
};

type NatCase = Case & { states: Record<string, State> };

const ok = (words: string): Step => ({ mark: "ok", words });
const ROUTE = ok("0.0.0.0/0");
const RULE = ok("allowed");
const NAT = ok("34.87.200.7");
const NOT_USED: Step = { mark: "skip", words: "not used" };
const OFF: Step = { mark: "off" };

const API1: State["sender"] = ["kade-api-1", "10.10.1.10", "no external IP"];

const CASES: NatCase[] = [
  {
    k: "A",
    t: "PayGate's allow-list",
    what: [
      ["normal", "Normal"],
      ["extip", "What if kade-api-2 gets an external IP?"],
    ],
    take: {
      normal:
        "PayGate sees one address, 34.87.200.7, whichever VM made the call. The same holds for kade-api-2, kade-worker and Cloud Run (chapter 10), as long as each is covered by the gateway and has no external IP.",
      extip:
        "An external IP wins over the NAT (section 01), so kade-api-2 leaves as 34.87.130.4 and PayGate refuses it. Half the checkouts fail, depending on which VM the load balancer picks. The organization policy that blocks external IPs (chapter 17) stops this happening by accident.",
    },
    cfg: "PayGate's allow-list: 34.87.200.7/32\nkade-nat: manual IP kade-nat-ip (34.87.200.7), subnets sn-app, sn-data\n\nTo keep external IPs off for good (chapter 17):\n  constraints/compute.vmExternalIpAccess = deny all",
    states: {
      normal: {
        sender: API1,
        steps: [ROUTE, RULE, NAT],
        exit: "nat",
        dest: "paygate",
        sees: "sees 34.87.200.7",
        result: "Works: PayGate sees 34.87.200.7, which is on its list",
        tone: "ok",
      },
      extip: {
        sender: ["kade-api-2", "external IP", "34.87.130.4"],
        steps: [ROUTE, RULE, NOT_USED],
        exit: "bypass",
        dest: "paygate",
        sees: "sees 34.87.130.4",
        accepted: false,
        result: "Fails: the call skips the NAT, and 34.87.130.4 is not on PayGate's list",
        tone: "fault",
      },
    },
  },
  {
    k: "B",
    t: "A sale day",
    what: [
      ["normal", "Pooled connections"],
      ["burst", "What if every call opens a new connection?"],
      ["scale", "What if the group scales to 8 VMs?"],
    ],
    take: {
      normal:
        "With a connection pool, a handful of long-lived connections carry the whole sale. Each holds one of kade-api-1's 64 port slots for PayGate, so a pool of 6 uses 6.",
      burst:
        "Each new connection to the same IP and port needs its own slot. Connections 1-64 go out; 65-150 are dropped, and the NAT log says <code>OUT_OF_RESOURCES</code>. Fix in this order: connection pooling, then dynamic port allocation or a higher minimum. A new NAT IP helps only once PayGate allows it.",
      scale:
        "New VMs in sn-app are covered by kade-nat as they start, with nothing to add per VM, and all 8 still leave as 34.87.200.7. What grows is the ports they reserve: check the calculator in section 05 at the group's maximum size.",
    },
    cfg: "kade-nat: --min-ports-per-vm=64 (the default)\n\nFor bursts, let busy VMs grow:\n  --enable-dynamic-port-allocation --max-ports-per-vm=1024\n\nDrops show in the NAT log (command 4):\n  jsonPayload.allocation_status = DROPPED",
    states: {
      normal: {
        sender: API1,
        steps: [ROUTE, RULE, NAT],
        exit: "nat",
        dest: "paygate",
        sees: "sees 34.87.200.7",
        strip: "pool",
        result: "Works: 6 connections, 6 of 64 slots in use",
        tone: "ok",
      },
      burst: {
        sender: API1,
        steps: [ROUTE, RULE, { mark: "some", words: "slots full" }],
        exit: "nat",
        dest: "paygate",
        sees: "sees 34.87.200.7",
        strip: "burst",
        result: "86 of 150 payments fail: no free port slot for PayGate",
        tone: "fault",
      },
      scale: {
        sender: ["kade-api group", "8 VMs, sn-app", "no external IPs"],
        steps: [ROUTE, RULE, NAT],
        exit: "nat",
        dest: "paygate",
        sees: "sees 34.87.200.7",
        strip: "scale",
        result: "Works: all 8 VMs leave as 34.87.200.7",
        tone: "ok",
      },
    },
  },
  {
    k: "C",
    t: "Google APIs",
    take: "Traffic to Google APIs goes through Private Google Access, which Cloud NAT turned on for sn-app. It uses no NAT ports and does not leave as 34.87.200.7, so an allow-list on the Google side that expects that IP never matches. Google APIs are controlled with IAM instead (chapter 9).",
    cfg: "sn-app: privateIpGoogleAccess = true (turned on by kade-nat)\nkade-api-1 → storage.googleapis.com: no NAT port, no NAT IP",
    states: {
      normal: {
        sender: API1,
        steps: [ROUTE, RULE, NOT_USED],
        exit: "google",
        dest: "google",
        result: "Works, without the NAT: Cloud Storage reached over Google's network",
        tone: "ok",
      },
    },
  },
  {
    k: "D",
    t: "Only PayGate and mirrors",
    what: [
      ["normal", "To PayGate"],
      ["other", "What if it calls any other site?"],
      ["norules", "What if there are no egress rules?"],
    ],
    take: {
      normal:
        "Egress firewall rules run on the host before the NAT, and Kadé's allow PayGate and the apt mirrors. Cloud NAT decides the source IP; it never decides what is reachable.",
      other:
        "The deny rule at priority 1000 stops it on the host, before translation. Nothing leaves, and no NAT port is used.",
      norules:
        "Without egress rules the VM can reach any address, which is fine until something on it is compromised and starts sending data out. With IP-based rules you must keep PayGate's range current; an FQDN rule in a firewall policy (chapter 5.2) names <code>api.paygate.lk</code> instead.",
    },
    cfg: "allow  EGRESS tcp:443     to PayGate's range       priority 900\nallow  EGRESS tcp:80,443  to the apt mirrors       priority 900\nallow  EGRESS tcp:443     to Google APIs (ch 9)    priority 900\ndeny   EGRESS all         to 0.0.0.0/0             priority 1000\n\nThe Google APIs rule matters: Private Google Access traffic is\nchecked by egress rules too, and the deny would block it.",
    states: {
      normal: {
        sender: API1,
        steps: [ROUTE, ok("allow @900"), NAT],
        exit: "nat",
        dest: "paygate",
        sees: "sees 34.87.200.7",
        result: "Works: an allow rule matches PayGate",
        tone: "ok",
      },
      other: {
        sender: API1,
        steps: [ROUTE, { mark: "stop", words: "deny @1000" }, OFF],
        result: "Blocked on the host by the egress deny rule",
        tone: "fault",
      },
      norules: {
        sender: API1,
        steps: [ROUTE, RULE, NAT],
        exit: "nat",
        dest: "other",
        result: "Gets out: with no egress rules, every destination is allowed",
        tone: "warn",
      },
    },
  },
  {
    k: "E",
    t: "The \"lock down\" that breaks NAT",
    what: [
      ["normal", "Default route in place"],
      ["noroute", "What if someone deletes it?"],
    ],
    take: {
      normal:
        "Cloud NAT needs the route <code>0.0.0.0/0 → default-internet-gateway</code>. Chapter 4 section 08 kept it for exactly this reason.",
      noroute:
        "With the default route gone, internet traffic has nowhere to go, so it never reaches the NAT. Every VM loses the internet again, and it looks exactly like finding 5 came back. Limit egress with firewall rules (tab D), not by deleting the route.",
    },
    cfg: "kade-vpc route: 0.0.0.0/0 → default-internet-gateway (priority 1000)",
    states: {
      normal: {
        sender: API1,
        steps: [ROUTE, RULE, NAT],
        exit: "nat",
        dest: "paygate",
        sees: "sees 34.87.200.7",
        result: "Works: the default route carries it to the NAT",
        tone: "ok",
      },
      noroute: {
        sender: API1,
        steps: [{ mark: "stop", words: "no route" }, OFF, OFF],
        result: "Fails: no route out, so the NAT is never reached",
        tone: "fault",
      },
    },
  },
];

// ── The map ────────────────────────────────────────────────────────────────

const STEP_W = 116;
const STEP_X = [204, 338, 472];
const STEP_Y = 100;
const MID = 132;
const STEPS = [
  { t: "1 · route", hue: "teal" },
  { t: "2 · firewall", hue: "amber" },
  { t: "3 · Cloud NAT", hue: "plum" },
];
const DEST_Y: Record<Dest, number> = { paygate: 80, other: 168, google: 296 };
const EXIT: Record<NonNullable<State["exit"]>, (y: number) => string> = {
  nat: (y) => `M588 ${MID} H700 V${y} H757`,
  // Around the NAT: down from the firewall, under the NAT step, then out.
  bypass: (y) => `M396 164 V184 H700 V${y} H757`,
  google: (y) => `M396 164 V${y} H757`,
};

/** A step's badge on its top edge: a tick, a cross, or a dash when skipped. */
function Badge({ cx, cy, mark }: { cx: number; cy: number; mark: StepMark }) {
  if (mark === "off") return null;
  if (mark === "skip")
    return (
      <>
        <circle className="badge" cx={cx} cy={cy} r={10} />
        <text className="f" x={cx} y={cy + 4} style={{ fontSize: "13px", textAnchor: "middle" }}>
          –
        </text>
      </>
    );
  return <Mark cx={cx} cy={cy} ok={mark === "ok"} r={10} />;
}

function Wire({ x1, x2, red }: { x1: number; x2: number; red?: boolean }) {
  const hue = red ? "fault" : "green";
  return <line className={`w ${hue}`} x1={x1} y1={MID} x2={x2} y2={MID} markerEnd={arrowHead(hue)} />;
}

function DestBox({
  y,
  h,
  title,
  sub,
  sees,
  state,
}: {
  y: number;
  h: number;
  title: string;
  sub: string;
  sees?: string;
  /** Not the destination of this trip, or this trip's verdict. */
  state: "idle" | "ok" | "refused";
}) {
  return (
    <g className={state === "idle" ? "off" : undefined}>
      <rect className={cn("n", state === "refused" && "fault")} x="760" y={y} width="168" height={h} rx="2" />
      <T x={774} y={y + 24} k="t">
        {title}
      </T>
      <T x={774} y={y + 46} size={11}>
        {sub}
      </T>
      {sees && (
        <T x={774} y={y + 66} k={state === "refused" ? "s c-red" : "s"} size={11}>
          {sees}
        </T>
      )}
      {state !== "idle" && <Mark cx={908} cy={y} ok={state === "ok"} r={10} />}
    </g>
  );
}

function Strip({ kind }: { kind: NonNullable<State["strip"]> }) {
  if (kind === "scale")
    return (
      <g>
        <T x={32} y={232} k="s f" size={11}>
          ports reserved for the group
        </T>
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            <rect className="blk used" x={32 + i * 68} y={244} width={60} height={34} rx="2" />
            <T x={62 + i * 68} y={266} k="s mid" size={11}>
              64
            </T>
          </g>
        ))}
        <T x={32} y={302} size={11}>
          8 × 64 = 512 of 34.87.200.7&apos;s 64,512 ports
        </T>
      </g>
    );
  const used = kind === "pool" ? 6 : 64;
  return (
    <g>
      <T x={32} y={232} k="s f" size={11}>
        kade-api-1 → PayGate: 64 port slots
      </T>
      {Array.from({ length: 64 }, (_, i) => (
        <rect
          key={i}
          className={cn("blk", i < used ? "used" : "free")}
          x={32 + i * 8.5}
          y={244}
          width={7}
          height={22}
          rx="1"
        />
      ))}
      <T x={32} y={292} k={kind === "burst" ? "s c-red" : "s"} size={11}>
        {kind === "pool"
          ? "6 in use, one per pooled connection"
          : "connections 65-150: no free slot, dropped (OUT_OF_RESOURCES)"}
      </T>
    </g>
  );
}

function NatMap({ s }: { s: State }) {
  const [name, ...lines] = s.sender;
  const destState = (d: Dest) =>
    s.dest !== d ? "idle" : s.accepted === false ? "refused" : "ok";
  const reached = (i: number) => s.steps[i].mark !== "off" && s.steps[i].mark !== "skip";
  const stopped = (i: number) => s.steps[i].mark === "stop";
  return (
    <Drawing h={360} label={`${name}: ${s.result}`}>
      {/* Your side. */}
      <rect className="zone teal" x="16" y="12" width="596" height="332" rx="2" />
      <T x={32} y={34}>
        kade-vpc · asia-southeast1
      </T>
      <rect className="n teal" x="32" y="96" width="144" height="76" rx="2" />
      <T x={46} y={120} k="t">
        {name}
      </T>
      {lines.map((line, i) => (
        <T key={i} x={46} y={142 + 18 * i} size={11}>
          {line}
        </T>
      ))}

      {/* The three checks, in the order the host makes them. */}
      <rect className="zone panel" x="192" y="44" width="408" height="156" rx="2" />
      <T x={206} y={66} k="s f" size={11}>
        on the VM&apos;s host, in order
      </T>
      {STEPS.map((step, i) => {
        const m = s.steps[i].mark;
        const x = STEP_X[i];
        return (
          <g key={step.t} className={m === "off" || m === "skip" ? "off" : undefined}>
            <rect
              className={cn("n", m === "stop" || m === "some" ? "fault" : step.hue)}
              x={x}
              y={STEP_Y}
              width={STEP_W}
              height={64}
              rx="2"
            />
            <T x={x + 12} y={STEP_Y + 26} k="t" size={13}>
              {step.t}
            </T>
            {s.steps[i].words && (
              <T x={x + 12} y={STEP_Y + 48} k={m === "stop" || m === "some" ? "s c-red" : "s"} size={11}>
                {s.steps[i].words}
              </T>
            )}
          </g>
        );
      })}
      {STEPS.map((step, i) => (
        <Badge key={step.t} cx={STEP_X[i] + STEP_W / 2} cy={STEP_Y} mark={s.steps[i].mark} />
      ))}
      {/* Into each step it reaches; red into the one that stops it. */}
      {reached(0) && <Wire x1={176} x2={201} red={stopped(0)} />}
      {reached(1) && <Wire x1={320} x2={335} red={stopped(1)} />}
      {reached(2) && <Wire x1={454} x2={469} red={stopped(2)} />}

      {/* Out of the host. */}
      {s.exit && s.dest && (
        <path
          className={cn("w", s.accepted === false ? "fault" : "green")}
          d={EXIT[s.exit](DEST_Y[s.dest])}
          markerEnd={arrowHead(s.accepted === false ? "fault" : "green")}
        />
      )}
      {s.exit === "google" && (
        <T x={410} y={288}>
          Private Google Access
        </T>
      )}
      {s.strip && <Strip kind={s.strip} />}

      {/* The other side. */}
      <rect className="zone" x="624" y="12" width="320" height="204" rx="2" />
      <T x={640} y={34}>
        public internet
      </T>
      <DestBox y={40} h={80} title="PayGate" sub="allows 34.87.200.7" sees={s.dest === "paygate" ? s.sees : undefined} state={destState("paygate")} />
      <DestBox y={136} h={64} title="Any other site" sub="not on Kadé's list" state={destState("other")} />
      <rect className="zone plum" x="624" y="236" width="320" height="108" rx="2" />
      <T x={640} y={258}>
        Google&apos;s network
      </T>
      <DestBox y={264} h={64} title="Google APIs" sub="Cloud Storage" state={destState("google")} />
    </Drawing>
  );
}

/** Cloud NAT scenarios on one map of Kadé: where each trip stops, or turns off. */
export function NatScenarios() {
  return (
    <CaseExplorer
      label="Cloud NAT scenarios"
      cases={CASES}
      render={(c, what) => {
        const s = c.states[what] ?? c.states.normal;
        return (
          <div className="space-y-3">
            <NatMap s={s} />
            <Result tone={s.tone}>
              <b>{s.result}</b>
            </Result>
          </div>
        );
      }}
    />
  );
}
