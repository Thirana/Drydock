import { Tag } from "@/components/site/landing/harbour-drawing";
import { BoxText } from "@/components/architecture/svg";
import { textWidth } from "@/lib/architecture/text-fit";
import type { AddressPlan as Plan, PlanSubnet } from "@/lib/architecture/types";
import { DrawingKey } from "./drawing-key";

const WIDTH = 720;
/** One /24 is a square; a /16 is 16 rows of 16, so each row is a /20. */
const SQUARE = 15;
const STEP = 18;
const GRID = 16 * STEP - (STEP - SQUARE);
const GRID_Y = 60;
/** Where a row's words start, clear of the grid and the bracket beside it. */
const NOTE_X = GRID + 24;
const OTHERS_Y = GRID_Y + GRID + 44;
const BOX_H = 80;
const BOX_GAP = 12;
const HEIGHT = OTHERS_Y + 16 + BOX_H + 2;

/** The /24 squares a subnet covers, as indexes 0-255 into its /16. */
function squaresOf(cidr: string) {
  const [ip, prefix] = cidr.split("/");
  const third = Number(ip.split(".")[2]);
  return { start: third, count: 2 ** (24 - Number(prefix)) };
}

const rowCentre = (row: number) => GRID_Y + row * STEP + SQUARE / 2;

/** The longest run of rows with nothing in them: the room left to grow into. */
function freeRun(used: Set<number>) {
  let best = { from: 0, to: -1 };
  let from = -1;
  for (let row = 0; row <= 16; row++) {
    if (row < 16 && !used.has(row)) {
      if (from < 0) from = row;
    } else if (from >= 0) {
      if (row - 1 - from > best.to - best.from) best = { from, to: row - 1 };
      from = -1;
    }
  }
  return best;
}

/**
 * The IP plan drawn to scale: the region's /16 as 256 squares, one per /24,
 * its subnets filled in and named beside their rows, and the plan's other
 * ranges as boxes beneath.
 */
export function AddressPlan({ plan }: { plan: Plan }) {
  const owner = new Map<number, PlanSubnet>();
  for (const subnet of plan.region.subnets) {
    const { start, count } = squaresOf(subnet.cidr);
    for (let i = start; i < start + count; i++) owner.set(i, subnet);
  }

  const rows = new Map<number, PlanSubnet[]>();
  for (const subnet of plan.region.subnets) {
    const row = squaresOf(subnet.cidr).start >> 4;
    rows.set(row, [...(rows.get(row) ?? []), subnet]);
  }
  const free = freeRun(new Set(rows.keys()));

  const boxW =
    (WIDTH - BOX_GAP * (plan.others.length - 1)) / plan.others.length;

  return (
    <figure data-pagefind-ignore className="not-prose my-10 max-w-[760px]">
      <div className="dd-fig border-rule bg-ground overflow-x-auto rounded-[2px] border p-4 sm:p-5">
        <svg
          className="block h-auto w-full min-w-[640px]"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`${plan.region.name}, ${plan.region.cidr}, drawn one /24 per square, then the plan's other ranges`}
        >
          <text className="t" x={0} y={18}>
            {plan.region.name}
          </text>
          <text className="s" x={0} y={40}>
            {plan.region.cidr} · a square is a /24, a row is a /20
          </text>

          {Array.from({ length: 256 }, (_, i) => {
            const subnet = owner.get(i);
            return (
              <rect
                key={i}
                className={
                  !subnet
                    ? "blk free"
                    : subnet.missing
                      ? "blk gone"
                      : "blk used"
                }
                x={(i % 16) * STEP}
                y={GRID_Y + (i >> 4) * STEP}
                width={SQUARE}
                height={SQUARE}
                rx={1.5}
              />
            );
          })}

          {[...rows].map(([row, subnets]) => {
            const words = subnets.map((s) => `${s.name} ${s.cidr}`).join(" · ");
            const missing = subnets.some((s) => s.missing);
            const text = missing ? `${words} · not created` : words;
            const defects = subnets.flatMap((s) => s.defects ?? []);
            const y = rowCentre(row) + 4.5;
            return (
              <g key={row}>
                <text className={missing ? "s flt" : "s"} x={NOTE_X} y={y}>
                  {text}
                </text>
                {defects.length > 0 && (
                  <Tag
                    x={NOTE_X + textWidth(text, 13, "mono") + 40}
                    y={y}
                    ids={defects}
                    closed={new Set()}
                  />
                )}
              </g>
            );
          })}

          {free.to - free.from >= 2 && (
            <g>
              <path
                className="w"
                d={`M${GRID + 6} ${GRID_Y + free.from * STEP} H${GRID + 12} V${GRID_Y + free.to * STEP + SQUARE} H${GRID + 6}`}
              />
              <text
                className="l"
                x={NOTE_X}
                y={(rowCentre(free.from) + rowCentre(free.to)) / 2 - 6}
              >
                {free.to - free.from + 1} empty /20s
              </text>
              <text
                className="l"
                x={NOTE_X}
                y={(rowCentre(free.from) + rowCentre(free.to)) / 2 + 14}
              >
                room for the next subnet, no renumbering
              </text>
            </g>
          )}

          <text className="t" x={0} y={OTHERS_Y}>
            The other ranges - none overlap
          </text>
          {plan.others.map((range, i) => {
            const x = i * (boxW + BOX_GAP);
            return (
              <g key={range.cidr}>
                <rect
                  className={range.hue ? `n ${range.hue}` : "n"}
                  x={x}
                  y={OTHERS_Y + 16}
                  width={boxW}
                  height={BOX_H}
                  rx={2}
                />
                <BoxText
                  x={x}
                  y={OTHERS_Y + 16}
                  w={boxW}
                  h={BOX_H}
                  title={range.cidr}
                  sub={range.label}
                />
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-3 space-y-2">
        <DrawingKey items={["teal", "plum", "fault"]} />
        <p className="text-ink-muted max-w-[72ch] text-[15px] leading-[1.55] text-pretty">
          Empty squares are free. A /20 gives 4,091 usable addresses, not 4,094:
          GCP keeps four in every subnet - network, gateway, second-to-last and
          broadcast.
        </p>
        <p className="text-ink-muted text-[14px] md:hidden">
          Wide by design - scroll it sideways.
        </p>
      </figcaption>
    </figure>
  );
}
