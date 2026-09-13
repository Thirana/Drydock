import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Pill toggle for overlays and pickers. */
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
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] whitespace-nowrap transition-all duration-150",
        "focus-visible:ring-gl-primary/30 focus-visible:ring-2 focus-visible:outline-none",
        active
          ? "border-gl-primary/30 bg-gl-primary-soft text-gl-primary font-semibold"
          : "border-gl-border bg-gl-surface text-gl-text-muted hover:border-gl-border-input hover:bg-gl-surface-2 hover:text-gl-text font-medium",
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
        "border-gl-border bg-gl-bg-subtle no-scrollbar inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-[9px] border p-1",
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
              "rounded-[7px] px-3 py-[7px] text-[12.5px] whitespace-nowrap transition-colors duration-[120ms]",
              active
                ? "bg-gl-primary text-gl-primary-ink font-semibold"
                : "text-gl-text-muted hover:text-gl-text font-medium",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
