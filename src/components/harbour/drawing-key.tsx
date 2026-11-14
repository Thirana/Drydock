import { Swatch } from "@/components/learn/swatch";
import { cn } from "@/lib/utils";

/** The case study drawings' key: the GCP course's hues, then the red this case study adds. */
const KEY = [
  { hue: "teal", label: "Your VPC" },
  { hue: "plum", label: "Run by Google" },
  { hue: "amber", label: "Firewall and access rules" },
  { hue: "green", label: "Allowed traffic" },
  { hue: "fault", label: "Where it breaks" },
] as const;

export function DrawingKey({ className }: { className?: string }) {
  return (
    <ul
      className={cn(
        "text-ink-muted flex flex-wrap gap-x-5 gap-y-1.5 text-[14px]",
        className,
      )}
    >
      {KEY.map(({ hue, label }) => (
        <li key={hue} className="inline-flex items-center gap-2">
          <Swatch hue={hue} />
          {label}
        </li>
      ))}
    </ul>
  );
}
