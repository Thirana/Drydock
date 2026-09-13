import type { Severity } from "@/lib/architecture/types";
import { cn } from "@/lib/utils";

const STYLES: Record<Severity, string> = {
  critical: "bg-gl-danger text-gl-danger-ink",
  high: "bg-gl-danger-soft text-gl-danger",
  medium: "bg-gl-warning-soft text-gl-warning",
  low: "border border-gl-border bg-gl-surface-2 text-gl-text-muted",
};

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  return (
    <span
      className={cn(
        // Right padding gives back the trailing letter-spacing so the word sits centred.
        "inline-flex items-center rounded-full pl-2.5 pr-[calc(0.625rem-0.08em)] py-1 text-[10.5px] leading-none font-bold tracking-[0.08em] whitespace-nowrap uppercase",
        STYLES[severity],
        className,
      )}
    >
      {severity}
    </span>
  );
}
