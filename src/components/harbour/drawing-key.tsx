import { Swatch } from "@/components/learn/swatch";
import { cn } from "@/lib/utils";

/** The case study drawings' key: the GCP course's hues, then what this case study adds. */
const KEY = {
  teal: "Your VPC",
  plum: "Run by Google",
  amber: "Firewall and access rules",
  green: "Allowed traffic",
  fault: "Where it breaks",
  ghost: "Not built yet",
} as const;

export type KeyItem = keyof typeof KEY;

const DEFAULT: KeyItem[] = ["teal", "plum", "amber", "green", "fault"];

export function DrawingKey({
  items = DEFAULT,
  className,
}: {
  /** The entries a drawing uses, in key order. */
  items?: KeyItem[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "text-ink-muted flex flex-wrap gap-x-5 gap-y-1.5 text-[14px]",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item} className="inline-flex items-center gap-2">
          <Swatch hue={item} />
          {KEY[item]}
        </li>
      ))}
    </ul>
  );
}
