import { ScrollX } from "@/components/learn/scroll-x";

/** A red numbered dot: one of the problems GCP chapter 0 lists. */
function Bad({ n, x, y }: { n: number; x: number; y: number }) {
  return (
    <>
      <circle className="bad" cx={x} cy={y} r="8" />
      <text className="bn" x={x} y={y + 4}>
        {n}
      </text>
    </>
  );
}

const RULES: { name: string; ports: string; from: string; bad?: number }[] = [
  { name: "allow-ssh", ports: "tcp:22", from: "0.0.0.0/0", bad: 2 },
  { name: "allow-web", ports: "tcp:80,443,8080", from: "0.0.0.0/0", bad: 3 },
  { name: "allow-internal", ports: "all", from: "10.10.0.0/16", bad: 4 },
  { name: "allow-lb", ports: "tcp:8080", from: "LB ranges" },
];

/** A box with a title and up to two sub-lines, spaced like the course drawings. */
function Box({
  x,
  y,
  w,
  h,
  hue,
  title,
  lines = [],
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  hue?: string;
  title: string;
  lines?: string[];
}) {
  return (
    <>
      <rect
        className={hue ? `n ${hue}` : "n"}
        x={x}
        y={y}
        width={w}
        height={h}
        rx="2"
      />
      <text className="t" x={x + 16} y={y + 28}>
        {title}
      </text>
      {lines.map((l, i) => (
        <text key={l} className="s" x={x + 16} y={y + 50 + i * 21}>
          {l}
        </text>
      ))}
    </>
  );
}

/**
 * Kadé's Google Cloud project as the GCP course finds it, drawn in the
 * course vocabulary: real addresses, the firewall table, and the problems
 * chapter 0 numbers.
 */
function KadeAsFound() {
  return (
    <svg
      viewBox="0 0 660 560"
      role="img"
      className="min-w-[600px] lg:min-w-0"
      aria-label="Kadé’s Google Cloud project as found. Shoppers resolve api.kade.lk through Cloud DNS to the load balancer at 34.120.88.10, which ends TLS and sends HTTP on port 8080 to kade-api-1 and kade-api-2 in sn-app, 10.10.1.0/24. kade-api queries kade-db at 10.10.2.5 in sn-data. Problems, in red: the default network is still open; SSH, web and internal firewall rules are too open; kade-api cannot reach PayGate because it has no external IP and no NAT."
    >
      {/* Outside the VPC */}
      <Box
        x={16}
        y={16}
        w={180}
        h={66}
        title="Shoppers"
        lines={["app + website"]}
      />
      <Box
        x={230}
        y={16}
        w={190}
        h={66}
        hue="plum"
        title="Cloud DNS"
        lines={["api → 34.120.88.10"]}
      />
      <Box
        x={444}
        y={16}
        w={200}
        h={66}
        title="PayGate"
        lines={["only 34.87.200.7"]}
      />
      <Box
        x={16}
        y={124}
        w={180}
        h={90}
        hue="plum"
        title="Load balancer"
        lines={["34.120.88.10:443", "TLS ends here"]}
      />
      <text className="s" x="16" y="240">
        HTTP :8080 to both VMs
      </text>
      <Box
        x={16}
        y={282}
        w={180}
        h={66}
        title="You (home)"
        lines={["203.0.113.45"]}
      />
      <text className="s" x="16" y="374">
        SSH, temporary IP
      </text>

      <rect
        className="zone fault"
        x="16"
        y="410"
        width="180"
        height="134"
        rx="2"
      />
      <Bad n={1} x={178} y={428} />
      {[
        "default network",
        "auto mode",
        "ssh, rdp, icmp",
        "open to 0.0.0.0/0",
      ].map((l, i) => (
        <text key={l} className="s" x="32" y={436 + i * 22}>
          {l}
        </text>
      ))}

      {/* kade-vpc */}
      <rect
        className="zone teal"
        x="230"
        y="116"
        width="414"
        height="428"
        rx="2"
      />
      <text className="s" x="246" y="138">
        kade-vpc · 10.10.0.0/16
      </text>
      <rect className="zone" x="244" y="152" width="386" height="108" rx="2" />
      <text className="s" x="258" y="172">
        sn-app · 10.10.1.0/24
      </text>
      <Box
        x={256}
        y={184}
        w={168}
        h={62}
        hue="teal"
        title="kade-api-1"
        lines={["10.10.1.10:8080"]}
      />
      <Box
        x={432}
        y={184}
        w={186}
        h={62}
        hue="teal"
        title="kade-api-2"
        lines={["10.10.1.11:8080"]}
      />
      <rect className="zone" x="244" y="276" width="386" height="96" rx="2" />
      <text className="s" x="258" y="296">
        sn-data · 10.10.2.0/24
      </text>
      <rect
        className="n green"
        x="256"
        y="306"
        width="362"
        height="54"
        rx="2"
      />
      <text className="t" x="272" y="329">
        kade-db (PostgreSQL)
      </text>
      <text className="s" x="272" y="349">
        10.10.2.5:5432 · backups by hand
      </text>

      <text className="s" x="246" y="404">
        firewall rules · priority 1000
      </text>
      {["name", "ports", "from"].map((h, i) => (
        <text
          key={h}
          className="f"
          x={[262, 386, 528][i]}
          y="428"
          style={{ fontSize: "12.5px" }}
        >
          {h}
        </text>
      ))}
      {RULES.map((r, i) => {
        const y = 454 + i * 24;
        return (
          <g key={r.name}>
            {r.bad ? (
              <Bad n={r.bad} x={248} y={y - 5} />
            ) : (
              <circle className="ok" cx="248" cy={y - 5} r="4" />
            )}
            <text className="t" x="262" y={y}>
              {r.name}
            </text>
            <text className="s" x="386" y={y}>
              {r.ports}
            </text>
            <text className="s" x="528" y={y}>
              {r.from}
            </text>
          </g>
        );
      })}

      {/* Wires */}
      <path className="w dash" d="M196 49 H227" markerEnd="url(#dd-ah-muted)" />
      <path
        className="w teal dd-hop"
        pathLength={1}
        d="M106 82 V121"
        markerEnd="url(#dd-ah-teal)"
        style={{ animationDelay: "300ms" }}
      />
      <path
        className="w plum dd-hop"
        pathLength={1}
        d="M196 200 H253"
        markerEnd="url(#dd-ah-plum)"
        style={{ animationDelay: "560ms" }}
      />
      <path
        className="w green dd-hop"
        pathLength={1}
        d="M525 246 V303"
        markerEnd="url(#dd-ah-green)"
        style={{ animationDelay: "820ms" }}
      />
      <path
        className="w fault dash dd-hop-fault"
        d="M196 315 H214 V230 H253"
        markerEnd="url(#dd-ah-fault)"
        style={{ animationDelay: "1080ms" }}
      />
      <g className="dd-hop-fault" style={{ animationDelay: "1300ms" }}>
        <path
          className="w fault dash"
          d="M525 184 V85"
          markerEnd="url(#dd-ah-fault)"
        />
        <text className="x" x="519" y="108">
          ✕
        </text>
        <Bad n={5} x={548} y={100} />
        <text className="s" x="562" y="104">
          no NAT
        </text>
      </g>
    </svg>
  );
}

/** The hero's drawing: no frame, so it sits on the page like a plate. */
export function RequestDrawing({ className }: { className?: string }) {
  return (
    <figure className={className}>
      <ScrollX className="dd-fig">
        <KadeAsFound />
      </ScrollX>
    </figure>
  );
}
