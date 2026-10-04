import type { TrackStats } from "@/lib/content/stats";
import { cn } from "@/lib/utils";

/** A lab's counts as one ruled line of figures, not a row of badges. */
export function StatPills({
  stats,
  size = "sm",
  className,
}: {
  stats: TrackStats;
  size?: "sm" | "lg";
  className?: string;
}) {
  const items = [
    [stats.defects, "defects"],
    [stats.phases, "remediation phases"],
    [stats.journeys, "journeys"],
    [stats.components, "components"],
  ] as const;

  return (
    <ul
      className={cn(
        "divide-rule flex flex-wrap items-baseline gap-y-2 divide-x",
        className,
      )}
    >
      {items.map(([value, label]) => (
        <li
          key={label}
          className="inline-flex items-baseline gap-2 px-4 first:pl-0 last:pr-0"
        >
          <span
            className={cn(
              "text-ink font-mono font-bold tabular-nums",
              size === "lg" ? "text-[22px]" : "text-[17px]",
            )}
          >
            {value}
          </span>
          <span className="text-ink-muted text-[14px]">{label}</span>
        </li>
      ))}
    </ul>
  );
}
