"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Action, Select, Steps, WidgetNote } from "./ui";
import { WidgetFrame } from "./widget-frame";

/*
 * Chapter 32: a switch learns where each MAC lives and stops flooding; a hub
 * never learns; the router joins the two and builds a new frame.
 */

type Node = "R" | "S" | "H" | "FD" | "PR" | "LT" | "SC" | "PP" | "LP";
type Host = Exclude<Node, "R" | "S" | "H">;

const NET: Record<Node, { x: number; y: number; t: string; ip?: string; mac?: string; seg?: "S" | "H" }> = {
  R: { x: 460, y: 52, t: "Office router" },
  S: { x: 230, y: 150, t: "Switch (staff)" },
  H: { x: 690, y: 150, t: "Hub (warehouse)" },
  FD: { x: 90, y: 262, t: "Front desk PC", ip: "172.16.1.10", mac: "3c:7c:3f:10:22:01", seg: "S" },
  PR: { x: 230, y: 262, t: "Office printer", ip: "172.16.1.20", mac: "30:05:5c:8a:12:e0", seg: "S" },
  LT: { x: 370, y: 262, t: "Staff laptop", ip: "172.16.1.30", mac: "8c:85:90:4a:1e:77", seg: "S" },
  SC: { x: 550, y: 262, t: "Stock scanner", ip: "172.16.2.10", mac: "00:1b:44:11:3a:b7", seg: "H" },
  PP: { x: 690, y: 262, t: "Packing PC", ip: "172.16.2.11", mac: "70:85:c2:3d:4e:5f", seg: "H" },
  LP: { x: 830, y: 262, t: "Label printer", ip: "172.16.2.20", mac: "00:80:92:a1:b2:c3", seg: "H" },
};
const HOSTS: Host[] = ["FD", "PR", "LT", "SC", "PP", "LP"];
const RMAC = { S: "e4:8d:8c:00:01:01", H: "e4:8d:8c:00:01:02" };
const SPORT: Partial<Record<Node, number>> = { FD: 1, PR: 2, LT: 3, R: 4 };

type Lit = Record<string, "go" | "fl">;
type Cls = Partial<Record<Node, "src" | "acc" | "ign">>;

/** Send frames around the office and watch the switch's MAC table fill. */
export function NetSim({ wide }: { wide?: boolean }) {
  const [src, setSrc] = useState<Host>("FD");
  const [dst, setDst] = useState<Host>("PR");
  const [table, setTable] = useState<Record<string, number>>({});
  const [last, setLast] = useState<{ log: React.ReactNode[]; lit: Lit; cls: Cls } | null>(null);

  function send() {
    if (src === dst) return;
    const tbl = { ...table };
    const log: React.ReactNode[] = [];
    const lit: Lit = {};
    const cls: Cls = { [src]: "src" };

    const segment = (kind: "S" | "H", from: Node, sMac: string, dMac: string, into: Cls) => {
      const members: Node[] = kind === "S" ? ["FD", "PR", "LT", "R"] : ["SC", "PP", "LP", "R"];
      const others = members.filter((m) => m !== from);
      lit[`${from}-${kind}`] = "go";
      let outs: Node[];
      if (kind === "S") {
        const had = sMac in tbl;
        tbl[sMac] = SPORT[from]!;
        log.push(<>Switch learns: <code>{sMac}</code> is on port {SPORT[from]}{had ? " (already known)" : ""}.</>);
        if (dMac in tbl) {
          const port = tbl[dMac];
          outs = [(Object.keys(SPORT) as Node[]).find((k) => SPORT[k] === port)!];
          log.push(<>Switch knows <code>{dMac}</code> is on port {port}: forwards to that port only.</>);
          outs.forEach((o) => (lit[`S-${o}`] = "go"));
        } else {
          outs = others;
          log.push(<>Switch does not know <code>{dMac}</code> yet: <b className="text-ink">floods</b> out of every other port.</>);
          outs.forEach((o) => (lit[`S-${o}`] = "fl"));
        }
      } else {
        outs = others;
        log.push("Hub repeats the signal out of every other port, as always.");
        outs.forEach((o) => (lit[`H-${o}`] = "fl"));
      }
      for (const o of outs) {
        const mac = o === "R" ? RMAC[kind] : NET[o].mac;
        into[o] = mac === dMac ? "acc" : (into[o] ?? "ign");
      }
    };

    const A = NET[src];
    const B = NET[dst];
    if (A.seg === B.seg) {
      log.push(<><b className="text-ink">{A.t}</b> checks with its mask: {B.ip} is on its own network, so the frame goes straight to <code>{B.mac}</code>.</>);
      segment(A.seg!, src, A.mac!, B.mac!, cls);
      log.push(<><b className="text-ink">{B.t}</b> sees its own MAC and accepts the frame. Devices marked “ignored” received a copy and dropped it.</>);
    } else {
      log.push(<><b className="text-ink">{A.t}</b>: {B.ip} is on another network, so the frame goes to the gateway’s MAC <code>{RMAC[A.seg!]}</code> (chapter 5).</>);
      segment(A.seg!, src, A.mac!, RMAC[A.seg!], cls);
      log.push(<><b className="text-ink">Router</b> accepts it, reads the destination IP {B.ip}, routes it out of its other interface, lowers the TTL, and builds a <b className="text-ink">new frame</b>: <code>{RMAC[B.seg!]}</code> → <code>{B.mac}</code>.</>);
      cls.R = "acc";
      const second: Cls = {};
      segment(B.seg!, "R", RMAC[B.seg!], B.mac!, second);
      for (const [k, v] of Object.entries(second) as [Node, "acc" | "ign"][]) if (k !== "R") cls[k] = v;
      log.push(<><b className="text-ink">{B.t}</b> accepts it. The IP addresses never changed; the MACs changed at the router.</>);
    }
    setTable(tbl);
    setLast({ log, lit, cls });
  }

  const line = (a: Node, b: Node) => {
    const state = last?.lit[`${a}-${b}`] ?? last?.lit[`${b}-${a}`];
    return (
      <line
        key={`${a}-${b}`}
        className={cn("w", state === "go" && "hl", state === "fl" && "amber dash")}
        strokeWidth={state === "fl" ? 2.5 : undefined}
        x1={NET[a].x}
        y1={NET[a].y}
        x2={NET[b].x}
        y2={NET[b].y}
      />
    );
  };

  return (
    <WidgetFrame wide={wide} label="Switches, hubs and a router">
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        <Select label="From" value={src} onChange={setSrc} options={HOSTS.map((h) => ({ value: h, label: NET[h].t }))} />
        <Select label="To" value={dst} onChange={setDst} options={HOSTS.map((h) => ({ value: h, label: NET[h].t }))} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Action primary onClick={send}>Send a frame</Action>
        <Action onClick={() => { setTable({}); setLast(null); }}>Clear the switch’s table</Action>
      </div>
      <div className="dd-fig mt-4">
        <svg viewBox="0 0 920 300" role="img" aria-label="Office network: router connected to a staff switch and a warehouse hub, each with three devices">
          {line("R", "S")}
          {line("R", "H")}
          {(["FD", "PR", "LT"] as Node[]).map((h) => line("S", h))}
          {(["SC", "PP", "LP"] as Node[]).map((h) => line("H", h))}
          {(["R", "S", "H"] as Node[]).map((k) => {
            const n = NET[k];
            const acc = last?.cls[k] === "acc";
            return (
              <g key={k}>
                <rect className={cn("n", k === "R" ? "teal" : undefined, acc && "dst")} x={n.x - 75} y={n.y - 22} width="150" height="44" rx="2" />
                <text className="t mid" x={n.x} y={n.y + 5} fontSize="12.5">{n.t}</text>
              </g>
            );
          })}
          {HOSTS.map((k) => {
            const n = NET[k];
            const c = last?.cls[k];
            return (
              <g key={k}>
                <rect
                  className={cn("n", c === "src" && "src", c === "acc" && "dst", c === "ign" && "amber dash")}
                  x={n.x - 66}
                  y={n.y - 24}
                  width="132"
                  height="58"
                  rx="2"
                />
                <text className="mid" x={n.x} y={n.y - 4} fontSize="12">{n.t}</text>
                <text className="s mid" x={n.x} y={n.y + 12}>{n.ip}</text>
                {c && (
                  <text className="l mid" x={n.x} y={n.y + 27}>
                    {c === "ign" ? "ignored" : c === "acc" ? "accepted" : "sender"}
                  </text>
                )}
              </g>
            );
          })}
          <text className="s" x="16" y="20">eth1 {RMAC.S}</text>
          <text className="s" x="904" y="20" textAnchor="end">eth2 {RMAC.H}</text>
        </svg>
      </div>
      <ul className="text-ink-muted mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13.5px]">
        <li className="inline-flex items-center gap-2"><span aria-hidden="true" className="bg-green inline-block h-[3px] w-5" />forwarded to one port</li>
        <li className="inline-flex items-center gap-2"><span aria-hidden="true" className="border-amber inline-block w-5 border-t-2 border-dashed" />flooded / repeated to all</li>
        <li>accepted · ignored (got a copy) · sender, written under each device</li>
      </ul>
      <div className="mt-4" aria-live="polite">
        {last ? (
          <Steps>{last.log}</Steps>
        ) : (
          <WidgetNote>
            Try: send Front desk → Printer twice (flood, then forward), then Printer → Front desk. Then send inside the
            warehouse and compare.
          </WidgetNote>
        )}
      </div>
      <table className="mt-4 w-full min-w-[520px] border-collapse text-left">
        <thead>
          <tr className="border-ink border-b">
            {["Switch MAC table", "Port", "Device"].map((h) => (
              <th key={h} className="text-ink py-2 pr-4 text-[14px] font-bold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(table).length ? (
            Object.entries(table).map(([mac, port]) => {
              const who = (Object.keys(NET) as Node[]).find((k) => NET[k].mac === mac);
              return (
                <tr key={mac} className="border-rule border-b">
                  <td className="text-ink py-2 pr-4 font-mono text-[14px]">{mac}</td>
                  <td className="text-ink py-2 pr-4 font-mono text-[14px]">port {port}</td>
                  <td className="text-ink py-2 text-[15px]">{who ? NET[who].t : "Office router (eth1)"}</td>
                </tr>
              );
            })
          ) : (
            <tr className="border-rule border-b">
              <td className="text-ink-faint py-2 text-[14px]" colSpan={3}>empty: the switch has learned nothing yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </WidgetFrame>
  );
}
