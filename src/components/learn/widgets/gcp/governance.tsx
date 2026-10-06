"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import data from "../data/gcp.json";
import { Choices, WidgetNote } from "../ui";
import { WidgetFrame } from "../widget-frame";
import { CaseExplorer, Result, type Case, type Tone } from "./case-explorer";
import { Box, Caps, Drawing, Mark, T, Wire } from "./draw";
import { Phases, Table } from "./kit";

/* Part 6 · Running it: governance (chapter 17). */

/** How a fixed network drifts, and the two things that stop it: prevent and detect. */
export function DriftModel() {
  const sources: [string, string, number][] = [
    ["Console click", '"just to test"', 30],
    ["New project", "default network again", 130],
    ["Contractor", "old Owner access", 230],
  ];
  return (
    <WidgetFrame wide label="How a network drifts">
      <Drawing h={310} label="Changes that would break the fixed network are refused by prevention; what gets past is found by detection and fixed again">
        <Box x={380} y={30} w={200} h={90} c="green" />
        <T x={394} y={58} k="t" size={13}>The fixed network</T>
        <T x={394} y={80} size={11}>chapters 2 to 16</T>
        <T x={394} y={98} k="f" size={11}>as it should be</T>
        {sources.map(([t, s, y]) => (
          <g key={t}>
            <Box x={16} y={y} w={190} h={70} c="red" />
            <T x={30} y={y + 28} k="t" size={12.5}>{t}</T>
            <T x={30} y={y + 48} size={11}>{s}</T>
            <path className="w fault" d={`M206 ${y + 35} C 228 ${y + 35}, 228 220, 247 220`} markerEnd="url(#dd-ah-fault)" />
          </g>
        ))}
        <Box x={250} y={150} w={132} h={140} c="orange" />
        <T x={262} y={176} k="t" size={12}>PREVENT</T>
        <T x={262} y={198} size={10.5}>org policies</T>
        <T x={262} y={214} size={10.5}>firewall policy</T>
        <T x={262} y={230} size={10.5}>IAM roles</T>
        <T x={262} y={246} size={10.5}>VPC-SC</T>
        <T x={262} y={272} bold size={10.5}>refused</T>
        <path className="w dash" d="M382 220 C 520 220, 580 170, 640 123" markerEnd="url(#dd-ah-muted)" />
        <T x={396} y={262} bold size={10.5}>what gets past prevention</T>
        <Box x={620} y={30} w={200} h={90} c="yellow" />
        <T x={634} y={58} k="t" size={13}>Drifted network</T>
        <T x={634} y={80} size={11}>a rule opened, an IP</T>
        <T x={634} y={98} size={11}>added</T>
        <Wire x1={580} y1={75} x2={617} y2={75} />
        <Box x={620} y={170} w={200} h={120} c="blue" />
        <T x={634} y={196} k="t" size={12}>DETECT</T>
        <T x={634} y={218} size={10.5}>audit log alerts</T>
        <T x={634} y={234} size={10.5}>Security Command Center</T>
        <T x={634} y={250} size={10.5}>Asset Inventory · drift plan</T>
        <T x={634} y={274} bold size={10.5}>found in minutes</T>
        <Wire x1={720} y1={120} x2={720} y2={167} c="blue" />
        <path className="w green" d="M820 230 C 900 230, 900 20, 600 20 L 585 30" markerEnd="url(#dd-ah-green)" />
        <T x={860} y={40} bold size={10.5}>fixed again</T>
      </Drawing>
    </WidgetFrame>
  );
}

/** Organization, folders and projects: rules flow down. */
export function GovHier() {
  return (
    <WidgetFrame wide label="The resource hierarchy">
      <Drawing h={300} label="Organization kade.lk, folders production and sandbox, and the projects inside them">
        <Box x={330} y={16} w={300} h={64} c="purple" />
        <T x={346} y={42} k="t" size={13}>Organization kade.lk</T>
        <T x={346} y={62} size={10.5}>org policies · IAM · firewall policy</T>
        <Box x={150} y={120} w={300} h={64} c="purple" />
        <T x={166} y={146} k="t" size={13}>Folder production</T>
        <T x={166} y={166} size={10.5}>stricter policies for live systems</T>
        <Box x={510} y={120} w={300} h={64} />
        <T x={526} y={146} k="t" size={13}>Folder sandbox (example)</T>
        <T x={526} y={166} size={10.5}>looser, for experiments</T>
        {(
          [
            [40, "kade-prod"],
            [250, "kade-staging"],
          ] as const
        ).map(([x, n]) => (
          <g key={n}>
            <Box x={x} y={230} w={200} h={64} c="blue" />
            <T x={x + 14} y={256} k="t" size={12.5}>{`Project ${n}`}</T>
            <T x={x + 14} y={276} size={10.5}>inherits both levels above</T>
          </g>
        ))}
        <Box x={560} y={230} w={200} h={64} />
        <T x={574} y={256} k="t" size={12.5}>Project dev-tests</T>
        <T x={574} y={276} size={10.5}>inherits org + sandbox</T>
        <Wire x1={440} y1={80} x2={320} y2={117} />
        <Wire x1={520} y1={80} x2={640} y2={117} />
        <Wire x1={250} y1={184} x2={150} y2={227} />
        <Wire x1={330} y1={184} x2={350} y2={227} />
        <Wire x1={660} y1={184} x2={660} y2={227} />
        <line className="w" x1={900} y1={30} x2={900} y2={280} strokeWidth={3} markerEnd="url(#dd-ah-muted)" />
        <T x={850} y={40} end bold size={11}>inherited</T>
        <T x={850} y={56} end bold size={11}>downward</T>
      </Drawing>
      <WidgetNote>
        Set a rule as high as it is true for everything below it. Stricter rules for live systems go on the production folder; experiments get their own folder.
      </WidgetNote>
    </WidgetFrame>
  );
}

const ORGPOL_CASES: Case[] = [
  {
    k: "Inherited",
    take: "The policy is set once, on the <b>production</b> folder. kade-prod and kade-staging have nothing set themselves, so they <b>inherit</b> it. A project created in the folder next year is covered the moment it exists.",
    cfg: "folders/production: compute.vmExternalIpAccess → denyAll\nkade-prod:    (not set) → inherits denyAll\nkade-staging: (not set) → inherits denyAll",
  },
  {
    k: "An exception",
    take: "A project can carry its own policy that <b>replaces</b> the inherited one, if someone with the Organization Policy Administrator role sets it. Here kade-vpn-test may give one VM an external IP. Exceptions show up when you list the policies set on a project (command 2, with --project), and should be rare and named.",
    cfg: "folders/production: compute.vmExternalIpAccess → denyAll\nkade-vpn-test: compute.vmExternalIpAccess → allowedValues:\n  projects/kade-vpn-test/zones/asia-southeast1-a/instances/vpn-probe",
  },
  {
    k: "List merging",
    take: "For list constraints, a child can <b>merge</b> with its parent instead of replacing it (<code>inheritFromParent: true</code>). The organization allows two Cloud Run ingress values; the folder adds nothing new and inherits, so both apply. Without merging, the child's list would replace the parent's.",
    cfg: "organization: run.allowedIngress → allowedValues: internal, internal-and-cloud-load-balancing\nfolders/production: inheritFromParent: true\n→ effective: internal, internal-and-cloud-load-balancing",
  },
  {
    k: "Dry run",
    take: "A dry-run policy is evaluated but not enforced: every change that <b>would</b> have been refused is written to the audit log, and nothing is blocked. Run it for a week, look at what it caught, fix or except those, then enforce. It is the difference between a planned change and a Monday outage.",
    cfg: "name: folders/FOLDER_ID/policies/compute.vmExternalIpAccess\ndryRunSpec:\n  rules:\n  - denyAll: true",
  },
];

/** A level in the hierarchy and the effect a policy has there. */
function Level({ x, y, w, title, set, effect, c }: { x: number; y: number; w: number; title: string; set: string; effect: string; c: string }) {
  const tone = effect.startsWith("✓") ? "ok" : effect.startsWith("!") ? "warn" : "fault";
  return (
    <g>
      <Box x={x} y={y} w={w} h={86} c={c} />
      <T x={x + 14} y={y + 24} k="t" size={12.5}>{title}</T>
      <T x={x + 14} y={y + 46} size={10.5}>{set}</T>
      <T x={x + 14} y={y + 68} k={tone === "fault" ? "s c-red" : "s"} bold size={11}>
        {effect}
      </T>
    </g>
  );
}

function OrgPolView({ c }: { c: Case }) {
  if (c.k === "List merging") {
    return (
      <Drawing h={366} label="A list constraint merged from the organization down to kade-prod">
        <Level x={330} y={16} w={300} title="Organization kade.lk" set="set: allow internal, internal+LB" effect="✓ effective: those two" c="purple" />
        <Level x={330} y={140} w={300} title="Folder production" set="set: inheritFromParent: true" effect="✓ effective: the same two" c="purple" />
        <Level x={330} y={264} w={300} title="Project kade-prod" set="not set" effect="✓ effective: the same two" c="blue" />
        <Wire x1={480} y1={102} x2={480} y2={137} c="orange" />
        <Wire x1={480} y1={226} x2={480} y2={261} c="orange" />
        <Box x={680} y={140} w={264} h={86} c="red" />
        <T x={694} y={166} size={11}>A Cloud Run deploy with</T>
        <T x={694} y={184} size={11}>--ingress=all in kade-prod</T>
        <T x={694} y={206} k="s c-red" bold size={11}>✕ refused: value not allowed</T>
      </Drawing>
    );
  }
  const dry = c.k === "Dry run";
  const exception = c.k === "An exception";
  const result: [Tone, string] = dry
    ? ["warn", "Dry run: every would-be refusal is logged; nothing breaks while you check"]
    : exception
      ? ["ok", "One named exception; everything else in the folder still refused"]
      : ["ok", "Set once on the folder; every project, now and later, follows"];
  return (
    <div className="space-y-3">
      <Drawing h={270} label="A folder policy and the projects below it">
        <Level
          x={330}
          y={16}
          w={300}
          title="Folder production"
          set={`set: deny external IPs${dry ? " (dry run)" : ""}`}
          effect={dry ? "! logged, not blocked" : "✕ external IPs refused"}
          c="purple"
        />
        <Level x={80} y={170} w={280} title="Project kade-prod" set="not set" effect={dry ? "! would be refused: logged" : "✕ inherited: refused"} c="blue" />
        <Level
          x={600}
          y={170}
          w={280}
          title={exception ? "Project kade-vpn-test" : "Project kade-staging"}
          set={exception ? "set: allow VM vpn-probe only" : "not set"}
          effect={exception ? "✓ vpn-probe may; others refused" : dry ? "! would be refused: logged" : "✕ inherited: refused"}
          c={exception ? "yellow" : "blue"}
        />
        <Wire x1={420} y1={102} x2={260} y2={167} c="orange" />
        <Wire x1={540} y1={102} x2={700} y2={167} c={exception ? undefined : "orange"} dash={exception} />
        {exception && (
          <T x={640} y={140} bold size={10.5}>
            replaces the inherited policy
          </T>
        )}
      </Drawing>
      <Result tone={result[0]}>
        <b>{result[1]}</b>
      </Result>
    </div>
  );
}

/** Organization policies: inherited, excepted, merged, tried in dry run. */
export function OrgPolEx() {
  return <CaseExplorer label="Organization policy examples" cases={ORGPOL_CASES} render={(c) => <OrgPolView c={c} />} />;
}

const CONSTRAINTS = data.CONSTRAINTS as unknown as Record<string, [string, string, string, string, string][]>;

/** The constraints that guard a network, by area. */
export function Constraints() {
  const keys = Object.keys(CONSTRAINTS);
  const [k, setK] = useState(keys[0]);
  return (
    <WidgetFrame wide label="Organization policy constraints for the network">
      <Choices label="Area" value={k} onChange={setK} options={keys.map((x) => ({ value: x, label: x }))} />
      <div aria-live="polite" className="mt-5">
        <Table
          head={["Constraint", "Type", "Blocks", "Chapter", "Kadé"]}
          mono={[0, 1, 3]}
          minWidth={860}
          rows={CONSTRAINTS[k].map(([name, type, blocks, ch, kade]) => [name, type, blocks, `ch ${ch}`, <b key="k">{kade}</b>])}
        />
      </div>
    </WidgetFrame>
  );
}

const GUARD_LAYERS = data.GUARD_LAYERS as string[];
const GUARDRAILS = data.GUARDRAILS as unknown as Record<string, ["block" | "skip" | "pass" | "detect" | "note" | "vpcsc", string][]>;

/** Try a risky change and see which guardrail catches it, if any. */
export function Guardrails() {
  const keys = Object.keys(GUARDRAILS);
  const [k, setK] = useState(keys[0]);
  const layers = GUARDRAILS[k];
  const stopAt = layers.findIndex(([kind]) => kind === "block" || kind === "vpcsc");
  const stopped = stopAt >= 0;
  const cells = layers.map(([kind, text], i) => {
    const reached = !stopped || i <= stopAt;
    let word = "not reached";
    let tone: "stop" | "pass" | "notice" | "none" = "none";
    if (reached) {
      if (kind === "block" || kind === "vpcsc") {
        word = kind === "vpcsc" ? "STOPS IT (VPC-SC)" : "STOPS IT";
        tone = "stop";
      } else if (kind === "pass") {
        word = "lets it through";
        tone = "pass";
      } else if (kind === "detect" || kind === "note") {
        word = "notices";
        tone = "notice";
      } else word = "does not apply";
    }
    return { reached, word, tone, text };
  });
  const verdict: [Tone, string] = stopped
    ? layers.some(([kind]) => kind === "vpcsc")
      ? ["ok", "Refused once the perimeter is enforced. While Kadé's perimeter is in dry run, it is only logged."]
      : ["ok", "Refused before it happened."]
    : layers.some(([kind]) => kind === "detect" || kind === "note")
      ? ["warn", "Allowed, but noticed within minutes: someone must act on the alert."]
      : ["fault", "Allowed and unnoticed."];
  return (
    <WidgetFrame wide label="Which guardrail catches it?">
      <Choices label="Change" value={k} onChange={setK} options={keys.map((x) => ({ value: x, label: x }))} />
      <div aria-live="polite" className="mt-5 space-y-4">
        <ol className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {cells.map((cell, i) => (
            <li
              key={GUARD_LAYERS[i]}
              className={cn(
                "rounded-[2px] border px-3 py-2.5",
                cell.tone === "stop" ? "border-ink border-2" : cell.tone === "pass" ? "border-ink-faint border-dashed" : "border-rule",
                !cell.reached && "opacity-40",
              )}
            >
              <span className="text-ink-faint block font-mono text-[12px]">
                {i + 1} · {GUARD_LAYERS[i]}
              </span>
              <span className={cn("mt-1 block text-[15px] font-bold", cell.tone === "none" ? "text-ink-muted" : "text-ink")}>
                {cell.tone === "notice" ? <span className="dd-mark">{cell.word}</span> : cell.word}
              </span>
              <span className="text-ink-body mt-1 block text-[14px] leading-[1.45]">{cell.reached ? cell.text : ""}</span>
            </li>
          ))}
        </ol>
        <Result tone={verdict[0]}>
          <b>{verdict[1]}</b>
        </Result>
      </div>
    </WidgetFrame>
  );
}

/** Who can change what, after the IAM clean-up. */
export function IamFlow() {
  const who: [string, string, string, string][] = [
    ["kade-platform@ group", "Network Admin + Security Admin", "on folder production", "green"],
    ["Developers", "Network Viewer", "read only", "blue"],
    ["CI service account", "Network Admin + Security Admin", "writes from reviewed code", "purple"],
    ["Break-glass (2 accounts)", "Owner", "used only in emergencies, alerted", "yellow"],
  ];
  const can: [string, string][] = [
    ["subnets, routes, LB, NAT, VPN", "networkAdmin"],
    ["firewall rules, SSL policies", "securityAdmin"],
    ["look at everything", "networkViewer"],
    ["anything, incl. IAM", "owner"],
  ];
  return (
    <WidgetFrame wide label="Who can change the network">
      <Drawing h={310} label="Four kinds of principal and the roles they hold">
        <Caps x={16} y={22}>WHO CAN CHANGE WHAT, AFTER THE CLEAN-UP</Caps>
        {who.map(([t, role, note, c], i) => {
          const y = 40 + 66 * i;
          return (
            <g key={t}>
              <Box x={16} y={y} w={250} h={54} c={c} />
              <T x={30} y={y + 22} k="t" size={12.5}>{t}</T>
              <T x={30} y={y + 40} k="f" size={10.5}>{note}</T>
              <Wire x1={266} y1={y + 27} x2={333} y2={y + 27} />
              <Box x={336} y={y} w={280} h={54} />
              <T x={350} y={y + 32} size={12}>{role}</T>
            </g>
          );
        })}
        <Box x={660} y={40} w={284} h={252} />
        <T x={676} y={66} k="t" size={12.5}>What each can change</T>
        {can.map(([t, r], i) => (
          <g key={r}>
            <T x={676} y={96 + 48 * i} size={11.5}>{t}</T>
            <T x={676} y={114 + 48 * i} k="f" size={10.5}>{r}</T>
          </g>
        ))}
      </Drawing>
    </WidgetFrame>
  );
}

const VPCSC_CASES: Case[] = [
  {
    k: "Inside the perimeter",
    take: "kade-worker, inside kade-prod, reads a product photo from Cloud Storage. Both the caller and the bucket are inside the perimeter, so the request is checked by IAM as usual and allowed.",
    cfg: "perimeter kade-prod-perimeter: projects kade-prod\nrestricted services: storage.googleapis.com, sqladmin.googleapis.com, bigquery.googleapis.com",
  },
  {
    k: "Stolen credentials",
    what: [
      ["enf", "Perimeter enforced"],
      ["dry", "Perimeter in dry run"],
    ],
    take: {
      enf: "A key or token leaked, and an attacker uses it from their own laptop. IAM says yes: the credentials are valid. But the request comes from <b>outside</b> the perimeter and no access level lets it in, so VPC Service Controls refuses it. IAM alone would have allowed it.",
      dry: 'In dry run the same request is <b>allowed</b>, and a "would have been denied" entry is written to the audit log. Useful to learn what a real perimeter would break; it protects nothing yet.',
    },
    cfg: "Request from 203.0.113.99 (outside), valid token for sa-kade-worker\n→ VPC-SC: caller outside perimeter, no access level matches → DENIED",
  },
  {
    k: "Copy to another project",
    take: "Someone inside kade-prod tries to copy a bucket to a project <b>outside</b> the perimeter. Both projects must be inside the perimeter for data to move between them, so the copy is refused, even though the person may read the source bucket.",
    cfg: "gsutil cp gs://kade-prod-exports/* gs://personal-bucket/\n→ VPC-SC: destination project outside perimeter → DENIED",
  },
  {
    k: "The office, allowed in",
    take: "An <b>access level</b> lets requests from the office's public IP range in. The accountant's reporting tool can read BigQuery from the office, while the same credentials used anywhere else are still refused.",
    cfg: "access level kade-office: ipSubnetworks 198.51.100.20/32\nperimeter kade-prod-perimeter: accessLevels [kade-office]",
  },
];

function VpcScView({ c, what }: { c: Case; what: string }) {
  const dry = what === "dry";
  const outside = (x: number, y: number, t: string, s: string, col?: string) => (
    <g key={t}>
      <Box x={x} y={y} w={220} h={70} c={col} />
      <T x={x + 14} y={y + 28} k="t" size={12.5}>{t}</T>
      <T x={x + 14} y={y + 48} size={10.5}>{s}</T>
    </g>
  );
  let result: [Tone, string];
  let extra: ReactNode = null;
  if (c.k === "Inside the perimeter") {
    result = ["ok", "Allowed: both sides inside, IAM decides as usual"];
    extra = <Wire x1={490} y1={99} x2={507} y2={99} c="green" />;
  } else if (c.k === "Stolen credentials") {
    result = dry ? ["warn", 'Allowed, but logged as "would have been denied"'] : ["fault", "Refused at the perimeter, although IAM said yes"];
    extra = (
      <>
        {outside(16, 80, "Attacker's laptop", "valid stolen token", "red")}
        {dry ? (
          <>
            <path className="w dash" d="M236 115 C 330 150, 470 160, 560 136" markerEnd="url(#dd-ah-muted)" />
            <T x={332} y={190} bold size={10.5}>allowed + logged</T>
          </>
        ) : (
          <>
            <line className="w fault" x1={236} y1={115} x2={288} y2={115} />
            <Mark cx={300} cy={115} ok={false} r={12} />
          </>
        )}
      </>
    );
  } else if (c.k === "Copy to another project") {
    result = ["fault", "Refused: data may only move between projects inside the perimeter"];
    extra = (
      <>
        {outside(740, 120, "personal-project", "outside the perimeter", "red")}
        <path className="w fault" d="M680 99 C 720 99, 700 155, 728 155" />
        <Mark cx={700} cy={130} ok={false} r={12} />
      </>
    );
  } else {
    result = ["ok", "Office allowed in by IP; the same credentials elsewhere are refused"];
    extra = (
      <>
        {outside(16, 170, "Office PC", "198.51.100.20")}
        {outside(16, 40, "Same token, elsewhere", "203.0.113.99", "red")}
        <path className="w green" d="M236 205 C 380 205, 420 195, 507 195" markerEnd="url(#dd-ah-green)" />
        <T x={260} y={232} bold size={10.5}>access level kade-office</T>
        <path className="w fault" d="M236 75 C 270 75, 280 60, 296 60" />
        <Mark cx={300} cy={60} ok={false} />
      </>
    );
  }
  return (
    <div className="space-y-3">
      <Drawing h={286} label={`VPC Service Controls: ${c.k}`}>
        <rect className={cn("n green", dry && "dash")} x={300} y={20} width={400} height={250} rx="2" strokeWidth={2.5} />
        <T x={316} y={44} bold size={12}>{dry ? "perimeter (dry run: logs only)" : "service perimeter · kade-prod"}</T>
        <Box x={320} y={64} w={170} h={70} c="blue" />
        <T x={334} y={92} k="t" size={12.5}>kade-worker</T>
        <T x={334} y={112} size={10.5}>inside kade-prod</T>
        <Box x={510} y={64} w={170} h={70} c="purple" />
        <T x={524} y={92} k="t" size={12.5}>Cloud Storage</T>
        <T x={524} y={112} size={10.5}>kade-prod buckets</T>
        <Box x={510} y={160} w={170} h={70} c="purple" />
        <T x={524} y={188} k="t" size={12.5}>BigQuery</T>
        <T x={524} y={208} size={10.5}>sales data</T>
        {extra}
      </Drawing>
      <Result tone={result[0]}>
        <b>{result[1]}</b>
      </Result>
    </div>
  );
}

/** VPC Service Controls: what a perimeter adds on top of IAM. */
export function VpcScEx() {
  return <CaseExplorer label="VPC Service Controls examples" cases={VPCSC_CASES} render={(c, what) => <VpcScView c={c} what={what} />} />;
}

/** Changes through code review and CI, and how a console change is caught. */
export function IacFlow() {
  const steps: [string, string, string][] = [
    ["Change in Git", "pull request", ""],
    ["Review", "a second pair of eyes", "orange"],
    ["CI: terraform plan", "shows the exact diff", "purple"],
    ["CI: terraform apply", "only writer in kade-prod", "green"],
    ["GCP", "kade-vpc, rules, LB…", "blue"],
  ];
  return (
    <WidgetFrame wide label="Infrastructure as code">
      <Drawing h={272} label="A change goes from Git through review and CI to GCP; a console change is caught by the daily drift plan">
        {steps.map(([t, s, c], i) => {
          const x = 16 + 189 * i;
          return (
            <g key={t}>
              <Box x={x} y={30} w={170} h={70} c={c} />
              <T x={x + 12} y={58} k="t" size={12}>{t}</T>
              <T x={x + 12} y={80} size={10.5}>{s}</T>
              {i < 4 && <Wire x1={x + 170} y1={65} x2={x + 186} y2={65} />}
            </g>
          );
        })}
        <Box x={560} y={150} w={200} h={70} c="red" />
        <T x={574} y={178} k="t" size={12}>Console change</T>
        <T x={574} y={198} size={10.5}>someone opens port 22</T>
        <Wire x1={760} y1={185} x2={840} y2={104} c="red" />
        <Box x={190} y={150} w={300} h={70} c="yellow" />
        <T x={204} y={178} k="t" size={12}>Daily drift plan</T>
        <T x={204} y={198} size={10.5}>&quot;firewall rule differs from code&quot;</T>
        <path className="w dash" d="M850 100 C 850 250, 400 260, 340 222" markerEnd="url(#dd-ah-muted)" />
        <T x={600} y={256} k="s mid" bold size={11}>detected next morning, or by the audit log alert in minutes</T>
      </Drawing>
    </WidgetFrame>
  );
}

/** Governance in the order Kadé adds it. */
export function GovRollout() {
  return (
    <WidgetFrame wide label="Rolling out governance">
      <Phases
        phases={[
          [
            "Day 1",
            "about an hour",
            ["Remove the freelancer and unused Owners", "Two break-glass Owners; everyone else to narrow roles via a group", "Alert on firewall, route and address changes"],
          ],
          [
            "Week 1",
            "a few hours",
            [
              "Find violations with Asset Inventory and fix them",
              "Org: skip default network, require OS Login",
              "Folder: no external IPs, no public Cloud SQL, Cloud Run ingress",
            ],
          ],
          ["Month 1", "spread out", ["Security Command Center findings reviewed weekly", "No service account keys", "Dry-run VPC Service Controls perimeter"]],
          [
            "Later",
            "when stable",
            ["Import the network into Terraform; CI as the only writer", "Enforce the VPC-SC perimeter after a clean dry run", "Custom constraints for gaps"],
          ],
        ]}
      />
    </WidgetFrame>
  );
}
