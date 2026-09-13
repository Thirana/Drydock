import type { TrackStats } from "@/lib/content/stats";
import { cn } from "@/lib/utils";

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
    [stats.phases, "phases"],
    [stats.journeys, "journeys"],
    [stats.components, "components"],
  ] as const;

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {items.map(([value, label]) => (
        <li
          key={label}
          className={cn(
            "border-gl-border bg-gl-surface-2 inline-flex items-center gap-2 rounded-full border",
            size === "lg" ? "px-4 py-1.5" : "px-3 py-1",
          )}
        >
          <span
            className={cn(
              "text-gl-primary font-mono font-bold tabular-nums",
              size === "lg" ? "text-[15px]" : "text-[13px]",
            )}
          >
            {value}
          </span>
          <span className="text-gl-text-muted text-[12px]">{label}</span>
        </li>
      ))}
    </ul>
  );
}
