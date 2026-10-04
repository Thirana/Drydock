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
    <dl className="divide-rule divide-y">
      {facts.map((fact, i) => (
        <div
          key={i}
          className={cn(
            "grid gap-0.5 py-2.5",
            compact
              ? "sm:grid-cols-[140px_1fr] sm:gap-4"
              : "sm:grid-cols-[180px_1fr] sm:gap-5",
          )}
        >
          <dt className="text-ink-muted text-[15px]">{fact.label}</dt>
          <dd className="text-ink text-[15.5px] leading-[1.5]">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
