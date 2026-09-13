import type { Fact } from "@/lib/architecture/types";
import { cn } from "@/lib/utils";

export function FactList({
  facts,
  compact = false,
}: {
  facts: Fact[];
  compact?: boolean;
}) {
  if (!facts.length) return null;
  return (
    <dl className="divide-gl-border divide-y">
      {facts.map((fact, i) => (
        <div
          key={i}
          className={cn(
            "grid gap-1 py-2.5",
            compact
              ? "sm:grid-cols-[140px_1fr] sm:gap-3"
              : "sm:grid-cols-[180px_1fr] sm:gap-4",
          )}
        >
          <dt
            className={cn(
              "text-gl-text-muted font-medium",
              compact ? "text-[12px]" : "text-[12.5px]",
            )}
          >
            {fact.label}
          </dt>
          <dd
            className={cn(
              "text-gl-text leading-[1.55]",
              compact ? "text-[13px]" : "text-[13.5px]",
            )}
          >
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
