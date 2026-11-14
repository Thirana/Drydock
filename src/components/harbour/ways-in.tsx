"use client";

import { useState } from "react";
import { ScrollX } from "@/components/learn/scroll-x";
import type { HarbourState } from "@/hooks/use-harbour-state";
import { cn } from "@/lib/utils";
import {
  Cross,
  Plain,
  WalkProvider,
  Wire,
  Words,
  Zone,
} from "./journey-drawing-kit";
import { StateSwitch } from "./state-switch";

/** Every defect this drawing names; fixed closes them all. */
const IDS = ["D8", "D6", "D5", "D3b", "D1", "D2", "D3a", "D16"];

// Rows: the top of each box, then the line its door runs along.
const ROW = [60, 140, 220, 300, 416, 496];
const MID = ROW.map((y) => y + 29);
const START = 146; // the internet box's right edge
const EDGE = 372; // where Google Cloud starts
const COL = { x: 400, w: 180 }; // what each door reaches
const GATE = { x: 204, w: 146 }; // a checkpoint outside Google Cloud
const HEIGHT = 580;

/** A door's number where it leaves the internet: red while it goes straight in. */
function Door({ n, y, state }: { n: number; y: number; state: DoorState }) {
  return (
    <g aria-hidden="true" style={{ opacity: state === "shut" ? 0.45 : 1 }}>
      <circle
        className={state === "open" ? "bad" : "badge"}
        cx={START + 16}
        cy={y}
        r={11}
      />
      <text
        className="bn"
        x={START + 16}
        y={y + 4}
        style={state === "open" ? undefined : { fill: "var(--dd-ink)" }}
      >
        {n}
      </text>
    </g>
  );
}

type DoorState = "open" | "guarded" | "shut";

/**
 * Every way into Harbour from the internet, drawn like the journeys. As
 * found, one door passes a checkpoint and five go straight in; fixed, four
 * are shut at the edge and SSH goes through IAP.
 */
export function WaysIn() {
  const [state, setState] = useState<HarbourState>("found");
  const fixed = state === "fixed";
  const closed = new Set(fixed ? IDS : []);

  // Door 1 always passes Cloudflare; door 6 passes IAP once fixed.
  const doors: DoorState[] = fixed
    ? ["guarded", "shut", "shut", "shut", "shut", "guarded"]
    : ["guarded", "open", "open", "open", "open", "open"];
  const ways = doors.filter((d) => d !== "shut").length;
  const unguarded = doors.filter((d) => d === "open").length;

  const straight = (i: number, label: string, target = COL.x) => {
    const open = doors[i] === "open";
    return (
      <>
        <Door n={i + 1} y={MID[i]} state={doors[i]} />
        <Words x={START + 36} y={MID[i] - 9} fault={open}>
          {label}
        </Words>
        {open ? (
          <Wire d={`M${START + 27} ${MID[i]} H${target - 3}`} state="broken" />
        ) : (
          <>
            <Wire d={`M${START + 27} ${MID[i]} H${EDGE - 16}`} state="idle" />
            <Cross x={EDGE} y={MID[i]} />
          </>
        )}
      </>
    );
  };

  return (
    <div>
      <StateSwitch value={state} onChange={setState} />
      <p className="mt-4 flex items-baseline gap-3" aria-live="polite">
        <span
          key={ways}
          className="dd-head animate-fade-in text-ink text-[44px] leading-none"
        >
          {ways}
        </span>
        <span className="text-ink text-[17px] leading-[1.4]">
          ways in from the internet
          <span
            className={cn(
              "block text-[15px]",
              unguarded ? "text-fault" : "text-ink-muted",
            )}
          >
            {unguarded
              ? `${unguarded} of them pass no checkpoint`
              : "each one through a checkpoint"}
          </span>
        </span>
      </p>
      <ScrollX className="dd-fig mt-4">
        <svg
          viewBox={`0 0 640 ${HEIGHT}`}
          role="img"
          className="min-w-[560px] lg:min-w-0"
          aria-label={
            fixed
              ? "Fixed: two ways into Harbour. Shoppers through Cloudflare and Cloud Armor to the load balancer, engineers through IAP to the VMs. The load balancer's own address, the run.app URL, the database's address and the VM addresses are all shut."
              : "As found: six ways into Harbour. Only the website passes a checkpoint. The load balancer's own address, the run.app URL, the database's public IP, the VMs' external IPs on any port, and SSH on port 22 all go straight in."
          }
        >
          <WalkProvider
            value={{
              fixed,
              closed,
              failing: new Set(),
              order: new Map(),
            }}
          >
            <Zone
              x={EDGE}
              y={24}
              w={252}
              h={350}
              label="Run by Google"
              hue="plum"
            />
            <Zone
              x={EDGE}
              y={386}
              w={252}
              h={182}
              label="harbour-vpc"
              hue="teal"
            />

            <Plain
              x={16}
              y={ROW[0]}
              w={130}
              h={ROW[5] + 58 - ROW[0]}
              title="Internet"
              lines={["shoppers,", "scanners,", "bots, anyone"]}
            />

            {/* 1. The front door: Cloudflare, then the load balancer. */}
            <Door n={1} y={MID[0]} state="guarded" />
            <Wire d={`M${START + 27} ${MID[0]} H${GATE.x - 3}`} />
            <Plain
              x={GATE.x}
              y={ROW[0]}
              w={GATE.w}
              h={58}
              hue="amber"
              title="Cloudflare"
              lines={["CDN + WAF"]}
            />
            <Wire d={`M${GATE.x + GATE.w} ${MID[0]} H${COL.x - 3}`} />
            <Plain
              x={COL.x}
              y={ROW[0]}
              w={COL.w}
              h={ROW[1] + 58 - ROW[0]}
              hue="plum"
              broken={!fixed}
              title="Global external ALB"
              lines={[
                "+ Cloud Armor",
                fixed ? "Cloudflare only" : "any source",
              ]}
              tags={["D8"]}
            />
            {/* What the front door serves: both apps. */}
            <Wire d={`M490 ${ROW[1] + 58} V${ROW[2] - 3}`} />
            <Wire
              d={`M${COL.x + COL.w} ${MID[0] + 20} H604 V${MID[4]} H${COL.x + COL.w + 3}`}
            />

            {/* 2. The load balancer's own address, skipping Cloudflare. */}
            {straight(1, "the ALB’s own address")}

            {/* 3. The run.app URL, skipping the load balancer too. */}
            {straight(2, "the run.app URL")}
            <Plain
              x={COL.x}
              y={ROW[2]}
              w={COL.w}
              h={58}
              hue="plum"
              broken={!fixed}
              title="harbour-api"
              lines={[fixed ? "ingress: LB only" : "ingress: all"]}
              tags={["D6"]}
            />
            <Wire d={`M490 ${ROW[2] + 58} V${ROW[3] - 3}`} />

            {/* 4. The database's public address. */}
            {straight(3, "the database’s address")}
            <Plain
              x={COL.x}
              y={ROW[3]}
              w={COL.w}
              h={58}
              hue="plum"
              broken={!fixed}
              title="harbour-pg"
              lines={[fixed ? "private IP only" : "public IP"]}
              tags={["D5"]}
            />

            {/* 5. The VMs' own addresses, every port. */}
            {straight(4, "VM addresses, any port")}
            <Plain
              x={COL.x}
              y={ROW[4]}
              w={COL.w}
              h={58}
              hue="teal"
              broken={!fixed}
              title="legacy-api × 3"
              lines={[fixed ? "no external IPs" : "external IPs"]}
              tags={["D3b", "D1"]}
            />

            {/* 6. SSH: open to all as found, through IAP once fixed. */}
            {fixed ? (
              <>
                <Door n={6} y={MID[5]} state="guarded" />
                <Wire d={`M${START + 27} ${MID[5]} H${GATE.x - 3}`} />
                <Plain
                  x={GATE.x}
                  y={ROW[5]}
                  w={GATE.w}
                  h={58}
                  hue="amber"
                  title="IAP"
                  lines={["identity check"]}
                />
                <Wire d={`M${GATE.x + GATE.w} ${MID[5]} H${COL.x - 3}`} />
              </>
            ) : (
              straight(5, "SSH, port 22")
            )}
            <Plain
              x={COL.x}
              y={ROW[5]}
              w={COL.w}
              h={58}
              hue="teal"
              broken={!fixed}
              title="bastion + VMs"
              lines={[fixed ? "22 from IAP only" : "22 open to all"]}
              tags={["D2", "D3a", "D16"]}
            />
          </WalkProvider>
        </svg>
      </ScrollX>
    </div>
  );
}
