"use client";

import { useMemo, useState, type ReactNode } from "react";
import { IconCheck, IconX } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import data from "../data/gcp.json";
import { Action, Choices, Rich, WidgetNote } from "../ui";
import { WidgetFrame } from "../widget-frame";
import { Box, Drawing, Mark, T, Zone } from "./draw";
import { StepNav } from "./kit";

/* Part 6 · Capstones (chapters 18.1-18.2): one request end to end, then a quiz. */

type Hop = { e: [string, string]; t: string; what: string; dec: string; ch: string[]; pkt: string; log: string };
type Break = { id: string; label: string; at: number; what: string; sees: string; log: string; fix: string; ch: string[] };
type JourneyData = {
  h: number;
  w?: number;
  nodes: Record<string, [x: number, y: number, t: string, s: string, c: string]>;
  zones?: [x: number, y: number, w: number, h: number, label: string, c: string][];
  edges: [string, string][];
  req: Hop[];
  ret: Hop[];
  breaks: Break[];
};

/** Cloudflare is outside GCP, so it is drawn in ink (chapter 0's legend), whatever the notes say. */
const nodeColour = (title: string, c: string) => (/cloudflare/i.test(title) ? "" : c);

const chapters = (ch: string[]) => (ch.length ? ` (chapter ${ch.join(", ")})` : "");

/** A labelled pair inside a hop's card. */
function Fact({ label, children, mono }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="text-ink-muted text-[13.5px]">{label}</p>
      <div className={cn("text-ink-body mt-1 text-[15px] leading-[1.55]", mono && "bg-code text-ink rounded-[2px] px-3 py-2 font-mono text-[13px] whitespace-pre-wrap")}>
        {children}
      </div>
    </div>
  );
}

/** One request through Kadé's platform: forward, back, or broken at one hop. */
function Journey({ data: j, label }: { data: JourneyData; label: string }) {
  const [mode, setMode] = useState<"req" | "ret" | "brk">("req");
  const [k, setK] = useState(0);
  const [breakId, setBreakId] = useState(j.breaks[0].id);
  const w = j.w ?? 140;
  const brk = j.breaks.find((b) => b.id === breakId)!;
  const path = mode === "ret" ? j.ret : j.req;
  const at = mode === "brk" ? brk.at : Math.min(k, path.length - 1);
  const centre = (n: string): [number, number] => [j.nodes[n][0] + w / 2, j.nodes[n][1] + 32];
  const clip = (a: string, b: string) => {
    const [x1, y1] = centre(a);
    const [x2, y2] = centre(b);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const t = Math.min(dx ? (w / 2 + 3) / Math.abs(dx) : 9, dy ? 35 / Math.abs(dy) : 9);
    return [x1 + dx * t, y1 + dy * t, x2 - dx * t, y2 - dy * t];
  };
  const hop = path[at];
  const active = new Set(hop.e);
  return (
    <WidgetFrame wide label={label}>
      <Choices
        label="View"
        value={mode}
        onChange={(m) => {
          setMode(m);
          setK(0);
        }}
        options={[
          { value: "req", label: "Request path" },
          { value: "ret", label: "Return path" },
          { value: "brk", label: "Break it" },
        ]}
      />
      {mode === "brk" && (
        <div className="mt-3">
          <Choices label="What breaks" value={breakId} onChange={setBreakId} options={j.breaks.map((b) => ({ value: b.id, label: b.label }))} />
        </div>
      )}
      <Drawing h={j.h} className="mt-4" label={`${label}: hop ${at + 1} of ${path.length}`}>
        {(j.zones ?? []).map(([x, y, zw, zh, l, c]) => (
          <g key={l}>
            <Zone x={x} y={y} w={zw} h={zh} c={c} />
            <T x={x + 12} y={y + 18} size={11}>{l}</T>
          </g>
        ))}
        {j.edges.map(([a, b]) => {
          const [x1, y1, x2, y2] = clip(a, b);
          return <line key={`${a}${b}`} className="w" x1={x1} y1={y1} x2={x2} y2={y2} opacity={0.5} />;
        })}
        {path.map((step, i) => {
          if (i > at || step.e[0] === step.e[1]) return null;
          const [x1, y1, x2, y2] = clip(step.e[0], step.e[1]);
          const current = i === at;
          const broken = mode === "brk" && current;
          const hue = broken ? "fault" : current ? "accent" : "green";
          return (
            <g key={i}>
              <line
                className={cn("w", broken ? "fault" : current ? "cur" : "green")}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                strokeWidth={current ? 3.5 : 2.2}
                markerEnd={`url(#dd-ah-${hue})`}
              />
              {broken && <Mark cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} ok={false} r={13} />}
            </g>
          );
        })}
        {Object.entries(j.nodes).map(([key, [x, y, t, s, c]]) => {
          const on = active.has(key);
          const failed = mode === "brk" && key === hop.e[1];
          return (
            <g key={key}>
              <Box x={x} y={y} w={w} h={64} c={failed ? "red" : nodeColour(t, c)} className={on && !failed ? "cur" : undefined} />
              <T x={x + 9} y={y + 26} k="t" size={11.5}>{t}</T>
              <T x={x + 9} y={y + 46} size={10}>{s}</T>
            </g>
          );
        })}
      </Drawing>
      {mode !== "brk" && (
        <div className="mt-4">
          <StepNav k={k} count={path.length} onChange={setK} noun="hop" />
        </div>
      )}
      <div aria-live="polite" className="border-rule mt-4 border-t pt-4">
        {mode === "brk" ? (
          <>
            <p className="text-fault text-[17px] font-bold">
              {brk.label} · fails at hop {brk.at + 1}: {j.req[brk.at].t}
            </p>
            <div className="mt-3 grid gap-x-8 gap-y-4 md:grid-cols-2">
              <Fact label="What breaks">
                <Rich text={brk.what} />
              </Fact>
              <Fact label="What the shopper sees">
                <b className="text-fault">{brk.sees}</b>
              </Fact>
              <Fact label="The log line that reveals it" mono>
                {brk.log}
              </Fact>
              <Fact label="Fix">
                <Rich text={brk.fix} />
                <span className="text-ink-faint">{chapters(brk.ch)}</span>
              </Fact>
            </div>
          </>
        ) : (
          <>
            <p className="text-ink text-[17px] font-bold">
              {mode === "ret" ? "Return " : ""}hop {at + 1} of {path.length} · {hop.t}
            </p>
            <div className="mt-3 grid gap-x-8 gap-y-4 md:grid-cols-2">
              <Fact label="What happens">
                <Rich text={hop.what} />
              </Fact>
              <Fact label="Decided by">
                <Rich text={hop.dec} />
                <span className="text-ink-faint">{chapters(hop.ch)}</span>
              </Fact>
              <Fact label="Packet" mono>
                {hop.pkt}
              </Fact>
              <Fact label="Recorded in">
                <Rich text={hop.log} />
              </Fact>
            </div>
          </>
        )}
      </div>
    </WidgetFrame>
  );
}

const CAP1 = data.CAP1 as unknown as JourneyData;
const CAP2 = data.CAP2 as unknown as JourneyData;

/** A product photo, from the shopper's phone through a VM to the database. */
export function Cap1() {
  return <Journey data={CAP1} label="A photo, through a VM to the database" />;
}

/** A payment, through Cloud Run and Cloud NAT to PayGate. */
export function Cap2() {
  return <Journey data={CAP2} label="A payment, through Cloud Run to PayGate" />;
}

type Question = { q: string; o: string[]; a: number; why: string; ch: string };

/** The options in a fixed shuffled order per question, so the page renders the same everywhere. */
function shuffled(q: Question, seed: number) {
  const order = q.o.map((_, i) => i);
  let s = seed * 9301 + 49297;
  for (let i = order.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...q, o: order.map((i) => q.o[i]), a: order.indexOf(q.a) };
}

function Quiz({ questions, label, seed }: { questions: Question[]; label: string; seed: number }) {
  const qs = useMemo(() => questions.map((q, i) => shuffled(q, seed + i)), [questions, seed]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const done = Object.keys(answers).length;
  const right = Object.entries(answers).filter(([i, a]) => qs[+i].a === a).length;
  return (
    <WidgetFrame label={label}>
      <ol className="space-y-6">
        {qs.map((q, i) => {
          const picked = answers[i];
          const answered = picked !== undefined;
          return (
            <li key={q.q} className="border-rule border-b pb-5 last:border-b-0 last:pb-0">
              <p className="text-ink text-[16px] leading-[1.5] font-semibold">
                <span className="text-ink-faint mr-2 font-mono text-[14px]">{i + 1}.</span>
                {q.q}
              </p>
              <div className="mt-3 grid gap-2" role="group" aria-label={`Answers to question ${i + 1}`}>
                {q.o.map((opt, j) => (
                  <button
                    key={opt}
                    type="button"
                    disabled={answered}
                    onClick={() => setAnswers((x) => ({ ...x, [i]: j }))}
                    aria-pressed={picked === j}
                    className={cn(
                      "flex min-h-10 items-center gap-2.5 rounded-[2px] border px-3 py-2 text-left text-[15px] transition-colors",
                      !answered && "border-rule-strong text-ink hover:border-ink hover:bg-sunk cursor-pointer",
                      answered && j === q.a && "border-ink bg-ink text-ground font-semibold",
                      answered && j === picked && j !== q.a && "border-ink text-ink line-through",
                      answered && j !== picked && j !== q.a && "border-rule text-ink-faint",
                    )}
                  >
                    {answered && j === q.a && <IconCheck size={11} />}
                    {opt}
                  </button>
                ))}
              </div>
              <div aria-live="polite">
                {answered && (
                  <p className="text-ink-body mt-3 flex gap-2 text-[15px] leading-[1.5] text-pretty">
                    <span className="text-ink mt-[5px] shrink-0" aria-hidden="true">
                      {picked === q.a ? <IconCheck size={11} /> : <IconX size={10} />}
                    </span>
                    <span>
                      <b className="text-ink">{picked === q.a ? "Correct." : "Not quite."}</b> {q.why}{" "}
                      <span className="text-ink-faint">See chapter {q.ch}.</span>
                    </span>
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <p className="text-ink-muted text-[14.5px]">
          {right} of {done} right · {qs.length - done} left
        </p>
        {done > 0 && <Action onClick={() => setAnswers({})}>Start over</Action>}
      </div>
    </WidgetFrame>
  );
}

const QUIZ1 = data.QUIZ1 as Question[];
const QUIZ2 = data.QUIZ2 as Question[];

/** Questions on the photo journey. */
export function Quiz1() {
  return <Quiz questions={QUIZ1} label="Check yourself: the photo journey" seed={1} />;
}

/** Questions on the payment journey. */
export function Quiz2() {
  return <Quiz questions={QUIZ2} label="Check yourself: the payment journey" seed={2} />;
}

/** Kadé's whole platform after the last chapter. */
export function FinalMap() {
  return (
    <WidgetFrame wide label="Kadé's platform, finished">
      <div className="dd-fig">
        <svg viewBox="0 0 960 656" role="img" aria-label="Kadé's finished platform: outside GCP, the Google front door, kade-vpc, governance and observability">
          <rect className="zone" x="10" y="10" width="190" height="636" rx="2" />
          <text className="s" x="22" y="30" style={{"fontSize": "12.5px"}}>OUTSIDE GCP</text>
          <rect className="n" x="16" y="44" width="178" height="58" rx="2" />
          <text className="t" x="26" y="64" style={{"fontSize": "13px"}}>Shoppers</text>
          <text className="s" x="26" y="81" style={{"fontSize": "12px"}}>phones, browsers</text>
          <rect className="n" x="16" y="118" width="178" height="74" rx="2" />
          <text className="t" x="26" y="138" style={{"fontSize": "13px"}}>Cloudflare</text>
          <text className="s" x="26" y="155" style={{"fontSize": "12px"}}>DNS for kade.lk · proxy</text>
          <text className="f" x="26" y="170" style={{"fontSize": "12px"}}>WAF · cache · Full (strict)</text>
          <rect className="n" x="16" y="212" width="178" height="74" rx="2" />
          <text className="t" x="26" y="232" style={{"fontSize": "13px"}}>Kadé office</text>
          <text className="s" x="26" y="249" style={{"fontSize": "12px"}}>172.16.0.0/16</text>
          <text className="f" x="26" y="264" style={{"fontSize": "12px"}}>↔ HA VPN + BGP</text>
          <rect className="n" x="16" y="306" width="178" height="74" rx="2" />
          <text className="t" x="26" y="326" style={{"fontSize": "13px"}}>PayGate</text>
          <text className="s" x="26" y="343" style={{"fontSize": "12px"}}>allows 34.87.200.7</text>
          <text className="f" x="26" y="358" style={{"fontSize": "12px"}}>← calls via Cloud NAT</text>
          <rect className="zone plum" x="212" y="10" width="236" height="636" rx="2" />
          <text className="s" x="224" y="30" style={{"fontSize": "12.5px"}}>GOOGLE FRONT DOOR</text>
          <rect className="n plum" x="224" y="44" width="212" height="74" rx="2" />
          <text className="t" x="234" y="64" style={{"fontSize": "13px"}}>Global external App LB</text>
          <text className="s" x="234" y="81" style={{"fontSize": "12px"}}>34.120.88.10 · :443 + :80</text>
          <text className="f" x="234" y="96" style={{"fontSize": "12px"}}>cert map · SSL policy kade-tls</text>
          <rect className="n amber" x="224" y="132" width="212" height="74" rx="2" />
          <text className="t" x="234" y="152" style={{"fontSize": "13px"}}>kade-url-map</text>
          <text className="s" x="234" y="169" style={{"fontSize": "12px"}}>api.kade.lk → kade-api</text>
          <text className="f" x="234" y="184" style={{"fontSize": "12px"}}>www → static · /media/* → media</text>
          <rect className="n amber" x="224" y="220" width="212" height="74" rx="2" />
          <text className="t" x="234" y="240" style={{"fontSize": "13px"}}>Cloud Armor kade-edge-policy</text>
          <text className="s" x="234" y="257" style={{"fontSize": "12px"}}>Cloudflare + secret header</text>
          <text className="f" x="234" y="272" style={{"fontSize": "12px"}}>WAF · rate limit per visitor</text>
          <rect className="n teal" x="224" y="308" width="212" height="58" rx="2" />
          <text className="t" x="234" y="328" style={{"fontSize": "13px"}}>kade-api-backend</text>
          <text className="s" x="234" y="345" style={{"fontSize": "12px"}}>serverless NEG</text>
          <text className="f" x="234" y="360" style={{"fontSize": "12px"}}>→ Cloud Run kade-api</text>
          <rect className="n teal" x="224" y="374" width="212" height="58" rx="2" />
          <text className="t" x="234" y="394" style={{"fontSize": "13px"}}>kade-media-backend</text>
          <text className="s" x="234" y="411" style={{"fontSize": "12px"}}>instance group · RATE 80</text>
          <text className="f" x="234" y="426" style={{"fontSize": "12px"}}>→ kade-media-mig (sn-app)</text>
          <rect className="n teal" x="224" y="440" width="212" height="44" rx="2" />
          <text className="t" x="234" y="460" style={{"fontSize": "13px"}}>kade-static</text>
          <text className="s" x="234" y="477" style={{"fontSize": "12px"}}>bucket · Cloud CDN</text>
          <rect className="n teal" x="224" y="494" width="212" height="88" rx="2" />
          <text className="t" x="234" y="514" style={{"fontSize": "13px"}}>Cloud Run kade-api</text>
          <text className="s" x="234" y="531" style={{"fontSize": "12px"}}>ingress: internal + LB</text>
          <text className="f" x="234" y="546" style={{"fontSize": "12px"}}>egress: Direct VPC → sn-run</text>
          <rect className="zone teal" x="460" y="10" width="490" height="400" rx="2" />
          <text className="s" x="472" y="30" style={{"fontSize": "12.5px"}}>kade-prod · kade-vpc · plan 10.10.0.0/16 · asia-southeast1</text>
          <rect className="zone" x="472" y="42" width="230" height="140" rx="2" />
          <text className="s" x="482" y="60" style={{"fontSize": "12px"}}>sn-app 10.10.1.0/24</text>
          <rect className="n green" x="482" y="68" width="210" height="50" rx="2" />
          <text className="t" x="492" y="88" style={{"fontSize": "13px"}}>kade-media-mig</text>
          <text className="s" x="492" y="105" style={{"fontSize": "12px"}}>regional · 2-8 VMs</text>
          <rect className="n green" x="482" y="124" width="210" height="50" rx="2" />
          <text className="t" x="492" y="144" style={{"fontSize": "13px"}}>kade-worker</text>
          <text className="s" x="492" y="161" style={{"fontSize": "12px"}}>10.10.1.20 · inventory API</text>
          <rect className="zone" x="472" y="192" width="230" height="64" rx="2" />
          <text className="s" x="482" y="210" style={{"fontSize": "12px"}}>sn-run 10.10.3.0/24</text>
          <text className="f" x="482" y="230" style={{"fontSize": "12px"}}>Cloud Run egress addresses</text>
          <text className="f" x="482" y="246" style={{"fontSize": "12px"}}>sn-data 10.10.2.0/24: empty</text>
          <rect className="zone plum" x="472" y="266" width="230" height="80" rx="2" />
          <text className="s" x="482" y="284" style={{"fontSize": "12px"}}>PSA 10.10.32.0/20 (peering)</text>
          <rect className="n green" x="482" y="292" width="210" height="46" rx="2" />
          <text className="t" x="492" y="311" style={{"fontSize": "13px"}}>Cloud SQL kade-sql</text>
          <text className="s" x="492" y="329" style={{"fontSize": "12px"}}>10.10.32.3 · TLS only</text>
          <rect className="n amber" x="472" y="352" width="230" height="62" rx="2" />
          <text className="t" x="482" y="372" style={{"fontSize": "13px"}}>Firewall (by service account)</text>
          <text className="s" x="482" y="389" style={{"fontSize": "12px"}}>lb-to-media · IAP SSH</text>
          <text className="s" x="482" y="405" style={{"fontSize": "12px"}}>warehouse</text>
          <rect className="n teal" x="714" y="42" width="224" height="58" rx="2" />
          <text className="t" x="724" y="62" style={{"fontSize": "13px"}}>Cloud NAT kade-nat</text>
          <text className="s" x="724" y="79" style={{"fontSize": "12px"}}>34.87.200.7 · kade-router</text>
          <rect className="n teal" x="714" y="108" width="224" height="58" rx="2" />
          <text className="t" x="724" y="128" style={{"fontSize": "13px"}}>HA VPN kade-havpn</text>
          <text className="s" x="724" y="145" style={{"fontSize": "12px"}}>2 tunnels · kade-vpn-router</text>
          <text className="f" x="724" y="160" style={{"fontSize": "12px"}}>BGP 64512 ↔ 65010</text>
          <rect className="n plum" x="714" y="174" width="224" height="58" rx="2" />
          <text className="t" x="724" y="194" style={{"fontSize": "13px"}}>Cloud DNS</text>
          <text className="s" x="724" y="211" style={{"fontSize": "12px"}}>private zone kade.internal</text>
          <text className="f" x="724" y="226" style={{"fontSize": "12px"}}>db · worker · fwd office.kade.lan</text>
          <rect className="n plum" x="714" y="240" width="224" height="58" rx="2" />
          <text className="t" x="724" y="260" style={{"fontSize": "13px"}}>Private Google Access</text>
          <text className="s" x="724" y="277" style={{"fontSize": "12px"}}>on all subnets</text>
          <text className="f" x="724" y="292" style={{"fontSize": "12px"}}>Cloud Storage · Secret Manager</text>
          <rect className="n plum" x="714" y="306" width="224" height="94" rx="2" />
          <text className="t" x="724" y="326" style={{"fontSize": "13px"}}>Admin access</text>
          <text className="s" x="724" y="343" style={{"fontSize": "12px"}}>IAP · OS Login</text>
          <text className="f" x="724" y="358" style={{"fontSize": "12px"}}>no external IPs anywhere</text>
          <rect className="zone" x="460" y="420" width="490" height="116" rx="2" />
          <text className="s" x="472" y="440" style={{"fontSize": "12.5px"}}>GOVERNANCE · org kade.lk / folder production</text>
          <text className="s" x="472" y="460" style={{"fontSize": "12px"}}>org policies: no external IPs · no public Cloud SQL</text>
          <text className="s" x="472" y="476" style={{"fontSize": "12px"}}>Cloud Run ingress · no default network · OS Login</text>
          <text className="s" x="472" y="492" style={{"fontSize": "12px"}}>no service account keys</text>
          <text className="s" x="472" y="508" style={{"fontSize": "12px"}}>folder firewall policy: no 22/3389 from internet</text>
          <text className="s" x="472" y="524" style={{"fontSize": "12px"}}>VPC-SC dry run · CI writes</text>
          <rect className="zone" x="460" y="548" width="490" height="98" rx="2" />
          <text className="s" x="472" y="568" style={{"fontSize": "12.5px"}}>OBSERVABILITY</text>
          <text className="s" x="472" y="588" style={{"fontSize": "12px"}}>LB logs 100% · Cloud Run JSON logs with CF-Ray</text>
          <text className="s" x="472" y="604" style={{"fontSize": "12px"}}>flow logs sn-app, sn-run · NAT errors · dashboard (6 panels)</text>
          <text className="s" x="472" y="620" style={{"fontSize": "12px"}}>8 alerts · uptime check via Cloudflare</text>
          <text className="s" x="472" y="636" style={{"fontSize": "12px"}}>saved Connectivity Tests · Ops Agent on VMs</text>
          <path className="w" d="M105 102 L 105 115" markerEnd="url(#dd-ah-muted)" style={{"opacity": ".85"}} />
          <path className="w" d="M194 150 C 206 150, 208 84, 221 82" markerEnd="url(#dd-ah-muted)" style={{"opacity": ".85"}} />
          <path className="w" d="M330 118 L 330 129" markerEnd="url(#dd-ah-muted)" style={{"opacity": ".85"}} />
          <path className="w" d="M330 206 L 330 217" markerEnd="url(#dd-ah-muted)" style={{"opacity": ".85"}} />
          <path className="w" d="M330 294 L 330 305" markerEnd="url(#dd-ah-muted)" style={{"opacity": ".85"}} />
        </svg>
      </div>
      <WidgetNote>
        Shopper → Cloudflare → load balancer → URL map → Cloud Armor → one of three backends. Everything a backend calls goes out through kade-vpc on the right.
      </WidgetNote>
    </WidgetFrame>
  );
}
