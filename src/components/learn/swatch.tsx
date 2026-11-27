import type { Hue } from "@/lib/content/types";
import { cn } from "@/lib/utils";

const FILL: Record<Hue | "ink" | "fault" | "ghost", string> = {
  plum: "border-plum bg-plum-soft",
  teal: "border-teal bg-teal-soft",
  green: "border-green bg-green-soft",
  amber: "border-amber bg-amber-soft",
  ink: "border-ink-faint bg-ground",
  fault: "border-fault bg-fault-soft",
  ghost: "border-rule-strong border-dashed",
};

/** A key square: the box style a hue gives in a drawing. */
export function Swatch({
  hue,
  className,
}: {
  hue: Hue | "ink" | "fault" | "ghost";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-3 shrink-0 rounded-[2px] border-[1.25px] align-[-0.05em]",
        FILL[hue],
        className,
      )}
    />
  );
}
