import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * A choice you can press: outlined like a key, filled in ink once chosen.
 * Square, never a pill, so it reads as a control and not as a tag.
 */
export function ToggleChip({
  active,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-[2px] border px-3 text-[15px] whitespace-nowrap transition-colors duration-150",
        active
          ? "border-ink bg-ink text-ground font-semibold"
          : "border-rule-strong text-ink hover:border-ink hover:bg-sunk",
        className,
      )}
      {...props}
    />
  );
}

interface SegmentedControlProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** A switch: one outlined track, the chosen segment filled in ink. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "border-rule-strong no-scrollbar inline-flex max-w-full items-stretch gap-[3px] overflow-x-auto rounded-[3px] border p-[3px]",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-8 cursor-pointer rounded-[2px] px-3 text-[15px] whitespace-nowrap transition-colors duration-150",
              active
                ? "bg-ink text-ground font-semibold"
                : "text-ink-body hover:bg-sunk hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
