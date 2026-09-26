import type { Severity } from "@/lib/architecture/types";
import { cn } from "@/lib/utils";

/** The annotator's marks, borrowed from game notation. Always shown with the word. */
export const SEVERITY_MARK: Record<Severity, string> = {
  critical: "??",
  high: "?",
  medium: "?!",
  low: "·",
};

const TONE: Record<Severity, string> = {
  critical: "text-fault",
  high: "text-fault",
  medium: "text-ink",
  low: "text-ink-muted",
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
        "inline-flex items-baseline gap-1.5 text-[14px] whitespace-nowrap",
        TONE[severity],
        className,
      )}
    >
      <span aria-hidden="true" className="w-[2ch] font-mono font-bold">
        {SEVERITY_MARK[severity]}
      </span>
      {severity}
    </span>
  );
}
